
## 2025-02-28 - [Timing Attack Mitigation in `timingSafeEqual`]
**Vulnerability:** The custom `timingSafeEqual` function in `gemini-worker/index.js` returned early if the lengths of the two strings being compared didn't match. This allowed a timing attack where an attacker could deduce the exact length of secrets (like `PROXY_AUTH_TOKEN` or `COMMITTEE_PASSWORD`) based on response times.
**Learning:** Returning early in cryptographic string comparisons defeats the purpose of constant-time execution because the execution time leaks information about the length of the string.
**Prevention:** In custom constant-time comparisons, evaluate characters up to the maximum string length of both inputs. Pad the shorter string dynamically (e.g., with 0 or null bytes) during the loop without modifying the original input strings, and ensure a non-zero result is set initially if lengths differ to prevent false positives.
