/**
 * Safe localStorage helpers that NEVER throw (so the app never crashes on a full
 * storage quota) and SELF-HEAL: when the quota is exceeded, they evict the least
 * valuable, removable data (caches, history, logs) automatically and retry, so the
 * user never has to clear storage manually.
 *
 * Precedence when evicting (ascending priority — lowest evicted first):
 *   1. hubCache_*                      (Suno/Riffusion fetch caches — best-effort)
 *   2. Regenerable caches + logs       (sunoMusicPlayer_user_/playlist_ dumps,
 *                                      sunoUserStats_ snapshots, song info caches,
 *                                      visits/history logs — all re-fetchable)
 *   3. Everything else                 (persisted app state / user data)
 * A plain quota error only evicts tier 1; if tier 1 alone is not enough it moves
 * to tier 2. Tier 3 (user data) is only cleared if nothing else frees space.
 *
 * Eviction removes the LARGEST matching keys first and stops as soon as it has
 * freed enough bytes for the pending write, so healthy caches survive.
 */

// Keys that hold pure ephemeral caches — safe to drop first.
const CACHE_PREFIX = 'hubCache_';

// Prefixes of regenerable caches (re-fetchable from the Suno/Riffusion APIs).
// These are the usual quota hogs (full user/playlist dumps, stats snapshots).
const EVICTABLE_CACHE_PREFIXES = [
  'sunoMusicPlayer_user_',
  'sunoMusicPlayer_playlist_',
  'sunoUserStats_',
  'songDeckPicker_songInfoCache_v1',
  'sunoMusicPlayer_clipDetailCache_v1',
];

// Known transient log/history keys that are safe to delete (re-created on use).
const EVICTABLE_KNOWN_LOG_KEYS = [
  'sunoMusicPlayer_lastSession',
  'myVisitsLog',
  'lastDailyLocalActivePing',
  'deckPickerPickedSongsLog_v1',
];

// Prefixes of local tracking/stat logs.
const EVICTABLE_LOG_PREFIXES = ['stat_', 'statEvents_'];

const isCacheKey = (key: string): boolean => key.startsWith(CACHE_PREFIX);

const matchesAnyPrefix = (key: string, prefixes: string[]): boolean =>
  prefixes.some(prefix => key.startsWith(prefix));

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

const isTier2Key = (key: string): boolean =>
  !isCacheKey(key) &&
  (EVICTABLE_KNOWN_LOG_KEYS.includes(key) ||
    matchesAnyPrefix(key, EVICTABLE_CACHE_PREFIXES) ||
    matchesAnyPrefix(key, EVICTABLE_LOG_PREFIXES) ||
    looksLikeEvictableLog(key));

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
    // Largest values first so we free quota as fast as possible.
    return matches.sort((a, b) => {
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

// Removes candidate keys (largest first) until `neededBytes` have been freed.
const evictTier = (keys: string[], neededBytes: number): number => {
  let freed = 0;
  for (const key of keys) {
    if (freed >= neededBytes) break;
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

const evict = (opts: EvictOpts, neededBytes: number): void => {
  // Tier 1: hub caches
  const freedT1 = evictTier(getSortedCandidateKeys(isCacheKey), neededBytes);
  if (freedT1 >= neededBytes) return;

  // Tier 2: regenerable caches + logs
  const freedT2 = evictTier(getSortedCandidateKeys(isTier2Key), neededBytes - freedT1);
  if (freedT1 + freedT2 >= neededBytes) return;

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
    if (!allowAutoEvict) return false;
    // Free just enough space for this value, then retry a bounded number of times.
    const neededBytes = value.length;
    for (let attempt = 0; attempt < 6; attempt++) {
      evict(
        { allowAutoEvict, allowFullClear: allowFullClear || attempt >= 4 },
        neededBytes,
      );
      try {
        localStorage.setItem(key, value);
        return true;
      } catch {
        /* try again */
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
