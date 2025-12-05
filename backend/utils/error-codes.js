/**
 * Centralized error codes and handling across frontend and backend
 * Provides consistent error messaging and HTTP status codes
 */

// Error codes (can be used in both frontend and backend)
const ERROR_CODES = {
  // Client errors (4xx)
  INVALID_INPUT: { code: 'INVALID_INPUT', status: 400, message: 'Invalid input provided' },
  MISSING_PARAMETER: { code: 'MISSING_PARAMETER', status: 400, message: 'Required parameter missing' },
  INVALID_ADDRESS: { code: 'INVALID_ADDRESS', status: 400, message: 'Invalid address format' },
  INVALID_BLOCK: { code: 'INVALID_BLOCK', status: 400, message: 'Invalid block identifier' },
  INVALID_TX_HASH: { code: 'INVALID_TX_HASH', status: 400, message: 'Invalid transaction hash' },
  INVALID_PAGINATION: { code: 'INVALID_PAGINATION', status: 400, message: 'Invalid pagination parameters' },
  RATE_LIMIT_EXCEEDED: { code: 'RATE_LIMIT_EXCEEDED', status: 429, message: 'Too many requests' },
  UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401, message: 'Unauthorized access' },
  FORBIDDEN: { code: 'FORBIDDEN', status: 403, message: 'Access forbidden' },

  // Not found (404)
  NOT_FOUND: { code: 'NOT_FOUND', status: 404, message: 'Resource not found' },
  BLOCK_NOT_FOUND: { code: 'BLOCK_NOT_FOUND', status: 404, message: 'Block not found' },
  TX_NOT_FOUND: { code: 'TX_NOT_FOUND', status: 404, message: 'Transaction not found' },
  ACCOUNT_NOT_FOUND: { code: 'ACCOUNT_NOT_FOUND', status: 404, message: 'Account not found' },

  // Server errors (5xx)
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', status: 500, message: 'Internal server error' },
  SERVICE_UNAVAILABLE: { code: 'SERVICE_UNAVAILABLE', status: 503, message: 'Service unavailable' },
  GATEWAY_TIMEOUT: { code: 'GATEWAY_TIMEOUT', status: 504, message: 'Gateway timeout' },
  RPC_ERROR: { code: 'RPC_ERROR', status: 502, message: 'RPC node error' },
  NETWORK_ERROR: { code: 'NETWORK_ERROR', status: 503, message: 'Network error' },

  // Client-side only errors (no HTTP status)
  FETCH_ERROR: { code: 'FETCH_ERROR', status: null, message: 'Failed to fetch data' },
  PARSE_ERROR: { code: 'PARSE_ERROR', status: null, message: 'Failed to parse response' },
  TIMEOUT: { code: 'TIMEOUT', status: null, message: 'Request timed out' },
  OFFLINE: { code: 'OFFLINE', status: null, message: 'Offline or no connection' }
};

/**
 * Custom error class with code and details
 */
class ApiError extends Error {
  constructor(code, details = {}) {
    const errorDef = ERROR_CODES[code] || ERROR_CODES.INTERNAL_ERROR;
    super(errorDef.message);

    this.code = code;
    this.status = errorDef.status;
    this.originalMessage = errorDef.message;
    this.details = details;
    this.name = 'ApiError';
  }

  /**
   * Convert to JSON for API response
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get user-friendly message
   */
  getUserMessage() {
    // Map technical errors to user-friendly messages
    const userMessages = {
      INVALID_INPUT: 'Please check your input and try again',
      INVALID_ADDRESS: 'Please enter a valid address (starts with T)',
      INVALID_BLOCK: 'Please enter a valid block number or hash',
      INVALID_TX_HASH: 'Please enter a valid transaction hash',
      RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again',
      GATEWAY_TIMEOUT: 'Request took too long. Please try again',
      RPC_ERROR: 'Network node is not responding. Please try again',
      NETWORK_ERROR: 'Network connection error. Please check your connection',
      OFFLINE: 'You are offline. Please check your connection',
      INTERNAL_ERROR: 'Something went wrong. Please try again later'
    };

    return userMessages[this.code] || this.originalMessage;
  }
}

/**
 * Determine error code from error object or string
 */
function getErrorCode(error) {
  if (error instanceof ApiError) {
    return error.code;
  }

  if (typeof error === 'string') {
    // Try to infer error code from string
    if (error.includes('timeout')) return 'TIMEOUT';
    if (error.includes('offline')) return 'OFFLINE';
    if (error.includes('rate limit')) return 'RATE_LIMIT_EXCEEDED';
    if (error.includes('not found')) return 'NOT_FOUND';
  }

  if (error instanceof Error) {
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') return 'NETWORK_ERROR';
    if (error.message.includes('timeout')) return 'TIMEOUT';
  }

  return 'INTERNAL_ERROR';
}

/**
 * Format error for logging
 */
function formatErrorForLog(error, context = {}) {
  const code = error instanceof ApiError ? error.code : getErrorCode(error);

  return {
    timestamp: new Date().toISOString(),
    code,
    message: error.message,
    stack: error.stack,
    context,
    userMessage: error instanceof ApiError ? error.getUserMessage() : 'An error occurred'
  };
}

module.exports = {
  ERROR_CODES,
  ApiError,
  getErrorCode,
  formatErrorForLog
};
