import { useState } from "react";
import { Check, Copy, Info, Palette, RotateCcw } from "lucide-react";

import { showError, showSuccess } from "../../alert";
import {
  convertColorFromRgb,
  hexToRgb,
  hslToRgb,
  type ColorFormats,
} from "./colorConverterLogic";

export default function ColorConverter() {
  const [hexInput, setHexInput] = useState("#3B82F6");
  const [rgbState, setRgbState] = useState({ r: 59, g: 130, b: 246 });
  const [hslState, setHslState] = useState({ h: 217, s: 91, l: 60 });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const formats: ColorFormats = convertColorFromRgb(
    rgbState.r,
    rgbState.g,
    rgbState.b,
  );

  const updateFromHex = (val: string) => {
    setHexInput(val);
    const parsed = hexToRgb(val);
    if (parsed) {
      setRgbState({ r: parsed.r, g: parsed.g, b: parsed.b });
      const converted = convertColorFromRgb(parsed.r, parsed.g, parsed.b);
      setHslState(converted.hslValues);
    }
  };

  const updateFromRgb = (r: number, g: number, b: number) => {
    const clampedR = Math.max(0, Math.min(255, r));
    const clampedG = Math.max(0, Math.min(255, g));
    const clampedB = Math.max(0, Math.min(255, b));
    setRgbState({ r: clampedR, g: clampedG, b: clampedB });
    const converted = convertColorFromRgb(clampedR, clampedG, clampedB);
    setHexInput(converted.hex);
    setHslState(converted.hslValues);
  };

  const updateFromHsl = (h: number, s: number, l: number) => {
    const clampedH = ((h % 360) + 360) % 360;
    const clampedS = Math.max(0, Math.min(100, s));
    const clampedL = Math.max(0, Math.min(100, l));
    setHslState({ h: clampedH, s: clampedS, l: clampedL });
    const rgb = hslToRgb(clampedH, clampedS, clampedL);
    setRgbState(rgb);
    const converted = convertColorFromRgb(rgb.r, rgb.g, rgb.b);
    setHexInput(converted.hex);
  };

  const handleReset = () => {
    updateFromHex("#3B82F6");
    setCopiedKey(null);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(label);
      setTimeout(() => setCopiedKey(null), 1500);
      await showSuccess("Copied", `${label} (${text}) copied to clipboard.`);
    } catch {
      await showError("Copy Error", `Could not copy ${label} to clipboard.`);
    }
  };

  const conversionItems = [
    { label: "HEX", value: formats.hex },
    { label: "RGB", value: formats.rgb },
    { label: "RGBA", value: formats.rgba },
    { label: "HSL", value: formats.hsl },
    { label: "HSLA", value: formats.hsla },
    { label: "HSV", value: formats.hsv },
    { label: "CMYK", value: formats.cmyk },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-3 py-4 sm:px-5 sm:py-6">
      <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
        {/* HEADER TOOLBAR */}
        <div className="flex items-center justify-between gap-3 border-b border-xeoo-border px-3.5 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400">
              <Palette size={16} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xs font-extrabold tracking-tight text-xeoo-text sm:text-sm">
                COLOR CONVERTER
              </h1>
              <p className="truncate text-[11px] text-xeoo-muted">
                Convert color codes between HEX, RGB, HSL, HSV, and CMYK formats instantaneously.
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
            <strong className="font-semibold text-xeoo-text">Bidirectional Sync:</strong> Adjusting HEX, RGB sliders, or HSL automatically converts and synchronizes all color models in real-time.
          </span>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 gap-4 p-3.5 sm:p-5 lg:grid-cols-12">
          {/* LEFT: COLOR INPUTS & SLIDERS */}
          <div className="space-y-4 lg:col-span-6">
            {/* Hex & Picker row */}
            <div className="space-y-1.5">
              <label htmlFor="hex-field" className="text-xs font-bold text-xeoo-text block">
                Hex Color / Picker
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formats.hex}
                  onChange={(e) => updateFromHex(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-md border border-xeoo-border bg-transparent p-0.5"
                />
                <input
                  id="hex-field"
                  type="text"
                  value={hexInput}
                  onChange={(e) => updateFromHex(e.target.value)}
                  placeholder="#3B82F6"
                  className="h-9 flex-1 rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 font-mono text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                />
              </div>
            </div>

            {/* RGB Sliders */}
            <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted block">
                RGB Channels
              </span>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5">
                    <span className="text-red-500 font-semibold">Red (R)</span>
                    <span className="font-mono text-xeoo-text">{rgbState.r}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={rgbState.r}
                    onChange={(e) => updateFromRgb(parseInt(e.target.value) || 0, rgbState.g, rgbState.b)}
                    className="w-full accent-red-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5">
                    <span className="text-emerald-500 font-semibold">Green (G)</span>
                    <span className="font-mono text-xeoo-text">{rgbState.g}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={rgbState.g}
                    onChange={(e) => updateFromRgb(rgbState.r, parseInt(e.target.value) || 0, rgbState.b)}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5">
                    <span className="text-blue-500 font-semibold">Blue (B)</span>
                    <span className="font-mono text-xeoo-text">{rgbState.b}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={rgbState.b}
                    onChange={(e) => updateFromRgb(rgbState.r, rgbState.g, parseInt(e.target.value) || 0)}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* HSL Sliders */}
            <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted block">
                HSL Parameters
              </span>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5">
                    <span>Hue (H)</span>
                    <span className="font-mono text-xeoo-text">{hslState.h}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hslState.h}
                    onChange={(e) => updateFromHsl(parseInt(e.target.value) || 0, hslState.s, hslState.l)}
                    className="w-full accent-fuchsia-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5">
                    <span>Saturation (S)</span>
                    <span className="font-mono text-xeoo-text">{hslState.s}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hslState.s}
                    onChange={(e) => updateFromHsl(hslState.h, parseInt(e.target.value) || 0, hslState.l)}
                    className="w-full accent-fuchsia-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5">
                    <span>Lightness (L)</span>
                    <span className="font-mono text-xeoo-text">{hslState.l}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hslState.l}
                    onChange={(e) => updateFromHsl(hslState.h, hslState.s, parseInt(e.target.value) || 0)}
                    className="w-full accent-fuchsia-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: LIVE SWATCH & EXPORT FORMATS */}
          <div className="space-y-4 lg:col-span-6">
            {/* Big Swatch preview */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-4 flex flex-col items-center justify-center text-center space-y-2">
              <div
                className="h-20 w-full max-w-xs rounded-lg border border-xeoo-border shadow-xs transition-colors"
                style={{ backgroundColor: formats.hex }}
              />
              <span className="font-mono text-lg font-extrabold text-xeoo-text">
                {formats.hex}
              </span>
              <span className="text-[11px] text-xeoo-muted">
                {formats.rgb} • {formats.hsl}
              </span>
            </div>

            {/* Formats Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-xeoo-text block">
                Converted Formats
              </span>

              <div className="space-y-1.5">
                {conversionItems.map((item) => {
                  const isCopied = copiedKey === item.label;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="w-12 shrink-0 text-[10px] uppercase font-bold text-xeoo-muted">
                          {item.label}
                        </span>
                        <span className="font-mono text-xs text-xeoo-text truncate">
                          {item.value}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => void copyToClipboard(item.value, item.label)}
                        className="inline-flex h-6.5 shrink-0 items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface-soft px-2 text-[11px] font-medium text-xeoo-text shadow-xs transition hover:bg-xeoo-surface"
                      >
                        {isCopied ? (
                          <Check size={11} className="text-emerald-500" />
                        ) : (
                          <Copy size={11} className="text-xeoo-muted" />
                        )}
                        <span>{isCopied ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
