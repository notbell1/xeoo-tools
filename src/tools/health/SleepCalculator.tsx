import { useMemo, useState } from "react";
import {
  AlarmClock,
  Bed,
  Check,
  Clock,
  Copy,
  Info,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
} from "lucide-react";

import Footer from "../../components/Footer";
import { showSuccess } from "../../alert";
import {
  calculateBedtimes,
  calculateNaps,
  calculateSleepDuration,
  formatMinutesToDualTime,
  parseTimeStringToMinutes,
  type TimeFormatPreference,
} from "./sleepCalculatorLogic";

type SleepMode = "bedtime" | "duration" | "nap";

export default function SleepCalculator() {
  const [mode, setMode] = useState<SleepMode>("bedtime");
  const [timePref, setTimePref] = useState<TimeFormatPreference>("12h");

  // Mode 1: Bedtime States (Default wake 06:30 / 6:30 AM)
  const [wakeTimeInput, setWakeTimeInput] = useState<string>("06:30");
  const [latencyMinutes, setLatencyMinutes] = useState<number>(15);

  // Mode 2: Duration States (Bedtime 22:30 / 10:30 PM -> Wake 06:30 / 6:30 AM)
  const [durationBedInput, setDurationBedInput] = useState<string>("22:30");
  const [durationWakeInput, setDurationWakeInput] = useState<string>("06:30");

  // Mode 3: Nap States (Start 14:30 / 2:30 PM)
  const [napStartInput, setNapStartInput] = useState<string>("14:30");
  const [customNapMinutes, setCustomNapMinutes] = useState<string>("25");

  const [copied, setCopied] = useState<boolean>(false);

  // Current helper conversion display for inputs
  const wakeTimeDual = useMemo(() => {
    const min = parseTimeStringToMinutes(wakeTimeInput) ?? 390;
    return formatMinutesToDualTime(min, timePref);
  }, [wakeTimeInput, timePref]);

  const durationBedDual = useMemo(() => {
    const min = parseTimeStringToMinutes(durationBedInput) ?? 1350;
    return formatMinutesToDualTime(min, timePref);
  }, [durationBedInput, timePref]);

  const durationWakeDual = useMemo(() => {
    const min = parseTimeStringToMinutes(durationWakeInput) ?? 390;
    return formatMinutesToDualTime(min, timePref);
  }, [durationWakeInput, timePref]);

  const napStartDual = useMemo(() => {
    const min = parseTimeStringToMinutes(napStartInput) ?? 870;
    return formatMinutesToDualTime(min, timePref);
  }, [napStartInput, timePref]);

  // Set nap start to current local clock time
  const handleSetNapToNow = () => {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, "0");
    const m = now.getMinutes().toString().padStart(2, "0");
    setNapStartInput(`${h}:${m}`);
  };

  const handleReset = () => {
    if (mode === "bedtime") {
      setWakeTimeInput("06:30");
      setLatencyMinutes(15);
    } else if (mode === "duration") {
      setDurationBedInput("22:30");
      setDurationWakeInput("06:30");
    } else {
      setNapStartInput("14:30");
      setCustomNapMinutes("25");
    }
  };

  // Calculations
  const bedtimeResult = useMemo(() => {
    const mins = parseTimeStringToMinutes(wakeTimeInput);
    if (mins === null) return null;
    return calculateBedtimes(mins, latencyMinutes, timePref);
  }, [wakeTimeInput, latencyMinutes, timePref]);

  const durationResult = useMemo(() => {
    const bedMins = parseTimeStringToMinutes(durationBedInput);
    const wakeMins = parseTimeStringToMinutes(durationWakeInput);
    if (bedMins === null || wakeMins === null) return null;
    return calculateSleepDuration(bedMins, wakeMins, timePref);
  }, [durationBedInput, durationWakeInput, timePref]);

  const napResult = useMemo(() => {
    const startMins = parseTimeStringToMinutes(napStartInput);
    if (startMins === null) return null;
    const customMin = customNapMinutes
      ? parseInt(customNapMinutes, 10)
      : undefined;
    return calculateNaps(startMins, customMin, timePref);
  }, [napStartInput, customNapMinutes, timePref]);

  const handleCopyResult = async () => {
    let copyText = "";

    if (mode === "bedtime" && bedtimeResult) {
      copyText = [
        "=== XeooTools Bedtime Calculation Result ===",
        `Wake-up Time: ${bedtimeResult.wakeTime.formatted}`,
        `Sleep Latency: ${bedtimeResult.latencyMinutes} minutes`,
        "--- Recommended Bedtimes (90-min Sleep Cycles) ---",
        ...bedtimeResult.recommendedCycles.map(
          (c) =>
            `${c.bedtime.formatted} — ${c.sleepDurationText} (${c.cycles} cycles) [${c.qualityTag}]`,
        ),
        "Note: Based on standard 90-minute sleep cycles. Informational guidance only.",
      ].join("\n");
    } else if (mode === "duration" && durationResult) {
      copyText = [
        "=== XeooTools Sleep Duration Result ===",
        `Bedtime: ${durationResult.bedtime.formatted}`,
        `Wake-up Time: ${durationResult.wakeTime.formatted}`,
        `Total Sleep Duration: ${durationResult.hours}h ${durationResult.minutes}m (${durationResult.cyclesCompleted} cycles)`,
        `Evaluation: ${durationResult.evaluationText}`,
        "Note: General educational guidance for adults (7-9h standard).",
      ].join("\n");
    } else if (mode === "nap" && napResult) {
      copyText = [
        "=== XeooTools Nap Calculator Result ===",
        `Nap Start: ${napResult.startTime.formatted}`,
        "--- Suggested Wake-up Times ---",
        ...napResult.naps.map(
          (n) =>
            `${n.name} (${n.durationMinutes} min): Wake up at ${n.wakeTime.formatted} — ${n.purpose}`,
        ),
        napResult.customNap
          ? `Custom Nap (${napResult.customNap.durationMinutes} min): Wake up at ${napResult.customNap.wakeTime.formatted}`
          : "",
        "Note: Naps under 30 minutes avoid slow-wave sleep grogginess.",
      ]
        .filter(Boolean)
        .join("\n");
    }

    if (copyText) {
      try {
        await navigator.clipboard.writeText(copyText);
        setCopied(true);
        showSuccess("Copied", "Sleep calculation copied to clipboard.");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      {/* MAIN WORKSPACE */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-3 sm:px-4 sm:py-4 space-y-3">
        {/* TOP MODE TABS & TIME PREFERENCE SWITCHER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-xeoo-border pb-2.5">
          {/* Mode Tabs */}
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode("bedtime")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                mode === "bedtime"
                  ? "bg-xeoo-primary text-white shadow-xs font-semibold"
                  : "text-xeoo-muted hover:text-xeoo-text"
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              <span>Bedtime Calculator</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("duration")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                mode === "duration"
                  ? "bg-xeoo-primary text-white shadow-xs font-semibold"
                  : "text-xeoo-muted hover:text-xeoo-text"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Sleep Duration</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("nap")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                mode === "nap"
                  ? "bg-xeoo-primary text-white shadow-xs font-semibold"
                  : "text-xeoo-muted hover:text-xeoo-text"
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              <span>Nap Calculator</span>
            </button>
          </div>

          {/* Time Display Preference Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-xeoo-muted uppercase font-semibold">
              Format:
            </span>
            <div className="inline-flex rounded-md border border-xeoo-border bg-xeoo-surface p-0.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setTimePref("12h")}
                className={`rounded px-2 py-0.5 transition-all ${
                  timePref === "12h"
                    ? "bg-xeoo-text text-xeoo-surface font-bold shadow-xs"
                    : "text-xeoo-muted hover:text-xeoo-text"
                }`}
                title="12-hour AM/PM format"
              >
                12-hour
              </button>
              <button
                type="button"
                onClick={() => setTimePref("24h")}
                className={`rounded px-2 py-0.5 transition-all ${
                  timePref === "24h"
                    ? "bg-xeoo-text text-xeoo-surface font-bold shadow-xs"
                    : "text-xeoo-muted hover:text-xeoo-text"
                }`}
                title="24-hour format"
              >
                24-hour
              </button>
            </div>
          </div>
        </div>

        {/* 2-COLUMN WORKSPACE */}
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
          {/* LEFT: INPUTS FORM */}
          <div className="space-y-3 lg:col-span-5">
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 sm:p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-xeoo-border pb-2.5">
                <div className="flex items-center gap-1.5">
                  <Bed className="h-4 w-4 text-xeoo-primary shrink-0" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                    {mode === "bedtime" && "Wake-up Target"}
                    {mode === "duration" && "Sleep Interval"}
                    {mode === "nap" && "Nap Timing"}
                  </h2>
                </div>
              </div>

              {/* MODE 1 INPUTS */}
              {mode === "bedtime" && (
                <div className="space-y-2.5">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label
                        htmlFor="sleep-wake-time"
                        className="text-xs font-medium text-xeoo-text"
                      >
                        Target Wake-up Time
                      </label>
                      <span className="font-mono text-[10px] text-xeoo-primary font-bold">
                        {wakeTimeDual.formatted}
                      </span>
                    </div>
                    <input
                      id="sleep-wake-time"
                      type="time"
                      value={wakeTimeInput}
                      onChange={(e) => setWakeTimeInput(e.target.value)}
                      className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs sm:text-sm font-mono text-xeoo-text outline-none focus:border-xeoo-primary"
                    />
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label
                        htmlFor="sleep-latency"
                        className="text-xs font-medium text-xeoo-text"
                      >
                        Fall-Asleep Buffer (Latency)
                      </label>
                      <span className="font-mono text-[11px] text-xeoo-text font-bold">
                        {latencyMinutes} min
                      </span>
                    </div>
                    <input
                      id="sleep-latency"
                      type="range"
                      min="0"
                      max="60"
                      step="5"
                      value={latencyMinutes}
                      onChange={(e) =>
                        setLatencyMinutes(parseInt(e.target.value, 10))
                      }
                      className="w-full accent-xeoo-primary h-1.5"
                    />
                  </div>
                </div>
              )}

              {/* MODE 2 INPUTS */}
              {mode === "duration" && (
                <div className="space-y-2.5">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label
                        htmlFor="dur-bed-time"
                        className="text-xs font-medium text-xeoo-text"
                      >
                        Bedtime (Sleep Start)
                      </label>
                      <span className="font-mono text-[10px] text-xeoo-primary font-bold">
                        {durationBedDual.formatted}
                      </span>
                    </div>
                    <input
                      id="dur-bed-time"
                      type="time"
                      value={durationBedInput}
                      onChange={(e) => setDurationBedInput(e.target.value)}
                      className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs sm:text-sm font-mono text-xeoo-text outline-none focus:border-xeoo-primary"
                    />
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label
                        htmlFor="dur-wake-time"
                        className="text-xs font-medium text-xeoo-text"
                      >
                        Wake-up Time
                      </label>
                      <span className="font-mono text-[10px] text-xeoo-primary font-bold">
                        {durationWakeDual.formatted}
                      </span>
                    </div>
                    <input
                      id="dur-wake-time"
                      type="time"
                      value={durationWakeInput}
                      onChange={(e) => setDurationWakeInput(e.target.value)}
                      className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs sm:text-sm font-mono text-xeoo-text outline-none focus:border-xeoo-primary"
                    />
                  </div>
                </div>
              )}

              {/* MODE 3 INPUTS */}
              {mode === "nap" && (
                <div className="space-y-2.5">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label
                        htmlFor="nap-start-time"
                        className="text-xs font-medium text-xeoo-text"
                      >
                        Nap Start Time
                      </label>
                      <button
                        type="button"
                        onClick={handleSetNapToNow}
                        className="text-[10px] font-bold text-xeoo-primary hover:underline"
                      >
                        Set to Now
                      </button>
                    </div>
                    <input
                      id="nap-start-time"
                      type="time"
                      value={napStartInput}
                      onChange={(e) => setNapStartInput(e.target.value)}
                      className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs sm:text-sm font-mono text-xeoo-text outline-none focus:border-xeoo-primary"
                    />
                    <div className="mt-0.5 text-right font-mono text-[10px] text-xeoo-muted">
                      {napStartDual.formatted}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="custom-nap-min"
                      className="mb-1 block text-xs font-medium text-xeoo-text"
                    >
                      Custom Nap Duration (Minutes)
                    </label>
                    <input
                      id="custom-nap-min"
                      type="number"
                      min="5"
                      max="180"
                      step="5"
                      value={customNapMinutes}
                      onChange={(e) => setCustomNapMinutes(e.target.value)}
                      className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs sm:text-sm font-mono text-xeoo-text outline-none focus:border-xeoo-primary"
                      placeholder="e.g. 25"
                    />
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
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 py-1.5 text-xs font-medium text-xeoo-text hover:bg-xeoo-surface-soft transition-colors"
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

            {/* SLEEP HYGIENE NOTE */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-[11px] text-xeoo-muted leading-relaxed space-y-1">
              <div className="flex items-center gap-1 font-semibold text-xeoo-text">
                <Info className="h-3 w-3 text-xeoo-primary shrink-0" />
                <span>Sleep Cycle Science</span>
              </div>
              <p>
                Human sleep repeats in ~90-minute ultradian cycles spanning
                Light, Deep, and REM sleep. Waking at cycle completion minimizes
                sleep inertia. Adults generally require 7–9 hours.
              </p>
            </div>
          </div>

          {/* RIGHT: RESULTS DISPLAY */}
          <div className="space-y-3 lg:col-span-7">
            {/* MODE 1 RESULTS: BEDTIME RECOMMENDATIONS */}
            {mode === "bedtime" && bedtimeResult && (
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 sm:p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-xeoo-border pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Target Wake-up Time
                    </span>
                    <div className="text-xl sm:text-2xl font-extrabold text-xeoo-text font-mono">
                      {bedtimeResult.wakeTime.formatted}
                    </div>
                  </div>
                  <div className="text-[10px] text-xeoo-muted font-mono">
                    +{bedtimeResult.latencyMinutes}m buffer
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-xeoo-text flex items-center gap-1.5">
                    <Moon className="h-3.5 w-3.5 text-xeoo-primary" />
                    Recommended Bedtimes (90-min Cycles)
                  </span>

                  <div className="grid grid-cols-1 gap-2">
                    {bedtimeResult.recommendedCycles.map((c) => (
                      <div
                        key={c.cycles}
                        className={`rounded-lg border px-3 py-2 transition-all space-y-0.5 ${
                          c.qualityTag === "Optimal"
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-xeoo-border bg-xeoo-bg"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm sm:text-base font-extrabold text-xeoo-text">
                              {c.bedtime.formatted}
                            </span>
                            <span
                              className={`rounded-full border px-1.5 py-0.2 text-[9px] font-bold ${c.badgeClass}`}
                            >
                              {c.qualityTag}
                            </span>
                          </div>

                          <div className="font-mono text-xs font-bold text-xeoo-primary">
                            {c.sleepDurationText} ({c.cycles} cycles)
                          </div>
                        </div>

                        <p className="text-[11px] text-xeoo-muted">
                          {c.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODE 2 RESULTS: SLEEP DURATION */}
            {mode === "duration" && durationResult && (
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 sm:p-4 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-xeoo-border pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Total Sleep Duration
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-xeoo-text font-mono">
                        {durationResult.hours}h {durationResult.minutes}m
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1 text-xs font-mono">
                    <span className="block text-[9px] text-xeoo-muted font-sans uppercase">
                      Cycles
                    </span>
                    <span className="font-bold text-xeoo-primary">
                      ~{durationResult.cyclesCompleted} cycles
                    </span>
                  </div>
                </div>

                {/* Interval Visual Summary */}
                <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                  <div className="rounded-lg border border-xeoo-border bg-xeoo-bg p-2.5">
                    <span className=" text-[10px] text-xeoo-muted font-sans flex items-center gap-1">
                      <Moon className="h-3 w-3 text-xeoo-primary" />
                      Bedtime
                    </span>
                    <span className="font-bold text-xeoo-text text-xs sm:text-sm">
                      {durationResult.bedtime.formatted}
                    </span>
                  </div>

                  <div className="rounded-lg border border-xeoo-border bg-xeoo-bg p-2.5">
                    <span className=" text-[10px] text-xeoo-muted font-sans flex items-center gap-1">
                      <Sun className="h-3 w-3 text-amber-400" />
                      Wake-up Time
                    </span>
                    <span className="font-bold text-xeoo-text text-xs sm:text-sm">
                      {durationResult.wakeTime.formatted}
                    </span>
                  </div>
                </div>

                {/* Evaluation Card */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 space-y-0.5">
                  <span className="text-xs font-semibold text-xeoo-text flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-xeoo-primary" />
                    Sleep Window Evaluation
                  </span>
                  <p
                    className={`text-xs font-medium ${durationResult.evaluationClass}`}
                  >
                    {durationResult.evaluationText}
                  </p>
                </div>
              </div>
            )}

            {/* MODE 3 RESULTS: NAP CALCULATOR */}
            {mode === "nap" && napResult && (
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 sm:p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-xeoo-border pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Nap Start Time
                    </span>
                    <div className="text-xl sm:text-2xl font-extrabold text-xeoo-text font-mono">
                      {napResult.startTime.formatted}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-xeoo-text flex items-center gap-1.5">
                    <AlarmClock className="h-3.5 w-3.5 text-xeoo-primary" />
                    Suggested Nap Alarm Times
                  </span>

                  <div className="grid grid-cols-1 gap-2">
                    {napResult.naps.map((n) => (
                      <div
                        key={n.name}
                        className="rounded-lg border border-xeoo-border bg-xeoo-bg px-3 py-2 space-y-0.5 hover:border-xeoo-border-dark transition-colors"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-xeoo-text">
                            {n.name} ({n.durationMinutes} min)
                          </span>

                          <div className="font-mono text-xs sm:text-sm font-extrabold text-xeoo-primary">
                            {n.wakeTime.formatted}
                          </div>
                        </div>

                        <p className="text-[11px] text-xeoo-text-soft">
                          {n.purpose}
                        </p>
                        <p className="text-[10px] text-xeoo-muted italic border-t border-xeoo-border/50 pt-0.5">
                          {n.recommendation}
                        </p>
                      </div>
                    ))}

                    {/* Custom Nap Card if valid */}
                    {napResult.customNap && (
                      <div className="rounded-lg border border-xeoo-primary/30 bg-xeoo-primary/5 px-3 py-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-xeoo-primary">
                          Custom Nap ({napResult.customNap.durationMinutes} min)
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-extrabold text-xeoo-text">
                          {napResult.customNap.wakeTime.formatted}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
