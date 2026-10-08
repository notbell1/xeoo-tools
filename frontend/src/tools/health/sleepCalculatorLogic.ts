export type TimeFormatPreference = "12h" | "24h";

export interface DualTimeDisplay {
  time12: string; // e.g. "10:30 PM"
  time24: string; // e.g. "22:30"
  formatted: string; // e.g. "10:30 PM (22:30)" or "22:30 (10:30 PM)" based on pref
}

export interface SleepCycleOption {
  cycles: number;
  totalDurationMinutes: number;
  sleepDurationText: string;
  bedtime: DualTimeDisplay;
  qualityTag: "Optimal" | "Good" | "Minimum" | "Short";
  badgeClass: string;
  description: string;
}

export interface BedtimeCalculationResult {
  wakeTime: DualTimeDisplay;
  latencyMinutes: number;
  recommendedCycles: SleepCycleOption[];
}

export interface SleepDurationCalculationResult {
  bedtime: DualTimeDisplay;
  wakeTime: DualTimeDisplay;
  durationMinutes: number;
  hours: number;
  minutes: number;
  cyclesCompleted: number;
  evaluationText: string;
  evaluationClass: string;
}

export interface NapOption {
  name: string;
  durationMinutes: number;
  wakeTime: DualTimeDisplay;
  purpose: string;
  recommendation: string;
}

export interface NapCalculationResult {
  startTime: DualTimeDisplay;
  naps: NapOption[];
  customNap?: {
    durationMinutes: number;
    wakeTime: DualTimeDisplay;
  };
}

/**
 * Format minutes from midnight into 12h, 24h, and combined string.
 */
export function formatMinutesToDualTime(
  totalMinutes: number,
  preference: TimeFormatPreference = "12h"
): DualTimeDisplay {
  // Normalize minutes into 0..1439
  let normalized = Math.round(totalMinutes) % 1440;
  if (normalized < 0) normalized += 1440;

  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;

  // 24h format "HH:mm"
  const h24Str = hours24.toString().padStart(2, "0");
  const minStr = minutes.toString().padStart(2, "0");
  const time24 = `${h24Str}:${minStr}`;

  // 12h format "h:mm A"
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const time12 = `${hours12}:${minStr} ${ampm}`;

  const formatted =
    preference === "12h"
      ? `${time12} (${time24})`
      : `${time24} (${time12})`;

  return {
    time12,
    time24,
    formatted,
  };
}

/**
 * Parses "HH:mm" string into total minutes from midnight
 */
export function parseTimeStringToMinutes(timeStr: string): number | null {
  if (!timeStr || !timeStr.includes(":")) return null;
  const parts = timeStr.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}

/**
 * Mode 1: Calculate Bedtimes for Wake-up Time based on 90-min cycles
 */
export function calculateBedtimes(
  wakeTimeMinutes: number,
  latencyMinutes: number = 15,
  preference: TimeFormatPreference = "12h"
): BedtimeCalculationResult {
  const wakeTime = formatMinutesToDualTime(wakeTimeMinutes, preference);

  // Standard sleep cycle is 90 minutes
  // Cycles from 6 (9h) down to 3 (4.5h)
  const cyclesConfig: {
    cycles: number;
    tag: "Optimal" | "Good" | "Minimum" | "Short";
    badgeClass: string;
    description: string;
  }[] = [
    {
      cycles: 6,
      tag: "Optimal",
      badgeClass: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
      description: "9 hours of sleep. Excellent for full cognitive & athletic recovery.",
    },
    {
      cycles: 5,
      tag: "Optimal",
      badgeClass: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
      description: "7.5 hours of sleep. Recommended standard for most healthy adults.",
    },
    {
      cycles: 4,
      tag: "Good",
      badgeClass: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      description: "6 hours of sleep. Sufficient for moderate daily functionality.",
    },
    {
      cycles: 3,
      tag: "Short",
      badgeClass: "bg-rose-500/15 text-rose-500 border-rose-500/30",
      description: "4.5 hours of sleep. Minimum short sleep; not recommended as regular habit.",
    },
  ];

  const recommendedCycles: SleepCycleOption[] = cyclesConfig.map((cfg) => {
    const sleepDurationMinutes = cfg.cycles * 90;
    const bedtimeMinutes = wakeTimeMinutes - sleepDurationMinutes - latencyMinutes;
    const hours = Math.floor(sleepDurationMinutes / 60);
    const mins = sleepDurationMinutes % 60;
    const durationText = mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;

    return {
      cycles: cfg.cycles,
      totalDurationMinutes: sleepDurationMinutes,
      sleepDurationText: durationText,
      bedtime: formatMinutesToDualTime(bedtimeMinutes, preference),
      qualityTag: cfg.tag,
      badgeClass: cfg.badgeClass,
      description: cfg.description,
    };
  });

  return {
    wakeTime,
    latencyMinutes,
    recommendedCycles,
  };
}

