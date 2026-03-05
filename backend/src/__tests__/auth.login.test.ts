import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import app from '../app';
import prisma from '../lib/prisma';

const TEST_EMAIL = 'login.user@login.test.welltrack';
const PASSWORD = 'securepassword123';

beforeEach(async () => {
  // Seed a user to log in with
  await request(app).post('/api/auth/register').send({
    email: TEST_EMAIL,
    password: PASSWORD,
    displayName: 'Login Test User',
  });
});

afterEach(async () => {
  await prisma.refreshToken.deleteMany({ where: { user: { email: { endsWith: '@login.test.welltrack' } } } });
  await prisma.user.deleteMany({ where: { email: { endsWith: '@login.test.welltrack' } } });
});

describe('POST /api/auth/login', () => {
  it('returns 200 with user, accessToken and refreshToken on valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: TEST_EMAIL, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(TEST_EMAIL);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('does not expose passwordHash in response', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: TEST_EMAIL, password: PASSWORD });

    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('stores the refresh token jti in the database', async () => {
    await request(app).post('/api/auth/login').send({ email: TEST_EMAIL, password: PASSWORD });

    const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
    const stored = await prisma.refreshToken.findFirst({ where: { userId: user!.id } });
    expect(stored).not.toBeNull();
  });

  it('returns 401 for a wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: TEST_EMAIL, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('returns 401 for a non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@login.test.welltrack', password: PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('returns 400 for missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({});

    expect(res.status).toBe(400);
  });
});

describe('requireAuth middleware', () => {
  it('returns 401 with no Authorization header', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with a malformed token', async () => {
    const res = await request(app).get('/api/users/me').set('Authorization', 'Bearer not-a-token');
    expect(res.status).toBe(401);
  });

  it('accepts a valid access token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: PASSWORD });

    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`);

    expect(res.status).not.toBe(401);
  });
});
