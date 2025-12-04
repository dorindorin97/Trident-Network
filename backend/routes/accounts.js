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
      return res.status(503).json({ error: 'Service unavailable' });
    }
  });
  return router;
};
