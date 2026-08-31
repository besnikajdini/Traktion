import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Exercise, PlanExerciseDraft } from '@traktion/shared-types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type Props = {
  exercise: Exercise;
  draft: PlanExerciseDraft;
  onChange: (draft: PlanExerciseDraft) => void;
  onRemove: () => void;
};

export function PlanExerciseEditorRow({ exercise, draft, onChange, onRemove }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {exercise.imageUrl && <Image source={{ uri: exercise.imageUrl }} style={styles.thumbnail} />}
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{exercise.name}</Text>
          <Text style={styles.meta}>{exercise.muscleGroup}</Text>
        </View>
        <Pressable onPress={onRemove} hitSlop={8}>
          <Text style={styles.remove}>Remove</Text>
        </Pressable>
      </View>
      <View style={styles.fields}>
        <View style={styles.field}>
          <Text style={styles.label}>Sets</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={String(draft.targetSets)}
            onChangeText={(text) => onChange({ ...draft, targetSets: clampInt(text, 1) })}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Reps</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            placeholder="optional"
            placeholderTextColor={colors.textMuted}
            value={draft.targetReps !== null ? String(draft.targetReps) : ''}
            onChangeText={(text) => onChange({ ...draft, targetReps: text.trim() === '' ? null : clampInt(text, 1) })}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Rest (s)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={String(draft.restSeconds)}
            onChangeText={(text) => onChange({ ...draft, restSeconds: clampInt(text, 0) })}
          />
        </View>
      </View>
    </View>
  );
}

function clampInt(text: string, min: number): number {
  const n = Number.parseInt(text, 10);
  if (Number.isNaN(n)) return min;
  return Math.max(min, n);
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  name: {
    ...typography.cardTitle,
    fontSize: 15,
    color: colors.text,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  remove: {
    ...typography.caption,
    color: colors.danger,
  },
  fields: {
    flexDirection: 'row',
    gap: 10,
  },
  field: {
    flex: 1,
    gap: 4,
  },
  label: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.text,
  },
});
