export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodOption {
  level: MoodLevel;
  label: string;
  emoji: string;
  badgeClass: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    level: 1,
    label: "Very Low",
    emoji: "😞",
    badgeClass: "bg-rose-500/15 text-rose-500 border-rose-500/30",
  },
  {
    level: 2,
    label: "Low",
    emoji: "🙁",
    badgeClass: "bg-orange-500/15 text-orange-500 border-orange-500/30",
  },
  {
    level: 3,
    label: "Neutral",
    emoji: "😐",
    badgeClass: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  },
  {
    level: 4,
    label: "Good",
    emoji: "🙂",
    badgeClass: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  },
  {
    level: 5,
    label: "Very Good",
    emoji: "😄",
    badgeClass: "bg-sky-500/15 text-sky-500 border-sky-500/30",
  },
];

export interface HealthMetricEntry {
  id: string; // Unique ID (e.g. timestamp or date string)
  date: string; // YYYY-MM-DD
  weightKg?: number;
  sleepHours?: number; // Total hours as decimal (e.g. 7.5)
  sleepHoursPart?: number;
  sleepMinutesPart?: number;
  waterMl?: number;
  steps?: number;
  restingHr?: number;
  exerciseMinutes?: number;
  mood?: MoodLevel;
  notes?: string;
  createdAt: number;
}

export const STORAGE_KEY = "xeoo_health_metrics_v1";

/**
 * Loads entries from localStorage
 */
export function loadHealthMetricsFromStorage(): HealthMetricEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => b.date.localeCompare(a.date));
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Saves entries to localStorage
 */
export function saveHealthMetricsToStorage(entries: HealthMetricEntry[]): boolean {
  try {
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate imported JSON data
 */
export function validateImportedMetricsJson(
  data: unknown
): { valid: boolean; entries: HealthMetricEntry[]; error?: string } {
  if (!Array.isArray(data)) {
    return {
      valid: false,
      entries: [],
      error: "JSON root must be an array of health entries.",
    };
  }

  const validEntries: HealthMetricEntry[] = [];

  for (const item of data) {
    if (typeof item !== "object" || item === null) continue;
    const entry = item as Record<string, unknown>;

    if (typeof entry.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
      continue;
    }

    const cleanEntry: HealthMetricEntry = {
      id: typeof entry.id === "string" ? entry.id : `metric_${Date.now()}_${Math.random()}`,
      date: entry.date,
      weightKg: typeof entry.weightKg === "number" && entry.weightKg > 0 ? entry.weightKg : undefined,
      sleepHours: typeof entry.sleepHours === "number" && entry.sleepHours >= 0 ? entry.sleepHours : undefined,
      sleepHoursPart: typeof entry.sleepHoursPart === "number" ? entry.sleepHoursPart : undefined,
      sleepMinutesPart: typeof entry.sleepMinutesPart === "number" ? entry.sleepMinutesPart : undefined,
      waterMl: typeof entry.waterMl === "number" && entry.waterMl >= 0 ? entry.waterMl : undefined,
      steps: typeof entry.steps === "number" && entry.steps >= 0 ? Math.round(entry.steps) : undefined,
      restingHr: typeof entry.restingHr === "number" && entry.restingHr > 0 ? Math.round(entry.restingHr) : undefined,
      exerciseMinutes: typeof entry.exerciseMinutes === "number" && entry.exerciseMinutes >= 0 ? Math.round(entry.exerciseMinutes) : undefined,
      mood: [1, 2, 3, 4, 5].includes(entry.mood as number) ? (entry.mood as MoodLevel) : undefined,
      notes: typeof entry.notes === "string" ? entry.notes.slice(0, 500) : undefined,
      createdAt: typeof entry.createdAt === "number" ? entry.createdAt : Date.now(),
    };

    validEntries.push(cleanEntry);
  }

  if (validEntries.length === 0) {
    return {
      valid: false,
      entries: [],
      error: "No valid date-stamped health entries found in file.",
    };
  }

  return { valid: true, entries: validEntries };
}

/**
 * Filter entries for history timeframe
 */
export function filterEntriesByDays(
  entries: HealthMetricEntry[],
  days: number
): HealthMetricEntry[] {
  if (days <= 0) return entries;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  return entries.filter((e) => e.date >= cutoffStr);
}

/**
 * Generate starter sample entries for new users to immediately preview charts
 */
export function getSampleHealthMetrics(): HealthMetricEntry[] {
  const samples: HealthMetricEntry[] = [];
  const baseDate = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    samples.push({
      id: `sample_${i}`,
      date: dateStr,
      weightKg: Number((68.5 - i * 0.15 + (Math.random() * 0.4 - 0.2)).toFixed(1)),
      sleepHours: Number((7.2 + (i % 2 === 0 ? 0.6 : -0.4)).toFixed(1)),
      sleepHoursPart: 7,
      sleepMinutesPart: i % 2 === 0 ? 45 : 15,
      waterMl: 2000 + (i % 3) * 250,
      steps: 7500 + i * 400 + Math.round(Math.random() * 500),
      restingHr: 62 + (i % 2 === 0 ? 1 : -1),
      exerciseMinutes: 30 + (i % 2) * 15,
      mood: ((4 + (i % 2)) as MoodLevel),
      notes: i === 0 ? "Felt energetic today after morning jog." : undefined,
      createdAt: d.getTime(),
    });
  }

  return samples;
}

