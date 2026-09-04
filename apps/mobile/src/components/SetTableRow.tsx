import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { SetLog } from '@traktion/shared-types';
import { colors } from '../theme/colors';
import { fontFamily, typography } from '../theme/typography';

type Props = {
  setNumber: number;
  completedLog?: SetLog;
  lastSetLog: SetLog | null;
  onComplete: (weightKg: number, reps: number) => void;
  onUndo: () => void;
};

export function SetTableRow({ setNumber, completedLog, lastSetLog, onComplete, onUndo }: Props) {
  const isCompleted = !!completedLog;
  const [weight, setWeight] = useState(() => initialValue(completedLog?.weightKg, lastSetLog?.weightKg));
  const [reps, setReps] = useState(() => initialValue(completedLog?.reps, lastSetLog?.reps));

  const handlePress = () => {
    if (isCompleted) {
      onUndo();
      return;
    }
    const weightNum = Number.parseFloat(weight.replace(',', '.'));
    const repsNum = Number.parseInt(reps, 10);
    if (Number.isNaN(weightNum) || Number.isNaN(repsNum) || weightNum < 0 || repsNum <= 0) return;
    onComplete(weightNum, repsNum);
  };

  return (
    <View style={[styles.container, isCompleted && styles.containerCompleted]}>
      <Text style={styles.setLabel}>{setNumber}</Text>
      <Text style={styles.lastTime} numberOfLines={1}>
        {lastSetLog ? `${formatNumber(lastSetLog.weightKg)}kg × ${lastSetLog.reps}` : '—'}
      </Text>
      <TextInput
        style={[styles.input, isCompleted && styles.inputDisabled]}
        keyboardType="decimal-pad"
        placeholder="kg"
        placeholderTextColor={colors.textMuted}
        value={weight}
        onChangeText={setWeight}
        editable={!isCompleted}
      />
      <TextInput
        style={[styles.input, isCompleted && styles.inputDisabled]}
        keyboardType="number-pad"
        placeholder="reps"
        placeholderTextColor={colors.textMuted}
        value={reps}
        onChangeText={setReps}
        editable={!isCompleted}
      />
      <Pressable style={({ pressed }) => [styles.check, isCompleted && styles.checkDone, pressed && styles.checkPressed]} onPress={handlePress}>
        <Text style={styles.checkText}>{isCompleted ? '✓' : ''}</Text>
      </Pressable>
    </View>
  );
}

function initialValue(completed: number | undefined, last: number | undefined): string {
  if (completed !== undefined) return formatNumber(completed);
  if (last !== undefined) return formatNumber(last);
  return '';
}

function formatNumber(n: number): string {
  return String(n);
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  containerCompleted: {
    backgroundColor: colors.successMuted,
  },
  setLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 14,
    width: 18,
    color: colors.textMuted,
    textAlign: 'center',
  },
  lastTime: {
    ...typography.caption,
    width: 68,
    color: colors.textMuted,
  },
  input: {
    ...typography.body,
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.text,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  check: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkPressed: {
    opacity: 0.7,
  },
  checkText: {
    color: colors.background,
    fontWeight: '700',
  },
});
