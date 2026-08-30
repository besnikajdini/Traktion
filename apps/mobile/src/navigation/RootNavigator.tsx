import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { WorkoutsScreen } from '../screens/WorkoutsScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { FoodLogScreen } from '../screens/FoodLogScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors } from '../theme/colors';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.primary,
    text: colors.text,
    border: colors.border,
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Workouts" component={WorkoutsScreen} />
        <Tab.Screen name="Progress" component={ProgressScreen} />
        <Tab.Screen name="FoodLog" component={FoodLogScreen} options={{ title: 'Food Log' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
