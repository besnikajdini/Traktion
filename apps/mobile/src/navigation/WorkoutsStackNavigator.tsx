import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WorkoutPlansListScreen } from '../screens/WorkoutPlansListScreen';
import { PlanBuilderScreen } from '../screens/PlanBuilderScreen';
import { ExercisePickerScreen } from '../screens/ExercisePickerScreen';
import { PlanDetailScreen } from '../screens/PlanDetailScreen';
import { ActiveSessionScreen } from '../screens/ActiveSessionScreen';
import { ExerciseDetailScreen } from '../screens/ExerciseDetailScreen';
import { SessionSummaryScreen } from '../screens/SessionSummaryScreen';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import type { WorkoutsStackParamList } from './types';

const Stack = createNativeStackNavigator<WorkoutsStackParamList>();

export function WorkoutsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text, fontFamily: fontFamily.headingSemiBold },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="WorkoutPlansList" component={WorkoutPlansListScreen} options={{ title: 'Workouts' }} />
      <Stack.Screen name="PlanBuilder" component={PlanBuilderScreen} options={{ title: 'Build plan' }} />
      <Stack.Screen
        name="ExercisePicker"
        component={ExercisePickerScreen}
        options={{ title: 'Add exercise', presentation: 'modal' }}
      />
      <Stack.Screen name="PlanDetail" component={PlanDetailScreen} options={{ title: 'Plan' }} />
      <Stack.Screen
        name="ActiveSession"
        component={ActiveSessionScreen}
        options={{ title: 'Workout', gestureEnabled: false }}
      />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: 'Exercise' }} />
      <Stack.Screen
        name="SessionSummary"
        component={SessionSummaryScreen}
        options={{ title: 'Summary', gestureEnabled: false, headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
}
