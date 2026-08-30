// Shared DTO types between apps/backend and apps/mobile.
// Mirrors prisma/schema.prisma in apps/backend, kept as plain TS so the
// mobile app (which never depends on @prisma/client) can import these too.
// Phase 0: placeholders only — will grow alongside the API contract.

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description: string | null;
}

export interface PlanExercise {
  id: string;
  workoutPlanId: string;
  exerciseId: string;
  order: number;
  targetSets: number | null;
  targetReps: number | null;
  restSeconds: number | null;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutPlanId: string | null;
  startedAt: string;
  endedAt: string | null;
}

export interface SetLog {
  id: string;
  workoutSessionId: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe: number | null;
}

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  weightKg: number;
  reps: number;
  estimatedOneRepMax: number | null;
  achievedAt: string;
}

export interface FoodEntry {
  id: string;
  userId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: MealType;
  loggedAt: string;
}
