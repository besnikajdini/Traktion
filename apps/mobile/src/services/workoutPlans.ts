import type { SaveWorkoutPlanInput, WorkoutPlanDetail, WorkoutPlanSummary } from '@traktion/shared-types';
import { api } from './api';

export function listWorkoutPlans(): Promise<WorkoutPlanSummary[]> {
  return api.get<WorkoutPlanSummary[]>('/workout-plans');
}

export function getWorkoutPlan(id: string): Promise<WorkoutPlanDetail> {
  return api.get<WorkoutPlanDetail>(`/workout-plans/${id}`);
}

export function createWorkoutPlan(input: SaveWorkoutPlanInput): Promise<WorkoutPlanDetail> {
  return api.post<WorkoutPlanDetail>('/workout-plans', input);
}

export function updateWorkoutPlan(id: string, input: SaveWorkoutPlanInput): Promise<WorkoutPlanDetail> {
  return api.put<WorkoutPlanDetail>(`/workout-plans/${id}`, input);
}

export function deleteWorkoutPlan(id: string): Promise<void> {
  return api.delete<void>(`/workout-plans/${id}`);
}
