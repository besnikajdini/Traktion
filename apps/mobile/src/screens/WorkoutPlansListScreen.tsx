import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { WorkoutPlanSummary, WorkoutSessionDetail } from '@traktion/shared-types';
import { listWorkoutPlans } from '../services/workoutPlans';
import { getActiveSession } from '../services/workoutSessions';
import { useSessionStore } from '../store/sessionStore';
import { PressableOpacity } from '../components/PressableOpacity';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { WorkoutsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<WorkoutsStackParamList, 'WorkoutPlansList'>;

export function WorkoutPlansListScreen({ navigation }: Props) {
  const [plans, setPlans] = useState<WorkoutPlanSummary[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const setSession = useSessionStore((s) => s.setSession);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      Promise.all([listWorkoutPlans(), getActiveSession()])
        .then(([plansResult, activeResult]) => {
          if (cancelled) return;
          setPlans(plansResult);
          setActiveSession(activeResult);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  return (
    <View style={styles.container}>
      {activeSession && (
        <PressableOpacity
          style={styles.resumeBanner}
          onPress={() => {
            setSession(activeSession);
            navigation.navigate('ActiveSession', { sessionId: activeSession.id });
          }}
        >
          <View style={styles.resumeDot} />
          <Text style={styles.resumeText}>Workout in progress — tap to resume</Text>
        </PressableOpacity>
      )}

      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={() => {
          setLoading(true);
          listWorkoutPlans()
            .then(setPlans)
            .catch(() => {})
            .finally(() => setLoading(false));
        }}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No workout plans yet. Create your first one.</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <PressableOpacity style={styles.card} onPress={() => navigation.navigate('PlanDetail', { planId: item.id })}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>
              {item.exerciseCount} exercise{item.exerciseCount === 1 ? '' : 's'}
            </Text>
          </PressableOpacity>
        )}
      />

      <PressableOpacity style={styles.fab} onPress={() => navigation.navigate('PlanBuilder', undefined)}>
        <Text style={styles.fabText}>+ New plan</Text>
      </PressableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  resumeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    padding: 14,
  },
  resumeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text,
  },
  resumeText: {
    ...typography.button,
    color: colors.text,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...shadows.card,
  },
  cardTitle: {
    ...typography.cardTitle,
    color: colors.text,
  },
  cardMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  fab: {
    backgroundColor: colors.primary,
    margin: 16,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    ...shadows.raised,
  },
  fabText: {
    ...typography.button,
    color: colors.text,
  },
});
