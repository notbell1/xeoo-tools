import React, { useState } from "react";
import {
  Copy,
  Check,
  Sparkles,
  Link,
  Unlink,
  RotateCcw,
  Square,
} from "lucide-react";
import {
  type RadiusValues,
  generateBorderRadiusCss,
  RADIUS_PRESETS,
} from "./cssBorderRadiusLogic";
import { showSuccess, showError } from "../../alert";

export const CssBorderRadiusGenerator: React.FC = () => {
  const [values, setValues] = useState<RadiusValues>(RADIUS_PRESETS[0].values);
  const [linked, setLinked] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [boxColor, setBoxColor] = useState<string>("#6366F1");

  const cssRadius = generateBorderRadiusCss(values);

  const handleAllCorners = (val: number) => {
    setValues((prev) => ({
      ...prev,
      topLeftX: val,
      topRightX: val,
      bottomRightX: val,
      bottomLeftX: val,
      topLeftY: val,
      topRightY: val,
      bottomRightY: val,
      bottomLeftY: val,
    }));
  };

  const handleUpdate = (field: keyof RadiusValues, val: any) => {
    if (
      linked &&
      !values.is8Point &&
      (field === "topLeftX" ||
        field === "topRightX" ||
        field === "bottomRightX" ||
        field === "bottomLeftX")
    ) {
      handleAllCorners(val);
      return;
    }
    setValues((prev) => ({ ...prev, [field]: val }));
  };

  const handleApplyPreset = (preset: RadiusValues) => {
    setValues({ ...preset });
    setLinked(
      !preset.is8Point &&
        preset.topLeftX === preset.topRightX &&
        preset.topRightX === preset.bottomRightX &&
        preset.bottomRightX === preset.bottomLeftX,
    );
  };

  const handleReset = () => {
    handleApplyPreset(RADIUS_PRESETS[0].values);
    setBoxColor("#6366F1");
  };

  const maxVal = values.unit === "%" ? 100 : 200;

  const fullCss = `border-radius: ${cssRadius};
-webkit-border-radius: ${cssRadius};`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullCss);
      setCopied(true);
      showSuccess("Copied!", "CSS border-radius copied to clipboard.");
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
              <Square size={16} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xs font-extrabold tracking-tight text-xeoo-text sm:text-sm">
                CSS BORDER RADIUS GENERATOR
              </h1>
              <p className="truncate text-[11px] text-xeoo-muted">
                Generate standard 4-corner or 8-point elliptical organic shape border-radii.
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
            {RADIUS_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleApplyPreset(p.values)}
                className="inline-flex h-6.5 items-center rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-medium text-xeoo-text transition hover:bg-xeoo-surface-soft"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 gap-4 p-3.5 sm:p-5 lg:grid-cols-12">
          {/* LEFT: CONTROLS & SLIDERS */}
          <div className="space-y-4 lg:col-span-7">
            {/* Mode & Unit switcher toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2.5 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer select-none font-semibold text-xeoo-text">
                <input
                  type="checkbox"
                  checked={values.is8Point}
                  onChange={(e) => setValues((v) => ({ ...v, is8Point: e.target.checked }))}
                  className="rounded border-xeoo-border text-fuchsia-600"
                />
                <span>8-Point Elliptical</span>
              </label>

              <div className="flex items-center gap-2">
                <div className="flex items-center rounded border border-xeoo-border bg-xeoo-surface p-0.5">
                  <button
                    type="button"
                    onClick={() => setValues((v) => ({ ...v, unit: "px" }))}
                    className={`px-2 py-0.5 text-xs font-semibold rounded ${
                      values.unit === "px"
                        ? "bg-xeoo-primary text-white"
                        : "text-xeoo-muted hover:text-xeoo-text"
                    }`}
                  >
                    px
                  </button>
                  <button
                    type="button"
                    onClick={() => setValues((v) => ({ ...v, unit: "%" }))}
                    className={`px-2 py-0.5 text-xs font-semibold rounded ${
                      values.unit === "%"
                        ? "bg-xeoo-primary text-white"
                        : "text-xeoo-muted hover:text-xeoo-text"
                    }`}
                  >
                    %
                  </button>
                </div>

                {!values.is8Point && (
                  <button
                    type="button"
                    onClick={() => setLinked(!linked)}
                    className={`p-1 rounded border transition ${
                      linked
                        ? "border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400"
                        : "border-xeoo-border text-xeoo-muted hover:text-xeoo-text"
                    }`}
                    title={linked ? "Unlink corners" : "Link all corners"}
                  >
                    {linked ? <Link size={13} /> : <Unlink size={13} />}
                  </button>
                )}
              </div>
            </div>

            {/* Corner sliders */}
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-xeoo-text block mb-2">
                  {values.is8Point ? "Horizontal Radii (X)" : linked ? "All Corners" : "Corner Radii"}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                      <span>Top-Left {values.is8Point && "X"}</span>
                      <span className="font-mono text-xeoo-text">{values.topLeftX}{values.unit}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={maxVal}
                      value={values.topLeftX}
                      onChange={(e) => handleUpdate("topLeftX", parseInt(e.target.value) || 0)}
                      className="w-full accent-fuchsia-500"
                    />
                  </div>

                  {!linked && (
                    <>
                      <div>
                        <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                          <span>Top-Right {values.is8Point && "X"}</span>
                          <span className="font-mono text-xeoo-text">{values.topRightX}{values.unit}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={maxVal}
                          value={values.topRightX}
                          onChange={(e) => handleUpdate("topRightX", parseInt(e.target.value) || 0)}
                          className="w-full accent-fuchsia-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                          <span>Bottom-Right {values.is8Point && "X"}</span>
                          <span className="font-mono text-xeoo-text">{values.bottomRightX}{values.unit}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={maxVal}
                          value={values.bottomRightX}
                          onChange={(e) => handleUpdate("bottomRightX", parseInt(e.target.value) || 0)}
                          className="w-full accent-fuchsia-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                          <span>Bottom-Left {values.is8Point && "X"}</span>
                          <span className="font-mono text-xeoo-text">{values.bottomLeftX}{values.unit}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={maxVal}
                          value={values.bottomLeftX}
                          onChange={(e) => handleUpdate("bottomLeftX", parseInt(e.target.value) || 0)}
                          className="w-full accent-fuchsia-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {values.is8Point && (
                <div className="pt-2 border-t border-xeoo-border">
                  <span className="text-xs font-bold text-xeoo-text block mb-2">Vertical Radii (Y)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                        <span>Top-Left Y</span>
                        <span className="font-mono text-xeoo-text">{values.topLeftY}{values.unit}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={maxVal}
                        value={values.topLeftY}
                        onChange={(e) => handleUpdate("topLeftY", parseInt(e.target.value) || 0)}
                        className="w-full accent-fuchsia-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                        <span>Top-Right Y</span>
                        <span className="font-mono text-xeoo-text">{values.topRightY}{values.unit}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={maxVal}
                        value={values.topRightY}
                        onChange={(e) => handleUpdate("topRightY", parseInt(e.target.value) || 0)}
                        className="w-full accent-fuchsia-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                        <span>Bottom-Right Y</span>
                        <span className="font-mono text-xeoo-text">{values.bottomRightY}{values.unit}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={maxVal}
                        value={values.bottomRightY}
                        onChange={(e) => handleUpdate("bottomRightY", parseInt(e.target.value) || 0)}
                        className="w-full accent-fuchsia-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                        <span>Bottom-Left Y</span>
                        <span className="font-mono text-xeoo-text">{values.bottomLeftY}{values.unit}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={maxVal}
                        value={values.bottomLeftY}
                        onChange={(e) => handleUpdate("bottomLeftY", parseInt(e.target.value) || 0)}
                        className="w-full accent-fuchsia-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: LIVE CANVAS & CSS EXPORT */}
          <div className="space-y-4 lg:col-span-5">
            <span className="text-xs font-bold text-xeoo-text block">Live Preview</span>

            {/* Shape Preview Canvas */}
            <div className="h-60 rounded-xl border border-xeoo-border bg-xeoo-surface-soft flex items-center justify-center p-4">
              <div
                className="w-40 h-40 transition-all duration-150 flex items-center justify-center shadow-md text-white font-semibold text-xs text-center select-none"
                style={{
                  borderRadius: cssRadius,
                  backgroundColor: boxColor,
                }}
              >
                Shape Preview
              </div>
            </div>

            {/* Shape Color */}
            <div className="flex items-center justify-between rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 text-xs">
              <span className="text-xeoo-muted">Shape Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={boxColor}
                  onChange={(e) => setBoxColor(e.target.value)}
                  className="h-6 w-7 rounded border border-xeoo-border bg-transparent p-0 cursor-pointer"
                />
                <span className="font-mono text-xeoo-text">{boxColor}</span>
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
                  className="inline-flex h-7 items-center gap-1.5 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-medium text-xeoo-text shadow-xs transition hover:bg-xeoo-surface-soft"
                >
                  {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  <span>{copied ? "Copied" : "Copy CSS"}</span>
                </button>
              </div>

              <pre className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 font-mono text-xs text-xeoo-text overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {fullCss}
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CssBorderRadiusGenerator;
