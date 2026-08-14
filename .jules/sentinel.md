## 2024-05-18 - [Removal of Third-Party CORS Proxies]
**Vulnerability:** Use of unvetted third-party public proxies for external fetching.
**Learning:** Hardcoded fallbacks to public CORS proxies can result in data interception and SSRF vulnerabilities.
**Prevention:** Rely strictly on verified backend worker proxies configured for the specific application needs.
