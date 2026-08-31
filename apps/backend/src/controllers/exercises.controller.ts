import type { Request, Response, NextFunction } from 'express';
import * as exercisesService from '../services/exercises.service';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const muscleGroup = typeof req.query.muscleGroup === 'string' ? req.query.muscleGroup : undefined;
    const exercises = await exercisesService.searchExercises(search, muscleGroup);
    res.json(exercises);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const exercise = await exercisesService.getExerciseById(req.params.id);
    if (!exercise) {
      res.status(404).json({ error: 'Exercise not found' });
      return;
    }
    res.json(exercise);
  } catch (err) {
    next(err);
  }
}
