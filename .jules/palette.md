
## 2024-05-18 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** Found multiple instances where icon-only buttons (`<Button>` and `<button>`) relied solely on the `title` attribute for tooltips, which is insufficient for screen readers and breaks accessibility standards. The `title` attribute doesn't reliably announce as an accessible name across all screen reader/browser combinations.
**Action:** When implementing icon-only buttons, always ensure an explicit `aria-label` is provided, even if a `title` attribute is present for sighted users' tooltips.
