import {
  Box,
  Calculator,
  Check,
  Copy,
  RotateCcw,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { formatFloat } from "./mathUtils";

type SolidType = "cube" | "cuboid" | "cylinder" | "sphere" | "cone" | "pyramid";

export default function VolumeCalculator() {
  const [solid, setSolid] = useState<SolidType>("cuboid");
  const [unit, setUnit] = useState("cm");

  // Inputs
  const [dim1, setDim1] = useState("10"); // side / length / radius
  const [dim2, setDim2] = useState("5");  // width / height
  const [dim3, setDim3] = useState("4");  // height for cuboid / pyramid

  const [result, setResult] = useState<{
    volume: number;
    surfaceArea?: number;
    formula: string;
    description: string;
    unit: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Volume Calculator - XeooTools";
    const canonicalId = "canonical-volume-calculator";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = "https://xeootools.site.je/tools/volume-calculator";
  }, []);

  const handleCalculate = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setCopied(false);

    const val1 = parseFloat(dim1.trim());
    const val2 = parseFloat(dim2.trim());
    const val3 = parseFloat(dim3.trim());

    if (isNaN(val1) || val1 <= 0) {
      setError("Please enter a valid positive value for the primary dimension.");
      setResult(null);
      return;
    }

    let calculatedVolume = 0;
    let surfaceArea: number | undefined;
    let formula = "";
    let description = "";

    switch (solid) {
      case "cube": {
        calculatedVolume = Math.pow(val1, 3);
        surfaceArea = 6 * val1 * val1;
        formula = `V = s³ = ${val1}³ = ${calculatedVolume}`;
        description = `Cube with side ${val1} ${unit}`;
        break;
      }
      case "cuboid": {
        if (isNaN(val2) || val2 <= 0 || isNaN(val3) || val3 <= 0) {
          setError("Please enter valid positive values for length, width, and height.");
          return;
        }
        calculatedVolume = val1 * val2 * val3;
        surfaceArea = 2 * (val1 * val2 + val1 * val3 + val2 * val3);
        formula = `V = l × w × h = ${val1} × ${val2} × ${val3} = ${calculatedVolume}`;
        description = `Rectangular Prism of ${val1} × ${val2} × ${val3} ${unit}`;
        break;
      }
      case "cylinder": {
        if (isNaN(val2) || val2 <= 0) {
          setError("Please enter a valid positive height.");
          return;
        }
        calculatedVolume = Math.PI * val1 * val1 * val2;
        surfaceArea = 2 * Math.PI * val1 * (val1 + val2);
        formula = `V = π × r² × h = π × ${val1}² × ${val2} ≈ ${formatFloat(calculatedVolume, 4)}`;
        description = `Cylinder with radius ${val1} ${unit} and height ${val2} ${unit}`;
        break;
      }
      case "sphere": {
        calculatedVolume = (4 / 3) * Math.PI * Math.pow(val1, 3);
        surfaceArea = 4 * Math.PI * val1 * val1;
        formula = `V = ⁴⁄₃ × π × r³ = ⁴⁄₃ × π × ${val1}³ ≈ ${formatFloat(calculatedVolume, 4)}`;
        description = `Sphere with radius ${val1} ${unit} (Diameter: ${val1 * 2} ${unit})`;
        break;
      }
      case "cone": {
        if (isNaN(val2) || val2 <= 0) {
          setError("Please enter a valid positive height.");
          return;
        }
        calculatedVolume = (1 / 3) * Math.PI * val1 * val1 * val2;
        const slantHeight = Math.sqrt(val1 * val1 + val2 * val2);
        surfaceArea = Math.PI * val1 * (val1 + slantHeight);
        formula = `V = ⅓ × π × r² × h = ⅓ × π × ${val1}² × ${val2} ≈ ${formatFloat(calculatedVolume, 4)}`;
        description = `Cone with radius ${val1} ${unit} and height ${val2} ${unit}`;
        break;
      }
      case "pyramid": {
        if (isNaN(val2) || val2 <= 0 || isNaN(val3) || val3 <= 0) {
          setError("Please enter valid positive values for base length, base width, and height.");
          return;
        }
        calculatedVolume = (1 / 3) * val1 * val2 * val3;
        formula = `V = ⅓ × base_area × h = ⅓ × (${val1} × ${val2}) × ${val3} = ${formatFloat(calculatedVolume, 4)}`;
        description = `Rectangular Pyramid with base ${val1} × ${val2} ${unit} and height ${val3} ${unit}`;
        break;
      }
    }

    setResult({
      volume: calculatedVolume,
      surfaceArea,
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
    const text = `Volume: ${formatFloat(result.volume, 4)} ${result.unit}³\nFormula: ${result.formula}`;
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
                <Box className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-xeoo-muted">
                  Math Tools
                </p>
                <h1 className="text-xl font-bold tracking-tight text-xeoo-text">
                  Volume Calculator
                </h1>
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-xeoo-muted">
              Compute the 3D volume and total surface area for cubes, rectangular prisms, cylinders, spheres, cones, and pyramids.
            </p>
          </div>

          {/* Solid Selector Tabs */}
          <div className="mb-4 grid grid-cols-3 sm:grid-cols-6 gap-1 rounded-xl border border-xeoo-border bg-xeoo-surface p-1">
            {(
              [
                { id: "cube", label: "Cube" },
                { id: "cuboid", label: "Prism" },
                { id: "cylinder", label: "Cylinder" },
                { id: "sphere", label: "Sphere" },
                { id: "cone", label: "Cone" },
                { id: "pyramid", label: "Pyramid" },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSolid(s.id);
                  setResult(null);
                  setError(null);
                }}
                className={`rounded-lg py-1.5 text-xs font-semibold transition-colors cursor-pointer truncate px-1 text-center ${
                  solid === s.id
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
                Solid: {solid}
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
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {solid === "cube" && (
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

              {solid === "cuboid" && (
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

              {solid === "cylinder" && (
                <>
                  <div>
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
                      placeholder="10"
                      required
                    />
                  </div>
                </>
              )}

              {solid === "sphere" && (
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
                    placeholder="6"
                    required
                  />
                </div>
              )}

              {solid === "cone" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                      Base Radius (r)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={dim1}
                      onChange={(e) => setDim1(e.target.value)}
                      className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                      placeholder="5"
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
                      placeholder="12"
                      required
                    />
                  </div>
                </>
              )}

              {solid === "pyramid" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                      Base Length (l)
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
                      Base Width (w)
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
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                      Pyramid Height (h)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={dim3}
                      onChange={(e) => setDim3(e.target.value)}
                      className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                      placeholder="10"
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
                Calculate Volume
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
                  Volume Result
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

              {/* Main Volume */}
              <div className="my-4 text-center rounded-xl border border-xeoo-primary/20 bg-xeoo-primary/5 p-4">
                <p className="text-xs font-semibold text-xeoo-muted uppercase tracking-wider">
                  Total 3D Volume
                </p>
                <p className="text-3xl font-extrabold text-xeoo-primary tracking-tight mt-1">
                  {formatFloat(result.volume, 4)} {result.unit}³
                </p>
                <p className="text-xs text-xeoo-muted mt-1">{result.description}</p>
              </div>

              {result.surfaceArea !== undefined && (
                <div className="mb-4 rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                  <p className="text-xs text-xeoo-muted">Total Surface Area</p>
                  <p className="text-xl font-bold text-xeoo-text mt-0.5">
                    {formatFloat(result.surfaceArea, 4)} {result.unit}²
                  </p>
                </div>
              )}

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

