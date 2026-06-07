// In-Memory LRU Cache with TTL + Stale-While-Revalidate

class MemoryCache {
  constructor(maxSize = 500, defaultTTL = 30000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.store = new Map();
    this.accessOrder = [];
  }

  // Get a cached value. Returns null if not found or expired.
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      // If within stale window, return stale + trigger background refresh
      if (Date.now() < entry.staleUntil) {
        this._touch(key);
        return { value: entry.value, stale: true };
      }
      this.store.delete(key);
      return null;
    }

    this._touch(key);
    return { value: entry.value, stale: false };
  }

  // Set a value in the cache.
  set(key, value, ttl = this.defaultTTL, staleWindow = null) {
    // Evict oldest if at capacity
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      const oldest = this.accessOrder.shift();
      if (oldest) this.store.delete(oldest);
    }

    const now = Date.now();
    this.store.set(key, {
      value,
      expiresAt: now + ttl,
      staleUntil: now + (staleWindow || ttl * 2),
    });

    this._touch(key);
  }

  // Delete a key from cache (for invalidation).
  delete(key) {
    this.store.delete(key);
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
  }

  // Invalidate all keys matching a prefix.
  invalidatePrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.delete(key);
      }
    }
  }

  // Clear entire cache
  clear() {
    this.store.clear();
    this.accessOrder = [];
  }

  // Get cache stats
  stats() {
    return {
      size: this.store.size,
      maxSize: this.maxSize,
      keys: [...this.store.keys()],
    };
  }

  // Move key to end of access order (most recently used)
  _touch(key) {
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
    this.accessOrder.push(key);
  }
}

// Global cache instances
const globalCache = globalThis.__buddyCache || new MemoryCache(500, 30000);
if (process.env.NODE_ENV !== "production")
  globalThis.__buddyCache = globalCache;

export default globalCache;
