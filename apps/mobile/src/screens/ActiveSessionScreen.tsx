import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SetLog } from '@traktion/shared-types';
import { getSession, endSession } from '../services/workoutSessions';
import { createSetLog, deleteSetLog, getLastSetLog } from '../services/setLogs';
import { useSessionStore } from '../store/sessionStore';
import { SetRow } from '../components/SetRow';
import { RestTimerBar } from '../components/RestTimerBar';
import { colors } from '../theme/colors';
import { fontFamily, typography } from '../theme/typography';
import type { WorkoutsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<WorkoutsStackParamList, 'ActiveSession'>;

const DEFAULT_REST_SECONDS = 90;

export function ActiveSessionScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;
  const session = useSessionStore((s) => s.session);
  const setSession = useSessionStore((s) => s.setSession);
  const addSetLog = useSessionStore((s) => s.addSetLog);
  const removeSetLog = useSessionStore((s) => s.removeSetLog);
  const startRestTimer = useSessionStore((s) => s.startRestTimer);
  const clearRestTimer = useSessionStore((s) => s.clearRestTimer);

  const [lastSets, setLastSets] = useState<Record<string, SetLog | null>>({});
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSession(sessionId)
      .then(async (result) => {
        if (cancelled) return;
        setSession(result);

        const exerciseIds = [...new Set(result.workoutPlan?.planExercises.map((pe) => pe.exerciseId) ?? [])];
        const entries = await Promise.all(
          exerciseIds.map(async (exerciseId) => [exerciseId, await getLastSetLog(exerciseId).catch(() => null)] as const),
        );
        if (!cancelled) setLastSets(Object.fromEntries(entries));
      })
      .catch(() => Alert.alert('Error', 'Could not load this workout.'))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId, setSession]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleFinish} disabled={finishing} hitSlop={8}>
          <Text style={styles.finishText}>{finishing ? '...' : 'Finish'}</Text>
        </Pressable>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishing, session]);

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await endSession(sessionId);
      await clearRestTimer();
      setSession(null);
      navigation.popToTop();
    } catch {
      Alert.alert('Error', 'Could not finish the workout.');
    } finally {
      setFinishing(false);
    }
  };

  const handleComplete = async (
    exerciseId: string,
    exerciseName: string,
    restSeconds: number,
    setNumber: number,
    weightKg: number,
    reps: number,
  ) => {
    try {
      const log = await createSetLog({ workoutSessionId: sessionId, exerciseId, setNumber, reps, weightKg });
      addSetLog(log);
      await startRestTimer(exerciseId, exerciseName, restSeconds);
    } catch {
      Alert.alert('Error', 'Could not log this set.');
    }
  };

  const handleUndo = async (setLogId: string) => {
    try {
      await deleteSetLog(setLogId);
      removeSetLog(setLogId);
    } catch {
      Alert.alert('Error', 'Could not undo this set.');
    }
  };

  if (loading || !session?.workoutPlan) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {session.workoutPlan.planExercises.map((pe) => {
          const completedForExercise = session.setLogs.filter((l) => l.exerciseId === pe.exerciseId);
          const rowCount = Math.max(pe.targetSets ?? 1, completedForExercise.length);
          const restSeconds = pe.restSeconds ?? DEFAULT_REST_SECONDS;

          return (
            <View key={pe.id} style={styles.exerciseSection}>
              <Text style={styles.exerciseName}>{pe.exercise.name}</Text>
              {Array.from({ length: rowCount }, (_, i) => i + 1).map((setNumber) => (
                <SetRow
                  key={setNumber}
                  setNumber={setNumber}
                  completedLog={completedForExercise.find((l) => l.setNumber === setNumber)}
                  lastSetLog={lastSets[pe.exerciseId] ?? null}
                  onComplete={(weightKg, reps) =>
                    handleComplete(pe.exerciseId, pe.exercise.name, restSeconds, setNumber, weightKg, reps)
                  }
                  onUndo={() => {
                    const log = completedForExercise.find((l) => l.setNumber === setNumber);
                    if (log) handleUndo(log.id);
                  }}
                />
              ))}
            </View>
          );
        })}
      </ScrollView>
      <RestTimerBar />
    </View>
  );
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
    gap: 20,
  },
  exerciseSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
  },
  exerciseName: {
    ...typography.cardTitle,
    color: colors.text,
    marginBottom: 4,
  },
  finishText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 15,
    color: colors.primary,
  },
});
