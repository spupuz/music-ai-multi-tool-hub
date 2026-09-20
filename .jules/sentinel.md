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
## 2024-09-02 - [Weak Randomness in ID Generation]
**Vulnerability:** Weak random number generation using `Date.now()` combined with template strings to create line IDs in `src/tools/LyricsSynchronizerTool.tsx`.
**Learning:** Using `Date.now()` for generating IDs can lead to collisions and predictability, especially in fast loops. This violates codebase security conventions which mandate `crypto.randomUUID()` for robust uniqueness. The codebase had remnants of this pattern which I have fixed in this iteration.
**Prevention:** Always use `crypto.randomUUID()` when generating unique identifiers to ensure robust, collision-resistant uniqueness without relying on weak pseudorandom number generators or predictable timestamps.
## 2026-09-03 - [HIGH] Add rate limiting to login endpoint
**Vulnerability:** The `/verify-password` endpoint used for committee authentication lacked rate limiting, making it vulnerable to brute force attacks.
**Learning:** Authentication endpoints, even simple password verifications without usernames, must have strict rate limits to prevent brute force discovery of the shared secret.
**Prevention:** Use a distributed KV store (e.g., Cloudflare Workers KV) keyed by client IP to track failed authentication attempts and temporarily block subsequent requests after a threshold is reached.
## 2025-03-04 - Rate Limiting on Unauthenticated AI Proxy Endpoint
**Vulnerability:** The Gemini API proxy endpoint in the Cloudflare Worker lacked rate limiting, allowing any user (or malicious actor) to spam requests, potentially leading to API quota exhaustion and unexpected billing costs.
**Learning:** Even though the API key is secured server-side, exposing an unauthenticated proxy endpoint without rate limits still creates a denial-of-wallet (DoW) and resource exhaustion vulnerability.
**Prevention:** Implement rate limiting (e.g., using Cloudflare KV tracking by client IP) on all unauthenticated proxy endpoints that consume third-party API quotas.
## 2025-03-04 - [HIGH] Rate Limiting on Unauthenticated API Proxy Endpoint (Suno)
**Vulnerability:** The Suno API proxy endpoint (`/suno/*`) in the Cloudflare Worker lacked rate limiting, allowing unauthenticated actors to spam requests, potentially leading to Suno API quota exhaustion, denial of service, and unexpected Cloudflare Worker costs (Denial-of-Wallet).
**Learning:** Exposing unauthenticated proxy endpoints to third-party APIs without rate limits creates an open relay for resource exhaustion, even if the primary intent is just to bypass browser CORS.
**Prevention:** Always implement rate limiting (e.g., using Cloudflare KV tracking by client IP) on all unauthenticated proxy endpoints that consume third-party resources or worker quotas.
## 2026-09-08 - [CRITICAL] React href XSS via javascript: URIs
**Vulnerability:** The `webLink` property in `SongDeckPicker` was derived directly from unsanitized user input and assigned to the `href` attribute of `<a>` tags. If an attacker provided a link starting with `javascript:`, React would render it as-is, executing arbitrary code when the user clicked the link.
**Learning:** React does not automatically sanitize `href` attributes against `javascript:` or `data:` URIs. Developers must explicitly validate URLs before binding them to `href` in JSX.
**Prevention:** Always validate user-provided URLs using a strict protocol check (e.g., ensuring they start with `http://` or `https://`) before using them in `href` properties.
## 2026-09-09 - [MEDIUM] Fix CSV Formula Injection in exports
**Vulnerability:** The CSV export functionality in `src/services/csvExportService.ts` did not sanitize input fields starting with `=`, `+`, `-`, or `@`. When imported into spreadsheet software like Excel or Google Sheets, these inputs could be executed as formulas (CSV Formula Injection or Macro Injection), potentially leading to arbitrary command execution or data exfiltration.
**Learning:** Even when exporting generic application data (like song titles or comments), user-provided strings can act as payloads if they begin with specific characters recognized by spreadsheet parsers.
**Prevention:** Always escape CSV fields by prepending a single quote (`'`) to any string that begins with `=`, `+`, `-`, or `@` before adding it to the CSV content.
## 2024-09-10 - [Weak Randomness in ID Generation]
**Vulnerability:** Weak random number generation using `Date.now()` combined with template strings or `toString()` to create unique IDs across various tools (e.g., `SongDeckPicker`, `CreativeConceptBlender`, `SparkTuneTool`).
**Learning:** Using `Date.now()` for generating IDs can lead to collisions and predictability, especially when operations happen quickly. This violates codebase security conventions which mandate `crypto.randomUUID()` for robust uniqueness.
**Prevention:** Always use `crypto.randomUUID()` when generating unique identifiers to ensure robust, collision-resistant uniqueness without relying on weak pseudorandom number generators or predictable timestamps.
## 2026-09-14 - [MEDIUM] Fix CSV Formula Injection in SongStructureBuilder CSV export
**Vulnerability:** The CSV export functionality in `src/components/SongStructureBuilder/utils.ts` did not sanitize input fields starting with `=`, `+`, `-`, or `@`. When imported into spreadsheet software like Excel or Google Sheets, these inputs could be executed as formulas (CSV Formula Injection or Macro Injection), potentially leading to arbitrary command execution or data exfiltration. This pattern was missed in previous fixes.
**Learning:** Even when exporting generic application data (like song lyrics or structural notes), user-provided strings can act as payloads if they begin with specific characters recognized by spreadsheet parsers. This needs to be applied universally to all CSV exports.
**Prevention:** Always escape CSV fields by prepending a single quote (`'`) to any string that begins with `=`, `+`, `-`, or `@` before adding it to the CSV content.
## 2026-09-15 - [HIGH] Sanitize user-provided URLs in React href attributes
**Vulnerability:** React does not automatically sanitize `href` attributes against `javascript:` or `data:` URIs. If an attacker provides a URL like `javascript:alert(1)` through external sources (like imported CSV cards in `SongDeckPicker`), it will be rendered as-is and executed upon clicking, resulting in XSS.
**Learning:** `new URL()` validation only guarantees a string is a formally valid URI, but does not constrain the scheme/protocol to safe subsets. `javascript:` and `mailto:` are completely valid URIs. Furthermore, relying on `window.location.origin` in `new URL(url, base)` can cause crashes in SSR or non-browser environments.
**Prevention:** Always use a strict protocol whitelist (e.g., `['http:', 'https:', 'mailto:']`) when validating URLs before binding to `href`. When dealing with relative paths and client-side code, use a dummy absolute origin like `http://localhost` as the base in `new URL(url, base)` to ensure safe parsing without throwing `ReferenceError` on `window` in non-browser environments.
## 2026-09-16 - [CRITICAL] React href XSS via javascript: URIs in Suno properties
**Vulnerability:** Found unsanitized `href` bindings for `suno_playlist_url`, `suno_creator_url`, and `suno_song_url` in `InfoBoxes.tsx` and `SunoSongComplianceTool.tsx`. If these properties are maliciously crafted or spoofed (e.g., through imported CSVs or poisoned external API responses), they could lead to XSS execution via `javascript:` URIs.
**Learning:** Even URLs fetched from third-party APIs (like Suno) or seemingly safe properties should be sanitized before being used in React `href` attributes, as they could be poisoned upstream or overridden by malicious imported data.
**Prevention:** Always wrap dynamic URL variables with `sanitizeUrlForHref` (or a similar protocol-checking utility) before binding them to `href` in JSX.
## 2026-09-17 - [CRITICAL] React href XSS via javascript: URIs in UserStats and Player
**Vulnerability:** Found unsanitized `href` bindings for `suno_song_url` and `suno_creator_url` across various SunoUserStats charts, DetailedSongPerformanceTable, UserProfileCard, and SunoMusicPlayerTool. If these properties are maliciously crafted, they could lead to XSS execution via `javascript:` URIs.
**Learning:** EvenURLs fetched from third-party APIs or seemingly safe properties must be sanitized before being used in React `href` attributes. This issue was spread across many components that display user stats and play music.
**Prevention:** Always wrap dynamic URL variables with `sanitizeUrlForHref` (or a similar protocol-checking utility) before binding them to `href` in JSX, especially in components that visualize or play external data.

