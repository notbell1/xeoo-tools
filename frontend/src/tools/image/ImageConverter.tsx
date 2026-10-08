import {
  Archive,
  ArrowRight,
  CheckCircle2,
  Download,
  Info,
  Maximize2,
  RefreshCw,
  Sliders,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

import Footer from "../../components/Footer";
import { showConfirm, showError, showSuccess, showWarning } from "../../alert";
import {
  convertImageFile,
  createZipArchive,
  FORMAT_DEFINITIONS,
  formatBytes,
  formatSizeChange,
  getFileExtension,
  loadImageDimensions,
  MAX_IMAGE_FILES,
  MAX_IMAGE_SIZE_BYTES,
  validateImageFile,
  type ImageConversionItem,
  type OutputTargetFormat,
} from "./imageConverterLogic";

const AVAILABLE_FORMATS: OutputTargetFormat[] = [
  "png",
  "jpeg",
  "webp",
  "avif",
  "bmp",
  "ico",
  "gif",
];

const ICO_SIZES = [16, 32, 48, 64, 128, 256];

export default function ImageConverter() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core items state
  const [items, setItems] = useState<ImageConversionItem[]>([]);
  const itemsRef = useRef<ImageConversionItem[]>([]);

  // Global settings for batch conversion
  const [globalFormat, setGlobalFormat] = useState<OutputTargetFormat>("webp");
  const [globalQuality, setGlobalQuality] = useState<number>(85);
  const [globalBgColor, setGlobalBgColor] = useState<string>("#ffffff");
  const [globalIcoSize, setGlobalIcoSize] = useState<number>(64);

  // UI state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isConvertingBatch, setIsConvertingBatch] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<number>(0);
  const [showGlobalSettings, setShowGlobalSettings] = useState<boolean>(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [previewModalTitle, setPreviewModalTitle] = useState<string>("");

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.result?.url) URL.revokeObjectURL(item.result.url);
      });
    };
  }, []);

  // Summary computations
  const totalOriginalSize = useMemo(
    () => items.reduce((acc, item) => acc + item.file.size, 0),
    [items],
  );

  const doneItems = useMemo(
    () => items.filter((item) => item.status === "done" && item.result),
    [items],
  );

  const totalConvertedSize = useMemo(
    () =>
      doneItems.reduce(
        (acc, item) => acc + (item.result?.convertedSize || 0),
        0,
      ),
    [doneItems],
  );

  const totalSavings = useMemo(() => {
    if (doneItems.length === 0) return null;
    const origDoneSize = doneItems.reduce(
      (acc, item) => acc + item.file.size,
      0,
    );
    return formatSizeChange(origDoneSize, totalConvertedSize);
  }, [doneItems, totalConvertedSize]);

  // Handle file selection / drop
  const handleFiles = async (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList);
    if (!rawFiles.length) return;

    const currentCount = items.length;
    const remainingSlots = MAX_IMAGE_FILES - currentCount;

    if (remainingSlots <= 0) {
      await showWarning(
        "Batch Limit Reached",
        `You can convert up to ${MAX_IMAGE_FILES} images at a time. Please process or remove existing images first.`,
      );
      return;
    }

    let filesToProcess = rawFiles;
    if (rawFiles.length > remainingSlots) {
      await showWarning(
        "Batch Limit Warning",
        `Only the first ${remainingSlots} image${remainingSlots > 1 ? "s" : ""} were added (Maximum ${MAX_IMAGE_FILES} files per batch).`,
      );
      filesToProcess = rawFiles.slice(0, remainingSlots);
    }

    const newItems: ImageConversionItem[] = [];
    const rejectedFiles: { name: string; reason: string }[] = [];

    for (const file of filesToProcess) {
      // Security & Format validation
      const validation = await validateImageFile(file);
      if (!validation.valid) {
        rejectedFiles.push({
          name: file.name,
          reason: validation.reason || "Invalid image file.",
        });
        continue;
      }

      // Try decoding to get dimensions
      try {
        const { width, height, url } = await loadImageDimensions(file);
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        newItems.push({
          id,
          file,
          previewUrl: url,
          width,
          height,
          targetFormat: globalFormat,
          quality: globalQuality,
          backgroundColor: globalBgColor,
          icoSize: globalIcoSize,
          status: "idle",
        });
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : `Failed to decode "${file.name}".`;
        rejectedFiles.push({
          name: file.name,
          reason: errorMsg,
        });
      }
    }

    if (rejectedFiles.length > 0) {
      const msg =
        rejectedFiles.length === 1
          ? rejectedFiles[0].reason
          : `${rejectedFiles.length} files were rejected:\n` +
            rejectedFiles.map((r) => `• ${r.name}: ${r.reason}`).join("\n");
      await showError("File Validation Error", msg);
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(e.target.files);
    }
  };

  // Clipboard paste support
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i];
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            const ext = getFileExtension(file.name) || "png";
            const newFile = new File(
              [file],
              `pasted-image-${Date.now()}.${ext}`,
              { type: file.type || "image/png" },
            );
            pastedFiles.push(newFile);
          }
        }
      }

      if (pastedFiles.length > 0) {
        await handleFiles(pastedFiles);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [items]);

  // Remove single item
  const handleRemoveItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.result?.url) URL.revokeObjectURL(item.result.url);
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Clear all items
  const handleClearAll = async () => {
    if (items.length === 0) return;
    const confirmed = await showConfirm(
      "Clear All Images",
      "Are you sure you want to remove all loaded images and conversion results?",
    );
    if (!confirmed) return;

    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.result?.url) URL.revokeObjectURL(item.result.url);
    });

    setItems([]);
    setBatchProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Update item setting
  const updateItem = (id: string, updates: Partial<ImageConversionItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          ...updates,
          status: updates.targetFormat || updates.quality || updates.backgroundColor || updates.icoSize ? "idle" : item.status,
        };
      }),
    );
  };

  // Apply global format to all items
  const handleApplyGlobalFormat = (newFormat: OutputTargetFormat) => {
    setGlobalFormat(newFormat);
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        targetFormat: newFormat,
        status: "idle",
      })),
    );
  };

  // Single file conversion
  const handleConvertSingle = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    updateItem(id, { status: "converting", errorMessage: undefined });

    try {
      const result = await convertImageFile(item.file, {
        format: item.targetFormat,
        quality: item.quality,
        backgroundColor: item.backgroundColor,
        icoSize: item.icoSize,
      });

      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;
          if (i.result?.url) URL.revokeObjectURL(i.result.url);
          return {
            ...i,
            status: "done",
            result,
          };
        }),
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Conversion failed unexpectedly.";
      updateItem(id, { status: "error", errorMessage: msg });
      await showError("Conversion Error", msg);
    }
  };

  // Batch convert all files
  const handleConvertAll = async () => {
    if (items.length === 0 || isConvertingBatch) return;

    setIsConvertingBatch(true);
    setBatchProgress(0);

    let completed = 0;
    const total = items.length;

    for (const item of items) {
      updateItem(item.id, { status: "converting", errorMessage: undefined });

      try {
        const result = await convertImageFile(item.file, {
          format: item.targetFormat,
          quality: item.quality,
          backgroundColor: item.backgroundColor,
          icoSize: item.icoSize,
        });

        setItems((prev) =>
          prev.map((i) => {
            if (i.id !== item.id) return i;
            if (i.result?.url) URL.revokeObjectURL(i.result.url);
            return {
              ...i,
              status: "done",
              result,
            };
          }),
        );
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : `Conversion failed for "${item.file.name}".`;
        updateItem(item.id, { status: "error", errorMessage: msg });
      }

      completed++;
      setBatchProgress(Math.round((completed / total) * 100));
    }

    setIsConvertingBatch(false);
    await showSuccess(
      "Conversion Complete",
      `Successfully processed ${completed} image${completed > 1 ? "s" : ""}. You can now download files individually or as a ZIP archive.`,
    );
  };

  // Download single converted file
  const handleDownloadSingle = (item: ImageConversionItem) => {
    if (!item.result) return;
    const link = document.createElement("a");
    link.href = item.result.url;
    link.download = item.result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all as ZIP
  const handleDownloadZip = async () => {
    if (doneItems.length === 0) return;

    try {
      const zipBlob = await createZipArchive(
        doneItems.map((item) => ({
          fileName: item.result!.fileName,
          blob: item.result!.blob,
        })),
      );

      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = zipUrl;
      link.download = "xeooconverter-images.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(zipUrl);

      await showSuccess(
        "ZIP Downloaded",
        `Created ZIP archive containing ${doneItems.length} converted images.`,
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create ZIP file.";
      await showError("ZIP Generation Failed", msg);
    }
  };

  const currentFormatDef = FORMAT_DEFINITIONS[globalFormat];

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.svg,.avif,.ico,.tif,.tiff,.heic,.heif,.jxl"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-6 sm:py-6">
        {/* COMPACT TOOL TOPBAR */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-xeoo-primary-soft text-xeoo-primary">
              <RefreshCw size={18} className="animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-xeoo-text sm:text-base">
                Image Converter
              </h1>
              <p className="text-xs text-xeoo-muted">
                100% Client-Side Multi-Format Converter • Zero Server Upload
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-md border border-xeoo-border bg-xeoo-surface-soft px-2.5 py-1 font-medium text-xeoo-text-soft">
              {items.length} / {MAX_IMAGE_FILES} Images
            </span>
            {items.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface-soft px-2.5 py-1 text-xs text-xeoo-danger hover:border-xeoo-danger/30 hover:bg-xeoo-danger-soft transition-colors cursor-pointer"
                title="Clear all images"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* DRAG AND DROP ZONE */}
        {items.length < MAX_IMAGE_FILES && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all sm:p-8 ${
              isDragging
                ? "border-xeoo-primary bg-xeoo-primary-soft/30 scale-[0.99]"
                : "border-xeoo-border hover:border-xeoo-primary/60 hover:bg-xeoo-surface-soft/60 bg-xeoo-surface"
            }`}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-xeoo-primary-soft text-xeoo-primary group-hover:scale-110 transition-transform">
              <Upload size={22} />
            </div>
            <p className="text-sm font-medium text-xeoo-text sm:text-base">
              {items.length === 0 ? (
                <>
                  Drop up to {MAX_IMAGE_FILES} images here, or{" "}
                  <span className="text-xeoo-primary underline underline-offset-2">
                    browse files
                  </span>
                </>
              ) : (
                <>
                  Drop up to {MAX_IMAGE_FILES - items.length} more image
                  {MAX_IMAGE_FILES - items.length > 1 ? "s" : ""} here, or{" "}
                  <span className="text-xeoo-primary underline underline-offset-2">
                    browse files
                  </span>
                </>
              )}
            </p>
            <p className="mt-1.5 text-xs text-xeoo-muted max-w-lg">
              Supports JPG, PNG, WebP, AVIF, GIF, BMP, SVG, ICO, TIFF, HEIC •
              Max {MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB per file • Paste from
              clipboard supported
            </p>
          </div>
        )}

        {/* MAIN CONTROLS & BATCH SETTINGS BAR */}
        {items.length > 0 && (
          <div className="mb-4 rounded-xl border border-xeoo-border bg-xeoo-surface p-4 shadow-xs">
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
              {/* Global Format Selector */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-xeoo-muted">
                  Convert All To:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_FORMATS.map((fmt) => {
                    const def = FORMAT_DEFINITIONS[fmt];
                    const isSelected = globalFormat === fmt;
                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => handleApplyGlobalFormat(fmt)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-xeoo-primary text-white shadow-xs"
                            : "border border-xeoo-border bg-xeoo-surface-soft text-xeoo-text hover:border-xeoo-primary/50"
                        }`}
                      >
                        {def.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGlobalSettings((prev) => !prev)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    showGlobalSettings
                      ? "border-xeoo-primary bg-xeoo-primary-soft text-xeoo-primary"
                      : "border-xeoo-border bg-xeoo-surface-soft text-xeoo-text hover:border-xeoo-border-dark"
                  }`}
                >
                  <Sliders size={14} />
                  <span>Format Settings</span>
                </button>

                <button
                  type="button"
                  onClick={handleConvertAll}
                  disabled={isConvertingBatch}
                  className="flex items-center gap-1.5 rounded-lg bg-xeoo-primary px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-xeoo-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <RefreshCw
                    size={14}
                    className={isConvertingBatch ? "animate-spin" : ""}
                  />
                  <span>
                    {isConvertingBatch
                      ? `Converting (${batchProgress}%)`
                      : `Convert All (${items.length})`}
                  </span>
                </button>

                {doneItems.length >= 2 && (
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    className="flex items-center gap-1.5 rounded-lg border border-xeoo-success/30 bg-xeoo-success-soft px-3 py-1.5 text-xs font-medium text-xeoo-success hover:bg-xeoo-success/20 transition-colors cursor-pointer"
                  >
                    <Archive size={14} />
                    <span>Download ZIP ({doneItems.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* EXPANDABLE FORMAT SPECIFIC SETTINGS */}
            {showGlobalSettings && (
              <div className="mt-3.5 border-t border-xeoo-border pt-3.5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Quality Slider (for JPG, WebP, AVIF) */}
                  {currentFormatDef.supportsQuality && (
                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-xs font-medium text-xeoo-text">
                          Output Quality: {globalQuality}%
                        </label>
                        <span className="text-[11px] text-xeoo-muted">
                          {globalQuality >= 90
                            ? "Maximum"
                            : globalQuality >= 75
                              ? "Balanced"
                              : "Compact"}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={globalQuality}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setGlobalQuality(val);
                          setItems((prev) =>
                            prev.map((i) => ({
                              ...i,
                              quality: val,
                              status: "idle",
                            })),
                          );
                        }}
                        className="h-1.5 w-full cursor-pointer accent-xeoo-primary"
                      />
                    </div>
                  )}

                  {/* Background Color Picker (for JPG, BMP, GIF) */}
                  {currentFormatDef.supportsBackground && (
                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-xs font-medium text-xeoo-text">
                          Background Fill (For Transparency)
                        </label>
                        <div
                          className="h-4 w-4 rounded-full border border-xeoo-border"
                          style={{ backgroundColor: globalBgColor }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={globalBgColor}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGlobalBgColor(val);
                            setItems((prev) =>
                              prev.map((i) => ({
                                ...i,
                                backgroundColor: val,
                                status: "idle",
                              })),
                            );
                          }}
                          className="h-7 w-8 cursor-pointer rounded border border-xeoo-border bg-transparent p-0"
                        />
                        <div className="flex gap-1.5">
                          {["#ffffff", "#000000", "#f4f4f5", "#27272a"].map(
                            (color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => {
                                  setGlobalBgColor(color);
                                  setItems((prev) =>
                                    prev.map((i) => ({
                                      ...i,
                                      backgroundColor: color,
                                      status: "idle",
                                    })),
                                  );
                                }}
                                className={`h-6 w-6 rounded border transition-transform cursor-pointer ${
                                  globalBgColor === color
                                    ? "scale-110 border-xeoo-primary shadow-xs ring-1 ring-xeoo-primary"
                                    : "border-xeoo-border"
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ICO Resolution Selector */}
                  {currentFormatDef.supportsIcoSize && (
                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                      <label className="mb-1.5 block text-xs font-medium text-xeoo-text">
                        Icon Dimension: {globalIcoSize}x{globalIcoSize} px
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {ICO_SIZES.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => {
                              setGlobalIcoSize(size);
                              setItems((prev) =>
                                prev.map((i) => ({
                                  ...i,
                                  icoSize: size,
                                  status: "idle",
                                })),
                              );
                            }}
                            className={`rounded px-2 py-1 text-[11px] font-semibold cursor-pointer ${
                              globalIcoSize === size
                                ? "bg-xeoo-primary text-white"
                                : "border border-xeoo-border bg-xeoo-surface text-xeoo-text hover:border-xeoo-primary/50"
                            }`}
                          >
                            {size}px
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Format Info note */}
                  <div className="flex items-center gap-2 rounded-lg border border-xeoo-border bg-xeoo-surface-soft/50 p-3 text-xs text-xeoo-muted">
                    <Info size={16} className="text-xeoo-primary shrink-0" />
                    <span>{currentFormatDef.description}</span>
                  </div>
                </div>
              </div>
            )}

            {/* BATCH PROGRESS BAR */}
            {isConvertingBatch && (
              <div className="mt-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-xeoo-surface-soft">
                  <div
                    className="h-full bg-xeoo-primary transition-all duration-300"
                    style={{ width: `${batchProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* BATCH RESULTS SUMMARY BANNER */}
        {doneItems.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-xeoo-success/30 bg-xeoo-success-soft/30 p-3.5 text-xs text-xeoo-text">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-xeoo-success" />
              <span>
                <strong className="font-semibold text-xeoo-text">
                  {doneItems.length}
                </strong>{" "}
                of {items.length} images converted successfully.
              </span>
            </div>

            {totalSavings && (
              <div className="flex items-center gap-3">
                <span className="text-xeoo-muted">
                  Total Size:{" "}
                  <span className="font-mono text-xeoo-text">
                    {formatBytes(totalOriginalSize)}
                  </span>{" "}
                  <ArrowRight size={12} className="inline text-xeoo-muted" />{" "}
                  <span className="font-mono font-semibold text-xeoo-success">
                    {formatBytes(totalConvertedSize)}
                  </span>
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold ${
                    totalSavings.isSmaller
                      ? "bg-xeoo-success-soft text-xeoo-success border border-xeoo-success/30"
                      : "bg-xeoo-surface-soft text-xeoo-muted border border-xeoo-border"
                  }`}
                >
                  {totalSavings.text}
                </span>
              </div>
            )}
          </div>
        )}

        {/* IMAGE QUEUE LIST */}
        {items.length > 0 && (
          <div className="space-y-2.5">
            {items.map((item) => {
              const itemFormatDef = FORMAT_DEFINITIONS[item.targetFormat];
              const isDone = item.status === "done" && item.result;
              const isError = item.status === "error";
              const isConverting = item.status === "converting";

              const sizeDiff = isDone
                ? formatSizeChange(item.file.size, item.result!.convertedSize)
                : null;

              return (
                <div
                  key={item.id}
                  className={`group flex flex-col gap-3 rounded-xl border p-3 transition-all sm:flex-row sm:items-center sm:justify-between ${
                    isDone
                      ? "border-xeoo-success/30 bg-xeoo-surface"
                      : isError
                        ? "border-xeoo-danger/30 bg-xeoo-surface"
                        : "border-xeoo-border bg-xeoo-surface hover:border-xeoo-border-dark"
                  }`}
                >
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Thumbnail */}
                    <div
                      onClick={() => {
                        setPreviewModalUrl(
                          item.result ? item.result.url : item.previewUrl,
                        );
                        setPreviewModalTitle(
                          item.result ? item.result.fileName : item.file.name,
                        );
                      }}
                      className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-xeoo-border bg-xeoo-surface-soft cursor-pointer hover:opacity-90"
                      title="Click to preview image"
                    >
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="h-full w-full object-contain p-0.5"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 size={14} className="text-white" />
                      </div>
                    </div>

                    {/* File Meta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p
                          className="truncate text-xs font-semibold text-xeoo-text sm:text-sm"
                          title={item.file.name}
                        >
                          {item.file.name}
                        </p>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-xeoo-muted">
                        <span>
                          {item.width} × {item.height} px
                        </span>
                        <span>•</span>
                        <span className="font-mono">
                          {formatBytes(item.file.size)}
                        </span>
                        <span>•</span>
                        <span className="uppercase font-medium">
                          {getFileExtension(item.file.name)}
                        </span>
                      </div>

                      {/* Error display */}
                      {isError && (
                        <p className="mt-1 text-xs text-xeoo-danger">
                          {item.errorMessage || "Conversion failed"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle: Format & Settings Controls */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-xeoo-border pt-2 sm:border-t-0 sm:pt-0">
                    <span className="text-xs text-xeoo-muted sm:hidden">To:</span>
                    <select
                      value={item.targetFormat}
                      disabled={isConverting}
                      onChange={(e) =>
                        updateItem(item.id, {
                          targetFormat: e.target.value as OutputTargetFormat,
                        })
                      }
                      className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-2.5 py-1 text-xs font-medium text-xeoo-text focus:border-xeoo-primary focus:outline-hidden cursor-pointer"
                    >
                      {AVAILABLE_FORMATS.map((fmt) => (
                        <option key={fmt} value={fmt}>
                          {FORMAT_DEFINITIONS[fmt].label} (.{FORMAT_DEFINITIONS[fmt].extension})
                        </option>
                      ))}
                    </select>

                    {/* Format specific quick config */}
                    {itemFormatDef.supportsQuality && (
                      <div className="flex items-center gap-1 text-[11px] text-xeoo-muted">
                        <span>Q:</span>
                        <select
                          value={item.quality}
                          disabled={isConverting}
                          onChange={(e) =>
                            updateItem(item.id, {
                              quality: Number(e.target.value),
                            })
                          }
                          className="rounded border border-xeoo-border bg-xeoo-surface-soft px-1.5 py-0.5 text-xs text-xeoo-text cursor-pointer"
                        >
                          <option value="95">95% (Best)</option>
                          <option value="85">85% (High)</option>
                          <option value="75">75% (Medium)</option>
                          <option value="60">60% (Low)</option>
                        </select>
                      </div>
                    )}

                    {itemFormatDef.supportsIcoSize && (
                      <div className="flex items-center gap-1 text-[11px] text-xeoo-muted">
                        <span>Size:</span>
                        <select
                          value={item.icoSize}
                          disabled={isConverting}
                          onChange={(e) =>
                            updateItem(item.id, {
                              icoSize: Number(e.target.value),
                            })
                          }
                          className="rounded border border-xeoo-border bg-xeoo-surface-soft px-1.5 py-0.5 text-xs text-xeoo-text cursor-pointer"
                        >
                          {ICO_SIZES.map((s) => (
                            <option key={s} value={s}>
                              {s}x{s}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="flex items-center justify-between gap-2.5 border-t border-xeoo-border pt-2 sm:border-t-0 sm:pt-0 sm:justify-end">
                    {/* Converted Stats */}
                    {isDone && sizeDiff && (
                      <div className="flex items-center gap-2 text-right">
                        <div>
                          <div className="font-mono text-xs font-semibold text-xeoo-success">
                            {formatBytes(item.result!.convertedSize)}
                          </div>
                          <div
                            className={`text-[10px] font-mono font-medium ${
                              sizeDiff.isSmaller
                                ? "text-xeoo-success"
                                : "text-xeoo-muted"
                            }`}
                          >
                            {sizeDiff.text}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      {isDone ? (
                        <button
                          type="button"
                          onClick={() => handleDownloadSingle(item)}
                          className="flex items-center gap-1 rounded-lg bg-xeoo-success px-2.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-xeoo-success/90 transition-colors cursor-pointer"
                          title="Download converted image"
                        >
                          <Download size={13} />
                          <span className="hidden md:inline">Download</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleConvertSingle(item.id)}
                          disabled={isConverting}
                          className="flex items-center gap-1 rounded-lg bg-xeoo-primary px-2.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-xeoo-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
                          title="Convert this image"
                        >
                          <RefreshCw
                            size={13}
                            className={isConverting ? "animate-spin" : ""}
                          />
                          <span>Convert</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isConverting}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface-soft text-xeoo-muted hover:border-xeoo-danger/30 hover:bg-xeoo-danger-soft hover:text-xeoo-danger transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* IMAGE PREVIEW MODAL */}
        {previewModalUrl && (
          <div
            onClick={() => setPreviewModalUrl(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 shadow-2xl"
            >
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="truncate text-xs font-semibold text-xeoo-text">
                  {previewModalTitle}
                </p>
                <button
                  type="button"
                  onClick={() => setPreviewModalUrl(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-xeoo-border bg-xeoo-surface-soft text-xeoo-text hover:bg-xeoo-danger-soft hover:text-xeoo-danger cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex max-h-[75vh] items-center justify-center overflow-auto rounded-xl border border-xeoo-border bg-zinc-950/20 p-2">
                <img
                  src={previewModalUrl}
                  alt={previewModalTitle}
                  className="max-h-[70vh] max-w-full object-contain rounded"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
