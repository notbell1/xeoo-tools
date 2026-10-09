import {
  Calculator,
  Check,
  Copy,
  RotateCcw,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { formatFloat, simplifyFraction } from "./mathUtils";

export default function LinearEquationSolver() {
  const [coeffA, setCoeffA] = useState("2");
  const [constB, setConstB] = useState("4");
  const [constC, setConstC] = useState("10");

  const [result, setResult] = useState<{
    solutionType: "unique" | "infinite" | "none";
    xVal?: number;
    fractionStr?: string;
    equationStr: string;
    steps: string[];
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Linear Equation Solver - XeooTools";
    const canonicalId = "canonical-linear-equation-solver";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = "https://xeootools.site.je/tools/linear-equation-solver";
  }, []);

  const handleCalculate = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setCopied(false);

    const a = parseFloat(coeffA.trim());
    const b = parseFloat(constB.trim());
    const c = parseFloat(constC.trim());

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      setError("Please enter valid numeric coefficients.");
      setResult(null);
      return;
    }

    const equationStr = `${a}x ${b >= 0 ? "+ " + b : "- " + Math.abs(b)} = ${c}`;
    const steps: string[] = [];

    steps.push(`Original equation: ${equationStr}`);
    steps.push(`Subtract ${b} from both sides: ${a}x = ${c} - (${b})`);

    const rightHand = c - b;
    steps.push(`Simplify right-hand side: ${a}x = ${formatFloat(rightHand, 4)}`);

    // Special cases
    if (a === 0) {
      if (rightHand === 0) {
        steps.push(`0x = 0 is true for all real values of x.`);
        setResult({
          solutionType: "infinite",
          equationStr,
          steps,
        });
      } else {
        steps.push(`0x = ${rightHand} is a contradiction (0 cannot equal ${rightHand}).`);
        setResult({
          solutionType: "none",
          equationStr,
          steps,
        });
      }
      return;
    }

    steps.push(`Divide both sides by ${a}: x = ${formatFloat(rightHand, 4)} ÷ ${a}`);

    const xVal = rightHand / a;
    let fractionStr: string | undefined;

    if (Number.isInteger(rightHand) && Number.isInteger(a) && a !== 0) {
      try {
        const simp = simplifyFraction(rightHand, a);
        fractionStr = simp.denominator === 1 ? `${simp.numerator}` : `${simp.numerator}/${simp.denominator}`;
      } catch {
        // fallback
      }
    }

    steps.push(`Final solution: x = ${formatFloat(xVal, 6)}${fractionStr ? ` (${fractionStr})` : ""}`);

    setResult({
      solutionType: "unique",
      xVal,
      fractionStr,
      equationStr,
      steps,
    });
  };

  const handleReset = () => {
    setCoeffA("2");
    setConstB("4");
    setConstC("10");
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!result) return;
    let text = `Equation: ${result.equationStr}\n`;
    if (result.solutionType === "unique") {
      text += `x = ${formatFloat(result.xVal!, 6)}${result.fractionStr ? ` (${result.fractionStr})` : ""}`;
    } else if (result.solutionType === "infinite") {
      text += `Infinite solutions (All real numbers satisfy the equation).`;
    } else {
      text += `No solution (Contradiction).`;
    }
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
                x
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-xeoo-muted">
                  Math Tools
                </p>
                <h1 className="text-xl font-bold tracking-tight text-xeoo-text">
                  Linear Equation Solver
                </h1>
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-xeoo-muted">
              Solve single-variable linear equations of the form Ax + B = C with automated algebraic steps and edge-case detection.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleCalculate}
            className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-6 shadow-xl"
          >
            <p className="text-xs font-semibold text-xeoo-muted mb-3 text-center uppercase tracking-wider">
              Equation Template: Ax + B = C
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {/* Coefficient A */}
              <div className="w-20 sm:w-28">
                <label className="block text-xs font-semibold text-xeoo-muted mb-1 text-center">
                  Coefficient A
                </label>
                <input
                  type="number"
                  step="any"
                  value={coeffA}
                  onChange={(e) => setCoeffA(e.target.value)}
                  placeholder="2"
                  className="w-full text-center rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2 px-2 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  required
                />
              </div>

              <span className="text-xl font-bold text-xeoo-primary mt-5">x +</span>

              {/* Constant B */}
              <div className="w-20 sm:w-28">
                <label className="block text-xs font-semibold text-xeoo-muted mb-1 text-center">
                  Constant B
                </label>
                <input
                  type="number"
                  step="any"
                  value={constB}
                  onChange={(e) => setConstB(e.target.value)}
                  placeholder="4"
                  className="w-full text-center rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2 px-2 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  required
                />
              </div>

              <span className="text-xl font-bold text-xeoo-muted mt-5">=</span>

              {/* Constant C */}
              <div className="w-20 sm:w-28">
                <label className="block text-xs font-semibold text-xeoo-muted mb-1 text-center">
                  Constant C
                </label>
                <input
                  type="number"
                  step="any"
                  value={constC}
                  onChange={(e) => setConstC(e.target.value)}
                  placeholder="10"
                  className="w-full text-center rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2 px-2 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  required
                />
              </div>
            </div>

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
                Solve Equation
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
                  Solution for: {result.equationStr}
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

              {/* Main Solution Box */}
              <div className="my-4 text-center rounded-xl border border-xeoo-primary/20 bg-xeoo-primary/5 p-4">
                <p className="text-xs font-semibold text-xeoo-muted uppercase tracking-wider">
                  Result Value
                </p>
                {result.solutionType === "unique" && (
                  <>
                    <p className="text-3xl font-extrabold text-xeoo-primary tracking-tight mt-1">
                      x = {formatFloat(result.xVal!, 6)}
                    </p>
                    {result.fractionStr && (
                      <p className="text-sm font-semibold text-xeoo-text mt-1">
                        Exact fraction: {result.fractionStr}
                      </p>
                    )}
                  </>
                )}
                {result.solutionType === "infinite" && (
                  <p className="text-2xl font-bold text-amber-400 mt-1">
                    Infinite Solutions (Identity)
                  </p>
                )}
                {result.solutionType === "none" && (
                  <p className="text-2xl font-bold text-red-400 mt-1">
                    No Solution (Inconsistent / Contradiction)
                  </p>
                )}
              </div>

              {/* Steps */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3">
                <p className="text-xs font-semibold text-xeoo-muted mb-2">
                  Step-by-Step Resolution:
                </p>
                <div className="space-y-1 font-mono text-xs sm:text-sm text-xeoo-text-soft">
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

