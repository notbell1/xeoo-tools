import {
  Calculator,
  Check,
  Copy,
  RotateCcw,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { formatFloat } from "./mathUtils";

// Helper to simplify radical: sqrt(n) = a * sqrt(b)
function simplifyRadical(n: number): { outside: number; inside: number } {
  if (!Number.isInteger(n) || n <= 0) return { outside: 1, inside: n };

  let outside = 1;
  let inside = n;

  for (let i = 2; i * i <= inside; i++) {
    while (inside % (i * i) === 0) {
      outside *= i;
      inside /= i * i;
    }
  }

  return { outside, inside };
}

export default function SquareRootCalculator() {
  const [inputVal, setInputVal] = useState("144");
  const [precision, setPrecision] = useState(6);

  const [result, setResult] = useState<{
    n: number;
    sqrtVal: number;
    formatted: string;
    isPerfectSquare: boolean;
    radicalForm: string;
    cubeRoot: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Square Root Calculator - XeooTools";
    const canonicalId = "canonical-square-root-calculator";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = "https://xeootools.site.je/tools/square-root-calculator";
  }, []);

  const handleCalculate = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setCopied(false);

    const trimmed = inputVal.trim();
    if (!trimmed) {
      setError("Please enter a non-negative number.");
      setResult(null);
      return;
    }

    const n = parseFloat(trimmed);
    if (isNaN(n)) {
      setError("Please enter a valid numeric value.");
      setResult(null);
      return;
    }

    if (n < 0) {
      const imagVal = Math.sqrt(Math.abs(n));
      setError(`Square root of negative numbers is not a real number. In the complex plane: √(${n}) = ${formatFloat(imagVal, precision)}i.`);
      setResult(null);
      return;
    }

    const sqrtVal = Math.sqrt(n);
    const isPerfect = Number.isInteger(sqrtVal);

    let radicalForm = "";
    if (Number.isInteger(n)) {
      const { outside, inside } = simplifyRadical(n);
      if (inside === 1) {
        radicalForm = `${outside}`;
      } else if (outside === 1) {
        radicalForm = `√${inside}`;
      } else {
        radicalForm = `${outside}√${inside}`;
      }
    } else {
      radicalForm = `√${n}`;
    }

    const cubeRoot = Math.cbrt(n);

    setResult({
      n,
      sqrtVal,
      formatted: formatFloat(sqrtVal, precision),
      isPerfectSquare: isPerfect,
      radicalForm,
      cubeRoot,
    });
  };

  const handleReset = () => {
    setInputVal("144");
    setPrecision(6);
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `√(${result.n}) = ${result.formatted} (${result.radicalForm})`;
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
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-xeoo-border bg-xeoo-surface-soft text-xeoo-primary font-bold text-lg">
                √
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-xeoo-muted">
                  Math Tools
                </p>
                <h1 className="text-xl font-bold tracking-tight text-xeoo-text">
                  Square Root Calculator
                </h1>
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-xeoo-muted">
              Compute square roots, find simplified radical expressions, and test for perfect square numbers.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleCalculate}
            className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-6 shadow-xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                  Number (n ≥ 0)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-xeoo-muted">√</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="e.g. 144 or 2"
                    className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                  Decimal Places
                </label>
                <select
                  value={precision}
                  onChange={(e) => setPrecision(Number(e.target.value))}
                  className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-sm font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none cursor-pointer"
                >
                  <option value={2}>2 decimals</option>
                  <option value={4}>4 decimals</option>
                  <option value={6}>6 decimals</option>
                  <option value={8}>8 decimals</option>
                  <option value={10}>10 decimals</option>
                </select>
              </div>
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
                Calculate Square Root
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
                  Result for √({result.n})
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
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Main Square Root */}
              <div className="my-4 text-center rounded-xl border border-xeoo-primary/20 bg-xeoo-primary/5 p-4">
                <p className="text-xs font-semibold text-xeoo-muted uppercase tracking-wider">
                  Principal Square Root
                </p>
                <p className="text-3xl font-extrabold text-xeoo-primary tracking-tight mt-1 break-all">
                  {result.formatted}
                </p>
                {result.isPerfectSquare ? (
                  <p className="mt-1 text-xs font-semibold text-emerald-400">
                    ✓ Perfect square ({result.sqrtVal}² = {result.n})
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-xeoo-muted">
                    Irrational number / non-terminating decimal
                  </p>
                )}
              </div>

              {/* Radical & Cube Root */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                  <p className="text-xs text-xeoo-muted">Simplified Radical Form</p>
                  <p className="text-xl font-bold text-xeoo-text mt-1">{result.radicalForm}</p>
                </div>

                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                  <p className="text-xs text-xeoo-muted">Cube Root ∛({result.n})</p>
                  <p className="text-xl font-bold text-xeoo-text mt-1">
                    {formatFloat(result.cubeRoot, precision)}
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

