const express = require('express');
const router = express.Router();

router.get('/v1/health', (req, res) => {
  // Cache health status for 10 seconds
  res.set('Cache-Control', 'public, max-age=10, stale-while-revalidate=20');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: require('../package.json').version
  });
});

router.get('/health', (req, res) => {
  // Cache health status for 10 seconds
  res.set('Cache-Control', 'public, max-age=10, stale-while-revalidate=20');
  res.json({ status: 'ok' });
});

module.exports = router;
