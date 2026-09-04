import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StreakSummary } from '@traktion/shared-types';
import { getStreak } from '../services/streak';
import { useAuthStore } from '../store/authStore';
import { PressableOpacity } from '../components/PressableOpacity';
import { FlameIcon } from '../components/icons';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { RootTabParamList } from '../navigation/types';

export function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const [streak, setStreak] = useState<StreakSummary | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getStreak()
        .then((s) => {
          if (!cancelled) setStreak(s);
        })
        .catch(() => {});
      return () => {
        cancelled = true;
      };
    }, []),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hi, {user?.name?.split(' ')[0] ?? 'there'}</Text>

      <View style={styles.streakCard}>
        <View style={styles.streakIconWrap}>
          <FlameIcon size={22} color={colors.primary} />
        </View>
        <Text style={styles.streakNumber}>{streak?.currentStreak ?? '—'}</Text>
        <Text style={styles.streakLabel}>
          week{streak?.currentStreak === 1 ? '' : 's'} streak
          {streak && streak.longestStreak > streak.currentStreak ? ` · best: ${streak.longestStreak}` : ''}
        </Text>
      </View>

      <PressableOpacity style={styles.cta} onPress={() => navigation.navigate('Workouts', { screen: 'WorkoutPlansList' })}>
        <Text style={styles.ctaText}>Go to Workouts</Text>
      </PressableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  greeting: {
    ...typography.screenTitle,
    color: colors.text,
    marginTop: 8,
  },
  streakCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 24,
    ...shadows.card,
  },
  streakIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  streakNumber: {
    ...typography.bigNumber,
    fontSize: 48,
    color: colors.primary,
  },
  streakLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    ...shadows.raised,
  },
  ctaText: {
    ...typography.button,
    color: colors.text,
  },
});
