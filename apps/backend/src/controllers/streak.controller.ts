import type { Request, Response, NextFunction } from 'express';
import * as streakService from '../services/streak.service';

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const streak = await streakService.getStreak(req.userId);
    res.json(streak);
  } catch (err) {
    next(err);
  }
}
