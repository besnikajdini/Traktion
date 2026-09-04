import type { NextFunction, Request, Response } from 'express';
import { MealType } from '@prisma/client';
import * as favoriteMealsService from '../services/favoriteMeals.service';

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const favorites = await favoriteMealsService.listFavoriteMeals(req.userId);
    res.json(favorites);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { mealType, description, calories, protein, carbs, fat } = req.body as Record<string, unknown>;

    if (typeof mealType !== 'string' || !(mealType in MealType)) {
      res.status(400).json({ error: 'mealType must be one of BREAKFAST, LUNCH, DINNER, SNACK' });
      return;
    }
    if (typeof description !== 'string' || description.trim().length === 0) {
      res.status(400).json({ error: 'description is required' });
      return;
    }
    if (![calories, protein, carbs, fat].every(isFiniteNumber)) {
      res.status(400).json({ error: 'calories, protein, carbs and fat must be numbers' });
      return;
    }

    const favorite = await favoriteMealsService.createFavoriteMeal(req.userId, {
      mealType: mealType as MealType,
      description: description.trim(),
      calories: calories as number,
      protein: protein as number,
      carbs: carbs as number,
      fat: fat as number,
    });
    res.status(201).json(favorite);
  } catch (err) {
    next(err);
  }
}

export async function log(req: Request, res: Response, next: NextFunction) {
  try {
    const entry = await favoriteMealsService.logFavoriteMeal(req.userId, req.params.id);
    if (!entry) {
      res.status(404).json({ error: 'Favorite meal not found' });
      return;
    }
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await favoriteMealsService.deleteFavoriteMeal(req.userId, req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Favorite meal not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
