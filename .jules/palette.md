
## 2026-10-01 - [Keyboard Accessibility for Hover States]
**Learning:** Elements hidden visually until hover via opacity-0 group-hover:opacity-100 are invisible to keyboard users who tab through interactive elements.
**Action:** Always pair hover states with focus:opacity-100, focus-within:opacity-100, group-focus-within:opacity-100, or focus-visible:opacity-100 to preserve keyboard accessibility.
