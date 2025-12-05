/**
 * Performance monitoring and metrics collection
 * Tracks API response times, component render times, and memory usage
 */

class PerformanceMonitor {
  constructor(enableLocalStorage = true) {
    this.metrics = new Map();
    this.enableLocalStorage = enableLocalStorage;
    this.sessionStart = Date.now();
  }

  /**
   * Record API request metrics
   */
  recordApiCall(endpoint, duration, status, size = 0) {
    const key = `api:${endpoint}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        endpoint,
        calls: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        errors: 0,
        totalSize: 0,
        statusCodes: {}
      });
    }

    const metric = this.metrics.get(key);
    metric.calls++;
    metric.totalDuration += duration;
    metric.minDuration = Math.min(metric.minDuration, duration);
    metric.maxDuration = Math.max(metric.maxDuration, duration);
    metric.totalSize += size;
    metric.statusCodes[status] = (metric.statusCodes[status] || 0) + 1;

    if (status >= 400) {
      metric.errors++;
    }

    return metric;
  }

  /**
   * Record component render time
   */
  recordComponentRender(componentName, duration) {
    const key = `component:${componentName}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        component: componentName,
        renders: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        slowRenders: 0 // > 16.67ms (60fps threshold)
      });
    }

    const metric = this.metrics.get(key);
    metric.renders++;
    metric.totalDuration += duration;
    metric.minDuration = Math.min(metric.minDuration, duration);
    metric.maxDuration = Math.max(metric.maxDuration, duration);

    if (duration > 16.67) {
      metric.slowRenders++;
    }

    return metric;
  }

  /**
   * Get metric statistics
   */
  getMetrics(type = 'all') {
    const result = {};

    for (const [key, metric] of this.metrics.entries()) {
      if (type === 'all' || key.startsWith(type)) {
        result[key] = {
          ...metric,
          avgDuration: metric.totalDuration / (metric.calls || metric.renders || 1),
          callsPerSecond: metric.calls ? (metric.calls / ((Date.now() - this.sessionStart) / 1000)).toFixed(2) : undefined
        };
      }
    }

    return result;
  }

  /**
   * Get performance score (0-100)
   */
  getPerformanceScore() {
    let score = 100;

    for (const [, metric] of this.metrics.entries()) {
      const avgDuration = metric.totalDuration / (metric.calls || metric.renders || 1);
      
      // Penalize slow API calls
      if (metric.endpoint && avgDuration > 1000) {
        score -= 10;
      } else if (metric.endpoint && avgDuration > 500) {
        score -= 5;
      }

      // Penalize slow components
      if (metric.component && metric.slowRenders > 5) {
        score -= (metric.slowRenders * 2);
      }

      // Penalize errors
      if (metric.errors && metric.errors > 0) {
        score -= (metric.errors * 2);
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get memory usage if available
   */
  getMemoryUsage() {
    if (!performance.memory) {
      return null;
    }

    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(performance.memory.totalJSHeapSize / 1048576),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576),
      percentage: Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100)
    };
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
    this.sessionStart = Date.now();
  }

  /**
   * Export metrics as JSON
   */
  export() {
    return {
      timestamp: new Date().toISOString(),
      sessionDuration: Date.now() - this.sessionStart,
      metrics: this.getMetrics(),
      performanceScore: this.getPerformanceScore(),
      memory: this.getMemoryUsage()
    };
  }

  /**
   * Get summary report
   */
  getSummary() {
    const metrics = this.getMetrics();
    const memory = this.getMemoryUsage();
    
    const apiMetrics = Object.entries(metrics)
      .filter(([key]) => key.startsWith('api:'))
      .reduce((acc, [, metric]) => {
        acc.push({
          endpoint: metric.endpoint,
          calls: metric.calls,
          avgDuration: metric.avgDuration.toFixed(0),
          errors: metric.errors,
          successRate: (((metric.calls - metric.errors) / metric.calls) * 100).toFixed(0)
        });
        return acc;
      }, [])
      .sort((a, b) => b.avgDuration - a.avgDuration);

    const componentMetrics = Object.entries(metrics)
      .filter(([key]) => key.startsWith('component:'))
      .reduce((acc, [, metric]) => {
        acc.push({
          component: metric.component,
          renders: metric.renders,
          avgDuration: metric.avgDuration.toFixed(2),
          slowRenders: metric.slowRenders
        });
        return acc;
      }, [])
      .sort((a, b) => b.avgDuration - a.avgDuration);

    return {
      performanceScore: this.getPerformanceScore(),
      memory,
      sessionDuration: Math.round((Date.now() - this.sessionStart) / 1000),
      apiMetrics: apiMetrics.slice(0, 10),
      componentMetrics: componentMetrics.slice(0, 10),
      slowestApi: apiMetrics[0],
      slowestComponent: componentMetrics[0]
    };
  }
}

// Create global instance
const performanceMonitor = typeof window !== 'undefined' ? new PerformanceMonitor() : null;

export default performanceMonitor;
export { PerformanceMonitor };
