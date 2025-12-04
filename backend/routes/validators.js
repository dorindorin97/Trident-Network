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
      return res.status(503).json({ error: 'Service unavailable' });
    }
  });
  return router;
};
