import type { MealType } from '@prisma/client';
import { prisma } from '../lib/prisma';

export interface CreateFavoriteMealInput {
  mealType: MealType;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function listFavoriteMeals(userId: string) {
  return prisma.favoriteMeal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}

export function createFavoriteMeal(userId: string, input: CreateFavoriteMealInput) {
  return prisma.favoriteMeal.create({ data: { userId, ...input } });
}

// Re-logs a favorite with its already-computed macros — no re-typing the
// description and no re-running (billed) macro estimation.
export async function logFavoriteMeal(userId: string, favoriteId: string) {
  const favorite = await prisma.favoriteMeal.findFirst({ where: { id: favoriteId, userId } });
  if (!favorite) return null;

  return prisma.foodEntry.create({
    data: {
      userId,
      mealType: favorite.mealType,
      description: favorite.description,
      calories: favorite.calories,
      protein: favorite.protein,
      carbs: favorite.carbs,
      fat: favorite.fat,
    },
  });
}

export async function deleteFavoriteMeal(userId: string, id: string): Promise<boolean> {
  const result = await prisma.favoriteMeal.deleteMany({ where: { id, userId } });
  return result.count > 0;
}
