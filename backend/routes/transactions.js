const express = require('express');
const { accounts } = require('../mockData');
const router = express.Router();

module.exports = (CHAIN_MODE, fetchRpc) => {
  router.get('/v1/transactions/:id', async (req, res) => {
    const id = req.params.id;
    if (CHAIN_MODE === 'rpc') {
      try {
        const data = await fetchRpc(`/transactions/${id}`);
        return res.json(data);
      } catch (err) {
        return res.status(503).json({ error: 'Service unavailable' });
      }
    }
    let tx;
    let blockNumber = null;
    for (const acc of Object.values(accounts)) {
      const found = acc.transactions.find(t => t.txId === id);
      if (found) {
        tx = { ...found };
        break;
      }
    }
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    if (blockNumber) tx.blockNumber = blockNumber;
    res.json(tx);
  });
  return router;
};
