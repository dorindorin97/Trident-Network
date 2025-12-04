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
      if (err.message.includes('404') || err.message.includes('not found')) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      const status = err.message.includes('timeout') ? 504 : 503;
      return res.status(status).json({ error: err.message || 'Service unavailable' });
    }
  });
  return router;
};
