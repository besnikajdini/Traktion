import type { NextFunction, Request, Response } from 'express';
import { MealType } from '@prisma/client';
import * as foodEntriesService from '../services/foodEntries.service';
import { NutritionEstimationError } from '../services/nutrition.service';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseDateParam(value: unknown): Date | null {
  if (value === undefined) return new Date();
  if (typeof value !== 'string' || !DATE_RE.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const date = parseDateParam(req.query.date);
    if (!date) {
      res.status(400).json({ error: 'date must be formatted as YYYY-MM-DD' });
      return;
    }
    const entries = await foodEntriesService.listFoodEntriesForDay(req.userId, date);
    res.json(entries);
  } catch (err) {
    next(err);
  }
}

export async function getSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const date = parseDateParam(req.query.date);
    if (!date) {
      res.status(400).json({ error: 'date must be formatted as YYYY-MM-DD' });
      return;
    }
    const summary = await foodEntriesService.getDailySummary(req.userId, date);
    res.json(summary);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { mealType, description } = req.body as Record<string, unknown>;

    if (typeof mealType !== 'string' || !(mealType in MealType)) {
      res.status(400).json({ error: 'mealType must be one of BREAKFAST, LUNCH, DINNER, SNACK' });
      return;
    }
    if (typeof description !== 'string' || description.trim().length === 0) {
      res.status(400).json({ error: 'description is required' });
      return;
    }

    const entry = await foodEntriesService.createFoodEntry(req.userId, mealType as MealType, description.trim());
    res.status(201).json(entry);
  } catch (err) {
    if (err instanceof NutritionEstimationError) {
      res.status(422).json({
        error: "Non siamo riusciti a stimare i macro per questo pasto. Prova a descriverlo in modo più preciso (es. quantità e alimento).",
      });
      return;
    }
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await foodEntriesService.deleteFoodEntry(req.userId, req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Food entry not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
