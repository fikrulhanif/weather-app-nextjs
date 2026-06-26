/**
 * Generic in-memory TTL cache with injectable clock.
 *
 * Entries expire after `ttlMs` milliseconds from the moment of insertion.
 * Lookup automatically deletes expired entries (Req 1.4). The `now` function
 * is injectable so property tests can simulate time without `setTimeout` or
 * real-world wall-clock drift.
 */

export interface TtlCacheOptions {
  /** TTL in milliseconds. Every written entry expires this many ms after `set`. */
  readonly ttlMs: number;
  /** Injectable clock returning the current time in milliseconds since epoch. */
  readonly now?: () => number;
}

interface CacheEntry<V> {
  readonly value: V;
  readonly expiresAt: number;
}

export interface TtlCache<V> {
  get(key: string): V | undefined;
  set(key: string, value: V): void;
  delete(key: string): boolean;
  clear(): void;
}

export function createTtlCache<V>(options: TtlCacheOptions): TtlCache<V> {
  const { ttlMs, now = Date.now } = options;
  const store = new Map<string, CacheEntry<V>>();

  return {
    get(key: string): V | undefined {
      const entry = store.get(key);
      if (!entry) return undefined;

      // Expired entries are treated as absent and removed on next lookup (Req 1.4).
      if (now() >= entry.expiresAt) {
        store.delete(key);
        return undefined;
      }

      return entry.value;
    },

    set(key: string, value: V): void {
      const expiresAt = now() + ttlMs;
      store.set(key, { value, expiresAt });
    },

    delete(key: string): boolean {
      return store.delete(key);
    },

    clear(): void {
      store.clear();
    },
  };
}
