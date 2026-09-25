
## 2026-09-25 - [StatsPage Map Render Optimizations]
**Learning:** Complex components that update local state on user interactions (like `setTooltipContent` during map hovers in `StatsPage`) can trigger O(N) array transformations on every event if the data computations are placed directly in the render body.
**Action:** Always wrap heavy data transformations, mapping, and Chart.js configuration objects in `useMemo` hooks, especially in interactive dashboards or map components, to ensure they only re-run when the underlying fetched data actually changes.
