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
      // Store original send method
      const originalSend = res.send;

      // Override send to intercept response
      res.send = function(data) {
        if (res.statusCode === 200) {
          const key = cacheKey ? cacheKey(req) : `${req.method}:${req.originalUrl}`;
          const etag = this.generateETag(data);

          // Set cache headers
          res.set('Cache-Control', `public, max-age=${ttl}, stale-while-revalidate=${ttl}`);
          res.set('ETag', etag);

          // Store in cache
          this.cache.set(key, data, { etag, ttl });
        }

        // Call original send
        return originalSend.call(this, data);
      }.bind(this);

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
          const cached = this.cache.get(cacheKey(req));
          
          if (cached && this.cache.etagMatches(ifNoneMatch, cached)) {
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
