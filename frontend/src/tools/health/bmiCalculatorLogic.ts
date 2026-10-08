export type UnitSystem = "metric" | "us";

export type BmiCategory =
  | "underweight"
  | "healthy"
  | "overweight"
  | "obesity_1"
  | "obesity_2"
  | "obesity_3";

export interface BmiCategoryInfo {
  key: BmiCategory;
  name: string;
  rangeText: string;
  minBmi: number;
  maxBmi: number;
  badgeClass: string;
  colorHex: string;
  description: string;
}

export interface BmiCalculationResult {
  bmi: number;
  category: BmiCategoryInfo;
  idealWeightRange: {
    minKg: number;
    maxKg: number;
    minLb: number;
    maxLb: number;
  };
  primeIndex: number;
  ponderalIndex: number;
  heightCm: number;
  weightKg: number;
  gaugePercentage: number; // 0 to 100 on standard 10-40 scale
}

export const BMI_CATEGORIES: BmiCategoryInfo[] = [
  {
    key: "underweight",
    name: "Underweight",
    rangeText: "< 18.5",
    minBmi: 0,
    maxBmi: 18.49,
    badgeClass: "bg-xeoo-info-soft text-xeoo-info border-xeoo-info/30",
    colorHex: "#38bdf8",
    description:
      "Below standard weight range. Consider consulting a healthcare professional for dietary advice.",
  },
  {
    key: "healthy",
    name: "Healthy Weight",
    rangeText: "18.5 – 24.9",
    minBmi: 18.5,
    maxBmi: 24.99,
    badgeClass: "bg-xeoo-success-soft text-xeoo-success border-xeoo-success/30",
    colorHex: "#22c55e",
    description:
      "Within standard healthy weight range associated with lower risk of chronic metabolic conditions.",
  },
  {
    key: "overweight",
    name: "Overweight",
    rangeText: "25.0 – 29.9",
    minBmi: 25.0,
    maxBmi: 29.99,
    badgeClass: "bg-xeoo-warning-soft text-xeoo-warning border-xeoo-warning/30",
    colorHex: "#f59e0b",
    description:
      "Above standard weight range. Regular physical activity and balanced nutrition can help maintain wellness.",
  },
  {
    key: "obesity_1",
    name: "Obesity (Class 1)",
    rangeText: "30.0 – 34.9",
    minBmi: 30.0,
    maxBmi: 34.99,
    badgeClass: "bg-xeoo-danger-soft text-xeoo-danger border-xeoo-danger/30",
    colorHex: "#ef4444",
    description:
      "Moderate obesity. Elevated cardiovascular and metabolic screening risk.",
  },
  {
    key: "obesity_2",
    name: "Obesity (Class 2)",
    rangeText: "35.0 – 39.9",
    minBmi: 35.0,
    maxBmi: 39.99,
    badgeClass: "bg-xeoo-danger-soft text-xeoo-danger border-xeoo-danger/30",
    colorHex: "#dc2626",
    description: "Severe obesity. Comprehensive lifestyle review is advised.",
  },
  {
    key: "obesity_3",
    name: "Obesity (Class 3)",
    rangeText: "≥ 40.0",
    minBmi: 40.0,
    maxBmi: 100,
    badgeClass: "bg-xeoo-danger-soft text-xeoo-danger border-xeoo-danger/30",
    colorHex: "#991b1b",
    description: "Very severe obesity. Medical guidance recommended.",
  },
];

export function getBmiCategory(bmi: number): BmiCategoryInfo {
  if (bmi < 18.5) return BMI_CATEGORIES[0];
  if (bmi < 25.0) return BMI_CATEGORIES[1];
  if (bmi < 30.0) return BMI_CATEGORIES[2];
  if (bmi < 35.0) return BMI_CATEGORIES[3];
  if (bmi < 40.0) return BMI_CATEGORIES[4];
  return BMI_CATEGORIES[5];
}

export function calculateBmi(
  heightCm: number,
  weightKg: number
): BmiCalculationResult | null {
  if (heightCm <= 0 || weightKg <= 0 || isNaN(heightCm) || isNaN(weightKg)) {
    return null;
  }

  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  const category = getBmiCategory(bmi);

  // Ideal weight range based on BMI 18.5 - 24.9
  const minKg = Number((18.5 * heightM * heightM).toFixed(1));
  const maxKg = Number((24.9 * heightM * heightM).toFixed(1));
  const minLb = Number((minKg * 2.20462).toFixed(1));
  const maxLb = Number((maxKg * 2.20462).toFixed(1));

  // BMI Prime = BMI / 25
  const primeIndex = Number((bmi / 25).toFixed(2));

  // Ponderal Index = weight (kg) / height (m)^3
  const ponderalIndex = Number((weightKg / Math.pow(heightM, 3)).toFixed(2));

  // Scale position percentage between BMI 14 (0%) and BMI 42 (100%)
  const gaugePercentage = Math.min(
    100,
    Math.max(0, ((bmi - 14) / (42 - 14)) * 100)
  );

  return {
    bmi,
    category,
    idealWeightRange: {
      minKg,
      maxKg,
      minLb,
      maxLb,
    },
    primeIndex,
    ponderalIndex,
    heightCm,
    weightKg,
    gaugePercentage,
  };
}

export function convertMetricToUs(heightCm: number, weightKg: number) {
  const totalInches = heightCm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  const weightLb = Number((weightKg * 2.20462).toFixed(1));

  return {
    feet,
    inches,
    weightLb,
  };
}

export function convertUsToMetric(
  feet: number,
  inches: number,
  weightLb: number
) {
  const totalInches = feet * 12 + inches;
  const heightCm = Number((totalInches * 2.54).toFixed(1));
  const weightKg = Number((weightLb / 2.20462).toFixed(1));

  return {
    heightCm,
    weightKg,
  };
}

