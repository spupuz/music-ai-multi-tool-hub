/**
 * Safe localStorage helpers that NEVER throw (so the app never crashes on a full
 * storage quota) and SELF-HEAL: when the quota is exceeded, they evict the least
 * valuable, removable data (caches, history, logs) automatically and retry, so the
 * user never has to clear storage manually.
 *
 * Precedence when evicting (ascending priority — lowest evicted first):
 *   1. hubCache_*                      (Suno/Riffusion fetch caches — best-effort)
 *   2. localStorage history/log lists  (event logs, visit logs, song info caches)
 *   3. Everything else                 (persisted app state / user data)
 * A plain quota error only evicts tier 1; if tier 1 alone is not enough it moves
 * to tier 2. Tier 3 (user data) is only cleared if nothing else frees space.
 */

// Keys that hold pure caches / logs / undo history — safe to drop first.
const CACHE_PREFIX = 'hubCache_';
const EVICTABLE_LOG_KEYS: string[] = [];

const isCacheKey = (key: string): boolean => key.startsWith(CACHE_PREFIX);

// A small whitelist of known log/history keys that are safe to delete.
const EVICTABLE_KNOWN_LOG_SUBSTRINGS = [
  '_history',
  '_LOG_KEY',
  '_log',
  'Log',
  'log_',
  'songInfoCache',
  'cache',
  'Cache',
  'SAVED_ARRANGEMENTS',
];

const looksLikeEvictableLog = (key: string): boolean =>
  EVICTABLE_KNOWN_LOG_SUBSTRINGS.some(sub => key.includes(sub));

const hasQuotaExceeded = (e: unknown): boolean =>
  e instanceof DOMException &&
  (e.name === 'QuotaExceededError' ||
    e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    e.code === 22 ||
    e.code === 1014);

type EvictOpts = {
  // Evict caches then logs, retrying between each tier.
  allowAutoEvict?: boolean;
  // When true, may clear the whole origin as a last resort.
  allowFullClear?: boolean;
};

const getSortedCandidateKeys = (predicate: (key: string) => boolean): string[] => {
  try {
    const all = Object.keys(localStorage);
    const matches = all.filter(predicate);
    // FIFO: oldest set first (localStorage insertion order is preserved per-key origin)
    return matches.sort((a, b) => {
      // Prefer clearing keys with the largest values first to free quota fastest.
      try {
        return (localStorage.getItem(b)?.length || 0) - (localStorage.getItem(a)?.length || 0);
      } catch {
        return 0;
      }
    });
  } catch {
    return [];
  }
};

const evictTier = (keys: string[], opts: EvictOpts): number => {
  let freed = 0;
  for (const key of keys) {
    try {
      const size = localStorage.getItem(key)?.length || 0;
      localStorage.removeItem(key);
      freed += size;
    } catch {
      /* continue */
    }
  }
  return freed;
};

const evict = (opts: EvictOpts): void => {
  // Tier 1: hub caches
  const cacheKeys = getSortedCandidateKeys(isCacheKey);
  const freedT1 = evictTier(cacheKeys, opts);
  if (freedT1 > 0) return;

  // Tier 2: log/history keys
  const logKeys = getSortedCandidateKeys(
    key => !isCacheKey(key) && (EVICTABLE_LOG_KEYS.includes(key) || looksLikeEvictableLog(key)),
  );
  const freedT2 = evictTier(logKeys, opts);
  if (freedT2 > 0) return;

  // Tier 3 (last resort, only if explicitly allowed)
  if (opts.allowFullClear) {
    try {
      localStorage.clear();
    } catch {
      /* ignore */
    }
  }
};

/** Best-effort write; never throws and self-heals on quota errors. */
export function safeSetItem(key: string, value: string, opts: EvictOpts = {}): boolean {
  const { allowAutoEvict = true, allowFullClear = false } = opts;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (!hasQuotaExceeded(e)) return false;
    if (allowAutoEvict) {
      // Free a little space, then retry a bounded number of times.
      for (let attempt = 0; attempt < 6; attempt++) {
        evict({ allowAutoEvict, allowFullClear: allowFullClear && attempt >= 5 });
        try {
          localStorage.setItem(key, value);
          return true;
        } catch {
          /* try again */
        }
      }
    }
    return false;
  }
}

/** Best-effort read; never throws. */
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Best-effort remove; never throws. */
export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Removes a single origin-wide key group (e.g. a cache namespace). */
export function safeRemoveKeysMatching(predicate: (key: string) => boolean): number {
  let removed = 0;
  try {
    Object.keys(localStorage)
      .filter(predicate)
      .forEach(k => {
        try {
          localStorage.removeItem(k);
          removed++;
        } catch {
          /* ignore */
        }
      });
  } catch {
    /* ignore */
  }
  return removed;
}
