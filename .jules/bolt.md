## 2025-03-09 - [Eliminating O(n) overhead and maximum call stack errors on chart limits]
**Learning:** Performing `Math.max(...data.map(d => d.value))` results in redundant O(N) array allocation overhead, a second O(N) iteration, and causes "Maximum call stack size exceeded" runtime crashes if the data array size exceeds standard V8 limits (~125,000 items).
**Action:** Always compute max/min scales within the same mapping loop pass using `reduce` or a local variable to prevent both performance bottlenecks and fatal UI crashes on large datasets.
