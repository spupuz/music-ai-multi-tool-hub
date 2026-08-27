## 2023-10-27 - [Topic Search Optimization using React useMemo]
**Learning:** Found a case where `ReactDOMServer.renderToStaticMarkup(topic.content)` was being repeatedly called on every keystroke in a search filter.
**Action:** When filtering complex React content trees using `ReactDOMServer.renderToStaticMarkup`, always cache the generated string representation using `useMemo` mapped to a static identifier (like a `Map<TopicId, string>`), rather than parsing the React nodes on every render/keystroke. Returning modified objects from the hook directly (e.g. `{ ...topic, searchableContent }`) can cause reference equality issues downstream.

## 2026-08-18 - [DetailedSongPerformanceTable React.memo Optimization]
**Learning:** Found a case where a large table component (`DetailedSongPerformanceTable`) handling numerous rows of sorted data was re-rendering excessively when its parent component updated, despite the table's props remaining unchanged. This codebase-specific bottleneck caused noticeable lag in the UI.
**Action:** Wrapped the expensive `DetailedSongPerformanceTable` UI component in `React.memo()` to prevent redundant re-renders when parent state changes but component props are stable.

## 2024-05-18 - [Optimizing Chart Data Memoization]
**Learning:** React Chart.js wrapper components often re-compute expensive data transformations (like `.map()` for chart axes) inside the component body, meaning they are re-calculated on every render even when props haven't changed.
**Action:** Always wrap data array transformations for charts in `useMemo` hooks, especially for scatter plots and bar charts that may process thousands of data points on render.

## 2023-11-20 - [Optimized array deduplication in StatChartsArea]
**Learning:** Combining arrays and deduplicating them inline using `.filter` with `findIndex` on every render causes an O(n^2) performance bottleneck, especially for lists of objects. Additionally, generating a new array reference on each render can bypass React.memo optimizations in child components.
**Action:** Always memoize expensive combinations/deduplications of arrays with `useMemo`. When deduplicating arrays of objects by an ID, use an O(n) approach like iterating and setting into a `Map` (keyed by ID), then extracting the values using `Array.from(map.values())`, rather than O(n^2) `Array.prototype.filter` with `Array.prototype.findIndex`.
