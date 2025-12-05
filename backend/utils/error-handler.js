/**
 * Centralized error handler middleware for API routes
 * Standardizes error responses and logging
 */

const logger = require('./logger');
const { ERROR_CODES } = require('./error-codes');

/**
 * Standard error response format
 */
function formatErrorResponse(code, message = null, details = null) {
  return {
    status: code.status,
    error: code.error,
    message: message || code.message,
    ...(details && { details })
  };
}

/**
 * Async route handler wrapper that catches errors
 * Usage: router.get('/endpoint', asyncHandler(async (req, res) => { ... }))
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Error handler middleware for Express
 * Should be used last in the middleware chain
 */
function errorHandler(err, req, res, next) {
  // Determine status code and error response
  let status = 500;
  let errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR;
  let message = 'Internal server error';
  let details = null;

  // Handle specific error types
  if (err.message?.includes('timeout')) {
    status = 504;
    errorCode = ERROR_CODES.REQUEST_TIMEOUT || { status: 504, error: 'Request Timeout' };
    message = 'Request timeout';
  } else if (err.message?.includes('404')) {
    status = 404;
    errorCode = ERROR_CODES.NOT_FOUND || { status: 404, error: 'Not Found' };
    message = 'Resource not found';
  } else if (err.message?.includes('validation') || err.name === 'ValidationError') {
    status = 400;
    errorCode = ERROR_CODES.INVALID_REQUEST || { status: 400, error: 'Invalid Request' };
    message = err.message || 'Validation failed';
    details = err.details || null;
  } else if (err.status) {
    status = err.status;
    message = err.message;
  } else if (err.code === 'ECONNREFUSED') {
    status = 503;
    errorCode = ERROR_CODES.SERVICE_UNAVAILABLE;
    message = 'Service unavailable';
  } else if (err.code === 'TIMEOUT') {
    status = 504;
    errorCode = ERROR_CODES.REQUEST_TIMEOUT || { status: 504, error: 'Request Timeout' };
    message = 'Request timeout';
  }

  // Log error with context
  const logLevel = status >= 500 ? 'error' : 'warn';
  logger[logLevel](`HTTP ${status} - ${message}`, {
    path: req.path,
    method: req.method,
    status,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    requestId: req.id,
    details
  });

  // Send error response
  res.status(status).json(formatErrorResponse(errorCode, message, details));
}

/**
 * Validation error handler - throws ValidationError
 */
class ValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.status = 400;
  }
}

/**
 * Handler for invalid pagination
 */
function handleInvalidPagination(res, requestId) {
  logger.warn('Invalid pagination parameters', { requestId });
  return res.status(ERROR_CODES.INVALID_PAGINATION.status).json(ERROR_CODES.INVALID_PAGINATION);
}

/**
 * Handler for invalid address
 */
function handleInvalidAddress(res, address, requestId) {
  logger.warn('Invalid address provided', { address, requestId });
  return res.status(ERROR_CODES.INVALID_ADDRESS.status).json(ERROR_CODES.INVALID_ADDRESS);
}

/**
 * Handler for RPC/service errors
 */
function handleRpcError(err, endpoint, req, res) {
  logger.error(`Failed to fetch ${endpoint}`, {
    endpoint,
    error: err.message,
    requestId: req.id
  });

  const status = err.message?.includes('timeout') ? 504 : 503;
  const errorCode = status === 504
    ? (ERROR_CODES.REQUEST_TIMEOUT || { status: 504, error: 'Request Timeout' })
    : ERROR_CODES.SERVICE_UNAVAILABLE;

  return res.status(status).json(errorCode);
}

module.exports = {
  errorHandler,
  asyncHandler,
  ValidationError,
  formatErrorResponse,
  handleInvalidPagination,
  handleInvalidAddress,
  handleRpcError
};
