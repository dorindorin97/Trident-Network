const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { ValidationRules } = require('../utils/validation-rules');
const { ERROR_CODES } = require('../utils/error-codes');

module.exports = fetchRpc => {
  router.get('/v1/transactions/:id', async (req, res) => {
    const id = req.params.id;
    // Validate transaction ID using ValidationRules
    const validation = ValidationRules.validateHash(id);
    if (!validation.valid) {
      logger.warn('Invalid transaction ID', { transactionId: id, errors: validation.errors });
      return res.status(ERROR_CODES.INVALID_TX_HASH.status).json(ERROR_CODES.INVALID_TX_HASH);
    }

    try {
      const data = await fetchRpc(`/transactions/${id}`);
      res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
      return res.json(data);
    } catch (err) {
      logger.error('Failed to fetch transaction', {
        endpoint: '/v1/transactions/:id',
        transactionId: id,
        error: err.message,
        requestId: req.id
      });
      if (err.message.includes('404') || err.message.includes('not found')) {
        return res.status(ERROR_CODES.TX_NOT_FOUND.status).json(ERROR_CODES.TX_NOT_FOUND);
      }
      const status = err.message.includes('timeout') ? 504 : 503;
      return res.status(status).json(ERROR_CODES.SERVICE_UNAVAILABLE);
    }
  });

  return router;
};
