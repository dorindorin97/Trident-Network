const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const CHAIN_MODE = process.env.CHAIN_MODE || 'mock';
const TRIDENT_NODE_RPC_URL = process.env.TRIDENT_NODE_RPC_URL || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({ origin: FRONTEND_URL }));
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
const { latestBlock, blocks, accounts, validators } = require('./mockData');

// routes
app.use('/api', require('./routes/health'));
app.use('/api', require('./routes/blocks')(CHAIN_MODE, fetchRpc));
app.use('/api', require('./routes/transactions')(CHAIN_MODE, fetchRpc));
app.use('/api', require('./routes/accounts')(CHAIN_MODE, fetchRpc));
app.use('/api', require('./routes/validators')(CHAIN_MODE, fetchRpc));

app.listen(PORT, () => {
  console.log(`Trident Network API server running on port ${PORT} in ${CHAIN_MODE} mode`);
});
