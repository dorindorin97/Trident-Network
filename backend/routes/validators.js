const express = require('express');
const { validators } = require('../mockData');
const router = express.Router();

module.exports = (CHAIN_MODE, fetchRpc) => {
  router.get('/v1/validators', async (req, res) => {
    if (CHAIN_MODE === 'rpc') {
      try {
        const data = await fetchRpc('/validators');
        return res.json(data);
      } catch (err) {
        return res.status(503).json({ error: 'Service unavailable' });
      }
    }
    res.json(validators);
  });
  return router;
};
