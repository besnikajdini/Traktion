import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStackNavigator() {
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
      <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'Profilo' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Impostazioni' }} />
    </Stack.Navigator>
  );
}
