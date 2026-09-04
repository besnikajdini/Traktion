import type {
  Exercise,
  ExerciseFilterOptions,
  ExerciseProgressPoint,
  PersonalRecord,
  SetLogWithSession,
} from '@traktion/shared-types';
import { api } from './api';

export interface ExerciseSearchFilters {
  search?: string;
  bodyParts?: string[];
  equipment?: string[];
}

function buildFilterParams(filters: ExerciseSearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set('search', filters.search.trim());
  if (filters.bodyParts?.length) params.set('bodyPart', filters.bodyParts.join(','));
  if (filters.equipment?.length) params.set('equipment', filters.equipment.join(','));
  return params;
}

export function searchExercises(filters: ExerciseSearchFilters): Promise<Exercise[]> {
  const query = buildFilterParams(filters).toString();
  return api.get<Exercise[]>(`/exercises${query ? `?${query}` : ''}`);
}

export async function countExercises(filters: ExerciseSearchFilters): Promise<number> {
  const query = buildFilterParams(filters).toString();
  const result = await api.get<{ count: number }>(`/exercises/count${query ? `?${query}` : ''}`);
  return result.count;
}

export function getExerciseFilters(): Promise<ExerciseFilterOptions> {
  return api.get<ExerciseFilterOptions>('/exercises/filters');
}

export function getExercise(id: string): Promise<Exercise> {
  return api.get<Exercise>(`/exercises/${id}`);
}

export function getExerciseProgress(id: string): Promise<ExerciseProgressPoint[]> {
  return api.get<ExerciseProgressPoint[]>(`/exercises/${id}/progress`);
}

export function getExerciseHistory(id: string): Promise<SetLogWithSession[]> {
  return api.get<SetLogWithSession[]>(`/exercises/${id}/history`);
}

export function getExercisePersonalBests(id: string): Promise<PersonalRecord[]> {
  return api.get<PersonalRecord[]>(`/exercises/${id}/personal-records`);
}
