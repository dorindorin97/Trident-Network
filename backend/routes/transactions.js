const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { ValidationRules } = require('../utils/validation-rules');
const { ERROR_CODES } = require('../utils/error-codes');
const { createErrorHandlingWrapper } = require('../utils/error-classifier');
const { setCacheHeaders } = require('../constants/cache-headers');

module.exports = fetchRpc => {
  router.get('/v1/transactions/:id', createErrorHandlingWrapper(
    async (req, res) => {
      const id = req.params.id;
      // Validate transaction ID using ValidationRules
      const validation = ValidationRules.validateHash(id);
      if (!validation.valid) {
        logger.warn('Invalid transaction ID', { transactionId: id, errors: validation.errors });
        return res.status(ERROR_CODES.INVALID_TX_HASH.status).json(ERROR_CODES.INVALID_TX_HASH);
      }

      const data = await fetchRpc(`/transactions/${id}`);
      setCacheHeaders(res, 'ACTIVE_DATA');
      return res.json(data);
    },
    {
      endpoint: '/v1/transactions/:id',
      logContext: { transactionId: 'req.params.id' },
      defaultNotFoundCode: 'TX_NOT_FOUND'
    }
  ));

  return router;
};
