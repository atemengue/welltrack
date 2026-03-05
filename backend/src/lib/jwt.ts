import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export function signAccessToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return jwt.sign({ sub: userId }, secret, { expiresIn: '15m' });
}

export function signRefreshToken(userId: string): { token: string; jti: string; expiresAt: Date } {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not set');
  const jti = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const token = jwt.sign({ sub: userId, jti }, secret, { expiresIn: '7d' });
  return { token, jti, expiresAt };
}

export function verifyRefreshToken(token: string): { sub: string; jti: string } {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not set');
  return jwt.verify(token, secret) as { sub: string; jti: string };
}
