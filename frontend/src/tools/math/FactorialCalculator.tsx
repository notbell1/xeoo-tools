import {
  Calculator,
  Check,
  Copy,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function FactorialCalculator() {
  const [inputVal, setInputVal] = useState("5");

  const [result, setResult] = useState<{
    n: number;
    exactStr: string;
    digitCount: number;
    trailingZeros: number;
    scientific?: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Factorial Calculator - XeooTools";
    const canonicalId = "canonical-factorial-calculator";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = "https://xeootools.site.je/tools/factorial-calculator";
  }, []);

  // Trailing zeros formula: sum(floor(n / 5^k))
  const countTrailingZeros = (n: number): number => {
    let zeros = 0;
    for (let p = 5; Math.floor(n / p) >= 1; p *= 5) {
      zeros += Math.floor(n / p);
    }
    return zeros;
  };

  const handleCalculate = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setCopied(false);

    const trimmed = inputVal.trim();
    if (!trimmed) {
      setError("Please enter a non-negative integer (e.g. 5).");
      setResult(null);
      return;
    }

    const n = Number(trimmed);
    if (!Number.isInteger(n)) {
      setError("Input must be a whole integer.");
      setResult(null);
      return;
    }

    if (n < 0) {
      setError("Factorial is not defined for negative integers. Please enter n ≥ 0.");
      setResult(null);
      return;
    }

    if (n > 1000) {
      setError("Maximum supported input is 1000 to prevent browser UI freezing.");
      setResult(null);
      return;
    }

    try {
      let fact = 1n;
      for (let i = 2n; i <= BigInt(n); i++) {
        fact *= i;
      }

      const exactStr = fact.toString();
      const digitCount = exactStr.length;
      const trailingZeros = countTrailingZeros(n);

      let scientific: string | undefined;
      if (digitCount > 15) {
        const leading = exactStr.slice(0, 5);
        const exp = digitCount - 1;
        scientific = `${leading[0]}.${leading.slice(1)} × 10^${exp}`;
      }

      setResult({
        n,
        exactStr,
        digitCount,
        trailingZeros,
        scientific,
      });
    } catch {
      setError("Calculation failed due to numerical overflow.");
      setResult(null);
    }
  };

  const handleReset = () => {
    setInputVal("5");
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `${result.n}! = ${result.exactStr}`;
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
                <Sparkles className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-xeoo-muted">
                  Math Tools
                </p>
                <h1 className="text-xl font-bold tracking-tight text-xeoo-text">
                  Factorial Calculator
                </h1>
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-xeoo-muted">
              Compute precise factorials (n!) using high-precision BigInt arithmetic with digit count and trailing zero analysis.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleCalculate}
            className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-6 shadow-xl"
          >
            <div>
              <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                Non-Negative Integer (n)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  required
                />
                <span className="text-2xl font-bold text-xeoo-muted">!</span>
              </div>
              <p className="mt-1 text-xs text-xeoo-muted">
                Input range: 0 to 1,000. Examples:{" "}
                <button
                  type="button"
                  onClick={() => setInputVal("0")}
                  className="text-xeoo-primary hover:underline cursor-pointer"
                >
                  0!
                </button>
                ,{" "}
                <button
                  type="button"
                  onClick={() => setInputVal("5")}
                  className="text-xeoo-primary hover:underline cursor-pointer"
                >
                  5!
                </button>
                ,{" "}
                <button
                  type="button"
                  onClick={() => setInputVal("20")}
                  className="text-xeoo-primary hover:underline cursor-pointer"
                >
                  20!
                </button>
                ,{" "}
                <button
                  type="button"
                  onClick={() => setInputVal("50")}
                  className="text-xeoo-primary hover:underline cursor-pointer"
                >
                  50!
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
                Calculate Factorial
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 rounded-xl border border-xeoo-border bg-xeoo-surface-soft px-4 py-2.5 text-sm font-medium text-xeoo-text hover:bg-xeoo-surface transition-colors cursor-pointer"
              >
                <RotateCcw className="size-4" />
                Reset
              </button>
            </div>
          </form>

          {/* Results */}
          {result && (
            <div className="mt-4 rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-xeoo-border pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-xeoo-muted">
                  Result: {result.n}!
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
                      <span>Copy Exact</span>
                    </>
                  )}
                </button>
              </div>

              {/* Exact output box with scroll if long */}
              <div className="my-4 rounded-xl border border-xeoo-primary/20 bg-xeoo-primary/5 p-4 text-center">
                <p className="text-xs font-semibold text-xeoo-muted uppercase tracking-wider">
                  Exact Value
                </p>
                <div className="max-h-36 overflow-y-auto mt-2 p-1">
                  <p className="font-mono text-lg sm:text-2xl font-bold text-xeoo-primary break-all">
                    {result.exactStr}
                  </p>
                </div>
                {result.scientific && (
                  <p className="mt-2 text-xs sm:text-sm font-mono text-xeoo-muted">
                    Scientific Approximation: {result.scientific}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                  <p className="text-xs text-xeoo-muted">Number of Digits</p>
                  <p className="text-xl font-bold text-xeoo-text mt-0.5">
                    {result.digitCount.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                  <p className="text-xs text-xeoo-muted">Trailing Zeros</p>
                  <p className="text-xl font-bold text-xeoo-text mt-0.5">
                    {result.trailingZeros.toLocaleString()}
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

