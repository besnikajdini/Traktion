// Shared DTO types between apps/backend and apps/mobile.
// Mirrors prisma/schema.prisma in apps/backend, kept as plain TS so the
// mobile app (which never depends on @prisma/client) can import these too.
// Phase 1: Workout Tracker MVP. Phase 2: PR detection, session summaries,
// progress charts, streaks — plus the exercises-dataset switch and the
// exercise-picker filters. Phase 3: food tracking (macro estimation,
// favorites/quick log, daily nutrition summary, calorie goal).

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface User {
  id: string;
  email: string;
  name: string;
  dailyCalorieGoal: number | null;
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  secondaryMuscles: string[];
  equipment: string | null;
  instructions: string | null;
  instructionSteps: string[];
  imageUrl: string | null;
  gifUrl: string | null;
  mediaAttribution: string | null;
}

export interface ExerciseFilterOptions {
  bodyParts: string[];
  equipment: string[];
}

/** One point per completed session that logged this exercise, oldest first. */
export interface ExerciseProgressPoint {
  sessionId: string;
  date: string;
  maxWeightKg: number;
  volumeKg: number;
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
  notes: string | null;
  restSeconds: number | null;
}

/** One set's target within a plan exercise template (e.g. "set 2: 90kg x 8"). */
export interface PlanExerciseSetTarget {
  id: string;
  order: number;
  targetReps: number | null;
  targetWeightKg: number | null;
}

export interface PlanExerciseWithExercise extends PlanExercise {
  exercise: Exercise;
  sets: PlanExerciseSetTarget[];
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
  notes: string | null;
  restSeconds: number;
  sets: { order: number; targetReps: number | null; targetWeightKg: number | null }[];
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

/** A logged set plus which session/day it belongs to — the "Cronologia" tab. */
export interface SetLogWithSession extends SetLog {
  workoutSession: {
    id: string;
    startedAt: string;
  };
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

export type PersonalRecordType = 'MAX_WEIGHT' | 'MAX_VOLUME';

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  workoutSessionId: string;
  setLogId: string;
  type: PersonalRecordType;
  weightKg: number;
  reps: number;
  achievedAt: string;
}

/** PR row plus the exercise name — used in the end-of-session summary. */
export interface PersonalRecordWithExercise extends PersonalRecord {
  exercise: { name: string };
}

export interface StreakSummary {
  currentStreak: number;
  longestStreak: number;
}

export interface FoodEntry {
  id: string;
  userId: string;
  mealType: MealType;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: string;
}

/** Body for POST /food-entries */
export interface CreateFoodEntryInput {
  mealType: MealType;
  description: string;
}

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** GET /food-entries/summary — today's (or a given day's) food log aggregated. */
export interface DailyNutritionSummary {
  entries: FoodEntry[];
  totals: MacroTotals;
  goalCalories: number | null;
  remainingCalories: number | null;
}

/** A saved meal that can be re-logged with one tap — GET/POST /favorite-meals */
export interface FavoriteMeal {
  id: string;
  userId: string;
  mealType: MealType;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
}

/** Body for POST /favorite-meals */
export interface CreateFavoriteMealInput {
  mealType: MealType;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
