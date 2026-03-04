import { afterAll, describe, expect, it } from 'vitest';
import prisma from '../lib/prisma';

describe('Prisma client', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('can connect to the database', async () => {
    const result = await prisma.$queryRaw<{ result: number }[]>`SELECT 1 AS result`;
    expect(result[0]?.result).toBe(1);
  });
});
