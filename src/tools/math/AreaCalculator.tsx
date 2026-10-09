import {
  Calculator,
  Check,
  Copy,
  RotateCcw,
  Square,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { formatFloat } from "./mathUtils";

type ShapeType = "square" | "rectangle" | "triangle" | "circle" | "parallelogram" | "trapezoid";

export default function AreaCalculator() {
  const [shape, setShape] = useState<ShapeType>("rectangle");
  const [unit, setUnit] = useState("cm");

  // Inputs
  const [dim1, setDim1] = useState("10"); // side / length / base / radius
  const [dim2, setDim2] = useState("5");  // width / height / base2
  const [dim3, setDim3] = useState("4");  // height for trapezoid

  const [result, setResult] = useState<{
    area: number;
    formula: string;
    description: string;
    unit: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Area Calculator - XeooTools";
    const canonicalId = "canonical-area-calculator";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = "https://xeootools.site.je/tools/area-calculator";
  }, []);

  const handleCalculate = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setCopied(false);

    const val1 = parseFloat(dim1.trim());
    const val2 = parseFloat(dim2.trim());
    const val3 = parseFloat(dim3.trim());

    if (isNaN(val1) || val1 <= 0) {
      setError("Please enter a valid positive measurement for the first dimension.");
      setResult(null);
      return;
    }

    let calculatedArea = 0;
    let formula = "";
    let description = "";

    switch (shape) {
      case "square": {
        calculatedArea = val1 * val1;
        formula = `A = s² = ${val1}² = ${calculatedArea}`;
        description = `Square with side ${val1} ${unit}`;
        break;
      }
      case "rectangle": {
        if (isNaN(val2) || val2 <= 0) {
          setError("Please enter a valid positive width.");
          return;
        }
        calculatedArea = val1 * val2;
        formula = `A = length × width = ${val1} × ${val2} = ${calculatedArea}`;
        description = `Rectangle with length ${val1} ${unit} and width ${val2} ${unit}`;
        break;
      }
      case "triangle": {
        if (isNaN(val2) || val2 <= 0) {
          setError("Please enter a valid positive height.");
          return;
        }
        calculatedArea = 0.5 * val1 * val2;
        formula = `A = ½ × base × height = 0.5 × ${val1} × ${val2} = ${calculatedArea}`;
        description = `Triangle with base ${val1} ${unit} and height ${val2} ${unit}`;
        break;
      }
      case "circle": {
        calculatedArea = Math.PI * val1 * val1;
        formula = `A = π × r² = π × ${val1}² ≈ ${formatFloat(calculatedArea, 4)}`;
        description = `Circle with radius ${val1} ${unit} (Diameter: ${val1 * 2} ${unit})`;
        break;
      }
      case "parallelogram": {
        if (isNaN(val2) || val2 <= 0) {
          setError("Please enter a valid positive height.");
          return;
        }
        calculatedArea = val1 * val2;
        formula = `A = base × height = ${val1} × ${val2} = ${calculatedArea}`;
        description = `Parallelogram with base ${val1} ${unit} and perpendicular height ${val2} ${unit}`;
        break;
      }
      case "trapezoid": {
        if (isNaN(val2) || val2 <= 0 || isNaN(val3) || val3 <= 0) {
          setError("Please enter valid positive values for both parallel bases and height.");
          return;
        }
        calculatedArea = ((val1 + val2) / 2) * val3;
        formula = `A = ½(a + b) × h = ½(${val1} + ${val2}) × ${val3} = ${calculatedArea}`;
        description = `Trapezoid with bases ${val1} ${unit}, ${val2} ${unit} and height ${val3} ${unit}`;
        break;
      }
    }

    setResult({
      area: calculatedArea,
      formula,
      description,
      unit,
    });
  };

  const handleReset = () => {
    setDim1("10");
    setDim2("5");
    setDim3("4");
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Area: ${formatFloat(result.area, 4)} ${result.unit}²\nFormula: ${result.formula}`;
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
                <Square className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-xeoo-muted">
                  Math Tools
                </p>
                <h1 className="text-xl font-bold tracking-tight text-xeoo-text">
                  Area Calculator
                </h1>
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-xeoo-muted">
              Calculate surface area for common 2D geometric shapes: square, rectangle, triangle, circle, parallelogram, and trapezoid.
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
                    value={dim1}
                    onChange={(e) => setDim1(e.target.value)}
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
                      value={dim1}
                      onChange={(e) => setDim1(e.target.value)}
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
                      value={dim2}
                      onChange={(e) => setDim2(e.target.value)}
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
                      Base (b)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={dim1}
                      onChange={(e) => setDim1(e.target.value)}
                      className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                      placeholder="10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                      Perpendicular Height (h)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={dim2}
                      onChange={(e) => setDim2(e.target.value)}
                      className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                      placeholder="6"
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
                    value={dim1}
                    onChange={(e) => setDim1(e.target.value)}
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
                      Base (b)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={dim1}
                      onChange={(e) => setDim1(e.target.value)}
                      className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                      placeholder="8"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                      Height (h)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={dim2}
                      onChange={(e) => setDim2(e.target.value)}
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
                      Top Base (a)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={dim1}
                      onChange={(e) => setDim1(e.target.value)}
                      className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                      placeholder="6"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                      Bottom Base (b)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={dim2}
                      onChange={(e) => setDim2(e.target.value)}
                      className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                      placeholder="10"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                      Height (h)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={dim3}
                      onChange={(e) => setDim3(e.target.value)}
                      className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                      placeholder="4"
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
                Calculate Area
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
                  Area Result
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

              {/* Main Area */}
              <div className="my-4 text-center rounded-xl border border-xeoo-primary/20 bg-xeoo-primary/5 p-4">
                <p className="text-xs font-semibold text-xeoo-muted uppercase tracking-wider">
                  Total Calculated Area
                </p>
                <p className="text-3xl font-extrabold text-xeoo-primary tracking-tight mt-1">
                  {formatFloat(result.area, 4)} {result.unit}²
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

