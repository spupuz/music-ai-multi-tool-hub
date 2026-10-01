## 2026-09-28 - Prevent Information Leakage in Worker Error Responses
**Vulnerability:** Raw `err.message` values were being returned directly in HTTP 500/502 responses from the Cloudflare Worker, which could expose internal paths, dependencies, or network configurations to attackers.
**Learning:** When proxying requests or handling server-side errors, original stack traces and error strings must be swallowed before reaching the client to maintain defense in depth.
**Prevention:** Always log the original error internally (e.g., `console.error(err)`) for debugging, and return a generic, static error string (e.g., 'An internal error occurred') to the client.
