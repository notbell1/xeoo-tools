import {
  Calculator,
  Check,
  Copy,
  Divide,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { formatFloat, gcd, simplifyFraction } from "./mathUtils";

type Operation = "add" | "subtract" | "multiply" | "divide";

export default function FractionCalculator() {
  const [num1, setNum1] = useState("1");
  const [den1, setDen1] = useState("2");
  const [operation, setOperation] = useState<Operation>("add");
  const [num2, setNum2] = useState("1");
  const [den2, setDen2] = useState("3");

  const [result, setResult] = useState<{
    rawNum: number;
    rawDen: number;
    simpNum: number;
    simpDen: number;
    decimal: number;
    mixed?: string;
    stepExplanation: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Fraction Calculator - XeooTools";
    const canonicalId = "canonical-fraction-calculator";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = "https://xeootools.site.je/tools/fraction-calculator";
  }, []);

  const handleCalculate = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setCopied(false);

    const n1 = parseInt(num1.trim(), 10);
    const d1 = parseInt(den1.trim(), 10);
    const n2 = parseInt(num2.trim(), 10);
    const d2 = parseInt(den2.trim(), 10);

    if (isNaN(n1) || isNaN(d1) || isNaN(n2) || isNaN(d2)) {
      setError("Please enter valid integers for all numerators and denominators.");
      setResult(null);
      return;
    }

    if (d1 === 0 || d2 === 0) {
      setError("Denominator cannot be 0. Division by zero is undefined.");
      setResult(null);
      return;
    }

    if (operation === "divide" && n2 === 0) {
      setError("Cannot divide by a fraction with numerator 0 (division by zero).");
      setResult(null);
      return;
    }

    let rawNum = 0;
    let rawDen = 1;
    let stepExplanation = "";

    switch (operation) {
      case "add": {
        rawNum = n1 * d2 + n2 * d1;
        rawDen = d1 * d2;
        stepExplanation = `(${n1} × ${d2} + ${n2} × ${d1}) / (${d1} × ${d2}) = ${rawNum}/${rawDen}`;
        break;
      }
      case "subtract": {
        rawNum = n1 * d2 - n2 * d1;
        rawDen = d1 * d2;
        stepExplanation = `(${n1} × ${d2} - ${n2} × ${d1}) / (${d1} × ${d2}) = ${rawNum}/${rawDen}`;
        break;
      }
      case "multiply": {
        rawNum = n1 * n2;
        rawDen = d1 * d2;
        stepExplanation = `(${n1} × ${n2}) / (${d1} × ${d2}) = ${rawNum}/${rawDen}`;
        break;
      }
      case "divide": {
        rawNum = n1 * d2;
        rawDen = d1 * n2;
        stepExplanation = `(${n1} × ${d2}) / (${d1} × ${n2}) = ${rawNum}/${rawDen}`;
        break;
      }
    }

    try {
      const simplified = simplifyFraction(rawNum, rawDen);
      const decimalVal = rawNum / rawDen;

      let mixed: string | undefined;
      if (
        simplified.mixedWhole !== undefined &&
        simplified.mixedNumerator !== undefined &&
        simplified.mixedNumerator > 0
      ) {
        mixed = `${simplified.mixedWhole} ${simplified.mixedNumerator}/${simplified.denominator}`;
      }

      setResult({
        rawNum,
        rawDen,
        simpNum: simplified.numerator,
        simpDen: simplified.denominator,
        decimal: decimalVal,
        mixed,
        stepExplanation,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error simplifying fraction");
      setResult(null);
    }
  };

  const handleReset = () => {
    setNum1("1");
    setDen1("2");
    setOperation("add");
    setNum2("1");
    setDen2("3");
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Result: ${result.simpNum}/${result.simpDen} = ${result.decimal}${
      result.mixed ? ` (Mixed: ${result.mixed})` : ""
    }`;
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
                <Divide className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-xeoo-muted">
                  Math Tools
                </p>
                <h1 className="text-xl font-bold tracking-tight text-xeoo-text">
                  Fraction Calculator
                </h1>
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-xeoo-muted">
              Add, subtract, multiply, and divide fractions with automated simplification, mixed number output, and decimal equivalents.
            </p>
          </div>

          {/* Calculator Card */}
          <form
            onSubmit={handleCalculate}
            className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-6 shadow-xl"
          >
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              {/* Fraction 1 */}
              <div className="flex flex-col items-center gap-1.5 w-28">
                <input
                  type="number"
                  value={num1}
                  onChange={(e) => setNum1(e.target.value)}
                  placeholder="Num 1"
                  className="w-full text-center rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-2 px-2 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  aria-label="Numerator 1"
                  required
                />
                <div className="h-0.5 w-full bg-xeoo-border" />
                <input
                  type="number"
                  value={den1}
                  onChange={(e) => setDen1(e.target.value)}
                  placeholder="Den 1"
                  className="w-full text-center rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-2 px-2 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  aria-label="Denominator 1"
                  required
                />
              </div>

              {/* Operation Selector */}
              <div className="flex items-center gap-1.5 rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-1">
                <button
                  type="button"
                  onClick={() => setOperation("add")}
                  className={`size-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    operation === "add"
                      ? "bg-xeoo-primary text-white"
                      : "text-xeoo-muted hover:text-xeoo-text"
                  }`}
                  aria-label="Addition"
                >
                  <Plus className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOperation("subtract")}
                  className={`size-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    operation === "subtract"
                      ? "bg-xeoo-primary text-white"
                      : "text-xeoo-muted hover:text-xeoo-text"
                  }`}
                  aria-label="Subtraction"
                >
                  <Minus className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOperation("multiply")}
                  className={`size-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    operation === "multiply"
                      ? "bg-xeoo-primary text-white"
                      : "text-xeoo-muted hover:text-xeoo-text"
                  }`}
                  aria-label="Multiplication"
                >
                  <X className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOperation("divide")}
                  className={`size-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    operation === "divide"
                      ? "bg-xeoo-primary text-white"
                      : "text-xeoo-muted hover:text-xeoo-text"
                  }`}
                  aria-label="Division"
                >
                  <Divide className="size-4" />
                </button>
              </div>

              {/* Fraction 2 */}
              <div className="flex flex-col items-center gap-1.5 w-28">
                <input
                  type="number"
                  value={num2}
                  onChange={(e) => setNum2(e.target.value)}
                  placeholder="Num 2"
                  className="w-full text-center rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-2 px-2 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  aria-label="Numerator 2"
                  required
                />
                <div className="h-0.5 w-full bg-xeoo-border" />
                <input
                  type="number"
                  value={den2}
                  onChange={(e) => setDen2(e.target.value)}
                  placeholder="Den 2"
                  className="w-full text-center rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-2 px-2 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  aria-label="Denominator 2"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs sm:text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-xeoo-primary px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-xeoo-primary/90 transition-colors cursor-pointer"
              >
                <Calculator className="size-4" />
                Calculate
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

          {/* Result Card */}
          {result && (
            <div className="mt-4 rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-xeoo-border pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-xeoo-muted">
                  Calculation Result
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

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <p className="text-xs text-xeoo-muted mb-1">Simplified Fraction</p>
                  <p className="text-2xl font-bold text-xeoo-primary">
                    {result.simpDen === 1 ? result.simpNum : `${result.simpNum}/${result.simpDen}`}
                  </p>
                </div>

                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <p className="text-xs text-xeoo-muted mb-1">Decimal Form</p>
                  <p className="text-xl font-bold text-xeoo-text">
                    {formatFloat(result.decimal, 6)}
                  </p>
                </div>

                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <p className="text-xs text-xeoo-muted mb-1">Mixed Number</p>
                  <p className="text-xl font-bold text-xeoo-text">
                    {result.mixed ? result.mixed : "N/A (Proper)"}
                  </p>
                </div>
              </div>

              {/* Step Details */}
              <div className="mt-4 rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3">
                <p className="text-xs font-semibold text-xeoo-muted mb-1">Formula & Steps:</p>
                <p className="font-mono text-xs sm:text-sm text-xeoo-text-soft">
                  {result.stepExplanation}
                </p>
                {result.rawDen !== result.simpDen && (
                  <p className="font-mono text-xs text-xeoo-muted mt-1">
                    Simplified by GCD ({gcd(result.rawNum, result.rawDen)}) → {result.simpNum}/{result.simpDen}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

