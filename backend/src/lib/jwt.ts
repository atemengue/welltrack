import jwt from 'jsonwebtoken';

export function signAccessToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return jwt.sign({ sub: userId }, secret, { expiresIn: '15m' });
}
