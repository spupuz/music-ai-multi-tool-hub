## 2024-05-24 - [CRITICAL] Fix Server-Side Request Forgery in Suno Proxy
**Vulnerability:** The Cloudflare worker (`gemini-worker/index.js`) implemented a server-side proxy for the Suno API. It extracted the path via `url.pathname.replace(/^\/suno(-web)?/, '')` and constructed the target URL using basic string concatenation (`targetUrl = \`${baseUrl}${path}${url.search}\``). By passing a path like `/suno-web@attacker.com`, the resulting URL evaluated to `https://suno.com@attacker.com`, causing the fetch to hit `attacker.com` instead of the expected Suno backend.
**Learning:** Naive path extraction using string replacement followed by loose string concatenation in proxies fails to account for URI structure manipulation (e.g., abusing the authority section `@`).
**Prevention:** Always use the `URL` constructor to compose URLs safely (`new URL(path + search, baseUrl)`). Then, explicitly assert that the generated `URL.hostname` matches the strictly expected `baseUrl` hostname before initiating any outgoing fetch requests. Ensure routing matches use trailing slashes to prevent partial prefix bypasses.
## 2024-05-24 - [Overly Permissive CORS Configuration]
**Vulnerability:** CORS policy allows any origin starting with `http://localhost:` to bypass restrictions.
**Learning:** `startsWith` is dangerous for origin validation as it allows origins like `http://localhost:80.malicious.com` or `http://localhost.evil.com`.
**Prevention:** Use strict equality for specific origins or parse the origin as a URL and validate the hostname and port properly.
