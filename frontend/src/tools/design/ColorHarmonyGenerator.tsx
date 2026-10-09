import { useState } from "react";
import { Check, Copy, Info, RotateCcw, Sparkles } from "lucide-react";

import { showError, showSuccess } from "../../alert";
import {
  generateColorHarmonies,
  type HarmonyColor,
  type HarmonyGroup,
} from "./colorHarmonyLogic";

export default function ColorHarmonyGenerator() {
  const [baseColor, setBaseColor] = useState("#6366F1");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const harmonies: HarmonyGroup[] = generateColorHarmonies(baseColor);

  const copyHex = async (hex: string, label: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedKey(hex);
      setTimeout(() => setCopiedKey(null), 1500);
      await showSuccess("Copied", `${label} (${hex}) copied to clipboard.`);
    } catch {
      await showError("Copy Error", "Could not copy to clipboard.");
    }
  };

  const copyPalette = async (colors: HarmonyColor[], title: string) => {
    try {
      const text = colors.map((c) => c.hex).join(", ");
      await navigator.clipboard.writeText(text);
      await showSuccess("Palette Copied", `${title} colors copied: ${text}`);
    } catch {
      await showError("Copy Error", "Could not copy palette to clipboard.");
    }
  };

  const handleReset = () => {
    setBaseColor("#6366F1");
    setCopiedKey(null);
  };

  const presetBases = [
    "#6366F1",
    "#EC4899",
    "#10B981",
    "#F59E0B",
    "#3B82F6",
    "#14B8A6",
    "#EF4444",
    "#8B5CF6",
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-3 py-4 sm:px-5 sm:py-6">
      <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
        {/* HEADER TOOLBAR */}
        <div className="flex items-center justify-between gap-3 border-b border-xeoo-border px-3.5 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400">
              <Sparkles size={16} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xs font-extrabold tracking-tight text-xeoo-text sm:text-sm">
                COLOR HARMONY GENERATOR
              </h1>
              <p className="truncate text-[11px] text-xeoo-muted">
                Generate mathematically balanced complementary, analogous, triadic, and tetradic color palettes.
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
            <strong className="font-semibold text-xeoo-text">Harmonic Relationships:</strong> Computed using angular intervals on the 360° color wheel. Click any swatch to copy its individual HEX value.
          </span>
        </div>

        {/* WORKSPACE */}
        <div className="p-3.5 sm:p-5 space-y-4">
          {/* BASE COLOR PICKER BAR */}
          <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 space-y-2.5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-bold text-xeoo-text block">Base Anchor Color</span>
                <span className="text-[11px] text-xeoo-muted">
                  Choose the starting color from which harmonies are derived
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative h-9 w-11 shrink-0 overflow-hidden rounded-md border border-xeoo-border bg-xeoo-bg">
                  <input
                    type="color"
                    value={baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    className="absolute -inset-2 h-14 w-16 cursor-pointer opacity-100"
                  />
                </div>
                <input
                  type="text"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  placeholder="#3B82F6"
                  className="h-9 w-28 rounded-md border border-xeoo-border bg-xeoo-surface px-3 font-mono text-xs uppercase font-medium text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-xeoo-border/60">
              <span className="text-[10px] uppercase font-bold text-xeoo-muted mr-1">Presets:</span>
              {presetBases.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setBaseColor(hex)}
                  className="h-5 w-5 rounded border border-xeoo-border transition hover:scale-110"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </div>

          {/* HARMONY GROUPS GRID */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {harmonies.map((group) => (
              <div
                key={group.title}
                className="rounded-lg border border-xeoo-border bg-xeoo-surface p-3.5 space-y-2.5 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-xeoo-text truncate">{group.title}</h3>
                    <p className="text-[10px] text-xeoo-muted truncate">{group.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyPalette(group.colors, group.title)}
                    className="inline-flex h-6.5 shrink-0 whitespace-nowrap items-center gap-1 rounded-md bg-xeoo-surface-soft border border-xeoo-border px-2 text-[10px] font-semibold text-xeoo-text hover:bg-xeoo-surface transition"
                  >
                    <Copy size={10} className="shrink-0 text-xeoo-muted" />
                    <span>Copy All</span>
                  </button>
                </div>

                {/* Swatches */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {group.colors.map((color) => {
                    const isCopied = copiedKey === color.hex;
                    return (
                      <button
                        key={`${group.title}-${color.hex}`}
                        type="button"
                        onClick={() => void copyHex(color.hex, color.label)}
                        className="group flex flex-col overflow-hidden rounded border border-xeoo-border bg-xeoo-surface-soft text-left transition hover:border-xeoo-primary"
                        title={`Click to copy ${color.hex}`}
                      >
                        <div
                          className="h-10 w-full border-b border-xeoo-border/50 transition group-hover:opacity-90"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="p-1.5 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] font-bold text-xeoo-text">
                              {color.hex}
                            </span>
                            {isCopied ? (
                              <Check size={10} className="text-emerald-500" />
                            ) : (
                              <Copy size={10} className="text-xeoo-muted opacity-0 group-hover:opacity-100" />
                            )}
                          </div>
                          <span className="text-[9px] text-xeoo-muted block truncate">
                            {color.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
