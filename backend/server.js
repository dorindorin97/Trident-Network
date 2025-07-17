const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const CHAIN_MODE = process.env.CHAIN_MODE;
const TRIDENT_NODE_RPC_URL = process.env.TRIDENT_NODE_RPC_URL || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const validModes = ['mock', 'rpc'];
if (!CHAIN_MODE || !validModes.includes(CHAIN_MODE)) {
  console.error('CHAIN_MODE must be set to rpc for production deployments.');
  process.exit(1);
}

app.use(helmet());
const allowedOrigins = FRONTEND_URL ? FRONTEND_URL.split(',') : [];
app.use(cors({ origin: allowedOrigins, credentials: true }));
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function fetchRpc(endpoint) {
  const url = `${TRIDENT_NODE_RPC_URL}${endpoint}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`RPC request failed: ${resp.status}`);
  }
  return resp.json();
}

// mock data
require('./mockData');

// routes
app.use('/api', require('./routes/health'));
app.use('/api', require('./routes/blocks')(CHAIN_MODE, fetchRpc));
app.use('/api', require('./routes/transactions')(CHAIN_MODE, fetchRpc));
app.use('/api', require('./routes/accounts')(CHAIN_MODE, fetchRpc));
app.use('/api', require('./routes/validators')(CHAIN_MODE, fetchRpc));

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Generic error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Trident Network API server running on port ${PORT} in ${CHAIN_MODE} mode`);
  });
}

module.exports = app;
