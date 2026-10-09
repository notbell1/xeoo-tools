import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  RotateCcw,
  Layers,
} from "lucide-react";
import {
  type ShadowLayer,
  generateBoxShadowCss,
  SHADOW_PRESETS,
} from "./cssShadowGeneratorLogic";
import { showSuccess, showError } from "../../alert";

export const CssShadowGenerator: React.FC = () => {
  const [layers, setLayers] = useState<ShadowLayer[]>(SHADOW_PRESETS[0].layers);
  const [boxColor, setBoxColor] = useState<string>("#FFFFFF");
  const [previewBg, setPreviewBg] = useState<string>("#F1F5F9");
  const [borderRadius, setBorderRadius] = useState<number>(16);
  const [copied, setCopied] = useState<boolean>(false);

  const shadowCss = generateBoxShadowCss(layers);

  const handleAddLayer = () => {
    const newLayer: ShadowLayer = {
      id: Math.random().toString(36).substring(2, 9),
      x: 0,
      y: 6,
      blur: 12,
      spread: 0,
      color: "#000000",
      opacity: 0.15,
      inset: false,
      active: true,
    };
    setLayers([...layers, newLayer]);
  };

  const handleUpdateLayer = (id: string, updates: Partial<ShadowLayer>) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const handleRemoveLayer = (id: string) => {
    if (layers.length <= 1) return;
    setLayers(layers.filter((l) => l.id !== id));
  };

  const handleApplyPreset = (presetLayers: ShadowLayer[]) => {
    setLayers(JSON.parse(JSON.stringify(presetLayers)));
  };

  const handleReset = () => {
    handleApplyPreset(SHADOW_PRESETS[0].layers);
    setBoxColor("#FFFFFF");
    setPreviewBg("#F1F5F9");
    setBorderRadius(16);
  };

  const fullCssCode = `box-shadow: ${shadowCss};
-webkit-box-shadow: ${shadowCss};`;

  const handleCopyCss = async () => {
    try {
      await navigator.clipboard.writeText(fullCssCode);
      setCopied(true);
      showSuccess("Copied!", "CSS box-shadow code copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showError("Copy Failed", "Failed to copy CSS to clipboard.");
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
                CSS SHADOW GENERATOR
              </h1>
              <p className="truncate text-[11px] text-xeoo-muted">
                Create multi-layer box shadows with custom offsets, blur, spread, colors, and inset controls.
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

        {/* PRESETS BAR */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-xeoo-border bg-xeoo-surface-soft px-3.5 py-2 text-[11px] text-xeoo-text-soft">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="shrink-0 text-xeoo-primary" />
            <span className="font-semibold text-xeoo-text">Presets:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {SHADOW_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset.layers)}
                className="inline-flex h-6.5 items-center rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-medium text-xeoo-text transition hover:bg-xeoo-surface-soft"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 gap-4 p-3.5 sm:p-5 lg:grid-cols-12">
          {/* LEFT: LAYER CONTROLS */}
          <div className="space-y-3 lg:col-span-7">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-xeoo-text">
                Shadow Layers ({layers.length})
              </span>
              <button
                type="button"
                onClick={handleAddLayer}
                className="inline-flex h-7 items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-medium text-xeoo-text shadow-xs transition hover:bg-xeoo-surface-soft"
              >
                <Plus size={12} />
                <span>Add Layer</span>
              </button>
            </div>

            <div className="space-y-3">
              {layers.map((layer, index) => (
                <div
                  key={layer.id}
                  className={`rounded-lg border p-3 space-y-3 transition ${
                    layer.active
                      ? "border-xeoo-border bg-xeoo-surface-soft"
                      : "border-xeoo-border/50 bg-xeoo-surface/40 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-xeoo-border/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-4 w-4 items-center justify-center rounded bg-xeoo-surface border border-xeoo-border text-[10px] font-bold text-xeoo-text">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-xeoo-text">
                        {layer.inset ? "Inset Shadow" : "Drop Shadow"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateLayer(layer.id, { active: !layer.active })}
                        className="p-1 text-xeoo-muted hover:text-xeoo-text"
                        title={layer.active ? "Disable layer" : "Enable layer"}
                      >
                        {layer.active ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      {layers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLayer(layer.id)}
                          className="p-1 text-xeoo-muted hover:text-rose-500"
                          title="Remove layer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Range Sliders */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                        <span>X Offset</span>
                        <span className="font-mono text-xeoo-text">{layer.x}px</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={layer.x}
                        onChange={(e) =>
                          handleUpdateLayer(layer.id, { x: parseInt(e.target.value) || 0 })
                        }
                        className="w-full accent-fuchsia-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                        <span>Y Offset</span>
                        <span className="font-mono text-xeoo-text">{layer.y}px</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={layer.y}
                        onChange={(e) =>
                          handleUpdateLayer(layer.id, { y: parseInt(e.target.value) || 0 })
                        }
                        className="w-full accent-fuchsia-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                        <span>Blur</span>
                        <span className="font-mono text-xeoo-text">{layer.blur}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={layer.blur}
                        onChange={(e) =>
                          handleUpdateLayer(layer.id, { blur: parseInt(e.target.value) || 0 })
                        }
                        className="w-full accent-fuchsia-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                        <span>Spread</span>
                        <span className="font-mono text-xeoo-text">{layer.spread}px</span>
                      </div>
                      <input
                        type="range"
                        min="-40"
                        max="40"
                        value={layer.spread}
                        onChange={(e) =>
                          handleUpdateLayer(layer.id, { spread: parseInt(e.target.value) || 0 })
                        }
                        className="w-full accent-fuchsia-500"
                      />
                    </div>
                  </div>

                  {/* Color, Opacity & Inset */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-xeoo-muted">Color:</span>
                      <input
                        type="color"
                        value={layer.color}
                        onChange={(e) => handleUpdateLayer(layer.id, { color: e.target.value })}
                        className="h-6 w-7 rounded border border-xeoo-border bg-transparent p-0.5 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={layer.color}
                        onChange={(e) => handleUpdateLayer(layer.id, { color: e.target.value })}
                        className="w-16 rounded border border-xeoo-border bg-xeoo-surface px-1.5 py-0.5 font-mono text-[11px] text-xeoo-text"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
                      <span className="text-[11px] text-xeoo-muted">Opacity:</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={layer.opacity}
                        onChange={(e) =>
                          handleUpdateLayer(layer.id, { opacity: parseFloat(e.target.value) })
                        }
                        className="flex-1 accent-fuchsia-500"
                      />
                      <span className="font-mono text-[11px] text-xeoo-muted w-7 text-right">
                        {Math.round(layer.opacity * 100)}%
                      </span>
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-medium text-xeoo-text">
                      <input
                        type="checkbox"
                        checked={layer.inset}
                        onChange={(e) => handleUpdateLayer(layer.id, { inset: e.target.checked })}
                        className="rounded border-xeoo-border text-fuchsia-600"
                      />
                      <span>Inset</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: LIVE CANVAS & CSS EXPORT */}
          <div className="space-y-4 lg:col-span-5">
            <span className="text-xs font-bold text-xeoo-text block">Live Preview</span>

            {/* Viewport Box */}
            <div
              className="h-64 rounded-xl border border-xeoo-border flex items-center justify-center p-4 transition-colors"
              style={{ backgroundColor: previewBg }}
            >
              <div
                className="w-36 h-36 flex items-center justify-center p-3 text-center transition-all select-none"
                style={{
                  backgroundColor: boxColor,
                  borderRadius: `${borderRadius}px`,
                  boxShadow: shadowCss,
                }}
              >
                <span className="text-[11px] font-semibold text-slate-700">Preview Box</span>
              </div>
            </div>

            {/* Canvas Customization */}
            <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 space-y-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted block">
                Preview Settings
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-xeoo-muted block mb-1">Box Color</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={boxColor}
                      onChange={(e) => setBoxColor(e.target.value)}
                      className="h-6 w-7 rounded border border-xeoo-border bg-transparent p-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={boxColor}
                      onChange={(e) => setBoxColor(e.target.value)}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface px-1.5 py-0.5 font-mono text-[11px] text-xeoo-text"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-xeoo-muted block mb-1">Canvas Background</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={previewBg}
                      onChange={(e) => setPreviewBg(e.target.value)}
                      className="h-6 w-7 rounded border border-xeoo-border bg-transparent p-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={previewBg}
                      onChange={(e) => setPreviewBg(e.target.value)}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface px-1.5 py-0.5 font-mono text-[11px] text-xeoo-text"
                    />
                  </div>
                </div>

                <div className="col-span-2 pt-1">
                  <div className="flex justify-between text-[11px] text-xeoo-muted mb-0.5">
                    <span>Border Radius</span>
                    <span className="font-mono text-xeoo-text">{borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(parseInt(e.target.value) || 0)}
                    className="w-full accent-fuchsia-500"
                  />
                </div>
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
                  onClick={handleCopyCss}
                  className="inline-flex h-7 items-center gap-1.5 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-medium text-xeoo-text shadow-xs transition hover:bg-xeoo-surface-soft"
                >
                  {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  <span>{copied ? "Copied" : "Copy CSS"}</span>
                </button>
              </div>

              <pre className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 font-mono text-xs text-xeoo-text overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {fullCssCode}
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CssShadowGenerator;
