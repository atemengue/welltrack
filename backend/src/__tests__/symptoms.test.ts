import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import app from '../app';
import prisma from '../lib/prisma';

const DOMAIN = '@symptoms.test.welltrack';

async function registerAndLogin(email: string) {
  await request(app).post('/api/auth/register').send({ email, password: 'password123', displayName: 'Test User' });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
  return res.body.accessToken as string;
}

afterEach(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: DOMAIN } } });
});

describe('GET /api/symptoms', () => {
  it('returns system symptoms and user custom symptoms', async () => {
    const token = await registerAndLogin(`get${DOMAIN}`);

    // Create a custom symptom first
    await request(app)
      .post('/api/symptoms')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My Custom Symptom', category: 'other' });

    const res = await request(app).get('/api/symptoms').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.symptoms)).toBe(true);
    // Should include system defaults (seeded) and our custom one
    const names = res.body.symptoms.map((s: { name: string }) => s.name);
    expect(names).toContain('Headache'); // system default
    expect(names).toContain('My Custom Symptom');
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/symptoms');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/symptoms', () => {
  it('creates a custom symptom and returns 201', async () => {
    const token = await registerAndLogin(`post${DOMAIN}`);
    const res = await request(app)
      .post('/api/symptoms')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Symptom', category: 'pain' });

    expect(res.status).toBe(201);
    expect(res.body.symptom.name).toBe('Test Symptom');
    expect(res.body.symptom.userId).not.toBeNull();
  });

  it('returns 400 for missing fields', async () => {
    const token = await registerAndLogin(`post2${DOMAIN}`);
    const res = await request(app)
      .post('/api/symptoms')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'No Category' });

    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/symptoms/:id', () => {
  it('updates own custom symptom', async () => {
    const token = await registerAndLogin(`patch${DOMAIN}`);
    const create = await request(app)
      .post('/api/symptoms')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Old Name', category: 'pain' });

    const res = await request(app)
      .patch(`/api/symptoms/${create.body.symptom.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Name' });

    expect(res.status).toBe(200);
    expect(res.body.symptom.name).toBe('New Name');
  });

  it('returns 403 when patching another user\'s symptom', async () => {
    const tokenA = await registerAndLogin(`patchA${DOMAIN}`);
    const tokenB = await registerAndLogin(`patchB${DOMAIN}`);

    const create = await request(app)
      .post('/api/symptoms')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'User A Symptom', category: 'pain' });

    const res = await request(app)
      .patch(`/api/symptoms/${create.body.symptom.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ name: 'Hijacked' });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/symptoms/:id', () => {
  it('deletes own custom symptom and returns 204', async () => {
    const token = await registerAndLogin(`delete${DOMAIN}`);
    const create = await request(app)
      .post('/api/symptoms')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'To Delete', category: 'pain' });

    const res = await request(app)
      .delete(`/api/symptoms/${create.body.symptom.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it('returns 403 when trying to delete a system symptom', async () => {
    const token = await registerAndLogin(`deleteSys${DOMAIN}`);
    const systemSymptom = await prisma.symptom.findFirst({ where: { userId: null } });

    const res = await request(app)
      .delete(`/api/symptoms/${systemSymptom!.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
