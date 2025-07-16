const express = require('express');
const { accounts } = require('../mockData');
const router = express.Router();

function isValidAddress(addr) {
  return /^T[a-zA-Z0-9]{39}$/.test(addr);
}

module.exports = (CHAIN_MODE, fetchRpc) => {
  router.get('/v1/accounts/:address', async (req, res) => {
    if (!isValidAddress(req.params.address)) {
      return res.status(400).json({ error: 'Invalid address' });
    }
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
