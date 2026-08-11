## 2024-08-11 - React Prop Mutation Anti-Pattern
**Learning:** Found several React components (`GenreUsageChart.tsx`, `TagUsageChart.tsx`) mutating prop arrays in place using `data.sort()`. This is a classic React anti-pattern that can cause unexpected side effects and re-renders elsewhere in the application.
**Action:** Always verify if array methods mutate the original array (like `.sort()`, `.reverse()`, `.splice()`). When sorting prop data in React components, always create a shallow copy first using `[...data].sort()` or similar methods to preserve immutability.
