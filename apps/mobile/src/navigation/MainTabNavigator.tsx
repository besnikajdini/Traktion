import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { HomeScreen } from '../screens/HomeScreen';
import { WorkoutsStackNavigator } from './WorkoutsStackNavigator';
import { ProgressScreen } from '../screens/ProgressScreen';
import { FoodLogScreen } from '../screens/FoodLogScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

const ICONS: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Workouts: 'barbell',
  Progress: 'trending-up',
  FoodLog: 'restaurant',
  Profile: 'person',
};

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: fontFamily.bodyMedium, fontSize: 11 },
        tabBarIcon: ({ color, size, focused }) => {
          const name = ICONS[route.name as keyof RootTabParamList];
          return <Ionicons name={focused ? name : (`${name}-outline` as keyof typeof Ionicons.glyphMap)} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Workouts" component={WorkoutsStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="FoodLog" component={FoodLogScreen} options={{ title: 'Food Log' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
