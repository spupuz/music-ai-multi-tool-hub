## 2026-09-30 - Consolidate Multiple Reduce Iterations
**Learning:** Repeated .reduce() passes over the same dataset (e.g. for summing plays, upvotes, comments separately) cause O(N*3) redundant iteration, introducing a bottleneck when working with large arrays of Suno clips.
**Action:** Use a single loop pass (O(N)) with local variables to accumulate multiple fields simultaneously, replacing chained array functions to prevent redundant array iterations.
