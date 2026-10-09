import {
  Calculator,
  Check,
  Copy,
  RotateCcw,
  Scale,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { formatFloat, gcd } from "./mathUtils";

type RatioMode = "simplify" | "solve" | "scale";

export default function RatioCalculator() {
  const [mode, setMode] = useState<RatioMode>("simplify");

  // Simplify inputs
  const [simpA, setSimpA] = useState("12");
  const [simpB, setSimpB] = useState("18");

  // Solve inputs: A : B = C : D (one of them is X)
  const [solveTarget, setSolveTarget] = useState<"A" | "B" | "C" | "D">("D");
  const [solveA, setSolveA] = useState("2");
  const [solveB, setSolveB] = useState("3");
  const [solveC, setSolveC] = useState("10");
  const [solveD, setSolveD] = useState("15");

  // Scale inputs
  const [scaleA, setScaleA] = useState("3");
  const [scaleB, setScaleB] = useState("5");
  const [scaleFactor, setScaleFactor] = useState("4");

  const [result, setResult] = useState<{
    main: string;
    sub?: string;
    formula: string;
    details?: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Ratio Calculator - XeooTools";
    const canonicalId = "canonical-ratio-calculator";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = "https://xeootools.site.je/tools/ratio-calculator";
  }, []);

  const handleCalculate = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setCopied(false);

    if (mode === "simplify") {
      const a = parseFloat(simpA.trim());
      const b = parseFloat(simpB.trim());

      if (isNaN(a) || isNaN(b)) {
        setError("Please enter valid numbers for A and B.");
        setResult(null);
        return;
      }

      if (b === 0) {
        setError("Ratio denominator (B) cannot be zero.");
        setResult(null);
        return;
      }

      // If both are integers, we use Euclidean gcd
      if (Number.isInteger(a) && Number.isInteger(b) && a !== 0) {
        const div = gcd(Math.abs(a), Math.abs(b));
        const sa = a / div;
        const sb = b / div;
        const decimalVal = a / b;
        setResult({
          main: `${sa} : ${sb}`,
          sub: `Decimal equivalent: ${formatFloat(decimalVal, 6)} (${formatFloat((a / (a + b)) * 100, 2)}% of total)`,
          formula: `${a} : ${b} = (${a} ÷ ${div}) : (${b} ÷ ${div})`,
          details: `Greatest Common Divisor is ${div}. Both terms divided by ${div}.`,
        });
      } else {
        const decimalVal = a / b;
        setResult({
          main: `${formatFloat(a / b, 4)} : 1`,
          sub: `Decimal ratio value: ${formatFloat(decimalVal, 6)}`,
          formula: `${a} : ${b} = (${a} ÷ ${b}) : 1`,
          details: "Simplified by dividing both terms by B.",
        });
      }
    } else if (mode === "solve") {
      const a = parseFloat(solveA.trim());
      const b = parseFloat(solveB.trim());
      const c = parseFloat(solveC.trim());
      const d = parseFloat(solveD.trim());

      // A : B = C : D  =>  A * D = B * C
      if (solveTarget === "D") {
        if (isNaN(a) || isNaN(b) || isNaN(c)) {
          setError("Please enter valid numbers for A, B, and C.");
          return;
        }
        if (a === 0) {
          setError("A cannot be 0 when solving for D (division by zero).");
          return;
        }
        const valD = (b * c) / a;
        setResult({
          main: `D = ${formatFloat(valD, 6)}`,
          sub: `${a} : ${b} = ${c} : ${formatFloat(valD, 4)}`,
          formula: `D = (B × C) ÷ A = (${b} × ${c}) ÷ ${a}`,
          details: `Cross-multiplication: ${a} × D = ${b} × ${c}`,
        });
      } else if (solveTarget === "C") {
        if (isNaN(a) || isNaN(b) || isNaN(d)) {
          setError("Please enter valid numbers for A, B, and D.");
          return;
        }
        if (b === 0) {
          setError("B cannot be 0 when solving for C (division by zero).");
          return;
        }
        const valC = (a * d) / b;
        setResult({
          main: `C = ${formatFloat(valC, 6)}`,
          sub: `${a} : ${b} = ${formatFloat(valC, 4)} : ${d}`,
          formula: `C = (A × D) ÷ B = (${a} × ${d}) ÷ ${b}`,
          details: `Cross-multiplication: ${a} × ${d} = ${b} × C`,
        });
      } else if (solveTarget === "B") {
        if (isNaN(a) || isNaN(c) || isNaN(d)) {
          setError("Please enter valid numbers for A, C, and D.");
          return;
        }
        if (c === 0) {
          setError("C cannot be 0 when solving for B (division by zero).");
          return;
        }
        const valB = (a * d) / c;
        setResult({
          main: `B = ${formatFloat(valB, 6)}`,
          sub: `${a} : ${formatFloat(valB, 4)} = ${c} : ${d}`,
          formula: `B = (A × D) ÷ C = (${a} × ${d}) ÷ ${c}`,
          details: `Cross-multiplication: ${a} × ${d} = B × ${c}`,
        });
      } else {
        if (isNaN(b) || isNaN(c) || isNaN(d)) {
          setError("Please enter valid numbers for B, C, and D.");
          return;
        }
        if (d === 0) {
          setError("D cannot be 0 when solving for A (division by zero).");
          return;
        }
        const valA = (b * c) / d;
        setResult({
          main: `A = ${formatFloat(valA, 6)}`,
          sub: `${formatFloat(valA, 4)} : ${b} = ${c} : ${d}`,
          formula: `A = (B × C) ÷ D = (${b} × ${c}) ÷ ${d}`,
          details: `Cross-multiplication: A × ${d} = ${b} × ${c}`,
        });
      }
    } else {
      // Scale mode
      const a = parseFloat(scaleA.trim());
      const b = parseFloat(scaleB.trim());
      const factor = parseFloat(scaleFactor.trim());

      if (isNaN(a) || isNaN(b) || isNaN(factor)) {
        setError("Please enter valid numbers for A, B, and the scale factor.");
        return;
      }
      const sa = a * factor;
      const sb = b * factor;
      setResult({
        main: `${formatFloat(sa, 4)} : ${formatFloat(sb, 4)}`,
        sub: `Scaled from ${a} : ${b} by a factor of ${factor}`,
        formula: `(${a} × ${factor}) : (${b} × ${factor})`,
        details: `Both terms multiplied by ${factor}`,
      });
    }
  };

  const handleReset = () => {
    setSimpA("12");
    setSimpB("18");
    setSolveA("2");
    setSolveB("3");
    setSolveC("10");
    setSolveD("15");
    setScaleA("3");
    setScaleB("5");
    setScaleFactor("4");
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Result: ${result.main}\n${result.sub ? result.sub + "\n" : ""}Formula: ${result.formula}`;
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
                <Scale className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-xeoo-muted">
                  Math Tools
                </p>
                <h1 className="text-xl font-bold tracking-tight text-xeoo-text">
                  Ratio Calculator
                </h1>
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-xeoo-muted">
              Simplify ratios into lowest terms, solve proportional equations (A:B = C:D), and scale ratios accurately.
            </p>
          </div>

          {/* Mode Selector */}
          <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl border border-xeoo-border bg-xeoo-surface p-1">
            <button
              type="button"
              onClick={() => {
                setMode("simplify");
                setResult(null);
                setError(null);
              }}
              className={`rounded-lg py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                mode === "simplify"
                  ? "bg-xeoo-primary text-white"
                  : "text-xeoo-muted hover:text-xeoo-text"
              }`}
            >
              Simplify Ratio
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("solve");
                setResult(null);
                setError(null);
              }}
              className={`rounded-lg py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                mode === "solve"
                  ? "bg-xeoo-primary text-white"
                  : "text-xeoo-muted hover:text-xeoo-text"
              }`}
            >
              Solve Proportion
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("scale");
                setResult(null);
                setError(null);
              }}
              className={`rounded-lg py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                mode === "scale"
                  ? "bg-xeoo-primary text-white"
                  : "text-xeoo-muted hover:text-xeoo-text"
              }`}
            >
              Scale Ratio
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleCalculate}
            className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-6 shadow-xl"
          >
            {mode === "simplify" && (
              <div className="flex items-center justify-center gap-3">
                <div className="w-32">
                  <label className="block text-xs font-semibold text-xeoo-muted mb-1">
                    Value A
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={simpA}
                    onChange={(e) => setSimpA(e.target.value)}
                    className="w-full text-center rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-2 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                    placeholder="12"
                    required
                  />
                </div>
                <span className="text-2xl font-bold text-xeoo-muted mt-5">:</span>
                <div className="w-32">
                  <label className="block text-xs font-semibold text-xeoo-muted mb-1">
                    Value B
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={simpB}
                    onChange={(e) => setSimpB(e.target.value)}
                    className="w-full text-center rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-2 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                    placeholder="18"
                    required
                  />
                </div>
              </div>
            )}

            {mode === "solve" && (
              <div>
                <div className="mb-4 flex items-center justify-center gap-2">
                  <span className="text-xs font-semibold text-xeoo-muted">Solve For:</span>
                  {(["A", "B", "C", "D"] as const).map((tgt) => (
                    <button
                      key={tgt}
                      type="button"
                      onClick={() => setSolveTarget(tgt)}
                      className={`size-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        solveTarget === tgt
                          ? "bg-xeoo-primary text-white"
                          : "border border-xeoo-border bg-xeoo-surface-soft text-xeoo-muted hover:text-xeoo-text"
                      }`}
                    >
                      {tgt}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <div className="w-20 sm:w-24">
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1 text-center">
                      A
                    </label>
                    <input
                      type="number"
                      step="any"
                      disabled={solveTarget === "A"}
                      value={solveTarget === "A" ? "?" : solveA}
                      onChange={(e) => setSolveA(e.target.value)}
                      className={`w-full text-center rounded-lg border py-2 px-2 text-sm sm:text-base font-semibold focus:border-xeoo-primary focus:outline-none ${
                        solveTarget === "A"
                          ? "border-xeoo-primary bg-xeoo-primary/10 text-xeoo-primary font-bold"
                          : "border-xeoo-border bg-xeoo-surface-soft text-xeoo-text"
                      }`}
                    />
                  </div>
                  <span className="text-xl font-bold text-xeoo-muted mt-5">:</span>
                  <div className="w-20 sm:w-24">
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1 text-center">
                      B
                    </label>
                    <input
                      type="number"
                      step="any"
                      disabled={solveTarget === "B"}
                      value={solveTarget === "B" ? "?" : solveB}
                      onChange={(e) => setSolveB(e.target.value)}
                      className={`w-full text-center rounded-lg border py-2 px-2 text-sm sm:text-base font-semibold focus:border-xeoo-primary focus:outline-none ${
                        solveTarget === "B"
                          ? "border-xeoo-primary bg-xeoo-primary/10 text-xeoo-primary font-bold"
                          : "border-xeoo-border bg-xeoo-surface-soft text-xeoo-text"
                      }`}
                    />
                  </div>
                  <span className="text-xl font-bold text-xeoo-muted mt-5">=</span>
                  <div className="w-20 sm:w-24">
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1 text-center">
                      C
                    </label>
                    <input
                      type="number"
                      step="any"
                      disabled={solveTarget === "C"}
                      value={solveTarget === "C" ? "?" : solveC}
                      onChange={(e) => setSolveC(e.target.value)}
                      className={`w-full text-center rounded-lg border py-2 px-2 text-sm sm:text-base font-semibold focus:border-xeoo-primary focus:outline-none ${
                        solveTarget === "C"
                          ? "border-xeoo-primary bg-xeoo-primary/10 text-xeoo-primary font-bold"
                          : "border-xeoo-border bg-xeoo-surface-soft text-xeoo-text"
                      }`}
                    />
                  </div>
                  <span className="text-xl font-bold text-xeoo-muted mt-5">:</span>
                  <div className="w-20 sm:w-24">
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1 text-center">
                      D
                    </label>
                    <input
                      type="number"
                      step="any"
                      disabled={solveTarget === "D"}
                      value={solveTarget === "D" ? "?" : solveD}
                      onChange={(e) => setSolveD(e.target.value)}
                      className={`w-full text-center rounded-lg border py-2 px-2 text-sm sm:text-base font-semibold focus:border-xeoo-primary focus:outline-none ${
                        solveTarget === "D"
                          ? "border-xeoo-primary bg-xeoo-primary/10 text-xeoo-primary font-bold"
                          : "border-xeoo-border bg-xeoo-surface-soft text-xeoo-text"
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {mode === "scale" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-xeoo-muted mb-1">
                    Term A
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={scaleA}
                    onChange={(e) => setScaleA(e.target.value)}
                    className="w-full text-center rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-2 px-3 text-sm font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                    placeholder="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-xeoo-muted mb-1">
                    Term B
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={scaleB}
                    onChange={(e) => setScaleB(e.target.value)}
                    className="w-full text-center rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-2 px-3 text-sm font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                    placeholder="5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-xeoo-muted mb-1">
                    Scale Multiplier (k)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={scaleFactor}
                    onChange={(e) => setScaleFactor(e.target.value)}
                    className="w-full text-center rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-2 px-3 text-sm font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                    placeholder="4"
                    required
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs sm:text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Actions */}
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
                  Ratio Result
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

              <div className="mt-4 text-center">
                <p className="text-xs text-xeoo-muted mb-1">Resulting Ratio</p>
                <p className="text-3xl font-extrabold text-xeoo-primary tracking-tight">
                  {result.main}
                </p>
                {result.sub && (
                  <p className="mt-1 text-xs sm:text-sm text-xeoo-muted">{result.sub}</p>
                )}
              </div>

              <div className="mt-4 rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3">
                <p className="text-xs font-semibold text-xeoo-muted mb-1">Formula & Method:</p>
                <p className="font-mono text-xs sm:text-sm text-xeoo-text-soft">
                  {result.formula}
                </p>
                {result.details && (
                  <p className="font-mono text-xs text-xeoo-muted mt-1">{result.details}</p>
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

