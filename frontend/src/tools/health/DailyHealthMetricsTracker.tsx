import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Calendar,
  Download,
  Droplets,
  Flame,
  Footprints,
  HeartPulse,
  Info,
  Moon,
  Plus,
  RotateCcw,
  Scale,
  Smile,
  Trash2,
  Upload,
} from "lucide-react";

import Footer from "../../components/Footer";
import { showConfirm, showError, showSuccess } from "../../alert";
import {
  filterEntriesByDays,
  getSampleHealthMetrics,
  loadHealthMetricsFromStorage,
  MOOD_OPTIONS,
  saveHealthMetricsToStorage,
  validateImportedMetricsJson,
  type HealthMetricEntry,
  type MoodLevel,
} from "./dailyHealthMetricsLogic";

export default function DailyHealthMetricsTracker() {
  const [entries, setEntries] = useState<HealthMetricEntry[]>([]);
  const [timeframe, setTimeframe] = useState<"today" | "7d" | "30d">("7d");
  const [unitWeight, setUnitWeight] = useState<"kg" | "lb">("kg");
  const [unitWater, setUnitWater] = useState<"ml" | "L">("L");

  // Form Inputs (defaults to today)
  const todayStr = new Date().toISOString().slice(0, 10);
  const [entryDate, setEntryDate] = useState<string>(todayStr);
  const [weightInput, setWeightInput] = useState<string>("68.5");
  const [sleepHoursInput, setSleepHoursInput] = useState<string>("7");
  const [sleepMinsInput, setSleepMinsInput] = useState<string>("30");
  const [waterInput, setWaterInput] = useState<string>("2.2");
  const [stepsInput, setStepsInput] = useState<string>("8500");
  const [restingHrInput, setRestingHrInput] = useState<string>("64");
  const [exerciseInput, setExerciseInput] = useState<string>("30");
  const [moodInput, setMoodInput] = useState<MoodLevel>(4);
  const [notesInput, setNotesInput] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from local storage on mount
  useEffect(() => {
    const loaded = loadHealthMetricsFromStorage();
    if (loaded.length > 0) {
      setEntries(loaded);
    } else {
      // Provide sample starter entries
      const samples = getSampleHealthMetrics();
      setEntries(samples);
      saveHealthMetricsToStorage(samples);
    }
  }, []);

  // Reset current entry form ONLY
  const handleResetForm = () => {
    setEntryDate(todayStr);
    setWeightInput("");
    setSleepHoursInput("");
    setSleepMinsInput("");
    setWaterInput("");
    setStepsInput("");
    setRestingHrInput("");
    setExerciseInput("");
    setMoodInput(3);
    setNotesInput("");
    showSuccess("Form Cleared", "Current form cleared (history preserved).");
  };

  // Save / Update Entry
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryDate) {
      showError("Date Required", "Please select a date for the entry.");
      return;
    }

    // Weight conversion
    let weightKg: number | undefined;
    if (weightInput) {
      const val = parseFloat(weightInput);
      if (!isNaN(val) && val > 0) {
        weightKg =
          unitWeight === "lb" ? Number((val / 2.20462).toFixed(1)) : val;
      }
    }

    // Sleep calculation
    let sleepHours: number | undefined;
    const h = parseInt(sleepHoursInput, 10) || 0;
    const m = parseInt(sleepMinsInput, 10) || 0;
    if (sleepHoursInput || sleepMinsInput) {
      sleepHours = Number((h + m / 60).toFixed(2));
    }

    // Water conversion
    let waterMl: number | undefined;
    if (waterInput) {
      const val = parseFloat(waterInput);
      if (!isNaN(val) && val >= 0) {
        waterMl =
          unitWater === "L" ? Math.round(val * 1000) : Math.round(val);
      }
    }

    const steps = stepsInput ? parseInt(stepsInput, 10) : undefined;
    const restingHr = restingHrInput ? parseInt(restingHrInput, 10) : undefined;
    const exerciseMinutes = exerciseInput
      ? parseInt(exerciseInput, 10)
      : undefined;

    // Check if an entry for this date exists
    const existingIndex = entries.findIndex((e) => e.date === entryDate);
    const newEntry: HealthMetricEntry = {
      id:
        existingIndex >= 0
          ? entries[existingIndex].id
          : `metric_${Date.now()}`,
      date: entryDate,
      weightKg,
      sleepHours,
      sleepHoursPart: h,
      sleepMinutesPart: m,
      waterMl,
      steps,
      restingHr,
      exerciseMinutes,
      mood: moodInput,
      notes: notesInput.trim() || undefined,
      createdAt: Date.now(),
    };

    let updated: HealthMetricEntry[];
    if (existingIndex >= 0) {
      updated = [...entries];
      updated[existingIndex] = newEntry;
    } else {
      updated = [newEntry, ...entries];
    }

    setEntries(updated);
    saveHealthMetricsToStorage(updated);
    showSuccess("Log Saved", `Health entry for ${entryDate} recorded.`);
  };

  // Delete individual entry
  const handleDeleteEntry = async (id: string) => {
    const confirmed = await showConfirm(
      "Delete Entry?",
      "Are you sure you want to remove this log entry?"
    );
    if (confirmed) {
      const updated = entries.filter((e) => e.id !== id);
      setEntries(updated);
      saveHealthMetricsToStorage(updated);
      showSuccess("Deleted", "Entry removed from history.");
    }
  };

  // Clear all history
  const handleClearHistory = async () => {
    const confirmed = await showConfirm(
      "Clear All History?",
      "This will permanently delete all stored health logs from your browser."
    );
    if (confirmed) {
      setEntries([]);
      saveHealthMetricsToStorage([]);
      showSuccess("History Cleared", "All health logs have been erased.");
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `xeoo-health-tracker-${todayStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showSuccess("Exported", "Health metrics downloaded as JSON.");
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const val = validateImportedMetricsJson(parsed);
        if (!val.valid) {
          showError("Import Failed", val.error || "Invalid file format.");
          return;
        }

        // Merge without duplicates by date
        const dateMap = new Map<string, HealthMetricEntry>();
        entries.forEach((item) => dateMap.set(item.date, item));
        val.entries.forEach((item) => dateMap.set(item.date, item));

        const merged = Array.from(dateMap.values()).sort((a, b) =>
          b.date.localeCompare(a.date)
        );

        setEntries(merged);
        saveHealthMetricsToStorage(merged);
        showSuccess(
          "Import Successful",
          `Imported ${val.entries.length} health log entries.`
        );
      } catch {
        showError("Invalid JSON", "Could not parse JSON health file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Filtered entries according to timeframe
  const filteredEntries = useMemo(() => {
    const days = timeframe === "today" ? 1 : timeframe === "7d" ? 7 : 30;
    return filterEntriesByDays(entries, days);
  }, [entries, timeframe]);

  // Latest / Today's Entry for quick overview
  const latestEntry = entries[0] || null;

  // Averages for current view
  const stats = useMemo(() => {
    if (filteredEntries.length === 0) return null;
    let totalWeight = 0;
    let countWeight = 0;
    let totalSleep = 0;
    let countSleep = 0;
    let totalSteps = 0;
    let countSteps = 0;
    let totalWater = 0;
    let countWater = 0;
    let totalHr = 0;
    let countHr = 0;

    filteredEntries.forEach((e) => {
      if (e.weightKg) {
        totalWeight += e.weightKg;
        countWeight++;
      }
      if (e.sleepHours) {
        totalSleep += e.sleepHours;
        countSleep++;
      }
      if (e.steps) {
        totalSteps += e.steps;
        countSteps++;
      }
      if (e.waterMl) {
        totalWater += e.waterMl;
        countWater++;
      }
      if (e.restingHr) {
        totalHr += e.restingHr;
        countHr++;
      }
    });

    return {
      avgWeightKg:
        countWeight > 0 ? (totalWeight / countWeight).toFixed(1) : "-",
      avgSleepHours:
        countSleep > 0 ? (totalSleep / countSleep).toFixed(1) : "-",
      avgSteps:
        countSteps > 0
          ? Math.round(totalSteps / countSteps).toLocaleString()
          : "-",
      avgWaterL:
        countWater > 0 ? (totalWater / countWater / 1000).toFixed(1) : "-",
      avgRestingHr: countHr > 0 ? Math.round(totalHr / countHr) : "-",
      totalLogs: filteredEntries.length,
    };
  }, [filteredEntries]);

  // Trend Data for simple SVG line visualizer (sorted chronologically)
  const chronologicalEntries = useMemo(() => {
    return [...filteredEntries].reverse();
  }, [filteredEntries]);

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      {/* MAIN WORKSPACE */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-3 sm:px-4 sm:py-4 space-y-3">
        {/* TOP TOOLBAR: TIMEFRAME & BACKUP ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-xeoo-border pb-2.5">
          {/* Timeframe selector */}
          <div className="flex items-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setTimeframe("today")}
              className={`rounded-md px-2.5 py-1 transition-all ${
                timeframe === "today"
                  ? "bg-xeoo-primary text-white shadow-xs font-semibold"
                  : "text-xeoo-muted hover:text-xeoo-text"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("7d")}
              className={`rounded-md px-2.5 py-1 transition-all ${
                timeframe === "7d"
                  ? "bg-xeoo-primary text-white shadow-xs font-semibold"
                  : "text-xeoo-muted hover:text-xeoo-text"
              }`}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("30d")}
              className={`rounded-md px-2.5 py-1 transition-all ${
                timeframe === "30d"
                  ? "bg-xeoo-primary text-white shadow-xs font-semibold"
                  : "text-xeoo-muted hover:text-xeoo-text"
              }`}
            >
              Last 30 Days
            </button>
          </div>

          {/* Backup / Restore / Clear Local Storage */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-xs font-medium text-xeoo-text hover:bg-xeoo-surface-soft shadow-xs"
              title="Export health data locally as JSON"
            >
              <Download className="h-3.5 w-3.5 text-xeoo-muted" />
              <span>Export</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
              id="import-health-json"
            />
            <label
              htmlFor="import-health-json"
              className="flex items-center gap-1 cursor-pointer rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-xs font-medium text-xeoo-text hover:bg-xeoo-surface-soft shadow-xs"
              title="Import JSON metrics"
            >
              <Upload className="h-3.5 w-3.5 text-xeoo-muted" />
              <span>Import</span>
            </label>

            <button
              type="button"
              onClick={handleClearHistory}
              className="flex items-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface px-2 py-1 text-xs font-medium text-xeoo-danger hover:bg-xeoo-danger-soft shadow-xs"
              title="Clear all stored logs"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 2-COLUMN WORKSPACE: [LOGGING FORM (LEFT)] | [DASHBOARD & TRENDS (RIGHT)] */}
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
          {/* LEFT: DAILY LOGGING FORM */}
          <div className="space-y-3 lg:col-span-4">
            <form
              onSubmit={handleSaveEntry}
              className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 sm:p-4 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-xeoo-border pb-2.5">
                <div className="flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-xeoo-primary shrink-0" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                    Log Daily Metric
                  </h2>
                </div>
              </div>

              {/* Date Input */}
              <div>
                <label
                  htmlFor="health-date"
                  className="mb-1  text-xs font-medium text-xeoo-text flex items-center gap-1"
                >
                  <Calendar className="h-3.5 w-3.5 text-xeoo-primary" />
                  Date
                </label>
                <input
                  id="health-date"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary"
                  required
                />
              </div>

              {/* Weight with Unit Switch */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="health-weight"
                    className="text-xs font-medium text-xeoo-text flex items-center gap-1"
                  >
                    <Scale className="h-3.5 w-3.5 text-xeoo-primary" />
                    Weight
                  </label>
                  <div className="inline-flex rounded border border-xeoo-border bg-xeoo-bg p-0.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setUnitWeight("kg")}
                      className={`px-1.5 py-0.2 rounded ${
                        unitWeight === "kg"
                          ? "bg-xeoo-surface font-bold text-xeoo-text"
                          : "text-xeoo-muted"
                      }`}
                    >
                      kg
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnitWeight("lb")}
                      className={`px-1.5 py-0.2 rounded ${
                        unitWeight === "lb"
                          ? "bg-xeoo-surface font-bold text-xeoo-text"
                          : "text-xeoo-muted"
                      }`}
                    >
                      lb
                    </button>
                  </div>
                </div>
                <input
                  id="health-weight"
                  type="number"
                  step="0.1"
                  min="20"
                  max="500"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary"
                  placeholder={unitWeight === "kg" ? "68.5" : "151"}
                />
              </div>

              {/* Sleep Duration */}
              <div>
                <label className="mb-1  text-xs font-medium text-xeoo-text flex items-center gap-1">
                  <Moon className="h-3.5 w-3.5 text-xeoo-primary" />
                  Sleep Duration
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={sleepHoursInput}
                      onChange={(e) => setSleepHoursInput(e.target.value)}
                      className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 pr-7 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary"
                      placeholder="7"
                      aria-label="Hours"
                    />
                    <span className="pointer-events-none absolute right-2 top-1.5 text-[10px] text-xeoo-muted">
                      hrs
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      step="5"
                      value={sleepMinsInput}
                      onChange={(e) => setSleepMinsInput(e.target.value)}
                      className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 pr-8 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary"
                      placeholder="30"
                      aria-label="Minutes"
                    />
                    <span className="pointer-events-none absolute right-2 top-1.5 text-[10px] text-xeoo-muted">
                      mins
                    </span>
                  </div>
                </div>
              </div>

              {/* Water Intake */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="health-water"
                    className="text-xs font-medium text-xeoo-text flex items-center gap-1"
                  >
                    <Droplets className="h-3.5 w-3.5 text-sky-400" />
                    Water Intake
                  </label>
                  <div className="inline-flex rounded border border-xeoo-border bg-xeoo-bg p-0.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setUnitWater("L")}
                      className={`px-1.5 py-0.2 rounded ${
                        unitWater === "L"
                          ? "bg-xeoo-surface font-bold text-xeoo-text"
                          : "text-xeoo-muted"
                      }`}
                    >
                      L
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnitWater("ml")}
                      className={`px-1.5 py-0.2 rounded ${
                        unitWater === "ml"
                          ? "bg-xeoo-surface font-bold text-xeoo-text"
                          : "text-xeoo-muted"
                      }`}
                    >
                      ml
                    </button>
                  </div>
                </div>
                <input
                  id="health-water"
                  type="number"
                  step={unitWater === "L" ? "0.1" : "50"}
                  min="0"
                  max="10000"
                  value={waterInput}
                  onChange={(e) => setWaterInput(e.target.value)}
                  className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary"
                  placeholder={unitWater === "L" ? "2.2" : "2200"}
                />
              </div>

              {/* Steps & Resting HR */}
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label
                    htmlFor="health-steps"
                    className="mb-1  text-xs font-medium text-xeoo-text flex items-center gap-1"
                  >
                    <Footprints className="h-3 w-3 text-emerald-400" />
                    Steps
                  </label>
                  <input
                    id="health-steps"
                    type="number"
                    min="0"
                    max="100000"
                    value={stepsInput}
                    onChange={(e) => setStepsInput(e.target.value)}
                    className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary"
                    placeholder="8500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="health-hr"
                    className="mb-1  text-xs font-medium text-xeoo-text flex items-center gap-1"
                  >
                    <HeartPulse className="h-3 w-3 text-rose-400" />
                    Resting HR
                  </label>
                  <input
                    id="health-hr"
                    type="number"
                    min="35"
                    max="160"
                    value={restingHrInput}
                    onChange={(e) => setRestingHrInput(e.target.value)}
                    className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary"
                    placeholder="64"
                  />
                </div>
              </div>

              {/* Exercise Minutes */}
              <div>
                <label
                  htmlFor="health-exercise"
                  className="mb-1  text-xs font-medium text-xeoo-text flex items-center gap-1"
                >
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  Exercise (Minutes)
                </label>
                <input
                  id="health-exercise"
                  type="number"
                  min="0"
                  max="480"
                  value={exerciseInput}
                  onChange={(e) => setExerciseInput(e.target.value)}
                  className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs sm:text-sm text-xeoo-text outline-none focus:border-xeoo-primary"
                  placeholder="30"
                />
              </div>

              {/* Mood Selector */}
              <div>
                <label className="mb-1  text-xs font-medium text-xeoo-text flex items-center gap-1">
                  <Smile className="h-3.5 w-3.5 text-xeoo-primary" />
                  Mood Rating
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {MOOD_OPTIONS.map((m) => (
                    <button
                      key={m.level}
                      type="button"
                      onClick={() => setMoodInput(m.level)}
                      className={`flex flex-col items-center justify-center rounded-lg border py-1 px-0.5 transition-all ${
                        moodInput === m.level
                          ? "border-xeoo-primary bg-xeoo-primary/10 shadow-xs"
                          : "border-xeoo-border bg-xeoo-bg text-xeoo-muted hover:bg-xeoo-surface-soft"
                      }`}
                      title={m.label}
                    >
                      <span className="text-sm">{m.emoji}</span>
                      <span className="text-[8px] font-semibold mt-0.5 truncate max-w-full">
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Short Notes */}
              <div>
                <label
                  htmlFor="health-notes"
                  className="mb-1 block text-xs font-medium text-xeoo-text"
                >
                  Notes (Optional)
                </label>
                <textarea
                  id="health-notes"
                  rows={2}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg p-2 text-xs text-xeoo-text outline-none focus:border-xeoo-primary resize-none"
                  placeholder="e.g. Morning jog, feeling great."
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 py-1.5 text-xs font-medium text-xeoo-muted hover:bg-xeoo-surface-soft hover:text-xeoo-text transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Clear</span>
                </button>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-xeoo-text px-2.5 py-1.5 text-xs font-bold text-xeoo-surface shadow hover:opacity-90 transition-opacity"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>

            {/* PRIVACY NOTICE */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-[11px] text-xeoo-muted leading-relaxed space-y-1">
              <div className="flex items-center gap-1 font-semibold text-xeoo-text">
                <Info className="h-3 w-3 text-xeoo-primary shrink-0" />
                <span>100% Local Storage</span>
              </div>
              <p>
                Metrics are kept exclusively inside your browser’s localStorage.
                No personal health data leaves your device.
              </p>
            </div>
          </div>

          {/* RIGHT: DASHBOARD, VISUAL TRENDS & RECENT LOGS */}
          <div className="space-y-3 lg:col-span-8">
            {/* OVERVIEW METRIC CARDS */}
            {latestEntry && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-2.5 space-y-0.5 shadow-xs">
                  <span className="text-[10px] text-xeoo-muted flex items-center gap-1 font-medium">
                    <Scale className="h-3 w-3 text-xeoo-primary" />
                    Weight
                  </span>
                  <div className="font-mono text-lg font-extrabold text-xeoo-text">
                    {latestEntry.weightKg ? `${latestEntry.weightKg} kg` : "—"}
                  </div>
                </div>

                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-2.5 space-y-0.5 shadow-xs">
                  <span className="text-[10px] text-xeoo-muted flex items-center gap-1 font-medium">
                    <Moon className="h-3 w-3 text-indigo-400" />
                    Sleep
                  </span>
                  <div className="font-mono text-lg font-extrabold text-xeoo-text">
                    {latestEntry.sleepHours ? `${latestEntry.sleepHours} hrs` : "—"}
                  </div>
                </div>

                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-2.5 space-y-0.5 shadow-xs">
                  <span className="text-[10px] text-xeoo-muted flex items-center gap-1 font-medium">
                    <Footprints className="h-3 w-3 text-emerald-400" />
                    Steps
                  </span>
                  <div className="font-mono text-lg font-extrabold text-xeoo-text">
                    {latestEntry.steps
                      ? latestEntry.steps.toLocaleString()
                      : "—"}
                  </div>
                </div>

                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-2.5 space-y-0.5 shadow-xs">
                  <span className="text-[10px] text-xeoo-muted flex items-center gap-1 font-medium">
                    <Droplets className="h-3 w-3 text-sky-400" />
                    Water
                  </span>
                  <div className="font-mono text-lg font-extrabold text-xeoo-text">
                    {latestEntry.waterMl
                      ? `${(latestEntry.waterMl / 1000).toFixed(1)} L`
                      : "—"}
                  </div>
                </div>
              </div>
            )}

            {/* TREND CHARTS CONTAINER */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 sm:p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-xeoo-border pb-2.5">
                <div className="flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-xeoo-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                    Activity & Sleep Trends (
                    {timeframe === "today"
                      ? "Today"
                      : timeframe === "7d"
                        ? "7 Days"
                        : "30 Days"}
                    )
                  </h3>
                </div>

                {stats && (
                  <span className="text-[10px] font-mono text-xeoo-muted">
                    {stats.totalLogs} logs
                  </span>
                )}
              </div>

              {chronologicalEntries.length > 0 ? (
                <div className="space-y-3">
                  {/* Steps Bar Chart */}
                  <div className="rounded-lg border border-xeoo-border bg-xeoo-bg p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                        <Footprints className="h-3 w-3" />
                        Daily Steps Trend
                      </span>
                      {stats && (
                        <span className="text-[10px] text-xeoo-muted font-mono font-normal">
                          Avg: {stats.avgSteps} steps
                        </span>
                      )}
                    </div>

                    <div className="h-24 flex items-end gap-1.5 pt-3 pb-0.5 overflow-x-auto">
                      {chronologicalEntries.map((item) => {
                        const st = item.steps || 0;
                        const heightPct = Math.min(
                          100,
                          Math.max(8, (st / 12000) * 100)
                        );
                        const isGoal = st >= 8000;
                        return (
                          <div
                            key={item.id}
                            className="flex flex-1 flex-col items-center gap-0.5 group min-w-[24px]"
                          >
                            <span className="font-mono text-[8px] text-xeoo-muted opacity-0 group-hover:opacity-100 transition-opacity">
                              {st > 0 ? `${Math.round(st / 1000)}k` : "-"}
                            </span>
                            <div
                              className={`w-full rounded-t transition-all ${
                                isGoal
                                  ? "bg-emerald-500"
                                  : "bg-xeoo-primary/60"
                              }`}
                              style={{ height: `${heightPct}%` }}
                              title={`${item.date}: ${st.toLocaleString()} steps`}
                            />
                            <span className="font-mono text-[8px] text-xeoo-muted truncate max-w-full">
                              {item.date.slice(8)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sleep & Water Split Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {/* Sleep Trend */}
                    <div className="rounded-lg border border-xeoo-border bg-xeoo-bg p-2.5 space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1 text-indigo-400 text-[11px]">
                          <Moon className="h-3 w-3" />
                          Sleep (hrs)
                        </span>
                        {stats && (
                          <span className="text-[10px] text-xeoo-muted font-mono font-normal">
                            Avg: {stats.avgSleepHours}h
                          </span>
                        )}
                      </div>
                      <div className="h-12 flex items-end gap-1 pt-1">
                        {chronologicalEntries.map((item) => {
                          const slp = item.sleepHours || 0;
                          const heightPct = Math.min(
                            100,
                            Math.max(10, (slp / 10) * 100)
                          );
                          return (
                            <div
                              key={item.id}
                              className="flex flex-1 flex-col items-center group min-w-[16px]"
                            >
                              <div
                                className="w-full bg-indigo-500/70 rounded-t hover:bg-indigo-400 transition-colors"
                                style={{ height: `${heightPct}%` }}
                                title={`${item.date}: ${slp} hours`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Water Trend */}
                    <div className="rounded-lg border border-xeoo-border bg-xeoo-bg p-2.5 space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1 text-sky-400 text-[11px]">
                          <Droplets className="h-3 w-3" />
                          Water (L)
                        </span>
                        {stats && (
                          <span className="text-[10px] text-xeoo-muted font-mono font-normal">
                            Avg: {stats.avgWaterL}L
                          </span>
                        )}
                      </div>
                      <div className="h-12 flex items-end gap-1 pt-1">
                        {chronologicalEntries.map((item) => {
                          const w = item.waterMl || 0;
                          const heightPct = Math.min(
                            100,
                            Math.max(10, (w / 3500) * 100)
                          );
                          return (
                            <div
                              key={item.id}
                              className="flex flex-1 flex-col items-center group min-w-[16px]"
                            >
                              <div
                                className="w-full bg-sky-500/70 rounded-t hover:bg-sky-400 transition-colors"
                                style={{ height: `${heightPct}%` }}
                                title={`${item.date}: ${(w / 1000).toFixed(1)} L`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-24 flex-col items-center justify-center text-xs text-xeoo-muted">
                  <Activity className="h-5 w-5 opacity-40 mb-1" />
                  <p>No health logs recorded for this timeframe.</p>
                </div>
              )}
            </div>

            {/* RECENT LOG ENTRIES TABLE */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 sm:p-4 shadow-xs space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-xeoo-text flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-xeoo-primary" />
                History Table
              </span>

              {filteredEntries.length > 0 ? (
                <div className="overflow-x-auto max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-xeoo-border text-xeoo-muted text-[11px]">
                        <th className="py-1.5 px-2">Date</th>
                        <th className="py-1.5 px-2">Weight</th>
                        <th className="py-1.5 px-2">Sleep</th>
                        <th className="py-1.5 px-2">Steps</th>
                        <th className="py-1.5 px-2">Water</th>
                        <th className="py-1.5 px-2">HR</th>
                        <th className="py-1.5 px-2">Mood</th>
                        <th className="py-1.5 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-xeoo-border/60">
                      {filteredEntries.map((e) => {
                        const moodObj = MOOD_OPTIONS.find(
                          (m) => m.level === e.mood
                        );
                        return (
                          <tr
                            key={e.id}
                            className="hover:bg-xeoo-surface-soft transition-colors"
                          >
                            <td className="py-1.5 px-2 font-mono font-medium text-xeoo-text whitespace-nowrap">
                              {e.date}
                            </td>
                            <td className="py-1.5 px-2 font-mono">
                              {e.weightKg ? `${e.weightKg} kg` : "-"}
                            </td>
                            <td className="py-1.5 px-2 font-mono">
                              {e.sleepHours ? `${e.sleepHours}h` : "-"}
                            </td>
                            <td className="py-1.5 px-2 font-mono">
                              {e.steps ? e.steps.toLocaleString() : "-"}
                            </td>
                            <td className="py-1.5 px-2 font-mono">
                              {e.waterMl
                                ? `${(e.waterMl / 1000).toFixed(1)}L`
                                : "-"}
                            </td>
                            <td className="py-1.5 px-2 font-mono">
                              {e.restingHr ? `${e.restingHr}` : "-"}
                            </td>
                            <td className="py-1.5 px-2">
                              {moodObj ? (
                                <span title={moodObj.label}>
                                  {moodObj.emoji}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="py-1.5 px-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteEntry(e.id)}
                                className="text-xeoo-muted hover:text-xeoo-danger transition-colors"
                                title="Delete entry"
                              >
                                <Trash2 className="h-3 w-3 inline" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-xeoo-muted">No logs recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
