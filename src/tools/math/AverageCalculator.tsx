import {
  Calculator,
  Check,
  Copy,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { formatFloat } from "./mathUtils";

export default function AverageCalculator() {
  const [rawInput, setRawInput] = useState("10, 20, 30, 40, 50");
  const [result, setResult] = useState<{
    count: number;
    sum: number;
    mean: number;
    median: number;
    modes: number[];
    min: number;
    max: number;
    range: number;
    variance: number;
    stdDev: number;
    sortedList: number[];
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Average Calculator - XeooTools";
    const canonicalId = "canonical-average-calculator";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = "https://xeootools.site.je/tools/average-calculator";
  }, []);

  const handleCalculate = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setCopied(false);

    if (!rawInput.trim()) {
      setError("Please enter at least one number.");
      setResult(null);
      return;
    }

    // Split by comma, whitespace, newline, semicolon
    const tokens = rawInput
      .split(/[\s,;]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (tokens.length === 0) {
      setError("Please enter valid numbers.");
      setResult(null);
      return;
    }

    const numbers: number[] = [];
    const invalidTokens: string[] = [];

    for (const tok of tokens) {
      const num = Number(tok);
      if (isNaN(num)) {
        invalidTokens.push(tok);
      } else {
        numbers.push(num);
      }
    }

    if (invalidTokens.length > 0) {
      setError(`Invalid numeric values found: "${invalidTokens.slice(0, 3).join(", ")}"${invalidTokens.length > 3 ? "..." : ""}`);
      setResult(null);
      return;
    }

    const count = numbers.length;
    const sum = numbers.reduce((acc, curr) => acc + curr, 0);
    const mean = sum / count;

    // Sorted for median, min, max
    const sorted = [...numbers].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[count - 1];
    const range = max - min;

    // Median
    let median = 0;
    const mid = Math.floor(count / 2);
    if (count % 2 === 0) {
      median = (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      median = sorted[mid];
    }

    // Mode calculation
    const frequencyMap = new Map<number, number>();
    let maxFreq = 0;
    for (const n of numbers) {
      const f = (frequencyMap.get(n) || 0) + 1;
      frequencyMap.set(n, f);
      if (f > maxFreq) maxFreq = f;
    }

    const modes: number[] = [];
    if (maxFreq > 1) {
      for (const [val, freq] of frequencyMap.entries()) {
        if (freq === maxFreq) {
          modes.push(val);
        }
      }
    }

    // Variance & StdDev (Sample)
    let variance = 0;
    if (count > 1) {
      const sqDiffSum = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
      variance = sqDiffSum / (count - 1);
    }
    const stdDev = Math.sqrt(variance);

    setResult({
      count,
      sum,
      mean,
      median,
      modes,
      min,
      max,
      range,
      variance,
      stdDev,
      sortedList: sorted,
    });
  };

  const handleReset = () => {
    setRawInput("");
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = [
      `Average (Mean): ${formatFloat(result.mean, 6)}`,
      `Median: ${formatFloat(result.median, 6)}`,
      `Mode: ${result.modes.length > 0 ? result.modes.join(", ") : "No mode"}`,
      `Count (N): ${result.count}`,
      `Sum: ${formatFloat(result.sum, 6)}`,
      `Min: ${result.min}`,
      `Max: ${result.max}`,
      `Range: ${formatFloat(result.range, 6)}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-xeoo-bg text-xeoo-text">
      <Header />

      <main className="flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto w-full max-w-2xl">
          {/* Header Card */}
          <div className="mb-4 rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-xeoo-border bg-xeoo-surface-soft text-xeoo-primary">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-xeoo-muted">
                  Math Tools
                </p>
                <h1 className="text-xl font-bold tracking-tight text-xeoo-text">
                  Average Calculator
                </h1>
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-xeoo-muted">
              Compute mean (average), median, mode, range, sum, minimum, maximum, and sample standard deviation for any dataset.
            </p>
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleCalculate}
            className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-6 shadow-xl"
          >
            <div>
              <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                Dataset (Separate numbers by commas, spaces, or new lines)
              </label>
              <textarea
                rows={4}
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="e.g. 10, 20, 30, 40, 50, 75.5"
                className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-sm text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                required
              />
              <p className="mt-1 text-xs text-xeoo-muted">
                Quick load example:{" "}
                <button
                  type="button"
                  onClick={() => setRawInput("12, 18, 25, 30, 42, 50, 65, 80")}
                  className="text-xeoo-primary hover:underline cursor-pointer"
                >
                  [12, 18, 25, 30, 42, 50, 65, 80]
                </button>
              </p>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs sm:text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-xeoo-primary px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-xeoo-primary/90 transition-colors cursor-pointer"
              >
                <Calculator className="size-4" />
                Calculate Average
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 rounded-xl border border-xeoo-border bg-xeoo-surface-soft px-4 py-2.5 text-sm font-medium text-xeoo-text hover:bg-xeoo-surface transition-colors cursor-pointer"
              >
                <RotateCcw className="size-4" />
                Clear
              </button>
            </div>
          </form>

          {/* Results */}
          {result && (
            <div className="mt-4 rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-xeoo-border pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-xeoo-muted">
                  Statistical Summary
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-2.5 py-1 text-xs font-medium text-xeoo-text hover:bg-xeoo-surface transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5 text-green-400" />
                      <span className="text-green-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copy Summary</span>
                    </>
                  )}
                </button>
              </div>

              {/* Main Mean Banner */}
              <div className="my-4 text-center rounded-xl border border-xeoo-primary/20 bg-xeoo-primary/5 p-4">
                <p className="text-xs font-semibold text-xeoo-muted uppercase tracking-wider">
                  Arithmetic Mean (Average)
                </p>
                <p className="text-3xl font-extrabold text-xeoo-primary tracking-tight mt-1">
                  {formatFloat(result.mean, 6)}
                </p>
                <p className="text-xs text-xeoo-muted mt-1">
                  Sum ({formatFloat(result.sum, 4)}) ÷ Count ({result.count})
                </p>
              </div>

              {/* Stat Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                  <p className="text-xs text-xeoo-muted">Median</p>
                  <p className="text-base sm:text-lg font-bold text-xeoo-text mt-0.5">
                    {formatFloat(result.median, 4)}
                  </p>
                </div>
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                  <p className="text-xs text-xeoo-muted">Mode</p>
                  <p className="text-base sm:text-lg font-bold text-xeoo-text mt-0.5 truncate">
                    {result.modes.length > 0 ? result.modes.join(", ") : "None"}
                  </p>
                </div>
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                  <p className="text-xs text-xeoo-muted">Count (N)</p>
                  <p className="text-base sm:text-lg font-bold text-xeoo-text mt-0.5">
                    {result.count}
                  </p>
                </div>
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                  <p className="text-xs text-xeoo-muted">Sum (Σ)</p>
                  <p className="text-base sm:text-lg font-bold text-xeoo-text mt-0.5">
                    {formatFloat(result.sum, 4)}
                  </p>
                </div>
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                  <p className="text-xs text-xeoo-muted">Minimum</p>
                  <p className="text-base sm:text-lg font-bold text-xeoo-text mt-0.5">
                    {formatFloat(result.min, 4)}
                  </p>
                </div>
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                  <p className="text-xs text-xeoo-muted">Maximum</p>
                  <p className="text-base sm:text-lg font-bold text-xeoo-text mt-0.5">
                    {formatFloat(result.max, 4)}
                  </p>
                </div>
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                  <p className="text-xs text-xeoo-muted">Range</p>
                  <p className="text-base sm:text-lg font-bold text-xeoo-text mt-0.5">
                    {formatFloat(result.range, 4)}
                  </p>
                </div>
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                  <p className="text-xs text-xeoo-muted">Std Deviation</p>
                  <p className="text-base sm:text-lg font-bold text-xeoo-text mt-0.5">
                    {result.count > 1 ? formatFloat(result.stdDev, 4) : "0"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

