// Centralized Error Tracking Utility
// Captures, logs, and reports errors with context

class ErrorTracker {
  constructor(config = {}) {
    this.enabled = config.enabled !== false;
    this.environment = config.environment || process.env.NODE_ENV || 'development';
    this.appVersion = config.appVersion || '1.1.0';
    this.maxStackDepth = config.maxStackDepth || 10;
    this.errorBuffer = [];
    this.maxBufferSize = config.maxBufferSize || 100;
    this.listeners = [];
  }

  // Capture and log error with full context
  captureError(error, context = {}) {
    if (!this.enabled) return;

    const errorData = this._buildErrorData(error, context);
    this._logError(errorData);
    this._bufferError(errorData);
    this._notifyListeners(errorData);

    return errorData;
  }

  // Capture exception with stack trace
  captureException(error, context = {}) {
    return this.captureError(error, { ...context, type: 'exception' });
  }

  // Capture message (non-error logging)
  captureMessage(message, level = 'info', context = {}) {
    if (!this.enabled) return;

    const errorData = {
      message,
      level,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      appVersion: this.appVersion,
      context,
      type: 'message'
    };

    this._logError(errorData);
    this._bufferError(errorData);
    this._notifyListeners(errorData);

    return errorData;
  }

  // Build comprehensive error data object
  _buildErrorData(error, context) {
    const isError = error instanceof Error;
    
    return {
      message: isError ? error.message : String(error),
      type: context.type || 'error',
      level: context.level || 'error',
      timestamp: new Date().toISOString(),
      environment: this.environment,
      appVersion: this.appVersion,
      
      // Error details
      stack: isError ? this._parseStack(error.stack) : null,
      name: isError ? error.name : 'UnknownError',
      code: error.code || null,
      
      // Context information
      context: {
        ...context,
        url: typeof window !== 'undefined' ? window.location?.href : null,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        timestamp: Date.now()
      },
      
      // Performance data
      performance: this._getPerformanceData(),
      
      // User information (if available)
      user: context.user || null,
      
      // Additional metadata
      metadata: {
        errorId: this._generateErrorId(),
        sessionId: this._getSessionId()
      }
    };
  }

  // Parse and clean stack trace
  _parseStack(stack) {
    if (!stack) return null;

    const lines = stack.split('\n').slice(0, this.maxStackDepth);
    return lines.map(line => {
      // Extract file, line, column information
      const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
      if (match) {
        return {
          function: match[1],
          file: match[2],
          line: parseInt(match[3], 10),
          column: parseInt(match[4], 10)
        };
      }
      return { raw: line.trim() };
    });
  }

  // Get performance metrics
  _getPerformanceData() {
    if (typeof window === 'undefined' || !window.performance) {
      return null;
    }

    const perf = window.performance;
    const memory = perf.memory;
    const navigation = perf.navigation;

    return {
      memory: memory ? {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      } : null,
      navigation: navigation ? {
        type: navigation.type,
        redirectCount: navigation.redirectCount
      } : null,
      timing: {
        loadTime: perf.timing.loadEventEnd - perf.timing.navigationStart,
        domReady: perf.timing.domContentLoadedEventEnd - perf.timing.navigationStart,
        responseTime: perf.timing.responseEnd - perf.timing.requestStart
      }
    };
  }

  // Generate unique error ID
  _generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get or create session ID
  _getSessionId() {
    if (typeof window === 'undefined') return null;
    
    let sessionId = sessionStorage.getItem('error_tracker_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('error_tracker_session_id', sessionId);
    }
    return sessionId;
  }

  // Log error to console with formatting
  _logError(errorData) {
    const { level, message, context, stack } = errorData;
    
    const styles = {
      error: 'color: #ef4444; font-weight: bold;',
      warn: 'color: #f59e0b; font-weight: bold;',
      info: 'color: #3b82f6; font-weight: bold;'
    };

    if (typeof console !== 'undefined') {
      console.group(`%c[${level.toUpperCase()}] ${message}`, styles[level] || styles.info);
      console.log('Context:', context);
      if (stack) console.log('Stack:', stack);
      console.log('Metadata:', errorData.metadata);
      console.groupEnd();
    }
  }

  // Buffer errors for later analysis
  _bufferError(errorData) {
    this.errorBuffer.push(errorData);
    
    // Maintain buffer size limit
    if (this.errorBuffer.length > this.maxBufferSize) {
      this.errorBuffer.shift();
    }
  }

  // Notify registered listeners
  _notifyListeners(errorData) {
    this.listeners.forEach(listener => {
      try {
        listener(errorData);
      } catch (err) {
        console.error('Error in error tracker listener:', err);
      }
    });
  }

  // Add error listener
  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  // Remove error listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  // Get buffered errors
  getErrors(filters = {}) {
    let errors = [...this.errorBuffer];

    if (filters.level) {
      errors = errors.filter(e => e.level === filters.level);
    }

    if (filters.since) {
      const sinceTime = new Date(filters.since).getTime();
      errors = errors.filter(e => new Date(e.timestamp).getTime() >= sinceTime);
    }

    if (filters.type) {
      errors = errors.filter(e => e.type === filters.type);
    }

    return errors;
  }

  // Clear error buffer
  clearErrors() {
    this.errorBuffer = [];
  }

  // Get error statistics
  getStats() {
    const errors = this.errorBuffer;
    
    return {
      total: errors.length,
      byLevel: {
        error: errors.filter(e => e.level === 'error').length,
        warn: errors.filter(e => e.level === 'warn').length,
        info: errors.filter(e => e.level === 'info').length
      },
      byType: {
        exception: errors.filter(e => e.type === 'exception').length,
        error: errors.filter(e => e.type === 'error').length,
        message: errors.filter(e => e.type === 'message').length
      },
      recent: errors.slice(-5)
    };
  }

  // Setup global error handlers
  setupGlobalHandlers() {
    if (typeof window === 'undefined') return;

    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        type: 'unhandled_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason, {
        type: 'unhandled_rejection',
        promise: 'Promise rejection'
      });
    });

    // Catch console errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.captureMessage(args.join(' '), 'error', { source: 'console' });
      originalConsoleError.apply(console, args);
    };
  }
}

// Create singleton instance
const errorTracker = new ErrorTracker({
  enabled: true,
  environment: process.env.NODE_ENV || 'development',
  appVersion: '1.1.0'
});

// Setup global handlers
if (typeof window !== 'undefined') {
  errorTracker.setupGlobalHandlers();
}

export default errorTracker;

// Export helper functions
export const captureError = (error, context) => errorTracker.captureError(error, context);
export const captureException = (error, context) => errorTracker.captureException(error, context);
export const captureMessage = (message, level, context) => errorTracker.captureMessage(message, level, context);
export const getErrors = (filters) => errorTracker.getErrors(filters);
export const getErrorStats = () => errorTracker.getStats();
export const clearErrors = () => errorTracker.clearErrors();
