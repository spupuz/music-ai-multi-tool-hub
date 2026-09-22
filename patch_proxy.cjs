const fs = require('fs');

const indexJsPath = 'gemini-worker/index.js';
let code = fs.readFileSync(indexJsPath, 'utf8');

// Update header
code = code.replace(
  ' * - GET /suno-web/*       → Server-side proxy for suno.com pages (short-URL resolution)',
  ' * - GET /suno-web/*       → Server-side proxy for suno.com pages (short-URL resolution)\n * - GET /proxy/*          → Generic CORS proxy for specific domains (requires X-Proxy-Auth)'
);

// Add the proxy implementation
const proxyBlock = `
        // ── GET /proxy/* (Generic CORS proxy) ────────────────────────────────────
        if (request.method === 'GET' && url.pathname.startsWith('/proxy/')) {
            const ip = request.headers.get('cf-connecting-ip') || 'unknown';
            const rateLimitKeyProxy = \`ratelimit:proxy:\${ip}\`;

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
                    JSON.stringify({ error: \`Proxy fetch error: \${err.message}\` }),
                    { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } }
                );
            }
        }
`;

code = code.replace(
    "// ── GET /suno/* (Suno Studio API proxy)",
    proxyBlock + "\n        // ── GET /suno/* (Suno Studio API proxy)"
);

fs.writeFileSync(indexJsPath, code);
