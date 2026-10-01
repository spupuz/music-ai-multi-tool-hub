<<<<<<< HEAD
## 2026-10-01 - [Avoid spread operator and repeated loops in Chart component mappings]
**Learning:** React charting components often process large arrays of data for scatter plots or time series. When doing mapping and then using `Math.max(...data.map(...))`, it creates multiple intermediate arrays, executes O(N) operations repeatedly, and the spread operator can exceed the maximum call stack size limit if the dataset is large.
**Action:** Compute max/min values in the same pass (e.g. within the same `useMemo` via a loop) that maps the dataset, rather than using the spread operator on a mapped array.
=======
## 2026-09-30 - Consolidate Multiple Reduce Iterations
**Learning:** Repeated .reduce() passes over the same dataset (e.g. for summing plays, upvotes, comments separately) cause O(N*3) redundant iteration, introducing a bottleneck when working with large arrays of Suno clips.
**Action:** Use a single loop pass (O(N)) with local variables to accumulate multiple fields simultaneously, replacing chained array functions to prevent redundant array iterations.
>>>>>>> origin/bolt-consolidate-reduce-loops-10159960333405853594
