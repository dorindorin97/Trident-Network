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
app.use(limiter);
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
const LATEST_NUMBER = 123456;
const latestBlock = {
  number: LATEST_NUMBER,
  hash: '0xabcdef1234567890',
  timestamp: new Date().toISOString(),
  validator: 'TVALIDATORADDRESS'
};

// create a list of mock blocks for pagination
const blocks = Array.from({ length: 100 }).map((_, i) => ({
  number: LATEST_NUMBER - i,
  timestamp: new Date(Date.now() - i * 2000).toISOString(),
  validator: `TVALIDATOR${(i % 3) + 1}`
}));

const accounts = {
  TADDRESS1: {
    balance: 1000,
    transactions: [
      {
        txId: '0x1',
        from: 'TADDRESS1',
        to: 'TADDRESS2',
        amount: 100,
        timestamp: new Date(Date.now() - 60000).toISOString()
      },
      {
        txId: '0x2',
        from: 'TADDRESS3',
        to: 'TADDRESS1',
        amount: 50,
        timestamp: new Date(Date.now() - 120000).toISOString()
      }
    ]
  },
  TADDRESS2: {
    balance: 500,
    transactions: [
      {
        txId: '0x3',
        from: 'TADDRESS2',
        to: 'TADDRESS3',
        amount: 20,
        timestamp: new Date(Date.now() - 300000).toISOString()
      }
    ]
  }
};

const validators = [
  { address: 'TVALIDATOR1', power: 1000, status: 'active' },
  { address: 'TVALIDATOR2', power: 900, status: 'active' },
  { address: 'TVALIDATOR3', power: 500, status: 'inactive' }
];

// routes
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/v1/env', (req, res) => {
  res.json(process.env);
});

app.get('/api/v1/blocks/latest', async (req, res) => {
  if (CHAIN_MODE === 'rpc') {
    try {
      const data = await fetchRpc('/blocks/latest');
      return res.json(data);
    } catch (err) {
      return res.status(503).json({ error: 'Service unavailable' });
    }
  }
  res.json(latestBlock);
});

app.get('/api/v1/blocks', async (req, res) => {
  if (CHAIN_MODE === 'rpc') {
    try {
      const q = `?page=${req.query.page || 1}&limit=${req.query.limit || 10}`;
      const data = await fetchRpc(`/blocks${q}`);
      return res.json(data);
    } catch (err) {
      return res.status(503).json({ error: 'Service unavailable' });
    }
  }
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = blocks.slice(start, end);
  res.json({
    page,
    limit,
    total: blocks.length,
    blocks: paginated
  });
});

app.get('/api/v1/accounts/:address', async (req, res) => {
  if (CHAIN_MODE === 'rpc') {
    try {
      const data = await fetchRpc(`/accounts/${req.params.address}`);
      return res.json(data);
    } catch (err) {
      return res.status(503).json({ error: 'Service unavailable' });
    }
  }
  const addr = req.params.address;
  const data = accounts[addr] || { balance: 0, transactions: [] };
  res.json(data);
});

app.get('/api/v1/validators', async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Trident Network API server running on port ${PORT} in ${CHAIN_MODE} mode`);
});
