import {
  Calculator,
  Check,
  Copy,
  RotateCcw,
  Ruler,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { formatFloat } from "./mathUtils";

type ShapeType = "square" | "rectangle" | "triangle" | "circle" | "parallelogram" | "trapezoid";

export default function PerimeterCalculator() {
  const [shape, setShape] = useState<ShapeType>("rectangle");
  const [unit, setUnit] = useState("cm");

  // Inputs
  const [side1, setSide1] = useState("10");
  const [side2, setSide2] = useState("5");
  const [side3, setSide3] = useState("6");
  const [side4, setSide4] = useState("4");

  const [result, setResult] = useState<{
    perimeter: number;
    formula: string;
    description: string;
    unit: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Perimeter Calculator - XeooTools";
    const canonicalId = "canonical-perimeter-calculator";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = "https://xeootools.site.je/tools/perimeter-calculator";
  }, []);

  const handleCalculate = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setCopied(false);

    const s1 = parseFloat(side1.trim());
    const s2 = parseFloat(side2.trim());
    const s3 = parseFloat(side3.trim());
    const s4 = parseFloat(side4.trim());

    if (isNaN(s1) || s1 <= 0) {
      setError("Please enter a valid positive value for the first dimension.");
      setResult(null);
      return;
    }

    let calculatedPerimeter = 0;
    let formula = "";
    let description = "";

    switch (shape) {
      case "square": {
        calculatedPerimeter = 4 * s1;
        formula = `P = 4 × side = 4 × ${s1} = ${calculatedPerimeter}`;
        description = `Square with side length ${s1} ${unit}`;
        break;
      }
      case "rectangle": {
        if (isNaN(s2) || s2 <= 0) {
          setError("Please enter a valid positive width.");
          return;
        }
        calculatedPerimeter = 2 * (s1 + s2);
        formula = `P = 2 × (length + width) = 2 × (${s1} + ${s2}) = ${calculatedPerimeter}`;
        description = `Rectangle with length ${s1} ${unit} and width ${s2} ${unit}`;
        break;
      }
      case "triangle": {
        if (isNaN(s2) || s2 <= 0 || isNaN(s3) || s3 <= 0) {
          setError("Please enter valid positive values for all 3 sides of the triangle.");
          return;
        }

        // Triangle inequality check: sum of any 2 sides must be greater than the third
        if (s1 + s2 <= s3 || s1 + s3 <= s2 || s2 + s3 <= s1) {
          setError("These sides violate the Triangle Inequality Theorem. The sum of any two sides must be strictly greater than the third side.");
          return;
        }

        calculatedPerimeter = s1 + s2 + s3;
        formula = `P = a + b + c = ${s1} + ${s2} + ${s3} = ${calculatedPerimeter}`;
        description = `Triangle with sides ${s1} ${unit}, ${s2} ${unit}, ${s3} ${unit}`;
        break;
      }
      case "circle": {
        calculatedPerimeter = 2 * Math.PI * s1;
        formula = `Circumference C = 2 × π × r = 2 × π × ${s1} ≈ ${formatFloat(calculatedPerimeter, 4)}`;
        description = `Circle with radius ${s1} ${unit} (Diameter: ${s1 * 2} ${unit})`;
        break;
      }
      case "parallelogram": {
        if (isNaN(s2) || s2 <= 0) {
          setError("Please enter a valid positive side b.");
          return;
        }
        calculatedPerimeter = 2 * (s1 + s2);
        formula = `P = 2 × (a + b) = 2 × (${s1} + ${s2}) = ${calculatedPerimeter}`;
        description = `Parallelogram with adjacent sides ${s1} ${unit} and ${s2} ${unit}`;
        break;
      }
      case "trapezoid": {
        if (isNaN(s2) || s2 <= 0 || isNaN(s3) || s3 <= 0 || isNaN(s4) || s4 <= 0) {
          setError("Please enter valid positive lengths for all 4 boundary sides of the trapezoid.");
          return;
        }
        calculatedPerimeter = s1 + s2 + s3 + s4;
        formula = `P = a + b + c + d = ${s1} + ${s2} + ${s3} + ${s4} = ${calculatedPerimeter}`;
        description = `Trapezoid with sides ${s1}, ${s2}, ${s3}, and ${s4} ${unit}`;
        break;
      }
    }

    setResult({
      perimeter: calculatedPerimeter,
      formula,
      description,
      unit,
    });
  };

  const handleReset = () => {
    setSide1("10");
    setSide2("5");
    setSide3("6");
    setSide4("4");
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Perimeter: ${formatFloat(result.perimeter, 4)} ${result.unit}\nFormula: ${result.formula}`;
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
                <Ruler className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-xeoo-muted">
                  Math Tools
                </p>
                <h1 className="text-xl font-bold tracking-tight text-xeoo-text">
                  Perimeter Calculator
                </h1>
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-xeoo-muted">
              Compute the boundary perimeter and circumference for squares, rectangles, triangles, circles, parallelograms, and trapezoids.
            </p>
          </div>

          {/* Shape Selector Tabs */}
          <div className="mb-4 grid grid-cols-3 sm:grid-cols-6 gap-1 rounded-xl border border-xeoo-border bg-xeoo-surface p-1">
            {(
              [
                { id: "square", label: "Square" },
                { id: "rectangle", label: "Rectangle" },
                { id: "triangle", label: "Triangle" },
                { id: "circle", label: "Circle" },
                { id: "parallelogram", label: "Parallelogram" },
                { id: "trapezoid", label: "Trapezoid" },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setShape(s.id);
                  setResult(null);
                  setError(null);
                }}
                className={`rounded-lg py-1.5 text-xs font-semibold transition-colors cursor-pointer truncate px-1 text-center ${
                  shape === s.id
                    ? "bg-xeoo-primary text-white"
                    : "text-xeoo-muted hover:text-xeoo-text"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={handleCalculate}
            className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-xeoo-muted uppercase tracking-wider">
                Shape: {shape}
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-xeoo-muted">Unit:</span>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-2 py-1 font-semibold text-xeoo-text cursor-pointer focus:outline-none"
                >
                  <option value="cm">cm</option>
                  <option value="m">m</option>
                  <option value="mm">mm</option>
                  <option value="in">in</option>
                  <option value="ft">ft</option>
                  <option value="yd">yd</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shape === "square" && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                    Side Length (s)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.0001"
                    value={side1}
                    onChange={(e) => setSide1(e.target.value)}
                    className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                    placeholder="10"
                    required
                  />
                </div>
              )}

              {shape === "rectangle" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                      Length (l)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={side1}
                      onChange={(e) => setSide1(e.target.value)}
                      className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                      placeholder="10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                      Width (w)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={side2}
                      onChange={(e) => setSide2(e.target.value)}
                      className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                      placeholder="5"
                      required
                    />
                  </div>
                </>
              )}

              {shape === "triangle" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                      Side a
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={side1}
                      onChange={(e) => setSide1(e.target.value)}
                      className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                      placeholder="3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                      Side b
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={side2}
                      onChange={(e) => setSide2(e.target.value)}
                      className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                      placeholder="4"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                      Side c
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={side3}
                      onChange={(e) => setSide3(e.target.value)}
                      className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                      placeholder="5"
                      required
                    />
                  </div>
                </>
              )}

              {shape === "circle" && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                    Radius (r)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.0001"
                    value={side1}
                    onChange={(e) => setSide1(e.target.value)}
                    className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                    placeholder="7"
                    required
                  />
                </div>
              )}

              {shape === "parallelogram" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                      Side a
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={side1}
                      onChange={(e) => setSide1(e.target.value)}
                      className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                      placeholder="8"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                      Side b
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={side2}
                      onChange={(e) => setSide2(e.target.value)}
                      className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                      placeholder="5"
                      required
                    />
                  </div>
                </>
              )}

              {shape === "trapezoid" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                      Side a
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={side1}
                      onChange={(e) => setSide1(e.target.value)}
                      className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                      placeholder="6"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                      Side b
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={side2}
                      onChange={(e) => setSide2(e.target.value)}
                      className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                      placeholder="10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                      Side c
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={side3}
                      onChange={(e) => setSide3(e.target.value)}
                      className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                      placeholder="5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                      Side d
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={side4}
                      onChange={(e) => setSide4(e.target.value)}
                      className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                      placeholder="5"
                      required
                    />
                  </div>
                </>
              )}
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
                Calculate Perimeter
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
                  Perimeter Result
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

              {/* Main Perimeter */}
              <div className="my-4 text-center rounded-xl border border-xeoo-primary/20 bg-xeoo-primary/5 p-4">
                <p className="text-xs font-semibold text-xeoo-muted uppercase tracking-wider">
                  Total Perimeter / Circumference
                </p>
                <p className="text-3xl font-extrabold text-xeoo-primary tracking-tight mt-1">
                  {formatFloat(result.perimeter, 4)} {result.unit}
                </p>
                <p className="text-xs text-xeoo-muted mt-1">{result.description}</p>
              </div>

              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3">
                <p className="text-xs font-semibold text-xeoo-muted mb-1">Formula Applied:</p>
                <p className="font-mono text-xs sm:text-sm text-xeoo-text-soft">
                  {result.formula}
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

