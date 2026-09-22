/**
 * Gemini & Telemetry Proxy Worker
 * - POST /                → Proxy Gemini API (GEMINI_API_KEY secret)
 * - POST /verify-password → Verify committee password (COMMITTEE_PASSWORD secret)
 * - POST /telemetry       → Register a visit (uses STATS_KV)
 * - GET /stats            → Get statistics (uses STATS_KV)
 * - GET /suno/*           → Server-side proxy for Suno Studio API (no browser CORS)
 * - GET /suno-web/*       → Server-side proxy for suno.com pages (short-URL resolution)
 * - GET /proxy/*          → Generic CORS proxy for specific domains (requires X-Proxy-Auth)
 */

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const SUNO_API_BASE = 'https://studio-api.prod.suno.com';
const SUNO_WEB_BASE = 'https://suno.com';

// Per-endpoint cache TTLs (seconds). Longer TTLs reduce load on Suno and speed
// up repeat visits. Clip data is immutable after creation, so it caches longest.
const SUNO_CACHE_TTL = {
    clip: 24 * 60 * 60,    // /api/clip/… – never changes once created
    profile: 10 * 60,      // /api/profiles/… – updates as artists publish
    playlist: 5 * 60,      // /api/playlist/… – updates as tracks are added/removed
    shortLink: 60 * 60,    // suno.com/s/… – redirects are effectively permanent
    default: 10 * 60,
};

function cacheTtlForPath(path) {
    if (path.includes('/clip/')) return SUNO_CACHE_TTL.clip;
    if (path.includes('/profiles/')) return SUNO_CACHE_TTL.profile;
    if (path.includes('/playlist/')) return SUNO_CACHE_TTL.playlist;
    if (path.includes('/s/')) return SUNO_CACHE_TTL.shortLink;
    return SUNO_CACHE_TTL.default;
}

const ALLOWED_ORIGINS = [
    'https://music-ai-multi-tool-hub.pages.dev',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
];

function corsHeaders(origin) {
    let isAllowed = ALLOWED_ORIGINS.includes(origin);
    if (!isAllowed && origin) {
        try {
            const parsedOrigin = new URL(origin);
            if (parsedOrigin.protocol === 'http:' && (parsedOrigin.hostname === 'localhost' || parsedOrigin.hostname === '127.0.0.1')) {
                isAllowed = true;
            }
        } catch (e) {
            // Ignore invalid URLs
        }
    }
    const allowed = isAllowed ? origin : ALLOWED_ORIGINS[0];
    return {
        'Access-Control-Allow-Origin': allowed,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
}

/**
 * Proxies a Suno request server-side so the browser never hits Suno's CORS
 * restrictions. Only fixed base hosts are allowed (no open/SSRF proxy).
 * Responses are cached at the edge with a per-endpoint TTL.
 */
async function proxySunoRequest(request, url, baseUrl, prefixMatched) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    // Normalize path to prevent path traversal and ensure it starts with /
    let path = url.pathname.substring(prefixMatched.length);
    if (!path.startsWith('/')) {
        path = '/' + path;
    }

    let targetUrlObj;
    try {
        targetUrlObj = new URL(path + url.search, baseUrl);
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid URL format' }), { status: 400, headers: cors });
    }

    // SSRF Protection: strictly enforce that the final URL's hostname matches the baseUrl's hostname
    const expectedHost = new URL(baseUrl).hostname;
    if (targetUrlObj.hostname !== expectedHost) {
        return new Response(JSON.stringify({ error: 'SSRF Attempt Blocked' }), { status: 403, headers: cors });
    }

    const targetUrlString = targetUrlObj.toString();
    const ttlSeconds = cacheTtlForPath(path);

    try {
        const cached = await caches.default.match(targetUrlString);
        if (cached) {
            const body = await cached.text();
            return new Response(body, {
                status: 200,
                headers: { ...cors, 'Content-Type': 'application/json', 'X-Suno-Proxy': 'cache' },
            });
        }
    } catch (e) {
        // Cache lookup failure is non-fatal; continue to origin.
    }

    try {
        const sunoRes = await fetch(targetUrlString, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; MusicAIToolHub/1.0)',
                'Referer': 'https://suno.com/',
            },
        });

        const body = await sunoRes.text();
        const headers = {
            ...cors,
            'Content-Type': 'application/json',
            'X-Suno-Proxy': 'origin',
        };

        if (sunoRes.ok && ttlSeconds > 0) {
            try {
                await caches.default.put(targetUrlString, new Response(body, {
                    status: 200,
                    headers: { 'Cache-Control': `public, max-age=${ttlSeconds}` },
                }));
            } catch (e) {
                // Cache write failure is non-fatal.
            }
        }

        return new Response(body, { status: sunoRes.status, headers });
    } catch (err) {
        return new Response(
            JSON.stringify({ error: `Suno proxy error: ${err.message}` }),
            { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } }
        );
    }
}

