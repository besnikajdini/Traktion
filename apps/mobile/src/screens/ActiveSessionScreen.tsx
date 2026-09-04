import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SetLog } from '@traktion/shared-types';
import { getSession, endSession } from '../services/workoutSessions';
import { createSetLog, deleteSetLog, getLastSetLog } from '../services/setLogs';
import { useSessionStore } from '../store/sessionStore';
import { SetTableRow } from '../components/SetTableRow';
import { ExerciseBlockHeader } from '../components/ExerciseBlockHeader';
import { RestTimerBar } from '../components/RestTimerBar';
import { PressableOpacity } from '../components/PressableOpacity';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { fontFamily } from '../theme/typography';
import type { WorkoutsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<WorkoutsStackParamList, 'ActiveSession'>;

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
  // Rest duration chosen for this exercise in this session, keyed by
  // PlanExercise id (not exerciseId — the same exercise can appear twice in
  // one plan). Seeded from the plan's stored default; `null` = "Nessuno" =
  // completing a set for that exercise won't auto-start the rest timer.
  const [restDurations, setRestDurations] = useState<Record<string, number | null>>({});

  useEffect(() => {
    let cancelled = false;
    getSession(sessionId)
      .then(async (result) => {
        if (cancelled) return;
        setSession(result);
        setRestDurations(
          Object.fromEntries(
            (result.workoutPlan?.planExercises ?? []).map((pe) => [pe.id, pe.restSeconds ?? null]),
          ),
        );

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
        <PressableOpacity onPress={handleFinish} disabled={finishing} hitSlop={8}>
          <Text style={styles.finishText}>{finishing ? '...' : 'Finish'}</Text>
        </PressableOpacity>
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
      navigation.replace('SessionSummary', { sessionId });
    } catch {
      Alert.alert('Error', 'Could not finish the workout.');
    } finally {
      setFinishing(false);
    }
  };

  const handleComplete = async (
    exerciseId: string,
    exerciseName: string,
    restSeconds: number | null,
    setNumber: number,
    weightKg: number,
    reps: number,
  ) => {
    try {
      const log = await createSetLog({ workoutSessionId: sessionId, exerciseId, setNumber, reps, weightKg });
      addSetLog(log);
      if (restSeconds !== null) {
        await startRestTimer(exerciseId, exerciseName, restSeconds);
      }
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
          const rowCount = Math.max(pe.sets.length || 1, completedForExercise.length);
          const chosenRest = restDurations[pe.id] ?? null;

          return (
            <View key={pe.id} style={styles.exerciseSection}>
              <ExerciseBlockHeader
                exercise={pe.exercise}
                restSeconds={chosenRest}
                onSelectRest={(seconds) => setRestDurations((prev) => ({ ...prev, [pe.id]: seconds }))}
                onPressExercise={() => navigation.navigate('ExerciseDetail', { exerciseId: pe.exerciseId })}
              />
              <View style={styles.setsList}>
                {Array.from({ length: rowCount }, (_, i) => i + 1).map((setNumber) => (
                  <SetTableRow
                    key={setNumber}
                    setNumber={setNumber}
                    completedLog={completedForExercise.find((l) => l.setNumber === setNumber)}
                    lastSetLog={lastSets[pe.exerciseId] ?? null}
                    onComplete={(weightKg, reps) =>
                      handleComplete(pe.exerciseId, pe.exercise.name, chosenRest, setNumber, weightKg, reps)
                    }
                    onUndo={() => {
                      const log = completedForExercise.find((l) => l.setNumber === setNumber);
                      if (log) handleUndo(log.id);
                    }}
                  />
                ))}
              </View>
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
    ...shadows.card,
  },
  setsList: {
    marginTop: 10,
    gap: 4,
  },
  finishText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 15,
    color: colors.primary,
  },
});
