import type { NavigatorScreenParams } from '@react-navigation/native';

export type WorkoutsStackParamList = {
  WorkoutPlansList: undefined;
  PlanBuilder: { planId?: string } | undefined;
  ExercisePicker: undefined;
  PlanDetail: { planId: string };
  ActiveSession: { sessionId: string };
  ExerciseDetail: { exerciseId: string };
  SessionSummary: { sessionId: string };
};

export type FoodLogStackParamList = {
  FoodLogHome: undefined;
  AddMeal: undefined;
  NutritionGoal: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Workouts: NavigatorScreenParams<WorkoutsStackParamList>;
  Progress: undefined;
  FoodLog: NavigatorScreenParams<FoodLogStackParamList>;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: NavigatorScreenParams<RootTabParamList> | undefined;
};
