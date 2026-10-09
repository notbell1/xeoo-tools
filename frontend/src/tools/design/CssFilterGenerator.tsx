import React, { useState } from "react";
import {
  Copy,
  Check,
  RotateCcw,
  Upload,
  Sparkles,
  Sliders,
} from "lucide-react";
import {
  type FilterSettings,
  DEFAULT_FILTER_SETTINGS,
  generateFilterCss,
  FILTER_PRESETS,
} from "./cssFilterGeneratorLogic";
import { showSuccess, showError } from "../../alert";

const SAMPLE_IMAGES = [
  {
    name: "Landscape",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Portrait",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Architecture",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
  },
];

export const CssFilterGenerator: React.FC = () => {
  const [settings, setSettings] = useState<FilterSettings>({
    ...DEFAULT_FILTER_SETTINGS,
  });
  const [selectedImage, setSelectedImage] = useState<string>(
    SAMPLE_IMAGES[0].url,
  );
  const [copied, setCopied] = useState<boolean>(false);

  const filterCss = generateFilterCss(settings);

  const handleUpdate = (field: keyof FilterSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setSettings({ ...DEFAULT_FILTER_SETTINGS });
    setSelectedImage(SAMPLE_IMAGES[0].url);
  };

  const handleApplyPreset = (preset: FilterSettings) => {
    setSettings({ ...preset });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        void showError("Invalid File", "Please select an image file.");
        return;
      }
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
    }
  };

  const fullCss = `filter: ${filterCss};
-webkit-filter: ${filterCss};`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullCss);
      setCopied(true);
      showSuccess("Copied!", "CSS filter copied to clipboard.");
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
              <Sliders size={16} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xs font-extrabold tracking-tight text-xeoo-text sm:text-sm">
                CSS FILTER GENERATOR
              </h1>
              <p className="truncate text-[11px] text-xeoo-muted">
                Apply and preview CSS image filters including blur, brightness, contrast, and saturation.
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
            <span className="font-semibold text-xeoo-text">Filter Presets:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTER_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleApplyPreset(p.settings)}
                className="inline-flex h-6.5 items-center rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-medium text-xeoo-text transition hover:bg-xeoo-surface-soft"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 gap-4 p-3.5 sm:p-5 lg:grid-cols-12">
          {/* LEFT: FILTER SLIDERS */}
          <div className="space-y-4 lg:col-span-7">
            <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted block">
                Filter Parameters
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Blur */}
                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                    <span>Blur</span>
                    <span className="font-mono text-xeoo-text">{settings.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={settings.blur}
                    onChange={(e) => handleUpdate("blur", parseInt(e.target.value) || 0)}
                    className="w-full accent-fuchsia-500"
                  />
                </div>

                {/* Brightness */}
                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                    <span>Brightness</span>
                    <span className="font-mono text-xeoo-text">{settings.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={settings.brightness}
                    onChange={(e) => handleUpdate("brightness", parseInt(e.target.value) || 100)}
                    className="w-full accent-fuchsia-500"
                  />
                </div>

                {/* Contrast */}
                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                    <span>Contrast</span>
                    <span className="font-mono text-xeoo-text">{settings.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={settings.contrast}
                    onChange={(e) => handleUpdate("contrast", parseInt(e.target.value) || 100)}
                    className="w-full accent-fuchsia-500"
                  />
                </div>

                {/* Saturate */}
                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                    <span>Saturation</span>
                    <span className="font-mono text-xeoo-text">{settings.saturate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={settings.saturate}
                    onChange={(e) => handleUpdate("saturate", parseInt(e.target.value) || 100)}
                    className="w-full accent-fuchsia-500"
                  />
                </div>

                {/* Grayscale */}
                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                    <span>Grayscale</span>
                    <span className="font-mono text-xeoo-text">{settings.grayscale}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.grayscale}
                    onChange={(e) => handleUpdate("grayscale", parseInt(e.target.value) || 0)}
                    className="w-full accent-fuchsia-500"
                  />
                </div>

                {/* Sepia */}
                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                    <span>Sepia</span>
                    <span className="font-mono text-xeoo-text">{settings.sepia}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.sepia}
                    onChange={(e) => handleUpdate("sepia", parseInt(e.target.value) || 0)}
                    className="w-full accent-fuchsia-500"
                  />
                </div>

                {/* Hue Rotate */}
                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                    <span>Hue Rotate</span>
                    <span className="font-mono text-xeoo-text">{settings.hueRotate}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={settings.hueRotate}
                    onChange={(e) => handleUpdate("hueRotate", parseInt(e.target.value) || 0)}
                    className="w-full accent-fuchsia-500"
                  />
                </div>

                {/* Invert */}
                <div>
                  <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                    <span>Invert</span>
                    <span className="font-mono text-xeoo-text">{settings.invert}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.invert}
                    onChange={(e) => handleUpdate("invert", parseInt(e.target.value) || 0)}
                    className="w-full accent-fuchsia-500"
                  />
                </div>

                {/* Opacity */}
                <div className="sm:col-span-2">
                  <div className="flex justify-between text-xeoo-muted mb-0.5 text-[11px]">
                    <span>Opacity</span>
                    <span className="font-mono text-xeoo-text">{settings.opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.opacity}
                    onChange={(e) => handleUpdate("opacity", parseInt(e.target.value) || 100)}
                    className="w-full accent-fuchsia-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: IMAGE PREVIEW & CSS EXPORT */}
          <div className="space-y-4 lg:col-span-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-xeoo-text">Preview Image</span>
              <div className="flex items-center gap-1.5">
                <label
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded border border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:text-xeoo-text cursor-pointer transition"
                  title="Upload image"
                >
                  <Upload size={10} />
                  <span>Upload</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                {SAMPLE_IMAGES.map((img) => (
                  <button
                    key={img.name}
                    type="button"
                    onClick={() => setSelectedImage(img.url)}
                    className={`px-1.5 py-0.5 text-[10px] rounded font-medium transition ${
                      selectedImage === img.url
                        ? "bg-xeoo-primary text-white"
                        : "border border-xeoo-border text-xeoo-muted hover:text-xeoo-text"
                    }`}
                  >
                    {img.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Viewport Canvas */}
            <div className="h-64 rounded-xl border border-xeoo-border bg-xeoo-surface-soft overflow-hidden flex items-center justify-center p-2">
              <img
                src={selectedImage}
                alt="Filter Preview"
                className="max-h-full max-w-full object-contain rounded-lg transition-all"
                style={{
                  filter: filterCss,
                  WebkitFilter: filterCss,
                }}
              />
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

export default CssFilterGenerator;
