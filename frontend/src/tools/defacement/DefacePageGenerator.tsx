import { useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileCode,
  Image as ImageIcon,
  Lock,
  Maximize2,
  Minimize2,
  Monitor,
  Palette,
  RotateCcw,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Tablet,
  Terminal,
  Type,
  Upload,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import Footer from "../../components/Footer";
import {
  DEFACEMENT_THEMES,
  DEFAULT_GENERATOR_CONFIG,
  type GeneratorConfig,
  type ImageTransformConfig,
} from "./defacementTemplates";
import {
  generateGeneratorHtml,
  sanitizeFileName,
} from "./defacementGeneratorLogic";

export default function DefacePageGenerator() {
  const [config, setConfig] = useState<GeneratorConfig>(
    DEFAULT_GENERATOR_CONFIG,
  );
  const [activeTab, setActiveTab] = useState<
    "content" | "theme" | "images" | "effects" | "terminal" | "export"
  >("content");
  const [activeImageKey, setActiveImageKey] = useState<
    "logo" | "heroImage" | "backgroundImage" | "avatar"
  >("logo");
  const [deviceView, setDeviceView] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [exportFileName, setExportFileName] = useState("index.html");
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate standalone HTML
  const standaloneHtml = useMemo(() => {
    return generateGeneratorHtml(config);
  }, [config]);

  // Handle local image file upload into browser memory (FileReader Base64)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetKey: "logo" | "heroImage" | "backgroundImage" | "avatar",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5 MB. Please choose a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setConfig((prev) => ({
        ...prev,
        [targetKey]: {
          ...prev[targetKey],
          dataUrl,
          fileName: file.name,
        },
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeImage = (
    targetKey: "logo" | "heroImage" | "backgroundImage" | "avatar",
  ) => {
    setConfig((prev) => ({
      ...prev,
      [targetKey]: {
        ...prev[targetKey],
        dataUrl: "",
        fileName: "",
      },
    }));
  };

  const updateImageTransform = (
    targetKey: "logo" | "heroImage" | "backgroundImage" | "avatar",
    patch: Partial<ImageTransformConfig>,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [targetKey]: {
        ...prev[targetKey],
        ...patch,
      },
    }));
  };

  const handleDownload = (extension: "html" | "htm") => {
    let cleanName = sanitizeFileName(exportFileName);
    if (extension === "htm") {
      cleanName = cleanName.replace(/\.html$/i, ".htm");
      if (!cleanName.endsWith(".htm")) cleanName += ".htm";
    }

    const blob = new Blob([standaloneHtml], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = cleanName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopySource = async () => {
    try {
      await navigator.clipboard.writeText(standaloneHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleReset = () => {
    if (
      confirm("Reset all generator settings to default? Local edits will be cleared.")
    ) {
      setConfig(DEFAULT_GENERATOR_CONFIG);
    }
  };

  const currentActiveImage = config[activeImageKey];

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-4 sm:px-5 sm:py-6">
        {/* COMPACT HEADER WITH PRIVACY BADGE */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xeoo-danger">
              <ShieldAlert className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Cybersecurity Simulation Tool
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-xeoo-text sm:text-2xl">
              Deface Page Generator
            </h1>
            <p className="text-xs text-xeoo-muted leading-relaxed">
              Design and export professional standalone cybersecurity simulation
              and defacement landing pages with 100% local browser execution.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-1.5 text-[11px] text-xeoo-muted shadow-xs">
            <Lock className="h-3.5 w-3.5 text-xeoo-success shrink-0" />
            <span>
              <strong className="text-xeoo-text">Local files only</strong>:
              Images never leave your browser memory.
            </span>
          </div>
        </div>

        {/* WORKSPACE GRID: CONTROLS (LEFT) + LIVE PREVIEW (RIGHT) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* LEFT PANEL: CONFIGURATION TABS (5 COLS) */}
          <div className="space-y-3 lg:col-span-5">
            {/* TABS HEADER */}
            <div className="flex flex-wrap gap-1 rounded-xl border border-xeoo-border bg-xeoo-surface p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab("content")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  activeTab === "content"
                    ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                    : "text-xeoo-muted hover:text-xeoo-text"
                }`}
              >
                <Type className="h-3.5 w-3.5" />
                <span>Content</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("theme")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  activeTab === "theme"
                    ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                    : "text-xeoo-muted hover:text-xeoo-text"
                }`}
              >
                <Palette className="h-3.5 w-3.5" />
                <span>Theme</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("images")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  activeTab === "images"
                    ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                    : "text-xeoo-muted hover:text-xeoo-text"
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Images</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("effects")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  activeTab === "effects"
                    ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                    : "text-xeoo-muted hover:text-xeoo-text"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Effects</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("terminal")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  activeTab === "terminal"
                    ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                    : "text-xeoo-muted hover:text-xeoo-text"
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Console</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("export")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  activeTab === "export"
                    ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                    : "text-xeoo-muted hover:text-xeoo-text"
                }`}
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
              </button>
            </div>

            {/* TAB 1: CONTENT & IDENTITY */}
            {activeTab === "content" && (
              <div className="space-y-3.5 rounded-xl border border-xeoo-border bg-xeoo-surface p-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-xeoo-border pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                    Identity & Headings
                  </h3>
                  <span className="text-[10px] text-xeoo-muted">
                    Custom Text Fields
                  </span>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-xeoo-text">
                      Attacker / Simulator Alias
                    </label>
                    <input
                      type="text"
                      value={config.alias}
                      onChange={(e) =>
                        setConfig({ ...config, alias: e.target.value })
                      }
                      className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs text-xeoo-text outline-none focus:border-xeoo-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-xeoo-text">
                      Team / Crew Name
                    </label>
                    <input
                      type="text"
                      value={config.teamName}
                      onChange={(e) =>
                        setConfig({ ...config, teamName: e.target.value })
                      }
                      className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs text-xeoo-text outline-none focus:border-xeoo-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-xeoo-text">
                    Main Headline
                  </label>
                  <input
                    type="text"
                    value={config.headline}
                    onChange={(e) =>
                      setConfig({ ...config, headline: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs text-xeoo-text outline-none focus:border-xeoo-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-xeoo-text">
                    Subtitle / Secondary Header
                  </label>
                  <input
                    type="text"
                    value={config.subtitle}
                    onChange={(e) =>
                      setConfig({ ...config, subtitle: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs text-xeoo-text outline-none focus:border-xeoo-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-xeoo-text">
                    Main Educational Message
                  </label>
                  <textarea
                    rows={2}
                    value={config.message}
                    onChange={(e) =>
                      setConfig({ ...config, message: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs text-xeoo-text outline-none focus:border-xeoo-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-xeoo-text">
                    Secondary Advisory Note
                  </label>
                  <textarea
                    rows={2}
                    value={config.secondaryMessage}
                    onChange={(e) =>
                      setConfig({ ...config, secondaryMessage: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs text-xeoo-text outline-none focus:border-xeoo-primary"
                  />
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-xeoo-text">
                      Security Quote
                    </label>
                    <input
                      type="text"
                      value={config.quoteText}
                      onChange={(e) =>
                        setConfig({ ...config, quoteText: e.target.value })
                      }
                      className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs text-xeoo-text outline-none focus:border-xeoo-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-xeoo-text">
                      Quote Author
                    </label>
                    <input
                      type="text"
                      value={config.quoteAuthor}
                      onChange={(e) =>
                        setConfig({ ...config, quoteAuthor: e.target.value })
                      }
                      className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs text-xeoo-text outline-none focus:border-xeoo-primary"
                    />
                  </div>
                </div>

                {/* Section Visibility Toggles */}
                <div className="border-t border-xeoo-border pt-3">
                  <span className="block text-[11px] font-bold text-xeoo-text mb-2">
                    Section Toggles
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showBadge}
                        onChange={(e) =>
                          setConfig({ ...config, showBadge: e.target.checked })
                        }
                        className="rounded border-xeoo-border text-xeoo-primary"
                      />
                      <span>Badge Pill</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showSubtitle}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            showSubtitle: e.target.checked,
                          })
                        }
                        className="rounded border-xeoo-border text-xeoo-primary"
                      />
                      <span>Subtitle</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showQuote}
                        onChange={(e) =>
                          setConfig({ ...config, showQuote: e.target.checked })
                        }
                        className="rounded border-xeoo-border text-xeoo-primary"
                      />
                      <span>Quote Box</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showStats}
                        onChange={(e) =>
                          setConfig({ ...config, showStats: e.target.checked })
                        }
                        className="rounded border-xeoo-border text-xeoo-primary"
                      />
                      <span>Telemetry Stats</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showTerminal}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            showTerminal: e.target.checked,
                          })
                        }
                        className="rounded border-xeoo-border text-xeoo-primary"
                      />
                      <span>Terminal Console</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showSimulationLabel}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            showSimulationLabel: e.target.checked,
                          })
                        }
                        className="rounded border-xeoo-border text-xeoo-primary"
                      />
                      <span>Top Simulation Bar</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: THEMES (12 DISTINCT COMPOSITIONS) */}
            {activeTab === "theme" && (
              <div className="space-y-3 rounded-xl border border-xeoo-border bg-xeoo-surface p-4 shadow-xs">
                <div className="border-b border-xeoo-border pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                    Composition & Visual Themes
                  </h3>
                  <p className="mt-0.5 text-[11px] text-xeoo-muted">
                    Each preset completely shifts the layout, typography, and
                    cyber aesthetic.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {DEFACEMENT_THEMES.map((theme) => {
                    const isSelected = config.themeId === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          setConfig({
                            ...config,
                            themeId: theme.id,
                            layout: theme.layout,
                            effects: {
                              ...config.effects,
                              ...theme.defaultEffects,
                            },
                          });
                        }}
                        className={`group flex flex-col rounded-lg border p-2.5 text-left transition ${
                          isSelected
                            ? "border-xeoo-primary bg-xeoo-primary-soft ring-1 ring-xeoo-primary"
                            : "border-xeoo-border bg-xeoo-surface-soft hover:border-xeoo-border-dark"
                        }`}
                      >
                        <div
                          className="h-10 w-full rounded border flex items-center justify-center font-mono text-[9px] font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: theme.bgColor,
                            color: theme.accentColor,
                            borderColor: theme.borderColor,
                          }}
                        >
                          {theme.category}
                        </div>
                        <span className="mt-1.5 block text-xs font-bold text-xeoo-text">
                          {theme.name}
                        </span>
                        <span className="mt-0.5 line-clamp-2 text-[10px] text-xeoo-muted">
                          {theme.tagline}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: IMAGES & PRIVACY CONTROLS */}
            {activeTab === "images" && (
              <div className="space-y-3.5 rounded-xl border border-xeoo-border bg-xeoo-surface p-4 shadow-xs">
                <div className="border-b border-xeoo-border pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                    Local Image Asset Management
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 rounded-md bg-xeoo-surface-soft border border-xeoo-border p-2 text-[10px] text-xeoo-muted">
                    <Lock className="h-3 w-3 text-xeoo-success shrink-0" />
                    <span>
                      Zero upload: Selected images remain in client RAM.
                    </span>
                  </div>
                </div>

                {/* Sub-selector for Logo, Hero, Background, Avatar */}
                <div className="flex gap-1.5">
                  {(
                    [
                      { key: "logo", label: "Logo" },
                      { key: "heroImage", label: "Hero Banner" },
                      { key: "backgroundImage", label: "Background" },
                      { key: "avatar", label: "Avatar" },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveImageKey(item.key)}
                      className={`flex-1 rounded-md py-1 text-[11px] font-semibold border ${
                        activeImageKey === item.key
                          ? "border-xeoo-primary bg-xeoo-primary-soft text-xeoo-primary font-bold"
                          : "border-xeoo-border bg-xeoo-surface-soft text-xeoo-muted hover:text-xeoo-text"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Upload or change active image */}
                <div className="rounded-lg border border-dashed border-xeoo-border p-3 text-center">
                  {currentActiveImage.dataUrl ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center">
                        <img
                          src={currentActiveImage.dataUrl}
                          alt="Uploaded asset"
                          className="h-20 w-20 object-contain rounded border border-xeoo-border"
                        />
                      </div>
                      <p className="text-[11px] font-semibold text-xeoo-text truncate">
                        {currentActiveImage.fileName || "Custom Asset"}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeImage(activeImageKey)}
                        className="rounded bg-xeoo-danger-soft px-3 py-1 text-[11px] font-bold text-xeoo-danger hover:bg-xeoo-danger/20"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto h-6 w-6 text-xeoo-muted" />
                      <p className="mt-1 text-xs font-semibold text-xeoo-text">
                        Upload {activeImageKey}
                      </p>
                      <p className="text-[10px] text-xeoo-muted">
                        PNG, JPG, SVG, WebP (Max 5MB)
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, activeImageKey)}
                        className="hidden"
                        id="image-file-input"
                      />
                      <label
                        htmlFor="image-file-input"
                        className="mt-2 inline-block cursor-pointer rounded-md bg-xeoo-text px-3 py-1.5 text-xs font-bold text-xeoo-surface"
                      >
                        Choose Local File
                      </label>
                    </div>
                  )}
                </div>

                {/* Detailed Image Dimension and Effect Controls */}
                {currentActiveImage.dataUrl && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] text-xeoo-muted">
                          Width ({currentActiveImage.width}px)
                        </label>
                        <input
                          type="range"
                          min="40"
                          max="600"
                          value={currentActiveImage.width}
                          onChange={(e) =>
                            updateImageTransform(activeImageKey, {
                              width: Number(e.target.value),
                            })
                          }
                          className="w-full accent-xeoo-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-xeoo-muted">
                          Height ({currentActiveImage.height}px)
                        </label>
                        <input
                          type="range"
                          min="40"
                          max="600"
                          value={currentActiveImage.height}
                          onChange={(e) =>
                            updateImageTransform(activeImageKey, {
                              height: Number(e.target.value),
                            })
                          }
                          className="w-full accent-xeoo-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-xeoo-muted">
                          Rotation ({currentActiveImage.rotation}°)
                        </label>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={currentActiveImage.rotation}
                          onChange={(e) =>
                            updateImageTransform(activeImageKey, {
                              rotation: Number(e.target.value),
                            })
                          }
                          className="w-full accent-xeoo-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-xeoo-muted">
                          Opacity (
                          {Math.round(currentActiveImage.opacity * 100)}%)
                        </label>
                        <input
                          type="range"
                          min="0.05"
                          max="1"
                          step="0.05"
                          value={currentActiveImage.opacity}
                          onChange={(e) =>
                            updateImageTransform(activeImageKey, {
                              opacity: Number(e.target.value),
                            })
                          }
                          className="w-full accent-xeoo-primary"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateImageTransform(activeImageKey, {
                            flipH: !currentActiveImage.flipH,
                          })
                        }
                        className={`flex-1 rounded py-1 text-[10px] font-bold border ${
                          currentActiveImage.flipH
                            ? "bg-xeoo-primary text-white border-xeoo-primary"
                            : "border-xeoo-border bg-xeoo-surface text-xeoo-muted"
                        }`}
                      >
                        Flip Horizontal
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateImageTransform(activeImageKey, {
                            flipV: !currentActiveImage.flipV,
                          })
                        }
                        className={`flex-1 rounded py-1 text-[10px] font-bold border ${
                          currentActiveImage.flipV
                            ? "bg-xeoo-primary text-white border-xeoo-primary"
                            : "border-xeoo-border bg-xeoo-surface text-xeoo-muted"
                        }`}
                      >
                        Flip Vertical
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: EFFECTS & BACKGROUND */}
            {activeTab === "effects" && (
              <div className="space-y-3.5 rounded-xl border border-xeoo-border bg-xeoo-surface p-4 shadow-xs">
                <div className="border-b border-xeoo-border pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                    Visual FX & Animations
                  </h3>
                  <p className="mt-0.5 text-[11px] text-xeoo-muted">
                    Enable real-time shaders, glitch effects, and CRT scanlines.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.effects.glitchText}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          effects: {
                            ...config.effects,
                            glitchText: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-xeoo-border text-xeoo-primary"
                    />
                    <span>Glitch Heading</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.effects.scanlines}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          effects: {
                            ...config.effects,
                            scanlines: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-xeoo-border text-xeoo-primary"
                    />
                    <span>CRT Scanlines</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.effects.matrixRain}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          effects: {
                            ...config.effects,
                            matrixRain: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-xeoo-border text-xeoo-primary"
                    />
                    <span>Matrix Rain FX</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.effects.particles}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          effects: {
                            ...config.effects,
                            particles: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-xeoo-border text-xeoo-primary"
                    />
                    <span>Floating Particles</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.effects.crtFlicker}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          effects: {
                            ...config.effects,
                            crtFlicker: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-xeoo-border text-xeoo-primary"
                    />
                    <span>CRT Screen Flicker</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.effects.pulseGlow}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          effects: {
                            ...config.effects,
                            pulseGlow: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-xeoo-border text-xeoo-primary"
                    />
                    <span>Neon Pulse Glow</span>
                  </label>
                </div>

                <div className="border-t border-xeoo-border pt-3">
                  <label className="block text-[11px] font-semibold text-xeoo-text mb-1">
                    Background Pattern
                  </label>
                  <select
                    value={config.background.type}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        background: {
                          ...config.background,
                          type: e.target.value as any,
                        },
                      })
                    }
                    className="w-full rounded border border-xeoo-border bg-xeoo-bg px-2 py-1.5 text-xs text-xeoo-text outline-none"
                  >
                    <option value="solid">Solid Color</option>
                    <option value="grid">Cyberpunk Grid</option>
                    <option value="dots">Dot Matrix</option>
                    <option value="matrix">Matrix Code Rain</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB 5: TERMINAL CONSOLE */}
            {activeTab === "terminal" && (
              <div className="space-y-3.5 rounded-xl border border-xeoo-border bg-xeoo-surface p-4 shadow-xs">
                <div className="border-b border-xeoo-border pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                    Simulated Console & Logs
                  </h3>
                  <p className="mt-0.5 text-[11px] text-xeoo-muted">
                    Configure shell prompt and simulated terminal command audit
                    logs.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-xeoo-text">
                      User Prompt
                    </label>
                    <input
                      type="text"
                      value={config.terminal.promptUser}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          terminal: {
                            ...config.terminal,
                            promptUser: e.target.value,
                          },
                        })
                      }
                      className="mt-1 w-full rounded border border-xeoo-border bg-xeoo-bg px-2.5 py-1 text-xs text-xeoo-text"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-xeoo-text">
                      Host Name
                    </label>
                    <input
                      type="text"
                      value={config.terminal.promptHost}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          terminal: {
                            ...config.terminal,
                            promptHost: e.target.value,
                          },
                        })
                      }
                      className="mt-1 w-full rounded border border-xeoo-border bg-xeoo-bg px-2.5 py-1 text-xs text-xeoo-text"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-xeoo-text mb-1">
                    Terminal Log Lines ({config.terminal.lines.length})
                  </label>
                  <div className="max-h-48 space-y-1.5 overflow-y-auto rounded border border-xeoo-border bg-xeoo-bg p-2 font-mono text-xs">
                    {config.terminal.lines.map((ln, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px]">
                        <span className="font-bold text-xeoo-primary uppercase">
                          [{ln.type}]
                        </span>
                        <span className="flex-1 truncate text-xeoo-text">
                          {ln.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: EXPORT & STANDALONE HTML ACTIONS */}
            {activeTab === "export" && (
              <div className="space-y-3.5 rounded-xl border border-xeoo-border bg-xeoo-surface p-4 shadow-xs">
                <div className="border-b border-xeoo-border pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                    Standalone Export Options
                  </h3>
                  <p className="mt-0.5 text-[11px] text-xeoo-muted">
                    Download 100% self-contained HTML/HTM with base64 embedded
                    assets and zero external dependencies.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-xeoo-text">
                    Export File Name
                  </label>
                  <input
                    type="text"
                    value={exportFileName}
                    onChange={(e) => setExportFileName(e.target.value)}
                    placeholder="index.html"
                    className="mt-1 w-full rounded border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs text-xeoo-text"
                  />
                  <span className="text-[10px] text-xeoo-muted">
                    Allowed: .html or .htm (Sanitized locally)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleDownload("html")}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-xeoo-text px-4 py-2 text-xs font-bold text-xeoo-surface shadow hover:opacity-90 active:scale-95"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download .HTML</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload("htm")}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-4 py-2 text-xs font-bold text-xeoo-text hover:bg-xeoo-surface-soft active:scale-95"
                  >
                    <FileCode className="h-4 w-4" />
                    <span>Download .HTM</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopySource}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface py-1.5 text-xs font-semibold text-xeoo-text hover:bg-xeoo-surface-soft"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-xeoo-success" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copied ? "Source Copied!" : "Copy HTML Source"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-1.5 text-xs font-semibold text-xeoo-danger hover:bg-xeoo-danger-soft"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: LIVE SANDBOXED IFRAME PREVIEW (7 COLS) */}
          <div className="space-y-2 lg:col-span-7">
            {/* PREVIEW TOOLBAR */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-xeoo-border bg-xeoo-surface p-2 shadow-xs">
              {/* DEVICE VIEW SWITCHER */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDeviceView("desktop")}
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-xs transition ${
                    deviceView === "desktop"
                      ? "bg-xeoo-text text-xeoo-surface"
                      : "text-xeoo-muted hover:text-xeoo-text"
                  }`}
                  title="Desktop View (100%)"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceView("tablet")}
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-xs transition ${
                    deviceView === "tablet"
                      ? "bg-xeoo-text text-xeoo-surface"
                      : "text-xeoo-muted hover:text-xeoo-text"
                  }`}
                  title="Tablet View (768px)"
                >
                  <Tablet className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceView("mobile")}
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-xs transition ${
                    deviceView === "mobile"
                      ? "bg-xeoo-text text-xeoo-surface"
                      : "text-xeoo-muted hover:text-xeoo-text"
                  }`}
                  title="Mobile View (375px)"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* ZOOM & ACTIONS */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setZoomLevel((z) => Math.max(50, z - 10))
                  }
                  className="flex h-7 w-7 items-center justify-center rounded border border-xeoo-border text-xeoo-muted hover:text-xeoo-text"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3 w-3" />
                </button>
                <span className="font-mono text-[10px] text-xeoo-muted px-1">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setZoomLevel((z) => Math.min(150, z + 10))
                  }
                  className="flex h-7 w-7 items-center justify-center rounded border border-xeoo-border text-xeoo-muted hover:text-xeoo-text"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3 w-3" />
                </button>

                <div className="h-4 w-px bg-xeoo-border mx-1" />

                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="flex h-7 w-7 items-center justify-center rounded border border-xeoo-border text-xeoo-muted hover:text-xeoo-text"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* SANDBOXED IFRAME CONTAINER */}
            <div
              className={`relative overflow-hidden rounded-xl border border-xeoo-border bg-black shadow-inner flex items-center justify-center transition-all ${
                isFullscreen
                  ? "fixed inset-4 z-50 rounded-2xl shadow-2xl"
                  : "min-h-[580px] h-[calc(100vh-250px)] max-h-[720px]"
              }`}
            >
              <div
                className="h-full transition-all duration-300 overflow-hidden flex items-center justify-center"
                style={{
                  width:
                    deviceView === "desktop"
                      ? "100%"
                      : deviceView === "tablet"
                        ? "768px"
                        : "375px",
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: "center center",
                }}
              >
                <iframe
                  title="Defacement Page Sandbox Preview"
                  srcDoc={standaloneHtml}
                  sandbox="allow-scripts"
                  className="h-full w-full border-0 bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
