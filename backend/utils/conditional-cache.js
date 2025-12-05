/**
 * Conditional Caching Decorator
 * Higher-order function to conditionally apply caching based on query parameters
 * Allows users to opt-out of caching when needed for real-time data
 */

const ResponseCache = require('./response-cache');

class ConditionalCacheDecorator {
  constructor() {
    this.cache = new ResponseCache();
  }

  /**
   * Create a cached endpoint handler
   * Automatically handles cache busting via query params
   * 
   * @param {Function} handler - Original route handler
   * @param {object} options - Configuration options
   * @param {number} options.ttl - Cache TTL in seconds (default: 300)
   * @param {Function} options.cacheKeyGenerator - Function to generate cache key (default: URL)
   * @param {Array<string>} options.cacheableParams - Query params to include in cache key
   * @returns {Function} Wrapped handler with caching
   */
  wrap(handler, options = {}) {
    const {
      ttl = 300,
      cacheKeyGenerator = (req) => `${req.method}:${req.originalUrl}`,
      cacheableParams = [],
      shouldCache = (req) => true
    } = options;

    return async (req, res, next) => {
      // Check if caching is disabled via query param
      const noCache = req.query.noCache === 'true' || req.query.nocache === 'true';
      const bypassCache = req.query.bypassCache === 'true';

      // Generate cache key
      const cacheKey = cacheKeyGenerator(req);

      // Check cache if not bypassed and should cache
      if (!noCache && !bypassCache && shouldCache(req)) {
        const cached = this.cache.get(cacheKey);

        if (cached) {
          res.set('X-Cache', 'HIT');
          res.set('X-Cache-TTL', ttl);
          return res.json(cached);
        }
      }

      // Store original send to intercept response
      const originalSend = res.json;

      res.json = function(data) {
        if (res.statusCode === 200 && !noCache && shouldCache(req)) {
          // Cache the response
          this.cache.set(cacheKey, data, { ttl });
          res.set('X-Cache', 'MISS');
          res.set('X-Cache-TTL', ttl);
        } else {
          res.set('X-Cache', 'BYPASS');
        }

        return originalSend.call(this, data);
      }.bind(this);

      try {
        // Call original handler
        await handler(req, res, next);
      } catch (error) {
        // Don't cache errors
        res.set('X-Cache', 'ERROR');
        next(error);
      }
    };
  }

  /**
   * Create a cache-busting middleware
   * Invalidates cache based on patterns in request
   * 
   * @param {string} pattern - URL pattern to invalidate (e.g., '/api/validators')
   * @returns {Function} Express middleware
   */
  invalidatePattern(pattern) {
    return (req, res, next) => {
      // Invalidate matching cache entries on POST/PUT/DELETE
      if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        const keys = Object.keys(this.cache.cache || {});
        keys.forEach(key => {
          if (key.includes(pattern)) {
            this.cache.invalidate(key);
          }
        });
      }

      next();
    };
  }

  /**
   * Invalidate cache by pattern
   * @param {string|RegExp} pattern - Pattern to match
   */
  clearPattern(pattern) {
    const keys = Object.keys(this.cache.cache || {});
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    keys.forEach(key => {
      if (regex.test(key)) {
        this.cache.invalidate(key);
      }
    });
  }

  /**
   * Clear all cached data
   */
  clearAll() {
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

module.exports = new ConditionalCacheDecorator();
