import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Exercise, PlanExerciseDraft } from '@traktion/shared-types';
import { createWorkoutPlan, getWorkoutPlan, updateWorkoutPlan } from '../services/workoutPlans';
import { useExercisePickerStore } from '../store/exercisePickerStore';
import { PlanExerciseEditorRow } from '../components/PlanExerciseEditorRow';
import { PressableOpacity } from '../components/PressableOpacity';
import { colors } from '../theme/colors';
import { fontFamily, typography } from '../theme/typography';
import type { WorkoutsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<WorkoutsStackParamList, 'PlanBuilder'>;

type Item = { draft: PlanExerciseDraft; exercise: Exercise };

const DEFAULT_REST_SECONDS = 90;

export function PlanBuilderScreen({ navigation, route }: Props) {
  const planId = route.params?.planId;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(!!planId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!planId) return;
    getWorkoutPlan(planId)
      .then((plan) => {
        setName(plan.name);
        setDescription(plan.description ?? '');
        setItems(
          plan.planExercises.map((pe) => ({
            exercise: pe.exercise,
            draft: {
              exerciseId: pe.exerciseId,
              order: pe.order,
              notes: pe.notes,
              restSeconds: pe.restSeconds ?? DEFAULT_REST_SECONDS,
              sets: pe.sets
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((s, i) => ({ order: i, targetReps: s.targetReps, targetWeightKg: s.targetWeightKg })),
            },
          })),
        );
      })
      .catch(() => Alert.alert('Error', 'Could not load this plan.'))
      .finally(() => setLoading(false));
  }, [planId]);

  useFocusEffect(
    useCallback(() => {
      const picked = useExercisePickerStore.getState().consumePickedExercise();
      if (!picked) return;

      setItems((prev) => [
        ...prev,
        {
          exercise: picked,
          draft: {
            exerciseId: picked.id,
            order: prev.length,
            notes: null,
            restSeconds: DEFAULT_REST_SECONDS,
            sets: [{ order: 0, targetReps: null, targetWeightKg: null }],
          },
        },
      ]);
    }, []),
  );

  const updateItem = (index: number, draft: PlanExerciseDraft) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, draft } : item)));
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, draft: { ...item.draft, order: i } })));
  };

  const isValid = name.trim().length > 0 && items.length > 0;

  const handleSave = useCallback(async () => {
    if (name.trim().length === 0) {
      Alert.alert('Name required', 'Give your plan a name.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Add an exercise', 'A plan needs at least one exercise.');
      return;
    }

    setSaving(true);
    try {
      const input = {
        name: name.trim(),
        description: description.trim().length > 0 ? description.trim() : null,
        exercises: items.map((item) => item.draft),
      };
      if (planId) {
        await updateWorkoutPlan(planId, input);
      } else {
        await createWorkoutPlan(input);
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not save this plan.');
    } finally {
      setSaving(false);
    }
  }, [name, description, items, planId, navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <PressableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.headerCancelText}>Annulla</Text>
        </PressableOpacity>
      ),
      headerTitle: planId ? 'Modifica workout' : 'Crea un workout',
      headerRight: () => (
        <PressableOpacity onPress={handleSave} disabled={!isValid || saving} hitSlop={8}>
          {saving ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Text style={[styles.headerSaveText, !isValid && styles.headerSaveTextDisabled]}>Salva</Text>
          )}
        </PressableOpacity>
      ),
    });
  }, [navigation, planId, isValid, saving, handleSave]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Nome workout</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Push day"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />

      <PressableOpacity style={styles.addExerciseButton} onPress={() => navigation.navigate('ExercisePicker')}>
        <Text style={styles.addExerciseText}>+ Aggiungi esercizio</Text>
      </PressableOpacity>

      {items.length === 0 && <Text style={styles.emptyText}>No exercises added yet.</Text>}

      <View style={styles.itemsList}>
        {items.map((item, index) => (
          <PlanExerciseEditorRow
            key={`${item.exercise.id}-${index}`}
            exercise={item.exercise}
            draft={item.draft}
            onChange={(draft) => updateItem(index, draft)}
            onRemove={() => removeItem(index)}
            onPressExercise={() => navigation.navigate('ExerciseDetail', { exerciseId: item.exercise.id })}
          />
        ))}
      </View>

      <Text style={styles.label}>Descrizione (opzionale)</Text>
      <TextInput
        style={styles.input}
        placeholder="Notes about this plan"
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
      />
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
    gap: 8,
    paddingBottom: 40,
  },
  label: {
    ...typography.sectionTitle,
    color: colors.textMuted,
    marginTop: 8,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
  },
  addExerciseButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  addExerciseText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: 8,
  },
  itemsList: {
    gap: 10,
    marginTop: 4,
  },
  headerCancelText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 15,
    color: colors.textMuted,
  },
  headerSaveText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 15,
    color: colors.primary,
  },
  headerSaveTextDisabled: {
    color: colors.textMuted,
  },
});
