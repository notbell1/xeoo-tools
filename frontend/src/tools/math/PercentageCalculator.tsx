import { Percent } from "lucide-react";
import { useMemo, useState } from "react";

import Footer from "../../components/Footer";
import Header from "../../components/Header";

import {
  calculateIncreaseDecrease,
  calculatePercentageChange,
  calculatePercentageOf,
  calculateWhatPercentage,
  type PercentageMode,
} from "./percentageLogic";

type Mode = {
  value: PercentageMode;
  label: string;
};

const MODES: Mode[] = [
  {
    value: "of",
    label: "Percentage of",
  },
  {
    value: "what",
    label: "What percentage?",
  },
  {
    value: "change",
    label: "Percentage change",
  },
  {
    value: "increase",
    label: "Increase / decrease",
  },
];

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  const absolute = Math.abs(value);

  if (absolute >= 1e12 || (absolute > 0 && absolute < 1e-10)) {
    return value.toExponential(8).replace(".", ",");
  }

  return new Intl.NumberFormat("id-ID", {
    useGrouping: true,
    maximumFractionDigits: 10,
  }).format(value);
}

function parseInput(value: string): number {
  const cleaned = value.trim().replace(/\s/g, "");

  if (!cleaned) {
    return 0;
  }

  const lastComma = cleaned.lastIndexOf(",");

  const lastDot = cleaned.lastIndexOf(".");

  if (lastComma !== -1 && lastDot !== -1) {
    const decimalSeparator = lastComma > lastDot ? "," : ".";

    const groupingSeparator = decimalSeparator === "," ? "." : ",";

    return Number(
      cleaned
        .replace(new RegExp(`\\${groupingSeparator}`, "g"), "")
        .replace(decimalSeparator, "."),
    );
  }

  if (lastComma !== -1) {
    return Number(cleaned.replace(",", "."));
  }

  if (lastDot !== -1) {
    const pieces = cleaned.split(".");

    if (pieces.length === 2 && pieces[1].length <= 10) {
      return Number(cleaned);
    }

    return Number(cleaned.replace(/\./g, ""));
  }

  return Number(cleaned);
}

