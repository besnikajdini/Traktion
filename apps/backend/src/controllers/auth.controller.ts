import type { NextFunction, Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { AuthError } from '../services/auth.service';

function toUserDto(user: { id: string; email: string; name: string; createdAt: Date; dailyCalorieGoal: number | null }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    dailyCalorieGoal: user.dailyCalorieGoal,
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name } = req.body as Record<string, unknown>;

    if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
      res.status(400).json({ error: 'A valid email is required' });
      return;
    }
    if (typeof password !== 'string' || password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }
    if (typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const { user, token } = await authService.register(email.trim().toLowerCase(), password, name.trim());
    res.status(201).json({ user: toUserDto(user), token });
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as Record<string, unknown>;
    if (typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const { user, token } = await authService.login(email.trim().toLowerCase(), password);
    res.json({ user: toUserDto(user), token });
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getUserById(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(toUserDto(user));
  } catch (err) {
    next(err);
  }
}

export async function updateNutritionGoal(req: Request, res: Response, next: NextFunction) {
  try {
    const { dailyCalorieGoal } = req.body as Record<string, unknown>;
    if (typeof dailyCalorieGoal !== 'number' || !Number.isFinite(dailyCalorieGoal) || dailyCalorieGoal <= 0) {
      res.status(400).json({ error: 'dailyCalorieGoal must be a positive number' });
      return;
    }

    const user = await authService.updateNutritionGoal(req.userId, Math.round(dailyCalorieGoal));
    res.json(toUserDto(user));
  } catch (err) {
    next(err);
  }
}
