// Simple in-memory cache with TTL
class SimpleCache {
  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.cleanupIntervalId = null;
    this.maxSize = maxSize;
    this.hits = 0;
    this.misses = 0;
  }

  set(key, value, ttlMs = 5000) {
    // Check if we need to evict entries
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // Simple LRU: remove the oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { value, expiry });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      this.misses++;
      return null;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }
    
    this.hits++;
    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  /**
   * Clean up expired entries periodically
   * @param {number} intervalMs - Cleanup interval in milliseconds
   * @returns {NodeJS.Timeout} The interval ID for cleanup
   */
  startCleanup(intervalMs = 60000) {
    // Clear any existing cleanup interval
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
    }
    
    const logger = require('./logger');
    
    this.cleanupIntervalId = setInterval(() => {
      const now = Date.now();
      let deletedCount = 0;
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiry) {
          this.cache.delete(key);
          deletedCount++;
        }
      }
      if (deletedCount > 0) {
        logger.debug('Cache cleanup completed', { deletedCount, remainingEntries: this.cache.size });
      }
    }, intervalMs);
    
    // Return the interval ID so it can be cleared on shutdown
    return this.cleanupIntervalId;
  }

  /**
   * Stop the cleanup interval
   */
  stopCleanup() {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
  }

  /**
   * Get cache statistics
   * @returns {object} Cache statistics
   */
  getStats() {
    const now = Date.now();
    let activeCount = 0;
    let expiredCount = 0;
    
    for (const item of this.cache.values()) {
      if (now > item.expiry) {
        expiredCount++;
      } else {
        activeCount++;
      }
    }
    
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? ((this.hits / totalRequests) * 100).toFixed(2) : 0;
    
    return {
      total: this.cache.size,
      active: activeCount,
      expired: expiredCount,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: `${hitRate}%`
    };
  }
}

module.exports = SimpleCache;
