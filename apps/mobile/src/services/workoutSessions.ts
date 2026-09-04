import type { PersonalRecordWithExercise, StartWorkoutSessionInput, WorkoutSessionDetail } from '@traktion/shared-types';
import { api } from './api';

export function getActiveSession(): Promise<WorkoutSessionDetail | null> {
  return api.get<WorkoutSessionDetail | null>('/workout-sessions/active');
}

export function getSession(id: string): Promise<WorkoutSessionDetail> {
  return api.get<WorkoutSessionDetail>(`/workout-sessions/${id}`);
}

export function startSession(input: StartWorkoutSessionInput): Promise<WorkoutSessionDetail> {
  return api.post<WorkoutSessionDetail>('/workout-sessions', input);
}

export function endSession(id: string): Promise<WorkoutSessionDetail> {
  return api.post<WorkoutSessionDetail>(`/workout-sessions/${id}/end`);
}

export function getSessionPersonalRecords(id: string): Promise<PersonalRecordWithExercise[]> {
  return api.get<PersonalRecordWithExercise[]>(`/workout-sessions/${id}/personal-records`);
}
