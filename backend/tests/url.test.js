const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  // require app after mongoose connect so models work with this connection
  app = require('../src/app');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('URL Shortener API', () => {
  let shortCode;

  test('POST /api/shorten - create short url', async () => {
    const res = await request(app).post('/api/shorten').send({ originalUrl: 'http://example.com' });
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.shortCode).toBeDefined();
    shortCode = res.body.data.shortCode;
  });

  test('GET /api/urls - list urls', async () => {
    const res = await request(app).get('/api/urls');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /:shortCode - redirect and track click', async () => {
    const res = await request(app).get(`/${shortCode}`);
    // should redirect (302) to original URL
    expect([301, 302]).toContain(res.statusCode);
    expect(res.headers.location).toBe('http://example.com');
  });

  test('GET /api/urls/:shortCode/analytics - returns analytics', async () => {
    const res = await request(app).get(`/api/urls/${shortCode}/analytics`);
    expect(res.statusCode).toBe(200);
    expect(res.body.clicks).toBeGreaterThanOrEqual(1);
    expect(res.body.recent).toBeInstanceOf(Array);
  });

  test('DELETE /api/urls/:shortCode - delete url', async () => {
    const res = await request(app).delete(`/api/urls/${shortCode}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Deleted');
  });

  test('GET analytics after delete - 404', async () => {
    const res = await request(app).get(`/api/urls/${shortCode}/analytics`);
    expect(res.statusCode).toBe(404);
  });
});