## 2026-09-20 - [HIGH] Fix rate limiting sliding window flaw leading to permanent lockouts
**Vulnerability:** The rate limiting logic across the Cloudflare Worker endpoints (`/suno`, `/verify-password`, `/`) used a naive sliding window approach. It incremented a count in KV and passed `expirationTtl: 60` (or `300`) on *every* increment. Cloudflare KV's `expirationTtl` is relative to the current time, meaning each request extended the TTL. A user making slow, continuous requests (e.g., once every 30 seconds) would continually extend the TTL, eventually reaching the limit and being permanently locked out because the TTL never expired.
**Learning:** Passing `expirationTtl` on every update in a key-value store continually extends the expiration from the *current* time, breaking the logical sliding window and potentially causing a Denial-of-Service (lockout) for users. Omitting the TTL on subsequent updates does not preserve the original TTL in Cloudflare KV; it removes the TTL entirely.
**Prevention:** Store the window start timestamp in the KV value (e.g., `{ attempts: 1, windowStart: 1712345678901 }`). Enforce the sliding window logically in the application code by checking `now - windowStart > windowMs`. Pass a fixed `expirationTtl` (satisfying the 60-second minimum) on every write to ensure the record is eventually garbage collected, relying on the application code (not KV expiration) to enforce the rolling window limit.
