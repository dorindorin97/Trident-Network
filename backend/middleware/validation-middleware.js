/**
 * Validation Middleware
 * Consolidates input validation logic for route handlers
 */

const logger = require('../utils/logger');
const { ValidationRules } = require('../utils/validation-rules');
const { ERROR_CODES } = require('../utils/error-codes');

/**
 * Create a validation middleware for a single parameter
 * @param {string} paramName - Parameter name (e.g., 'address', 'hash')
 * @param {string} validationType - Validation type (e.g., 'address', 'hash', 'pagination')
 * @param {object} options - Additional options
 * @returns {Function} Express middleware
 */
function createParamValidator(paramName, validationType, options = {}) {
  const { source = 'params', errorCode = 'INVALID_REQUEST' } = options;

  return (req, res, next) => {
    const value = source === 'params' ? req.params[paramName] : req.query[paramName];

    if (!value) {
      logger.warn(`Missing required parameter: ${paramName}`, { paramName });
      return res.status(ERROR_CODES[errorCode]?.status || 400).json(ERROR_CODES[errorCode] || ERROR_CODES.INVALID_REQUEST);
    }

    // Call appropriate validation rule
    const validationMethod = `validate${validationType.charAt(0).toUpperCase() + validationType.slice(1)}`;
    if (typeof ValidationRules[validationMethod] !== 'function') {
      logger.warn(`Unknown validation type: ${validationType}`);
      return next();
    }

    const validation = ValidationRules[validationMethod](value);

    if (!validation.valid) {
      logger.warn(`Validation failed for ${paramName}`, {
        paramName,
        value: typeof value === 'string' ? value.substring(0, 50) : value,
        validationType,
        errors: validation.errors
      });
      return res.status(ERROR_CODES[errorCode]?.status || 400).json(ERROR_CODES[errorCode] || ERROR_CODES.INVALID_REQUEST);
    }

    // Attach validated value to request for use in handler
    req.validated = req.validated || {};
    req.validated[paramName] = value;

    next();
  };
}

/**
 * Create a pagination validator middleware
 * @param {object} options - Options (maxLimit, defaultLimit)
 * @returns {Function} Express middleware
 */
function createPaginationValidator(options = {}) {
  const { maxLimit = 100, defaultLimit = 20 } = options;

  return (req, res, next) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit) || defaultLimit));

    const validation = ValidationRules.validatePagination(page, limit);

    if (!validation.valid) {
      logger.warn('Invalid pagination parameters', {
        page,
        limit,
        errors: validation.errors
      });
      return res.status(ERROR_CODES.INVALID_PAGINATION.status).json(ERROR_CODES.INVALID_PAGINATION);
    }

    // Attach pagination to request
    req.pagination = {
      page,
      limit,
      offset: (page - 1) * limit
    };

    next();
  };
}

/**
 * Combine multiple validators into a single middleware
 * @param {...Function} validators - Validator middlewares
 * @returns {Function} Combined middleware
 */
function combineValidators(...validators) {
  return (req, res, next) => {
    let index = 0;
    const executeNext = () => {
      if (index >= validators.length) {
        return next();
      }
      validators[index++](req, res, executeNext);
    };
    executeNext();
  };
}

module.exports = {
  createParamValidator,
  createPaginationValidator,
  combineValidators
};
