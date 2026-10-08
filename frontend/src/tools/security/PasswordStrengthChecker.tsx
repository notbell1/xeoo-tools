import { useMemo, useState } from "react";
import { Check, Clipboard, Eye, EyeOff, ShieldCheck, Sparkles, X } from "lucide-react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showSuccess } from "../../alert";
import {
  analyzePassword,
  type StrengthLevel,
} from "./passwordStrengthCheckerLogic";

type StrengthMeta = {
  label: string;
  textClass: string;
  barClass: string;
  borderClass: string;
};

const STRENGTH_META: Record<StrengthLevel, StrengthMeta> = {
  "Very Weak": {
    label: "Very Weak",
    textClass: "text-red-600 dark:text-red-400",
    barClass: "bg-red-500",
    borderClass: "border-red-500/30 bg-red-500/10",
  },
  Weak: {
    label: "Weak",
    textClass: "text-orange-600 dark:text-orange-400",
    barClass: "bg-orange-500",
    borderClass: "border-orange-500/30 bg-orange-500/10",
  },
  Moderate: {
    label: "Moderate",
    textClass: "text-yellow-600 dark:text-yellow-400",
    barClass: "bg-yellow-500",
    borderClass: "border-yellow-500/30 bg-yellow-500/10",
  },
  Strong: {
    label: "Strong",
    textClass: "text-green-600 dark:text-green-400",
    barClass: "bg-green-500",
    borderClass: "border-green-500/30 bg-green-500/10",
  },
  "Very Strong": {
    label: "Very Strong",
    textClass: "text-emerald-600 dark:text-emerald-400",
    barClass: "bg-emerald-600",
    borderClass: "border-emerald-500/30 bg-emerald-500/10",
  },
};

