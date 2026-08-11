## 2024-05-24 - Missing ARIA Labels on Close Buttons
**Learning:** Found a pattern of missing ARIA labels on icon-only close buttons (like `&times;` or SVGs) in modal components, which makes them inaccessible to screen readers.
**Action:** Always verify that all icon-only buttons (like close buttons, settings buttons, etc.) have an `aria-label` to ensure accessibility.
