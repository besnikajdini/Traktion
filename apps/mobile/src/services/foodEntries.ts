import type { CreateFoodEntryInput, DailyNutritionSummary, FoodEntry } from '@traktion/shared-types';
import { api } from './api';

export function listFoodEntries(date: string): Promise<FoodEntry[]> {
  return api.get<FoodEntry[]>(`/food-entries?date=${date}`);
}

export function getDailySummary(date: string): Promise<DailyNutritionSummary> {
  return api.get<DailyNutritionSummary>(`/food-entries/summary?date=${date}`);
}

export function createFoodEntry(input: CreateFoodEntryInput): Promise<FoodEntry> {
  return api.post<FoodEntry>('/food-entries', input);
}

export function deleteFoodEntry(id: string): Promise<void> {
  return api.delete(`/food-entries/${id}`);
}
