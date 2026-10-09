import React, { useState, useMemo } from "react";
import { Copy, Check, Type, RotateCcw, Info } from "lucide-react";
import {
  MODULAR_RATIOS,
  generateTypeScale,
  generateTypeScaleCss,
} from "./typographyScaleLogic";
import { showSuccess, showError } from "../../alert";

export const TypographyScaleGenerator: React.FC = () => {
  const [baseSize, setBaseSize] = useState<number>(16);
  const [selectedRatio, setSelectedRatio] = useState<number>(1.25); // Major Third
  const [previewText, setPreviewText] = useState<string>(
    "The quick brown fox jumps over the lazy dog",
  );
  const [copied, setCopied] = useState<boolean>(false);

  const steps = useMemo(() => {
    return generateTypeScale(baseSize, selectedRatio);
  }, [baseSize, selectedRatio]);

  const cssVariables = useMemo(() => {
    return generateTypeScaleCss(steps);
  }, [steps]);

  const handleReset = () => {
    setBaseSize(16);
    setSelectedRatio(1.25);
    setPreviewText("The quick brown fox jumps over the lazy dog");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cssVariables);
      setCopied(true);
      showSuccess(
        "Copied!",
        "CSS typography variables copied to clipboard.",
      );
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showError("Copy Failed", "Failed to copy CSS.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-3 py-4 sm:px-5 sm:py-6">
      <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
        {/* HEADER TOOLBAR */}
        <div className="flex items-center justify-between gap-3 border-b border-xeoo-border px-3.5 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400">
              <Type size={16} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xs font-extrabold tracking-tight text-xeoo-text sm:text-sm">
                TYPOGRAPHY SCALE GENERATOR
              </h1>
              <p className="truncate text-[11px] text-xeoo-muted">
                Generate harmonious modular typography scales with PX, REM, and CSS variables.
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
            <strong className="font-semibold text-xeoo-text">Modular Hierarchy:</strong> Based on musical intervals and design ratios. REM units are computed relative to standard 16px root font size.
          </span>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 gap-4 p-3.5 sm:p-5 lg:grid-cols-12">
          {/* LEFT: CONTROLS & SCALE HIERARCHY */}
          <div className="space-y-4 lg:col-span-7">
            {/* Config Box */}
            <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted block">
                Scale Settings
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-xeoo-muted block mb-1">Base Size (px)</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="10"
                      max="32"
                      value={baseSize}
                      onChange={(e) =>
                        setBaseSize(Math.max(8, parseInt(e.target.value) || 16))
                      }
                      className="h-8 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 font-mono text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                    />
                    <span className="font-mono text-xs text-xeoo-muted">px</span>
                  </div>
                </div>

                <div>
                  <label className="text-xeoo-muted block mb-1">Scale Ratio</label>
                  <select
                    value={selectedRatio}
                    onChange={(e) => setSelectedRatio(parseFloat(e.target.value))}
                    className="h-8 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 text-[11px] font-medium text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20 cursor-pointer"
                  >
                    {MODULAR_RATIOS.map((r) => (
                      <option key={r.name} value={r.value} className="bg-xeoo-surface text-xeoo-text">
                        {r.name} ({r.value})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xeoo-muted block mb-1">Preview Text</label>
                  <input
                    type="text"
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    className="h-8 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                    placeholder="Custom preview sentence..."
                  />
                </div>
              </div>
            </div>

            {/* Hierarchy Stack */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-xeoo-text block">
                Hierarchy Preview
              </span>

              <div className="space-y-2">
                {[...steps].reverse().map((step) => (
                  <div
                    key={step.cssVar}
                    className="rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 space-y-1 hover:border-fuchsia-500/40 transition overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-xs border-b border-xeoo-border/50 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xeoo-text text-xs">{step.label}</span>
                        <span className="font-mono text-xeoo-muted text-[10px]">{step.cssVar}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span className="text-fuchsia-600 dark:text-fuchsia-400 font-bold">{step.px}px</span>
                        <span className="text-xeoo-muted">/</span>
                        <span className="text-xeoo-muted text-[11px]">{step.rem}rem</span>
                      </div>
                    </div>

                    <div
                      className="text-xeoo-text font-sans truncate py-0.5 leading-tight"
                      style={{ fontSize: `${step.px}px` }}
                      title={previewText}
                    >
                      {previewText}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: CSS VARIABLES & SUMMARY TABLE */}
          <div className="space-y-4 lg:col-span-5">
            {/* CSS Export */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                  CSS Custom Properties
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex h-7 items-center gap-1.5 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-medium text-xeoo-text shadow-xs transition hover:bg-xeoo-surface-soft"
                >
                  {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  <span>{copied ? "Copied" : "Copy Variables"}</span>
                </button>
              </div>

              <pre className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 font-mono text-xs text-xeoo-text overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {cssVariables}
              </pre>
            </div>

            {/* Summary Table */}
            <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-3 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted block">
                Scale Values Table
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-xeoo-border text-xeoo-muted">
                      <th className="pb-1 font-medium">Step</th>
                      <th className="pb-1 font-medium">PX</th>
                      <th className="pb-1 font-medium">REM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-xeoo-border/50 font-mono text-[11px]">
                    {steps.map((s) => (
                      <tr key={s.label}>
                        <td className="py-1 text-xeoo-text font-sans">{s.label}</td>
                        <td className="py-1 text-fuchsia-600 dark:text-fuchsia-400 font-semibold">{s.px}px</td>
                        <td className="py-1 text-xeoo-muted">{s.rem}rem</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TypographyScaleGenerator;
