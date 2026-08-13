## 2026-08-13 - Target Blank Vulnerability
**Vulnerability:** Use of `target="_blank"` in links without `rel="noopener noreferrer"`.
**Learning:** Not using `rel="noopener noreferrer"` can allow the newly opened page to maliciously control the original page via `window.opener`.
**Prevention:** Always ensure `target="_blank"` links include `rel="noopener noreferrer"`.
