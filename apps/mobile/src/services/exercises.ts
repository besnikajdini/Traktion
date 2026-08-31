import type { Exercise } from '@traktion/shared-types';
import { api } from './api';

export function searchExercises(search: string): Promise<Exercise[]> {
  const query = search.trim().length > 0 ? `?search=${encodeURIComponent(search.trim())}` : '';
  return api.get<Exercise[]>(`/exercises${query}`);
}
