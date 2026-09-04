import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Exercise, ExerciseProgressPoint, PersonalRecord, SetLogWithSession } from '@traktion/shared-types';
import {
  getExercise,
  getExerciseHistory,
  getExercisePersonalBests,
  getExerciseProgress,
} from '../services/exercises';
import { ExerciseMedia } from '../components/ExerciseMedia';
import { LineChart } from '../components/LineChart';
import { PressableOpacity } from '../components/PressableOpacity';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { WorkoutsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<WorkoutsStackParamList, 'ExerciseDetail'>;

type Tab = 'summary' | 'history' | 'instructions';
type ChartMode = 'weight' | 'volume';

export function ExerciseDetailScreen({ route, navigation }: Props) {
  const { exerciseId } = route.params;
  const [tab, setTab] = useState<Tab>('summary');
  const [chartMode, setChartMode] = useState<ChartMode>('weight');
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [progress, setProgress] = useState<ExerciseProgressPoint[]>([]);
  const [history, setHistory] = useState<SetLogWithSession[]>([]);
  const [bests, setBests] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getExercise(exerciseId),
      getExerciseProgress(exerciseId),
      getExerciseHistory(exerciseId),
      getExercisePersonalBests(exerciseId),
    ])
      .then(([ex, prog, hist, pb]) => {
        if (cancelled) return;
        setExercise(ex);
        setProgress(prog);
        setHistory(hist);
        setBests(pb);
        navigation.setOptions({ title: ex.name });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [exerciseId, navigation]);

  if (loading || !exercise) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const maxWeightPR = bests.find((b) => b.type === 'MAX_WEIGHT');
  const maxVolumePR = bests.find((b) => b.type === 'MAX_VOLUME');

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {(['summary', 'history', 'instructions'] as Tab[]).map((t) => (
          <PressableOpacity key={t} style={styles.tabButton} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'summary' ? 'Summary' : t === 'history' ? 'History' : 'Instructions'}
            </Text>
            {tab === t && <View style={styles.tabIndicator} />}
          </PressableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'summary' && (
          <>
            <ExerciseMedia gifUrl={exercise.gifUrl} imageUrl={exercise.imageUrl} attribution={exercise.mediaAttribution} />

            <Text style={styles.sectionTitle}>Progress</Text>
            {progress.length < 2 ? (
              <Text style={styles.emptyText}>Complete more workouts with this exercise to see your progress.</Text>
            ) : (
              <View style={styles.chartCard}>
                <View style={styles.chartToggle}>
                  <PressableOpacity
                    style={[styles.chartToggleButton, chartMode === 'weight' && styles.chartToggleButtonActive]}
                    onPress={() => setChartMode('weight')}
                  >
                    <Text style={[styles.chartToggleText, chartMode === 'weight' && styles.chartToggleTextActive]}>Max weight</Text>
                  </PressableOpacity>
                  <PressableOpacity
                    style={[styles.chartToggleButton, chartMode === 'volume' && styles.chartToggleButtonActive]}
                    onPress={() => setChartMode('volume')}
                  >
                    <Text style={[styles.chartToggleText, chartMode === 'volume' && styles.chartToggleTextActive]}>Volume</Text>
                  </PressableOpacity>
                </View>
                <LineChart
                  points={progress.map((p) => ({
                    label: formatShortDate(p.date),
                    value: chartMode === 'weight' ? p.maxWeightKg : p.volumeKg,
                  }))}
                  unit="kg"
                />
              </View>
            )}

            <Text style={styles.sectionTitle}>Personal records</Text>
            {!maxWeightPR && !maxVolumePR ? (
              <Text style={styles.emptyText}>No personal records yet — log a set to start one.</Text>
            ) : (
              <View style={styles.prRow}>
                {maxWeightPR && (
                  <View style={styles.prCard}>
                    <Text style={styles.prLabel}>Max weight</Text>
                    <Text style={styles.prValue}>
                      {maxWeightPR.weightKg} kg × {maxWeightPR.reps}
                    </Text>
                  </View>
                )}
                {maxVolumePR && (
                  <View style={styles.prCard}>
                    <Text style={styles.prLabel}>Max volume (1 set)</Text>
                    <Text style={styles.prValue}>{maxVolumePR.weightKg * maxVolumePR.reps} kg</Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}

        {tab === 'history' && (
          <>
            {history.length === 0 ? (
              <Text style={styles.emptyText}>No sets logged for this exercise yet.</Text>
            ) : (
              groupBySession(history).map((group) => (
                <View key={group.sessionId} style={styles.historyCard}>
                  <Text style={styles.historyDate}>{formatFullDate(group.date)}</Text>
                  {group.sets.map((s) => (
                    <Text key={s.id} style={styles.historySet}>
                      Set {s.setNumber}: {s.weightKg} kg × {s.reps} reps
                    </Text>
                  ))}
                </View>
              ))
            )}
          </>
        )}

        {tab === 'instructions' && (
          <>
            <ExerciseMedia gifUrl={exercise.gifUrl} imageUrl={exercise.imageUrl} attribution={exercise.mediaAttribution} />
            <Text style={styles.sectionTitle}>How to do it</Text>
            {exercise.instructionSteps.length > 0 ? (
              exercise.instructionSteps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <Text style={styles.stepNumber}>{i + 1}</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.bodyText}>{exercise.instructions ?? 'No instructions available.'}</Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function groupBySession(history: SetLogWithSession[]) {
  const groups = new Map<string, { sessionId: string; date: string; sets: SetLogWithSession[] }>();
  for (const log of history) {
    const key = log.workoutSession.id;
    if (!groups.has(key)) {
      groups.set(key, { sessionId: key, date: log.workoutSession.startedAt, sets: [] });
    }
    groups.get(key)!.sets.push(log);
  }
  return [...groups.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: {
    ...typography.bodyMedium,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.text,
  },
  tabIndicator: {
    marginTop: 6,
    height: 2,
    width: '60%',
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 4,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.textMuted,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  bodyText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    ...shadows.card,
  },
  chartToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  chartToggleButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chartToggleButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  chartToggleText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  chartToggleTextActive: {
    color: colors.text,
  },
  prRow: {
    flexDirection: 'row',
    gap: 10,
  },
  prCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    ...shadows.card,
  },
  prLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  prValue: {
    ...typography.cardTitle,
    color: colors.text,
    marginTop: 4,
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    ...shadows.card,
  },
  historyDate: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: 6,
  },
  historySet: {
    ...typography.body,
    color: colors.textMuted,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  stepNumber: {
    ...typography.bodyMedium,
    color: colors.primary,
    width: 20,
  },
  stepText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
});
