const express = require('express');
const { accounts } = require('../mockData');
const router = express.Router();

module.exports = (CHAIN_MODE, fetchRpc) => {
  router.get('/v1/accounts/:address', async (req, res) => {
    if (CHAIN_MODE === 'rpc') {
      try {
        const data = await fetchRpc(`/accounts/${req.params.address}`);
        return res.json(data);
      } catch (err) {
        return res.status(503).json({ error: 'Service unavailable' });
      }
    }
    const addr = req.params.address;
    const data = accounts[addr] || { balance: 0, transactions: [] };
    res.json(data);
  });
  return router;
};
