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
    
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      headers: {
        get: (header) => header === 'content-type' ? 'application/json' : null
      },
      json: () => Promise.resolve(body)
    });
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
    expect(res.statusCode).toBe(404);
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
    expect(res.body.error).toBe('Invalid block number');
  });

  test('invalid block hash format', async () => {
    const res = await request(app).get('/api/v1/blocks/hash/0xinvalidhash');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid block hash');
  });

  test('valid block hash format', async () => {
    const validHash = '0x' + 'a'.repeat(64);
    const res = await request(app).get('/api/v1/blocks/hash/' + validHash);
    expect(res.statusCode).toBe(200);
  });

  test('invalid transaction id format', async () => {
    const res = await request(app).get('/api/v1/transactions/0xinvalidtx');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid transaction id');
  });

  test('invalid account address format', async () => {
    const res = await request(app).get('/api/v1/accounts/invalid');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid address');
  });

  test('valid account address with checksum', async () => {
    const validAddr = 'T' + 'A'.repeat(39);
    const res = await request(app).get('/api/v1/accounts/' + validAddr);
    expect(res.statusCode).toBe(200);
  });

  test('pagination auto-corrects negative page number', async () => {
    const res = await request(app).get('/api/v1/blocks?page=-1&limit=10');
    expect(res.statusCode).toBe(200);
    // Validator auto-corrects -1 to 1
    expect(res.body.blocks).toBeDefined();
  });

  test('pagination auto-corrects excessive limit', async () => {
    const res = await request(app).get('/api/v1/blocks?page=1&limit=1000');
    expect(res.statusCode).toBe(200);
    // Validator caps limit at maxLimit (100)
    expect(res.body.blocks).toBeDefined();
  });

  test('pagination with default values', async () => {
    const res = await request(app).get('/api/v1/blocks');
    expect(res.statusCode).toBe(200);
    expect(res.body.blocks).toBeDefined();
  });

  test('404 for unknown API route', async () => {
    const res = await request(app).get('/api/v1/unknown');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('API route not found');
  });

  test('health endpoint returns version', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBeDefined();
    expect(res.body.uptime).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
  });

  test('health endpoint alternative path', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('content-type validation for POST requests', async () => {
    const res = await request(app)
      .post('/api/v1/blocks')
      .set('Content-Type', 'text/plain')
      .send('invalid data');
    expect(res.statusCode).toBe(415);
    expect(res.body.error).toContain('Content-Type');
  });
});
