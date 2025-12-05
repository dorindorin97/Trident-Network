const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { ValidationRules, BatchValidator } = require('../utils/validation-rules');
const { ERROR_CODES } = require('../utils/error-codes');
const HttpCacheMiddleware = require('../utils/http-cache-middleware');
const ConditionalCacheDecorator = require('../utils/conditional-cache');

module.exports = fetchRpc => {
  // Initialize cache for accounts endpoint
  const accountCacheDecorator = new ConditionalCacheDecorator.wrap(async (address) => {
    return fetchRpc(`/accounts/${address}`);
  }, { ttl: 30 }); // 30s cache with query param override support

  router.get('/v1/accounts/:address', async (req, res) => {
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

    try {
      // Use conditional caching with query param override (e.g., ?noCache=true)
      const data = await accountCacheDecorator(req.params.address);
      
      // Paginate transactions if present
      if (data.transactions && Array.isArray(data.transactions)) {
        const total = data.transactions.length;
        const paginatedTransactions = data.transactions.slice(offset, offset + limit);
        
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
      
      return res.json(data);
    } catch (err) {
      logger.error('Failed to fetch account', {
        endpoint: '/v1/accounts/:address',
        address: req.params.address,
        error: err.message,
        requestId: req.id
      });
      
      if (err.message.includes('404') || err.message.includes('not found')) {
        return res.status(ERROR_CODES.ACCOUNT_NOT_FOUND.status).json(ERROR_CODES.ACCOUNT_NOT_FOUND);
      }
      
      const status = err.message.includes('timeout') ? 504 : 503;
      return res.status(status).json(ERROR_CODES.SERVICE_UNAVAILABLE);
    }
  });

  return router;
};
