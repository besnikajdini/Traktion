import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { FoodLogScreen } from '../screens/FoodLogScreen';
import { AddMealScreen } from '../screens/AddMealScreen';
import { NutritionGoalScreen } from '../screens/NutritionGoalScreen';
import { PressableOpacity } from '../components/PressableOpacity';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import type { FoodLogStackParamList } from './types';

const Stack = createNativeStackNavigator<FoodLogStackParamList>();

export function FoodLogStackNavigator() {
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
      <Stack.Screen
        name="FoodLogHome"
        component={FoodLogScreen}
        options={({ navigation }) => ({
          title: 'Diario alimentare',
          headerRight: () => (
            <PressableOpacity onPress={() => navigation.navigate('NutritionGoal')} hitSlop={8}>
              <Text style={{ fontFamily: fontFamily.bodySemiBold, fontSize: 14, color: colors.primary }}>Obiettivo</Text>
            </PressableOpacity>
          ),
        })}
      />
      <Stack.Screen name="AddMeal" component={AddMealScreen} options={{ title: 'Aggiungi pasto' }} />
      <Stack.Screen name="NutritionGoal" component={NutritionGoalScreen} options={{ title: 'Obiettivo calorico' }} />
    </Stack.Navigator>
  );
}
