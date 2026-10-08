import { useMemo, useState } from "react";
import {
  Activity,
  Check,
  Copy,
  Info,
  RotateCcw,
  Scale,
} from "lucide-react";

import Footer from "../../components/Footer";
import { showSuccess } from "../../alert";
import {
  BMI_CATEGORIES,
  calculateBmi,
  convertMetricToUs,
  convertUsToMetric,
  type UnitSystem,
} from "./bmiCalculatorLogic";

export default function BmiCalculator() {
  const [unit, setUnit] = useState<UnitSystem>("metric");
  const [age, setAge] = useState<string>("28");

  // Metric states
  const [heightCm, setHeightCm] = useState<string>("175");
  const [weightKg, setWeightKg] = useState<string>("70");

  // US states
  const [heightFt, setHeightFt] = useState<string>("5");
  const [heightIn, setHeightIn] = useState<string>("9");
  const [weightLb, setWeightLb] = useState<string>("154");

  const [copied, setCopied] = useState(false);

  // Switch units with auto conversion of existing values
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
    setAge("28");
    if (unit === "metric") {
      setHeightCm("175");
      setWeightKg("70");
    } else {
      setHeightFt("5");
      setHeightIn("9");
      setWeightLb("154");
    }
  };

  // Compute BMI
  const calculationResult = useMemo(() => {
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

    if (effectiveHeightCm <= 0 || effectiveWeightKg <= 0) {
      return null;
    }

    return calculateBmi(effectiveHeightCm, effectiveWeightKg);
  }, [unit, heightCm, weightKg, heightFt, heightIn, weightLb]);

  const handleCopyResult = async () => {
    if (!calculationResult) return;
    const text = [
      "=== XeooTools BMI Calculator Result ===",
      `BMI: ${calculationResult.bmi}`,
      `Category: ${calculationResult.category.name}`,
      `Height: ${
        unit === "metric"
          ? `${heightCm} cm`
          : `${heightFt} ft ${heightIn} in (${calculationResult.heightCm} cm)`
      }`,
      `Weight: ${
        unit === "metric"
          ? `${weightKg} kg`
          : `${weightLb} lb (${calculationResult.weightKg} kg)`
      }`,
      `Healthy Weight Range: ${calculationResult.idealWeightRange.minKg} - ${calculationResult.idealWeightRange.maxKg} kg (${calculationResult.idealWeightRange.minLb} - ${calculationResult.idealWeightRange.maxLb} lb)`,
      `BMI Prime: ${calculationResult.primeIndex}`,
      "Note: BMI is a screening metric and not a medical diagnosis.",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showSuccess("Copied", "BMI result copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const ageNum = parseInt(age, 10);
  const isPediatric = !isNaN(ageNum) && ageNum < 18;

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      {/* MAIN COMPACT TOOL WORKSPACE */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-3 py-3 sm:px-4 sm:py-4">
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
          {/* LEFT: INPUTS FORM CARD */}
          <div className="space-y-3 lg:col-span-5">
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 sm:p-4 shadow-xs">
              <div className="mb-3 flex items-center justify-between border-b border-xeoo-border pb-2.5">
                <div className="flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-xeoo-primary shrink-0" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                    BMI Parameters
                  </h2>
                </div>

                {/* Unit Switcher */}
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

              <div className="space-y-2.5">
                {/* Age Input */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label
                      htmlFor="bmi-age"
                      className="text-xs font-medium text-xeoo-text"
                    >
                      Age (Years)
                    </label>
                    <span className="text-[10px] text-xeoo-muted">
                      Adult Standard (18+)
                    </span>
                  </div>
                  <input
                    id="bmi-age"
                    type="number"
                    min="2"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary transition-colors"
                    placeholder="e.g. 28"
                  />
                  {isPediatric && (
                    <p className="mt-1 text-[10px] text-xeoo-warning flex items-center gap-1">
                      <Info className="h-3 w-3 shrink-0" />
                      Adult BMI standard is for ages 18+. Pediatric BMI uses
                      percentile growth charts.
                    </p>
                  )}
                </div>

                {/* Height Input */}
                {unit === "metric" ? (
                  <div>
                    <label
                      htmlFor="bmi-height-cm"
                      className="mb-1 block text-xs font-medium text-xeoo-text"
                    >
                      Height (cm)
                    </label>
                    <div className="relative">
                      <input
                        id="bmi-height-cm"
                        type="number"
                        min="50"
                        max="260"
                        step="0.5"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 pr-8 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary transition-colors"
                        placeholder="e.g. 175"
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
                          id="bmi-height-ft"
                          type="number"
                          min="2"
                          max="8"
                          value={heightFt}
                          onChange={(e) => setHeightFt(e.target.value)}
                          className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 pr-7 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary transition-colors"
                          placeholder="5"
                          aria-label="Height feet"
                        />
                        <span className="pointer-events-none absolute right-2 top-1.5 text-xs text-xeoo-muted">
                          ft
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          id="bmi-height-in"
                          type="number"
                          min="0"
                          max="11"
                          value={heightIn}
                          onChange={(e) => setHeightIn(e.target.value)}
                          className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 pr-7 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary transition-colors"
                          placeholder="9"
                          aria-label="Height inches"
                        />
                        <span className="pointer-events-none absolute right-2 top-1.5 text-xs text-xeoo-muted">
                          in
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Weight Input */}
                {unit === "metric" ? (
                  <div>
                    <label
                      htmlFor="bmi-weight-kg"
                      className="mb-1 block text-xs font-medium text-xeoo-text"
                    >
                      Weight (kg)
                    </label>
                    <div className="relative">
                      <input
                        id="bmi-weight-kg"
                        type="number"
                        min="20"
                        max="400"
                        step="0.1"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 pr-8 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary transition-colors"
                        placeholder="e.g. 70"
                      />
                      <span className="pointer-events-none absolute right-2.5 top-1.5 text-xs text-xeoo-muted">
                        kg
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="bmi-weight-lb"
                      className="mb-1 block text-xs font-medium text-xeoo-text"
                    >
                      Weight (lb)
                    </label>
                    <div className="relative">
                      <input
                        id="bmi-weight-lb"
                        type="number"
                        min="40"
                        max="900"
                        step="0.5"
                        value={weightLb}
                        onChange={(e) => setWeightLb(e.target.value)}
                        className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 pr-8 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary transition-colors"
                        placeholder="e.g. 154"
                      />
                      <span className="pointer-events-none absolute right-2.5 top-1.5 text-xs text-xeoo-muted">
                        lb
                      </span>
                    </div>
                  </div>
                )}

                {/* Form Buttons */}
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
            </div>

            {/* INFORMATIONAL NOTE */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-[11px] text-xeoo-muted leading-relaxed space-y-1">
              <div className="flex items-center gap-1 font-semibold text-xeoo-text">
                <Info className="h-3 w-3 text-xeoo-primary shrink-0" />
                <span>Screening Limitation</span>
              </div>
              <p>
                BMI is a statistical screening measure based on height and
                weight. It does not directly quantify muscle, body fat %, or
                bone density.
              </p>
            </div>
          </div>

          {/* RIGHT: RESULTS DISPLAY CARD */}
          <div className="space-y-3 lg:col-span-7">
            {calculationResult ? (
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 sm:p-4 shadow-xs space-y-3.5">
                {/* Prominent Score Header */}
                <div className="flex items-center justify-between border-b border-xeoo-border pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Body Mass Index
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-xeoo-text font-mono">
                        {calculationResult.bmi}
                      </span>
                      <span className="text-xs text-xeoo-muted font-mono">
                        kg/m²
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-xeoo-muted uppercase font-semibold">
                      Classification
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${calculationResult.category.badgeClass}`}
                    >
                      {calculationResult.category.name}
                    </span>
                  </div>
                </div>

                {/* Visual BMI Gauge */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-xeoo-muted font-medium">
                    <span>&lt;18.5 (Under)</span>
                    <span>18.5–24.9 (Normal)</span>
                    <span>25–29.9 (Over)</span>
                    <span>≥30 (Obese)</span>
                  </div>

                  {/* Multi-segment Gauge */}
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-xeoo-surface-soft flex">
                    <div
                      className="h-full bg-sky-400"
                      style={{ width: "16%" }}
                      title="Underweight"
                    />
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: "23%" }}
                      title="Healthy"
                    />
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: "18%" }}
                      title="Overweight"
                    />
                    <div
                      className="h-full bg-rose-500"
                      style={{ width: "43%" }}
                      title="Obesity"
                    />
                  </div>

                  {/* Gauge Pointer Pin */}
                  <div className="relative h-3 w-full">
                    <div
                      className="absolute -top-1 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                      style={{ left: `${calculationResult.gaugePercentage}%` }}
                    >
                      <div className="h-0 w-0 border-x-3.5 border-x-transparent border-t-4 border-t-xeoo-text" />
                      <span className="font-mono text-[9px] font-bold text-xeoo-text">
                        {calculationResult.bmi}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Breakdown Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="rounded-lg border border-xeoo-border bg-xeoo-bg p-2">
                    <span className="block text-[10px] text-xeoo-muted">
                      Height
                    </span>
                    <span className="font-semibold text-xeoo-text font-mono">
                      {calculationResult.heightCm} cm
                    </span>
                  </div>

                  <div className="rounded-lg border border-xeoo-border bg-xeoo-bg p-2">
                    <span className="block text-[10px] text-xeoo-muted">
                      Weight
                    </span>
                    <span className="font-semibold text-xeoo-text font-mono">
                      {calculationResult.weightKg} kg
                    </span>
                  </div>

                  <div className="rounded-lg border border-xeoo-border bg-xeoo-bg p-2">
                    <span className="block text-[10px] text-xeoo-muted">
                      BMI Prime
                    </span>
                    <span className="font-semibold text-xeoo-text font-mono">
                      {calculationResult.primeIndex}
                    </span>
                  </div>

                  <div className="rounded-lg border border-xeoo-border bg-xeoo-bg p-2">
                    <span className="block text-[10px] text-xeoo-muted">
                      Ponderal Index
                    </span>
                    <span className="font-semibold text-xeoo-text font-mono">
                      {calculationResult.ponderalIndex}
                    </span>
                  </div>
                </div>

                {/* Healthy Weight Range Card */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="space-y-0.2">
                    <span className="text-xs font-semibold text-xeoo-text">
                      Estimated Normal Weight Range
                    </span>
                    <p className="text-[10px] text-xeoo-muted">
                      Based on standard 18.5 – 24.9 BMI for your height
                    </p>
                  </div>
                  <div className="text-xs font-bold text-xeoo-success font-mono">
                    {calculationResult.idealWeightRange.minKg} –{" "}
                    {calculationResult.idealWeightRange.maxKg} kg{" "}
                    <span className="text-[10px] font-normal text-xeoo-muted font-sans">
                      ({calculationResult.idealWeightRange.minLb}–
                      {calculationResult.idealWeightRange.maxLb} lb)
                    </span>
                  </div>
                </div>

                {/* Standard Categories Table */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-xeoo-text flex items-center gap-1.5">
                    <Activity className="h-3 w-3 text-xeoo-primary" />
                    WHO Standard BMI Classification
                  </span>
                  <div className="divide-y divide-xeoo-border rounded-lg border border-xeoo-border overflow-hidden text-xs">
                    {BMI_CATEGORIES.map((cat) => {
                      const isCurrent =
                        cat.key === calculationResult.category.key;
                      return (
                        <div
                          key={cat.key}
                          className={`flex items-center justify-between px-2.5 py-1.5 transition-colors ${
                            isCurrent
                              ? "bg-xeoo-primary/10 font-semibold text-xeoo-text"
                              : "bg-xeoo-bg text-xeoo-muted hover:bg-xeoo-surface-soft"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: cat.colorHex }}
                            />
                            <span className="text-[11px]">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[10px]">
                            <span>{cat.rangeText}</span>
                            {isCurrent && (
                              <span className="rounded bg-xeoo-primary px-1 py-0.2 text-[9px] font-bold text-white">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-xeoo-border bg-xeoo-surface p-4 text-center text-xs text-xeoo-muted">
                <Scale className="h-6 w-6 opacity-40 mb-1" />
                <p>Enter height and weight to calculate BMI.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
