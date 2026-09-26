## 2024-05-24 - Do not leak error messages
**Vulnerability:** API endpoints returning raw `err.message` in 500/502 responses.
**Learning:** Exposing raw error messages or stack traces can leak sensitive internal information (like infrastructure paths, API structures, or dependency details) to external users.
**Prevention:** Always replace raw `err.message` and stack traces with generic, safe error messages like 'An internal error occurred' before responding to clients.
