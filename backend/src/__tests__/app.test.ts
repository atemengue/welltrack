import request from 'supertest';
import app from '../app';

describe('App', () => {
  describe('GET /api/health', () => {
    it('returns 200 with status ok', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });

    it('returns JSON content-type', async () => {
      const res = await request(app).get('/api/health');

      expect(res.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Unknown routes', () => {
    it('returns 404 for undefined routes', async () => {
      const res = await request(app).get('/api/unknown-route');

      expect(res.status).toBe(404);
    });
  });
});
