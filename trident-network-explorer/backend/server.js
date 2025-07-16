const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// mock data
const latestBlock = {
  number: 123456,
  hash: '0xabcdef1234567890',
  timestamp: new Date().toISOString(),
  validator: 'TVALIDATORADDRESS'
};

const accounts = {
  'TADDRESS1': {
    balance: 1000,
    transactions: [
      { txid: '0x1', amount: 100, type: 'send', timestamp: new Date().toISOString() },
      { txid: '0x2', amount: 50, type: 'receive', timestamp: new Date().toISOString() }
    ]
  }
};

const validators = [
  { address: 'TVALIDATOR1', power: 1000, status: 'active' },
  { address: 'TVALIDATOR2', power: 900, status: 'active' },
  { address: 'TVALIDATOR3', power: 500, status: 'inactive' }
];

// routes
app.get('/api/v1/blocks/latest', (req, res) => {
  res.json(latestBlock);
});

app.get('/api/v1/accounts/:address', (req, res) => {
  const addr = req.params.address;
  const data = accounts[addr] || { balance: 0, transactions: [] };
  res.json(data);
});

app.get('/api/v1/validators', (req, res) => {
  res.json(validators);
});

app.listen(PORT, () => {
  console.log(`Trident Network mock API server running on port ${PORT}`);
});
