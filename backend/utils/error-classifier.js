/**
 * Error Classification Utility
 * Analyzes errors and determines appropriate HTTP status and error codes
 */

const { ERROR_CODES } = require('./error-codes');

/**
 * Classify an error and return appropriate status/code
 * @param {Error} err - The error to classify
 * @param {string} defaultNotFoundCode - Default NOT_FOUND code if 404 detected
 * @returns {object} { status, code, shouldRetry }
 */
function classifyError(err, defaultNotFoundCode = 'SERVICE_UNAVAILABLE') {
  const message = err.message.toLowerCase();

  const is404 = message.includes('404') || message.includes('not found');
  const isTimeout = message.includes('timeout');
  const is500 = message.includes('500') || message.includes('internal server error');

  let status = 503; // Default to Service Unavailable
  let code = defaultNotFoundCode;
  let shouldRetry = false;

  if (is404) {
    status = 404;
    code = defaultNotFoundCode;
    shouldRetry = false;
  } else if (isTimeout) {
    status = 504;
    code = 'GATEWAY_TIMEOUT';
    shouldRetry = true;
  } else if (is500) {
    status = 502;
    code = 'BAD_GATEWAY';
    shouldRetry = true;
  }

  return { status, code, shouldRetry, message };
}

/**
 * Get error code object for response
 * @param {string} code - Error code name
 * @returns {object} Error code object from ERROR_CODES
 */
function getErrorCodeObject(code) {
  return ERROR_CODES[code] || ERROR_CODES.SERVICE_UNAVAILABLE;
}

/**
 * Wrap a handler with centralized error handling
 * @param {Function} handler - Async route handler
 * @param {object} options - Configuration
 * @returns {Function} Wrapped handler for Express
 */
function createErrorHandlingWrapper(handler, options = {}) {
  const {
    endpoint = 'unknown',
    logContext = {},
    defaultNotFoundCode = 'SERVICE_UNAVAILABLE'
  } = options;

  return async (req, res, next) => {
    try {
      return await handler(req, res, next);
    } catch (err) {
      const { status, code, shouldRetry } = classifyError(err, defaultNotFoundCode);
      const errorCode = getErrorCodeObject(code);

      // Enhanced logging with context
      const logger = require('./logger');
      logger.error(`Failed request to ${endpoint}`, {
        endpoint,
        status,
        code,
        shouldRetry,
        error: err.message,
        requestId: req.id,
        ...logContext
      });

      return res.status(status).json(errorCode);
    }
  };
}

module.exports = {
  classifyError,
  getErrorCodeObject,
  createErrorHandlingWrapper
};
