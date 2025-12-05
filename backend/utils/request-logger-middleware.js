/**
 * Request Logging Middleware
 * Tracks request metrics including duration, response size, and error rates
 * Provides insights for performance optimization and monitoring
 */

const logger = require('./logger');

class RequestLogger {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      totalErrors: 0,
      totalDuration: 0,
      totalBytes: 0,
      byEndpoint: {},
      byStatusCode: {}
    };
  }

  /**
   * Create request logging middleware
   * @param {boolean} verbose - Log every request (default: false, only errors)
   * @returns {Function} Express middleware
   */
  middleware(verbose = false) {
    return (req, res, next) => {
      const startTime = Date.now();
      const startMemory = process.memoryUsage().heapUsed;

      // Store original send
      const originalSend = res.send;

      res.send = function(data) {
        const duration = Date.now() - startTime;
        const memoryDelta = process.memoryUsage().heapUsed - startMemory;
        const responseSize = JSON.stringify(data).length;

        // Update global metrics
        this.updateMetrics(req, res, duration, responseSize, memoryDelta);

        // Log if verbose or error
        if (verbose || res.statusCode >= 400) {
          this.logRequest(req, res, duration, responseSize, memoryDelta);
        }

        return originalSend.call(this, data);
      }.bind(this);

      next();
    };
  }

  /**
   * Update internal metrics
   * @private
   */
  updateMetrics(req, res, duration, bytes, memory) {
    const endpoint = `${req.method}:${req.baseUrl}`;
    const statusCode = res.statusCode;

    this.metrics.totalRequests++;
    this.metrics.totalDuration += duration;
    this.metrics.totalBytes += bytes;
    this.metrics.totalMemory = (this.metrics.totalMemory || 0) + memory;

    if (statusCode >= 400) {
      this.metrics.totalErrors++;
    }

    // Track by endpoint
    if (!this.metrics.byEndpoint[endpoint]) {
      this.metrics.byEndpoint[endpoint] = {
        count: 0,
        errors: 0,
        avgDuration: 0,
        maxDuration: 0,
        minDuration: Infinity
      };
    }

    const endpointMetrics = this.metrics.byEndpoint[endpoint];
    endpointMetrics.count++;
    endpointMetrics.avgDuration = (endpointMetrics.avgDuration * (endpointMetrics.count - 1) + duration) / endpointMetrics.count;
    endpointMetrics.maxDuration = Math.max(endpointMetrics.maxDuration, duration);
    endpointMetrics.minDuration = Math.min(endpointMetrics.minDuration, duration);

    if (statusCode >= 400) {
      endpointMetrics.errors++;
    }

    // Track by status code
    if (!this.metrics.byStatusCode[statusCode]) {
      this.metrics.byStatusCode[statusCode] = 0;
    }
    this.metrics.byStatusCode[statusCode]++;
  }

  /**
   * Log request details
   * @private
   */
  logRequest(req, res, duration, bytes, memory) {
    const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel](`${req.method} ${req.originalUrl}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      bytes: bytes,
      memory: `${Math.round(memory / 1024)}KB`,
      ip: req.ip,
      userAgent: req.get('user-agent')?.substring(0, 50),
      requestId: req.id,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get current metrics
   * @returns {object} Collected metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      avgDuration: this.metrics.totalRequests > 0 ? this.metrics.totalDuration / this.metrics.totalRequests : 0,
      avgBytes: this.metrics.totalRequests > 0 ? this.metrics.totalBytes / this.metrics.totalRequests : 0,
      avgMemory: this.metrics.totalRequests > 0 ? this.metrics.totalMemory / this.metrics.totalRequests : 0,
      errorRate: this.metrics.totalRequests > 0 ? (this.metrics.totalErrors / this.metrics.totalRequests * 100).toFixed(2) : 0
    };
  }

  /**
   * Get metrics for specific endpoint
   * @param {string} endpoint - Endpoint path
   * @returns {object} Endpoint metrics
   */
  getEndpointMetrics(endpoint) {
    return this.metrics.byEndpoint[endpoint] || null;
  }

  /**
   * Reset metrics (useful for testing)
   */
  reset() {
    this.metrics = {
      totalRequests: 0,
      totalErrors: 0,
      totalDuration: 0,
      totalBytes: 0,
      byEndpoint: {},
      byStatusCode: {}
    };
  }
}

module.exports = new RequestLogger();
