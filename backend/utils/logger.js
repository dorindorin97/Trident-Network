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
      console.error(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }
}

module.exports = {
  error: (message, meta) => log('error', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  info: (message, meta) => log('info', message, meta),
  debug: (message, meta) => log('debug', message, meta),
};
