// Simple in-memory cache with TTL
class SimpleCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, ttlMs = 5000) {
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { value, expiry });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  // Clean up expired entries periodically
  startCleanup(intervalMs = 60000) {
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiry) {
          this.cache.delete(key);
        }
      }
    }, intervalMs);
  }
}

module.exports = SimpleCache;
