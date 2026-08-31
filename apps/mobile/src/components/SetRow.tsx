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

export function SetRow({ setNumber, completedLog, lastSetLog, onComplete, onUndo }: Props) {
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
    <View style={styles.container}>
      <View style={styles.mainRow}>
        <Text style={styles.setLabel}>{setNumber}</Text>
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
        <Pressable
          style={[styles.check, isCompleted && styles.checkDone]}
          onPress={handlePress}
          hitSlop={8}
        >
          <Text style={styles.checkText}>{isCompleted ? '✓' : ''}</Text>
        </Pressable>
      </View>
      {!isCompleted && lastSetLog && (
        <Text style={styles.lastTime}>
          last time: {formatNumber(lastSetLog.weightKg)} kg × {lastSetLog.reps} reps
        </Text>
      )}
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
    gap: 4,
    paddingVertical: 8,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  setLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 14,
    width: 20,
    color: colors.textMuted,
    textAlign: 'center',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkText: {
    color: colors.background,
    fontWeight: '700',
  },
  lastTime: {
    ...typography.caption,
    marginLeft: 30,
    color: colors.textMuted,
  },
});
