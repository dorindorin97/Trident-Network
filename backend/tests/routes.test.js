const request = require('supertest');
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
  });
});
