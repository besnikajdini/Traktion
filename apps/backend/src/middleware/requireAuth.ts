import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../lib/jwt';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;

  if (!token) {
    res.status(401).json({ error: 'Missing Authorization header' });
    return;
  }

  try {
    req.userId = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
