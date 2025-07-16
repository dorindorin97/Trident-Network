const request = require('supertest');
const app = require('../server');

describe('API routes', () => {
  test('/api/v1/health', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('invalid block number', async () => {
    const res = await request(app).get('/api/v1/blocks/abc');
    expect(res.statusCode).toBe(400);
  });
});
