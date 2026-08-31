import type { Request, Response, NextFunction } from 'express';
import * as setLogsService from '../services/setLogs.service';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { workoutSessionId, exerciseId, setNumber, reps, weightKg, rpe } = req.body as Record<string, unknown>;

    if (
      typeof workoutSessionId !== 'string' ||
      typeof exerciseId !== 'string' ||
      typeof setNumber !== 'number' ||
      typeof reps !== 'number' ||
      typeof weightKg !== 'number'
    ) {
      res.status(400).json({ error: 'Invalid set log payload' });
      return;
    }

    const setLog = await setLogsService.createSetLog(req.userId, {
      workoutSessionId,
      exerciseId,
      setNumber,
      reps,
      weightKg,
      rpe: typeof rpe === 'number' ? rpe : null,
    });

    if (!setLog) {
      res.status(404).json({ error: 'Workout session not found' });
      return;
    }
    res.status(201).json(setLog);
  } catch (err) {
    next(err);
  }
}

export async function getLast(req: Request, res: Response, next: NextFunction) {
  try {
    const exerciseId = req.query.exerciseId;
    if (typeof exerciseId !== 'string') {
      res.status(400).json({ error: 'exerciseId query param is required' });
      return;
    }
    const setLog = await setLogsService.getLastSetLog(req.userId, exerciseId);
    res.json(setLog);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await setLogsService.deleteSetLog(req.userId, req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Set log not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
