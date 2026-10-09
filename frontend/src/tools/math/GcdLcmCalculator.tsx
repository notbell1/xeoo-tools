import {
  Calculator,
  Check,
  Copy,
  Hash,
  RotateCcw,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { gcdBigInt, lcmBigInt } from "./mathUtils";

export default function GcdLcmCalculator() {
  const [num1, setNum1] = useState("12");
  const [num2, setNum2] = useState("18");

  const [result, setResult] = useState<{
    gcdVal: string;
    lcmVal: string;
    euclideanSteps: string[];
    lcmFormula: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "GCD & LCM Calculator - XeooTools";
    const canonicalId = "canonical-gcd-lcm-calculator";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = "https://xeootools.site.je/tools/gcd-lcm-calculator";
  }, []);

  const handleCalculate = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setCopied(false);

    const s1 = num1.trim();
    const s2 = num2.trim();

    if (!s1 || !s2) {
      setError("Please enter both numbers.");
      setResult(null);
      return;
    }

    try {
      const b1 = BigInt(s1);
      const b2 = BigInt(s2);

      const abs1 = b1 < 0n ? -b1 : b1;
      const abs2 = b2 < 0n ? -b2 : b2;

      if (abs1 === 0n && abs2 === 0n) {
        setError("GCD and LCM of (0, 0) are undefined.");
        setResult(null);
        return;
      }

      // Euclidean steps computation
      const steps: string[] = [];
      let x = abs1 >= abs2 ? abs1 : abs2;
      let y = abs1 >= abs2 ? abs2 : abs1;

      while (y !== 0n) {
        const q = x / y;
        const r = x % y;
        steps.push(`${x} = ${q} × ${y} + ${r}`);
        x = y;
        y = r;
      }

      const calculatedGcd = gcdBigInt(abs1, abs2);
      const calculatedLcm = lcmBigInt(abs1, abs2);

      const lcmFormula = `LCM(${abs1}, ${abs2}) = (${abs1} × ${abs2}) ÷ GCD = (${abs1 * abs2}) ÷ ${calculatedGcd} = ${calculatedLcm}`;

      setResult({
        gcdVal: calculatedGcd.toString(),
        lcmVal: calculatedLcm.toString(),
        euclideanSteps: steps,
        lcmFormula,
      });
    } catch {
      setError("Please enter valid integers (no decimals, fractions, or special symbols).");
      setResult(null);
    }
  };

  const handleReset = () => {
    setNum1("12");
    setNum2("18");
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Numbers: ${num1}, ${num2}\nGCD: ${result.gcdVal}\nLCM: ${result.lcmVal}`;
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
                <Hash className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-xeoo-muted">
                  Math Tools
                </p>
                <h1 className="text-xl font-bold tracking-tight text-xeoo-text">
                  GCD & LCM Calculator
                </h1>
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-xeoo-muted">
              Compute the Greatest Common Divisor (GCD/FPB) and Least Common Multiple (LCM/KPK) with Euclidean algorithm steps.
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
                  First Integer
                </label>
                <input
                  type="text"
                  value={num1}
                  onChange={(e) => setNum1(e.target.value)}
                  placeholder="e.g. 12"
                  className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-sm sm:text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                  Second Integer
                </label>
                <input
                  type="text"
                  value={num2}
                  onChange={(e) => setNum2(e.target.value)}
                  placeholder="e.g. 18"
                  className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-sm sm:text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
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
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-xeoo-primary px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-xeoo-primary/90 transition-colors cursor-pointer"
              >
                <Calculator className="size-4" />
                Calculate GCD & LCM
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
                  Results for {num1} & {num2}
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

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-4">
                  <p className="text-xs text-xeoo-muted mb-1 uppercase font-semibold">
                    Greatest Common Divisor (GCD)
                  </p>
                  <p className="text-3xl font-extrabold text-xeoo-primary break-all">
                    {result.gcdVal}
                  </p>
                </div>

                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-4">
                  <p className="text-xs text-xeoo-muted mb-1 uppercase font-semibold">
                    Least Common Multiple (LCM)
                  </p>
                  <p className="text-3xl font-extrabold text-xeoo-text break-all">
                    {result.lcmVal}
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div className="mt-4 rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3">
                <p className="text-xs font-semibold text-xeoo-muted mb-2">
                  Euclidean Algorithm Steps:
                </p>
                <div className="space-y-1 font-mono text-xs text-xeoo-text-soft">
                  {result.euclideanSteps.map((step, idx) => (
                    <p key={idx}>{step}</p>
                  ))}
                </div>
                <p className="mt-3 font-mono text-xs text-xeoo-muted">
                  {result.lcmFormula}
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

