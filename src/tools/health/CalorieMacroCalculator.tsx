import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Flame,
  Info,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";

import Footer from "../../components/Footer";
import { showSuccess } from "../../alert";
import HealthSelect, { type HealthSelectOption } from "./HealthSelect";
import { convertMetricToUs, convertUsToMetric } from "./bmiCalculatorLogic";
import {
  ACTIVITY_OPTIONS,
  calculateCalorieAndMacros,
  GOAL_OPTIONS,
  MACRO_PRESETS,
  type ActivityLevel,
  type BiologicalSex,
  type CalorieGoal,
  type MacroPreset,
  type UnitSystem,
} from "./calorieMacroLogic";

export default function CalorieMacroCalculator() {
  const [unit, setUnit] = useState<UnitSystem>("metric");
  const [sex, setSex] = useState<BiologicalSex>("male");
  const [age, setAge] = useState<string>("28");

  // Metric values
  const [heightCm, setHeightCm] = useState<string>("175");
  const [weightKg, setWeightKg] = useState<string>("70");

  // US values
  const [heightFt, setHeightFt] = useState<string>("5");
  const [heightIn, setHeightIn] = useState<string>("9");
  const [weightLb, setWeightLb] = useState<string>("154");

  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<CalorieGoal>("maintain");
  const [macroPreset, setMacroPreset] = useState<MacroPreset>("balanced");

  // Custom macro percentages
  const [customProtein, setCustomProtein] = useState<number>(30);
  const [customCarbs, setCustomCarbs] = useState<number>(40);
  const [customFat, setCustomFat] = useState<number>(30);

  const [copied, setCopied] = useState(false);

  // Unit conversion on switch
  const handleUnitChange = (newUnit: UnitSystem) => {
    if (newUnit === unit) return;
    if (newUnit === "us") {
      const hCm = parseFloat(heightCm) || 170;
      const wKg = parseFloat(weightKg) || 68;
      const usVal = convertMetricToUs(hCm, wKg);
      setHeightFt(usVal.feet.toString());
      setHeightIn(usVal.inches.toString());
      setWeightLb(usVal.weightLb.toString());
    } else {
      const ft = parseFloat(heightFt) || 5;
      const inch = parseFloat(heightIn) || 7;
      const lb = parseFloat(weightLb) || 150;
      const metricVal = convertUsToMetric(ft, inch, lb);
      setHeightCm(metricVal.heightCm.toString());
      setWeightKg(metricVal.weightKg.toString());
    }
    setUnit(newUnit);
  };

  const handleReset = () => {
    setSex("male");
    setAge("28");
    if (unit === "metric") {
      setHeightCm("175");
      setWeightKg("70");
    } else {
      setHeightFt("5");
      setHeightIn("9");
      setWeightLb("154");
    }
    setActivity("moderate");
    setGoal("maintain");
    setMacroPreset("balanced");
  };

  // Determine current active macro split
  const activeMacroSplit = useMemo(() => {
    if (macroPreset === "custom") {
      return {
        proteinPct: customProtein,
        carbsPct: customCarbs,
        fatPct: customFat,
      };
    }
    return MACRO_PRESETS[macroPreset].split;
  }, [macroPreset, customProtein, customCarbs, customFat]);

  const customTotal = customProtein + customCarbs + customFat;

  // Calculation output
  const calculationResult = useMemo(() => {
    const ageNum = parseInt(age, 10);
    let effectiveHeightCm = 0;
    let effectiveWeightKg = 0;

    if (unit === "metric") {
      effectiveHeightCm = parseFloat(heightCm) || 0;
      effectiveWeightKg = parseFloat(weightKg) || 0;
    } else {
      const ft = parseFloat(heightFt) || 0;
      const inch = parseFloat(heightIn) || 0;
      const lb = parseFloat(weightLb) || 0;
      const conv = convertUsToMetric(ft, inch, lb);
      effectiveHeightCm = conv.heightCm;
      effectiveWeightKg = conv.weightKg;
    }

    if (
      isNaN(ageNum) ||
      ageNum <= 0 ||
      effectiveHeightCm <= 0 ||
      effectiveWeightKg <= 0
    ) {
      return null;
    }

    return calculateCalorieAndMacros(
      ageNum,
      sex,
      effectiveHeightCm,
      effectiveWeightKg,
      activity,
      goal,
      activeMacroSplit
    );
  }, [
    age,
    sex,
    unit,
    heightCm,
    weightKg,
    heightFt,
    heightIn,
    weightLb,
    activity,
    goal,
    activeMacroSplit,
  ]);

  const handleCopyResult = async () => {
    if (!calculationResult) return;
    const text = [
      "=== XeooTools Calorie & Macro Calculator Result ===",
      `Target Calories: ${calculationResult.targetCalories.toLocaleString()} kcal/day`,
      `Maintenance (TDEE): ${calculationResult.tdee.toLocaleString()} kcal/day`,
      `BMR: ${calculationResult.bmr.toLocaleString()} kcal/day`,
      "--- Daily Macro Targets ---",
      `Protein: ${calculationResult.macros.protein.grams}g (${calculationResult.macros.protein.percentage}%) - ${calculationResult.macros.protein.calories} kcal`,
      `Carbohydrates: ${calculationResult.macros.carbs.grams}g (${calculationResult.macros.carbs.percentage}%) - ${calculationResult.macros.carbs.calories} kcal`,
      `Fat: ${calculationResult.macros.fat.grams}g (${calculationResult.macros.fat.percentage}%) - ${calculationResult.macros.fat.calories} kcal`,
      `Estimated Daily Water: ${calculationResult.estimatedWaterLiters} Liters`,
      "Note: Estimates are for general educational guidance and not a medical prescription.",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showSuccess("Copied", "Calorie & macro summary copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Select Options Data
  const activitySelectOptions: HealthSelectOption<ActivityLevel>[] = useMemo(
    () =>
      ACTIVITY_OPTIONS.map((a) => ({
        value: a.key,
        label: a.label,
        description: a.description,
        badge: `${a.multiplier}x`,
      })),
    []
  );

  const goalSelectOptions: HealthSelectOption<CalorieGoal>[] = useMemo(
    () =>
      GOAL_OPTIONS.map((g) => ({
        value: g.key,
        label: g.label,
        description: g.description,
        badge:
          g.calorieOffset > 0
            ? `+${g.calorieOffset} kcal`
            : `${g.calorieOffset} kcal`,
      })),
    []
  );

  const macroPresetOptions: HealthSelectOption<MacroPreset>[] = useMemo(
    () => [
      {
        value: "balanced",
        label: "Balanced",
        description: "30% Protein / 40% Carbs / 30% Fat",
      },
      {
        value: "high_protein",
        label: "High Protein / Fitness",
        description: "35% Protein / 35% Carbs / 30% Fat",
      },
      {
        value: "low_carb",
        label: "Low Carb",
        description: "35% Protein / 20% Carbs / 45% Fat",
      },
      {
        value: "high_carb",
        label: "High Carb / Endurance",
        description: "25% Protein / 55% Carbs / 20% Fat",
      },
      {
        value: "custom",
        label: "Custom Macro Split",
        description: "Set your own percentage distribution",
      },
    ],
    []
  );

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      {/* MAIN WORKSPACE */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-3 sm:px-4 sm:py-4">
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
          {/* LEFT COLUMN: PARAMETERS FORM */}
          <div className="space-y-3 lg:col-span-5">
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 sm:p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-xeoo-border pb-2.5">
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-xeoo-primary shrink-0" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                    Profile & Goals
                  </h2>
                </div>

                {/* Unit Selector */}
                <div className="inline-flex rounded-md border border-xeoo-border bg-xeoo-bg p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleUnitChange("metric")}
                    className={`rounded px-2 py-0.5 font-medium transition-all ${
                      unit === "metric"
                        ? "bg-xeoo-surface text-xeoo-text shadow-xs font-semibold"
                        : "text-xeoo-muted hover:text-xeoo-text"
                    }`}
                  >
                    Metric
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnitChange("us")}
                    className={`rounded px-2 py-0.5 font-medium transition-all ${
                      unit === "us"
                        ? "bg-xeoo-surface text-xeoo-text shadow-xs font-semibold"
                        : "text-xeoo-muted hover:text-xeoo-text"
                    }`}
                  >
                    US Units
                  </button>
                </div>
              </div>

              {/* Sex & Age Row */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-1 block text-xs font-medium text-xeoo-text">
                    Biological Sex
                  </label>
                  <div className="grid grid-cols-2 gap-1 rounded-lg border border-xeoo-border bg-xeoo-bg p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setSex("male")}
                      className={`rounded py-1 text-center font-medium transition-all ${
                        sex === "male"
                          ? "bg-xeoo-surface text-xeoo-text shadow-xs font-semibold"
                          : "text-xeoo-muted hover:text-xeoo-text"
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setSex("female")}
                      className={`rounded py-1 text-center font-medium transition-all ${
                        sex === "female"
                          ? "bg-xeoo-surface text-xeoo-text shadow-xs font-semibold"
                          : "text-xeoo-muted hover:text-xeoo-text"
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="macro-age"
                    className="mb-1 block text-xs font-medium text-xeoo-text"
                  >
                    Age (Years)
                  </label>
                  <input
                    id="macro-age"
                    type="number"
                    min="14"
                    max="110"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary transition-colors"
                    placeholder="28"
                  />
                </div>
              </div>

              {/* Height & Weight Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {unit === "metric" ? (
                  <div>
                    <label
                      htmlFor="macro-height-cm"
                      className="mb-1 block text-xs font-medium text-xeoo-text"
                    >
                      Height (cm)
                    </label>
                    <div className="relative">
                      <input
                        id="macro-height-cm"
                        type="number"
                        min="80"
                        max="250"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 pr-8 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary"
                        placeholder="175"
                      />
                      <span className="pointer-events-none absolute right-2.5 top-1.5 text-xs text-xeoo-muted">
                        cm
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="mb-1 block text-xs font-medium text-xeoo-text">
                      Height (ft & in)
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="relative">
                        <input
                          type="number"
                          min="2"
                          max="8"
                          value={heightFt}
                          onChange={(e) => setHeightFt(e.target.value)}
                          className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2 py-1.5 pr-6 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary"
                          placeholder="5"
                          aria-label="Feet"
                        />
                        <span className="pointer-events-none absolute right-2 top-1.5 text-xs text-xeoo-muted">
                          ft
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="11"
                          value={heightIn}
                          onChange={(e) => setHeightIn(e.target.value)}
                          className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2 py-1.5 pr-6 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary"
                          placeholder="9"
                          aria-label="Inches"
                        />
                        <span className="pointer-events-none absolute right-2 top-1.5 text-xs text-xeoo-muted">
                          in
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {unit === "metric" ? (
                  <div>
                    <label
                      htmlFor="macro-weight-kg"
                      className="mb-1 block text-xs font-medium text-xeoo-text"
                    >
                      Weight (kg)
                    </label>
                    <div className="relative">
                      <input
                        id="macro-weight-kg"
                        type="number"
                        min="25"
                        max="350"
                        step="0.5"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 pr-8 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary"
                        placeholder="70"
                      />
                      <span className="pointer-events-none absolute right-2.5 top-1.5 text-xs text-xeoo-muted">
                        kg
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="macro-weight-lb"
                      className="mb-1 block text-xs font-medium text-xeoo-text"
                    >
                      Weight (lb)
                    </label>
                    <div className="relative">
                      <input
                        id="macro-weight-lb"
                        type="number"
                        min="50"
                        max="700"
                        step="0.5"
                        value={weightLb}
                        onChange={(e) => setWeightLb(e.target.value)}
                        className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 pr-8 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary"
                        placeholder="154"
                      />
                      <span className="pointer-events-none absolute right-2.5 top-1.5 text-xs text-xeoo-muted">
                        lb
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Activity Level Selector using Custom HealthSelect */}
              <HealthSelect<ActivityLevel>
                id="macro-activity-select"
                label="Activity Level"
                value={activity}
                onChange={setActivity}
                options={activitySelectOptions}
              />

              {/* Goal Selector using Custom HealthSelect */}
              <HealthSelect<CalorieGoal>
                id="macro-goal-select"
                label="Primary Goal"
                value={goal}
                onChange={setGoal}
                options={goalSelectOptions}
              />

              {/* Macro Distribution Selector using Custom HealthSelect */}
              <HealthSelect<MacroPreset>
                id="macro-preset-select"
                label="Macro Ratio Preference"
                value={macroPreset}
                onChange={setMacroPreset}
                options={macroPresetOptions}
              />

              {/* Custom Macro Sliders (if custom chosen) */}
              {macroPreset === "custom" && (
                <div className="space-y-2 rounded-lg border border-xeoo-border bg-xeoo-bg p-2.5 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-xeoo-text">
                      Custom Distribution (Must = 100%)
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        customTotal === 100
                          ? "text-xeoo-success"
                          : "text-xeoo-danger"
                      }`}
                    >
                      {customTotal}%
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sky-400 font-medium text-[11px]">
                      <span>Protein ({customProtein}%)</span>
                      <span className="font-mono">
                        {Math.round((customProtein * (calculationResult?.targetCalories || 2000)) / 400)}g
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={customProtein}
                      onChange={(e) =>
                        setCustomProtein(parseInt(e.target.value, 10))
                      }
                      className="w-full accent-sky-400 h-1.5"
                    />

                    <div className="flex items-center justify-between text-amber-400 font-medium text-[11px]">
                      <span>Carbs ({customCarbs}%)</span>
                      <span className="font-mono">
                        {Math.round((customCarbs * (calculationResult?.targetCalories || 2000)) / 400)}g
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="75"
                      value={customCarbs}
                      onChange={(e) =>
                        setCustomCarbs(parseInt(e.target.value, 10))
                      }
                      className="w-full accent-amber-400 h-1.5"
                    />

                    <div className="flex items-center justify-between text-rose-400 font-medium text-[11px]">
                      <span>Fat ({customFat}%)</span>
                      <span className="font-mono">
                        {Math.round((customFat * (calculationResult?.targetCalories || 2000)) / 900)}g
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="65"
                      value={customFat}
                      onChange={(e) =>
                        setCustomFat(parseInt(e.target.value, 10))
                      }
                      className="w-full accent-rose-400 h-1.5"
                    />
                  </div>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="pt-1.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 py-1.5 text-xs font-medium text-xeoo-muted hover:bg-xeoo-surface-soft hover:text-xeoo-text transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyResult}
                  disabled={!calculationResult}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 py-1.5 text-xs font-medium text-xeoo-text hover:bg-xeoo-surface-soft disabled:opacity-40 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-xeoo-success" />
                      <span className="text-xeoo-success">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* EDUCATIONAL DISCLAIMER */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-[11px] text-xeoo-muted leading-relaxed space-y-1">
              <div className="flex items-center gap-1 font-semibold text-xeoo-text">
                <Info className="h-3 w-3 text-xeoo-primary shrink-0" />
                <span>Nutritional Guidance Disclaimer</span>
              </div>
              <p>
                Calculations use the Mifflin-St Jeor equation. These are
                population-average estimates for educational guidance and do not
                constitute individualized medical or dietetic prescriptions.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: CALORIE & MACRO RESULTS */}
          <div className="space-y-3 lg:col-span-7">
            {calculationResult ? (
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 sm:p-4 shadow-xs space-y-3.5">
                {/* Daily Calorie Header */}
                <div className="flex items-center justify-between border-b border-xeoo-border pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Estimated Daily Target
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-xeoo-primary font-mono">
                        {calculationResult.targetCalories.toLocaleString()}
                      </span>
                      <span className="text-xs text-xeoo-muted font-mono">
                        kcal/day
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 text-xs font-mono">
                    <div className="rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1">
                      <span className="block text-[9px] text-xeoo-muted font-sans uppercase">
                        TDEE Maintenance
                      </span>
                      <span className="font-bold text-xeoo-text">
                        {calculationResult.tdee.toLocaleString()} kcal
                      </span>
                    </div>

                    <div className="rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1">
                      <span className="block text-[9px] text-xeoo-muted font-sans uppercase">
                        BMR Basal
                      </span>
                      <span className="font-bold text-xeoo-text">
                        {calculationResult.bmr.toLocaleString()} kcal
                      </span>
                    </div>
                  </div>
                </div>

                {calculationResult.isFloorAdjusted && (
                  <div className="rounded-lg border border-xeoo-warning/30 bg-xeoo-warning-soft px-2.5 py-1.5 text-xs text-xeoo-warning flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Target adjusted to safe floor (1,200/1,400 kcal) to
                      prevent severe under-nutrition.
                    </span>
                  </div>
                )}

                {/* Macro Ratio Visual Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium text-xeoo-muted">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-sky-400" />
                      Protein ({calculationResult.macros.protein.percentage}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      Carbs ({calculationResult.macros.carbs.percentage}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-rose-400" />
                      Fat ({calculationResult.macros.fat.percentage}%)
                    </span>
                  </div>

                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-xeoo-surface-soft flex">
                    <div
                      className="h-full bg-sky-400 transition-all duration-300"
                      style={{
                        width: `${calculationResult.macros.protein.percentage}%`,
                      }}
                    />
                    <div
                      className="h-full bg-amber-400 transition-all duration-300"
                      style={{
                        width: `${calculationResult.macros.carbs.percentage}%`,
                      }}
                    />
                    <div
                      className="h-full bg-rose-400 transition-all duration-300"
                      style={{
                        width: `${calculationResult.macros.fat.percentage}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 3 Macro Target Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Protein Card */}
                  <div className="rounded-xl border border-sky-400/20 bg-sky-400/5 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-sky-400 uppercase">
                        Protein
                      </span>
                      <span className="rounded bg-sky-400/10 px-1 py-0.2 font-mono text-[10px] font-semibold text-sky-400">
                        4 kcal/g
                      </span>
                    </div>

                    <div className="space-y-0.2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-extrabold text-xeoo-text font-mono">
                          {calculationResult.macros.protein.grams}
                        </span>
                        <span className="text-xs text-xeoo-muted font-mono">
                          g/day
                        </span>
                      </div>
                      <div className="text-[10px] text-xeoo-muted">
                        {calculationResult.macros.protein.calories} kcal (
                        {calculationResult.macros.protein.percentage}%)
                      </div>
                    </div>

                    <div className="border-t border-sky-400/10 pt-1 text-[10px] text-xeoo-muted">
                      ~{calculationResult.proteinPerKg} g/kg bodyweight
                    </div>
                  </div>

                  {/* Carbohydrates Card */}
                  <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-400 uppercase">
                        Carbohydrates
                      </span>
                      <span className="rounded bg-amber-400/10 px-1 py-0.2 font-mono text-[10px] font-semibold text-amber-400">
                        4 kcal/g
                      </span>
                    </div>

                    <div className="space-y-0.2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-extrabold text-xeoo-text font-mono">
                          {calculationResult.macros.carbs.grams}
                        </span>
                        <span className="text-xs text-xeoo-muted font-mono">
                          g/day
                        </span>
                      </div>
                      <div className="text-[10px] text-xeoo-muted">
                        {calculationResult.macros.carbs.calories} kcal (
                        {calculationResult.macros.carbs.percentage}%)
                      </div>
                    </div>

                    <div className="border-t border-amber-400/10 pt-1 text-[10px] text-xeoo-muted">
                      Primary energy substrate
                    </div>
                  </div>

                  {/* Dietary Fat Card */}
                  <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-rose-400 uppercase">
                        Dietary Fat
                      </span>
                      <span className="rounded bg-rose-400/10 px-1 py-0.2 font-mono text-[10px] font-semibold text-rose-400">
                        9 kcal/g
                      </span>
                    </div>

                    <div className="space-y-0.2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-extrabold text-xeoo-text font-mono">
                          {calculationResult.macros.fat.grams}
                        </span>
                        <span className="text-xs text-xeoo-muted font-mono">
                          g/day
                        </span>
                      </div>
                      <div className="text-[10px] text-xeoo-muted">
                        {calculationResult.macros.fat.calories} kcal (
                        {calculationResult.macros.fat.percentage}%)
                      </div>
                    </div>

                    <div className="border-t border-rose-400/10 pt-1 text-[10px] text-xeoo-muted">
                      Hormonal & cellular health
                    </div>
                  </div>
                </div>

                {/* Hydration & Guidelines Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="rounded-lg border border-xeoo-border bg-xeoo-bg p-2.5 space-y-0.5">
                    <span className="text-[11px] font-semibold text-xeoo-text flex items-center gap-1">
                      <Zap className="h-3 w-3 text-xeoo-info" />
                      Hydration Target
                    </span>
                    <p className="text-[10px] text-xeoo-muted">
                      ~{calculationResult.estimatedWaterLiters} L (
                      {calculationResult.estimatedWaterMl.toLocaleString()} ml)
                      per day baseline.
                    </p>
                  </div>

                  <div className="rounded-lg border border-xeoo-border bg-xeoo-bg p-2.5 space-y-0.5">
                    <span className="text-[11px] font-semibold text-xeoo-text flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-xeoo-success" />
                      Adherence Variance
                    </span>
                    <p className="text-[10px] text-xeoo-muted">
                      Daily variance of ±100 kcal is standard and sustainable.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-xeoo-border bg-xeoo-surface p-4 text-center text-xs text-xeoo-muted">
                <Flame className="h-6 w-6 opacity-40 mb-1" />
                <p>Complete your parameters to view calorie & macro recommendations.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
