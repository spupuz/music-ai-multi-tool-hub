## 2026-09-30 - [Prevent internal data exposure in error messages]
**Vulnerability:** Raw error messages (err.message) were directly returned in 500/502 responses from the Cloudflare Worker proxy, which could leak internal implementation details or stack traces to clients.
**Learning:** Returning raw error messages can expose sensitive information about the backend infrastructure. Error details should be logged internally (console.error) while returning generic error messages to the client.
**Prevention:** Always catch and log original errors internally, and format a safe, generic error message for the response when writing API proxies.
