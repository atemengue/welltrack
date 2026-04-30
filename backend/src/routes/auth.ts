import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import prisma from '../lib/prisma';

const router = Router();

const USER_SELECT = {
  id: true,
  email: true,
  displayName: true,
  timezone: true,
  createdAt: true,
} as const;

// ── Register ──────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1).max(100),
});

router.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email, password, displayName } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, displayName },
      select: USER_SELECT,
    });

    const accessToken = signAccessToken(user.id);
    res.status(201).json({ user, accessToken });
  } catch (err) {
    next(err);
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const accessToken = signAccessToken(user.id);
    const { token: refreshToken, jti, expiresAt } = signRefreshToken(user.id);

    await prisma.refreshToken.create({ data: { userId: user.id, jti, expiresAt } });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        timezone: user.timezone,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

// ── Refresh ───────────────────────────────────────────────────────────────────

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

router.post('/refresh', async (req, res, next) => {
  try {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }

    let payload: { sub: string; jti: string };
    try {
      payload = verifyRefreshToken(parsed.data.refreshToken);
    } catch {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    const stored = await prisma.refreshToken.findUnique({ where: { jti: payload.jti } });
    if (!stored || stored.expiresAt < new Date()) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    // Rotate: delete the used token and issue a new pair
    await prisma.refreshToken.delete({ where: { jti: payload.jti } });

    const accessToken = signAccessToken(payload.sub);
    const { token: newRefreshToken, jti, expiresAt } = signRefreshToken(payload.sub);
    await prisma.refreshToken.create({ data: { userId: payload.sub, jti, expiresAt } });

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
});

// ── Logout ────────────────────────────────────────────────────────────────────

const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

router.post('/logout', async (req, res, next) => {
  try {
    const parsed = logoutSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }

    let payload: { sub: string; jti: string };
    try {
      payload = verifyRefreshToken(parsed.data.refreshToken);
    } catch {
      // Token is already invalid — treat as logged out
      res.status(204).send();
      return;
    }

    await prisma.refreshToken.deleteMany({ where: { jti: payload.jti } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
