import type { Request, Response, NextFunction } from 'express';
import * as workoutPlansService from '../services/workoutPlans.service';
import type { PlanExerciseInput } from '../services/workoutPlans.service';

function parsePlanBody(body: unknown): { name: string; description: string | null; exercises: PlanExerciseInput[] } | null {
  if (typeof body !== 'object' || body === null) return null;
  const { name, description, exercises } = body as Record<string, unknown>;

  if (typeof name !== 'string' || name.trim().length === 0) return null;
  if (!Array.isArray(exercises)) return null;

  const parsedExercises: PlanExerciseInput[] = [];
  for (const raw of exercises) {
    if (typeof raw !== 'object' || raw === null) return null;
    const { exerciseId, order, targetSets, targetReps, restSeconds } = raw as Record<string, unknown>;
    if (typeof exerciseId !== 'string') return null;
    if (typeof order !== 'number') return null;
    if (typeof targetSets !== 'number' || targetSets <= 0) return null;
    if (typeof restSeconds !== 'number' || restSeconds < 0) return null;
    if (targetReps !== undefined && targetReps !== null && typeof targetReps !== 'number') return null;

    parsedExercises.push({
      exerciseId,
      order,
      targetSets,
      targetReps: typeof targetReps === 'number' ? targetReps : null,
      restSeconds,
    });
  }

  return {
    name: name.trim(),
    description: typeof description === 'string' && description.trim().length > 0 ? description.trim() : null,
    exercises: parsedExercises,
  };
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const plans = await workoutPlansService.listWorkoutPlans(req.userId);
    res.json(
      plans.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        exerciseCount: p._count.planExercises,
        createdAt: p.createdAt,
      })),
    );
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const plan = await workoutPlansService.getWorkoutPlan(req.userId, req.params.id);
    if (!plan) {
      res.status(404).json({ error: 'Workout plan not found' });
      return;
    }
    res.json(plan);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = parsePlanBody(req.body);
    if (!parsed) {
      res.status(400).json({ error: 'Invalid workout plan payload' });
      return;
    }
    const plan = await workoutPlansService.createWorkoutPlan(req.userId, parsed.name, parsed.description, parsed.exercises);
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = parsePlanBody(req.body);
    if (!parsed) {
      res.status(400).json({ error: 'Invalid workout plan payload' });
      return;
    }
    const plan = await workoutPlansService.updateWorkoutPlan(
      req.userId,
      req.params.id,
      parsed.name,
      parsed.description,
      parsed.exercises,
    );
    if (!plan) {
      res.status(404).json({ error: 'Workout plan not found' });
      return;
    }
    res.json(plan);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await workoutPlansService.deleteWorkoutPlan(req.userId, req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Workout plan not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
