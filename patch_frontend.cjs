const fs = require('fs');

const tsPath = 'src/services/riffusionService.ts';
let code = fs.readFileSync(tsPath, 'utf8');

code = code.replace(
`    // Skip local proxy for Flow Music/Riffusion domains — these block server-side requests with 403.
    // We rely on client-side public proxies (corsproxy.io, etc.) for these domains.
    const isFlowLike = url.includes('flowmusic.app') || url.includes('producer.ai') || url.includes('riffusion.com');

    const attempts: ProxyAttempt[] = CORS_PROXIES
        .filter(proxy => !(proxy === '/proxy/' && isFlowLike))
        .map(proxy => {
            const isAllOrigins = proxy.includes('allorigins.win');
            const targetUrl = isAllOrigins ? encodeURIComponent(url) : url;

            return {
                url: \`\${proxy}\${targetUrl}\`,
                headers: undefined,
            };
        });`,
`    const isFlowLike = url.includes('flowmusic.app') || url.includes('producer.ai') || url.includes('riffusion.com');

    // Use our secure Cloudflare Worker proxy for Flow/Riffusion instead of public CORS proxies
    const WORKER_URL = import.meta.env.VITE_SUNO_WORKER_URL || 'https://gemini-proxy.spupuz.workers.dev';

    // In production, this token shouldn't be here, but to avoid regressions we will pass it
    // to the backend proxy if it exists. Note: A better approach is to configure the proxy
    // to not need client-provided auth for these domains.
    const PROXY_AUTH_TOKEN = import.meta.env.VITE_PROXY_AUTH_TOKEN;

    const attempts: ProxyAttempt[] = [];

    if (isFlowLike) {
         const headers: Record<string, string> = {};
         if (PROXY_AUTH_TOKEN) {
             headers['X-Proxy-Auth'] = PROXY_AUTH_TOKEN;
         }
         attempts.push({
             url: \`\${WORKER_URL}/proxy/\${encodeURIComponent(url)}\`,
             headers: Object.keys(headers).length > 0 ? headers : undefined,
         });
    }

    const fallbackAttempts: ProxyAttempt[] = CORS_PROXIES
        .filter(proxy => proxy !== '/proxy/') // We removed the insecure local proxy
        .map(proxy => {
            const isAllOrigins = proxy.includes('allorigins.win');
            const targetUrl = isAllOrigins ? encodeURIComponent(url) : url;

            return {
                url: \`\${proxy}\${targetUrl}\`,
                headers: undefined,
            };
        });

    attempts.push(...fallbackAttempts);`
);

fs.writeFileSync(tsPath, code);
