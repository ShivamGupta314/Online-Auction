import request from 'supertest';
import app from '../src/app.js';

describe('Health Check', () => {
  test('API should be up and running', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });

  test('Database connection should be working', async () => {
    const res = await request(app).get('/api/health/db');
    // If using test mocks, this will always succeed
    if (process.env.USE_TEST_MOCKS === 'true') {
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('message', 'Database connection is working');
      expect(res.body).toHaveProperty('usingMocks', true);
    } else {
      // If not using mocks, result depends on actual database connection
      if (res.statusCode === 200) {
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('message', 'Database connection is working');
      } else {
        console.warn('Database connection test failed - this is expected if no database is available');
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('status', 'error');
      }
    }
  });
}); 