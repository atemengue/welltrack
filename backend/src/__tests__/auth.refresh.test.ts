import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import app from '../app';
import prisma from '../lib/prisma';

const TEST_EMAIL = 'refresh.user@refresh.test.welltrack';
const PASSWORD = 'securepassword123';

async function registerAndLogin() {
  await request(app).post('/api/auth/register').send({
    email: TEST_EMAIL,
    password: PASSWORD,
    displayName: 'Refresh Test User',
  });
  const res = await request(app).post('/api/auth/login').send({ email: TEST_EMAIL, password: PASSWORD });
  return res.body as { accessToken: string; refreshToken: string };
}

beforeEach(async () => {
  await request(app).post('/api/auth/register').send({
    email: TEST_EMAIL,
    password: PASSWORD,
    displayName: 'Refresh Test User',
  });
});

afterEach(async () => {
  await prisma.refreshToken.deleteMany({ where: { user: { email: { endsWith: '@refresh.test.welltrack' } } } });
  await prisma.user.deleteMany({ where: { email: { endsWith: '@refresh.test.welltrack' } } });
});

describe('POST /api/auth/refresh', () => {
  it('returns 200 with new accessToken and refreshToken for a valid refresh token', async () => {
    const { refreshToken } = await registerAndLogin();

    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.refreshToken).not.toBe(refreshToken);
  });

  it('rotates the token — old refresh token cannot be reused', async () => {
    const { refreshToken } = await registerAndLogin();

    await request(app).post('/api/auth/refresh').send({ refreshToken });

    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(401);
  });

  it('new access token authenticates successfully', async () => {
    const { refreshToken } = await registerAndLogin();
    const refreshRes = await request(app).post('/api/auth/refresh').send({ refreshToken });

    const meRes = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${refreshRes.body.accessToken}`);

    expect(meRes.status).toBe(200);
  });

  it('returns 401 for an invalid token string', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken: 'not-a-token' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when refreshToken field is missing', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/logout', () => {
  it('returns 204 and invalidates the refresh token', async () => {
    const { refreshToken } = await registerAndLogin();

    const logoutRes = await request(app).post('/api/auth/logout').send({ refreshToken });
    expect(logoutRes.status).toBe(204);

    const refreshRes = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(refreshRes.status).toBe(401);
  });

  it('returns 204 even for an already-expired or invalid token', async () => {
    const res = await request(app).post('/api/auth/logout').send({ refreshToken: 'invalid.token.string' });
    expect(res.status).toBe(204);
  });

  it('returns 400 when refreshToken field is missing', async () => {
    const res = await request(app).post('/api/auth/logout').send({});
    expect(res.status).toBe(400);
  });
});
