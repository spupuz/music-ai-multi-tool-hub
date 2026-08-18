## 2023-10-27 - [Topic Search Optimization using React useMemo]
**Learning:** Found a case where `ReactDOMServer.renderToStaticMarkup(topic.content)` was being repeatedly called on every keystroke in a search filter.
**Action:** When filtering complex React content trees using `ReactDOMServer.renderToStaticMarkup`, always cache the generated string representation using `useMemo` mapped to a static identifier (like a `Map<TopicId, string>`), rather than parsing the React nodes on every render/keystroke. Returning modified objects from the hook directly (e.g. `{ ...topic, searchableContent }`) can cause reference equality issues downstream.

## 2026-08-18 - [DetailedSongPerformanceTable React.memo Optimization]
**Learning:** Found a case where a large table component (`DetailedSongPerformanceTable`) handling numerous rows of sorted data was re-rendering excessively when its parent component updated, despite the table's props remaining unchanged. This codebase-specific bottleneck caused noticeable lag in the UI.
**Action:** Wrapped the expensive `DetailedSongPerformanceTable` UI component in `React.memo()` to prevent redundant re-renders when parent state changes but component props are stable.
