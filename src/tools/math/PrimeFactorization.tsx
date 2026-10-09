import {
  Check,
  Copy,
  Hash,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

// Superscript digits helper
function toSuperscript(num: number): string {
  const map: Record<string, string> = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
  };
  return num
    .toString()
    .split("")
    .map((c) => map[c] || c)
    .join("");
}

export default function PrimeFactorization() {
  const [inputVal, setInputVal] = useState("60");

  const [result, setResult] = useState<{
    num: string;
    expandedFactors: string;
    exponentialFactors: string;
    factorGroups: { prime: string; power: number }[];
    totalDivisors: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Prime Factorization - XeooTools";
    const canonicalId = "canonical-prime-factorization";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = "https://xeootools.site.je/tools/prime-factorization";
  }, []);

  const handleCalculate = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setCopied(false);

    const trimmed = inputVal.trim();
    if (!trimmed) {
      setError("Please enter a positive integer greater than 1.");
      setResult(null);
      return;
    }

    try {
      let n = BigInt(trimmed);

      if (n <= 1n) {
        setError("Prime factorization is defined for integers strictly greater than 1.");
        setResult(null);
        return;
      }

      const factors: bigint[] = [];
      const factorCounts = new Map<string, number>();

      // Factor out 2
      while (n % 2n === 0n) {
        factors.push(2n);
        factorCounts.set("2", (factorCounts.get("2") || 0) + 1);
        n /= 2n;
      }

      // Factor out 3
      while (n % 3n === 0n) {
        factors.push(3n);
        factorCounts.set("3", (factorCounts.get("3") || 0) + 1);
        n /= 3n;
      }

      // Factor out 6k +/- 1
      let d = 5n;
      while (d * d <= n) {
        while (n % d === 0n) {
          factors.push(d);
          const dStr = d.toString();
          factorCounts.set(dStr, (factorCounts.get(dStr) || 0) + 1);
          n /= d;
        }
        const d2 = d + 2n;
        while (n % d2 === 0n) {
          factors.push(d2);
          const d2Str = d2.toString();
          factorCounts.set(d2Str, (factorCounts.get(d2Str) || 0) + 1);
          n /= d2;
        }
        d += 6n;
      }

      if (n > 1n) {
        factors.push(n);
        const nStr = n.toString();
        factorCounts.set(nStr, (factorCounts.get(nStr) || 0) + 1);
      }

      // Format results
      const expandedFactors = factors.map((f) => f.toString()).join(" × ");

      const factorGroups: { prime: string; power: number }[] = [];
      let totalDivisors = 1;

      for (const [prime, power] of factorCounts.entries()) {
        factorGroups.push({ prime, power });
        totalDivisors *= power + 1;
      }

      const exponentialFactors = factorGroups
        .map((fg) => (fg.power > 1 ? `${fg.prime}${toSuperscript(fg.power)}` : fg.prime))
        .join(" × ");

      setResult({
        num: trimmed,
        expandedFactors,
        exponentialFactors,
        factorGroups,
        totalDivisors,
      });
    } catch {
      setError("Please enter a valid whole number (integer).");
      setResult(null);
    }
  };

  const handleReset = () => {
    setInputVal("60");
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `${result.num} = ${result.expandedFactors} (${result.exponentialFactors})`;
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
                  Prime Factorization
                </h1>
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-xeoo-muted">
              Decompose any positive integer into its fundamental prime factors with expanded and exponential notations.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleCalculate}
            className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-6 shadow-xl"
          >
            <div>
              <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                Positive Integer (n &gt; 1)
              </label>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="e.g. 60 or 3600"
                className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface-soft py-2.5 px-3 text-base font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                required
              />
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
                <Hash className="size-4" />
                Find Factors
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
                  Factors for {result.num}
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

              {/* Main Factor Presentation */}
              <div className="my-4 text-center rounded-xl border border-xeoo-primary/20 bg-xeoo-primary/5 p-4">
                <p className="text-xs font-semibold text-xeoo-muted uppercase tracking-wider">
                  Exponential Form
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-xeoo-primary tracking-tight mt-1 break-all">
                  {result.exponentialFactors}
                </p>
                <p className="text-xs sm:text-sm text-xeoo-text-soft mt-2 font-mono break-all">
                  = {result.expandedFactors}
                </p>
              </div>

              {/* Table & Total Divisors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <p className="text-xs font-semibold text-xeoo-muted mb-2">Prime Powers:</p>
                  <div className="space-y-1.5 text-xs">
                    {result.factorGroups.map((fg, idx) => (
                      <div key={idx} className="flex justify-between border-b border-xeoo-border/50 pb-1">
                        <span className="text-xeoo-text font-semibold">Prime {fg.prime}:</span>
                        <span className="text-xeoo-muted">Power {fg.power} ({fg.prime}^{fg.power})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 flex flex-col justify-center text-center">
                  <p className="text-xs text-xeoo-muted">Total Positive Divisors</p>
                  <p className="text-2xl font-bold text-xeoo-text mt-1">{result.totalDivisors}</p>
                  <p className="text-xs text-xeoo-muted mt-1">
                    Calculated by Π(power + 1)
                  </p>
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

