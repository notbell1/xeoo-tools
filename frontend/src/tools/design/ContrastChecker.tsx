import React, { useState, useMemo } from "react";
import {
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Info,
  RotateCcw,
  Contrast,
} from "lucide-react";
import {
  calculateContrastRatio,
  formatContrastRatio,
} from "./contrastCheckerLogic";
import { showSuccess, showError } from "../../alert";

export const ContrastChecker: React.FC = () => {
  const [fgColor, setFgColor] = useState<string>("#1E293B");
  const [bgColor, setBgColor] = useState<string>("#F8FAFC");
  const [copied, setCopied] = useState<boolean>(false);

  const result = useMemo(() => {
    return calculateContrastRatio(fgColor, bgColor);
  }, [fgColor, bgColor]);

  const handleSwap = () => {
    setFgColor(bgColor);
    setBgColor(fgColor);
  };

  const handleReset = () => {
    setFgColor("#1E293B");
    setBgColor("#F8FAFC");
  };

  const handleCopyReport = async () => {
    if (!result) return;
    const text = `Contrast Ratio: ${formatContrastRatio(result.ratio)}
Foreground: ${fgColor}
Background: ${bgColor}
WCAG 2.1 Compliance:
- Normal Text (AA >= 4.5): ${result.normalAA ? "PASS" : "FAIL"}
- Normal Text (AAA >= 7.0): ${result.normalAAA ? "PASS" : "FAIL"}
- Large Text (AA >= 3.0): ${result.largeAA ? "PASS" : "FAIL"}
- Large Text (AAA >= 4.5): ${result.largeAAA ? "PASS" : "FAIL"}
- UI Components (AA >= 3.0): ${result.uiComponentAA ? "PASS" : "FAIL"}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showSuccess(
        "Report Copied",
        "Contrast analysis report copied to clipboard.",
      );
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showError("Copy Failed", "Could not copy to clipboard.");
    }
  };

  const getScoreRating = (ratio: number) => {
    if (ratio >= 7)
      return {
        label: "Excellent (AAA)",
        color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
      };
    if (ratio >= 4.5)
      return {
        label: "Good (AA)",
        color: "text-fuchsia-600 bg-fuchsia-500/10 border-fuchsia-500/20",
      };
    if (ratio >= 3)
      return {
        label: "Fair (Large Text Only)",
        color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
      };
    return {
      label: "Fail (Insufficient)",
      color: "text-rose-600 bg-rose-500/10 border-rose-500/20",
    };
  };

  const rating = result ? getScoreRating(result.ratio) : null;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-3 py-4 sm:px-5 sm:py-6">
      <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
        {/* HEADER TOOLBAR */}
        <div className="flex items-center justify-between gap-3 border-b border-xeoo-border px-3.5 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400">
              <Contrast size={16} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xs font-extrabold tracking-tight text-xeoo-text sm:text-sm">
                CONTRAST CHECKER
              </h1>
              <p className="truncate text-[11px] text-xeoo-muted">
                Verify color contrast ratios according to Web Content Accessibility Guidelines (WCAG 2.1).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-7 items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-medium text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* NOTICE BANNER */}
        <div className="flex items-center gap-2 border-b border-xeoo-border bg-xeoo-surface-soft px-3.5 py-2.5 text-[11px] text-xeoo-text-soft">
          <Info size={14} className="shrink-0 text-xeoo-primary" />
          <span>
            <strong className="font-semibold text-xeoo-text">WCAG 2.1 Standard:</strong> Level AA requires a ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt+ or 14pt+ bold).
          </span>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 gap-4 p-3.5 sm:p-5 lg:grid-cols-12">
          {/* LEFT: COLOR INPUTS & HERO SCORE */}
          <div className="space-y-4 lg:col-span-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Foreground Color Card */}
              <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-3 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted block">
                    Foreground / Text
                  </span>
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-xeoo-border"
                    style={{ backgroundColor: fgColor }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative h-9 w-11 shrink-0 overflow-hidden rounded-md border border-xeoo-border bg-xeoo-bg">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="absolute -inset-2 h-14 w-16 cursor-pointer opacity-100"
                    />
                  </div>
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    placeholder="#000000"
                    className="h-9 min-w-0 flex-1 rounded-md border border-xeoo-border bg-xeoo-bg px-3 font-mono text-xs uppercase font-medium text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
                  />
                </div>
              </div>

              {/* Background Color Card */}
              <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-3 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted block">
                    Background
                  </span>
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-xeoo-border"
                    style={{ backgroundColor: bgColor }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative h-9 w-11 shrink-0 overflow-hidden rounded-md border border-xeoo-border bg-xeoo-bg">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="absolute -inset-2 h-14 w-16 cursor-pointer opacity-100"
                    />
                  </div>
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    placeholder="#FFFFFF"
                    className="h-9 min-w-0 flex-1 rounded-md border border-xeoo-border bg-xeoo-bg px-3 font-mono text-xs uppercase font-medium text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleSwap}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-xeoo-surface border border-xeoo-border px-3 text-[11px] font-medium text-xeoo-text hover:bg-xeoo-surface-soft transition shadow-xs"
              >
                <ArrowLeftRight size={13} className="text-xeoo-muted" />
                <span>Swap Colors</span>
              </button>

              <button
                type="button"
                onClick={handleCopyReport}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-xeoo-surface border border-xeoo-border px-3 text-[11px] font-medium text-xeoo-text hover:bg-xeoo-surface-soft transition shadow-xs"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} className="text-xeoo-muted" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* HERO SCORE CARD */}
            {result && rating && (
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-4 text-center space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-xeoo-muted">
                  Relative Contrast Ratio
                </span>
                <div className="text-4xl font-black font-mono text-xeoo-text tracking-tight sm:text-5xl">
                  {formatContrastRatio(result.ratio)}
                </div>
                <div className="pt-1">
                  <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${rating.color}`}>
                    {rating.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: WCAG CHECKLIST & LIVE PREVIEW */}
          <div className="space-y-4 lg:col-span-6">
            {/* Checklist */}
            {result && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-xeoo-text block">
                  WCAG Compliance Status
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xeoo-text block">Normal AA</span>
                      <span className="text-[10px] text-xeoo-muted">≥ 4.5:1</span>
                    </div>
                    {result.normalAA ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={14} /> PASS
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                        <XCircle size={14} /> FAIL
                      </span>
                    )}
                  </div>

                  <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xeoo-text block">Normal AAA</span>
                      <span className="text-[10px] text-xeoo-muted">≥ 7.0:1</span>
                    </div>
                    {result.normalAAA ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={14} /> PASS
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                        <XCircle size={14} /> FAIL
                      </span>
                    )}
                  </div>

                  <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xeoo-text block">Large AA</span>
                      <span className="text-[10px] text-xeoo-muted">≥ 3.0:1 (18pt+)</span>
                    </div>
                    {result.largeAA ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={14} /> PASS
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                        <XCircle size={14} /> FAIL
                      </span>
                    )}
                  </div>

                  <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xeoo-text block">Large AAA</span>
                      <span className="text-[10px] text-xeoo-muted">≥ 4.5:1 (18pt+)</span>
                    </div>
                    {result.largeAAA ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={14} /> PASS
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                        <XCircle size={14} /> FAIL
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xeoo-text block">UI Components & Graphics</span>
                      <span className="text-[10px] text-xeoo-muted">≥ 3.0:1 for icons, borders & inputs</span>
                    </div>
                    {result.uiComponentAA ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={14} /> PASS
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                        <XCircle size={14} /> FAIL
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Live Preview Box */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-xeoo-text block">Live Preview</span>
              <div
                className="p-4 rounded-xl border border-xeoo-border transition-colors space-y-3"
                style={{ backgroundColor: bgColor, color: fgColor }}
              >
                <div className="text-lg font-bold">
                  Large Heading (18pt / 24px Bold)
                </div>
                <p className="text-xs leading-relaxed">
                  Normal body paragraph sample. Good contrast ensures readable typography across various screens and lighting environments.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-md font-semibold text-xs border shadow-xs"
                    style={{
                      backgroundColor: fgColor,
                      color: bgColor,
                      borderColor: fgColor,
                    }}
                  >
                    Button UI Component
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContrastChecker;
