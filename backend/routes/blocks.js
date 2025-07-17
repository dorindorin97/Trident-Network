const express = require('express');
const router = express.Router();

function isValidBlockNumber(n) {
  const num = parseInt(n, 10);
  return Number.isInteger(num) && num >= 0 && num <= Number.MAX_SAFE_INTEGER;
}

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
      const q = `?page=${req.query.page || 1}&limit=${req.query.limit || 10}`;
      const data = await fetchRpc(`/blocks${q}`);
      return res.json(data);
    } catch (err) {
      return res.status(503).json({ error: 'Service unavailable' });
    }
  });

  router.get('/v1/blocks/:number', async (req, res) => {
    const num = req.params.number;
    if (!isValidBlockNumber(num)) {
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
    if (!/^0x[0-9a-fA-F]{16}$/.test(hash)) {
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
