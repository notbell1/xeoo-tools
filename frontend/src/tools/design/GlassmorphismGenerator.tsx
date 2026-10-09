import React, { useState } from "react";
import {
  Copy,
  Check,
  Sparkles,
  RotateCcw,
  Layers,
} from "lucide-react";
import {
  type GlassSettings,
  generateGlassCss,
  GLASS_PRESETS,
  hexToRgba,
} from "./glassmorphismGeneratorLogic";
import { showSuccess, showError } from "../../alert";

const PREVIEW_BACKGROUNDS = [
  {
    name: "Aurora",
    style: "bg-gradient-to-tr from-violet-600 via-pink-500 to-amber-400",
  },
  {
    name: "Oceanic",
    style: "bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-400",
  },
  {
    name: "Sunset",
    style: "bg-gradient-to-br from-rose-500 via-orange-500 to-yellow-400",
  },
  {
    name: "Deep Space",
    style: "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-950",
  },
];

export const GlassmorphismGenerator: React.FC = () => {
  const [settings, setSettings] = useState<GlassSettings>(
    GLASS_PRESETS[0].settings,
  );
  const [bgIndex, setBgIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const cssCode = generateGlassCss(settings);

  const handleUpdate = (field: keyof GlassSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyPreset = (preset: GlassSettings) => {
    setSettings({ ...preset });
  };

  const handleReset = () => {
    handleApplyPreset(GLASS_PRESETS[0].settings);
    setBgIndex(0);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cssCode);
      setCopied(true);
      showSuccess("Copied!", "Glassmorphism CSS copied to clipboard.");
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
              <Layers size={16} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xs font-extrabold tracking-tight text-xeoo-text sm:text-sm">
                GLASSMORPHISM GENERATOR
              </h1>
              <p className="truncate text-[11px] text-xeoo-muted">
                Design modern frosted glass UI elements with backdrop-filter blur and RGBA transparency.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-[11px] font-medium text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* PRESETS BAR */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-xeoo-border bg-fuchsia-500/5 px-3.5 py-2 text-[11px] text-fuchsia-800 dark:text-fuchsia-300">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="shrink-0 text-fuchsia-500" />
            <span className="font-semibold">Presets:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {GLASS_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleApplyPreset(p.settings)}
                className="rounded border border-xeoo-border bg-xeoo-surface px-2 py-0.5 text-[10px] font-medium text-xeoo-text hover:border-xeoo-primary transition"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 gap-4 p-3.5 sm:p-5 lg:grid-cols-12">
          {/* LEFT: SLIDERS & COLORS */}
          <div className="space-y-4 lg:col-span-7">
            <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted block">
                Glass Properties
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Blur */}
                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                    <span>Backdrop Blur</span>
                    <span className="font-mono text-xeoo-text">{settings.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={settings.blur}
                    onChange={(e) => handleUpdate("blur", parseInt(e.target.value) || 0)}
                    className="w-full accent-fuchsia-500"
                  />
                </div>

                {/* Opacity */}
                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                    <span>Transparency</span>
                    <span className="font-mono text-xeoo-text">{Math.round(settings.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.opacity}
                    onChange={(e) => handleUpdate("opacity", parseFloat(e.target.value))}
                    className="w-full accent-fuchsia-500"
                  />
                </div>

                {/* Saturation */}
                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                    <span>Saturation</span>
                    <span className="font-mono text-xeoo-text">{settings.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={settings.saturation}
                    onChange={(e) => handleUpdate("saturation", parseInt(e.target.value) || 100)}
                    className="w-full accent-fuchsia-500"
                  />
                </div>

                {/* Border Radius */}
                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                    <span>Border Radius</span>
                    <span className="font-mono text-xeoo-text">{settings.borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={settings.borderRadius}
                    onChange={(e) => handleUpdate("borderRadius", parseInt(e.target.value) || 0)}
                    className="w-full accent-fuchsia-500"
                  />
                </div>

                {/* Border Width */}
                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                    <span>Border Width</span>
                    <span className="font-mono text-xeoo-text">{settings.borderWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={settings.borderWidth}
                    onChange={(e) => handleUpdate("borderWidth", parseInt(e.target.value) || 0)}
                    className="w-full accent-fuchsia-500"
                  />
                </div>

                {/* Border Opacity */}
                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                    <span>Border Opacity</span>
                    <span className="font-mono text-xeoo-text">{Math.round(settings.borderOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.borderOpacity}
                    onChange={(e) => handleUpdate("borderOpacity", parseFloat(e.target.value))}
                    className="w-full accent-fuchsia-500"
                  />
                </div>

                {/* Shadow Blur */}
                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                    <span>Shadow Blur</span>
                    <span className="font-mono text-xeoo-text">{settings.shadowBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={settings.shadowBlur}
                    onChange={(e) => handleUpdate("shadowBlur", parseInt(e.target.value) || 0)}
                    className="w-full accent-fuchsia-500"
                  />
                </div>

                {/* Shadow Opacity */}
                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                    <span>Shadow Opacity</span>
                    <span className="font-mono text-xeoo-text">{Math.round(settings.shadowOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.shadowOpacity}
                    onChange={(e) => handleUpdate("shadowOpacity", parseFloat(e.target.value))}
                    className="w-full accent-fuchsia-500"
                  />
                </div>
              </div>

              {/* Glass & Border Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-xeoo-border text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-xeoo-muted">Glass Color:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={settings.bgColor}
                      onChange={(e) => handleUpdate("bgColor", e.target.value)}
                      className="h-6 w-7 rounded border border-xeoo-border bg-transparent p-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.bgColor}
                      onChange={(e) => handleUpdate("bgColor", e.target.value)}
                      className="w-16 rounded border border-xeoo-border bg-xeoo-surface px-1.5 py-0.5 font-mono text-[11px] text-xeoo-text"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-xeoo-muted">Border Color:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={settings.borderColor}
                      onChange={(e) => handleUpdate("borderColor", e.target.value)}
                      className="h-6 w-7 rounded border border-xeoo-border bg-transparent p-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.borderColor}
                      onChange={(e) => handleUpdate("borderColor", e.target.value)}
                      className="w-16 rounded border border-xeoo-border bg-xeoo-surface px-1.5 py-0.5 font-mono text-[11px] text-xeoo-text"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: LIVE CANVAS & CSS EXPORT */}
          <div className="space-y-4 lg:col-span-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-xeoo-text">Preview Canvas</span>
              <div className="flex items-center gap-1">
                {PREVIEW_BACKGROUNDS.map((bg, idx) => (
                  <button
                    key={bg.name}
                    type="button"
                    onClick={() => setBgIndex(idx)}
                    className={`px-1.5 py-0.5 text-[10px] rounded font-medium transition ${
                      bgIndex === idx
                        ? "bg-xeoo-primary text-white"
                        : "border border-xeoo-border text-xeoo-muted hover:text-xeoo-text"
                    }`}
                  >
                    {bg.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Viewport Box */}
            <div
              className={`h-64 rounded-xl p-4 flex items-center justify-center relative overflow-hidden ${PREVIEW_BACKGROUNDS[bgIndex].style}`}
            >
              {/* Blobs */}
              <div className="absolute -top-6 -left-6 w-28 h-28 bg-pink-400 rounded-full mix-blend-multiply filter blur-lg opacity-70 animate-pulse pointer-events-none" />
              <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-cyan-400 rounded-full mix-blend-multiply filter blur-lg opacity-70 animate-pulse pointer-events-none" />

              {/* Glass Card */}
              <div
                className="relative w-full max-w-xs p-4 space-y-2 select-none"
                style={{
                  background: hexToRgba(settings.bgColor, settings.opacity),
                  backdropFilter: `blur(${settings.blur}px) saturate(${settings.saturation}%)`,
                  WebkitBackdropFilter: `blur(${settings.blur}px) saturate(${settings.saturation}%)`,
                  border: `${settings.borderWidth}px solid ${hexToRgba(settings.borderColor, settings.borderOpacity)}`,
                  borderRadius: `${settings.borderRadius}px`,
                  boxShadow: `0 8px ${settings.shadowBlur}px 0 ${hexToRgba("#000000", settings.shadowOpacity)}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white/30 backdrop-blur-md flex items-center justify-center font-bold text-white text-[10px]">
                    G
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white drop-shadow-xs">Glass Card</h4>
                    <p className="text-[10px] text-white/80">Frosted Glass UI</p>
                  </div>
                </div>
                <p className="text-[11px] text-white/90 leading-relaxed drop-shadow-xs">
                  Real-time glassmorphism effect using CSS backdrop-filter blur and transparency.
                </p>
              </div>
            </div>

            {/* CSS Output Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                  Generated CSS
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 rounded bg-xeoo-surface-soft border border-xeoo-border px-2 py-0.5 text-[11px] font-medium text-xeoo-text hover:bg-xeoo-surface transition"
                >
                  {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  <span>{copied ? "Copied" : "Copy CSS"}</span>
                </button>
              </div>

              <pre className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 font-mono text-xs text-xeoo-text overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {cssCode}
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GlassmorphismGenerator;
