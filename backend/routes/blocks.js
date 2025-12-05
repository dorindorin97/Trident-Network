const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { ValidationRules } = require('../utils/validation-rules');
const { ERROR_CODES } = require('../utils/error-codes');
const HttpCacheMiddleware = require('../utils/http-cache-middleware');

module.exports = fetchRpc => {
  // Cache stable block endpoints for 30 seconds
  router.get('/v1/blocks/latest', async (req, res) => {
    try {
      const data = await fetchRpc('/blocks/latest');
      // Set strong cache headers for stable latest block data
      res.set('Cache-Control', 'public, max-age=5, stale-while-revalidate=10');
      return res.json(data);
    } catch (err) {
      logger.error('Failed to fetch latest block', {
        endpoint: '/v1/blocks/latest',
        error: err.message,
        requestId: req.id
      });
      const status = err.message.includes('timeout') ? 504 : 503;
      return res.status(status).json(ERROR_CODES.SERVICE_UNAVAILABLE);
    }
  });

  router.get('/v1/blocks', async (req, res) => {
    try {
      // Use ValidationRules for pagination validation
      const validation = ValidationRules.validatePagination(
        req.query.page, 
        req.query.limit
      );
      if (!validation.valid) {
        logger.warn('Invalid pagination parameters', { errors: validation.errors });
        return res.status(ERROR_CODES.INVALID_PAGINATION.status).json(ERROR_CODES.INVALID_PAGINATION);
      }

      const q = `?page=${validation.page}&limit=${validation.limit}`;
      const data = await fetchRpc(`/blocks${q}`);
      res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
      return res.json(data);
    } catch (err) {
      logger.error('Failed to fetch block list', {
        endpoint: '/v1/blocks',
        page: req.query.page,
        limit: req.query.limit,
        error: err.message,
        requestId: req.id
      });
      const status = err.message.includes('timeout') ? 504 : 503;
      return res.status(status).json(ERROR_CODES.SERVICE_UNAVAILABLE);
    }
  });

  router.get('/v1/blocks/:number', async (req, res) => {
    const num = req.params.number;
    // Validate block number
    const validation = ValidationRules.validateNumber(num);
    if (!validation.valid) {
      logger.warn('Invalid block number', { blockNumber: num, errors: validation.errors });
      return res.status(ERROR_CODES.INVALID_BLOCK.status).json(ERROR_CODES.INVALID_BLOCK);
    }

    try {
      const data = await fetchRpc(`/blocks/${num}`);
      res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
      return res.json(data);
    } catch (err) {
      logger.error('Failed to fetch block by number', {
        endpoint: '/v1/blocks/:number',
        blockNumber: num,
        error: err.message,
        requestId: req.id
      });
      if (err.message.includes('404') || err.message.includes('not found')) {
        return res.status(ERROR_CODES.BLOCK_NOT_FOUND.status).json(ERROR_CODES.BLOCK_NOT_FOUND);
      }
      const status = err.message.includes('timeout') ? 504 : 503;
      return res.status(status).json(ERROR_CODES.SERVICE_UNAVAILABLE);
    }
  });

  router.get('/v1/blocks/hash/:hash', async (req, res) => {
    const hash = req.params.hash;
    // Validate block hash format
    const validation = ValidationRules.validateHash(hash);
    if (!validation.valid) {
      logger.warn('Invalid block hash', { blockHash: hash, errors: validation.errors });
      return res.status(ERROR_CODES.INVALID_TX_HASH.status).json(ERROR_CODES.INVALID_TX_HASH);
    }

    try {
      const data = await fetchRpc(`/blocks/hash/${hash}`);
      res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
      return res.json(data);
    } catch (err) {
      logger.error('Failed to fetch block by hash', {
        endpoint: '/v1/blocks/hash/:hash',
        blockHash: hash,
        error: err.message,
        requestId: req.id
      });
      if (err.message.includes('404') || err.message.includes('not found')) {
        return res.status(ERROR_CODES.BLOCK_NOT_FOUND.status).json(ERROR_CODES.BLOCK_NOT_FOUND);
      }
      const status = err.message.includes('timeout') ? 504 : 503;
      return res.status(status).json(ERROR_CODES.SERVICE_UNAVAILABLE);
    }
  });

  return router;
};
