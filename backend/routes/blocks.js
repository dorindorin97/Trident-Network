const express = require('express');
const router = express.Router();
const validator = require('../utils/validator');

module.exports = fetchRpc => {
  router.get('/v1/blocks/latest', async (req, res) => {
    try {
      const data = await fetchRpc('/blocks/latest');
      return res.json(data);
    } catch (err) {
      return res.status(503).json({ error: 'Service unavailable' });
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
      return res.status(503).json({ error: 'Service unavailable' });
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
      return res.status(503).json({ error: 'Service unavailable' });
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
      return res.status(503).json({ error: 'Service unavailable' });
    }
  });

  return router;
};
