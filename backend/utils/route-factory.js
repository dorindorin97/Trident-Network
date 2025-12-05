/**
 * Route Factory - Reduces code duplication in route handlers
 * Provides factory functions for common endpoint patterns
 */

const logger = require('./logger');
const { createErrorHandlingWrapper } = require('./error-classifier');
const { setCacheHeaders } = require('../constants/cache-headers');
const { ValidationRules } = require('./validation-rules');
const { ERROR_CODES } = require('./error-codes');

/**
 * Factory for GET endpoints that fetch from RPC
 * @param {string} endpoint - Express path like '/v1/blocks/latest'
 * @param {function} buildRpcPath - Function to build RPC path from req params
 * @param {object} options - Configuration options
 */
function createGetEndpoint(endpoint, buildRpcPath, options = {}) {
  const {
    cacheType = 'STABLE_DATA',
    validator = null,
    errorCode = 'SERVICE_UNAVAILABLE',
    logContext = {}
  } = options;

  return createErrorHandlingWrapper(
    async (req, res) => {
      // Run validator if provided
      if (validator) {
        const validation = validator(req);
        if (!validation.valid) {
          logger.warn(`Invalid ${endpoint} request`, { errors: validation.errors, ...logContext });
          return res.status(validation.errorCode?.status || 400).json(
            validation.errorCode || ERROR_CODES.INVALID_REQUEST
          );
        }
      }

      // Build RPC path and fetch data
      const rpcPath = buildRpcPath(req);
      const data = await req.fetchRpc(rpcPath);
      
      // Set cache headers
      setCacheHeaders(res, cacheType);
      
      return res.json(data);
    },
    {
      endpoint,
      defaultNotFoundCode: errorCode,
      logContext
    }
  );
}

/**
 * Factory for paginated list endpoints
 * @param {string} endpoint - Express path like '/v1/blocks'
 * @param {string} rpcPath - RPC path like '/blocks'
 * @param {object} options - Configuration options
 */
function createPaginatedEndpoint(endpoint, rpcPath, options = {}) {
  const {
    defaultLimit = 20,
    maxLimit = 100,
    cacheType = 'STABLE_DATA',
    errorCode = 'SERVICE_UNAVAILABLE'
  } = options;

  return createErrorHandlingWrapper(
    async (req, res) => {
      const validation = ValidationRules.validatePagination(
        req.query.page || req.query.offset,
        req.query.limit,
        { defaultLimit, maxLimit }
      );

      if (!validation.valid) {
        logger.warn(`Invalid pagination for ${endpoint}`, { errors: validation.errors });
        return res.status(ERROR_CODES.INVALID_PAGINATION.status).json(
          ERROR_CODES.INVALID_PAGINATION
        );
      }

      const query = `?page=${validation.page}&limit=${validation.limit}`;
      const data = await req.fetchRpc(`${rpcPath}${query}`);
      
      setCacheHeaders(res, cacheType);
      return res.json(data);
    },
    {
      endpoint,
      defaultNotFoundCode: errorCode,
      logContext: { page: 'req.query.page', limit: 'req.query.limit' }
    }
  );
}

/**
 * Factory for detail endpoints (by ID/address/hash)
 * @param {string} endpoint - Express path like '/v1/blocks/:id'
 * @param {string} rpcPath - RPC path like '/blocks'
 * @param {string} paramName - URL param name like 'id'
 * @param {function} validator - Validation function
 * @param {object} options - Configuration options
 */
function createDetailEndpoint(endpoint, rpcPath, paramName, validator, options = {}) {
  const {
    cacheType = 'ACTIVE_DATA',
    errorCode = 'NOT_FOUND'
  } = options;

  return createErrorHandlingWrapper(
    async (req, res) => {
      const paramValue = req.params[paramName];
      
      const validation = validator(paramValue);
      if (!validation.valid) {
        logger.warn(`Invalid ${endpoint} request`, { 
          [paramName]: paramValue, 
          errors: validation.errors 
        });
        return res.status(validation.errorCode?.status || 400).json(
          validation.errorCode || ERROR_CODES.INVALID_REQUEST
        );
      }

      const data = await req.fetchRpc(`${rpcPath}/${paramValue}`);
      
      setCacheHeaders(res, cacheType);
      return res.json(data);
    },
    {
      endpoint,
      defaultNotFoundCode: errorCode,
      logContext: { [paramName]: `req.params.${paramName}` }
    }
  );
}

/**
 * Attaches fetchRpc to route handler
 * @param {function} fetchRpc - RPC fetcher function
 */
function attachFetchRpc(fetchRpc) {
  return (req, res, next) => {
    req.fetchRpc = fetchRpc;
    next();
  };
}

module.exports = {
  createGetEndpoint,
  createPaginatedEndpoint,
  createDetailEndpoint,
  attachFetchRpc
};
