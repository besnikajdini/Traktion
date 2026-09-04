import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { countExercises } from '../services/exercises';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { BODY_PART_GROUPS, getBodyPartMeta, type FilterOptionMeta } from '../constants/exerciseFilterMeta';
import { PressableOpacity } from './PressableOpacity';
import { colors } from '../theme/colors';
import { fontFamily, typography } from '../theme/typography';

type Props = {
  visible: boolean;
  options: string[];
  selected: string[];
  search: string;
  otherFilterValues: string[];
  onApply: (values: string[]) => void;
  onClose: () => void;
};

export function MuscleFilterModal({ visible, options, selected, search, otherFilterValues, onApply, onClose }: Props) {
  const [pending, setPending] = useState<string[]>(selected);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const debouncedPending = useDebouncedValue(pending, 250);

  useEffect(() => {
    if (visible) setPending(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    countExercises({ search, bodyParts: debouncedPending, equipment: otherFilterValues })
      .then((count) => {
        if (!cancelled) setResultCount(count);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [visible, debouncedPending, search, otherFilterValues]);

  const toggle = (value: string) => {
    setPending((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const clear = () => setPending([]);

  const confirm = () => {
    onApply(pending);
    onClose();
  };

  const normalizedOptions = options.map((o) => o.toLowerCase().trim());
  const groups = BODY_PART_GROUPS.map((group) => ({
    title: group.title,
    entries: group.entries.filter((entry) => normalizedOptions.includes(entry.value)),
  })).filter((group) => group.entries.length > 0);

  const knownValues = new Set(BODY_PART_GROUPS.flatMap((g) => g.entries.map((e) => e.value)));
  const otherEntries = options.filter((o) => !knownValues.has(o.toLowerCase().trim())).map((o) => getBodyPartMeta(o));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={styles.title}>Gruppo muscolare</Text>
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {groups.map((group) => (
            <View key={group.title} style={styles.group}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <View style={styles.grid}>
                {group.entries.map((entry) => (
                  <Cell key={entry.value} entry={entry} isSelected={pending.includes(entry.value)} onPress={() => toggle(entry.value)} />
                ))}
              </View>
            </View>
          ))}

          {otherEntries.length > 0 && (
            <View style={styles.group}>
              <Text style={styles.groupTitle}>Other</Text>
              <View style={styles.grid}>
                {otherEntries.map((entry) => (
                  <Cell key={entry.value} entry={entry} isSelected={pending.includes(entry.value)} onPress={() => toggle(entry.value)} />
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <PressableOpacity style={styles.clearButton} onPress={clear}>
            <Text style={styles.clearText}>Cancella i filtri</Text>
          </PressableOpacity>
          <PressableOpacity style={styles.confirmButton} onPress={confirm}>
            <Text style={styles.confirmText}>{resultCount === null ? 'Mostra risultati' : `Mostra ${resultCount} risultati`}</Text>
          </PressableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function Cell({
  entry,
  isSelected,
  onPress,
}: {
  entry: FilterOptionMeta;
  isSelected: boolean;
  onPress: () => void;
}) {
  const Icon = entry.Icon;
  return (
    <PressableOpacity style={[styles.cell, isSelected && styles.cellActive]} onPress={onPress}>
      <View style={[styles.cellIcon, isSelected && styles.cellIconActive]}>
        <Icon size={22} color={isSelected ? colors.primary : colors.text} />
      </View>
      <Text style={[styles.cellText, isSelected && styles.cellTextActive]}>{entry.label}</Text>
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  title: {
    ...typography.sectionTitle,
    color: colors.text,
    padding: 16,
    paddingBottom: 8,
  },
  list: {
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 8,
  },
  group: {
    marginBottom: 18,
  },
  groupTitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 10,
  },
  grid: {
    gap: 10,
  },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  cellActive: {
    borderColor: colors.primary,
  },
  cellIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellIconActive: {
    backgroundColor: colors.primaryMuted,
  },
  cellText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  cellTextActive: {
    fontFamily: fontFamily.bodySemiBold,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  clearButton: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
  },
  clearText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  confirmButton: {
    flex: 1.4,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
  },
  confirmText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
});
