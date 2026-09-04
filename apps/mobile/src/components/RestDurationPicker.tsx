import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ClockIcon } from './icons';
import { PressableOpacity } from './PressableOpacity';
import { colors } from '../theme/colors';
import { fontFamily, typography } from '../theme/typography';

type Props = {
  restSeconds: number | null;
  onSelectRest: (seconds: number | null) => void;
};

const PRESETS: { label: string; value: number | null }[] = [
  { label: 'Nessuno', value: null },
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: '2:00', value: 120 },
  { label: '3:00', value: 180 },
];

export function formatRestLabel(seconds: number | null): string {
  if (seconds === null) return 'Nessuno';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function RestDurationPicker({ restSeconds, onSelectRest }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [customSeconds, setCustomSeconds] = useState('');

  const choosePreset = (value: number | null) => {
    onSelectRest(value);
    setPickerOpen(false);
    setCustomOpen(false);
  };

  const confirmCustom = () => {
    const m = Number.parseInt(customMinutes, 10) || 0;
    const s = Number.parseInt(customSeconds, 10) || 0;
    const total = m * 60 + s;
    if (total <= 0) return;
    onSelectRest(total);
    setPickerOpen(false);
    setCustomOpen(false);
    setCustomMinutes('');
    setCustomSeconds('');
  };

  return (
    <View>
      <PressableOpacity style={styles.restChip} onPress={() => setPickerOpen((v) => !v)} hitSlop={8}>
        <ClockIcon size={14} color={colors.primary} />
        <Text style={styles.restChipText}>Riposo: {formatRestLabel(restSeconds)}</Text>
      </PressableOpacity>

      {pickerOpen && (
        <View style={styles.presetRow}>
          {PRESETS.map((preset) => {
            const isActive = restSeconds === preset.value;
            return (
              <PressableOpacity
                key={preset.label}
                style={[styles.presetChip, isActive && styles.presetChipActive]}
                onPress={() => choosePreset(preset.value)}
              >
                <Text style={[styles.presetChipText, isActive && styles.presetChipTextActive]}>{preset.label}</Text>
              </PressableOpacity>
            );
          })}
          <PressableOpacity
            style={[styles.presetChip, customOpen && styles.presetChipActive]}
            onPress={() => setCustomOpen((v) => !v)}
          >
            <Text style={[styles.presetChipText, customOpen && styles.presetChipTextActive]}>Personalizza</Text>
          </PressableOpacity>
        </View>
      )}

      {pickerOpen && customOpen && (
        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            keyboardType="number-pad"
            placeholder="min"
            placeholderTextColor={colors.textMuted}
            value={customMinutes}
            onChangeText={setCustomMinutes}
          />
          <Text style={styles.customSeparator}>:</Text>
          <TextInput
            style={styles.customInput}
            keyboardType="number-pad"
            placeholder="sec"
            placeholderTextColor={colors.textMuted}
            value={customSeconds}
            onChangeText={setCustomSeconds}
          />
          <PressableOpacity style={styles.customConfirm} onPress={confirmCustom}>
            <Text style={styles.customConfirmText}>Fatto</Text>
          </PressableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  restChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  restChipText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  presetChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  presetChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  presetChipText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  presetChipTextActive: {
    color: colors.text,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  customInput: {
    ...typography.body,
    width: 54,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: colors.text,
    textAlign: 'center',
  },
  customSeparator: {
    ...typography.body,
    color: colors.textMuted,
  },
  customConfirm: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginLeft: 4,
  },
  customConfirmText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 13,
    color: colors.text,
  },
});
