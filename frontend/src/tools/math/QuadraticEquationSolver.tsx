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

export default function QuadraticEquationSolver() {
  const [coeffA, setCoeffA] = useState("1");
  const [coeffB, setCoeffB] = useState("-5");
  const [coeffC, setCoeffC] = useState("6");

  const [result, setResult] = useState<{
    a: number;
    b: number;
    c: number;
    discriminant: number;
    nature: string;
    root1Str: string;
    root2Str: string;
    vertex: { x: number; y: number };
    opensUpward: boolean;
    steps: string[];
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Quadratic Equation Solver - XeooTools";
    const canonicalId = "canonical-quadratic-equation-solver";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = "https://xeootools.site.je/tools/quadratic-equation-solver";
  }, []);

  const handleCalculate = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setCopied(false);

    const a = parseFloat(coeffA.trim());
    const b = parseFloat(coeffB.trim());
    const c = parseFloat(coeffC.trim());

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      setError("Please enter valid numeric coefficients for a, b, and c.");
      setResult(null);
      return;
    }

    if (a === 0) {
      setError("In a quadratic equation (ax² + bx + c = 0), coefficient 'a' cannot be 0.");
      setResult(null);
      return;
    }

    const d = b * b - 4 * a * c;
    const steps: string[] = [];

    steps.push(`Equation: (${a})x² + (${b})x + (${c}) = 0`);
    steps.push(`Calculate Discriminant D = b² - 4ac:`);
    steps.push(`D = (${b})² - 4(${a})(${c}) = ${b * b} - (${4 * a * c}) = ${d}`);

    let nature = "";
    let root1Str = "";
    let root2Str = "";

    if (d > 0) {
      nature = "Two distinct real roots (D > 0)";
      const sqrtD = Math.sqrt(d);
      const r1 = (-b + sqrtD) / (2 * a);
      const r2 = (-b - sqrtD) / (2 * a);

      root1Str = `x₁ = ${formatFloat(r1, 6)}`;
      root2Str = `x₂ = ${formatFloat(r2, 6)}`;

      steps.push(`x = (-b ± √D) / 2a`);
      steps.push(`x₁ = (-(${b}) + √${d}) / (2 × ${a}) = ${formatFloat(r1, 6)}`);
      steps.push(`x₂ = (-(${b}) - √${d}) / (2 × ${a}) = ${formatFloat(r2, 6)}`);
    } else if (d === 0) {
      nature = "One repeated real root (D = 0)";
      const r = -b / (2 * a);
      root1Str = `x = ${formatFloat(r, 6)}`;
      root2Str = `(Double root / multiplicity 2)`;

      steps.push(`x = -b / 2a = -(${b}) / (2 × ${a}) = ${formatFloat(r, 6)}`);
    } else {
      nature = "Two complex conjugate roots (D < 0)";
      const realPart = -b / (2 * a);
      const imagPart = Math.sqrt(Math.abs(d)) / (2 * Math.abs(a));

      root1Str = `x₁ = ${formatFloat(realPart, 4)} + ${formatFloat(imagPart, 4)}i`;
      root2Str = `x₂ = ${formatFloat(realPart, 4)} - ${formatFloat(imagPart, 4)}i`;

      steps.push(`x = (-b ± i√|D|) / 2a`);
      steps.push(`Real part = -(${b}) / (2 × ${a}) = ${formatFloat(realPart, 4)}`);
      steps.push(`Imaginary part = √${Math.abs(d)} / (2 × |${a}|) = ${formatFloat(imagPart, 4)}`);
    }

    const vx = -b / (2 * a);
    const vy = c - (b * b) / (4 * a);

    setResult({
      a,
      b,
      c,
      discriminant: d,
      nature,
      root1Str,
      root2Str,
      vertex: { x: vx, y: vy },
      opensUpward: a > 0,
      steps,
    });
  };

  const handleReset = () => {
    setCoeffA("1");
    setCoeffB("-5");
    setCoeffC("6");
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Quadratic Equation: ${result.a}x² + ${result.b}x + ${result.c} = 0\nDiscriminant: ${result.discriminant}\nRoots: ${result.root1Str}, ${result.root2Str}\nVertex: (${formatFloat(result.vertex.x, 4)}, ${formatFloat(result.vertex.y, 4)})`;
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
                x²
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-xeoo-muted">
                  Math Tools
                </p>
                <h1 className="text-xl font-bold tracking-tight text-xeoo-text">
                  Quadratic Equation Solver
                </h1>
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-xeoo-muted">
              Solve quadratic equations (ax² + bx + c = 0) with discriminant calculation, real & complex roots, and vertex coordinates.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleCalculate}
            className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-6 shadow-xl"
          >
            <p className="text-xs font-semibold text-xeoo-muted mb-3 text-center uppercase tracking-wider">
              Standard Form: ax² + bx + c = 0
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {/* Coefficient a */}
              <div className="w-20 sm:w-28">
                <label className="block text-xs font-semibold text-xeoo-muted mb-1 text-center">
                  Coeff a (≠ 0)
                </label>
                <input
                  type="number"
                  step="any"
                  value={coeffA}
                  onChange={(e) => setCoeffA(e.target.value)}
                  placeholder="1"
                  className="w-full text-center rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2 px-2 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  required
                />
              </div>

              <span className="text-xl font-bold text-xeoo-primary mt-5">x² +</span>

              {/* Coefficient b */}
              <div className="w-20 sm:w-28">
                <label className="block text-xs font-semibold text-xeoo-muted mb-1 text-center">
                  Coeff b
                </label>
                <input
                  type="number"
                  step="any"
                  value={coeffB}
                  onChange={(e) => setCoeffB(e.target.value)}
                  placeholder="-5"
                  className="w-full text-center rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2 px-2 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  required
                />
              </div>

              <span className="text-xl font-bold text-xeoo-primary mt-5">x +</span>

              {/* Constant c */}
              <div className="w-20 sm:w-28">
                <label className="block text-xs font-semibold text-xeoo-muted mb-1 text-center">
                  Const c
                </label>
                <input
                  type="number"
                  step="any"
                  value={coeffC}
                  onChange={(e) => setCoeffC(e.target.value)}
                  placeholder="6"
                  className="w-full text-center rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2 px-2 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  required
                />
              </div>

              <span className="text-xl font-bold text-xeoo-muted mt-5">= 0</span>
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
                Find Roots
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
                  Quadratic Roots & Properties
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

              {/* Roots Display */}
              <div className="my-4 text-center rounded-xl border border-xeoo-primary/20 bg-xeoo-primary/5 p-4">
                <p className="text-xs font-semibold text-xeoo-muted uppercase tracking-wider">
                  Roots ({result.nature})
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-xeoo-primary">
                    {result.root1Str}
                  </span>
                  <span className="hidden sm:inline text-xeoo-muted">and</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-xeoo-primary">
                    {result.root2Str}
                  </span>
                </div>
              </div>

              {/* Discriminant & Vertex */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                  <p className="text-xs text-xeoo-muted">Discriminant (D = b² - 4ac)</p>
                  <p className="text-xl font-bold text-xeoo-text mt-1">{result.discriminant}</p>
                </div>

                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                  <p className="text-xs text-xeoo-muted">Parabola Vertex (h, k)</p>
                  <p className="text-xl font-bold text-xeoo-text mt-1">
                    ({formatFloat(result.vertex.x, 3)}, {formatFloat(result.vertex.y, 3)})
                  </p>
                  <p className="text-xs text-xeoo-muted mt-0.5">
                    Opens {result.opensUpward ? "Upward (Minimum)" : "Downward (Maximum)"}
                  </p>
                </div>
              </div>

              {/* Derivation Steps */}
              <div className="mt-4 rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3">
                <p className="text-xs font-semibold text-xeoo-muted mb-2">Step-by-Step Derivation:</p>
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

