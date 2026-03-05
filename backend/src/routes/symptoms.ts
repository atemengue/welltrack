import { Router } from 'express';
import { z } from 'zod';
import { AuthRequest, requireAuth } from '../middleware/requireAuth';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/symptoms — system defaults + user's own
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as AuthRequest).userId;
    const symptoms = await prisma.symptom.findMany({
      where: { OR: [{ userId: null }, { userId }] },
      orderBy: { name: 'asc' },
    });
    res.json({ symptoms });
  } catch (err) {
    next(err);
  }
});

// POST /api/symptoms — create custom symptom
const createSymptomSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(50),
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const parsed = createSymptomSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }
    const symptom = await prisma.symptom.create({
      data: { ...parsed.data, userId: (req as AuthRequest).userId },
    });
    res.status(201).json({ symptom });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/symptoms/:id — update own symptom only
const updateSymptomSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.string().min(1).max(50).optional(),
  isActive: z.boolean().optional(),
});

router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as AuthRequest).userId;
    const existing = await prisma.symptom.findUnique({ where: { id: String(req.params.id) } });

    if (!existing) {
      res.status(404).json({ error: 'Symptom not found' });
      return;
    }
    if (existing.userId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const parsed = updateSymptomSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const symptom = await prisma.symptom.update({ where: { id: String(req.params.id) }, data: parsed.data });
    res.json({ symptom });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/symptoms/:id — delete own custom symptom only
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as AuthRequest).userId;
    const existing = await prisma.symptom.findUnique({ where: { id: String(req.params.id) } });

    if (!existing) {
      res.status(404).json({ error: 'Symptom not found' });
      return;
    }
    if (existing.userId === null) {
      res.status(403).json({ error: 'Cannot delete system symptoms' });
      return;
    }
    if (existing.userId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await prisma.symptom.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
