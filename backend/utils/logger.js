// Simple logger utility for structured logging
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = process.env.LOG_LEVEL || 'info';

function log(level, message, meta = {}) {
  if (logLevels[level] <= logLevels[currentLevel]) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta,
    };
    
    if (level === 'error') {
      process.stderr.write(JSON.stringify(logEntry) + '\n');
    } else {
      process.stdout.write(JSON.stringify(logEntry) + '\n');
    }
  }
}

/**
 * Middleware for logging HTTP requests and responses
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Log request
  log('debug', 'Incoming request', {
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip || req.connection.remoteAddress
  });
  
  // Capture original end function
  const originalEnd = res.end;
  
  // Override end to log response
  res.end = function(...args) {
    const duration = Date.now() - start;
    
    log(res.statusCode >= 400 ? 'warn' : 'debug', 'Response sent', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
    
    // Call original end
    originalEnd.apply(res, args);
  };
  
  next();
}

module.exports = {
  error: (message, meta) => log('error', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  info: (message, meta) => log('info', message, meta),
  debug: (message, meta) => log('debug', message, meta),
  requestLogger
};
