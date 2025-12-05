/**
 * Simple in-memory cache with TTL and smart invalidation
 *
 * This module provides application-level caching for RPC responses and data retrieval.
 * It uses LRU eviction when the cache reaches max capacity.
 *
 * Separate from HttpCacheMiddleware which handles HTTP-level caching headers and ETags.
 *
 * Usage:
 * - Cache RPC responses with different TTLs based on data freshness requirements
 * - Use invalidatePattern() to bust cache on data mutations
 * - Monitor cache stats via getStats() for performance optimization
 */
class SimpleCache {
  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.accessOrder = new Map(); // For LRU tracking
    this.cleanupIntervalId = null;
    this.maxSize = maxSize;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  set(key, value, ttlMs = 5000) {
    // Check if we need to evict entries
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }
    
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { value, expiry, lastAccessed: Date.now() });
    this.accessOrder.set(key, Date.now());
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      this.misses++;
      return null;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      this.misses++;
      return null;
    }
    
    // Update access time for LRU
    item.lastAccessed = Date.now();
    this.accessOrder.set(key, Date.now());
    this.hits++;
    return item.value;
  }

  /**
   * Evict least recently used entry
   */
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, time] of this.accessOrder.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
      this.evictions++;
    }
  }

  /**
   * Invalidate cache entries by pattern
   * @param {RegExp|string} pattern - Pattern to match keys
   */
  invalidatePattern(pattern) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.accessOrder.delete(key);
    });
    
    return keysToDelete.length;
  }

  /**
   * Warm cache with commonly requested data
   * @param {Array} entries - Array of {key, value, ttl} objects
   */
  warm(entries) {
    entries.forEach(({ key, value, ttl }) => {
      this.set(key, value, ttl || 5000);
    });
  }

  clear() {
    this.cache.clear();
    this.accessOrder.clear();
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
      size: this.cache.size,
      active: activeCount,
      expired: expiredCount,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRate: parseFloat(hitRate)
    };
  }
}

module.exports = SimpleCache;
