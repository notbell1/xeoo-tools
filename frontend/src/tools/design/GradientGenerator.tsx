import { useState } from "react";
import { Check, Copy, Paintbrush, Plus, RotateCcw, Sparkles, Trash2 } from "lucide-react";

import { showError, showSuccess } from "../../alert";
import {
  buildGradientCss,
  PRESET_GRADIENTS,
  type ColorStop,
  type GradientConfig,
} from "./gradientGeneratorLogic";

export default function GradientGenerator() {
  const [config, setConfig] = useState<GradientConfig>(
    PRESET_GRADIENTS[0].config,
  );
  const [copied, setCopied] = useState(false);

  const gradientCss = buildGradientCss(config);
  const fullCssOutput = `background: ${gradientCss};
background: -webkit-${gradientCss};`;

  const addStop = () => {
    if (config.stops.length >= 5) {
      void showError(
        "Limit Reached",
        "A maximum of 5 color stops is supported.",
      );
      return;
    }
    const nextStop = Math.min(
      100,
      (config.stops[config.stops.length - 1]?.stop || 50) + 15,
    );
    const newStop: ColorStop = {
      id: String(Date.now()),
      color: "#3B82F6",
      stop: nextStop,
    };
    setConfig((c) => ({ ...c, stops: [...c.stops, newStop] }));
  };

  const removeStop = (id: string) => {
    if (config.stops.length <= 2) {
      void showError(
        "Minimum Stops",
        "A gradient requires at least 2 color stops.",
      );
      return;
    }
    setConfig((c) => ({
      ...c,
      stops: c.stops.filter((s) => s.id !== id),
    }));
  };

  const updateStopColor = (id: string, color: string) => {
    setConfig((c) => ({
      ...c,
      stops: c.stops.map((s) => (s.id === id ? { ...s, color } : s)),
    }));
  };

  const updateStopPosition = (id: string, stop: number) => {
    setConfig((c) => ({
      ...c,
      stops: c.stops.map((s) => (s.id === id ? { ...s, stop } : s)),
    }));
  };

  const handleReset = () => {
    setConfig(PRESET_GRADIENTS[0].config);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullCssOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      await showSuccess("Copied", "Gradient CSS copied to clipboard.");
    } catch {
      await showError("Copy Error", "Failed to copy CSS to clipboard.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-3 py-4 sm:px-5 sm:py-6">
      <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
        {/* HEADER TOOLBAR */}
        <div className="flex items-center justify-between gap-3 border-b border-xeoo-border px-3.5 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400">
              <Paintbrush size={16} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xs font-extrabold tracking-tight text-xeoo-text sm:text-sm">
                GRADIENT GENERATOR
              </h1>
              <p className="truncate text-[11px] text-xeoo-muted">
                Design linear and radial multi-stop CSS gradients with live preview and CSS export.
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

        {/* NOTICE / PRESET BAR */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-xeoo-border bg-fuchsia-500/5 px-3.5 py-2 text-[11px] text-fuchsia-800 dark:text-fuchsia-300">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="shrink-0 text-fuchsia-500" />
            <span className="font-semibold">Quick Presets:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {PRESET_GRADIENTS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setConfig(p.config)}
                className="rounded border border-xeoo-border bg-xeoo-surface px-2 py-0.5 text-[10px] font-medium text-xeoo-text hover:border-xeoo-primary transition"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 gap-4 p-3.5 sm:p-5 lg:grid-cols-12">
          {/* LEFT: CONTROLS & STOPS */}
          <div className="space-y-4 lg:col-span-6">
            {/* Type & Angle */}
            <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-xeoo-text">Gradient Type</span>
                <div className="flex rounded-md border border-xeoo-border p-0.5 bg-xeoo-surface">
                  <button
                    type="button"
                    onClick={() => setConfig((c) => ({ ...c, type: "linear" }))}
                    className={`px-3 py-1 text-xs font-semibold rounded transition ${
                      config.type === "linear"
                        ? "bg-xeoo-primary text-white"
                        : "text-xeoo-muted hover:text-xeoo-text"
                    }`}
                  >
                    Linear
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig((c) => ({ ...c, type: "radial" }))}
                    className={`px-3 py-1 text-xs font-semibold rounded transition ${
                      config.type === "radial"
                        ? "bg-xeoo-primary text-white"
                        : "text-xeoo-muted hover:text-xeoo-text"
                    }`}
                  >
                    Radial
                  </button>
                </div>
              </div>

              {config.type === "linear" ? (
                <div>
                  <div className="flex justify-between text-xs text-xeoo-muted mb-1">
                    <span>Angle Direction</span>
                    <span className="font-mono text-xeoo-text">{config.angle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={config.angle}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, angle: parseInt(e.target.value) || 0 }))
                    }
                    className="w-full accent-fuchsia-500"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-xeoo-muted">Radial Shape</span>
                  <select
                    value={config.shape}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        shape: e.target.value as "circle" | "ellipse",
                      }))
                    }
                    className="rounded border border-xeoo-border bg-xeoo-surface px-2 py-1 text-xs text-xeoo-text focus:outline-none"
                  >
                    <option value="circle">Circle</option>
                    <option value="ellipse">Ellipse</option>
                  </select>
                </div>
              )}
            </div>

            {/* Color Stops List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-xeoo-text">
                  Color Stops ({config.stops.length}/5)
                </span>
                <button
                  type="button"
                  onClick={addStop}
                  disabled={config.stops.length >= 5}
                  className="inline-flex items-center gap-1 rounded bg-xeoo-surface-soft border border-xeoo-border px-2 py-1 text-[11px] font-medium text-xeoo-text hover:bg-xeoo-surface disabled:opacity-40 transition"
                >
                  <Plus size={11} />
                  <span>Add Stop</span>
                </button>
              </div>

              <div className="space-y-2">
                {config.stops.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className="flex items-center gap-2.5 rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 shadow-xs"
                  >
                    <span className="w-4 text-center font-mono text-xs font-bold text-xeoo-muted">
                      {idx + 1}
                    </span>

                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) => updateStopColor(stop.id, e.target.value)}
                      className="h-7 w-8 cursor-pointer rounded border border-xeoo-border bg-transparent p-0.5"
                    />

                    <input
                      type="text"
                      value={stop.color}
                      onChange={(e) => updateStopColor(stop.id, e.target.value)}
                      className="w-20 rounded border border-xeoo-border bg-xeoo-bg px-1.5 py-1 font-mono text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                    />

                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={stop.stop}
                        onChange={(e) =>
                          updateStopPosition(stop.id, parseInt(e.target.value) || 0)
                        }
                        className="w-full accent-fuchsia-500"
                      />
                      <span className="w-8 text-right font-mono text-xs text-xeoo-muted">
                        {stop.stop}%
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeStop(stop.id)}
                      disabled={config.stops.length <= 2}
                      className="p-1 text-xeoo-muted hover:text-xeoo-danger disabled:opacity-30 transition"
                      title="Remove stop"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: PREVIEW CANVAS & CSS EXPORT */}
          <div className="space-y-4 lg:col-span-6">
            {/* Live Preview Card */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-xeoo-text block">Preview Canvas</span>
              <div
                className="h-52 w-full rounded-xl border border-xeoo-border shadow-inner transition-all flex items-center justify-center"
                style={{ background: gradientCss }}
              >
                <div className="rounded-lg bg-black/30 backdrop-blur-xs px-3 py-1.5 text-white font-mono text-xs font-medium">
                  {config.type.toUpperCase()} GRADIENT
                </div>
              </div>
            </div>

            {/* Generated CSS Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                  Generated CSS
                </span>
                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  className="inline-flex items-center gap-1 rounded bg-xeoo-surface-soft border border-xeoo-border px-2.5 py-1 text-[11px] font-medium text-xeoo-text hover:bg-xeoo-surface transition"
                >
                  {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  <span>{copied ? "Copied" : "Copy CSS"}</span>
                </button>
              </div>

              <pre className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 font-mono text-xs text-xeoo-text overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {fullCssOutput}
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