/**
 * Mode 2: Calculate Sleep Duration from Bedtime and Wake-up time
 */
export function calculateSleepDuration(
  bedtimeMinutes: number,
  wakeTimeMinutes: number,
  preference: TimeFormatPreference = "12h"
): SleepDurationCalculationResult {
  const bedtime = formatMinutesToDualTime(bedtimeMinutes, preference);
  const wakeTime = formatMinutesToDualTime(wakeTimeMinutes, preference);

  let durationMinutes = wakeTimeMinutes - bedtimeMinutes;
  if (durationMinutes <= 0) {
    durationMinutes += 1440; // Crossed midnight
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const cyclesCompleted = Number((durationMinutes / 90).toFixed(1));

  let evaluationText = "";
  let evaluationClass = "";

  if (durationMinutes >= 420 && durationMinutes <= 540) {
    evaluationText = "Within recommended adult range (7–9 hours). Promotes restorative REM and slow-wave sleep.";
    evaluationClass = "text-xeoo-success";
  } else if (durationMinutes > 540) {
    evaluationText = "Long sleep duration (>9 hours). May indicate sleep debt recovery or oversleeping.";
    evaluationClass = "text-xeoo-info";
  } else if (durationMinutes >= 360) {
    evaluationText = "Moderate sleep duration (6–7 hours). Adequate, but closer to the lower boundary.";
    evaluationClass = "text-xeoo-warning";
  } else {
    evaluationText = "Short sleep duration (<6 hours). May accumulate cognitive fatigue and sleep debt.";
    evaluationClass = "text-xeoo-danger";
  }

  return {
    bedtime,
    wakeTime,
    durationMinutes,
    hours,
    minutes,
    cyclesCompleted,
    evaluationText,
    evaluationClass,
  };
}

/**
 * Mode 3: Calculate Nap suggested wake-up times
 */
export function calculateNaps(
  startTimeMinutes: number,
  customDurationMinutes?: number,
  preference: TimeFormatPreference = "12h"
): NapCalculationResult {
  const startTime = formatMinutesToDualTime(startTimeMinutes, preference);

  const presets: { name: string; minutes: number; purpose: string; recommendation: string }[] = [
    {
      name: "Power Nap",
      minutes: 20,
      purpose: "Quick alertness & motor performance boost",
      recommendation: "Prevents entering deep slow-wave sleep, avoiding post-nap grogginess (sleep inertia).",
    },
    {
      name: "Refresh Nap",
      minutes: 30,
      purpose: "Mental recharge & stress reduction",
      recommendation: "Provides mid-day cognitive recovery before deep sleep onset.",
    },
    {
      name: "Slow-Wave Deep Nap",
      minutes: 60,
      purpose: "Memory consolidation & factual recall",
      recommendation: "Includes restorative deep sleep. Allow 10-15 min to shake off slight post-nap grogginess.",
    },
    {
      name: "Full Cycle Nap",
      minutes: 90,
      purpose: "Complete REM & slow-wave sleep cycle",
      recommendation: "Full sleep architecture cycle. Improves creativity, emotional processing, and procedural memory without inertia.",
    },
  ];

  const naps: NapOption[] = presets.map((p) => ({
    name: p.name,
    durationMinutes: p.minutes,
    wakeTime: formatMinutesToDualTime(startTimeMinutes + p.minutes, preference),
    purpose: p.purpose,
    recommendation: p.recommendation,
  }));

  let customNap: { durationMinutes: number; wakeTime: DualTimeDisplay } | undefined;
  if (customDurationMinutes && customDurationMinutes > 0) {
    customNap = {
      durationMinutes: customDurationMinutes,
      wakeTime: formatMinutesToDualTime(startTimeMinutes + customDurationMinutes, preference),
    };
  }

  return {
    startTime,
    naps,
    customNap,
  };
}

