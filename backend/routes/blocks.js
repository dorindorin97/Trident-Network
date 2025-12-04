const express = require('express');
const router = express.Router();
const validator = require('../utils/validator');
const logger = require('../utils/logger');

module.exports = fetchRpc => {
  router.get('/v1/blocks/latest', async (req, res) => {
    try {
      const data = await fetchRpc('/blocks/latest');
      return res.json(data);
    } catch (err) {
      logger.error('Failed to fetch latest block', {
        endpoint: '/v1/blocks/latest',
        error: err.message,
        requestId: req.id
      });
      const status = err.message.includes('timeout') ? 504 : 503;
      return res.status(status).json({ error: err.message || 'Service unavailable' });
    }
  });

  router.get('/v1/blocks', async (req, res) => {
    try {
      const pagination = validator.validatePagination(req.query.page, req.query.limit);
      if (!pagination.valid) {
        return res.status(400).json({ error: pagination.error });
      }

      const q = `?page=${pagination.page}&limit=${pagination.limit}`;
      const data = await fetchRpc(`/blocks${q}`);
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
      return res.status(status).json({ error: err.message || 'Service unavailable' });
    }
  });

  router.get('/v1/blocks/:number', async (req, res) => {
    const num = req.params.number;
    if (!validator.isValidBlockNumber(num)) {
      return res.status(400).json({ error: 'Invalid block number' });
    }
    try {
      const data = await fetchRpc(`/blocks/${num}`);
      return res.json(data);
    } catch (err) {
      logger.error('Failed to fetch block by number', {
        endpoint: '/v1/blocks/:number',
        blockNumber: num,
        error: err.message,
        requestId: req.id
      });
      if (err.message.includes('404') || err.message.includes('not found')) {
        return res.status(404).json({ error: 'Block not found' });
      }
      const status = err.message.includes('timeout') ? 504 : 503;
      return res.status(status).json({ error: err.message || 'Service unavailable' });
    }
  });

  router.get('/v1/blocks/hash/:hash', async (req, res) => {
    const hash = req.params.hash;
    if (!validator.isValidBlockHash(hash)) {
      return res.status(400).json({ error: 'Invalid block hash' });
    }
    try {
      const data = await fetchRpc(`/blocks/hash/${hash}`);
      return res.json(data);
    } catch (err) {
      logger.error('Failed to fetch block by hash', {
        endpoint: '/v1/blocks/hash/:hash',
        blockHash: hash,
        error: err.message,
        requestId: req.id
      });
      if (err.message.includes('404') || err.message.includes('not found')) {
        return res.status(404).json({ error: 'Block not found' });
      }
      const status = err.message.includes('timeout') ? 504 : 503;
      return res.status(status).json({ error: err.message || 'Service unavailable' });
    }
  });

  return router;
};
