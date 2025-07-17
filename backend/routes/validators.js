const express = require('express');
const router = express.Router();

module.exports = fetchRpc => {
  router.get('/v1/validators', async (req, res) => {
    try {
      const data = await fetchRpc('/validators');
      return res.json(data);
    } catch (err) {
      return res.status(503).json({ error: 'Service unavailable' });
    }
  });
  return router;
};
