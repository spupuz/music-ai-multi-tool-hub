## 2026-09-27 - Prevent error message leakage in worker
**Vulnerability:** HTTP 500/502 error responses in the Cloudflare Worker proxy were exposing raw `err.message` details to the client, potentially leaking sensitive internal information.
**Learning:** Returning raw error messages from catch blocks directly to the client is a security risk.
**Prevention:** Always return generic error messages to the client (e.g., 'An internal error occurred') and use `console.error` to log the actual error for debugging.
