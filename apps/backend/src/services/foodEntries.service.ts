import type { MealType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { estimateMacros } from './nutrition.service';

// "Today" is a UTC calendar day (same simplification as streak.service.ts's
// ISO weeks) — the mobile app passes its own local date string so the day
// boundary matches what the user actually sees on screen.
function dayRange(date: Date): { start: Date; end: Date } {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export async function createFoodEntry(userId: string, mealType: MealType, description: string) {
  const macros = await estimateMacros(description);
  return prisma.foodEntry.create({
    data: { userId, mealType, description, ...macros },
  });
}

export function listFoodEntriesForDay(userId: string, date: Date) {
  const { start, end } = dayRange(date);
  return prisma.foodEntry.findMany({
    where: { userId, loggedAt: { gte: start, lt: end } },
    orderBy: { loggedAt: 'asc' },
  });
}

export async function getDailySummary(userId: string, date: Date) {
  const [entries, user] = await Promise.all([
    listFoodEntriesForDay(userId, date),
    prisma.user.findUnique({ where: { id: userId }, select: { dailyCalorieGoal: true } }),
  ]);

  const totals = entries.reduce(
    (sum, e) => ({
      calories: sum.calories + e.calories,
      protein: sum.protein + e.protein,
      carbs: sum.carbs + e.carbs,
      fat: sum.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const goalCalories = user?.dailyCalorieGoal ?? null;

  return {
    entries,
    totals,
    goalCalories,
    remainingCalories: goalCalories !== null ? goalCalories - totals.calories : null,
  };
}

export async function deleteFoodEntry(userId: string, id: string): Promise<boolean> {
  const result = await prisma.foodEntry.deleteMany({ where: { id, userId } });
  return result.count > 0;
}