async function hash(text) {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function incrementKV(kv, key) {
    const val = await kv.get(key);
    const current = parseInt(val || '0', 10);
    await kv.put(key, (current + 1).toString());
}

/**
 * Constant-time string comparison to mitigate timing attacks.
 */
function timingSafeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

/**
 * Handles sliding window rate limiting state
 */
async function getRateLimitState(kv, key, windowMs) {
    const rawVal = await kv.get(key);
    const now = Date.now();
    let state = { attempts: 0, windowStart: now };

    if (rawVal) {
        try {
            const parsed = JSON.parse(rawVal);
            if (typeof parsed.attempts === 'number' && typeof parsed.windowStart === 'number') {
                if (now - parsed.windowStart < windowMs) {
                    state = parsed;
                }
            } else if (!isNaN(parseInt(rawVal))) {
                // Legacy number format
                state.attempts = parseInt(rawVal, 10);
            }
        } catch (e) {
            // Not JSON, probably legacy number format
            if (!isNaN(parseInt(rawVal))) {
                state.attempts = parseInt(rawVal, 10);
            }
        }
    }

    return state;
}

export default {
    async fetch(request, env) {
        const origin = request.headers.get('Origin') || '';
        const cors = corsHeaders(origin);
        const url = new URL(request.url);

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: cors });
        }


        // ── GET /proxy/* (Generic CORS proxy) ────────────────────────────────────
        if (request.method === 'GET' && url.pathname.startsWith('/proxy/')) {
            const ip = request.headers.get('cf-connecting-ip') || 'unknown';
            const rateLimitKeyProxy = `ratelimit:proxy:${ip}`;

            if (env.STATS_KV) {
                const windowDuration = 60; // seconds
                const windowMs = windowDuration * 1000;
                let state = await getRateLimitState(env.STATS_KV, rateLimitKeyProxy, windowMs);

                if (state.attempts >= 60) {
                    return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }),
                        { status: 429, headers: { ...cors, 'Content-Type': 'application/json', 'Retry-After': '60' } });
                }

                state.attempts++;
                const ttl = Math.max(60, windowDuration);
                await env.STATS_KV.put(rateLimitKeyProxy, JSON.stringify(state), { expirationTtl: ttl });
            }

            // Verify Proxy Auth Token
            const proxyAuth = request.headers.get('X-Proxy-Auth');
            if (!env.PROXY_AUTH_TOKEN) {
                return new Response(JSON.stringify({ error: 'PROXY_AUTH_TOKEN not configured' }),
                    { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
            }
            if (!proxyAuth || !timingSafeEqual(proxyAuth, env.PROXY_AUTH_TOKEN)) {
                 return new Response(JSON.stringify({ error: 'Unauthorized proxy access' }), { status: 401, headers: cors });
            }

            let targetUrlStr = url.pathname.substring('/proxy/'.length) + url.search;
            if (!targetUrlStr) {
                return new Response(JSON.stringify({ error: 'Target URL is missing' }), { status: 400, headers: cors });
            }

            try {
               targetUrlStr = decodeURIComponent(targetUrlStr);
            } catch (e) {
               // Ignore
            }

            let targetUrlObj;
            try {
                targetUrlObj = new URL(targetUrlStr);
            } catch (e) {
                return new Response(JSON.stringify({ error: 'Invalid Target URL' }), { status: 400, headers: cors });
            }

            // SSRF Protection: only allow specific flow/riffusion domains
            const allowedHosts = ['flowmusic.app', 'www.flowmusic.app', 'classic.riffusion.com', 'riffusion.com', 'www.riffusion.com', 'producer.ai'];
            if (!allowedHosts.includes(targetUrlObj.hostname)) {
                return new Response(JSON.stringify({ error: 'Host not allowed for proxying' }), { status: 403, headers: cors });
            }

            try {
                const proxyRes = await fetch(targetUrlObj.toString(), {
                    method: 'GET',
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml,application/xml',
                        'User-Agent': 'Mozilla/5.0 (compatible; MusicAIToolHub/1.0)',
                    },
                });

                const body = await proxyRes.text();
                const contentType = proxyRes.headers.get('content-type') || 'text/html';

                return new Response(body, {
                    status: proxyRes.status,
                    headers: {
                        ...cors,
                        'Content-Type': contentType,
                    }
                });
            } catch (err) {
                 return new Response(
                    JSON.stringify({ error: `Proxy fetch error: ${err.message}` }),
                    { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } }
                );
            }
        }

        // ── GET /suno/* (Suno Studio API proxy) ──────────────────────────────────
        if (request.method === 'GET' && url.pathname.startsWith('/suno')) {
            const ip = request.headers.get('cf-connecting-ip') || 'unknown';
            const rateLimitKeySuno = `ratelimit:suno:${ip}`;

            if (env.STATS_KV) {
                const windowDuration = 60; // seconds
                const windowMs = windowDuration * 1000;
                let state = await getRateLimitState(env.STATS_KV, rateLimitKeySuno, windowMs);

                if (state.attempts >= 60) {
                    return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }),
                        { status: 429, headers: { ...cors, 'Content-Type': 'application/json', 'Retry-After': '60' } });
                }

                state.attempts++;
                // Cloudflare KV requires expirationTtl to be at least 60
                const ttl = Math.max(60, windowDuration);
                await env.STATS_KV.put(rateLimitKeySuno, JSON.stringify(state), { expirationTtl: ttl });
            }

            const isWeb = url.pathname === '/suno-web' || url.pathname.startsWith('/suno-web/');
            const isApi = url.pathname === '/suno' || url.pathname.startsWith('/suno/');
            if (isWeb) {
                return proxySunoRequest(request, url, SUNO_WEB_BASE, '/suno-web');
            }
            if (isApi) {
                return proxySunoRequest(request, url, SUNO_API_BASE, '/suno');
            }
            return new Response('Not Found', { status: 404, headers: cors });
        }

        // ── GET /stats ─────────────────────────────────────────────────────────────
        if (request.method === 'GET' && url.pathname === '/stats') {
            const ip = request.headers.get('cf-connecting-ip') || 'unknown';
            const rateLimitKeyStats = `ratelimit:stats:${ip}`;

            if (env.STATS_KV) {
                const attempts = parseInt(await env.STATS_KV.get(rateLimitKeyStats) || '0', 10);
                if (attempts >= 30) {
                    return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }),
                        { status: 429, headers: { ...cors, 'Content-Type': 'application/json', 'Retry-After': '60' } });
                }
                await env.STATS_KV.put(rateLimitKeyStats, (attempts + 1).toString(), { expirationTtl: 60 });
            }

            if (!env.STATS_KV) {
                return new Response(JSON.stringify({ error: 'STATS_KV not bound' }), { status: 500, headers: cors });
            }
            const now = new Date();
            const timeline = [];
            
            // Get last 30 days
            for (let i = 29; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const pv = parseInt(await env.STATS_KV.get(`daily:pageviews:${dateStr}`) || '0');
                const uv = parseInt(await env.STATS_KV.get(`daily:uniques:${dateStr}`) || '0');
                timeline.push({ date: dateStr, pageviews: pv, uniques: uv });
            }
            
            const totalPV = await env.STATS_KV.get('total:pageviews') || '0';
            const totalUV = await env.STATS_KV.get('total:uniques') || '0';
            
            // Countries (limit to top or sensible list)
            const countryKeys = await env.STATS_KV.list({ prefix: 'country:' });
            const countries = {};
            for (const key of countryKeys.keys) {
                const cc = key.name.split(':')[1];
                countries[cc] = parseInt(await env.STATS_KV.get(key.name) || '0');
            }
            
            const liveCount = (await env.STATS_KV.list({ prefix: 'live:' })).keys.length;
            
            return new Response(JSON.stringify({
                total: { pageviews: parseInt(totalPV), uniques: parseInt(totalUV) },
                liveCount,
                timeline,
                countries
            }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
        }

        if (request.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405, headers: cors });
        }

        let body;
        try {
            body = await request.json();
        } catch {
            body = {};
        }

        // ── /telemetry endpoint ────────────────────────────────────────────────────
        if (url.pathname === '/telemetry') {
            const ip = request.headers.get('cf-connecting-ip') || 'unknown';
            const rateLimitKeyTelemetry = `ratelimit:telemetry:${ip}`;

            if (env.STATS_KV) {
                const attempts = parseInt(await env.STATS_KV.get(rateLimitKeyTelemetry) || '0', 10);
                if (attempts >= 120) {
                    return new Response(JSON.stringify({ error: 'Too many requests.' }),
                        { status: 429, headers: { ...cors, 'Content-Type': 'application/json', 'Retry-After': '60' } });
                }
                await env.STATS_KV.put(rateLimitKeyTelemetry, (attempts + 1).toString(), { expirationTtl: 60 });
            }

            if (!env.STATS_KV) return new Response('KV Missing', { status: 500, headers: cors });
            
            const country = request.headers.get('cf-ipcountry') || 'XX';
            const date = new Date().toISOString().split('T')[0];
            
            const salt = env.TELEMETRY_SALT || 'default-salt-123';
            const ipHash = await hash(ip + salt);
            
            await incrementKV(env.STATS_KV, 'total:pageviews');
            await incrementKV(env.STATS_KV, `daily:pageviews:${date}`);
            await incrementKV(env.STATS_KV, `country:${country}`);
            await env.STATS_KV.put(`live:${ipHash}`, '1', { expirationTtl: 300 }); // 5 minutes
            
            const totalSeenKey = `seen:total:${ipHash}`;
            const dailySeenKey = `seen:daily:${date}:${ipHash}`;
            
            const isTotalNew = !(await env.STATS_KV.get(totalSeenKey));
            const isDailyNew = !(await env.STATS_KV.get(dailySeenKey));
            
            if (isTotalNew) {
                await env.STATS_KV.put(totalSeenKey, '1');
                await incrementKV(env.STATS_KV, 'total:uniques');
            }
            if (isDailyNew) {
                await env.STATS_KV.put(dailySeenKey, '1', { expirationTtl: 172800 }); // 2 days
                await incrementKV(env.STATS_KV, `daily:uniques:${date}`);
            }
            
            return new Response(JSON.stringify({ success: true }), { status: 200, headers: cors });
        }

        // ── /verify-password endpoint ──────────────────────────────────────────────
        if (url.pathname === '/verify-password') {
            const ip = request.headers.get('cf-connecting-ip') || 'unknown';
            const rateLimitKey = `ratelimit:verify-password:${ip}`;
            let state = { attempts: 0, windowStart: Date.now() };
            const windowDuration = 300; // seconds

            if (env.STATS_KV) {
                state = await getRateLimitState(env.STATS_KV, rateLimitKey, windowDuration * 1000);
                if (state.attempts >= 5) {
                    return new Response(JSON.stringify({ valid: false, error: 'Too many attempts. Please try again later.' }),
                        { status: 429, headers: { ...cors, 'Content-Type': 'application/json', 'Retry-After': '300' } });
                }
            }

            const { password } = body;
            if (!env.COMMITTEE_PASSWORD) {
                return new Response(JSON.stringify({ valid: false, error: 'COMMITTEE_PASSWORD not configured' }),
                    { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
            }
            const valid = timingSafeEqual(password, env.COMMITTEE_PASSWORD);

            if (env.STATS_KV) {
                if (!valid) {
                    state.attempts++;
                    const ttl = Math.max(60, windowDuration);
                    await env.STATS_KV.put(rateLimitKey, JSON.stringify(state), { expirationTtl: ttl });
                } else if (state.attempts > 0) {
                    await env.STATS_KV.delete(rateLimitKey);
                }
            }

            return new Response(JSON.stringify({ valid }),
                { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
        }

        // ── Gemini proxy (default / root) ──────────────────────────────────────────
        const ip = request.headers.get('cf-connecting-ip') || 'unknown';
        const rateLimitKeyGemini = `ratelimit:gemini:${ip}`;

        if (env.STATS_KV) {
            const windowDuration = 60; // seconds
            let state = await getRateLimitState(env.STATS_KV, rateLimitKeyGemini, windowDuration * 1000);

            if (state.attempts >= 10) {
                return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }),
                    { status: 429, headers: { ...cors, 'Content-Type': 'application/json', 'Retry-After': '60' } });
            }

            state.attempts++;
            const ttl = Math.max(60, windowDuration);
            await env.STATS_KV.put(rateLimitKeyGemini, JSON.stringify(state), { expirationTtl: ttl });
        }

        if (!env.GEMINI_API_KEY) {
            return new Response('GEMINI_API_KEY missing', { status: 500, headers: cors });
        }

        const { model, contents, config } = body;
        if (!model || typeof model !== 'string' || !contents) {
            return new Response('Missing or invalid model/contents', { status: 400, headers: cors });
        }

        // Validate model name to prevent path traversal or URL injection
        if (!/^[a-zA-Z0-9.-]+$/.test(model)) {
            return new Response('Invalid model name format', { status: 400, headers: cors });
        }

        const geminiUrl = `${GEMINI_BASE}/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
        const geminiBody = {
            contents: [{ parts: [{ text: contents }] }],
            ...(config ? { generationConfig: config } : {}),
        };

        try {
            const geminiRes = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(geminiBody),
            });

            if (!geminiRes.ok) {
                return new Response(`Gemini error: ${geminiRes.status}`, { status: geminiRes.status, headers: cors });
            }

            const data = await geminiRes.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            return new Response(JSON.stringify({ text }),
                { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });

        } catch (err) {
            return new Response(`Worker error: ${err.message}`, { status: 500, headers: cors });
        }
    },
};
