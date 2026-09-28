## 2026-09-28 - O(N) Array Spread Optimization
**Learning:** Using `Math.max(...array.map())` inside a `useMemo` creates two issues: it allocates an intermediate array costing O(N) memory/time, and using the spread operator on large arrays can cause `Maximum call stack size exceeded` crashes.
**Action:** Compute min/max values dynamically within the same `useMemo` loop that transforms the data, completely avoiding intermediate arrays and the spread operator.