export default function PercentageCalculator() {
  const [mode, setMode] = useState<PercentageMode>("of");

  const [first, setFirst] = useState("");

  const [second, setSecond] = useState("");

  const [increase, setIncrease] = useState(true);

  const [result, setResult] = useState<number | null>(null);

  const [secondaryResult, setSecondaryResult] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  const activeMode = useMemo(
    () => MODES.find((item) => item.value === mode) ?? MODES[0],
    [mode],
  );

  const firstLabel =
    mode === "of"
      ? "Percentage"
      : mode === "what"
        ? "Part"
        : mode === "change"
          ? "Original value"
          : "Percentage";

  const secondLabel =
    mode === "of"
      ? "Number"
      : mode === "what"
        ? "Total"
        : mode === "change"
          ? "New value"
          : "Number";

  const firstPlaceholder =
    mode === "of"
      ? "25"
      : mode === "what"
        ? "50"
        : mode === "change"
          ? "80"
          : "15";

  const secondPlaceholder =
    mode === "of"
      ? "200"
      : mode === "what"
        ? "200"
        : mode === "change"
          ? "100"
          : "200";

  const clear = () => {
    setFirst("");
    setSecond("");
    setResult(null);
    setSecondaryResult(null);
    setError(null);
    setIncrease(true);
  };

  const handleModeChange = (nextMode: PercentageMode) => {
    setMode(nextMode);
    setResult(null);
    setSecondaryResult(null);
    setError(null);
  };

  const calculate = () => {
    const firstValue = parseInput(first);

    const secondValue = parseInput(second);

    try {
      setError(null);

      let calculation;

      if (mode === "of") {
        calculation = calculatePercentageOf(firstValue, secondValue);
      } else if (mode === "what") {
        calculation = calculateWhatPercentage(firstValue, secondValue);
      } else if (mode === "change") {
        calculation = calculatePercentageChange(firstValue, secondValue);
      } else {
        calculation = calculateIncreaseDecrease(
          secondValue,
          Math.abs(firstValue),
          increase,
        );
      }

      setResult(calculation.value);

      setSecondaryResult(calculation.secondary ?? null);
    } catch (calculationError) {
      setResult(null);
      setSecondaryResult(null);

      setError(
        calculationError instanceof Error
          ? calculationError.message
          : "Unable to calculate the result.",
      );
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-xeoo-bg text-xeoo-text lg:h-screen lg:max-h-screen lg:overflow-hidden">
      <Header />

      <main className="flex min-h-0 flex-1 items-start overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 lg:items-center lg:overflow-hidden">
        <div className="mx-auto w-full max-w-xl">
          <section className="overflow-hidden rounded-2xl border border-xeoo-border bg-xeoo-surface shadow-xl">
            <div className="p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-widest text-xeoo-muted">
                    Math Tool
                  </p>

                  <h1 className="text-lg font-bold tracking-tight text-xeoo-text">
                    Percentage Calculator
                  </h1>
                </div>

                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface-soft text-xeoo-text">
                  <Percent className="size-4" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-1 sm:grid-cols-4">
                {MODES.map((item) => {
                  const active = item.value === mode;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleModeChange(item.value)}
                      className={[
                        "min-w-0 rounded-lg px-2 py-2 text-xs font-semibold transition-colors cursor-pointer",
                        active
                          ? "bg-xeoo-surface text-xeoo-text shadow-xs"
                          : "text-xeoo-muted hover:bg-xeoo-surface/60 hover:text-xeoo-text",
                      ].join(" ")}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="min-w-0">
                  <label className="mb-1.5 block text-xs font-semibold text-xeoo-text-soft">
                    {firstLabel}
                  </label>

                  <div className="relative">
                    <input
                      value={first}
                      onChange={(event) => setFirst(event.target.value)}
                      inputMode="decimal"
                      placeholder={firstPlaceholder}
                      className="h-10 w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 text-sm text-xeoo-text outline-none placeholder:text-xeoo-muted focus:border-xeoo-primary"
                    />

                    {mode === "of" && (
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-xeoo-muted">
                        %
                      </span>
                    )}

                    {mode === "increase" && (
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-xeoo-muted">
                        %
                      </span>
                    )}
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="mb-1.5 block text-xs font-semibold text-xeoo-text-soft">
                    {secondLabel}
                  </label>

                  <input
                    value={second}
                    onChange={(event) => setSecond(event.target.value)}
                    inputMode="decimal"
                    placeholder={secondPlaceholder}
                    className="h-10 w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 text-sm text-xeoo-text outline-none placeholder:text-xeoo-muted focus:border-xeoo-primary"
                  />
                </div>
              </div>

              <div className="mt-2 h-9">
                {mode === "increase" ? (
                  <div className="flex h-full items-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-0.5">
                    <button
                      type="button"
                      onClick={() => setIncrease(true)}
                      className={[
                        "h-full flex-1 rounded-md px-2 text-xs font-semibold transition-colors cursor-pointer",
                        increase
                          ? "bg-xeoo-surface text-xeoo-text shadow-xs"
                          : "text-xeoo-muted hover:text-xeoo-text",
                      ].join(" ")}
                    >
                      Increase
                    </button>

                    <button
                      type="button"
                      onClick={() => setIncrease(false)}
                      className={[
                        "h-full flex-1 rounded-md px-2 text-xs font-semibold transition-colors cursor-pointer",
                        !increase
                          ? "bg-xeoo-surface text-xeoo-text shadow-xs"
                          : "text-xeoo-muted hover:text-xeoo-text",
                      ].join(" ")}
                    >
                      Decrease
                    </button>
                  </div>
                ) : (
                  <div className="h-full" />
                )}
              </div>

              <div className="mt-3 min-h-19 rounded-xl border border-xeoo-border bg-xeoo-surface-soft px-4 py-3">
                {error ? (
                  <div className="flex h-full min-h-12.5 items-center">
                    <p className="wrap-break-word text-xs leading-5 text-xeoo-danger">
                      {error}
                    </p>
                  </div>
                ) : result !== null ? (
                  <div className="flex h-full min-h-12.5 items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-xeoo-muted">
                        Result
                      </p>

                      <p className="mt-1 truncate text-2xl font-bold tracking-tight text-xeoo-text sm:text-3xl">
                        {formatNumber(result)}
                        {(mode === "what" || mode === "change") && (
                          <span className="ml-1 text-lg text-xeoo-muted">%</span>
                        )}
                      </p>
                    </div>

                    {secondaryResult !== null && (
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-xeoo-muted">
                          {mode === "change" ? "Difference" : "Change"}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-xeoo-text-soft">
                          {formatNumber(secondaryResult)}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-full min-h-12.5 items-center">
                    <p className="text-xs text-xeoo-muted">
                      Your result will appear here.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={clear}
                  className="h-10 rounded-lg border border-xeoo-border bg-xeoo-surface text-sm font-semibold text-xeoo-text transition hover:bg-xeoo-surface-soft cursor-pointer"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={calculate}
                  className="h-10 rounded-lg border border-xeoo-primary bg-xeoo-primary text-sm font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:bg-xeoo-primary cursor-pointer"
                >
                  Calculate
                </button>
              </div>
            </div>
          </section>

          <p className="mt-2 text-center text-xs text-xeoo-muted">
            {activeMode.label}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
