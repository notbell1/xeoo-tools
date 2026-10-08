export type HrFormula = "tanaka" | "gellish" | "standard_fox";

export interface HrFormulaInfo {
  key: HrFormula;
  name: string;
  formulaText: string;
  description: string;
}

export const HR_FORMULAS: HrFormulaInfo[] = [
  {
    key: "tanaka",
    name: "Tanaka Equation (Recommended)",
    formulaText: "208 - (0.7 × Age)",
    description: "Extensively validated across diverse adult populations.",
  },
  {
    key: "gellish",
    name: "Gellish Equation",
    formulaText: "207 - (0.7 × Age)",
    description: "Accurate linear regression model for active adults.",
  },
  {
    key: "standard_fox",
    name: "Standard Fox Equation",
    formulaText: "220 - Age",
    description: "Traditional baseline formula used in early exercise physiology.",
  },
];

export interface HeartRateZone {
  zoneNumber: number;
  name: string;
  intensityPercentRange: string;
  minPct: number;
  maxPct: number;
  minBpm: number;
  maxBpm: number;
  colorHex: string;
  badgeClass: string;
  description: string;
  benefits: string;
  perceivedExertion: string; // RPE 1-10 scale description
}

export interface HeartRateCalculationResult {
  age: number;
  restingHr?: number;
  maxHr: number;
  hrReserve?: number;
  methodUsed: "hr_reserve" | "max_hr";
  formulaUsed: HrFormulaInfo;
  zones: HeartRateZone[];
}

export function calculateMaxHeartRate(age: number, formula: HrFormula): number {
  if (formula === "tanaka") {
    return Math.round(208 - 0.7 * age);
  }
  if (formula === "gellish") {
    return Math.round(207 - 0.7 * age);
  }
  return Math.round(220 - age);
}

const ZONE_DEFINITIONS = [
  {
    zoneNumber: 1,
    name: "Zone 1 — Active Recovery / Very Light",
    intensityPercentRange: "50% – 60%",
    minPct: 0.5,
    maxPct: 0.6,
    colorHex: "#38bdf8",
    badgeClass: "bg-sky-500/15 text-sky-500 border-sky-500/30",
    description: "Very easy pace. Stimulates blood flow and active recovery.",
    benefits: "Promotes cardiovascular foundation and muscle recovery without stress.",
    perceivedExertion: "RPE 1–2 / 10 (Effortless, continuous easy conversation)",
  },
  {
    zoneNumber: 2,
    name: "Zone 2 — Aerobic Endurance / Base",
    intensityPercentRange: "60% – 70%",
    minPct: 0.6,
    maxPct: 0.7,
    colorHex: "#22c55e",
    badgeClass: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    description: "Conversational aerobic pace. Maximizes fat oxidation.",
    benefits: "Builds mitochondrial density, capillary network, and metabolic efficiency.",
    perceivedExertion: "RPE 3–4 / 10 (Comfortable, able to speak full sentences)",
  },
  {
    zoneNumber: 3,
    name: "Zone 3 — Aerobic Tempo / Moderate",
    intensityPercentRange: "70% – 80%",
    minPct: 0.7,
    maxPct: 0.8,
    colorHex: "#f59e0b",
    badgeClass: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    description: "Moderate sustained tempo. Improves cardiovascular efficiency.",
    benefits: "Enhances aerobic capacity and muscular stamina for distance events.",
    perceivedExertion: "RPE 5–6 / 10 (Controlled breathing, short sentences only)",
  },
  {
    zoneNumber: 4,
    name: "Zone 4 — Anaerobic Threshold / Hard",
    intensityPercentRange: "80% – 90%",
    minPct: 0.8,
    maxPct: 0.9,
    colorHex: "#f97316",
    badgeClass: "bg-orange-500/15 text-orange-500 border-orange-500/30",
    description: "Challenging sustainable pace. Trains lactate clearance.",
    benefits: "Increases lactate threshold (LT) and maximum oxygen uptake (VO2 max).",
    perceivedExertion: "RPE 7–8 / 10 (Heavy breathing, speaking 1-2 words only)",
  },
  {
    zoneNumber: 5,
    name: "Zone 5 — Maximum Effort / Peak",
    intensityPercentRange: "90% – 100%",
    minPct: 0.9,
    maxPct: 1.0,
    colorHex: "#ef4444",
    badgeClass: "bg-rose-500/15 text-rose-500 border-rose-500/30",
    description: "All-out sprint intervals. Peak neuromuscular velocity.",
    benefits: "Boosts top-end sprint speed and anaerobic power.",
    perceivedExertion: "RPE 9–10 / 10 (Maximal effort, cannot speak, short bursts)",
  },
];

export function calculateHeartRateZones(
  age: number,
  restingHr?: number,
  formula: HrFormula = "tanaka",
  preferReserve = true
): HeartRateCalculationResult | null {
  if (age < 10 || age > 115 || isNaN(age)) {
    return null;
  }

  const formulaInfo =
    HR_FORMULAS.find((f) => f.key === formula) || HR_FORMULAS[0];
  const maxHr = calculateMaxHeartRate(age, formula);

  const hasValidRestingHr =
    restingHr !== undefined &&
    !isNaN(restingHr) &&
    restingHr >= 35 &&
    restingHr <= 120 &&
    restingHr < maxHr;

  const methodUsed =
    hasValidRestingHr && preferReserve ? "hr_reserve" : "max_hr";
  const hrReserve = hasValidRestingHr ? maxHr - restingHr : undefined;

  const zones: HeartRateZone[] = ZONE_DEFINITIONS.map((def) => {
    let minBpm = 0;
    let maxBpm = 0;

    if (methodUsed === "hr_reserve" && restingHr !== undefined && hrReserve !== undefined) {
      // Karvonen Formula: Target = (HRR * %Intensity) + RestingHR
      minBpm = Math.round(hrReserve * def.minPct + restingHr);
      maxBpm = Math.round(hrReserve * def.maxPct + restingHr);
    } else {
      // Simple % of Max HR
      minBpm = Math.round(maxHr * def.minPct);
      maxBpm = Math.round(maxHr * def.maxPct);
    }

    return {
      ...def,
      minBpm,
      maxBpm,
    };
  });

  return {
    age,
    restingHr: hasValidRestingHr ? restingHr : undefined,
    maxHr,
    hrReserve,
    methodUsed,
    formulaUsed: formulaInfo,
    zones,
  };
}

