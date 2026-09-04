import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { countExercises } from '../services/exercises';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { getEquipmentIcon } from '../constants/exerciseFilterMeta';
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

export function EquipmentFilterModal({ visible, options, selected, search, otherFilterValues, onApply, onClose }: Props) {
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
    countExercises({ search, bodyParts: otherFilterValues, equipment: debouncedPending })
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

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={styles.title}>Attrezzatura</Text>
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          <View style={styles.grid}>
            {options.map((option) => {
              const Icon = getEquipmentIcon(option);
              const isSelected = pending.includes(option);
              return (
                <PressableOpacity key={option} style={[styles.cell, isSelected && styles.cellActive]} onPress={() => toggle(option)}>
                  <View style={[styles.cellIcon, isSelected && styles.cellIconActive]}>
                    <Icon size={22} color={isSelected ? colors.primary : colors.text} />
                  </View>
                  <Text style={[styles.cellText, isSelected && styles.cellTextActive]}>{option}</Text>
                </PressableOpacity>
              );
            })}
          </View>
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
    textTransform: 'capitalize',
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
