import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Exercise } from '@traktion/shared-types';
import { searchExercises } from '../services/exercises';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { WorkoutsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<WorkoutsStackParamList, 'ExercisePicker'>;

export function ExercisePickerScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const [results, setResults] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    searchExercises(debouncedQuery)
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
  }, [debouncedQuery]);

  const pickExercise = (exercise: Exercise) => {
    navigation.navigate({
      name: 'PlanBuilder',
      params: { pickedExercise: exercise },
      merge: true,
    });
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
      {loading ? (
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No exercises found.</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => pickExercise(item)}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
              ) : (
                <View style={styles.thumbnailPlaceholder} />
              )}
              <View style={styles.rowText}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {item.muscleGroup}
                  {item.equipment ? ` · ${item.equipment}` : ''}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
