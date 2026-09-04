import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Exercise, PlanExerciseDraft } from '@traktion/shared-types';
import { RestDurationPicker } from './RestDurationPicker';
import { PressableOpacity } from './PressableOpacity';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { fontFamily, typography } from '../theme/typography';

type Props = {
  exercise: Exercise;
  draft: PlanExerciseDraft;
  onChange: (draft: PlanExerciseDraft) => void;
  onRemove: () => void;
  onPressExercise?: () => void;
};

export function PlanExerciseEditorRow({ exercise, draft, onChange, onRemove, onPressExercise }: Props) {
  const updateSet = (index: number, patch: Partial<{ targetReps: number | null; targetWeightKg: number | null }>) => {
    onChange({
      ...draft,
      sets: draft.sets.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    });
  };

  const addSet = () => {
    onChange({ ...draft, sets: [...draft.sets, { order: draft.sets.length, targetReps: null, targetWeightKg: null }] });
  };

  const removeSet = (index: number) => {
    onChange({
      ...draft,
      sets: draft.sets.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {exercise.imageUrl ? (
          <Image source={{ uri: exercise.imageUrl }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder} />
        )}
        <Pressable style={{ flex: 1 }} onPress={onPressExercise} disabled={!onPressExercise}>
          <Text style={styles.name}>{exercise.name}</Text>
        </Pressable>
        <Pressable onPress={onRemove} hitSlop={8}>
          <Text style={styles.remove}>Rimuovi</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.notesInput}
        placeholder="Aggiungi note sulla routine qui"
        placeholderTextColor={colors.textMuted}
        value={draft.notes ?? ''}
        onChangeText={(text) => onChange({ ...draft, notes: text.trim().length > 0 ? text : null })}
        multiline
      />

      <RestDurationPicker restSeconds={draft.restSeconds} onSelectRest={(seconds) => onChange({ ...draft, restSeconds: seconds ?? 0 })} />

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colSet]}>SERIE</Text>
          <Text style={[styles.tableHeaderText, styles.colInput]}>KG</Text>
          <Text style={[styles.tableHeaderText, styles.colInput]}>RIPETIZIONI</Text>
          <View style={styles.colRemove} />
        </View>

        {draft.sets.map((set, index) => (
          <View key={index} style={styles.setRow}>
            <View style={[styles.setBadge, styles.colSet]}>
              <Text style={styles.setBadgeText}>{index + 1}</Text>
            </View>
            <TextInput
              style={[styles.input, styles.colInput]}
              keyboardType="decimal-pad"
              placeholder="-"
              placeholderTextColor={colors.textMuted}
              value={set.targetWeightKg !== null ? String(set.targetWeightKg) : ''}
              onChangeText={(text) => updateSet(index, { targetWeightKg: parseOptionalNumber(text) })}
            />
            <TextInput
              style={[styles.input, styles.colInput]}
              keyboardType="number-pad"
              placeholder="-"
              placeholderTextColor={colors.textMuted}
              value={set.targetReps !== null ? String(set.targetReps) : ''}
              onChangeText={(text) => updateSet(index, { targetReps: parseOptionalNumber(text) })}
            />
            <Pressable style={styles.colRemove} onPress={() => removeSet(index)} hitSlop={12}>
              <Text style={styles.removeSetText}>×</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <PressableOpacity style={styles.addSetButton} onPress={addSet}>
        <Text style={styles.addSetText}>+ Aggiungi serie</Text>
      </PressableOpacity>
    </View>
  );
}

function parseOptionalNumber(text: string): number | null {
  const trimmed = text.trim().replace(',', '.');
  if (trimmed.length === 0) return null;
  const n = Number.parseFloat(trimmed);
  return Number.isNaN(n) ? null : n;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    ...shadows.card,
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
  thumbnailPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  name: {
    ...typography.cardTitle,
    fontSize: 15,
    color: colors.primary,
  },
  remove: {
    ...typography.caption,
    color: colors.danger,
  },
  notesInput: {
    ...typography.caption,
    color: colors.text,
    minHeight: 32,
  },
  table: {
    gap: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tableHeaderText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colSet: {
    width: 32,
    textAlign: 'center',
  },
  colInput: {
    flex: 1,
  },
  colRemove: {
    width: 24,
    alignItems: 'center',
  },
  setBadge: {
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setBadgeText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 14,
    color: colors.text,
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
    textAlign: 'center',
  },
  removeSetText: {
    color: colors.textMuted,
    fontSize: 18,
    lineHeight: 18,
  },
  addSetButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addSetText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
});
