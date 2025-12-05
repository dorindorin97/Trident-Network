const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { ValidationRules } = require('../utils/validation-rules');
const { ERROR_CODES } = require('../utils/error-codes');
const { createErrorHandlingWrapper } = require('../utils/error-classifier');
const { setCacheHeaders } = require('../constants/cache-headers');

module.exports = fetchRpc => {
  // Get latest block
  router.get('/v1/blocks/latest', createErrorHandlingWrapper(
    async (req, res) => {
      const data = await fetchRpc('/blocks/latest');
      setCacheHeaders(res, 'LATEST_DATA');
      return res.json(data);
    },
    { endpoint: '/v1/blocks/latest', defaultNotFoundCode: 'SERVICE_UNAVAILABLE' }
  ));

  // Get blocks with pagination
  router.get('/v1/blocks', createErrorHandlingWrapper(
    async (req, res) => {
      const validation = ValidationRules.validatePagination(req.query.page, req.query.limit);
      if (!validation.valid) {
        logger.warn('Invalid pagination parameters', { errors: validation.errors });
        return res.status(ERROR_CODES.INVALID_PAGINATION.status).json(ERROR_CODES.INVALID_PAGINATION);
      }

      const q = `?page=${validation.page}&limit=${validation.limit}`;
      const data = await fetchRpc(`/blocks${q}`);
      setCacheHeaders(res, 'STABLE_DATA');
      return res.json(data);
    },
    {
      endpoint: '/v1/blocks',
      logContext: { page: 'req.query.page', limit: 'req.query.limit' },
      defaultNotFoundCode: 'SERVICE_UNAVAILABLE'
    }
  ));

  // Get block by number
  router.get('/v1/blocks/:number', createErrorHandlingWrapper(
    async (req, res) => {
      const num = req.params.number;
      const validation = ValidationRules.validateNumber(num);
      if (!validation.valid) {
        logger.warn('Invalid block number', { blockNumber: num, errors: validation.errors });
        return res.status(ERROR_CODES.INVALID_BLOCK.status).json(ERROR_CODES.INVALID_BLOCK);
      }

      const data = await fetchRpc(`/blocks/${num}`);
      setCacheHeaders(res, 'STABLE_DATA');
      return res.json(data);
    },
    { endpoint: '/v1/blocks/:number', logContext: { blockNumber: 'req.params.number' }, defaultNotFoundCode: 'BLOCK_NOT_FOUND' }
  ));

  // Get block by hash
  router.get('/v1/blocks/hash/:hash', createErrorHandlingWrapper(
    async (req, res) => {
      const hash = req.params.hash;
      const validation = ValidationRules.validateHash(hash);
      if (!validation.valid) {
        logger.warn('Invalid block hash', { blockHash: hash, errors: validation.errors });
        return res.status(ERROR_CODES.INVALID_TX_HASH.status).json(ERROR_CODES.INVALID_TX_HASH);
      }

      const data = await fetchRpc(`/blocks/hash/${hash}`);
      setCacheHeaders(res, 'STABLE_DATA');
      return res.json(data);
    },
    { endpoint: '/v1/blocks/hash/:hash', logContext: { blockHash: 'req.params.hash' }, defaultNotFoundCode: 'BLOCK_NOT_FOUND' }
  ));

  return router;
};
