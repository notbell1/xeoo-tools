import {
  Check,
  CheckCircle2,
  Copy,
  Hash,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function PrimeNumberChecker() {
  const [inputVal, setInputVal] = useState("17");

  const [result, setResult] = useState<{
    num: string;
    isPrime: boolean;
    reason: string;
    divisor?: string;
    prevPrime?: string;
    nextPrime?: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Prime Number Checker - XeooTools";
    const canonicalId = "canonical-prime-number-checker";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = "https://xeootools.site.je/tools/prime-number-checker";
  }, []);

  const checkIsPrime = (n: bigint): { isPrime: boolean; reason: string; divisor?: bigint } => {
    if (n <= 1n) {
      return {
        isPrime: false,
        reason: `${n} is not prime because prime numbers must be integers strictly greater than 1.`,
      };
    }
    if (n === 2n || n === 3n) {
      return {
        isPrime: true,
        reason: `${n} is a prime number with only two factors: 1 and ${n}.`,
      };
    }
    if (n % 2n === 0n) {
      return {
        isPrime: false,
        reason: `${n} is composite because it is divisible by 2 (${n} = 2 × ${n / 2n}).`,
        divisor: 2n,
      };
    }
    if (n % 3n === 0n) {
      return {
        isPrime: false,
        reason: `${n} is composite because it is divisible by 3 (${n} = 3 × ${n / 3n}).`,
        divisor: 3n,
      };
    }

    // 6k +/- 1 up to sqrt(n)
    let d = 5n;
    while (d * d <= n) {
      if (n % d === 0n) {
        return {
          isPrime: false,
          reason: `${n} is composite because it is divisible by ${d} (${n} = ${d} × ${n / d}).`,
          divisor: d,
        };
      }
      if (n % (d + 2n) === 0n) {
        const div = d + 2n;
        return {
          isPrime: false,
          reason: `${n} is composite because it is divisible by ${div} (${n} = ${div} × ${n / div}).`,
          divisor: div,
        };
      }
      d += 6n;
    }

    return {
      isPrime: true,
      reason: `${n} is a prime number. It cannot be divided evenly by any integer other than 1 and itself.`,
    };
  };

  const findNearestPrimes = (n: bigint): { prev?: bigint; next?: bigint } => {
    if (n > 1000000000000n) {
      // Avoid excessive search loop for enormous numbers
      return {};
    }

    // Find prev prime
    let prev: bigint | undefined;
    for (let p = n - 1n; p >= 2n; p--) {
      if (checkIsPrime(p).isPrime) {
        prev = p;
        break;
      }
    }

    // Find next prime
    let next: bigint | undefined;
    for (let p = n + 1n; ; p++) {
      if (checkIsPrime(p).isPrime) {
        next = p;
        break;
      }
      if (p - n > 1000n) break; // safety cap
    }

    return { prev, next };
  };

  const handleCalculate = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setCopied(false);

    const trimmed = inputVal.trim();
    if (!trimmed) {
      setError("Please enter an integer to check.");
      setResult(null);
      return;
    }

    try {
      const n = BigInt(trimmed);
      const test = checkIsPrime(n);
      const nearest = n >= 2n ? findNearestPrimes(n) : {};

      setResult({
        num: trimmed,
        isPrime: test.isPrime,
        reason: test.reason,
        divisor: test.divisor?.toString(),
        prevPrime: nearest.prev?.toString(),
        nextPrime: nearest.next?.toString(),
      });
    } catch {
      setError("Please enter a valid whole number (integer).");
      setResult(null);
    }
  };

  const handleReset = () => {
    setInputVal("17");
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `${result.num} is ${result.isPrime ? "a PRIME" : "NOT a prime"} number.\n${result.reason}`;
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
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-xeoo-muted">
                  Math Tools
                </p>
                <h1 className="text-xl font-bold tracking-tight text-xeoo-text">
                  Prime Number Checker
                </h1>
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-xeoo-muted">
              Instantly test if any integer is a prime or composite number with divisor evidence and neighboring primes.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleCalculate}
            className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-6 shadow-xl"
          >
            <div>
              <label className="block text-xs font-semibold text-xeoo-muted mb-1.5">
                Integer to Check
              </label>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="e.g. 17 or 982451653"
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
                Check Primality
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
                  Test Result for {result.num}
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

              {/* Status Banner */}
              <div
                className={`my-4 flex items-center gap-3.5 rounded-xl border p-4 ${
                  result.isPrime
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                }`}
              >
                {result.isPrime ? (
                  <CheckCircle2 className="size-8 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="size-8 shrink-0 text-amber-400" />
                )}
                <div>
                  <p className="text-lg font-bold">
                    {result.isPrime
                      ? `${result.num} is a Prime Number`
                      : `${result.num} is NOT a Prime Number`}
                  </p>
                  <p className="text-xs sm:text-sm text-xeoo-text-soft mt-0.5">
                    {result.reason}
                  </p>
                </div>
              </div>

              {/* Nearest Primes */}
              {(result.prevPrime || result.nextPrime) && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                    <p className="text-xs text-xeoo-muted mb-1">Previous Prime</p>
                    <p className="text-base font-bold text-xeoo-text">
                      {result.prevPrime || "None (≤ 2)"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 text-center">
                    <p className="text-xs text-xeoo-muted mb-1">Next Prime</p>
                    <p className="text-base font-bold text-xeoo-text">
                      {result.nextPrime || "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

