// Estimates macros for a free-text meal description entirely locally —
// no external API, no API key, no cost. See DEVELOPMENT_LOG.md Phase 3 for
// why: the two nutrition APIs originally picked for this (Nutritionix,
// Edamam) turned out to no longer offer a usable free tier, so this matches
// the description against a small hand-curated food table (src/data/foods.ts)
// instead. Trade-off, stated plainly: it only recognizes foods in that
// table, and only fairly standard Italian quantity phrasing ("150g di...",
// "una porzione di...", "2 uova"). Extend src/data/foods.ts to widen coverage.
import { FOODS, type FoodItem } from '../data/foods';

export class NutritionEstimationError extends Error {}

interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const DEFAULT_PORTION_GRAMS = 150;
const DEFAULT_UNIT_WEIGHT_GRAMS = 50;

// Grams per unit for weight/volume words. "porzione"/"fetta"/"pezzo"/"uovo"
// are handled separately below since their gram value depends on the food.
const UNIT_GRAMS: Record<string, number> = {
  g: 1,
  gr: 1,
  grammo: 1,
  grammi: 1,
  kg: 1000,
  kilogrammo: 1000,
  kilogrammi: 1000,
  chilo: 1000,
  chili: 1000,
  cucchiaio: 15,
  cucchiai: 15,
  cucchiaino: 5,
  cucchiaini: 5,
  tazza: 200,
  tazze: 200,
  bicchiere: 200,
  bicchieri: 200,
};

const UNIT_WEIGHT_UNITS = new Set(['fetta', 'fette', 'pezzo', 'pezzi', 'uovo', 'uova']);
const PORTION_UNITS = new Set(['porzione', 'porzioni']);

const QUANTITY_WORDS: Record<string, number> = {
  un: 1,
  uno: 1,
  una: 1,
  due: 2,
  tre: 3,
  quattro: 4,
  cinque: 5,
  sei: 6,
  sette: 7,
  otto: 8,
  nove: 9,
  dieci: 10,
};

function parseQuantityToken(token: string): number | null {
  if (/^\d+([.,]\d+)?$/.test(token)) {
    return Number(token.replace(',', '.'));
  }
  return QUANTITY_WORDS[token] ?? null;
}

// Finds the food whose matching alias appears earliest in the segment —
// this is what the user named the dish/food as, e.g. "gelato" in "gelato al
// cioccolato" should win over "cioccolato" even though the latter is a
// longer alias. Ties (same start position) go to the longer alias, so
// "petto di pollo" still wins over the shorter "pollo" that starts at the
// same place.
function matchFood(text: string): FoodItem | null {
  let best: { food: FoodItem; alias: string; index: number } | null = null;
  for (const food of FOODS) {
    for (const alias of food.names) {
      const index = text.indexOf(alias);
      if (index === -1) continue;
      if (!best || index < best.index || (index === best.index && alias.length > best.alias.length)) {
        best = { food, alias, index };
      }
    }
  }
  return best?.food ?? null;
}

function computeGrams(food: FoodItem, quantity: number | null, unit: string | null): number {
  const qty = quantity ?? 1;
  if (unit && unit in UNIT_GRAMS) {
    return qty * UNIT_GRAMS[unit];
  }
  if (unit && UNIT_WEIGHT_UNITS.has(unit)) {
    return qty * (food.unitWeightGrams ?? DEFAULT_UNIT_WEIGHT_GRAMS);
  }
  // No unit, or an explicit "porzione" — use the food's own portion size.
  return qty * (food.defaultPortionGrams ?? DEFAULT_PORTION_GRAMS);
}

interface ParsedSegment {
  food: FoodItem;
  grams: number;
}

function parseSegment(rawSegment: string): ParsedSegment | null {
  const text = rawSegment.trim();
  if (!text) return null;

  const tokens = text.split(/\s+/);
  let index = 0;

  let quantity: number | null = null;
  if (tokens.length > 0) {
    const q = parseQuantityToken(tokens[0]);
    if (q !== null) {
      quantity = q;
      index = 1;
    }
  }

  let unit: string | null = null;
  if (index < tokens.length) {
    const candidate = tokens[index];
    if (candidate in UNIT_GRAMS || UNIT_WEIGHT_UNITS.has(candidate) || PORTION_UNITS.has(candidate)) {
      unit = candidate;
      index++;
    }
  }

  let rest = tokens.slice(index).join(' ').replace(/^(di|d')\s*/i, '').trim();
  if (!rest) rest = text; // nothing left after stripping quantity/unit — match on the whole segment instead

  const food = matchFood(rest) ?? matchFood(text);
  if (!food) return null;

  return { food, grams: computeGrams(food, quantity, unit) };
}

export function estimateMacros(description: string): MacroTotals {
  // "150g" → "150 g" so the unit word always tokenizes separately from the number.
  const normalized = description.toLowerCase().replace(/(\d)([a-zà-ù])/gi, '$1 $2');
  const segments = normalized
    .split(/,|;| e | con | più |\n/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const totals: MacroTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  let recognizedCount = 0;

  for (const segment of segments) {
    const parsed = parseSegment(segment);
    if (!parsed) continue;
    recognizedCount++;
    const factor = parsed.grams / 100;
    totals.calories += parsed.food.caloriesPer100g * factor;
    totals.protein += parsed.food.proteinPer100g * factor;
    totals.carbs += parsed.food.carbsPer100g * factor;
    totals.fat += parsed.food.fatPer100g * factor;
  }

  if (recognizedCount === 0) {
    throw new NutritionEstimationError('No known food recognized in description');
  }

  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
  };
}
