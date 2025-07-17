const request = require('supertest');

process.env.CHAIN_MODE = 'rpc';
process.env.TRIDENT_NODE_RPC_URL = 'http://rpc';

beforeAll(() => {
  global.fetch = jest.fn(url => {
    const path = url.replace(process.env.TRIDENT_NODE_RPC_URL, '');
    let status = 200;
    let body = {};
    if (path.startsWith('/blocks')) {
      if (path === '/blocks/latest') {
        body = { number: 1 };
      } else if (path.startsWith('/blocks?')) {
        body = { blocks: [{}, {}] };
      } else {
        body = {};
      }
    } else if (path.startsWith('/transactions/')) {
      status = 404;
      body = { error: 'not found' };
    } else if (path.startsWith('/accounts/')) {
      body = { balance: 0, transactions: [] };
    } else if (path === '/validators') {
      body = [];
    }
    return Promise.resolve(new Response(JSON.stringify(body), { status }));
  });
});

afterAll(() => {
  global.fetch.mockRestore();
});

const app = require('../server');

describe('API routes', () => {
  test('health', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('list blocks', async () => {
    const res = await request(app).get('/api/v1/blocks?page=1&limit=2');
    expect(res.statusCode).toBe(200);
    expect(res.body.blocks.length).toBe(2);
  });

  test('latest block', async () => {
    const res = await request(app).get('/api/v1/blocks/latest');
    expect(res.statusCode).toBe(200);
    expect(res.body.number).toBeDefined();
  });

  test('block by number', async () => {
    const res = await request(app).get('/api/v1/blocks/123456');
    expect(res.statusCode).toBe(200);
  });

  test('transaction by id not found', async () => {
    const res = await request(app).get('/api/v1/transactions/0x' + 'a'.repeat(64));
    expect(res.statusCode).toBe(503);
  });

  test('account by address', async () => {
    const addr = 'T' + 'A'.repeat(39);
    const res = await request(app).get('/api/v1/accounts/' + addr);
    expect(res.statusCode).toBe(200);
    expect(res.body.balance).toBe(0);
  });

  test('validators', async () => {
    const res = await request(app).get('/api/v1/validators');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('invalid block number', async () => {
    const res = await request(app).get('/api/v1/blocks/abc');
    expect(res.statusCode).toBe(400);
  });
});
