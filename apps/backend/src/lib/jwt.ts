import jwt from 'jsonwebtoken';

const JWT_SECRET: string = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set — copy .env.example to .env and set one.');
  }
  return secret;
})();

const TOKEN_TTL = '30d';

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): string {
  const payload = jwt.verify(token, JWT_SECRET);
  if (typeof payload === 'string' || typeof payload.sub !== 'string') {
    throw new Error('Invalid token payload');
  }
  return payload.sub;
}
