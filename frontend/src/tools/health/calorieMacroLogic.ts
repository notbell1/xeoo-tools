export type BiologicalSex = "male" | "female";
export type UnitSystem = "metric" | "us";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "very_active"
  | "extra_active";

export interface ActivityOption {
  key: ActivityLevel;
  label: string;
  multiplier: number;
  description: string;
}

export const ACTIVITY_OPTIONS: ActivityOption[] = [
  {
    key: "sedentary",
    label: "Sedentary",
    multiplier: 1.2,
    description: "Little to no formal exercise, desk job",
  },
  {
    key: "light",
    label: "Lightly Active",
    multiplier: 1.375,
    description: "Light exercise or sports 1–3 days/week",
  },
  {
    key: "moderate",
    label: "Moderately Active",
    multiplier: 1.55,
    description: "Moderate exercise or sports 3–5 days/week",
  },
  {
    key: "very_active",
    label: "Very Active",
    multiplier: 1.725,
    description: "Hard exercise or physical sports 6–7 days/week",
  },
  {
    key: "extra_active",
    label: "Extra Active",
    multiplier: 1.9,
    description: "Very intense daily training or strenuous physical occupation",
  },
];

export type CalorieGoal =
  | "maintain"
  | "mild_loss"
  | "moderate_loss"
  | "mild_gain"
  | "moderate_gain";

export interface GoalOption {
  key: CalorieGoal;
  label: string;
  calorieOffset: number;
  description: string;
}

export const GOAL_OPTIONS: GoalOption[] = [
  {
    key: "mild_loss",
    label: "Mild Weight Loss (-0.25 kg/wk)",
    calorieOffset: -250,
    description: "Gradual, sustainable calorie deficit of ~250 kcal/day",
  },
  {
    key: "moderate_loss",
    label: "Weight Loss (-0.5 kg/wk)",
    calorieOffset: -500,
    description: "Standard healthy deficit of ~500 kcal/day",
  },
  {
    key: "maintain",
    label: "Maintain Weight",
    calorieOffset: 0,
    description: "Match energy expenditure to stabilize current weight",
  },
  {
    key: "mild_gain",
    label: "Mild Weight Gain (+0.25 kg/wk)",
    calorieOffset: 250,
    description: "Lean surplus of ~250 kcal/day for progressive muscle building",
  },
  {
    key: "moderate_gain",
    label: "Weight Gain (+0.5 kg/wk)",
    calorieOffset: 500,
    description: "Substantial surplus of ~500 kcal/day for active mass gain",
  },
];

export type MacroPreset =
  | "balanced"
  | "high_protein"
  | "low_carb"
  | "high_carb"
  | "custom";

export interface MacroSplit {
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
}

export const MACRO_PRESETS: Record<
  Exclude<MacroPreset, "custom">,
  { label: string; split: MacroSplit }
> = {
  balanced: {
    label: "Balanced (30P / 40C / 30F)",
    split: { proteinPct: 30, carbsPct: 40, fatPct: 30 },
  },
  high_protein: {
    label: "High Protein / Fitness (35P / 35C / 30F)",
    split: { proteinPct: 35, carbsPct: 35, fatPct: 30 },
  },
  low_carb: {
    label: "Low Carb (35P / 20C / 45F)",
    split: { proteinPct: 35, carbsPct: 20, fatPct: 45 },
  },
  high_carb: {
    label: "High Carb / Endurance (25P / 55C / 20F)",
    split: { proteinPct: 25, carbsPct: 55, fatPct: 20 },
  },
};

export interface CalorieMacroResult {
  bmr: number; // Basal Metabolic Rate (kcal/day)
  tdee: number; // Maintenance Calories (kcal/day)
  targetCalories: number; // Goal Calories (kcal/day)
  goalOffset: number;
  isFloorAdjusted: boolean;
  macros: {
    protein: {
      percentage: number;
      grams: number;
      calories: number;
    };
    carbs: {
      percentage: number;
      grams: number;
      calories: number;
    };
    fat: {
      percentage: number;
      grams: number;
      calories: number;
    };
  };
  estimatedWaterMl: number;
  estimatedWaterLiters: number;
  proteinPerKg: number;
}

export function calculateCalorieAndMacros(
  age: number,
  sex: BiologicalSex,
  heightCm: number,
  weightKg: number,
  activityKey: ActivityLevel,
  goalKey: CalorieGoal,
  macroSplit: MacroSplit
): CalorieMacroResult | null {
  if (
    age <= 0 ||
    heightCm <= 0 ||
    weightKg <= 0 ||
    isNaN(age) ||
    isNaN(heightCm) ||
    isNaN(weightKg)
  ) {
    return null;
  }

  // Mifflin-St Jeor Equation
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === "male") {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  bmr = Math.round(bmr);

  // Activity multiplier
  const activity =
    ACTIVITY_OPTIONS.find((a) => a.key === activityKey) || ACTIVITY_OPTIONS[0];
  const tdee = Math.round(bmr * activity.multiplier);

  // Goal adjustment
  const goal = GOAL_OPTIONS.find((g) => g.key === goalKey) || GOAL_OPTIONS[0];
  let targetCalories = tdee + goal.calorieOffset;

  // Safe minimum floor (1200 kcal for females, 1400 kcal for males)
  const floorThreshold = sex === "female" ? 1200 : 1400;
  let isFloorAdjusted = false;
  if (targetCalories < floorThreshold) {
    targetCalories = floorThreshold;
    isFloorAdjusted = true;
  }

  // Macro calculations
  // Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
  const pCal = (targetCalories * macroSplit.proteinPct) / 100;
  const cCal = (targetCalories * macroSplit.carbsPct) / 100;
  const fCal = (targetCalories * macroSplit.fatPct) / 100;

  const pGrams = Math.round(pCal / 4);
  const cGrams = Math.round(cCal / 4);
  const fGrams = Math.round(fCal / 9);

  const proteinPerKg = Number((pGrams / weightKg).toFixed(2));
  const estimatedWaterMl = Math.round(weightKg * 35);
  const estimatedWaterLiters = Number((estimatedWaterMl / 1000).toFixed(1));

  return {
    bmr,
    tdee,
    targetCalories,
    goalOffset: goal.calorieOffset,
    isFloorAdjusted,
    macros: {
      protein: {
        percentage: macroSplit.proteinPct,
        grams: pGrams,
        calories: Math.round(pCal),
      },
      carbs: {
        percentage: macroSplit.carbsPct,
        grams: cGrams,
        calories: Math.round(cCal),
      },
      fat: {
        percentage: macroSplit.fatPct,
        grams: fGrams,
        calories: Math.round(fCal),
      },
    },
    estimatedWaterMl,
    estimatedWaterLiters,
    proteinPerKg,
  };
}

