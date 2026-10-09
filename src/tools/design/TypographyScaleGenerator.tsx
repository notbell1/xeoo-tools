import React, { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Check, Type, RotateCcw, Info, ChevronDown } from "lucide-react";
import {
  MODULAR_RATIOS,
  generateTypeScale,
  generateTypeScaleCss,
} from "./typographyScaleLogic";
import { showSuccess, showError } from "../../alert";

const DROPDOWN_MAX_HEIGHT = 192;
const DROPDOWN_GAP = 4;
const VIEWPORT_PADDING = 8;
const DROPDOWN_ITEM_HEIGHT = 34;

type DropdownPosition = {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
};

type RatioDropdownProps = {
  value: number;
  onChange: (value: number) => void;
};

const ratioTriggerClass =
  "flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 text-left text-[11px] font-medium text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20";

const RatioDropdown: React.FC<RatioDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<DropdownPosition | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedRatio = MODULAR_RATIOS.find((ratio) => ratio.value === value);

  const updatePosition = () => {
    const trigger = triggerRef.current;

    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();

    // Lebar dan posisi menu mengikuti tombol dropdown.
    const width = Math.min(
      rect.width,
      window.innerWidth - VIEWPORT_PADDING * 2,
    );

    const left = Math.max(
      VIEWPORT_PADDING,
      Math.min(rect.left, window.innerWidth - width - VIEWPORT_PADDING),
    );

    const desiredHeight = Math.min(
      DROPDOWN_MAX_HEIGHT,
      MODULAR_RATIOS.length * DROPDOWN_ITEM_HEIGHT + 8,
    );

    const spaceAbove = Math.max(0, rect.top - VIEWPORT_PADDING - DROPDOWN_GAP);

    const spaceBelow = Math.max(
      0,
      window.innerHeight - rect.bottom - VIEWPORT_PADDING - DROPDOWN_GAP,
    );

    // Buka ke atas jika menu tidak muat di bawah.
    const openUp = spaceBelow < desiredHeight && spaceAbove > spaceBelow;

    const availableSpace = openUp ? spaceAbove : spaceBelow;
    const maxHeight = Math.min(desiredHeight, availableSpace);

    const top = openUp
      ? rect.top - maxHeight - DROPDOWN_GAP
      : rect.bottom + DROPDOWN_GAP;

    setPosition({
      left,
      top,
      width,
      maxHeight,
    });
  };

  useEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }

    updatePosition();

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        containerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleViewportChange = () => {
      updatePosition();
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-w-0 ${isOpen ? "z-[100]" : "z-0"}`}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
        className={ratioTriggerClass}
      >
        <span className="min-w-0 flex-1 truncate">
          {selectedRatio
            ? `${selectedRatio.name} (${selectedRatio.value})`
            : value}
        </span>

        <ChevronDown
          size={13}
          className={`shrink-0 text-xeoo-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && position && position.maxHeight > 0 && (
        <div
          ref={menuRef}
          role="listbox"
          aria-label="Scale Ratio"
          className="fixed z-[9999] overflow-hidden rounded-md border border-xeoo-border bg-xeoo-surface p-1 shadow-2xl"
          style={{
            left: position.left,
            top: position.top,
            width: position.width,
            maxHeight: position.maxHeight,
          }}
        >
          <div
            className="overflow-x-hidden overflow-y-auto overscroll-contain"
            style={{ maxHeight: Math.max(0, position.maxHeight - 8) }}
          >
            {MODULAR_RATIOS.map((ratio) => {
              const isSelected = ratio.value === value;

              return (
                <button
                  key={ratio.name}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(ratio.value);
                    setIsOpen(false);
                  }}
                  className={`flex min-h-[30px] w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-[11px] font-medium transition ${
                    isSelected
                      ? "bg-xeoo-primary text-white"
                      : "text-xeoo-text hover:bg-xeoo-bg"
                  }`}
                >
                  <span className="min-w-0 flex-1 whitespace-normal break-words">
                    {ratio.name} ({ratio.value})
                  </span>

                  {isSelected && <Check size={12} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const TypographyScaleGenerator: React.FC = () => {
  const [baseSize, setBaseSize] = useState<number>(16);
  const [selectedRatio, setSelectedRatio] = useState<number>(1.25);
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

      void showSuccess(
        "Copied!",
        "CSS typography variables copied to clipboard.",
      );

      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      void showError("Copy Failed", "Failed to copy CSS.");
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
                Generate harmonious modular typography scales with PX, REM, and
                CSS variables.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
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
            <strong className="font-semibold text-xeoo-text">
              Modular Hierarchy:
            </strong>{" "}
            Based on musical intervals and design ratios. REM units are computed
            relative to standard 16px root font size.
          </span>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 gap-4 p-3.5 sm:p-5 lg:grid-cols-12">
          {/* LEFT: CONTROLS & SCALE HIERARCHY */}
          <div className="min-w-0 space-y-4 lg:col-span-7">
            {/* CONFIG BOX */}
            <div className="space-y-3 rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                Scale Settings
              </span>

              <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                <div className="min-w-0">
                  <label
                    htmlFor="typography-base-size"
                    className="mb-1 block text-xeoo-muted"
                  >
                    Base Size (px)
                  </label>

                  <div className="flex items-center gap-1.5">
                    <input
                      id="typography-base-size"
                      type="number"
                      min="10"
                      max="32"
                      value={baseSize}
                      onChange={(event) =>
                        setBaseSize(
                          Math.max(8, parseInt(event.target.value) || 16),
                        )
                      }
                      className="h-8 w-full min-w-0 rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 font-mono text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                    />

                    <span className="font-mono text-xs text-xeoo-muted">
                      px
                    </span>
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="mb-1 block text-xeoo-muted">
                    Scale Ratio
                  </label>

                  <RatioDropdown
                    value={selectedRatio}
                    onChange={setSelectedRatio}
                  />
                </div>

                <div className="min-w-0 sm:col-span-2">
                  <label
                    htmlFor="typography-preview-text"
                    className="mb-1 block text-xeoo-muted"
                  >
                    Preview Text
                  </label>

                  <input
                    id="typography-preview-text"
                    type="text"
                    value={previewText}
                    onChange={(event) => setPreviewText(event.target.value)}
                    className="h-8 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                    placeholder="Custom preview sentence..."
                  />
                </div>
              </div>
            </div>

            {/* HIERARCHY STACK */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-xeoo-text">
                Hierarchy Preview
              </span>

              <div className="space-y-2">
                {[...steps].reverse().map((step) => (
                  <div
                    key={step.cssVar}
                    className="space-y-1 overflow-hidden rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 transition hover:border-fuchsia-500/40"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-xeoo-border/50 pb-1.5 text-xs">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="shrink-0 text-xs font-bold text-xeoo-text">
                          {step.label}
                        </span>

                        <span className="min-w-0 truncate font-mono text-[10px] text-xeoo-muted">
                          {step.cssVar}
                        </span>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5 font-mono text-xs">
                        <span className="font-bold text-fuchsia-600 dark:text-fuchsia-400">
                          {step.px}px
                        </span>

                        <span className="text-xeoo-muted">/</span>

                        <span className="text-[11px] text-xeoo-muted">
                          {step.rem}rem
                        </span>
                      </div>
                    </div>

                    <div
                      className="truncate py-0.5 font-sans leading-tight text-xeoo-text"
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
          <div className="min-w-0 space-y-4 lg:col-span-5">
            {/* CSS EXPORT */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                  CSS Custom Properties
                </span>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-medium text-xeoo-text shadow-xs transition hover:bg-xeoo-surface-soft"
                >
                  {copied ? (
                    <Check size={11} className="text-emerald-500" />
                  ) : (
                    <Copy size={11} />
                  )}

                  <span>{copied ? "Copied" : "Copy Variables"}</span>
                </button>
              </div>

              <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 font-mono text-xs leading-relaxed text-xeoo-text">
                {cssVariables}
              </pre>
            </div>

            {/* SUMMARY TABLE */}
            <div className="space-y-2 rounded-lg border border-xeoo-border bg-xeoo-surface p-3">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                Scale Values Table
              </span>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-xeoo-border text-xeoo-muted">
                      <th className="pb-1 font-medium">Step</th>
                      <th className="pb-1 font-medium">PX</th>
                      <th className="pb-1 font-medium">REM</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-xeoo-border/50 font-mono text-[11px]">
                    {steps.map((step) => (
                      <tr key={step.label}>
                        <td className="py-1 font-sans text-xeoo-text">
                          {step.label}
                        </td>

                        <td className="py-1 font-semibold text-fuchsia-600 dark:text-fuchsia-400">
                          {step.px}px
                        </td>

                        <td className="py-1 text-xeoo-muted">{step.rem}rem</td>
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
