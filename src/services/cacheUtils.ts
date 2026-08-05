const CACHE_PREFIX = 'hubCache_';

interface CacheEntry<T> {
  value: T;
  ts: number;
}

export function cacheGet<T>(namespace: string, key: string, ttlMs: number): T | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${namespace}_${key}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (typeof entry.ts !== 'number' || Date.now() - entry.ts > ttlMs) return null;
    return entry.value;
  } catch (e) {
    return null;
  }
}

export function cacheSet<T>(namespace: string, key: string, value: T, maxEntries = 200): void {
  try {
    const fullKey = `${CACHE_PREFIX}${namespace}_${key}`;
    localStorage.setItem(fullKey, JSON.stringify({ value, ts: Date.now() } as CacheEntry<T>));

    const prefix = `${CACHE_PREFIX}${namespace}_`;
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
    if (keys.length > maxEntries) {
      keys.sort((a, b) => {
        try {
          return (JSON.parse(localStorage.getItem(a)!).ts as number) - (JSON.parse(localStorage.getItem(b)!).ts as number);
        } catch (e) {
          return 0;
        }
      });
      keys.slice(0, keys.length - maxEntries).forEach(k => localStorage.removeItem(k));
    }
  } catch (e) {
    // Storage quota or privacy mode: fail silently, cache is best-effort.
  }
}

export function cacheRemove(namespace: string, key: string): void {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${namespace}_${key}`);
  } catch (e) {
    // ignore
  }
}

/**
 * Reads and returns all entries in a namespace, keyed by their original key.
 * Entries beyond `maxEntries` (oldest by timestamp) are pruned on read.
 */
export function cacheGetAll<T>(namespace: string, maxEntries = 500): Map<string, T> {
  const map = new Map<string, T>();
  try {
    const prefix = `${CACHE_PREFIX}${namespace}_`;
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
    keys.sort((a, b) => {
      try {
        return (JSON.parse(localStorage.getItem(a)!).ts as number) - (JSON.parse(localStorage.getItem(b)!).ts as number);
      } catch (e) {
        return 0;
      }
    });
    const toRemove = Math.max(0, keys.length - maxEntries);
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(keys[i]);
    }
    for (let i = toRemove; i < keys.length; i++) {
      try {
        const entry = JSON.parse(localStorage.getItem(keys[i])!) as CacheEntry<T>;
        map.set(keys[i].slice(prefix.length), entry.value);
      } catch (e) {
        // Skip corrupted entries
      }
    }
  } catch (e) {
    // Storage unavailable: return whatever was collected (possibly empty).
  }
  return map;
}

/**
 * Removes all entries in a namespace. Returns the number of removed keys.
 */
export function cacheRemoveNamespace(namespace: string): number {
  let removed = 0;
  try {
    const prefix = `${CACHE_PREFIX}${namespace}_`;
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(prefix)) {
        localStorage.removeItem(k);
        removed++;
      }
    });
  } catch (e) {
    // ignore
  }
  return removed;
}
