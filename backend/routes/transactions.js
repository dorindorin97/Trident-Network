const express = require('express');
const router = express.Router();
const validator = require('../utils/validator');
const logger = require('../utils/logger');

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
      logger.error('Failed to fetch transaction', {
        endpoint: '/v1/transactions/:id',
        transactionId: id,
        error: err.message,
        requestId: req.id
      });
      return res.status(503).json({ error: 'Service unavailable' });
    }
  });
  return router;
};
