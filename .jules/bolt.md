## 2025-03-09 - [Eliminating O(n) overhead and maximum call stack errors on chart limits]
**Learning:** Performing `Math.max(...data.map(d => d.value))` results in redundant O(N) array allocation overhead, a second O(N) iteration, and causes "Maximum call stack size exceeded" runtime crashes if the data array size exceeds standard V8 limits (~125,000 items).
**Action:** Always compute max/min scales within the same mapping loop pass using `reduce` or a local variable to prevent both performance bottlenecks and fatal UI crashes on large datasets.

## 2026-10-01 - [Avoid spread operator and repeated loops in Chart component mappings]
**Learning:** React charting components often process large arrays of data for scatter plots or time series. When doing mapping and then using `Math.max(...data.map(...))`, it creates multiple intermediate arrays, executes O(N) operations repeatedly, and the spread operator can exceed the maximum call stack size limit if the dataset is large.
**Action:** Compute max/min values in the same pass (e.g. within the same `useMemo` via a loop) that maps the dataset, rather than using the spread operator on a mapped array.

## 2026-09-30 - Consolidate Multiple Reduce Iterations
**Learning:** Repeated .reduce() passes over the same dataset (e.g. for summing plays, upvotes, comments separately) cause O(N*3) redundant iteration, introducing a bottleneck when working with large arrays of Suno clips.
**Action:** Use a single loop pass (O(N)) with local variables to accumulate multiple fields simultaneously, replacing chained array functions to prevent redundant array iterations.

## 2026-09-28 - O(N) Array Spread Optimization
**Learning:** Using `Math.max(...array.map())` inside a `useMemo` creates two issues: it allocates an intermediate array costing O(N) memory/time, and using the spread operator on large arrays can cause `Maximum call stack size exceeded` crashes.
**Action:** Compute min/max values dynamically within the same `useMemo` loop that transforms the data, completely avoiding intermediate arrays and the spread operator.
