import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DailyNutritionSummary, FoodEntry, MealType } from '@traktion/shared-types';
import { deleteFoodEntry, getDailySummary } from '../services/foodEntries';
import { MacroStatsRow } from '../components/MacroStatsRow';
import { PressableOpacity } from '../components/PressableOpacity';
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from '../constants/mealTypes';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { FoodLogStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<FoodLogStackParamList, 'FoodLogHome'>;

// Local calendar date — the backend treats it as a UTC day boundary (same
// simplification as the workout streak's Monday–Sunday weeks), so "today"
// can shift by a few hours right around midnight depending on timezone.
function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function FoodLogScreen({ navigation }: Props) {
  const [summary, setSummary] = useState<DailyNutritionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    return getDailySummary(todayDateString())
      .then(setSummary)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleDelete = (entry: FoodEntry) => {
    Alert.alert('Elimina pasto?', entry.description, [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Elimina',
        style: 'destructive',
        onPress: () => {
          deleteFoodEntry(entry.id)
            .then(load)
            .catch(() => Alert.alert('Errore', 'Non è stato possibile eliminare questo pasto.'));
        },
      },
    ]);
  };

  if (loading || !summary) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const entriesByMealType = new Map<MealType, FoodEntry[]>();
  for (const entry of summary.entries) {
    const list = entriesByMealType.get(entry.mealType) ?? [];
    list.push(entry);
    entriesByMealType.set(entry.mealType, list);
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.calorieCard}>
          <Text style={styles.calorieValue}>{summary.totals.calories}</Text>
          <Text style={styles.calorieLabel}>kcal consumate oggi</Text>
          {summary.goalCalories !== null ? (
            <Text style={styles.remainingText}>
              {summary.remainingCalories !== null && summary.remainingCalories >= 0
                ? `${summary.remainingCalories} kcal rimanenti (obiettivo ${summary.goalCalories})`
                : `${Math.abs(summary.remainingCalories ?? 0)} kcal oltre l'obiettivo (${summary.goalCalories})`}
            </Text>
          ) : (
            <PressableOpacity onPress={() => navigation.navigate('NutritionGoal')}>
              <Text style={styles.setGoalText}>Imposta un obiettivo calorico</Text>
            </PressableOpacity>
          )}
        </View>

        <MacroStatsRow {...summary.totals} />

        {summary.entries.length === 0 ? (
          <Text style={styles.emptyText}>Nessun pasto registrato oggi.</Text>
        ) : (
          MEAL_TYPE_ORDER.filter((type) => entriesByMealType.has(type)).map((type) => (
            <View key={type} style={styles.mealSection}>
              <Text style={styles.sectionTitle}>{MEAL_TYPE_LABELS[type]}</Text>
              <View style={styles.entryList}>
                {entriesByMealType.get(type)!.map((entry) => (
                  <PressableOpacity key={entry.id} style={styles.entryCard} onPress={() => handleDelete(entry)}>
                    <View style={styles.entryTextWrap}>
                      <Text style={styles.entryDescription} numberOfLines={2}>
                        {entry.description}
                      </Text>
                      <Text style={styles.entryMacros}>
                        P {Math.round(entry.protein)}g · C {Math.round(entry.carbs)}g · G {Math.round(entry.fat)}g
                      </Text>
                    </View>
                    <Text style={styles.entryCalories}>{entry.calories} kcal</Text>
                  </PressableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <PressableOpacity style={styles.fab} onPress={() => navigation.navigate('AddMeal')}>
        <Text style={styles.fabText}>+ Aggiungi pasto</Text>
      </PressableOpacity>
    </View>
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
    gap: 16,
    paddingBottom: 100,
  },
  calorieCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    ...shadows.card,
  },
  calorieValue: {
    ...typography.bigNumber,
    fontSize: 40,
    color: colors.primary,
  },
  calorieLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  remainingText: {
    ...typography.body,
    color: colors.text,
    marginTop: 10,
  },
  setGoalText: {
    ...typography.bodyMedium,
    color: colors.primary,
    marginTop: 10,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
  },
  mealSection: {
    gap: 8,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.textMuted,
  },
  entryList: {
    gap: 8,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    ...shadows.card,
  },
  entryTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  entryDescription: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  entryMacros: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  entryCalories: {
    ...typography.cardTitle,
    color: colors.primary,
  },
  fab: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    ...shadows.raised,
  },
  fabText: {
    ...typography.button,
    color: colors.text,
  },
});
