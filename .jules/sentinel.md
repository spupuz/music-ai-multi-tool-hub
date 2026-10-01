## 2026-09-28 - Prevent Information Leakage in Worker Error Responses
**Vulnerability:** Raw `err.message` values were being returned directly in HTTP 500/502 responses from the Cloudflare Worker, which could expose internal paths, dependencies, or network configurations to attackers.
**Learning:** When proxying requests or handling server-side errors, original stack traces and error strings must be swallowed before reaching the client to maintain defense in depth.
**Prevention:** Always log the original error internally (e.g., `console.error(err)`) for debugging, and return a generic, static error string (e.g., 'An internal error occurred') to the client.

## 2026-09-29 - Prevent Information Leakage in API Proxy
**Vulnerability:** The Cloudflare Worker proxy (`gemini-worker/index.js`) was returning raw `err.message` values in HTTP 500/502 responses (e.g. `Suno proxy error: ${err.message}`).
**Learning:** Returning unhandled exception details directly to the client can leak sensitive internal context, backend paths, or unexpected configuration details.
**Prevention:** Always log the original error internally (e.g. `console.error`) for debugging, and return a generic error message (e.g. `Internal server error while fetching Suno data`) to the client.

## 2026-09-30 - [Prevent internal data exposure in error messages]
**Vulnerability:** Raw error messages (err.message) were directly returned in 500/502 responses from the Cloudflare Worker proxy, which could leak internal implementation details or stack traces to clients.
**Learning:** Returning raw error messages can expose sensitive information about the backend infrastructure. Error details should be logged internally (console.error) while returning generic error messages to the client.
**Prevention:** Always catch and log original errors internally, and format a safe, generic error message for the response when writing API proxies.
