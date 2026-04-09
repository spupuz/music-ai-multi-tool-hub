/**
 * Gemini & Telemetry Proxy Worker
 * - POST /                → Proxy Gemini API (GEMINI_API_KEY secret)
 * - POST /verify-password → Verify committee password (COMMITTEE_PASSWORD secret)
 * - POST /telemetry       → Register a visit (uses STATS_KV)
 * - GET /stats            → Get statistics (uses STATS_KV)
 */

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const ALLOWED_ORIGINS = [
    'https://music-ai-multi-tool-hub.pages.dev',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
];

function corsHeaders(origin) {
    const isAllowed = ALLOWED_ORIGINS.includes(origin) || (origin && origin.startsWith('http://localhost:'));
    const allowed = isAllowed ? origin : ALLOWED_ORIGINS[0];
    return {
        'Access-Control-Allow-Origin': allowed,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
}

async function hash(text) {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function incrementKV(kv, key) {
    const current = await kv.get(key);
    const val = parseInt(current || '0') + 1;
    await kv.put(key, val.toString());
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

        // ── GET /stats ─────────────────────────────────────────────────────────────
        if (request.method === 'GET' && url.pathname === '/stats') {
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
            if (!env.STATS_KV) return new Response('KV Missing', { status: 500, headers: cors });
            
            const ip = request.headers.get('cf-connecting-ip') || 'unknown';
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
            const { password } = body;
            if (!env.COMMITTEE_PASSWORD) {
                return new Response(JSON.stringify({ valid: false, error: 'COMMITTEE_PASSWORD not configured' }),
                    { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
            }
            const valid = typeof password === 'string' && password === env.COMMITTEE_PASSWORD;
            return new Response(JSON.stringify({ valid }),
                { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
        }

        // ── Gemini proxy (default / root) ──────────────────────────────────────────
        if (!env.GEMINI_API_KEY) {
            return new Response('GEMINI_API_KEY missing', { status: 500, headers: cors });
        }

        const { model, contents, config } = body;
        if (!model || !contents) {
            return new Response('Missing model/contents', { status: 400, headers: cors });
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
