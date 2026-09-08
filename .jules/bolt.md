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

## 2024-05-19 - [Data-Heavy Performance Tables React.memo Optimization]
**Learning:** Found a case where several unmemoized data-heavy performance tables (e.g., `TagGenrePerformanceTables`, `TagPairPerformanceTable`, `CohortPerformanceTable`) in `StatChartsArea` were re-rendering and unnecessarily re-sorting their arrays every time the parent component's state (such as `selectedPeriod`) updated.
**Action:** Wrapped these heavy UI components in `React.memo()` to prevent redundant re-renders and costly re-sorts when their parent state changes but their own props remain stable.

## 2024-06-25 - [Chart Array Mapping Re-Calculation Optimization]
**Learning:** Certain components utilizing `Chart.js` (such as `GenreUsageChart`, `TagUsageChart`, `GenreVotesChart`, and `TagVotesChart`) computed label arrays and generated color shades inside the main component body, causing costly re-calculations (O(n) mappings) whenever state changes unrelated to data occurred (e.g. `screenWidth` updates from window resizes).
**Action:** Extract expensive chart data transformations (such as `Array.map` for chart labels, datasets, and color generating functions) into a `useMemo` block that only recalculates when the source data (`processedData`) or theme settings change, rather than running redundantly on every render.

## 2026-09-03 - [Chart.js Recreation on Resize/Render Bottleneck]
**Learning:** Recreating a Chart.js instance by calling `chart.destroy()` and `new Chart()` on every render cycle (e.g. tracking `screenWidth` changes via window resize listeners) is a significant codebase-specific performance bottleneck. Micro-optimizations like memoizing array mapping are negligible compared to canvas reconstruction.
**Action:** For charts that react frequently to state updates like resizing, store the chart instance in a ref. Check for its existence in the main `useEffect` and explicitly rebuild the entire `datasetConfig` (including visual properties like `tension`, `fill`, and colors). Then, mutate the instance's `data.datasets[0]`, `data.labels`, and `options`, and call `chart.update('none')`. Extract the `chart.destroy()` cleanup strictly to a separate unmount `useEffect([], ...)`.
## 2024-05-18 - [Optimizing Chart Data Memoization]
## 2024-06-26 - [Chart.js Recreation on Resize/Render Bottleneck - Tags and Genres]
**Learning:** Recreating a Chart.js instance by calling `chart.destroy()` and `new Chart()` on every render cycle (e.g. tracking `screenWidth` changes via window resize listeners) is a significant codebase-specific performance bottleneck, especially for Tag and Genre stat charts. Micro-optimizations like memoizing array mapping are negligible compared to canvas reconstruction.
**Action:** For charts that react frequently to state updates like resizing, store the chart instance in a ref. Check for its existence in the main `useEffect` and explicitly rebuild the entire `datasetConfig` (including visual properties like `tension`, `fill`, and colors). Then, mutate the instance's `data.datasets[0]`, `data.labels`, and `options`, and call `chart.update('none')`. Extract the `chart.destroy()` cleanup strictly to a separate unmount `useEffect([], ...)`.
## 2026-09-06 - [Chart.js Recreation on Resize/Render Bottleneck - SongsByDayOfWeekChart]
**Learning:** Recreating a Chart.js instance by calling `chart.destroy()` and `new Chart()` on every render cycle (e.g. tracking `screenWidth` changes via window resize listeners) is a significant codebase-specific performance bottleneck. Micro-optimizations like memoizing array mapping are negligible compared to canvas reconstruction.
**Action:** For charts that react frequently to state updates like resizing, store the chart instance in a ref. Check for its existence in the main `useEffect` and explicitly rebuild the `datasetConfig`. Then, mutate the instance's `data.datasets[0]`, `data.labels`, and `options`, and call `chart.update('none')`. Extract the `chart.destroy()` cleanup strictly to a separate unmount `useEffect([], ...)`. 
## 2026-09-07 - [Chart.js Recreation on Resize/Render Bottleneck - SongsByHourOfDayChart]
**Learning:** Recreating a Chart.js instance by calling `chart.destroy()` and `new Chart()` on every render cycle (e.g. tracking `screenWidth` changes via window resize listeners) is a significant codebase-specific performance bottleneck. Micro-optimizations like memoizing array mapping are negligible compared to canvas reconstruction.
**Action:** For charts that react frequently to state updates like resizing, store the chart instance in a ref. Check for its existence in the main `useEffect` and explicitly rebuild the `datasetConfig`. Then, mutate the instance's `data.datasets[0]`, `data.labels`, and `options`, and call `chart.update('none')`. Extract the `chart.destroy()` cleanup strictly to a separate unmount `useEffect([], ...)`.
