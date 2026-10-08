import {
  Archive,
  Check,
  Download,
  Image as ImageIcon,
  Minus,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import JSZip from "jszip";

import Footer from "../../components/Footer";
import { showError, showSuccess } from "../../alert";

import {
  compressImage,
  createImageId,
  formatBytes,
  formatReduction,
  getOutputExtension,
  getSupportedOutputFormats,
  getFileExtension,
  isSupportedPhoto,
  type CompressionFormat,
  type CompressionResult,
} from "./imageCompressorLogic";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const FORMAT_OPTIONS: Array<{
  value: CompressionFormat;
  label: string;
  description: string;
}> = [
  {
    value: "auto",
    label: "Auto",
    description: "Keep the source format when supported.",
  },
  {
    value: "jpeg",
    label: "JPEG",
    description: "Small size and broad compatibility.",
  },
  {
    value: "webp",
    label: "WebP",
    description: "Modern format with strong compression.",
  },
  {
    value: "avif",
    label: "AVIF",
    description: "Very strong compression when supported.",
  },
  {
    value: "png",
    label: "PNG",
    description: "Lossless output with larger files.",
  },
];

type ImageItem = {
  id: string;
  file: File;
};

function SourcePreview({ file }: { file: File }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return url ? (
    <img
      src={url}
      alt={file.name}
      className="h-full w-full object-contain p-1"
    />
  ) : (
    <div className="flex h-full items-center justify-center text-xeoo-muted">
      <ImageIcon size={20} />
    </div>
  );
}

export default function ImageCompressor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<CompressionResult[]>([]);

  const [items, setItems] = useState<ImageItem[]>([]);
  const [results, setResults] = useState<CompressionResult[]>([]);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<CompressionFormat>("auto");
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const availableFormats = useMemo(() => getSupportedOutputFormats(), []);

  const filteredFormatOptions = useMemo(
    () =>
      FORMAT_OPTIONS.filter((option) =>
        availableFormats.includes(option.value),
      ),
    [availableFormats],
  );

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(() => {
    return () => {
      resultsRef.current.forEach((result) => {
        URL.revokeObjectURL(result.url);
      });
    };
  }, []);

  const totalOriginalSize = useMemo(
    () => results.reduce((total, result) => total + result.originalSize, 0),
    [results],
  );

  const totalCompressedSize = useMemo(
    () => results.reduce((total, result) => total + result.compressedSize, 0),
    [results],
  );

  const totalReduction =
    totalOriginalSize > 0
      ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100
      : 0;

  function openPicker() {
    inputRef.current?.click();
  }

  function clearResults() {
    results.forEach((result) => {
      URL.revokeObjectURL(result.url);
    });

    setResults([]);
    setProgress(0);
  }

  function resetAll() {
    clearResults();
    setItems([]);
    setError("");
    setQuality(80);
    setFormat("auto");
    setIsDragging(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function removeItem(id: string) {
    const result = results.find((item) => item.id === id);

    if (result) {
      URL.revokeObjectURL(result.url);
    }

    setItems((current) => current.filter((item) => item.id !== id));
    setResults((current) => current.filter((item) => item.id !== id));
  }

  async function validateFiles(files: File[]): Promise<File[]> {
    const invalidFiles = files.filter((file) => !isSupportedPhoto(file));
    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);

    if (invalidFiles.length > 0) {
      await showError(
        "Unsupported file",
        invalidFiles.length === 1
          ? `"${invalidFiles[0].name}" is not a supported photo. Only JPG, JPEG, PNG, WebP, and AVIF are allowed.`
          : `${invalidFiles.length} files were rejected because they are not supported photos.`,
      );
    }

    if (oversizedFiles.length > 0) {
      await showError(
        "File too large",
        oversizedFiles.length === 1
          ? `"${oversizedFiles[0].name}" exceeds the 50 MB limit.`
          : `${oversizedFiles.length} files exceed the 50 MB limit.`,
      );
    }

    return files.filter(
      (file) => isSupportedPhoto(file) && file.size <= MAX_FILE_SIZE,
    );
  }

  async function addFiles(incomingFiles: File[]) {
    setError("");

    if (!incomingFiles.length || isCompressing) {
      return;
    }

    const validFiles = await validateFiles(incomingFiles);

    if (!validFiles.length) {
      return;
    }

    const existingKeys = new Set(
      items.map(
        (item) =>
          `${item.file.name}-${item.file.size}-${item.file.lastModified}`,
      ),
    );

    const uniqueFiles = validFiles.filter((file) => {
      const key = `${file.name}-${file.size}-${file.lastModified}`;

      if (existingKeys.has(key)) {
        return false;
      }

      existingKeys.add(key);
      return true;
    });

    if (!uniqueFiles.length) {
      await showError(
        "Photo already added",
        "The selected photo is already in the current list.",
      );

      return;
    }

    if (items.length + uniqueFiles.length > MAX_FILES) {
      await showError(
        "Maximum 10 photos",
        `Only ${Math.max(0, MAX_FILES - items.length)} more photo${
          Math.max(0, MAX_FILES - items.length) === 1 ? "" : "s"
        } can be added.`,
      );

      return;
    }

    clearResults();

    const newItems = uniqueFiles.map((file) => ({
      id: createImageId(file),
      file,
    }));

    setItems((current) => [...current, ...newItems]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    void addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    void addFiles(Array.from(event.dataTransfer.files ?? []));
  }

  function changeQuality(direction: "increase" | "decrease") {
    setQuality((current) => {
      const next = direction === "increase" ? current + 5 : current - 5;
      return Math.max(10, Math.min(100, next));
    });
  }

  async function handleCompress() {
    if (!items.length) {
      await showError(
        "No photos selected",
        "Add at least one photo before starting compression.",
      );
      return;
    }

    clearResults();
    setError("");
    setIsCompressing(true);
    setProgress(0);

    const compressedResults: CompressionResult[] = [];
    const failedFiles: string[] = [];

    try {
      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        setProgress(Math.round((index / items.length) * 100));

        try {
          const result = await compressImage(
            item.id,
            item.file,
            quality,
            format,
          );
          compressedResults.push(result);
        } catch (compressionError) {
          console.error(compressionError);
          failedFiles.push(item.file.name);
        }

        setProgress(Math.round(((index + 1) / items.length) * 100));
        await new Promise((resolve) => window.setTimeout(resolve, 10));
      }

      setResults(compressedResults);

      if (compressedResults.length && failedFiles.length === 0) {
        await showSuccess(
          "Compression complete",
          `${compressedResults.length} photo${
            compressedResults.length === 1 ? "" : "s"
          } successfully compressed.`,
        );
        return;
      }

      if (compressedResults.length) {
        await showSuccess(
          "Compression completed",
          `${compressedResults.length} photo${
            compressedResults.length === 1 ? "" : "s"
          } compressed successfully${
            failedFiles.length ? `, ${failedFiles.length} failed.` : "."
          }`,
        );

        if (failedFiles.length) {
          setError(
            `${failedFiles.length} photo${
              failedFiles.length === 1 ? "" : "s"
            } could not be compressed.`,
          );
        }

        return;
      }

      await showError(
        "Compression failed",
        "None of the selected photos could be compressed.",
      );
    } catch (compressionError) {
      console.error(compressionError);
      await showError(
        "Compression failed",
        compressionError instanceof Error
          ? compressionError.message
          : "An unexpected error occurred while compressing the photos.",
      );
    } finally {
      setIsCompressing(false);
      window.setTimeout(() => {
        setProgress(0);
      }, 300);
    }
  }

  function downloadSingle(result: CompressionResult) {
    const link = document.createElement("a");
    link.href = result.url;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function downloadZip() {
    if (!results.length) {
      await showError("Nothing to download", "Compress your photos first.");
      return;
    }

    const zip = new JSZip();
    const usedNames = new Map<string, number>();

    results.forEach((result) => {
      const baseName = result.fileName;
      const count = usedNames.get(baseName) ?? 0;
      usedNames.set(baseName, count + 1);

      if (count === 0) {
        zip.file(baseName, result.blob);
        return;
      }

      const extension = getOutputExtension(result.mimeType);
      const baseWithoutExtension = baseName.replace(
        new RegExp(`\\.${extension}$`, "i"),
        "",
      );

      zip.file(
        `${baseWithoutExtension}-${count + 1}.${extension}`,
        result.blob,
      );
    });

    const blob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9,
      },
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "xeoo-images-compressed.zip";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleInputChange}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-6 sm:py-6">
        {/* COMPACT TOOL TOPBAR */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-xeoo-primary-soft text-xeoo-primary">
              <Zap size={18} />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-xeoo-text sm:text-base">
                Image Compressor
              </h1>
              <p className="text-xs text-xeoo-muted">
                Compress up to 10 photos directly in your browser • Zero server
                upload
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-md border border-xeoo-border bg-xeoo-surface-soft px-2.5 py-1 font-medium text-xeoo-text-soft">
              {items.length} / {MAX_FILES} Images
            </span>
            {items.length > 0 && (
              <button
                type="button"
                onClick={resetAll}
                disabled={isCompressing}
                className="flex items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface-soft px-2.5 py-1 text-xs text-xeoo-danger hover:border-xeoo-danger/30 hover:bg-xeoo-danger-soft transition-colors cursor-pointer disabled:opacity-50"
                title="Clear all photos"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* DRAG AND DROP ZONE */}
        {items.length < MAX_FILES && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isCompressing) setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            onClick={openPicker}
            className={`group relative mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all sm:p-8 ${
              isDragging
                ? "border-xeoo-primary bg-xeoo-primary-soft/30 scale-[0.99]"
                : "border-xeoo-border hover:border-xeoo-primary/60 hover:bg-xeoo-surface-soft/60 bg-xeoo-surface"
            } ${isCompressing ? "pointer-events-none opacity-50" : ""}`}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-xeoo-primary-soft text-xeoo-primary group-hover:scale-110 transition-transform">
              <Upload size={22} />
            </div>
            <p className="text-sm font-medium text-xeoo-text sm:text-base">
              {items.length === 0 ? (
                <>
                  Drop up to {MAX_FILES} images here, or{" "}
                  <span className="text-xeoo-primary underline underline-offset-2">
                    browse files
                  </span>
                </>
              ) : (
                <>
                  Drop up to {MAX_FILES - items.length} more photo
                  {MAX_FILES - items.length > 1 ? "s" : ""} here, or{" "}
                  <span className="text-xeoo-primary underline underline-offset-2">
                    browse files
                  </span>
                </>
              )}
            </p>
            <p className="mt-1.5 text-xs text-xeoo-muted max-w-lg">
              Supports JPG, PNG, WebP, AVIF, GIF, BMP, SVG, ICO, TIFF, HEIC •
              Max 50MB per file • Paste from clipboard supported
            </p>
          </div>
        )}

        {/* ERROR NOTIFICATION */}
        {error && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-xeoo-danger/20 bg-xeoo-danger-soft px-3.5 py-2.5">
            <p className="min-w-0 text-xs text-xeoo-danger wrap-break-word">
              {error}
            </p>
            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 text-xeoo-danger/70 hover:text-xeoo-danger cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* MAIN CONTROLS & BATCH SETTINGS BAR */}
        {items.length > 0 && (
          <div className="mb-4 rounded-xl border border-xeoo-border bg-xeoo-surface p-4 shadow-xs">
            <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
              {/* Left Controls: Quality & Format */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Quality Box */}
                <div className="flex items-center gap-2 rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5">
                  <span className="text-xs font-medium text-xeoo-muted">
                    Quality:
                  </span>
                  <button
                    type="button"
                    onClick={() => changeQuality("decrease")}
                    disabled={isCompressing || quality <= 10}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-xeoo-border bg-xeoo-surface text-xeoo-text hover:bg-xeoo-surface-soft disabled:opacity-30 cursor-pointer"
                  >
                    <Minus size={11} />
                  </button>
                  <span className="w-9 text-center font-mono text-xs font-semibold text-xeoo-text">
                    {quality}%
                  </span>
                  <button
                    type="button"
                    onClick={() => changeQuality("increase")}
                    disabled={isCompressing || quality >= 100}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-xeoo-border bg-xeoo-surface text-xeoo-text hover:bg-xeoo-surface-soft disabled:opacity-30 cursor-pointer"
                  >
                    <Plus size={11} />
                  </button>
                </div>

                {/* Output Format Select */}
                <div className="flex items-center gap-2 rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5">
                  <span className="text-xs font-medium text-xeoo-muted">
                    Format:
                  </span>
                  <select
                    value={availableFormats.includes(format) ? format : "auto"}
                    disabled={isCompressing}
                    onChange={(event) =>
                      setFormat(event.target.value as CompressionFormat)
                    }
                    className="h-6 rounded border border-xeoo-border bg-xeoo-surface px-2 text-xs font-medium text-xeoo-text outline-none focus:border-xeoo-primary disabled:opacity-50 cursor-pointer"
                  >
                    {filteredFormatOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={resetAll}
                  disabled={isCompressing}
                  className="flex items-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs font-medium text-xeoo-text hover:border-xeoo-border-dark disabled:opacity-30 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleCompress()}
                  disabled={isCompressing || items.length === 0}
                  className="flex items-center gap-1.5 rounded-lg bg-xeoo-primary px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-xeoo-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Zap size={14} />
                  <span>
                    {isCompressing
                      ? "Compressing..."
                      : `Compress All (${items.length})`}
                  </span>
                </button>

                {results.length >= 2 && (
                  <button
                    type="button"
                    onClick={() => void downloadZip()}
                    disabled={isCompressing}
                    className="flex items-center gap-1.5 rounded-lg border border-xeoo-success/30 bg-xeoo-success-soft px-3 py-1.5 text-xs font-medium text-xeoo-success hover:bg-xeoo-success/20 transition-colors cursor-pointer"
                  >
                    <Archive size={14} />
                    <span>Download ZIP ({results.length})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RESULTS SUMMARY BANNER */}
        {results.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-xeoo-success/30 bg-xeoo-success-soft/30 p-3.5 text-xs text-xeoo-text">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-xeoo-success" />
              <span>
                <strong className="font-semibold text-xeoo-text">
                  {results.length}
                </strong>{" "}
                of {items.length} photos compressed successfully.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xeoo-muted">
                Total Size:{" "}
                <span className="font-mono text-xeoo-text">
                  {formatBytes(totalOriginalSize)}
                </span>{" "}
                →{" "}
                <span className="font-mono font-semibold text-xeoo-success">
                  {formatBytes(totalCompressedSize)}
                </span>
              </span>
              <span className="rounded-md border border-xeoo-success/30 bg-xeoo-success-soft px-2 py-0.5 font-mono text-[11px] font-semibold text-xeoo-success">
                {totalReduction >= 0
                  ? `${totalReduction.toFixed(1)}% smaller`
                  : `${Math.abs(totalReduction).toFixed(1)}% larger`}
              </span>
            </div>
          </div>
        )}

        {/* PREVIEW GALLERY: 5 THUMBNAILS ACROSS ON DESKTOP */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((item) => {
              const result = results.find((entry) => entry.id === item.id);

              return (
                <article
                  key={item.id}
                  className="group min-w-0 overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface transition-all hover:border-xeoo-border-dark shadow-xs"
                >
                  <div className="relative aspect-4/3 bg-xeoo-surface-soft flex items-center justify-center">
                    {result ? (
                      <img
                        src={result.url}
                        alt={result.originalName}
                        className="h-full w-full object-contain p-1.5"
                      />
                    ) : (
                      <SourcePreview file={item.file} />
                    )}

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={isCompressing}
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface/90 text-xeoo-muted opacity-0 transition hover:bg-xeoo-danger-soft hover:text-xeoo-danger group-hover:opacity-100 disabled:opacity-30 cursor-pointer"
                      title="Remove photo"
                    >
                      <Trash2 size={12} />
                    </button>

                    {result && (
                      <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-md bg-xeoo-success px-1.5 py-0.5 text-[11px] font-medium text-white shadow-xs">
                        <Check size={11} />
                        Done
                      </span>
                    )}
                  </div>

                  <div className="border-t border-xeoo-border p-2.5">
                    <p
                      className="truncate text-xs font-medium text-xeoo-text"
                      title={item.file.name}
                    >
                      {item.file.name}
                    </p>

                    <div className="mt-1 flex items-center justify-between gap-2 text-xs">
                      <span className="truncate text-[11px] text-xeoo-muted">
                        {result
                          ? `${formatBytes(result.compressedSize)} · ${result.format.toUpperCase()}`
                          : `${formatBytes(item.file.size)} · ${(
                              item.file.type || getFileExtension(item.file.name)
                            )
                              .replace("image/", "")
                              .toUpperCase()}`}
                      </span>

                      {result && (
                        <span
                          className={`shrink-0 font-medium text-[11px] ${
                            result.reduction >= 0
                              ? "text-xeoo-success"
                              : "text-xeoo-warning"
                          }`}
                        >
                          {formatReduction(
                            result.originalSize,
                            result.compressedSize,
                          )}
                        </span>
                      )}
                    </div>

                    {result && (
                      <button
                        type="button"
                        onClick={() => downloadSingle(result)}
                        className="mt-2 inline-flex h-7 w-full items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface-soft text-[11px] font-medium text-xeoo-text transition hover:bg-xeoo-surface cursor-pointer"
                      >
                        <Download size={12} />
                        Download
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* COMPRESSING OVERLAY */}
        {isCompressing && (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl border border-xeoo-border bg-xeoo-surface p-5 text-center shadow-2xl">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-xeoo-primary-soft text-xeoo-primary">
                <Zap size={19} />
              </div>

              <p className="mt-3 text-sm font-semibold text-xeoo-text">
                Compressing photos
              </p>

              <p className="mt-1 text-xs text-xeoo-muted">
                {progress}% complete
              </p>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-xeoo-surface-soft">
                <div
                  className="h-full rounded-full bg-xeoo-primary transition-all duration-200"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs text-xeoo-muted">
                Processing locally in your browser...
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
