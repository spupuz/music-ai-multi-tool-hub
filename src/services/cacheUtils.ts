import { safeSetItem, safeRemoveItem } from './safeStorage';

const CACHE_PREFIX = 'hubCache_';

interface CacheEntry<T> {
  value: T;
  ts: number;
}

/**
 * Returns the namespace keys (full localStorage keys) sorted oldest-first by
 * their cached timestamp. Each entry is read and parsed exactly ONCE up front
 * instead of on every comparator call — the previous inline comparators did an
 * O(n log n) number of localStorage reads + JSON.parse calls, which is slow and
 * janky on large caches. Reading once makes the sort O(n) reads + O(n log n)
 * comparisons over in-memory numbers. Mirrors safeStorage.getSortedCandidateKeys.
 */
function getKeysSortedByTimestamp(namespace: string): string[] {
  const prefix = `${CACHE_PREFIX}${namespace}_`;
  const entries: { key: string; ts: number }[] = [];
  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith(prefix)) continue;
    try {
      const ts = (JSON.parse(localStorage.getItem(key)!) as CacheEntry<unknown>).ts;
      entries.push({ key, ts: typeof ts === 'number' ? ts : 0 });
    } catch {
      entries.push({ key, ts: 0 });
    }
  }
  entries.sort((a, b) => a.ts - b.ts);
  return entries.map(e => e.key);
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
    safeSetItem(fullKey, JSON.stringify({ value, ts: Date.now() } as CacheEntry<T>));

    const keys = getKeysSortedByTimestamp(namespace);
    if (keys.length > maxEntries) {
      keys.slice(0, keys.length - maxEntries).forEach(k => safeRemoveItem(k));
    }
  } catch (e) {
    // Storage quota or privacy mode: fail silently, cache is best-effort.
  }
}

export function cacheRemove(namespace: string, key: string): void {
  try {
    safeRemoveItem(`${CACHE_PREFIX}${namespace}_${key}`);
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
    const keys = getKeysSortedByTimestamp(namespace);
    const toRemove = Math.max(0, keys.length - maxEntries);
    for (let i = 0; i < toRemove; i++) {
      safeRemoveItem(keys[i]);
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
        safeRemoveItem(k);
        removed++;
      }
    });
  } catch (e) {
    // ignore
  }
  return removed;
}
