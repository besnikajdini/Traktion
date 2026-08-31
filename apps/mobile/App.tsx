import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Barlow_400Regular, Barlow_500Medium, Barlow_600SemiBold, Barlow_700Bold } from '@expo-google-fonts/barlow';
import { BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initNotifications } from './src/services/notifications';
import { useAuthStore } from './src/store/authStore';
import { colors } from './src/theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useFonts({
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
    Barlow_700Bold,
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
  });
  const authStatus = useAuthStore((s) => s.status);
  const restore = useAuthStore((s) => s.restore);

  useEffect(() => {
    initNotifications();
    restore();
  }, [restore]);

  const ready = fontsLoaded && authStatus !== 'restoring';

  const onLayoutRootView = useCallback(async () => {
    if (ready) {
      await SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} onLayout={onLayoutRootView}>
      <RootNavigator />
      <StatusBar style="light" />
    </View>
  );
}
