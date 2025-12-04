const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

module.exports = fetchRpc => {
  router.get('/v1/validators', async (req, res) => {
    try {
      const data = await fetchRpc('/validators');
      return res.json(data);
    } catch (err) {
      logger.error('Failed to fetch validators', {
        endpoint: '/v1/validators',
        error: err.message,
        requestId: req.id
      });
      const status = err.message.includes('timeout') ? 504 : 503;
      return res.status(status).json({ error: err.message || 'Service unavailable' });
    }
  });
  return router;
};
