const express = require('express');
const { latestBlock, blocks, accounts } = require('../mockData');
const router = express.Router();

module.exports = (CHAIN_MODE, fetchRpc) => {
  router.get('/v1/blocks/latest', async (req, res) => {
    if (CHAIN_MODE === 'rpc') {
      try {
        const data = await fetchRpc('/blocks/latest');
        return res.json(data);
      } catch (err) {
        return res.status(503).json({ error: 'Service unavailable' });
      }
    }
    res.json(latestBlock);
  });

  router.get('/v1/blocks', async (req, res) => {
    if (CHAIN_MODE === 'rpc') {
      try {
        const q = `?page=${req.query.page || 1}&limit=${req.query.limit || 10}`;
        const data = await fetchRpc(`/blocks${q}`);
        return res.json(data);
      } catch (err) {
        return res.status(503).json({ error: 'Service unavailable' });
      }
    }
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = blocks.slice(start, end);
    res.json({
      page,
      limit,
      total: blocks.length,
      blocks: paginated
    });
  });

  router.get('/v1/blocks/:number', async (req, res) => {
    const num = req.params.number;
    if (CHAIN_MODE === 'rpc') {
      try {
        const data = await fetchRpc(`/blocks/${num}`);
        return res.json(data);
      } catch (err) {
        return res.status(503).json({ error: 'Service unavailable' });
      }
    }
    const block = blocks.find(b => b.number === parseInt(num, 10));
    if (!block) return res.status(404).json({ error: 'Block not found' });
    res.json({ ...block, transactions: (accounts.TADDRESS1?.transactions || []) });
  });

  return router;
};
