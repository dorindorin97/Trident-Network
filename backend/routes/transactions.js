const express = require('express');
const router = express.Router();
const validator = require('../utils/validator');

module.exports = fetchRpc => {
  router.get('/v1/transactions/:id', async (req, res) => {
    const id = req.params.id;
    if (!validator.isValidTxId(id)) {
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
