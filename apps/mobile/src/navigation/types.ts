import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Exercise } from '@traktion/shared-types';

export type WorkoutsStackParamList = {
  WorkoutPlansList: undefined;
  PlanBuilder: { planId?: string; pickedExercise?: Exercise } | undefined;
  ExercisePicker: undefined;
  PlanDetail: { planId: string };
  ActiveSession: { sessionId: string };
};

export type RootTabParamList = {
  Home: undefined;
  Workouts: NavigatorScreenParams<WorkoutsStackParamList>;
  Progress: undefined;
  FoodLog: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: NavigatorScreenParams<RootTabParamList> | undefined;
};
