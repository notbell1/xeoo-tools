import {
  Check,
  Download,
  Image as ImageIcon,
  Lock,
  RotateCcw,
  Trash2,
  Unlock,
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
import { showError, showSuccess } from "../../alert";

type OutputFormat = "auto" | "jpeg" | "png" | "webp" | "avif";

type ImageFile = {
  file: File;
  url: string;
  width: number;
  height: number;
};

type ResizeResult = {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  mimeType: string;
  formatLabel: string;
  fileName: string;
};

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_DIMENSION = 16000;

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif"]);

const OUTPUT_FORMATS: Array<{
  value: OutputFormat;
  label: string;
  description: string;
}> = [
  {
    value: "auto",
    label: "Auto",
    description: "Keep the original format when supported.",
  },
  {
    value: "jpeg",
    label: "JPEG",
    description: "Good compatibility and smaller files.",
  },
  {
    value: "png",
    label: "PNG",
    description: "Lossless output.",
  },
  {
    value: "webp",
    label: "WebP",
    description: "Modern web format.",
  },
  {
    value: "avif",
    label: "AVIF",
    description: "Modern high-efficiency format.",
  },
];

function getExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function isSupportedImage(file: File): boolean {
  return (
    file.type.startsWith("image/") &&
    IMAGE_EXTENSIONS.has(getExtension(file.name))
  );
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function supportsMimeType(mimeType: string): boolean {
  try {
    const canvas = document.createElement("canvas");

    canvas.width = 1;
    canvas.height = 1;

    const dataUrl = canvas.toDataURL(mimeType);

    return dataUrl.startsWith(`data:${mimeType}`);
  } catch {
    return false;
  }
}

function resolveMimeType(file: File, format: OutputFormat): string {
  if (format === "jpeg") {
    return "image/jpeg";
  }

  if (format === "png") {
    return "image/png";
  }

  if (format === "webp") {
    return "image/webp";
  }

  if (format === "avif") {
    return "image/avif";
  }

  if (file.type === "image/jpeg") {
    return "image/jpeg";
  }

  if (file.type === "image/png") {
    return "image/png";
  }

  if (file.type === "image/webp") {
    return "image/webp";
  }

  if (file.type === "image/avif" && supportsMimeType("image/avif")) {
    return "image/avif";
  }

  return "image/webp";
}

function getFormatLabel(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return "JPEG";

    case "image/png":
      return "PNG";

    case "image/webp":
      return "WebP";

    case "image/avif":
      return "AVIF";

    default:
      return "Image";
  }
}

function getExtensionForMime(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    case "image/avif":
      return "avif";

    default:
      return "png";
  }
}

function sanitizeBaseName(fileName: string): string {
  return (
    fileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
      .trim() || "image"
  );
}

function buildFileName(originalName: string, mimeType: string): string {
  const baseName = sanitizeBaseName(originalName);

  const extension = getExtensionForMime(mimeType);

  return `${baseName}-xeoo-resize.${extension}`;
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);

    image.onerror = () =>
      reject(new Error("Unable to read the selected image."));

    image.src = source;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const encodedQuality =
      mimeType === "image/png"
        ? undefined
        : Math.max(0.1, Math.min(1, quality / 100));

    canvas.toBlob(resolve, mimeType, encodedQuality);
  });
}

