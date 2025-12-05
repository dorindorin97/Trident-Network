const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { ERROR_CODES } = require('../utils/error-codes');

module.exports = fetchRpc => {
  router.get('/v1/validators', async (req, res) => {
    try {
      const data = await fetchRpc('/validators');
      // Cache validator list for 60 seconds - stable data
      res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
      return res.json(data);
    } catch (err) {
      logger.error('Failed to fetch validators', {
        endpoint: '/v1/validators',
        error: err.message,
        requestId: req.id
      });
      const status = err.message.includes('timeout') ? 504 : 503;
      return res.status(status).json(ERROR_CODES.SERVICE_UNAVAILABLE);
    }
  });

  return router;
};
