// Shared DTO types between apps/backend and apps/mobile.
// Mirrors prisma/schema.prisma in apps/backend, kept as plain TS so the
// mobile app (which never depends on @prisma/client) can import these too.
// Phase 1: Workout Tracker MVP — types for exercises, workout plans,
// workout sessions and set logs, plus the request payloads the mobile
// app sends when building/running a workout.

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
  category: string | null;
  imageUrl: string | null;
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

export interface PlanExerciseWithExercise extends PlanExercise {
  exercise: Exercise;
}

/** Row shown in the "my plans" list — GET /workout-plans */
export interface WorkoutPlanSummary {
  id: string;
  name: string;
  description: string | null;
  exerciseCount: number;
  createdAt: string;
}

/** Full plan with its ordered exercises — GET/POST/PUT /workout-plans/:id */
export interface WorkoutPlanDetail {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  planExercises: PlanExerciseWithExercise[];
}

/** One exercise line while building/editing a plan (before it has an id). */
export interface PlanExerciseDraft {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: number | null;
  restSeconds: number;
}

/** Body for POST /workout-plans and PUT /workout-plans/:id */
export interface SaveWorkoutPlanInput {
  name: string;
  description?: string | null;
  exercises: PlanExerciseDraft[];
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
  completedAt: string;
}

/** Full session with its plan (and exercises) and any logged sets so far. */
export interface WorkoutSessionDetail extends WorkoutSession {
  workoutPlan: WorkoutPlanDetail | null;
  setLogs: SetLog[];
}

/** Body for POST /workout-sessions */
export interface StartWorkoutSessionInput {
  workoutPlanId: string;
}

/** Body for POST /set-logs */
export interface CreateSetLogInput {
  workoutSessionId: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe?: number | null;
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