export default function ImageResizer() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<ImageFile | null>(null);

  const [result, setResult] = useState<ResizeResult | null>(null);

  const [width, setWidth] = useState("");

  const [height, setHeight] = useState("");

  const [keepRatio, setKeepRatio] = useState(true);

  const [format, setFormat] = useState<OutputFormat>("auto");

  const [quality, setQuality] = useState(85);

  const [activeField, setActiveField] = useState<"width" | "height">("width");

  const [isDragging, setIsDragging] = useState(false);

  const [isResizing, setIsResizing] = useState(false);

  const availableFormats = useMemo(() => {
    const formats: OutputFormat[] = ["auto", "jpeg", "png", "webp"];

    if (supportsMimeType("image/avif")) {
      formats.push("avif");
    }

    return formats;
  }, []);

  const selectedFormatOptions = useMemo(
    () =>
      OUTPUT_FORMATS.filter((option) =>
        availableFormats.includes(option.value),
      ),
    [availableFormats],
  );

  const selectedFormatDescription = useMemo(
    () =>
      OUTPUT_FORMATS.find((option) => option.value === format)?.description ??
      "",
    [format],
  );

  const resolvedMimeType = useMemo(() => {
    if (!image) {
      return "image/png";
    }

    return resolveMimeType(image.file, format);
  }, [image, format]);

  const isLossy = resolvedMimeType !== "image/png";

  useEffect(() => {
    return () => {
      if (image?.url) {
        URL.revokeObjectURL(image.url);
      }

      if (result?.url) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, []);

  function clearResult() {
    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }

    setResult(null);
  }

  function resetAll() {
    if (image?.url) {
      URL.revokeObjectURL(image.url);
    }

    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }

    setImage(null);
    setResult(null);
    setWidth("");
    setHeight("");
    setKeepRatio(true);
    setFormat("auto");
    setQuality(85);
    setActiveField("width");
    setIsDragging(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function selectImage(file: File) {
    if (!isSupportedImage(file)) {
      await showError(
        "Unsupported image",
        "Only JPG, JPEG, PNG, WebP, and AVIF image files are allowed.",
      );

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      await showError("File too large", "The maximum image size is 50 MB.");

      return;
    }

    try {
      const nextUrl = URL.createObjectURL(file);

      const loadedImage = await loadImage(nextUrl);

      if (image?.url) {
        URL.revokeObjectURL(image.url);
      }

      clearResult();

      const nextImage: ImageFile = {
        file,
        url: nextUrl,
        width: loadedImage.naturalWidth,
        height: loadedImage.naturalHeight,
      };

      setImage(nextImage);

      setWidth(String(loadedImage.naturalWidth));

      setHeight(String(loadedImage.naturalHeight));

      setActiveField("width");
    } catch (error) {
      await showError(
        "Image could not be loaded",
        error instanceof Error
          ? error.message
          : "The selected image could not be decoded by this browser.",
      );
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      void selectImage(file);
    }

    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      void selectImage(file);
    }
  }

  function handleWidthChange(value: string) {
    setWidth(value);
    setActiveField("width");
    clearResult();

    if (!keepRatio || !image) {
      return;
    }

    const nextWidth = Number(value);

    if (!Number.isFinite(nextWidth) || nextWidth <= 0) {
      return;
    }

    const ratio = image.width / image.height;

    setHeight(String(Math.max(1, Math.round(nextWidth / ratio))));
  }

  function handleHeightChange(value: string) {
    setHeight(value);
    setActiveField("height");
    clearResult();

    if (!keepRatio || !image) {
      return;
    }

    const nextHeight = Number(value);

    if (!Number.isFinite(nextHeight) || nextHeight <= 0) {
      return;
    }

    const ratio = image.width / image.height;

    setWidth(String(Math.max(1, Math.round(nextHeight * ratio))));
  }

  function resetDimensions() {
    if (!image) {
      return;
    }

    clearResult();

    setWidth(String(image.width));

    setHeight(String(image.height));

    setActiveField("width");
  }

  async function handleResize() {
    if (!image) {
      await showError("No image selected", "Choose one image before resizing.");

      return;
    }

    const targetWidth = Number(width);

    const targetHeight = Number(height);

    if (!Number.isInteger(targetWidth) || targetWidth < 1) {
      await showError(
        "Invalid width",
        "Width must be a whole number greater than 0.",
      );

      return;
    }

    if (!Number.isInteger(targetHeight) || targetHeight < 1) {
      await showError(
        "Invalid height",
        "Height must be a whole number greater than 0.",
      );

      return;
    }

    if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
      await showError(
        "Dimensions too large",
        `Maximum output dimension is ${MAX_DIMENSION.toLocaleString(
          "en-US",
        )} × ${MAX_DIMENSION.toLocaleString("en-US")} pixels.`,
      );

      return;
    }

    setIsResizing(true);
    clearResult();

    try {
      const mimeType = resolveMimeType(image.file, format);

      if (mimeType !== "image/png" && !supportsMimeType(mimeType)) {
        throw new Error(
          `${getFormatLabel(
            mimeType,
          )} output is not supported by this browser.`,
        );
      }

      const source = await loadImage(image.url);

      const canvas = document.createElement("canvas");

      canvas.width = targetWidth;

      canvas.height = targetHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to create the image processing canvas.");
      }

      if (mimeType === "image/jpeg") {
        context.fillStyle = "#ffffff";

        context.fillRect(0, 0, targetWidth, targetHeight);
      }

      context.drawImage(source, 0, 0, targetWidth, targetHeight);

      const blob = await canvasToBlob(canvas, mimeType, quality);

      if (!blob) {
        throw new Error("The browser could not create the resized image.");
      }

      const outputUrl = URL.createObjectURL(blob);

      const resizeResult: ResizeResult = {
        blob,
        url: outputUrl,
        width: targetWidth,
        height: targetHeight,
        mimeType,
        formatLabel: getFormatLabel(mimeType),
        fileName: buildFileName(image.file.name, mimeType),
      };

      setResult(resizeResult);

      await showSuccess(
        "Resize complete",
        `${targetWidth} × ${targetHeight} · ${resizeResult.formatLabel}`,
      );
    } catch (error) {
      await showError(
        "Resize failed",
        error instanceof Error
          ? error.message
          : "The image could not be resized.",
      );
    } finally {
      setIsResizing(false);
    }
  }

  function handleDownload() {
    if (!result) {
      return;
    }

    const link = document.createElement("a");

    link.href = result.url;

    link.download = result.fileName;

    document.body.appendChild(link);

    link.click();
    link.remove();
  }

  const displayUrl = result?.url ?? image?.url ?? "";

  const displayWidth = result?.width ?? image?.width ?? 0;

  const displayHeight = result?.height ?? image?.height ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleFileChange}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-6 sm:py-6">
        {/* COMPACT TOOL TOPBAR */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-xeoo-primary-soft text-xeoo-primary">
              <ImageIcon size={18} />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-xeoo-text sm:text-base">
                Image Resizer
              </h1>
              <p className="text-xs text-xeoo-muted">
                Resize one image with precise dimensions directly in your
                browser • Zero server upload
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-md border border-xeoo-border bg-xeoo-surface-soft px-2.5 py-1 font-medium text-xeoo-text-soft">
              {image ? 1 : 0} / 1 Images
            </span>
            {image && (
              <button
                type="button"
                onClick={resetAll}
                disabled={isResizing}
                className="flex items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface-soft px-2.5 py-1 text-xs text-xeoo-danger hover:border-xeoo-danger/30 hover:bg-xeoo-danger-soft transition-colors cursor-pointer disabled:opacity-50"
                title="Remove image"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* DRAG AND DROP ZONE */}
        {!image ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isResizing) setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            onClick={() => {
              if (!isResizing) inputRef.current?.click();
            }}
            className={`group relative mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all sm:p-8 ${
              isDragging
                ? "border-xeoo-primary bg-xeoo-primary-soft/30 scale-[0.99]"
                : "border-xeoo-border hover:border-xeoo-primary/60 hover:bg-xeoo-surface-soft/60 bg-xeoo-surface"
            } ${isResizing ? "pointer-events-none opacity-50" : ""}`}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-xeoo-primary-soft text-xeoo-primary group-hover:scale-110 transition-transform">
              <Upload size={22} />
            </div>
            <p className="text-sm font-medium text-xeoo-text sm:text-base">
              Drop your image here, or{" "}
              <span className="text-xeoo-primary underline underline-offset-2">
                browse files
              </span>
            </p>
            <p className="mt-1.5 text-xs text-xeoo-muted max-w-lg">
              Supports JPG, PNG, WebP, AVIF, GIF, BMP, SVG, ICO, TIFF, HEIC •
              Max 50MB per file • Paste from clipboard supported
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Left Preview & Details Card (7 cols on lg) */}
            <div className="flex flex-col rounded-xl border border-xeoo-border bg-xeoo-surface p-4 shadow-xs lg:col-span-7">
              <div className="flex items-center justify-between border-b border-xeoo-border pb-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-xeoo-text">
                    {image.file.name}
                  </p>
                  <p className="text-xs text-xeoo-muted">
                    Original: {image.width} × {image.height} px •{" "}
                    {formatBytes(image.file.size)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetAll}
                  disabled={isResizing}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface-soft text-xeoo-muted hover:bg-xeoo-danger-soft hover:text-xeoo-danger transition-colors cursor-pointer disabled:opacity-50"
                  title="Remove image"
                >
                  <X size={13} />
                </button>
              </div>

              <div className="relative my-3 flex min-h-65 flex-1 items-center justify-center overflow-hidden rounded-lg border border-xeoo-border bg-zinc-950/20 p-2">
                <img
                  src={displayUrl}
                  alt={result ? "Resized preview" : "Original preview"}
                  className="max-h-80 max-w-full object-contain"
                />

                {result && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg border border-xeoo-success/30 bg-xeoo-surface/90 px-2.5 py-1 text-xs font-medium text-xeoo-success backdrop-blur-xs">
                    <Check size={12} />
                    Resized
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-xeoo-border pt-3 text-xs">
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2 text-center">
                  <span className="block text-[11px] text-xeoo-muted">
                    Original
                  </span>
                  <span className="font-semibold text-xeoo-text">
                    {image.width} × {image.height}
                  </span>
                </div>

                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2 text-center">
                  <span className="block text-[11px] text-xeoo-muted">
                    Target / Output
                  </span>
                  <span className="font-semibold text-xeoo-text">
                    {displayWidth > 0
                      ? `${displayWidth} × ${displayHeight}`
                      : `${width || "—"} × ${height || "—"}`}
                  </span>
                </div>

                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2 text-center">
                  <span className="block text-[11px] text-xeoo-muted">
                    File Size
                  </span>
                  <span className="font-semibold text-xeoo-text">
                    {result
                      ? formatBytes(result.blob.size)
                      : formatBytes(image.file.size)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Settings Card (5 cols on lg) */}
            <aside className="flex flex-col rounded-xl border border-xeoo-border bg-xeoo-surface p-4 shadow-xs lg:col-span-5">
              <div className="border-b border-xeoo-border pb-3">
                <p className="text-xs font-semibold text-xeoo-text">
                  Resize Settings
                </p>
                <p className="mt-0.5 text-xs text-xeoo-muted">
                  Configure target dimensions and output format.
                </p>
              </div>

              <div className="flex-1 space-y-3 py-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label
                      htmlFor="image-width"
                      className="text-xs font-medium text-xeoo-muted"
                    >
                      Width
                    </label>

                    <div className="relative mt-1.5">
                      <input
                        id="image-width"
                        type="number"
                        min="1"
                        max={MAX_DIMENSION}
                        step="1"
                        value={width}
                        onFocus={() => setActiveField("width")}
                        onChange={(event) =>
                          handleWidthChange(event.target.value)
                        }
                        disabled={isResizing}
                        className={`h-9 w-full rounded-lg border bg-xeoo-surface-soft px-2.5 pr-8 text-xs text-xeoo-text outline-none transition focus:border-xeoo-primary ${
                          activeField === "width"
                            ? "border-xeoo-primary"
                            : "border-xeoo-border"
                        }`}
                      />
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-xeoo-muted">
                        px
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="image-height"
                      className="text-xs font-medium text-xeoo-muted"
                    >
                      Height
                    </label>

                    <div className="relative mt-1.5">
                      <input
                        id="image-height"
                        type="number"
                        min="1"
                        max={MAX_DIMENSION}
                        step="1"
                        value={height}
                        onFocus={() => setActiveField("height")}
                        onChange={(event) =>
                          handleHeightChange(event.target.value)
                        }
                        disabled={isResizing}
                        className={`h-9 w-full rounded-lg border bg-xeoo-surface-soft px-2.5 pr-8 text-xs text-xeoo-text outline-none transition focus:border-xeoo-primary ${
                          activeField === "height"
                            ? "border-xeoo-primary"
                            : "border-xeoo-border"
                        }`}
                      />
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-xeoo-muted">
                        px
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isResizing}
                  onClick={() => {
                    clearResult();
                    setKeepRatio((current) => !current);
                  }}
                  className={`flex min-h-9 w-full items-center justify-between gap-3 rounded-lg border px-2.5 py-1.5 text-left transition cursor-pointer ${
                    keepRatio
                      ? "border-xeoo-primary/30 bg-xeoo-primary-soft text-xeoo-primary"
                      : "border-xeoo-border bg-xeoo-surface-soft text-xeoo-muted"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {keepRatio ? (
                      <Lock size={14} className="shrink-0 text-xeoo-primary" />
                    ) : (
                      <Unlock size={14} className="shrink-0 text-xeoo-muted" />
                    )}
                    <span className="truncate text-xs font-medium text-xeoo-text">
                      Maintain aspect ratio
                    </span>
                  </span>

                  <span className="shrink-0 text-xs font-medium">
                    {keepRatio ? "On" : "Off"}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-2.5 py-2">
                    <p className="text-xs text-xeoo-muted">Original ratio</p>
                    <p className="mt-1 text-xs font-medium text-xeoo-text">
                      {(image.width / image.height).toFixed(2)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-2.5 py-2">
                    <p className="text-xs text-xeoo-muted">Input size</p>
                    <p className="mt-1 truncate text-xs font-medium text-xeoo-text">
                      {formatBytes(image.file.size)}
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="image-format"
                    className="text-xs font-medium text-xeoo-muted"
                  >
                    Output format
                  </label>

                  <select
                    id="image-format"
                    value={format}
                    disabled={isResizing}
                    onChange={(event) => {
                      clearResult();
                      setFormat(event.target.value as OutputFormat);
                    }}
                    className="mt-1.5 h-9 w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-2.5 text-xs text-xeoo-text outline-none transition focus:border-xeoo-primary disabled:opacity-50 cursor-pointer"
                  >
                    {selectedFormatOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <p className="mt-1.5 text-xs leading-4 text-xeoo-muted">
                    {selectedFormatDescription}
                  </p>
                </div>

                {isLossy && (
                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="image-quality"
                        className="text-xs font-medium text-xeoo-muted"
                      >
                        Quality: {quality}%
                      </label>
                      <span className="text-[11px] text-xeoo-muted">
                        {quality >= 90
                          ? "Best"
                          : quality >= 75
                            ? "Balanced"
                            : "Low"}
                      </span>
                    </div>

                    <input
                      id="image-quality"
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={quality}
                      disabled={isResizing}
                      onChange={(event) => {
                        clearResult();
                        setQuality(Number(event.target.value));
                      }}
                      className="mt-2 w-full accent-xeoo-primary disabled:opacity-30 cursor-pointer"
                    />
                  </div>
                )}

                {resolvedMimeType === "image/jpeg" && (
                  <div className="rounded-lg border border-xeoo-warning/20 bg-xeoo-warning-soft px-2.5 py-2">
                    <p className="text-xs leading-5 text-xeoo-warning">
                      JPEG does not support transparency. Transparent areas
                      become white.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-xeoo-border pt-3">
                <button
                  type="button"
                  onClick={resetDimensions}
                  disabled={isResizing}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 text-xs font-medium text-xeoo-text transition hover:border-xeoo-border-dark disabled:opacity-30 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reset Size</span>
                </button>

                {result ? (
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isResizing}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-3 text-xs font-medium text-white shadow-xs transition hover:bg-xeoo-primary/90 disabled:opacity-30 cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleResize()}
                    disabled={isResizing}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-3 text-xs font-medium text-white shadow-xs transition hover:bg-xeoo-primary/90 disabled:opacity-30 cursor-pointer"
                  >
                    <ImageIcon size={13} />
                    <span>{isResizing ? "Resizing..." : "Resize Image"}</span>
                  </button>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
