const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { ValidationRules } = require('../utils/validation-rules');
const { ERROR_CODES } = require('../utils/error-codes');
const { createErrorHandlingWrapper } = require('../utils/error-classifier');
const { setCacheHeaders } = require('../constants/cache-headers');
const HttpCacheMiddleware = require('../utils/http-cache-middleware');

module.exports = fetchRpc => {
  router.get('/v1/accounts/:address', createErrorHandlingWrapper(
    async (req, res) => {
      // Validate address using ValidationRules
      const validation = ValidationRules.validateAddress(req.params.address);
      if (!validation.valid) {
        logger.warn('Invalid address provided', {
          address: req.params.address,
          errors: validation.errors
        });
        return res.status(ERROR_CODES.INVALID_ADDRESS.status).json(ERROR_CODES.INVALID_ADDRESS);
      }

      // Pagination parameters
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
      const offset = (page - 1) * limit;

      // Fetch account data from RPC
      const data = await fetchRpc(`/accounts/${req.params.address}`);

      // Paginate transactions if present
      if (data.transactions && Array.isArray(data.transactions)) {
        const total = data.transactions.length;
        const paginatedTransactions = data.transactions.slice(offset, offset + limit);

        setCacheHeaders(res, 'STABLE_DATA');
        return res.json({
          ...data,
          transactions: paginatedTransactions,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: offset + limit < total,
            hasPrev: page > 1
          }
        });
      }

      setCacheHeaders(res, 'STABLE_DATA');
      return res.json(data);
    },
    {
      endpoint: '/v1/accounts/:address',
      logContext: { address: 'req.params.address' },
      defaultNotFoundCode: 'ACCOUNT_NOT_FOUND'
    }
  ));

  return router;
};
