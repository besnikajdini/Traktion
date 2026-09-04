import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Exercise, ExerciseFilterOptions } from '@traktion/shared-types';
import { getExerciseFilters, searchExercises } from '../services/exercises';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { MuscleFilterModal } from '../components/MuscleFilterModal';
import { EquipmentFilterModal } from '../components/EquipmentFilterModal';
import { PressableOpacity } from '../components/PressableOpacity';
import { useExercisePickerStore } from '../store/exercisePickerStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { WorkoutsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<WorkoutsStackParamList, 'ExercisePicker'>;

type OpenFilter = 'bodyPart' | 'equipment' | null;

export function ExercisePickerScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [openFilter, setOpenFilter] = useState<OpenFilter>(null);
  const [filterOptions, setFilterOptions] = useState<ExerciseFilterOptions>({ bodyParts: [], equipment: [] });
  const [results, setResults] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExerciseFilters()
      .then(setFilterOptions)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    searchExercises({ search: debouncedQuery, bodyParts, equipment })
      .then((exercises) => {
        if (!cancelled) setResults(exercises);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, bodyParts, equipment]);

  const pickExercise = (exercise: Exercise) => {
    useExercisePickerStore.getState().setPickedExercise(exercise);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search exercises (e.g. bench press)"
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
        autoFocus
      />

      <View style={styles.filterRow}>
        <PressableOpacity
          style={[styles.filterButton, bodyParts.length > 0 && styles.filterButtonActive]}
          onPress={() => setOpenFilter('bodyPart')}
        >
          <Text style={[styles.filterText, bodyParts.length > 0 && styles.filterTextActive]}>
            {bodyParts.length > 0 ? `Muscle (${bodyParts.length})` : 'Muscle'}
          </Text>
        </PressableOpacity>
        <PressableOpacity
          style={[styles.filterButton, equipment.length > 0 && styles.filterButtonActive]}
          onPress={() => setOpenFilter('equipment')}
        >
          <Text style={[styles.filterText, equipment.length > 0 && styles.filterTextActive]}>
            {equipment.length > 0 ? `Equipment (${equipment.length})` : 'Equipment'}
          </Text>
        </PressableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No exercises found.</Text>}
          renderItem={({ item }) => (
            <PressableOpacity style={styles.row} onPress={() => pickExercise(item)}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
              ) : (
                <View style={styles.thumbnailPlaceholder} />
              )}
              <View style={styles.rowText}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {item.bodyPart}
                  {item.equipment ? ` · ${item.equipment}` : ''}
                </Text>
              </View>
            </PressableOpacity>
          )}
        />
      )}

      <MuscleFilterModal
        visible={openFilter === 'bodyPart'}
        options={filterOptions.bodyParts}
        selected={bodyParts}
        search={debouncedQuery}
        otherFilterValues={equipment}
        onApply={setBodyParts}
        onClose={() => setOpenFilter(null)}
      />
      <EquipmentFilterModal
        visible={openFilter === 'equipment'}
        options={filterOptions.equipment}
        selected={equipment}
        search={debouncedQuery}
        otherFilterValues={bodyParts}
        onApply={setEquipment}
        onClose={() => setOpenFilter(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  search: {
    ...typography.body,
    margin: 16,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  filterButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  filterText: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  filterTextActive: {
    color: colors.text,
  },
  loading: {
    marginTop: 24,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  thumbnailPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  rowText: {
    flex: 1,
  },
  name: {
    ...typography.cardTitle,
    fontSize: 15,
    color: colors.text,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: 'capitalize',
  },
});
