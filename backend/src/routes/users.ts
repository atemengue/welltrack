import { Router } from 'express';
import { z } from 'zod';
import { AuthRequest, requireAuth } from '../middleware/requireAuth';
import prisma from '../lib/prisma';

const router = Router();

const USER_SELECT = {
  id: true,
  email: true,
  displayName: true,
  timezone: true,
  createdAt: true,
} as const;

// GET /api/users/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as AuthRequest).userId },
      select: USER_SELECT,
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/me
const updateMeSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  timezone: z.string().min(1).optional(),
});

router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const parsed = updateMeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }
    const user = await prisma.user.update({
      where: { id: (req as AuthRequest).userId },
      data: parsed.data,
      select: USER_SELECT,
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/me
router.delete('/me', requireAuth, async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: (req as AuthRequest).userId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
