import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { WorkoutPlanDetail } from '@traktion/shared-types';
import { deleteWorkoutPlan, getWorkoutPlan } from '../services/workoutPlans';
import { startSession } from '../services/workoutSessions';
import { useSessionStore } from '../store/sessionStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { WorkoutsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<WorkoutsStackParamList, 'PlanDetail'>;

export function PlanDetailScreen({ navigation, route }: Props) {
  const { planId } = route.params;
  const [plan, setPlan] = useState<WorkoutPlanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const setSession = useSessionStore((s) => s.setSession);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      getWorkoutPlan(planId)
        .then((result) => {
          if (!cancelled) setPlan(result);
        })
        .catch(() => Alert.alert('Error', 'Could not load this plan.'))
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [planId]),
  );

  const handleStart = async () => {
    setStarting(true);
    try {
      const session = await startSession({ workoutPlanId: planId });
      setSession(session);
      navigation.navigate('ActiveSession', { sessionId: session.id });
    } catch {
      Alert.alert('Error', 'Could not start the workout.');
    } finally {
      setStarting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete plan', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteWorkoutPlan(planId);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Could not delete this plan.');
          }
        },
      },
    ]);
  };

  if (loading || !plan) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{plan.name}</Text>
      {plan.description && <Text style={styles.description}>{plan.description}</Text>}

      <View style={styles.list}>
        {plan.planExercises.map((pe) => (
          <View key={pe.id} style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{pe.exercise.name}</Text>
            <Text style={styles.exerciseMeta}>
              {pe.targetSets ?? '—'} sets{pe.targetReps ? ` × ${pe.targetReps} reps` : ''} · rest {pe.restSeconds ?? 0}s
            </Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.startButton} onPress={handleStart} disabled={starting}>
        {starting ? <ActivityIndicator color={colors.text} /> : <Text style={styles.startText}>Start workout</Text>}
      </Pressable>

      <View style={styles.secondaryActions}>
        <Pressable onPress={() => navigation.navigate('PlanBuilder', { planId })}>
          <Text style={styles.secondaryText}>Edit</Text>
        </Pressable>
        <Pressable onPress={handleDelete}>
          <Text style={[styles.secondaryText, styles.deleteText]}>Delete</Text>
        </Pressable>
      </View>
    </ScrollView>
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
  },
  title: {
    ...typography.screenTitle,
    color: colors.text,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: 4,
  },
  list: {
    marginTop: 20,
    gap: 10,
  },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
  },
  exerciseName: {
    ...typography.cardTitle,
    color: colors.text,
  },
  exerciseMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  startText: {
    ...typography.button,
    color: colors.text,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
  },
  secondaryText: {
    ...typography.bodyMedium,
    color: colors.textMuted,
  },
  deleteText: {
    color: colors.danger,
  },
});
