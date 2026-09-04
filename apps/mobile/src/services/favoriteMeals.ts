import type { CreateFavoriteMealInput, FavoriteMeal, FoodEntry } from '@traktion/shared-types';
import { api } from './api';

export function listFavoriteMeals(): Promise<FavoriteMeal[]> {
  return api.get<FavoriteMeal[]>('/favorite-meals');
}

export function createFavoriteMeal(input: CreateFavoriteMealInput): Promise<FavoriteMeal> {
  return api.post<FavoriteMeal>('/favorite-meals', input);
}

export function logFavoriteMeal(id: string): Promise<FoodEntry> {
  return api.post<FoodEntry>(`/favorite-meals/${id}/log`);
}

export function deleteFavoriteMeal(id: string): Promise<void> {
  return api.delete(`/favorite-meals/${id}`);
}
