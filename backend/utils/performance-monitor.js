/**
 * Performance Monitor - Track API performance metrics
 * Monitors response times, endpoint latencies, and error rates
 */

const logger = require('./logger');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      totalErrors: 0,
      requestsByEndpoint: {},
      responseTimesByEndpoint: {},
      errorsByEndpoint: {},
      startTime: Date.now(),
      lastReset: Date.now()
    };
  }

  /**
   * Record request start
   */
  startRequest(endpoint) {
    return {
      endpoint,
      startTime: Date.now(),
      startMemory: process.memoryUsage().heapUsed
    };
  }

  /**
   * Record request completion
   */
  recordRequest(context, statusCode = 200) {
    const duration = Date.now() - context.startTime;
    const memoryDelta = process.memoryUsage().heapUsed - context.startMemory;
    const endpoint = context.endpoint;

    // Update totals
    this.metrics.totalRequests++;
    if (statusCode >= 400) this.metrics.totalErrors++;

    // Initialize endpoint metrics if needed
    if (!this.metrics.requestsByEndpoint[endpoint]) {
      this.metrics.requestsByEndpoint[endpoint] = {
        count: 0,
        errors: 0,
        avgTime: 0,
        minTime: Infinity,
        maxTime: 0,
        lastTime: 0
      };
      this.metrics.responseTimesByEndpoint[endpoint] = [];
      this.metrics.errorsByEndpoint[endpoint] = [];
    }

    const endpointMetrics = this.metrics.requestsByEndpoint[endpoint];
    
    // Update endpoint metrics
    endpointMetrics.count++;
    endpointMetrics.lastTime = duration;
    endpointMetrics.minTime = Math.min(endpointMetrics.minTime, duration);
    endpointMetrics.maxTime = Math.max(endpointMetrics.maxTime, duration);
    
    // Update average (rolling average)
    endpointMetrics.avgTime = 
      (endpointMetrics.avgTime * (endpointMetrics.count - 1) + duration) / endpointMetrics.count;

    if (statusCode >= 400) {
      endpointMetrics.errors++;
    }

    // Keep last 100 response times per endpoint
    this.metrics.responseTimesByEndpoint[endpoint].push({
      timestamp: context.startTime,
      duration,
      statusCode,
      memoryDelta
    });
    
    if (this.metrics.responseTimesByEndpoint[endpoint].length > 100) {
      this.metrics.responseTimesByEndpoint[endpoint].shift();
    }

    // Log slow requests (> 1s)
    if (duration > 1000) {
      logger.warn(`Slow request detected: ${endpoint} took ${duration}ms`, {
        endpoint,
        duration,
        statusCode,
        memoryDelta
      });
    }

    return { duration, statusCode, memoryDelta };
  }

  /**
   * Get metrics summary
   */
  getMetrics() {
    const uptime = Date.now() - this.metrics.startTime;
    const summary = {};

    // Calculate summary for each endpoint
    for (const [endpoint, metrics] of Object.entries(this.metrics.requestsByEndpoint)) {
      const errorRate = metrics.count > 0 ? (metrics.errors / metrics.count * 100).toFixed(2) : 0;
      
      summary[endpoint] = {
        requests: metrics.count,
        errors: metrics.errors,
        errorRate: `${errorRate}%`,
        avgTime: Math.round(metrics.avgTime),
        minTime: metrics.minTime,
        maxTime: metrics.maxTime,
        lastTime: metrics.lastTime
      };
    }

    return {
      uptime: Math.floor(uptime / 1000),
      totalRequests: this.metrics.totalRequests,
      totalErrors: this.metrics.totalErrors,
      errorRate: this.metrics.totalRequests > 0 
        ? (this.metrics.totalErrors / this.metrics.totalRequests * 100).toFixed(2) 
        : 0,
      requestsPerSecond: (this.metrics.totalRequests / (uptime / 1000)).toFixed(2),
      endpoints: summary
    };
  }

  /**
   * Get detailed endpoint metrics
   */
  getEndpointMetrics(endpoint) {
    if (!this.metrics.responseTimesByEndpoint[endpoint]) {
      return null;
    }

    const times = this.metrics.responseTimesByEndpoint[endpoint];
    const statusCodes = times.map(t => t.statusCode);
    
    return {
      endpoint,
      samples: times.length,
      recent: times.slice(-10),
      statusCodeDistribution: statusCodes.reduce((acc, code) => {
        acc[code] = (acc[code] || 0) + 1;
        return acc;
      }, {}),
      p50: this._percentile(times.map(t => t.duration), 0.5),
      p95: this._percentile(times.map(t => t.duration), 0.95),
      p99: this._percentile(times.map(t => t.duration), 0.99)
    };
  }

  /**
   * Calculate percentile
   */
  _percentile(values, p) {
    if (values.length === 0) return 0;
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Reset metrics
   */
  reset() {
    logger.info('Performance metrics reset');
    this.metrics = {
      totalRequests: 0,
      totalErrors: 0,
      requestsByEndpoint: {},
      responseTimesByEndpoint: {},
      errorsByEndpoint: {},
      startTime: Date.now(),
      lastReset: Date.now()
    };
  }

  /**
   * Health check - returns status and recommendations
   */
  getHealthStatus() {
    const metrics = this.getMetrics();
    const errorRate = parseFloat(metrics.errorRate);
    const avgResponseTime = Object.values(metrics.endpoints).reduce((sum, e) => sum + e.avgTime, 0) / 
                             Object.keys(metrics.endpoints).length || 0;

    return {
      status: errorRate > 10 ? 'warning' : errorRate > 5 ? 'caution' : 'healthy',
      errorRate,
      avgResponseTime,
      recommendations: [
        ...(errorRate > 10 ? ['High error rate detected - check logs'] : []),
        ...(avgResponseTime > 500 ? ['Slow response times - optimize database queries'] : []),
        ...(metrics.totalRequests === 0 ? ['No requests recorded yet'] : [])
      ]
    };
  }
}

module.exports = PerformanceMonitor;
