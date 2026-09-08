// Hand-curated table of common foods (Italian names) with macros per 100g.
// This is the entire "food database" for Phase 3's macro estimation — see
// src/services/nutrition.service.ts for how it's matched against free text,
// and DEVELOPMENT_LOG.md for why this replaced an external API.
//
// Per-100g figures are sourced from the USDA FoodData Central SR Legacy
// dataset (free, English, public domain / CC0 — https://fdc.nal.usda.gov),
// using the cooked/as-eaten form where one applies (e.g. "riso" and "pasta"
// are *cooked* values, matching how a portion is actually described and
// eaten) — a raw-weight figure would silently overstate a logged meal.
//
// To recognize a new food: add an entry here. `names` are the aliases
// matched against the user's text (longest alias wins when several could
// match, so put specific phrases like "petto di pollo" ahead of nothing —
// order doesn't actually matter, length does).
export interface FoodItem {
  id: string;
  names: string[];
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  /** Assumed grams for "una porzione di X" or a bare "X" with no quantity. */
  defaultPortionGrams?: number;
  /** Assumed grams for one countable unit ("un uovo", "una fetta di pane"). */
  unitWeightGrams?: number;
}

export const FOODS: FoodItem[] = [
  { id: 'petto-di-pollo', names: ['petto di pollo', 'pollo alla griglia', 'pollo'], caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, defaultPortionGrams: 150 },
  { id: 'uovo', names: ['uova', 'uovo'], caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, unitWeightGrams: 50 },
  { id: 'tonno', names: ['tonno'], caloriesPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 1, defaultPortionGrams: 80 },
  { id: 'salmone', names: ['salmone'], caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, defaultPortionGrams: 150 },
  { id: 'manzo', names: ['bistecca di manzo', 'carne di manzo', 'manzo'], caloriesPer100g: 250, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 15, defaultPortionGrams: 150 },
  { id: 'tacchino', names: ['petto di tacchino', 'tacchino'], caloriesPer100g: 135, proteinPer100g: 30, carbsPer100g: 0, fatPer100g: 1, defaultPortionGrams: 150 },
  { id: 'prosciutto-cotto', names: ['prosciutto cotto', 'prosciutto'], caloriesPer100g: 145, proteinPer100g: 18, carbsPer100g: 1.5, fatPer100g: 5, defaultPortionGrams: 50, unitWeightGrams: 25 },
  { id: 'mozzarella', names: ['mozzarella'], caloriesPer100g: 280, proteinPer100g: 18, carbsPer100g: 3, fatPer100g: 22, defaultPortionGrams: 100 },
  { id: 'parmigiano', names: ['parmigiano', 'grana'], caloriesPer100g: 392, proteinPer100g: 35, carbsPer100g: 0, fatPer100g: 26, defaultPortionGrams: 30 },
  { id: 'yogurt-greco', names: ['yogurt greco', 'yogurt'], caloriesPer100g: 97, proteinPer100g: 9, carbsPer100g: 4, fatPer100g: 5, defaultPortionGrams: 150 },
  { id: 'latte', names: ['latte'], caloriesPer100g: 46, proteinPer100g: 3.4, carbsPer100g: 5, fatPer100g: 1.6, defaultPortionGrams: 200 },
  { id: 'lenticchie', names: ['lenticchie'], caloriesPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 0.4, defaultPortionGrams: 150 },
  { id: 'ceci', names: ['ceci'], caloriesPer100g: 164, proteinPer100g: 8.9, carbsPer100g: 27, fatPer100g: 2.6, defaultPortionGrams: 150 },
  { id: 'fagioli', names: ['fagioli'], caloriesPer100g: 127, proteinPer100g: 8.7, carbsPer100g: 22.8, fatPer100g: 0.5, defaultPortionGrams: 150 },
  { id: 'riso', names: ['riso'], caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, defaultPortionGrams: 150 },
  { id: 'pasta', names: ['pasta'], caloriesPer100g: 158, proteinPer100g: 5.8, carbsPer100g: 31, fatPer100g: 0.9, defaultPortionGrams: 180 },
  { id: 'pane-integrale', names: ['pane integrale', 'pane'], caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 3.4, defaultPortionGrams: 60, unitWeightGrams: 25 },
  { id: 'patate', names: ['patate'], caloriesPer100g: 87, proteinPer100g: 1.9, carbsPer100g: 20, fatPer100g: 0.1, defaultPortionGrams: 200 },
  { id: 'avena', names: ["fiocchi d'avena", 'avena'], caloriesPer100g: 389, proteinPer100g: 17, carbsPer100g: 66, fatPer100g: 7, defaultPortionGrams: 50 },
  { id: 'cereali', names: ['cereali'], caloriesPer100g: 380, proteinPer100g: 8, carbsPer100g: 78, fatPer100g: 4, defaultPortionGrams: 40 },
  { id: 'olio-oliva', names: ["olio d'oliva", 'olio'], caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, defaultPortionGrams: 10 },
  { id: 'burro', names: ['burro'], caloriesPer100g: 717, proteinPer100g: 0.9, carbsPer100g: 0.1, fatPer100g: 81, defaultPortionGrams: 10 },
  { id: 'avocado', names: ['avocado'], caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 8.5, fatPer100g: 14.7, defaultPortionGrams: 100, unitWeightGrams: 150 },
  { id: 'mandorle', names: ['mandorle'], caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50, defaultPortionGrams: 30 },
  { id: 'noci', names: ['noci'], caloriesPer100g: 654, proteinPer100g: 15, carbsPer100g: 14, fatPer100g: 65, defaultPortionGrams: 30 },
  { id: 'mela', names: ['mela'], caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2, unitWeightGrams: 180 },
  { id: 'banana', names: ['banana'], caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, unitWeightGrams: 120 },
  { id: 'arancia', names: ['arancia'], caloriesPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 12, fatPer100g: 0.1, unitWeightGrams: 150 },
  { id: 'insalata', names: ['insalata mista', 'insalata verde', 'insalata'], caloriesPer100g: 15, proteinPer100g: 1.4, carbsPer100g: 2.9, fatPer100g: 0.2, defaultPortionGrams: 100 },
  { id: 'pomodoro', names: ['pomodori', 'pomodoro'], caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, unitWeightGrams: 120 },
  { id: 'broccoli', names: ['broccoli'], caloriesPer100g: 35, proteinPer100g: 2.4, carbsPer100g: 7, fatPer100g: 0.4, defaultPortionGrams: 150 },
  { id: 'zucchine', names: ['zucchine'], caloriesPer100g: 17, proteinPer100g: 1.2, carbsPer100g: 3.1, fatPer100g: 0.3, defaultPortionGrams: 150 },
  { id: 'verdure', names: ['verdure miste', 'verdure'], caloriesPer100g: 25, proteinPer100g: 1.5, carbsPer100g: 4, fatPer100g: 0.3, defaultPortionGrams: 150 },
  { id: 'barretta-proteica', names: ['barretta proteica', 'barretta'], caloriesPer100g: 380, proteinPer100g: 30, carbsPer100g: 35, fatPer100g: 12, unitWeightGrams: 60 },
  { id: 'cioccolato-fondente', names: ['cioccolato fondente', 'cioccolato'], caloriesPer100g: 546, proteinPer100g: 7.8, carbsPer100g: 46, fatPer100g: 31, defaultPortionGrams: 20 },
  { id: 'pizza-margherita', names: ['pizza margherita', 'pizza'], caloriesPer100g: 266, proteinPer100g: 11, carbsPer100g: 33, fatPer100g: 10, defaultPortionGrams: 250 },
  { id: 'proteine-whey', names: ['proteine in polvere', 'proteine whey', 'whey'], caloriesPer100g: 375, proteinPer100g: 75, carbsPer100g: 8, fatPer100g: 5, defaultPortionGrams: 30, unitWeightGrams: 30 },

  // --- Carne e pesce (aggiunti da USDA FoodData Central) ---
  { id: 'maiale', names: ['lonza di maiale', 'carne di maiale', 'maiale'], caloriesPer100g: 242, proteinPer100g: 27, carbsPer100g: 0, fatPer100g: 14, defaultPortionGrams: 150 },
  { id: 'agnello', names: ['carne di agnello', 'agnello'], caloriesPer100g: 258, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 17, defaultPortionGrams: 150 },
  { id: 'vitello', names: ['scaloppina di vitello', 'carne di vitello', 'vitello'], caloriesPer100g: 172, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 5, defaultPortionGrams: 150 },
  { id: 'salame', names: ['salame'], caloriesPer100g: 336, proteinPer100g: 22, carbsPer100g: 1, fatPer100g: 26, defaultPortionGrams: 40, unitWeightGrams: 10 },
  { id: 'bresaola', names: ['bresaola'], caloriesPer100g: 151, proteinPer100g: 32, carbsPer100g: 0.5, fatPer100g: 2.6, defaultPortionGrams: 50 },
  { id: 'speck', names: ['speck'], caloriesPer100g: 271, proteinPer100g: 21, carbsPer100g: 0, fatPer100g: 21, defaultPortionGrams: 40 },
  { id: 'merluzzo', names: ['merluzzo'], caloriesPer100g: 105, proteinPer100g: 23, carbsPer100g: 0, fatPer100g: 1, defaultPortionGrams: 150 },
  { id: 'gamberi', names: ['gamberetti', 'gamberi'], caloriesPer100g: 99, proteinPer100g: 21, carbsPer100g: 0.2, fatPer100g: 1, defaultPortionGrams: 120 },
  { id: 'branzino', names: ['branzino'], caloriesPer100g: 124, proteinPer100g: 24, carbsPer100g: 0, fatPer100g: 3, defaultPortionGrams: 150 },
  { id: 'orata', names: ['orata'], caloriesPer100g: 121, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 4, defaultPortionGrams: 150 },
  { id: 'sgombro', names: ['sgombro'], caloriesPer100g: 205, proteinPer100g: 19, carbsPer100g: 0, fatPer100g: 14, defaultPortionGrams: 150 },
  { id: 'alici', names: ['acciughe', 'alici'], caloriesPer100g: 131, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 5, defaultPortionGrams: 30, unitWeightGrams: 5 },
  { id: 'polpo', names: ['polpo'], caloriesPer100g: 164, proteinPer100g: 30, carbsPer100g: 4, fatPer100g: 2, defaultPortionGrams: 150 },
  { id: 'cozze', names: ['cozze'], caloriesPer100g: 172, proteinPer100g: 24, carbsPer100g: 7, fatPer100g: 4.5, defaultPortionGrams: 150 },

  // --- Latticini ---
  { id: 'ricotta', names: ['ricotta'], caloriesPer100g: 174, proteinPer100g: 11, carbsPer100g: 3, fatPer100g: 13, defaultPortionGrams: 100 },
  { id: 'formaggio-spalmabile', names: ['formaggio spalmabile', 'philadelphia'], caloriesPer100g: 253, proteinPer100g: 5.5, carbsPer100g: 4, fatPer100g: 24, defaultPortionGrams: 30 },
  { id: 'feta', names: ['feta'], caloriesPer100g: 264, proteinPer100g: 14, carbsPer100g: 4, fatPer100g: 21, defaultPortionGrams: 50 },
  { id: 'panna', names: ['panna da cucina', 'panna'], caloriesPer100g: 340, proteinPer100g: 2, carbsPer100g: 3, fatPer100g: 36, defaultPortionGrams: 30 },
  { id: 'kefir', names: ['kefir'], caloriesPer100g: 41, proteinPer100g: 3.3, carbsPer100g: 4.5, fatPer100g: 1, defaultPortionGrams: 200 },

  // --- Proteine vegetali ---
  { id: 'tofu', names: ['tofu'], caloriesPer100g: 144, proteinPer100g: 17.3, carbsPer100g: 2.8, fatPer100g: 8.7, defaultPortionGrams: 150 },
  { id: 'tempeh', names: ['tempeh'], caloriesPer100g: 192, proteinPer100g: 20, carbsPer100g: 8, fatPer100g: 11, defaultPortionGrams: 150 },
  { id: 'seitan', names: ['seitan'], caloriesPer100g: 370, proteinPer100g: 75, carbsPer100g: 14, fatPer100g: 1.9, defaultPortionGrams: 100 },
  { id: 'piselli', names: ['piselli'], caloriesPer100g: 84, proteinPer100g: 5.4, carbsPer100g: 15, fatPer100g: 0.2, defaultPortionGrams: 150 },
  { id: 'edamame', names: ['edamame'], caloriesPer100g: 121, proteinPer100g: 12, carbsPer100g: 9, fatPer100g: 5, defaultPortionGrams: 100 },

  // --- Cereali e amidi (valori da cotti, come mangiati) ---
  { id: 'quinoa', names: ['quinoa'], caloriesPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21.3, fatPer100g: 1.9, defaultPortionGrams: 150 },
  { id: 'farro', names: ['farro'], caloriesPer100g: 127, proteinPer100g: 5.5, carbsPer100g: 26.4, fatPer100g: 0.85, defaultPortionGrams: 150 },
  { id: 'orzo', names: ['orzo perlato', 'orzo'], caloriesPer100g: 123, proteinPer100g: 2.26, carbsPer100g: 28.2, fatPer100g: 0.44, defaultPortionGrams: 150 },
  { id: 'couscous', names: ['cous cous', 'couscous'], caloriesPer100g: 112, proteinPer100g: 3.79, carbsPer100g: 23.2, fatPer100g: 0.16, defaultPortionGrams: 150 },
  { id: 'polenta', names: ['polenta'], caloriesPer100g: 70, proteinPer100g: 1.6, carbsPer100g: 14.8, fatPer100g: 0.5, defaultPortionGrams: 200 },
  { id: 'gnocchi', names: ['gnocchi di patate', 'gnocchi'], caloriesPer100g: 130, proteinPer100g: 3, carbsPer100g: 27, fatPer100g: 0.5, defaultPortionGrams: 250 },
  { id: 'fette-biscottate', names: ['fette biscottate'], caloriesPer100g: 408, proteinPer100g: 10, carbsPer100g: 76, fatPer100g: 6.5, defaultPortionGrams: 20, unitWeightGrams: 6 },
  { id: 'cracker', names: ['cracker'], caloriesPer100g: 428, proteinPer100g: 10, carbsPer100g: 68, fatPer100g: 13, defaultPortionGrams: 25 },
  { id: 'grissini', names: ['grissini'], caloriesPer100g: 415, proteinPer100g: 11, carbsPer100g: 75, fatPer100g: 8, defaultPortionGrams: 20 },
  { id: 'muesli', names: ['muesli'], caloriesPer100g: 375, proteinPer100g: 10, carbsPer100g: 66, fatPer100g: 7, defaultPortionGrams: 50 },

  // --- Verdure ---
  { id: 'carote', names: ['carote'], caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.2, defaultPortionGrams: 100 },
  { id: 'spinaci', names: ['spinaci'], caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, defaultPortionGrams: 100 },
  { id: 'funghi', names: ['funghi champignon', 'funghi'], caloriesPer100g: 28, proteinPer100g: 3.1, carbsPer100g: 5, fatPer100g: 0.5, defaultPortionGrams: 100 },
  { id: 'peperoni', names: ['peperoni'], caloriesPer100g: 31, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.3, defaultPortionGrams: 100 },
  { id: 'cetrioli', names: ['cetrioli'], caloriesPer100g: 15, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1, defaultPortionGrams: 100 },
  { id: 'cipolla', names: ['cipolle', 'cipolla'], caloriesPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9.3, fatPer100g: 0.1, defaultPortionGrams: 80 },
  { id: 'melanzane', names: ['melanzane'], caloriesPer100g: 35, proteinPer100g: 0.8, carbsPer100g: 8.6, fatPer100g: 0.2, defaultPortionGrams: 150 },
  { id: 'cavolfiore', names: ['cavolfiore'], caloriesPer100g: 25, proteinPer100g: 1.8, carbsPer100g: 5, fatPer100g: 0.3, defaultPortionGrams: 150 },
  { id: 'cavolo-nero', names: ['cavolo nero', 'cavolo'], caloriesPer100g: 28, proteinPer100g: 2, carbsPer100g: 5.6, fatPer100g: 0.4, defaultPortionGrams: 100 },
  { id: 'asparagi', names: ['asparagi'], caloriesPer100g: 22, proteinPer100g: 2.4, carbsPer100g: 4, fatPer100g: 0.2, defaultPortionGrams: 150 },
  { id: 'fagiolini', names: ['fagiolini'], caloriesPer100g: 35, proteinPer100g: 1.8, carbsPer100g: 7, fatPer100g: 0.3, defaultPortionGrams: 150 },
  { id: 'sedano', names: ['sedano'], caloriesPer100g: 16, proteinPer100g: 0.7, carbsPer100g: 3, fatPer100g: 0.2, defaultPortionGrams: 80 },
  { id: 'finocchi', names: ['finocchi'], caloriesPer100g: 31, proteinPer100g: 1.2, carbsPer100g: 7, fatPer100g: 0.2, defaultPortionGrams: 150 },
  { id: 'rucola', names: ['rucola'], caloriesPer100g: 25, proteinPer100g: 2.6, carbsPer100g: 3.7, fatPer100g: 0.7, defaultPortionGrams: 40 },
  { id: 'carciofi', names: ['carciofi'], caloriesPer100g: 47, proteinPer100g: 3.3, carbsPer100g: 10, fatPer100g: 0.4, defaultPortionGrams: 150 },

  // --- Frutta ---
  { id: 'pera', names: ['pera'], caloriesPer100g: 57, proteinPer100g: 0.4, carbsPer100g: 15, fatPer100g: 0.1, unitWeightGrams: 170 },
  { id: 'uva', names: ['uva'], caloriesPer100g: 69, proteinPer100g: 0.7, carbsPer100g: 18, fatPer100g: 0.2, defaultPortionGrams: 100 },
  { id: 'fragole', names: ['fragole'], caloriesPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 7.7, fatPer100g: 0.3, defaultPortionGrams: 150 },
  { id: 'kiwi', names: ['kiwi'], caloriesPer100g: 61, proteinPer100g: 1.1, carbsPer100g: 15, fatPer100g: 0.5, unitWeightGrams: 70 },
  { id: 'ananas', names: ['ananas'], caloriesPer100g: 50, proteinPer100g: 0.5, carbsPer100g: 13, fatPer100g: 0.1, defaultPortionGrams: 150 },
  { id: 'anguria', names: ['anguria', 'cocomero'], caloriesPer100g: 30, proteinPer100g: 0.6, carbsPer100g: 7.6, fatPer100g: 0.2, defaultPortionGrams: 200 },
  { id: 'mirtilli', names: ['mirtilli'], caloriesPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14.5, fatPer100g: 0.3, defaultPortionGrams: 100 },
  { id: 'pesca', names: ['pesche', 'pesca'], caloriesPer100g: 39, proteinPer100g: 0.9, carbsPer100g: 9.5, fatPer100g: 0.3, unitWeightGrams: 150 },
  { id: 'mango', names: ['mango'], caloriesPer100g: 60, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4, defaultPortionGrams: 150 },
  { id: 'pompelmo', names: ['pompelmo'], caloriesPer100g: 42, proteinPer100g: 0.8, carbsPer100g: 11, fatPer100g: 0.1, unitWeightGrams: 200 },
  { id: 'fichi', names: ['fichi'], caloriesPer100g: 74, proteinPer100g: 0.8, carbsPer100g: 19, fatPer100g: 0.3, unitWeightGrams: 50 },
  { id: 'ciliegie', names: ['ciliegie'], caloriesPer100g: 63, proteinPer100g: 1.1, carbsPer100g: 16, fatPer100g: 0.2, defaultPortionGrams: 100 },
  { id: 'melone', names: ['melone'], caloriesPer100g: 34, proteinPer100g: 0.8, carbsPer100g: 8, fatPer100g: 0.2, defaultPortionGrams: 200 },
  { id: 'cocco', names: ['cocco'], caloriesPer100g: 354, proteinPer100g: 3.3, carbsPer100g: 15, fatPer100g: 33, defaultPortionGrams: 30 },

  // --- Frutta secca e semi ---
  { id: 'nocciole', names: ['nocciole'], caloriesPer100g: 628, proteinPer100g: 15, carbsPer100g: 17, fatPer100g: 61, defaultPortionGrams: 30 },
  { id: 'pistacchi', names: ['pistacchi'], caloriesPer100g: 560, proteinPer100g: 20, carbsPer100g: 28, fatPer100g: 45, defaultPortionGrams: 30 },
  { id: 'anacardi', names: ['anacardi'], caloriesPer100g: 553, proteinPer100g: 18, carbsPer100g: 30, fatPer100g: 44, defaultPortionGrams: 30 },
  { id: 'arachidi', names: ['arachidi'], caloriesPer100g: 567, proteinPer100g: 26, carbsPer100g: 16, fatPer100g: 49, defaultPortionGrams: 30 },
  { id: 'burro-arachidi', names: ['burro di arachidi'], caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50, defaultPortionGrams: 20 },
  { id: 'semi-chia', names: ['semi di chia'], caloriesPer100g: 486, proteinPer100g: 17, carbsPer100g: 42, fatPer100g: 31, defaultPortionGrams: 15 },
  { id: 'semi-lino', names: ['semi di lino'], caloriesPer100g: 534, proteinPer100g: 18, carbsPer100g: 29, fatPer100g: 42, defaultPortionGrams: 15 },
  { id: 'semi-zucca', names: ['semi di zucca'], caloriesPer100g: 559, proteinPer100g: 30, carbsPer100g: 11, fatPer100g: 49, defaultPortionGrams: 20 },
  { id: 'semi-girasole', names: ['semi di girasole'], caloriesPer100g: 584, proteinPer100g: 21, carbsPer100g: 20, fatPer100g: 51, defaultPortionGrams: 20 },

  // --- Condimenti e grassi ---
  { id: 'margarina', names: ['margarina'], caloriesPer100g: 717, proteinPer100g: 0.2, carbsPer100g: 0.9, fatPer100g: 80, defaultPortionGrams: 10 },
  { id: 'maionese', names: ['maionese'], caloriesPer100g: 680, proteinPer100g: 1, carbsPer100g: 1, fatPer100g: 75, defaultPortionGrams: 15 },
  { id: 'ketchup', names: ['ketchup'], caloriesPer100g: 101, proteinPer100g: 1.2, carbsPer100g: 24, fatPer100g: 0.1, defaultPortionGrams: 15 },
  { id: 'senape', names: ['senape'], caloriesPer100g: 66, proteinPer100g: 4, carbsPer100g: 6, fatPer100g: 3.4, defaultPortionGrams: 10 },

  // --- Dolci e snack ---
  { id: 'miele', names: ['miele'], caloriesPer100g: 304, proteinPer100g: 0.3, carbsPer100g: 82, fatPer100g: 0, defaultPortionGrams: 20 },
  { id: 'marmellata', names: ['marmellata'], caloriesPer100g: 250, proteinPer100g: 0.3, carbsPer100g: 62, fatPer100g: 0.1, defaultPortionGrams: 20 },
  { id: 'zucchero', names: ['zucchero'], caloriesPer100g: 387, proteinPer100g: 0, carbsPer100g: 100, fatPer100g: 0, defaultPortionGrams: 5 },
  { id: 'gelato', names: ['gelato'], caloriesPer100g: 207, proteinPer100g: 3.5, carbsPer100g: 24, fatPer100g: 11, defaultPortionGrams: 100 },
  { id: 'biscotti', names: ['biscotti'], caloriesPer100g: 450, proteinPer100g: 6, carbsPer100g: 68, fatPer100g: 17, defaultPortionGrams: 30 },
  { id: 'patatine', names: ['patatine fritte', 'patatine'], caloriesPer100g: 536, proteinPer100g: 7, carbsPer100g: 53, fatPer100g: 34, defaultPortionGrams: 50 },
  { id: 'popcorn', names: ['popcorn'], caloriesPer100g: 387, proteinPer100g: 13, carbsPer100g: 78, fatPer100g: 4.5, defaultPortionGrams: 30 },
  { id: 'nutella', names: ['crema di nocciole', 'nutella'], caloriesPer100g: 539, proteinPer100g: 6, carbsPer100g: 57, fatPer100g: 31, defaultPortionGrams: 15 },

  // --- Bevande ---
  { id: 'succo-arancia', names: ["succo d'arancia", 'succo di frutta', 'succo'], caloriesPer100g: 45, proteinPer100g: 0.7, carbsPer100g: 10.4, fatPer100g: 0.2, defaultPortionGrams: 200 },
  { id: 'coca-cola', names: ['coca cola', 'bibita gassata', 'coca'], caloriesPer100g: 42, proteinPer100g: 0, carbsPer100g: 10.6, fatPer100g: 0, defaultPortionGrams: 330 },
  { id: 'birra', names: ['birra'], caloriesPer100g: 43, proteinPer100g: 0.5, carbsPer100g: 3.6, fatPer100g: 0, defaultPortionGrams: 330 },
  { id: 'vino', names: ['vino'], caloriesPer100g: 83, proteinPer100g: 0.1, carbsPer100g: 2.6, fatPer100g: 0, defaultPortionGrams: 125 },

  // --- Piatti e preparazioni comuni ---
  { id: 'lasagna', names: ['lasagne al forno', 'lasagne', 'lasagna'], caloriesPer100g: 132, proteinPer100g: 8, carbsPer100g: 12, fatPer100g: 6, defaultPortionGrams: 300 },
  { id: 'risotto', names: ['risotto'], caloriesPer100g: 166, proteinPer100g: 3.5, carbsPer100g: 26, fatPer100g: 5, defaultPortionGrams: 250 },
  { id: 'minestrone', names: ['minestrone', 'zuppa di verdure'], caloriesPer100g: 44, proteinPer100g: 2, carbsPer100g: 7, fatPer100g: 1, defaultPortionGrams: 300 },
  { id: 'focaccia', names: ['focaccia'], caloriesPer100g: 264, proteinPer100g: 7, carbsPer100g: 42, fatPer100g: 8, defaultPortionGrams: 80 },
  { id: 'tiramisu', names: ['tiramisù', 'tiramisu'], caloriesPer100g: 283, proteinPer100g: 5, carbsPer100g: 26, fatPer100g: 18, defaultPortionGrams: 120 },
  { id: 'cornetto', names: ['brioche', 'cornetto'], caloriesPer100g: 350, proteinPer100g: 7, carbsPer100g: 45, fatPer100g: 16, unitWeightGrams: 60 },
  { id: 'panino', names: ['panino'], caloriesPer100g: 280, proteinPer100g: 9, carbsPer100g: 52, fatPer100g: 4, defaultPortionGrams: 80 },
  { id: 'hamburger', names: ['hamburger'], caloriesPer100g: 254, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 17, defaultPortionGrams: 120 },
];
