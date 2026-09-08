import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { SocialFeedScreen } from '../screens/SocialFeedScreen';
import { UserSearchScreen } from '../screens/UserSearchScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { PressableOpacity } from '../components/PressableOpacity';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import type { SocialStackParamList } from './types';

const Stack = createNativeStackNavigator<SocialStackParamList>();

export function SocialStackNavigator() {
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
        name="SocialFeed"
        component={SocialFeedScreen}
        options={({ navigation }) => ({
          title: 'Feed',
          headerRight: () => (
            <PressableOpacity onPress={() => navigation.navigate('UserSearch')} hitSlop={8}>
              <Text style={{ fontFamily: fontFamily.bodySemiBold, fontSize: 14, color: colors.primary }}>Cerca</Text>
            </PressableOpacity>
          ),
        })}
      />
      <Stack.Screen name="UserSearch" component={UserSearchScreen} options={{ title: 'Cerca utenti' }} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Profilo' }} />
    </Stack.Navigator>
  );
}
