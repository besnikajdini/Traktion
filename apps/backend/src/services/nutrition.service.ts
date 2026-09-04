// Estimates macros for a free-text meal description.
//
// Approach (see DEVELOPMENT_LOG.md Phase 3 for the full rationale): the
// Nutritionix "Natural Language for Nutrients" endpoint is built exactly for
// this — free text in, matched foods + macros out, backed by a real food
// database instead of an LLM guess. It's tuned for English, though, and
// users write meals in Italian ("150g di petto di pollo"), so the text is
// translated to English with a single lightweight Claude call first. Both
// the translation and the Nutritionix lookup are billed/rate-limited APIs —
// the result is stored on FoodEntry so this only ever runs once per meal.
import Anthropic from '@anthropic-ai/sdk';

export class NutritionEstimationError extends Error {}

// Constructed lazily (not at module load) so the server can start without
// ANTHROPIC_API_KEY set — e.g. during initial setup before .env is filled
// in — and only fails when a food entry is actually created.
let anthropicClient: Anthropic | null = null;
function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic();
  }
  return anthropicClient;
}

async function translateToEnglish(description: string): Promise<string> {
  const response = await getAnthropicClient().messages.create({
    model: 'claude-opus-5',
    max_tokens: 300,
    output_config: { effort: 'low' },
    system:
      'You translate short food-diary entries into English for a nutrition lookup API. ' +
      'Reply with ONLY the translated text — no quotes, no explanation, no extra words. ' +
      'If the text is already in English, return it unchanged. Keep quantities and units as written.',
    messages: [{ role: 'user', content: description }],
  });

  const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === 'text');
  const translated = textBlock?.text.trim();
  if (!translated) {
    throw new NutritionEstimationError('Translation returned no text');
  }
  return translated;
}

interface NutritionixFood {
  nf_calories: number | null;
  nf_protein: number | null;
  nf_total_carbohydrate: number | null;
  nf_total_fat: number | null;
}

interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

async function queryNutritionix(englishText: string): Promise<NutritionixFood[]> {
  const appId = process.env.NUTRITIONIX_APP_ID;
  const apiKey = process.env.NUTRITIONIX_API_KEY;
  if (!appId || !apiKey) {
    throw new NutritionEstimationError('NUTRITIONIX_APP_ID / NUTRITIONIX_API_KEY are not configured');
  }

  const res = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-app-id': appId,
      'x-app-key': apiKey,
    },
    body: JSON.stringify({ query: englishText }),
  });

  if (!res.ok) {
    throw new NutritionEstimationError(`Nutritionix request failed with status ${res.status}`);
  }

  const data = (await res.json()) as { foods?: NutritionixFood[] };
  return data.foods ?? [];
}

function sumMacros(foods: NutritionixFood[]): MacroTotals {
  return foods.reduce<MacroTotals>(
    (totals, food) => ({
      calories: totals.calories + (food.nf_calories ?? 0),
      protein: totals.protein + (food.nf_protein ?? 0),
      carbs: totals.carbs + (food.nf_total_carbohydrate ?? 0),
      fat: totals.fat + (food.nf_total_fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export async function estimateMacros(description: string): Promise<MacroTotals> {
  const englishText = await translateToEnglish(description);
  const foods = await queryNutritionix(englishText);

  if (foods.length === 0) {
    throw new NutritionEstimationError(
      'Nutritionix did not recognize any food in this description',
    );
  }

  const totals = sumMacros(foods);
  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
  };
}
