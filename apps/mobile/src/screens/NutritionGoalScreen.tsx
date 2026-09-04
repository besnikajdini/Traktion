import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as authService from '../services/auth';
import { useAuthStore } from '../store/authStore';
import { PressableOpacity } from '../components/PressableOpacity';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { FoodLogStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<FoodLogStackParamList, 'NutritionGoal'>;

export function NutritionGoalScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [value, setValue] = useState(user?.dailyCalorieGoal ? String(user.dailyCalorieGoal) : '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const goal = Number(value);
    if (!Number.isFinite(goal) || goal <= 0) {
      Alert.alert('Valore non valido', 'Inserisci un numero di calorie maggiore di zero.');
      return;
    }
    setSaving(true);
    try {
      const updated = await authService.updateNutritionGoal(Math.round(goal));
      setUser(updated);
      navigation.goBack();
    } catch {
      Alert.alert('Errore', "Non è stato possibile salvare l'obiettivo calorico.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Obiettivo calorico giornaliero</Text>
      <TextInput
        style={styles.input}
        placeholder="es. 2200"
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={setValue}
        keyboardType="number-pad"
      />
      <Text style={styles.hint}>kcal / giorno — usato per calcolare le calorie rimanenti nel diario alimentare.</Text>

      <PressableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color={colors.text} /> : <Text style={styles.saveButtonText}>Salva</Text>}
      </PressableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  label: {
    ...typography.sectionTitle,
    color: colors.textMuted,
  },
  input: {
    ...typography.bigNumber,
    fontSize: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    marginTop: 10,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    ...shadows.raised,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.text,
  },
});
