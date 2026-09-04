import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PersonalRecordWithExercise, WorkoutSessionDetail } from '@traktion/shared-types';
import { getSession, getSessionPersonalRecords } from '../services/workoutSessions';
import { PressableOpacity } from '../components/PressableOpacity';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { WorkoutsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<WorkoutsStackParamList, 'SessionSummary'>;

export function SessionSummaryScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;
  const [session, setSession] = useState<WorkoutSessionDetail | null>(null);
  const [records, setRecords] = useState<PersonalRecordWithExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getSession(sessionId), getSessionPersonalRecords(sessionId)])
      .then(([s, r]) => {
        if (cancelled) return;
        setSession(s);
        setRecords(r);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (loading || !session) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const durationMs = session.endedAt ? new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime() : 0;
  const totalVolume = session.setLogs.reduce((sum, l) => sum + l.weightKg * l.reps, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Workout complete</Text>
      <Text style={styles.planName}>{session.workoutPlan?.name}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatDuration(durationMs)}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalVolume.toLocaleString()} kg</Text>
          <Text style={styles.statLabel}>Total volume</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{session.setLogs.length}</Text>
          <Text style={styles.statLabel}>Sets logged</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Personal records</Text>
      {records.length === 0 ? (
        <Text style={styles.emptyText}>No new records this time — keep pushing.</Text>
      ) : (
        <View style={styles.prList}>
          {records.map((r) => (
            <View key={r.id} style={styles.prCard}>
              <Text style={styles.prExercise}>{r.exercise.name}</Text>
              <Text style={styles.prDetail}>
                {r.type === 'MAX_WEIGHT' ? 'New max weight' : 'New max volume (1 set)'}: {r.weightKg} kg × {r.reps}
              </Text>
            </View>
          ))}
        </View>
      )}

      <PressableOpacity style={styles.doneButton} onPress={() => navigation.popToTop()}>
        <Text style={styles.doneText}>Done</Text>
      </PressableOpacity>
    </ScrollView>
  );
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    ...typography.screenTitle,
    color: colors.primary,
  },
  planName: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    ...shadows.card,
  },
  statValue: {
    ...typography.bigNumber,
    fontSize: 20,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.textMuted,
    marginTop: 28,
    marginBottom: 8,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  prList: {
    gap: 10,
  },
  prCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    ...shadows.card,
  },
  prExercise: {
    ...typography.cardTitle,
    color: colors.text,
  },
  prDetail: {
    ...typography.caption,
    color: colors.success,
    marginTop: 4,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 32,
    ...shadows.raised,
  },
  doneText: {
    ...typography.button,
    color: colors.text,
  },
});