const inputClass =
  "h-9 w-full rounded-md border border-xeoo-border bg-xeoo-surface px-3 text-[12px] text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20";

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-xeoo-muted">
      {label}
    </div>
  );
}

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const analysis = useMemo(() => analyzePassword(password), [password]);
  const meta = STRENGTH_META[analysis.level];

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      await showSuccess("Copied", "Password copied to clipboard.");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleClear = () => {
    setPassword("");
    setCopied(false);
  };

  const handleSample = () => {
    // Generate a strong sample without sending network calls
    const samplePool = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
    const buffer = new Uint32Array(16);
    crypto.getRandomValues(buffer);
    const sample = Array.from(buffer)
      .map((n) => samplePool[n % samplePool.length])
      .join("");
    setPassword(sample);
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-xeoo-bg text-xeoo-text lg:h-screen lg:max-h-screen lg:overflow-hidden">
      <Header />

      <main className="min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3 lg:overflow-hidden lg:px-4 lg:py-2">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-2">
          {/* TOP TOOL BAR */}
          <div className="flex w-full shrink-0 items-center justify-between rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-xeoo-primary-soft text-xeoo-primary">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h1 className="text-xs font-extrabold text-xeoo-text sm:text-sm">
                  PASSWORD STRENGTH CHECKER
                </h1>
                <p className="text-[11px] text-xeoo-muted">
                  Analyze password entropy, character diversity, and estimated cracking time locally.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSample}
                className="inline-flex h-7 items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2 text-[11px] font-medium text-xeoo-text transition hover:bg-xeoo-surface-soft active:scale-95"
              >
                <Sparkles size={12} className="text-xeoo-primary" />
                <span className="hidden sm:inline">Sample Password</span>
              </button>

              {password && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex h-7 items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2 text-[11px] font-medium text-xeoo-muted transition hover:text-xeoo-text active:scale-95"
                >
                  <X size={12} />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-12">
            {/* LEFT COLUMN: INPUT & CRITERIA */}
            <section className="min-w-0 rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 lg:col-span-7 lg:overflow-y-auto">
              <div className="space-y-3">
                {/* PASSWORD INPUT */}
                <div>
                  <SectionLabel label="Password to Evaluate" />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Type or paste a password to check..."
                      className={`${inputClass} pr-20 font-mono`}
                      autoComplete="off"
                      spellCheck={false}
                    />

                    <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
                      {password && (
                        <button
                          type="button"
                          onClick={() => setPassword("")}
                          className="rounded p-1 text-xeoo-muted transition hover:text-xeoo-text"
                          aria-label="Clear password"
                        >
                          <X size={14} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="rounded p-1 text-xeoo-muted transition hover:text-xeoo-text"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECURITY CRITERIA CHECKLIST */}
                <div>
                  <SectionLabel label="Security Criteria Breakdown" />
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {analysis.criteria.map((item) => (
                      <div
                        key={item.id}
                        className={[
                          "flex items-center justify-between rounded-md border px-2.5 py-1.5 text-[11px] transition",
                          item.met
                            ? "border-green-500/20 bg-green-500/5 text-green-700 dark:text-green-300"
                            : "border-xeoo-border bg-xeoo-surface-soft/40 text-xeoo-muted",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className={[
                              "flex h-4 w-4 items-center justify-center rounded-full text-[10px]",
                              item.met
                                ? "bg-green-600 text-white"
                                : "bg-xeoo-surface-soft text-xeoo-muted",
                            ].join(" ")}
                          >
                            {item.met ? "✓" : "•"}
                          </span>
                          <span className="font-medium text-xeoo-text">{item.label}</span>
                        </div>

                        <span className="text-[10px] text-xeoo-muted">{item.hint}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PRIVACY NOTICE CARD */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 p-2.5 text-[11px] text-xeoo-muted">
                  <div className="flex items-center gap-1.5 font-bold text-xeoo-text">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    <span>Client-Side Privacy Guarantee</span>
                  </div>
                  <p className="mt-1 leading-relaxed">
                    Your password is evaluated strictly inside your browser using local cryptographic logic.
                    It is never saved, logged to the console, or sent across any network connection.
                  </p>
                </div>
              </div>
            </section>

            {/* RIGHT COLUMN: STRENGTH SCORE & RECOMMENDATIONS */}
            <section className="min-w-0 rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 lg:col-span-5 lg:flex lg:min-h-0 lg:flex-col lg:overflow-y-auto">
              <div className="min-w-0 space-y-3">
                {/* RATING SUMMARY */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <SectionLabel label="Strength Assessment" />
                    <span
                      className={[
                        "rounded px-2 py-0.5 text-[10px] font-extrabold uppercase",
                        meta.borderClass,
                        meta.textClass,
                      ].join(" ")}
                    >
                      {password ? meta.label : "Awaiting Input"}
                    </span>
                  </div>

                  {/* SCORE & PROGRESS BAR */}
                  <div className="mt-2">
                    <div className="flex items-baseline justify-between text-[11px]">
                      <span className="font-bold text-xeoo-muted">Strength Score</span>
                      <span className="text-lg font-black text-xeoo-text">
                        {analysis.score} / 100
                      </span>
                    </div>

                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-xeoo-surface-soft">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${meta.barClass}`}
                        style={{
                          width: `${Math.max(password ? 5 : 0, analysis.score)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* STATS TILES */}
                  <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="rounded-md border border-xeoo-border bg-xeoo-surface-soft/40 p-1.5">
                      <span className="text-xeoo-muted">Length</span>
                      <p className="font-mono text-xs font-bold text-xeoo-text">
                        {analysis.length}
                      </p>
                    </div>

                    <div className="rounded-md border border-xeoo-border bg-xeoo-surface-soft/40 p-1.5">
                      <span className="text-xeoo-muted">Entropy</span>
                      <p className="font-mono text-xs font-bold text-xeoo-text">
                        {analysis.entropy} <span className="text-[9px]">bits</span>
                      </p>
                    </div>

                    <div className="rounded-md border border-xeoo-border bg-xeoo-surface-soft/40 p-1.5">
                      <span className="text-xeoo-muted">Crack Time</span>
                      <p className="truncate font-semibold text-xeoo-text" title={analysis.crackTimeDisplay}>
                        {analysis.crackTimeDisplay}
                      </p>
                    </div>
                  </div>

                  {password && (
                    <div className="mt-2.5 flex justify-end">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-xeoo-border px-2 text-[11px] font-medium text-xeoo-muted transition hover:text-xeoo-text active:scale-95"
                      >
                        {copied ? <Check size={12} className="text-green-500" /> : <Clipboard size={12} />}
                        <span>{copied ? "Copied" : "Copy Password"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* RECOMMENDATIONS & IMPROVEMENTS */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft/30 p-2.5">
                  <div className="text-[12px] font-semibold text-xeoo-text">
                    Recommendations & Tips
                  </div>

                  <ul className="mt-2 space-y-1.5 text-[11px] text-xeoo-muted">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-1.5 leading-snug">
                        <span className="text-xeoo-primary">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                    {!password && (
                      <li className="italic text-xeoo-muted">
                        Enter a password above to view personalized security recommendations.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
