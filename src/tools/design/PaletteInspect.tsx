import { useState } from "react";
import {
  Check,
  Copy,
  Globe,
  Info,
  LoaderCircle,
  Palette,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { showError, showSuccess } from "../../alert";
import {
  analyzeWebsitePalette,
  type PaletteColor,
  type PaletteInspectResult,
} from "./paletteInspectLogic";

export default function PaletteInspect() {
  const [url, setUrl] = useState("https://xeootools.site.je/");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaletteInspectResult | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleInspect = async () => {
    if (!url.trim()) {
      await showError("Input Required", "Please enter a valid website URL.");
      return;
    }

    setLoading(true);
    try {
      const data = await analyzeWebsitePalette(url);
      setResult(data);
      await showSuccess(
        "Palette Extracted",
        `Discovered ${data.total_colors_detected} colors across accessible HTML and stylesheets.`,
      );
    } catch (err) {
      await showError(
        "Analysis Failed",
        err instanceof Error ? err.message : "Could not inspect website palette.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUrl("https://xeootools.site.je/");
    setResult(null);
    setCopiedHex(null);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHex(text);
      setTimeout(() => setCopiedHex(null), 1500);
      await showSuccess("Copied", `${label} (${text}) copied to clipboard.`);
    } catch {
      await showError("Copy Error", `Could not copy ${label} to clipboard.`);
    }
  };

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
                PALETTE INSPECT
              </h1>
              <p className="truncate text-[11px] text-xeoo-muted">
                Extract color palettes, CSS variables, and design tokens from any public website URL.
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

        {/* NOTICE BANNER */}
        <div className="flex items-center gap-2 border-b border-xeoo-border bg-fuchsia-500/5 px-3.5 py-2 text-[11px] text-fuchsia-800 dark:text-fuchsia-300">
          <Info size={14} className="shrink-0 text-fuchsia-500" />
          <span>
            <strong>SSRF Protected:</strong> Safe server-side extraction. Private network addresses, localhost, and non-HTTP protocols are automatically blocked.
          </span>
        </div>

        {/* WORKSPACE */}
        <div className="p-3.5 sm:p-5 space-y-4">
          {/* URL INPUT ROW */}
          <div className="space-y-2">
            <label htmlFor="target-url" className="text-xs font-bold text-xeoo-text block">
              Target Website URL
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xeoo-muted">
                  <Globe size={15} />
                </div>
                <input
                  id="target-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void handleInspect()}
                  placeholder="https://example.com"
                  disabled={loading}
                  className="w-full rounded-md border border-xeoo-border bg-xeoo-bg py-2 pl-9 pr-3 text-xs text-xeoo-text placeholder:text-xeoo-muted/60 focus:border-xeoo-primary focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => void handleInspect()}
                disabled={loading}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-xeoo-primary px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-xeoo-primary-hover disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={14} className="animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Inspect Palette</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-xeoo-muted">
              <span>Quick inspect:</span>
              <button
                type="button"
                onClick={() => setUrl("https://xeootools.site.je/")}
                className="rounded border border-xeoo-border bg-xeoo-surface px-2 py-0.5 font-medium hover:border-xeoo-primary hover:text-xeoo-text"
              >
                xeootools.site.je
              </button>
              <button
                type="button"
                onClick={() => setUrl("https://github.com")}
                className="rounded border border-xeoo-border bg-xeoo-surface px-2 py-0.5 font-medium hover:border-xeoo-primary hover:text-xeoo-text"
              >
                github.com
              </button>
            </div>
          </div>

          {/* RESULTS VIEW */}
          {result && (
            <div className="space-y-4 pt-2 border-t border-xeoo-border">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-xeoo-muted block">Total Colors</span>
                  <p className="mt-1 font-mono text-xl font-extrabold text-xeoo-text">
                    {result.total_colors_detected}
                  </p>
                  <span className="text-[10px] text-xeoo-muted">Unique tokens</span>
                </div>

                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-xeoo-muted block">Primary Role</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="h-5 w-5 rounded border border-xeoo-border"
                      style={{ backgroundColor: result.ui_roles.likely_primary || "#000" }}
                    />
                    <span className="font-mono text-xs font-bold text-xeoo-text">
                      {result.ui_roles.likely_primary || "N/A"}
                    </span>
                  </div>
                  <span className="text-[10px] text-xeoo-muted">Accent brand</span>
                </div>

                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-xeoo-muted block">Canvas / Background</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="h-5 w-5 rounded border border-xeoo-border"
                      style={{ backgroundColor: result.ui_roles.likely_background || "#fff" }}
                    />
                    <span className="font-mono text-xs font-bold text-xeoo-text">
                      {result.ui_roles.likely_background || "N/A"}
                    </span>
                  </div>
                  <span className="text-[10px] text-xeoo-muted">Surface tone</span>
                </div>

                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-xeoo-muted block">Typography / Text</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="h-5 w-5 rounded border border-xeoo-border"
                      style={{ backgroundColor: result.ui_roles.likely_text || "#000" }}
                    />
                    <span className="font-mono text-xs font-bold text-xeoo-text">
                      {result.ui_roles.likely_text || "N/A"}
                    </span>
                  </div>
                  <span className="text-[10px] text-xeoo-muted">Body text</span>
                </div>
              </div>

              {/* Swatches Grid */}
              <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-xeoo-text">
                    Main Palette Swatches ({result.main_palette.length})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      void copyToClipboard(
                        result.main_palette.map((c) => c.hex).join(", "),
                        "all hex colors",
                      )
                    }
                    className="inline-flex items-center gap-1 rounded bg-xeoo-surface-soft border border-xeoo-border px-2 py-1 text-[11px] font-medium text-xeoo-text hover:bg-xeoo-surface"
                  >
                    <Copy size={11} />
                    <span>Copy All HEX</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
                  {result.main_palette.map((item: PaletteColor, idx: number) => {
                    const isCopied = copiedHex === item.hex;
                    return (
                      <button
                        key={`${item.hex}-${idx}`}
                        type="button"
                        onClick={() => void copyToClipboard(item.hex, item.hex)}
                        className="group flex flex-col overflow-hidden rounded-md border border-xeoo-border bg-xeoo-surface-soft text-left transition hover:border-xeoo-primary/60"
                        title={`Click to copy ${item.hex}`}
                      >
                        <div
                          className="h-12 w-full border-b border-xeoo-border/60 transition group-hover:opacity-95"
                          style={{ backgroundColor: item.hex }}
                        />
                        <div className="p-2 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-xeoo-text">
                              {item.hex}
                            </span>
                            {isCopied ? (
                              <Check size={12} className="text-emerald-500" />
                            ) : (
                              <Copy size={11} className="text-xeoo-muted opacity-0 group-hover:opacity-100" />
                            )}
                          </div>
                          <span className="text-[10px] text-xeoo-muted block truncate">
                            #{item.rank} ({item.weight_percent}%)
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CSS Variables Export */}
              {Object.keys(result.css_variables || {}).length > 0 && (
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-xeoo-text">
                      Detected CSS Custom Properties ({Object.keys(result.css_variables).length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        void copyToClipboard(
                          Object.entries(result.css_variables)
                            .map(([k, v]) => `${k}: ${v};`)
                            .join("\n"),
                          "CSS variables",
                        )
                      }
                      className="inline-flex items-center gap-1 rounded bg-xeoo-surface-soft border border-xeoo-border px-2 py-1 text-[11px] font-medium text-xeoo-text hover:bg-xeoo-surface"
                    >
                      <Copy size={11} />
                      <span>Copy Variables</span>
                    </button>
                  </div>
                  <pre className="max-h-48 overflow-y-auto rounded-md border border-xeoo-border bg-xeoo-surface-soft p-2.5 font-mono text-[11px] text-xeoo-text leading-relaxed">
                    {Object.entries(result.css_variables)
                      .map(([k, v]) => `${k}: ${v};\n`)
                      .join("")}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
