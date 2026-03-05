import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import app from '../app';
import prisma from '../lib/prisma';

const TEST_EMAIL_DOMAIN = '@register.test.welltrack';

afterEach(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: TEST_EMAIL_DOMAIN } } });
});

const validPayload = {
  email: `user${TEST_EMAIL_DOMAIN}`,
  password: 'securepassword123',
  displayName: 'Test User',
};

describe('POST /api/auth/register', () => {
  it('returns 201 with user and accessToken on success', async () => {
    const res = await request(app).post('/api/auth/register').send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(validPayload.email);
    expect(res.body.user.displayName).toBe(validPayload.displayName);
    expect(res.body.accessToken).toBeDefined();
    expect(typeof res.body.accessToken).toBe('string');
  });

  it('does not expose passwordHash in the response', async () => {
    const res = await request(app).post('/api/auth/register').send(validPayload);

    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('stores a hashed password, not the plain-text password', async () => {
    await request(app).post('/api/auth/register').send(validPayload);

    const dbUser = await prisma.user.findUnique({ where: { email: validPayload.email } });
    expect(dbUser?.passwordHash).not.toBe(validPayload.password);
    expect(dbUser?.passwordHash).toMatch(/^\$2[ab]\$/); // bcrypt hash prefix
  });

  it('returns 409 when email is already registered', async () => {
    await request(app).post('/api/auth/register').send(validPayload);
    const res = await request(app).post('/api/auth/register').send(validPayload);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email already in use');
  });

  it('returns 400 for an invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('returns 400 when password is shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, email: `short${TEST_EMAIL_DOMAIN}`, password: 'abc' });

    expect(res.status).toBe(400);
    expect(res.body.details.password).toBeDefined();
  });

  it('returns 400 when displayName is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: validPayload.email, password: validPayload.password });

    expect(res.status).toBe(400);
  });

  it('returns 400 when body is empty', async () => {
    const res = await request(app).post('/api/auth/register').send({});

    expect(res.status).toBe(400);
  });
});
