import { useMemo, useState } from "react";
import {
  Activity,
  Check,
  Copy,
  Heart,
  HeartPulse,
  Info,
  RotateCcw,
  Zap,
} from "lucide-react";

import Footer from "../../components/Footer";
import { showSuccess } from "../../alert";
import HealthSelect, { type HealthSelectOption } from "./HealthSelect";
import {
  calculateHeartRateZones,
  HR_FORMULAS,
  type HrFormula,
} from "./heartRateZoneLogic";

export default function HeartRateZoneCalculator() {
  const [age, setAge] = useState<string>("30");
  const [restingHr, setRestingHr] = useState<string>("65");
  const [formula, setFormula] = useState<HrFormula>("tanaka");
  const [useReserve, setUseReserve] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const handleReset = () => {
    setAge("30");
    setRestingHr("65");
    setFormula("tanaka");
    setUseReserve(true);
  };

  const calculationResult = useMemo(() => {
    const ageNum = parseInt(age, 10);
    const restNum = restingHr ? parseInt(restingHr, 10) : undefined;

    if (isNaN(ageNum) || ageNum < 10 || ageNum > 115) {
      return null;
    }

    return calculateHeartRateZones(ageNum, restNum, formula, useReserve);
  }, [age, restingHr, formula, useReserve]);

  const handleCopyResult = async () => {
    if (!calculationResult) return;
    const lines = [
      "=== XeooTools Heart Rate Zones Result ===",
      `Age: ${calculationResult.age}`,
      `Estimated Max Heart Rate: ${calculationResult.maxHr} BPM`,
      calculationResult.restingHr
        ? `Resting Heart Rate: ${calculationResult.restingHr} BPM (Method: Karvonen HR Reserve)`
        : "Method: Estimated % Max HR",
      "--- Training Zones ---",
      ...calculationResult.zones.map(
        (z) =>
          `${z.name} (${z.intensityPercentRange}): ${z.minBpm}–${z.maxBpm} BPM | ${z.perceivedExertion}`
      ),
      "Note: Heart rates vary by individual physiology, medications, and temperature. Not medical advice.",
    ];

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      showSuccess("Copied", "Heart rate zones copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const formulaSelectOptions: HealthSelectOption<HrFormula>[] = useMemo(
    () =>
      HR_FORMULAS.map((f) => ({
        value: f.key,
        label: f.name,
        description: f.description,
        badge: f.formulaText,
      })),
    []
  );

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      {/* MAIN WORKSPACE */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-3 sm:px-4 sm:py-4">
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
          {/* LEFT: PARAMETERS */}
          <div className="space-y-3 lg:col-span-5">
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 sm:p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-xeoo-border pb-2.5">
                <div className="flex items-center gap-1.5">
                  <HeartPulse className="h-4 w-4 text-xeoo-primary shrink-0" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                    Heart Rate Inputs
                  </h2>
                </div>
              </div>

              {/* Age & Resting HR Row */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label
                    htmlFor="hr-age"
                    className="mb-1 block text-xs font-medium text-xeoo-text"
                  >
                    Age (Years)
                  </label>
                  <input
                    id="hr-age"
                    type="number"
                    min="10"
                    max="115"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary transition-colors"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label
                    htmlFor="hr-resting"
                    className="mb-1 block text-xs font-medium text-xeoo-text"
                  >
                    Resting HR (BPM)
                  </label>
                  <div className="relative">
                    <input
                      id="hr-resting"
                      type="number"
                      min="35"
                      max="120"
                      value={restingHr}
                      onChange={(e) => setRestingHr(e.target.value)}
                      className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 pr-8 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary transition-colors"
                      placeholder="60"
                    />
                    <span className="pointer-events-none absolute right-2 top-1.5 text-[10px] text-xeoo-muted">
                      BPM
                    </span>
                  </div>
                </div>
              </div>

              {/* Formula Method via HealthSelect */}
              <HealthSelect<HrFormula>
                id="hr-formula-select"
                label="Max HR Formula"
                value={formula}
                onChange={setFormula}
                options={formulaSelectOptions}
              />

              {/* Karvonen Reserve Toggle */}
              {restingHr && parseInt(restingHr, 10) > 35 && (
                <label className="flex items-center justify-between rounded-lg border border-xeoo-border bg-xeoo-bg p-2 text-xs cursor-pointer">
                  <span className="text-xeoo-text font-medium text-[11px]">
                    Use Karvonen HR Reserve (HRR)
                  </span>
                  <input
                    type="checkbox"
                    checked={useReserve}
                    onChange={(e) => setUseReserve(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-xeoo-border accent-xeoo-primary"
                  />
                </label>
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

            {/* EDUCATIONAL DISCLAIMER */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-[11px] text-xeoo-muted leading-relaxed space-y-1">
              <div className="flex items-center gap-1 font-semibold text-xeoo-text">
                <Info className="h-3 w-3 text-xeoo-primary shrink-0" />
                <span>Physiological Guidance Note</span>
              </div>
              <p>
                Target heart rate zones are mathematical estimates. Individual
                response varies by genetics, hydration, ambient temperature,
                caffeine, and cardiac medications.
              </p>
            </div>
          </div>

          {/* RIGHT: ZONES VISUALIZATION & BREAKDOWN */}
          <div className="space-y-3 lg:col-span-7">
            {calculationResult ? (
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 sm:p-4 shadow-xs space-y-3.5">
                {/* Max Heart Rate Summary Header */}
                <div className="flex items-center justify-between border-b border-xeoo-border pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Estimated Max Heart Rate
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-xeoo-text font-mono">
                        {calculationResult.maxHr}
                      </span>
                      <span className="text-xs text-xeoo-muted font-mono">
                        BPM
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 text-xs font-mono">
                    {calculationResult.restingHr && (
                      <div className="rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1">
                        <span className="block text-[9px] text-xeoo-muted font-sans uppercase">
                          Resting HR
                        </span>
                        <span className="font-bold text-xeoo-text">
                          {calculationResult.restingHr} BPM
                        </span>
                      </div>
                    )}

                    {calculationResult.hrReserve && (
                      <div className="rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1">
                        <span className="block text-[9px] text-xeoo-muted font-sans uppercase">
                          Reserve (HRR)
                        </span>
                        <span className="font-bold text-xeoo-text">
                          {calculationResult.hrReserve} BPM
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5-Zone Horizontal Gradient Visual Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-xeoo-muted">
                    <span className="text-sky-400">Z1 (50%)</span>
                    <span className="text-emerald-400">Z2 (60%)</span>
                    <span className="text-amber-400">Z3 (70%)</span>
                    <span className="text-orange-400">Z4 (80%)</span>
                    <span className="text-rose-400">Z5 (90%+)</span>
                  </div>

                  <div className="grid grid-cols-5 gap-1 h-2.5 rounded-full overflow-hidden bg-xeoo-surface-soft">
                    <div
                      className="h-full bg-sky-400"
                      title="Zone 1: Active Recovery"
                    />
                    <div
                      className="h-full bg-emerald-500"
                      title="Zone 2: Aerobic Base"
                    />
                    <div
                      className="h-full bg-amber-400"
                      title="Zone 3: Tempo"
                    />
                    <div
                      className="h-full bg-orange-500"
                      title="Zone 4: Threshold"
                    />
                    <div
                      className="h-full bg-rose-500"
                      title="Zone 5: Maximum"
                    />
                  </div>
                </div>

                {/* Detailed 5 Zone Rows */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-xeoo-text flex items-center gap-1.5">
                    <Activity className="h-3 w-3 text-xeoo-primary" />
                    Target Training Zones Breakdown
                  </span>

                  <div className="grid grid-cols-1 gap-2">
                    {calculationResult.zones.map((z) => (
                      <div
                        key={z.zoneNumber}
                        className="rounded-lg border border-xeoo-border bg-xeoo-bg px-3 py-2 space-y-1 transition-all hover:border-xeoo-border-dark"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: z.colorHex }}
                            />
                            <span className="text-xs font-bold text-xeoo-text">
                              {z.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`rounded-full border px-1.5 py-0.2 text-[9px] font-bold ${z.badgeClass}`}
                            >
                              {z.intensityPercentRange}
                            </span>
                            <span className="font-mono text-xs font-extrabold text-xeoo-text">
                              {z.minBpm} – {z.maxBpm}{" "}
                              <span className="text-[9px] font-normal text-xeoo-muted">
                                BPM
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] text-xeoo-muted">
                          <span className="truncate flex items-center gap-1">
                            <Zap className="h-3 w-3 text-xeoo-primary shrink-0" />
                            {z.benefits}
                          </span>
                          <span className="font-medium text-xeoo-text-soft shrink-0">
                            {z.perceivedExertion}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-xeoo-border bg-xeoo-surface p-4 text-center text-xs text-xeoo-muted">
                <Heart className="h-6 w-6 opacity-40 mb-1" />
                <p>Enter your age to generate heart rate training zones.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
