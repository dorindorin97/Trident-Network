const express = require('express');
const router = express.Router();

function isValidTxId(id) {
  return /^(0x)?[0-9a-fA-F]{64}$/.test(id);
}

module.exports = fetchRpc => {
  router.get('/v1/transactions/:id', async (req, res) => {
    const id = req.params.id;
    if (!isValidTxId(id)) {
      return res.status(400).json({ error: 'Invalid transaction id' });
    }
    try {
      const data = await fetchRpc(`/transactions/${id}`);
      return res.json(data);
    } catch (err) {
      return res.status(503).json({ error: 'Service unavailable' });
    }
  });
  return router;
};
