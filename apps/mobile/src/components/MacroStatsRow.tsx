// Reused for both a single meal's macros (AddMealScreen result) and a whole
// day's totals (FoodLogHomeScreen) — same four numbers, different source.
import { StyleSheet, Text, View } from 'react-native';
import type { MacroTotals } from '@traktion/shared-types';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';

export function MacroStatsRow({ calories, protein, carbs, fat }: MacroTotals) {
  return (
    <View style={styles.row}>
      <View style={styles.card}>
        <Text style={styles.value}>{Math.round(calories)}</Text>
        <Text style={styles.label}>kcal</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.value}>{Math.round(protein)}g</Text>
        <Text style={styles.label}>Proteine</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.value}>{Math.round(carbs)}g</Text>
        <Text style={styles.label}>Carbo</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.value}>{Math.round(fat)}g</Text>
        <Text style={styles.label}>Grassi</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    ...shadows.card,
  },
  value: {
    ...typography.bigNumber,
    fontSize: 18,
    color: colors.text,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
