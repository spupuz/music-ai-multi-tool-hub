## 2026-09-29 - Prevent Information Leakage in API Proxy

**Vulnerability:** The Cloudflare Worker proxy (`gemini-worker/index.js`) was returning raw `err.message` values in HTTP 500/502 responses (e.g. `Suno proxy error: ${err.message}`).
**Learning:** Returning unhandled exception details directly to the client can leak sensitive internal context, backend paths, or unexpected configuration details.
**Prevention:** Always log the original error internally (e.g. `console.error`) for debugging, and return a generic error message (e.g. `Internal server error while fetching Suno data`) to the client.
