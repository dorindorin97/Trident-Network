const express = require('express');
const router = express.Router();

router.get('/v1/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: require('../package.json').version
  });
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router;
