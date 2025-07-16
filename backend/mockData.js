const LATEST_NUMBER = 123456;
const latestBlock = {
  number: LATEST_NUMBER,
  hash: '0xabcdef1234567890',
  timestamp: new Date().toISOString(),
  validator: 'TVALIDATORADDRESS'
};

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

module.exports = {
  LATEST_NUMBER,
  latestBlock,
  blocks,
  accounts,
  validators
};
