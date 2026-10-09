import {
  Calculator,
  Check,
  Copy,
  RotateCcw,
  Triangle,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { formatFloat } from "./mathUtils";

type CalcMode = "hypotenuse" | "leg";

export default function PythagoreanCalculator() {
  const [mode, setMode] = useState<CalcMode>("hypotenuse");

  // Inputs
  const [sideA, setSideA] = useState("3");
  const [sideB, setSideB] = useState("4");
  const [sideC, setSideC] = useState("5");

  const [result, setResult] = useState<{
    a: number;
    b: number;
    c: number;
    area: number;
    perimeter: number;
    angleA: number;
    angleB: number;
    formulaUsed: string;
    steps: string[];
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Pythagorean Calculator - XeooTools";
    const canonicalId = "canonical-pythagorean-calculator";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = "https://xeootools.site.je/tools/pythagorean-calculator";
  }, []);

  const handleCalculate = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setCopied(false);

    const steps: string[] = [];

    if (mode === "hypotenuse") {
      const a = parseFloat(sideA.trim());
      const b = parseFloat(sideB.trim());

      if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) {
        setError("Both side lengths (a and b) must be positive numbers greater than 0.");
        setResult(null);
        return;
      }

      const c = Math.sqrt(a * a + b * b);
      steps.push(`Theorem: a² + b² = c²`);
      steps.push(`c = √(a² + b²) = √(${a}² + ${b}²) = √(${a * a} + ${b * b}) = √${a * a + b * b}`);
      steps.push(`c = ${formatFloat(c, 6)}`);

      const area = 0.5 * a * b;
      const perimeter = a + b + c;
      const angleA = (Math.asin(a / c) * 180) / Math.PI;
      const angleB = 90 - angleA;

      setResult({
        a,
        b,
        c,
        area,
        perimeter,
        angleA,
        angleB,
        formulaUsed: "c = √(a² + b²)",
        steps,
      });
    } else {
      const c = parseFloat(sideC.trim());
      const a = parseFloat(sideA.trim());

      if (isNaN(c) || isNaN(a) || c <= 0 || a <= 0) {
        setError("Both hypotenuse (c) and leg (a) must be positive numbers greater than 0.");
        setResult(null);
        return;
      }

      if (c <= a) {
        setError("Hypotenuse (c) must be strictly greater than leg (a). In a right triangle, the hypotenuse is always the longest side.");
        setResult(null);
        return;
      }

      const b = Math.sqrt(c * c - a * a);
      steps.push(`Theorem: a² + b² = c²  →  b² = c² - a²`);
      steps.push(`b = √(c² - a²) = √(${c}² - ${a}²) = √(${c * c} - ${a * a}) = √${c * c - a * a}`);
      steps.push(`b = ${formatFloat(b, 6)}`);

      const area = 0.5 * a * b;
      const perimeter = a + b + c;
      const angleA = (Math.asin(a / c) * 180) / Math.PI;
      const angleB = 90 - angleA;

      setResult({
        a,
        b,
        c,
        area,
        perimeter,
        angleA,
        angleB,
        formulaUsed: "b = √(c² - a²)",
        steps,
      });
    }
  };

  const handleReset = () => {
    setSideA("3");
    setSideB("4");
    setSideC("5");
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Right Triangle:\na = ${formatFloat(result.a, 4)}, b = ${formatFloat(result.b, 4)}, c = ${formatFloat(result.c, 4)}\nArea: ${formatFloat(result.area, 4)}\nPerimeter: ${formatFloat(result.perimeter, 4)}`;
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
                <Triangle className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-xeoo-muted">
                  Math Tools
                </p>
                <h1 className="text-xl font-bold tracking-tight text-xeoo-text">
                  Pythagorean Calculator
                </h1>
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-xeoo-muted">
              Compute the hypotenuse or missing leg of a right-angled triangle using the Pythagorean theorem (a² + b² = c²).
            </p>
          </div>

          {/* Mode Selector */}
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl border border-xeoo-border bg-xeoo-surface p-1">
            <button
              type="button"
              onClick={() => {
                setMode("hypotenuse");
                setResult(null);
                setError(null);
              }}
              className={`rounded-lg py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                mode === "hypotenuse"
                  ? "bg-xeoo-primary text-white"
                  : "text-xeoo-muted hover:text-xeoo-text"
              }`}
            >
              Find Hypotenuse (c)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("leg");
                setResult(null);
                setError(null);
              }}
              className={`rounded-lg py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                mode === "leg"
                  ? "bg-xeoo-primary text-white"
                  : "text-xeoo-muted hover:text-xeoo-text"
              }`}
            >
              Find Missing Leg (b)
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleCalculate}
            className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-6 shadow-xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                  Leg (a)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.0001"
                  value={sideA}
                  onChange={(e) => setSideA(e.target.value)}
                  placeholder="3"
                  className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  required
                />
              </div>

              {mode === "hypotenuse" ? (
                <div>
                  <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                    Leg (b)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.0001"
                    value={sideB}
                    onChange={(e) => setSideB(e.target.value)}
                    placeholder="4"
                    className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                    Hypotenuse (c &gt; a)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.0001"
                    value={sideC}
                    onChange={(e) => setSideC(e.target.value)}
                    placeholder="5"
                    className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                    required
                  />
                </div>
              )}
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
                Calculate Triangle
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
                  Triangle Results
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

              {/* Primary Missing Side */}
              <div className="my-4 text-center rounded-xl border border-xeoo-primary/20 bg-xeoo-primary/5 p-4">
                <p className="text-xs font-semibold text-xeoo-muted uppercase tracking-wider">
                  {mode === "hypotenuse" ? "Calculated Hypotenuse (c)" : "Calculated Missing Leg (b)"}
                </p>
                <p className="text-3xl font-extrabold text-xeoo-primary tracking-tight mt-1">
                  {mode === "hypotenuse"
                    ? `c = ${formatFloat(result.c, 4)}`
                    : `b = ${formatFloat(result.b, 4)}`}
                </p>
                <p className="text-xs text-xeoo-muted mt-1">
                  Sides: a = {formatFloat(result.a, 3)}, b = {formatFloat(result.b, 3)}, c = {formatFloat(result.c, 3)}
                </p>
              </div>

              {/* Triangle Properties */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                  <p className="text-xs text-xeoo-muted">Area (½ab)</p>
                  <p className="text-base sm:text-lg font-bold text-xeoo-text mt-0.5">
                    {formatFloat(result.area, 3)}
                  </p>
                </div>
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                  <p className="text-xs text-xeoo-muted">Perimeter</p>
                  <p className="text-base sm:text-lg font-bold text-xeoo-text mt-0.5">
                    {formatFloat(result.perimeter, 3)}
                  </p>
                </div>
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                  <p className="text-xs text-xeoo-muted">Angle α (at b)</p>
                  <p className="text-base sm:text-lg font-bold text-xeoo-text mt-0.5">
                    {formatFloat(result.angleA, 2)}°
                  </p>
                </div>
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                  <p className="text-xs text-xeoo-muted">Angle β (at a)</p>
                  <p className="text-base sm:text-lg font-bold text-xeoo-text mt-0.5">
                    {formatFloat(result.angleB, 2)}°
                  </p>
                </div>
              </div>

              {/* Step derivation */}
              <div className="mt-4 rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3">
                <p className="text-xs font-semibold text-xeoo-muted mb-2">Step-by-Step Breakdown:</p>
                <div className="space-y-1 font-mono text-xs text-xeoo-text-soft">
                  {result.steps.map((st, i) => (
                    <p key={i}>{st}</p>
                  ))}
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

