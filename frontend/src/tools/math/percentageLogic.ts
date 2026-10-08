export type PercentageMode =
  | "of"
  | "what"
  | "change"
  | "increase";

export type PercentageResult = {
  value: number;
  secondary?: number;
  label: string;
};

export function calculatePercentageOf(
  percentage: number,
  value: number,
): PercentageResult {
  return {
    value: (percentage / 100) * value,
    label: `${percentage}% of ${value}`,
  };
}

export function calculateWhatPercentage(
  part: number,
  total: number,
): PercentageResult {
  if (total === 0) {
    throw new Error(
      "The total value cannot be zero.",
    );
  }

  return {
    value: (part / total) * 100,
    label: `${part} is what percentage of ${total}`,
  };
}

export function calculatePercentageChange(
  oldValue: number,
  newValue: number,
): PercentageResult {
  if (oldValue === 0) {
    throw new Error(
      "The original value cannot be zero.",
    );
  }

  const change =
    ((newValue - oldValue) / Math.abs(oldValue)) *
    100;

  return {
    value: change,
    secondary: newValue - oldValue,
    label: "Percentage change",
  };
}

export function calculateIncreaseDecrease(
  value: number,
  percentage: number,
  increase: boolean,
): PercentageResult {
  const change =
    (percentage / 100) * value;

  return {
    value: increase
      ? value + change
      : value - change,
    secondary: change,
    label: increase
      ? `${percentage}% increase`
      : `${percentage}% decrease`,
  };
}