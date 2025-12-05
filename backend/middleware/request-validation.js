/**
 * Validation Middleware - Centralized request validation
 * Validates query params, body, and path parameters
 */

const logger = require('./logger');
const { ValidationRules } = require('./validation-rules');
const { ERROR_CODES } = require('./error-codes');

/**
 * Creates validation middleware for query parameters
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const errors = {};
    
    for (const [key, validator] of Object.entries(schema)) {
      if (validator.required && !req.query[key]) {
        errors[key] = `${key} is required`;
        continue;
      }

      if (req.query[key]) {
        if (validator.validate) {
          const result = validator.validate(req.query[key]);
          if (!result.valid) {
            errors[key] = result.error || `${key} is invalid`;
          } else if (result.value !== undefined) {
            req.query[key] = result.value; // Update with coerced value
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      logger.warn('Query validation failed', { path: req.path, errors });
      return res.status(400).json({
        ...ERROR_CODES.INVALID_REQUEST,
        details: errors
      });
    }

    next();
  };
}

/**
 * Creates validation middleware for body
 */
function validateBody(schema) {
  return (req, res, next) => {
    const errors = {};

    for (const [key, validator] of Object.entries(schema)) {
      if (validator.required && !req.body[key]) {
        errors[key] = `${key} is required`;
        continue;
      }

      if (req.body[key] !== undefined) {
        if (validator.validate) {
          const result = validator.validate(req.body[key]);
          if (!result.valid) {
            errors[key] = result.error || `${key} is invalid`;
          } else if (result.value !== undefined) {
            req.body[key] = result.value; // Update with coerced value
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      logger.warn('Body validation failed', { path: req.path, errors });
      return res.status(400).json({
        ...ERROR_CODES.INVALID_REQUEST,
        details: errors
      });
    }

    next();
  };
}

/**
 * Creates validation middleware for path parameters
 */
function validateParams(schema) {
  return (req, res, next) => {
    const errors = {};

    for (const [key, validator] of Object.entries(schema)) {
      if (!req.params[key]) {
        errors[key] = `${key} is required`;
        continue;
      }

      const result = validator(req.params[key]);
      if (!result.valid) {
        errors[key] = result.error || `${key} is invalid`;
      }
    }

    if (Object.keys(errors).length > 0) {
      logger.warn('Path parameter validation failed', { path: req.path, errors });
      return res.status(400).json({
        ...ERROR_CODES.INVALID_REQUEST,
        details: errors
      });
    }

    next();
  };
}

/**
 * Pagination validator schema factory
 */
const paginationSchema = {
  limit: {
    required: false,
    validate: (val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1 || num > 100) {
        return { valid: false, error: 'Limit must be 1-100' };
      }
      return { valid: true, value: num };
    }
  },
  offset: {
    required: false,
    validate: (val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 0 || num > 1000000) {
        return { valid: false, error: 'Offset must be 0-1000000' };
      }
      return { valid: true, value: num };
    }
  }
};

/**
 * Standard parameter validators
 */
const paramValidators = {
  address: (val) => {
    const result = ValidationRules.validateAddress(val);
    return {
      valid: result.valid,
      error: result.valid ? undefined : 'Invalid address format'
    };
  },

  blockNumber: (val) => {
    const result = ValidationRules.validateNumber(val);
    return {
      valid: result.valid,
      error: result.valid ? undefined : 'Invalid block number'
    };
  },

  txHash: (val) => {
    const result = ValidationRules.validateHash(val);
    return {
      valid: result.valid,
      error: result.valid ? undefined : 'Invalid transaction hash'
    };
  },

  blockHash: (val) => {
    const result = ValidationRules.validateHash(val);
    return {
      valid: result.valid,
      error: result.valid ? undefined : 'Invalid block hash'
    };
  }
};

/**
 * Compose multiple validation middlewares
 */
function compose(...middlewares) {
  return (req, res, next) => {
    let index = -1;

    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'));
      index = i;
      
      let fn = middlewares[i];
      if (i === middlewares.length) fn = next;

      if (!fn) return Promise.resolve();

      try {
        return Promise.resolve(fn(req, res, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  };
}

module.exports = {
  validateQuery,
  validateBody,
  validateParams,
  paginationSchema,
  paramValidators,
  compose
};
