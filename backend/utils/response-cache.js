/**
 * Advanced response caching layer with ETag support and conditional requests
 * Handles smart cache busting and stale-while-revalidate patterns
 */

const crypto = require('crypto');

class ResponseCache {
  constructor() {
    this.cache = new Map();
    this.etags = new Map();
    this.timestamps = new Map();
  }

  /**
   * Generate ETag from data
   */
  generateETag(data) {
    const str = JSON.stringify(data);
    return crypto.createHash('md5').update(str).digest('hex');
  }

  /**
   * Store response with ETag
   */
  set(key, data, ttlMs = 30000) {
    const etag = this.generateETag(data);
    const now = Date.now();
    const expiry = now + ttlMs;

    this.cache.set(key, {
      data,
      etag,
      timestamp: now,
      expiry,
      staleAfter: now + (ttlMs * 0.8) // Mark stale at 80% of TTL
    });

    this.etags.set(key, etag);
    this.timestamps.set(key, now);
  }

  /**
   * Get cached response
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();

    // Expired - remove and return null
    if (now > item.expiry) {
      this.cache.delete(key);
      this.etags.delete(key);
      this.timestamps.delete(key);
      return null;
    }

    // Return with stale flag
    return {
      data: item.data,
      etag: item.etag,
      isStale: now > item.staleAfter,
      age: now - item.timestamp
    };
  }

  /**
   * Check if ETag matches (for 304 Not Modified)
   */
  etagMatches(key, incomingETag) {
    const stored = this.etags.get(key);
    return stored && stored === incomingETag;
  }

  /**
   * Clear cache by pattern
   */
  invalidate(pattern) {
    if (typeof pattern === 'string') {
      pattern = new RegExp(pattern);
    }

    let count = 0;
    for (const [key] of this.cache.entries()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        this.etags.delete(key);
        this.timestamps.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Invalidate all cache
   */
  clear() {
    this.cache.clear();
    this.etags.clear();
    this.timestamps.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const stats = {
      entries: this.cache.size,
      etagCount: this.etags.size,
      timeStampCount: this.timestamps.size
    };

    // Calculate approximate memory usage
    let memUsage = 0;
    for (const [key, item] of this.cache.entries()) {
      memUsage += key.length + JSON.stringify(item.data).length;
    }

    stats.estimatedMemoryUsage = memUsage;
    return stats;
  }
}

module.exports = ResponseCache;
