import type { Request, Response, NextFunction } from 'express';
import * as exercisesService from '../services/exercises.service';

function stringParam(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

/** Accepts either a comma-separated string ("chest,back") or repeated query
 *  keys (Express gives an array for `?x=a&x=b`). Returns undefined when empty
 *  so callers can treat "no filter" uniformly. */
function arrayParam(value: unknown): string[] | undefined {
  const raw = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
  const values = raw.map((v) => String(v).trim()).filter(Boolean);
  return values.length > 0 ? values : undefined;
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const search = stringParam(req.query.search);
    const bodyPart = arrayParam(req.query.bodyPart);
    const equipment = arrayParam(req.query.equipment);
    const exercises = await exercisesService.searchExercises(search, bodyPart, equipment);
    res.json(exercises);
  } catch (err) {
    next(err);
  }
}

export async function count(req: Request, res: Response, next: NextFunction) {
  try {
    const search = stringParam(req.query.search);
    const bodyPart = arrayParam(req.query.bodyPart);
    const equipment = arrayParam(req.query.equipment);
    const total = await exercisesService.countExercises(search, bodyPart, equipment);
    res.json({ count: total });
  } catch (err) {
    next(err);
  }
}

export async function getFilters(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = await exercisesService.getFilterOptions();
    res.json(filters);
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

export async function getProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const progress = await exercisesService.getExerciseProgress(req.userId, req.params.id);
    res.json(progress);
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const history = await exercisesService.getExerciseHistory(req.userId, req.params.id);
    res.json(history);
  } catch (err) {
    next(err);
  }
}

export async function getPersonalBests(req: Request, res: Response, next: NextFunction) {
  try {
    const bests = await exercisesService.getExercisePersonalBests(req.userId, req.params.id);
    res.json(bests);
  } catch (err) {
    next(err);
  }
}
