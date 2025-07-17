const express = require('express');
const router = express.Router();

function isValidAddress(addr) {
  return /^T[a-zA-Z0-9]{39}$/.test(addr);
}

module.exports = fetchRpc => {
  router.get('/v1/accounts/:address', async (req, res) => {
    if (!isValidAddress(req.params.address)) {
      return res.status(400).json({ error: 'Invalid address' });
    }
    try {
      const data = await fetchRpc(`/accounts/${req.params.address}`);
      return res.json(data);
    } catch (err) {
      return res.status(503).json({ error: 'Service unavailable' });
    }
  });
  return router;
};
