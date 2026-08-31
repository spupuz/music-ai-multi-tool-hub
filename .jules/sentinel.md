## 2024-05-24 - [CRITICAL] Fix Server-Side Request Forgery in Suno Proxy
**Vulnerability:** The Cloudflare worker (`gemini-worker/index.js`) implemented a server-side proxy for the Suno API. It extracted the path via `url.pathname.replace(/^\/suno(-web)?/, '')` and constructed the target URL using basic string concatenation (`targetUrl = \`${baseUrl}${path}${url.search}\``). By passing a path like `/suno-web@attacker.com`, the resulting URL evaluated to `https://suno.com@attacker.com`, causing the fetch to hit `attacker.com` instead of the expected Suno backend.
**Learning:** Naive path extraction using string replacement followed by loose string concatenation in proxies fails to account for URI structure manipulation (e.g., abusing the authority section `@`).
**Prevention:** Always use the `URL` constructor to compose URLs safely (`new URL(path + search, baseUrl)`). Then, explicitly assert that the generated `URL.hostname` matches the strictly expected `baseUrl` hostname before initiating any outgoing fetch requests. Ensure routing matches use trailing slashes to prevent partial prefix bypasses.
## 2024-05-24 - [Overly Permissive CORS Configuration]
**Vulnerability:** CORS policy allows any origin starting with `http://localhost:` to bypass restrictions.
**Learning:** `startsWith` is dangerous for origin validation as it allows origins like `http://localhost:80.malicious.com` or `http://localhost.evil.com`.
**Prevention:** Use strict equality for specific origins or parse the origin as a URL and validate the hostname and port properly.
## 2024-08-21 - [Prevent Path Traversal and URL Injection in Gemini Proxy]
**Vulnerability:** The Gemini API Proxy Worker interpolated the user-provided `model` string directly into the external API URL without validation, opening up potential path traversal or URL injection vectors against the upstream Google APIs.
**Learning:** Even internal proxy endpoints acting on behalf of safe frontends need rigorous sanitization for dynamic route/URL parameters.
**Prevention:** Strictly validate dynamic segments of upstream URLs against a rigid whitelist or restrictive regex (like `^[a-zA-Z0-9.-]+$`) before interpolation.
## 2024-08-28 - [Timing Attack in Password Verification]
**Vulnerability:** The `/verify-password` endpoint in the Gemini worker used the standard equality operator (`===`) for verifying the committee password. This basic comparison leaks information about the password length and character correctness because it short-circuits upon encountering the first mismatched character.
**Learning:** Basic string equality operations are susceptible to timing attacks over the network since different inputs will take measurably different times to evaluate.
**Prevention:** Always use a constant-time comparison algorithm (such as a bitwise XOR loop comparing every character regardless of match) when validating sensitive strings like passwords or cryptographic secrets.
## 2026-08-30 - [Weak Randomness for Line IDs in LyricsSynchronizerTool]
**Vulnerability:** Weak random number generation using Math.random() to create line IDs in `src/tools/LyricsSynchronizerTool.tsx`.
**Learning:** Using Math.random() for generating IDs can lead to collisions and predictability, violating codebase security conventions which mandate crypto.randomUUID() for robust uniqueness.
**Prevention:** Always use crypto.randomUUID() when generating unique identifiers.

## 2024-08-29 - [Weak Randomness in ID Generation]
**Vulnerability:** The codebase had remnants of using `Math.random().toString(16)` coupled with `Date.now()` to generate unique identifiers (e.g., in `LyricsSynchronizerTool.tsx`).
**Learning:** `Math.random()` does not provide cryptographically secure pseudorandomness and its use for identifier generation can lead to collisions or predictability. This was addressed in previous components but missed in others, showing the need for comprehensive search when fixing patterns.
**Prevention:** Use `crypto.randomUUID()` for all newly generated identifiers across the codebase to ensure robust, collision-resistant uniqueness without relying on weak pseudorandom number generators.
