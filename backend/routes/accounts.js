const express = require('express');
const router = express.Router();
const validator = require('../utils/validator');
const logger = require('../utils/logger');

module.exports = fetchRpc => {
  router.get('/v1/accounts/:address', async (req, res) => {
    if (!validator.isValidAddress(req.params.address)) {
      return res.status(400).json({ error: 'Invalid address' });
    }
    try {
      const data = await fetchRpc(`/accounts/${req.params.address}`);
      return res.json(data);
    } catch (err) {
      logger.error('Failed to fetch account', {
        endpoint: '/v1/accounts/:address',
        address: req.params.address,
        error: err.message,
        requestId: req.id
      });
      if (err.message.includes('404') || err.message.includes('not found')) {
        return res.status(404).json({ error: 'Account not found' });
      }
      const status = err.message.includes('timeout') ? 504 : 503;
      return res.status(status).json({ error: err.message || 'Service unavailable' });
    }
  });
  return router;
};
