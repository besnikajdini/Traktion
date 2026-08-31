import type { Request, Response, NextFunction } from 'express';
import * as workoutSessionsService from '../services/workoutSessions.service';

export async function getActive(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await workoutSessionsService.getActiveSession(req.userId);
    res.json(session);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await workoutSessionsService.getSession(req.userId, req.params.id);
    if (!session) {
      res.status(404).json({ error: 'Workout session not found' });
      return;
    }
    res.json(session);
  } catch (err) {
    next(err);
  }
}

export async function start(req: Request, res: Response, next: NextFunction) {
  try {
    const { workoutPlanId } = req.body as Record<string, unknown>;
    if (typeof workoutPlanId !== 'string') {
      res.status(400).json({ error: 'workoutPlanId is required' });
      return;
    }
    const session = await workoutSessionsService.startSession(req.userId, workoutPlanId);
    if (!session) {
      res.status(404).json({ error: 'Workout plan not found' });
      return;
    }
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

export async function end(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await workoutSessionsService.endSession(req.userId, req.params.id);
    if (!session) {
      res.status(404).json({ error: 'Workout session not found' });
      return;
    }
    res.json(session);
  } catch (err) {
    next(err);
  }
}
