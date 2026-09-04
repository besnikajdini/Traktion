import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FavoriteMeal, FoodEntry, MealType } from '@traktion/shared-types';
import { createFoodEntry } from '../services/foodEntries';
import { createFavoriteMeal, listFavoriteMeals, logFavoriteMeal } from '../services/favoriteMeals';
import { MacroStatsRow } from '../components/MacroStatsRow';
import { PressableOpacity } from '../components/PressableOpacity';
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from '../constants/mealTypes';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import type { FoodLogStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<FoodLogStackParamList, 'AddMeal'>;

function defaultMealTypeForNow(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return 'BREAKFAST';
  if (hour < 15) return 'LUNCH';
  if (hour < 18) return 'SNACK';
  return 'DINNER';
}

export function AddMealScreen({ navigation }: Props) {
  const [mealType, setMealType] = useState<MealType>(defaultMealTypeForNow);
  const [description, setDescription] = useState('');
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<FoodEntry | null>(null);
  const [favoriteSaved, setFavoriteSaved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      listFavoriteMeals()
        .then(setFavorites)
        .catch(() => {});
    }, []),
  );

  const handleSave = async () => {
    if (description.trim().length === 0) {
      Alert.alert('Descrizione mancante', 'Scrivi cosa hai mangiato.');
      return;
    }
    setSaving(true);
    try {
      const entry = await createFoodEntry({ mealType, description: description.trim() });
      setResult(entry);
      setFavoriteSaved(false);
    } catch (err) {
      Alert.alert('Errore', err instanceof Error ? err.message : 'Non è stato possibile calcolare i macro per questo pasto.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickLog = async (favorite: FavoriteMeal) => {
    setSaving(true);
    try {
      const entry = await logFavoriteMeal(favorite.id);
      setResult(entry);
      setFavoriteSaved(true); // already a favorite — no need to offer saving it again
    } catch {
      Alert.alert('Errore', 'Non è stato possibile registrare questo pasto.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsFavorite = async () => {
    if (!result) return;
    try {
      await createFavoriteMeal({
        mealType: result.mealType,
        description: result.description,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
      });
      setFavoriteSaved(true);
    } catch {
      Alert.alert('Errore', 'Non è stato possibile salvare questo pasto tra i preferiti.');
    }
  };

  if (result) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.resultTitle}>Pasto registrato</Text>
        <Text style={styles.resultDescription}>{result.description}</Text>
        <Text style={styles.resultMealType}>{MEAL_TYPE_LABELS[result.mealType]}</Text>

        <MacroStatsRow calories={result.calories} protein={result.protein} carbs={result.carbs} fat={result.fat} />

        <PressableOpacity
          style={[styles.favoriteButton, favoriteSaved && styles.favoriteButtonDisabled]}
          onPress={handleSaveAsFavorite}
          disabled={favoriteSaved}
        >
          <Text style={[styles.favoriteButtonText, favoriteSaved && styles.favoriteButtonTextDisabled]}>
            {favoriteSaved ? 'Salvato tra i preferiti ✓' : 'Salva come preferito'}
          </Text>
        </PressableOpacity>

        <PressableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
          <Text style={styles.doneButtonText}>Fatto</Text>
        </PressableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Pasto</Text>
      <View style={styles.mealTypeRow}>
        {MEAL_TYPE_ORDER.map((type) => (
          <PressableOpacity
            key={type}
            style={[styles.mealTypeChip, mealType === type && styles.mealTypeChipActive]}
            onPress={() => setMealType(type)}
          >
            <Text style={[styles.mealTypeChipText, mealType === type && styles.mealTypeChipTextActive]}>
              {MEAL_TYPE_LABELS[type]}
            </Text>
          </PressableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Cosa hai mangiato?</Text>
      <TextInput
        style={styles.textArea}
        placeholder="es. 150g di petto di pollo e una porzione di riso"
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <PressableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color={colors.text} /> : <Text style={styles.saveButtonText}>Calcola e salva</Text>}
      </PressableOpacity>

      {favorites.length > 0 && (
        <>
          <Text style={styles.label}>Preferiti</Text>
          <View style={styles.favoritesList}>
            {favorites.map((favorite) => (
              <PressableOpacity
                key={favorite.id}
                style={styles.favoriteCard}
                onPress={() => handleQuickLog(favorite)}
                disabled={saving}
              >
                <View style={styles.favoriteTextWrap}>
                  <Text style={styles.favoriteDescription} numberOfLines={1}>
                    {favorite.description}
                  </Text>
                  <Text style={styles.favoriteMeta}>
                    {MEAL_TYPE_LABELS[favorite.mealType]} · {favorite.calories} kcal
                  </Text>
                </View>
                <Text style={styles.favoriteTapHint}>+ tap</Text>
              </PressableOpacity>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 8,
    paddingBottom: 40,
  },
  label: {
    ...typography.sectionTitle,
    color: colors.textMuted,
    marginTop: 16,
  },
  mealTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mealTypeChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  mealTypeChipActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  mealTypeChipText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  mealTypeChipTextActive: {
    color: colors.primary,
  },
  textArea: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    ...shadows.raised,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.text,
  },
  favoritesList: {
    gap: 8,
  },
  favoriteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    ...shadows.card,
  },
  favoriteTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  favoriteDescription: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  favoriteMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  favoriteTapHint: {
    ...typography.caption,
    color: colors.primary,
  },
  resultTitle: {
    ...typography.screenTitle,
    color: colors.primary,
  },
  resultDescription: {
    ...typography.body,
    color: colors.text,
    marginTop: 8,
  },
  resultMealType: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 16,
  },
  favoriteButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  favoriteButtonDisabled: {
    borderColor: colors.border,
  },
  favoriteButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  favoriteButtonTextDisabled: {
    color: colors.textMuted,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    ...shadows.raised,
  },
  doneButtonText: {
    ...typography.button,
    color: colors.text,
  },
});
