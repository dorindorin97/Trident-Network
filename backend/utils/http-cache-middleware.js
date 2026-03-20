/**
 * HTTP Cache Control Middleware
 * Provides smart caching headers with ETag support and conditional request handling
 * Reduces bandwidth and improves performance for stable data
 */

const crypto = require('crypto');
const ResponseCache = require('./response-cache');

class HttpCacheMiddleware {
  constructor() {
    this.cache = new ResponseCache();
  }

  /**
   * Generate ETag from response data
   * @param {*} data - Response data to hash
   * @returns {string} ETag header value
   */
  generateETag(data) {
    const hash = crypto.createHash('md5');
    hash.update(JSON.stringify(data));
    return `"${hash.digest('hex')}"`;
  }

  /**
   * Create caching middleware for a specific route
   * @param {number} ttl - Cache time-to-live in seconds
   * @param {string} cacheKey - Optional custom cache key generator
   * @returns {Function} Express middleware
   */
  cacheMiddleware(ttl = 300, cacheKey = null) {
    return async (req, res, next) => {
      // Store original send bound to res so Express internals work correctly
      const originalSend = res.send.bind(res);

      // Arrow function keeps `this` as HttpCacheMiddleware via lexical scope;
      // `res` and `originalSend` are captured from the enclosing closure.
      res.send = (data) => {
        if (res.statusCode === 200) {
          const key = cacheKey ? cacheKey(req) : `${req.method}:${req.originalUrl}`;
          const etag = this.generateETag(data);

          // Set cache headers
          res.set('Cache-Control', `public, max-age=${ttl}, stale-while-revalidate=${ttl}`);
          res.set('ETag', etag);

          // ResponseCache.set expects ttl in milliseconds, not an options object
          this.cache.set(key, data, ttl * 1000);
        }

        return originalSend(data);
      };

      next();
    };
  }

  /**
   * Handle conditional GET requests with ETag
   * @param {string} cacheKey - Cache key to check
   * @returns {Function} Express middleware
   */
  conditionalGetMiddleware(cacheKey) {
    return (req, res, next) => {
      if (req.method === 'GET' || req.method === 'HEAD') {
        const ifNoneMatch = req.get('If-None-Match');
        
        if (ifNoneMatch) {
          const key = cacheKey(req);
          const cached = this.cache.get(key);

          // etagMatches(cacheKey, incomingETag) — key first, ETag second
          if (cached && this.cache.etagMatches(key, ifNoneMatch)) {
            return res.status(304).send();
          }
        }
      }

      next();
    };
  }

  /**
   * Invalidate specific cache entry
   * @param {string} key - Cache key to invalidate
   */
  invalidate(key) {
    this.cache.invalidate(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getStats() {
    return this.cache.getStats();
  }
}

module.exports = new HttpCacheMiddleware();
