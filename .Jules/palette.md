## 2026-09-26 - Keyboard Focus on Hover-Only Elements
**Learning:** Elements that are hidden via `opacity-0 group-hover:opacity-100` become invisible to keyboard users who tab through interactive elements, breaking keyboard accessibility.
**Action:** Always include `focus:opacity-100`, `focus-within:opacity-100`, or `group-focus-within:opacity-100` alongside hover states for containers holding interactive elements to ensure they become visible when focused via keyboard navigation.
