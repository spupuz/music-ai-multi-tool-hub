## 2024-05-24 - Reverse Tabnabbing Vulnerability
**Vulnerability:** Found `window.open` calls using target `_blank` without `noopener noreferrer` which can expose the application to reverse tabnabbing attacks.
**Learning:** `window.open` with `_blank` should always include `'noopener,noreferrer'` as the third parameter to prevent the newly opened page from accessing `window.opener`.
**Prevention:** Ensure all future uses of `window.open(url, '_blank')` include the `'noopener,noreferrer'` feature string.
