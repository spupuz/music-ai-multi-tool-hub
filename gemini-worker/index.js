/**
 * Gemini Proxy Worker
 * - POST /        → Proxy Gemini API (GEMINI_API_KEY secret)
 * - POST /verify-password → Verify committee password (COMMITTEE_PASSWORD secret)
 */

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const ALLOWED_ORIGINS = [
    'https://music-ai-multi-tool-hub.pages.dev',
    'http://localhost:3000',
];

function corsHeaders(origin) {
    const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Access-Control-Allow-Origin': allowed,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
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

        if (request.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405, headers: cors });
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return new Response('Invalid JSON body', { status: 400, headers: cors });
        }

        // ── /verify-password endpoint ──────────────────────────────────────────────
        if (url.pathname === '/verify-password') {
            const { password } = body;
            if (!env.COMMITTEE_PASSWORD) {
                return new Response(JSON.stringify({ valid: false, error: 'COMMITTEE_PASSWORD not configured on Worker' }),
                    { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
            }
            const valid = typeof password === 'string' && password === env.COMMITTEE_PASSWORD;
            return new Response(JSON.stringify({ valid }),
                { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
        }

        // ── Gemini proxy (default / root) ──────────────────────────────────────────
        if (!env.GEMINI_API_KEY) {
            return new Response('GEMINI_API_KEY secret not configured on the Worker',
                { status: 500, headers: cors });
        }

        const { model, contents, config } = body;
        if (!model || !contents) {
            return new Response('Missing required fields: model, contents', { status: 400, headers: cors });
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
                return new Response(`Gemini API error: ${geminiRes.status}`,
                    { status: geminiRes.status, headers: cors });
            }

            const data = await geminiRes.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            return new Response(JSON.stringify({ text }),
                { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });

        } catch (err) {
            return new Response(`Worker fetch error: ${err.message}`, { status: 500, headers: cors });
        }
    },
};
