import type { MealType } from '@traktion/shared-types';

// Display order follows the day (colazione → pranzo → spuntino → cena),
// which differs from the schema's enum declaration order.
export const MEAL_TYPE_ORDER: MealType[] = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'];

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Colazione',
  LUNCH: 'Pranzo',
  SNACK: 'Spuntino',
  DINNER: 'Cena',
};
