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
import { formatFloat } from "./mathUtils";

export default function ExponentCalculator() {
  const [baseInput, setBaseInput] = useState("2");
  const [expInput, setExpInput] = useState("8");

  const [result, setResult] = useState<{
    base: number;
    exp: number;
    value: number;
    formatted: string;
    scientific?: string;
    explanation: string;
    fractionalRep?: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Exponent Calculator - XeooTools";
    const canonicalId = "canonical-exponent-calculator";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = "https://xeootools.site.je/tools/exponent-calculator";
  }, []);

  const handleCalculate = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setCopied(false);

    const b = parseFloat(baseInput.trim());
    const x = parseFloat(expInput.trim());

    if (isNaN(b) || isNaN(x)) {
      setError("Please enter valid numbers for both base and exponent.");
      setResult(null);
      return;
    }

    if (b === 0 && x < 0) {
      setError("Division by zero: 0 raised to a negative exponent (1 / 0^n) is undefined.");
      setResult(null);
      return;
    }

    // Negative base with non-integer exponent produces a complex number
    if (b < 0 && !Number.isInteger(x)) {
      setError(`A negative base (${b}) raised to a fractional exponent (${x}) results in a complex/imaginary number.`);
      setResult(null);
      return;
    }

    const val = Math.pow(b, x);

    if (!isFinite(val)) {
      setError("Result exceeded standard floating-point limits (Infinity / Numerical Overflow).");
      setResult(null);
      return;
    }

    let explanation = "";
    let fractionalRep: string | undefined;

    if (x === 0) {
      explanation = `Any non-zero number to the power of 0 equals 1: ${b}⁰ = 1.`;
    } else if (x === 1) {
      explanation = `Any number to the power of 1 is itself: ${b}¹ = ${b}.`;
    } else if (x < 0) {
      const posPower = Math.pow(b, -x);
      explanation = `Negative exponent rule: ${b}^(${x}) = 1 / (${b}^${-x}) = 1 / ${formatFloat(posPower, 4)} = ${formatFloat(val, 8)}.`;
      fractionalRep = `1 / ${formatFloat(posPower, 4)}`;
    } else if (x === 0.5) {
      explanation = `Power of 0.5 is equivalent to the square root: √(${b}) = ${formatFloat(val, 8)}.`;
    } else {
      explanation = `${b} multiplied by itself ${x} times equals ${formatFloat(val, 8)}.`;
    }

    let scientific: string | undefined;
    if (Math.abs(val) >= 1e9 || (Math.abs(val) > 0 && Math.abs(val) <= 1e-4)) {
      scientific = val.toExponential(6);
    }

    setResult({
      base: b,
      exp: x,
      value: val,
      formatted: formatFloat(val, 8),
      scientific,
      explanation,
      fractionalRep,
    });
  };

  const handleReset = () => {
    setBaseInput("2");
    setExpInput("8");
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `${result.base}^${result.exp} = ${result.formatted}`;
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
                  Exponent Calculator
                </h1>
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-xeoo-muted">
              Calculate base raised to any power (b^x) with support for negative, fractional, and zero exponents.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleCalculate}
            className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-6 shadow-xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                  Base (b)
                </label>
                <input
                  type="number"
                  step="any"
                  value={baseInput}
                  onChange={(e) => setBaseInput(e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                  Exponent / Power (x)
                </label>
                <input
                  type="number"
                  step="any"
                  value={expInput}
                  onChange={(e) => setExpInput(e.target.value)}
                  placeholder="e.g. 8 or -2"
                  className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Quick Exponent Presets */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-xeoo-muted mr-1">Quick powers:</span>
              {[
                { label: "x²", val: "2" },
                { label: "x³", val: "3" },
                { label: "x⁻¹", val: "-1" },
                { label: "x⁻²", val: "-2" },
                { label: "√x (0.5)", val: "0.5" },
                { label: "0", val: "0" },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setExpInput(p.val)}
                  className="rounded-md border border-xeoo-border bg-xeoo-surface-soft px-2 py-0.5 text-xeoo-text hover:bg-xeoo-surface cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
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
                Calculate Exponent
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
                  Result: {result.base}^{result.exp}
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

              <div className="my-4 text-center rounded-xl border border-xeoo-primary/20 bg-xeoo-primary/5 p-4">
                <p className="text-xs font-semibold text-xeoo-muted uppercase tracking-wider">
                  Power Result
                </p>
                <p className="text-3xl font-extrabold text-xeoo-primary tracking-tight mt-1 break-all">
                  {result.formatted}
                </p>
                {result.fractionalRep && (
                  <p className="text-sm font-semibold text-xeoo-text mt-1">
                    Fractional representation: {result.fractionalRep}
                  </p>
                )}
                {result.scientific && (
                  <p className="text-xs font-mono text-xeoo-muted mt-1">
                    Scientific: {result.scientific}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3">
                <p className="text-xs font-semibold text-xeoo-muted mb-1">Step-by-Step Explanation:</p>
                <p className="text-xs sm:text-sm text-xeoo-text-soft">
                  {result.explanation}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

