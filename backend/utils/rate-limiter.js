/**
 * Rate Limiting Configuration Manager
 * Provides configurable rate limits for different endpoints and users
 */

const rateLimit = require('express-rate-limit');
const logger = require('./logger');

/**
 * Create rate limiter with custom configuration
 */
function createRateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100,
    message = 'Too many requests, please try again later',
    statusCode = 429,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req) => req.ip,
    store = null
  } = options;

  const limiter = rateLimit({
    windowMs,
    max,
    message: { error: message, retryAfter: Math.ceil(windowMs / 1000) },
    statusCode,
    skipSuccessfulRequests,
    skipFailedRequests,
    keyGenerator,
    store,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        limit: max,
        windowMs
      });
      res.status(statusCode).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });

  return limiter;
}

/**
 * Predefined rate limit configurations
 */
const limitConfigs = {
  // Strict limits for authentication endpoints
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts, please try again later'
  }),

  // Standard API rate limit
  standard: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100
  }),

  // Loose limit for public endpoints
  public: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000
  }),

  // Strict limit for expensive operations
  expensive: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: 'Rate limit exceeded for this resource'
  }),

  // WebSocket connections
  websocket: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 connections per hour
    skipFailedRequests: true
  })
};

/**
 * Create custom rate limiter for specific endpoints
 */
function createCustomLimiter(config) {
  const {
    name = 'custom',
    windowMs = 15 * 60 * 1000,
    max = 100,
    keyGenerator = (req) => req.ip,
    message = 'Rate limit exceeded'
  } = config;

  logger.debug(`Creating rate limiter: ${name}`, { windowMs, max });

  return createRateLimiter({
    windowMs,
    max,
    keyGenerator,
    message
  });
}

/**
 * Rate limit by user/API key instead of IP
 */
function createKeyBasedLimiter(options = {}) {
  const {
    windowMs = 60 * 60 * 1000,
    max = 1000,
    message = 'API rate limit exceeded'
  } = options;

  return createRateLimiter({
    windowMs,
    max,
    keyGenerator: (req) => {
      // Use API key if present, otherwise use IP
      return req.headers['x-api-key'] || req.ip;
    },
    message,
    handler: (req, res) => {
      const identifier = req.headers['x-api-key'] || req.ip;
      logger.warn('API rate limit exceeded', {
        identifier,
        isApiKey: !!req.headers['x-api-key'],
        path: req.path
      });
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
}

/**
 * Create tiered rate limiting (different limits for different tiers)
 */
function createTieredLimiter(userTierResolver, tierLimits = {}) {
  const defaults = {
    free: { windowMs: 60 * 60 * 1000, max: 100 },
    pro: { windowMs: 60 * 60 * 1000, max: 10000 },
    enterprise: { windowMs: 60 * 60 * 1000, max: 1000000 },
    ...tierLimits
  };

  return (req, res, next) => {
    try {
      const tier = userTierResolver(req) || 'free';
      const tierConfig = defaults[tier];

      if (!tierConfig) {
        logger.warn(`Unknown tier: ${tier}`);
        return next();
      }

      const limiter = createRateLimiter({
        windowMs: tierConfig.windowMs,
        max: tierConfig.max,
        message: `Rate limit exceeded for ${tier} tier`
      });

      limiter(req, res, next);
    } catch (err) {
      logger.error('Tiered limiter error', { error: err.message });
      next();
    }
  };
}

/**
 * Adaptive rate limiting - adjusts based on server load
 */
class AdaptiveRateLimiter {
  constructor(baseConfig = {}) {
    this.baseConfig = {
      windowMs: 15 * 60 * 1000,
      max: 100,
      ...baseConfig
    };

    this.cpuThreshold = 0.8;
    this.memoryThreshold = 0.85;
    this.currentLimit = this.baseConfig.max;
    this.limiter = createRateLimiter(this.baseConfig);

    // Monitor system load every 30 seconds
    this.monitor();
  }

  monitor() {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const memPercent = memUsage.heapUsed / memUsage.heapTotal;

      if (memPercent > this.memoryThreshold) {
        // Reduce limit to 50% during high memory usage
        this.currentLimit = Math.floor(this.baseConfig.max * 0.5);
        logger.warn('Adaptive rate limit reduced due to high memory usage', {
          memoryPercent: (memPercent * 100).toFixed(2),
          newLimit: this.currentLimit
        });
      } else if (memPercent < 0.6) {
        // Restore limit when memory usage is normal
        this.currentLimit = this.baseConfig.max;
      }
    }, 30000); // Check every 30 seconds
  }

  middleware() {
    return (req, res, next) => {
      // Create a new limiter with current limit if it changed
      if (this.limiter.options.max !== this.currentLimit) {
        this.limiter = createRateLimiter({
          ...this.baseConfig,
          max: this.currentLimit
        });
      }

      this.limiter(req, res, next);
    };
  }
}

module.exports = {
  createRateLimiter,
  createCustomLimiter,
  createKeyBasedLimiter,
  createTieredLimiter,
  AdaptiveRateLimiter,
  limitConfigs
};
