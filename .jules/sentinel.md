## 2024-05-24 - Cryptographically Weak ID Generation
**Vulnerability:** ID fields for various objects (like lyrics or arrangement blocks) were generated using `Date.now()` and `Math.random()`.
**Learning:** `Math.random()` does not provide cryptographically secure random numbers, making IDs potentially predictable and susceptible to collisions in high-frequency generation scenarios.
**Prevention:** Use `crypto.randomUUID()` for generating secure, unique identifiers.
