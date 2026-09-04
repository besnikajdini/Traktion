import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSessionStore } from '../store/sessionStore';
import { useCountdown } from '../hooks/useCountdown';
import { PressableOpacity } from './PressableOpacity';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function RestTimerBar() {
  const restTimer = useSessionStore((s) => s.restTimer);
  const adjustRestTimer = useSessionStore((s) => s.adjustRestTimer);
  const clearRestTimer = useSessionStore((s) => s.clearRestTimer);
  const secondsLeft = useCountdown(restTimer?.endTimestamp ?? null);
  const lastHapticSecond = useRef<number | null>(null);

  useEffect(() => {
    if (!restTimer) {
      lastHapticSecond.current = null;
      return;
    }

    if (secondsLeft === 0 && lastHapticSecond.current !== 0) {
      lastHapticSecond.current = 0;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      clearRestTimer();
      return;
    }

    if (secondsLeft <= 5 && secondsLeft > 0 && lastHapticSecond.current !== secondsLeft) {
      lastHapticSecond.current = secondsLeft;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [secondsLeft, restTimer, clearRestTimer]);

  if (!restTimer) return null;

  const progress = 1 - secondsLeft / restTimer.totalSeconds;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.label}>Resting — {restTimer.exerciseName}</Text>
          <Text style={styles.time}>{formatSeconds(secondsLeft)}</Text>
        </View>
        <View style={styles.buttons}>
          <PressableOpacity style={styles.adjustButton} onPress={() => adjustRestTimer(-15)}>
            <Text style={styles.adjustText}>-15s</Text>
          </PressableOpacity>
          <PressableOpacity style={styles.adjustButton} onPress={() => adjustRestTimer(15)}>
            <Text style={styles.adjustText}>+15s</Text>
          </PressableOpacity>
          <PressableOpacity style={styles.skipButton} onPress={() => clearRestTimer()}>
            <Text style={styles.skipText}>Skip</Text>
          </PressableOpacity>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, progress * 100))}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 8,
    ...shadows.raised,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    gap: 2,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
  },
  time: {
    ...typography.bigNumber,
    color: colors.text,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  adjustButton: {
    backgroundColor: colors.primaryMuted,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  adjustText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipText: {
    ...typography.bodyMedium,
    color: colors.textMuted,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
});
