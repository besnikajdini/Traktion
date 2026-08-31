import type { CreateSetLogInput, SetLog } from '@traktion/shared-types';
import { api } from './api';

export function createSetLog(input: CreateSetLogInput): Promise<SetLog> {
  return api.post<SetLog>('/set-logs', input);
}

export function getLastSetLog(exerciseId: string): Promise<SetLog | null> {
  return api.get<SetLog | null>(`/set-logs/last?exerciseId=${encodeURIComponent(exerciseId)}`);
}

export function deleteSetLog(id: string): Promise<void> {
  return api.delete<void>(`/set-logs/${id}`);
}
