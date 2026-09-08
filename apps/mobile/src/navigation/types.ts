import type { NavigatorScreenParams } from '@react-navigation/native';

export type WorkoutsStackParamList = {
  WorkoutPlansList: undefined;
  PlanBuilder: { planId?: string } | undefined;
  ExercisePicker: undefined;
  PlanDetail: { planId: string };
  ActiveSession: { sessionId: string };
  ExerciseDetail: { exerciseId: string };
  SessionSummary: { sessionId: string };
  ShareWorkout: { sessionId: string };
};

export type FoodLogStackParamList = {
  FoodLogHome: undefined;
  AddMeal: undefined;
  NutritionGoal: undefined;
};

export type SocialStackParamList = {
  SocialFeed: undefined;
  UserSearch: undefined;
  UserProfile: { userId: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Settings: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Workouts: NavigatorScreenParams<WorkoutsStackParamList>;
  Progress: undefined;
  FoodLog: NavigatorScreenParams<FoodLogStackParamList>;
  Social: NavigatorScreenParams<SocialStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: NavigatorScreenParams<RootTabParamList> | undefined;
};
