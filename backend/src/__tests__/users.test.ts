import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import app from '../app';
import prisma from '../lib/prisma';

const DOMAIN = '@users.test.welltrack';

async function registerAndLogin(email: string) {
  await request(app).post('/api/auth/register').send({ email, password: 'password123', displayName: 'Test User' });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
  return res.body.accessToken as string;
}

afterEach(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: DOMAIN } } });
});

describe('GET /api/users/me', () => {
  it('returns the authenticated user', async () => {
    const token = await registerAndLogin(`me${DOMAIN}`);
    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(`me${DOMAIN}`);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/users/me', () => {
  it('updates displayName and timezone', async () => {
    const token = await registerAndLogin(`patch${DOMAIN}`);
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ displayName: 'Updated Name', timezone: 'America/New_York' });

    expect(res.status).toBe(200);
    expect(res.body.user.displayName).toBe('Updated Name');
    expect(res.body.user.timezone).toBe('America/New_York');
  });

  it('returns 400 for an empty displayName', async () => {
    const token = await registerAndLogin(`patch2${DOMAIN}`);
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ displayName: '' });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/users/me', () => {
  it('deletes the user and returns 204', async () => {
    const token = await registerAndLogin(`delete${DOMAIN}`);
    const res = await request(app).delete('/api/users/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).delete('/api/users/me');
    expect(res.status).toBe(401);
  });
});
