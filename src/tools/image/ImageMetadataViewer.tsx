import {
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  Info,
  Layers,
  Loader2,
  MapPin,
  Maximize2,
  Palette,
  Search,
  ShieldAlert,
  ShieldCheck,
  Tag,
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
  extractImageMetadata,
  exportMetadataJson,
  exportMetadataTxt,
  MAX_METADATA_FILES,
  validateImageFile,
  type CompleteImageMetadata,
} from "./imageMetadataLogic";

export default function ImageMetadataViewer() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [metadataList, setMetadataList] = useState<CompleteImageMetadata[]>([]);
  const metadataListRef = useRef<CompleteImageMetadata[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);

  // Accordion open/close state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    privacy: true,
    file: true,
    image: true,
    color: true,
    exif: true,
    gps: true,
    iptc: false,
    xmp: false,
    format: false,
    raw: false,
  });

  useEffect(() => {
    metadataListRef.current = metadataList;
  }, [metadataList]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      metadataListRef.current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  const activeMetadata = useMemo(() => {
    if (!metadataList.length) return null;
    return metadataList.find((item) => item.id === activeId) || metadataList[0];
  }, [metadataList, activeId]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleAllSections = (expand: boolean) => {
    setOpenSections({
      privacy: expand,
      file: expand,
      image: expand,
      color: expand,
      exif: expand,
      gps: expand,
      iptc: expand,
      xmp: expand,
      format: expand,
      raw: expand,
    });
  };

  // Process selected or dropped files
  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (!files.length) return;

    const currentCount = metadataList.length;
    const remainingSlots = MAX_METADATA_FILES - currentCount;

    if (remainingSlots <= 0) {
      await showWarning(
        "File Limit Reached",
        `You can inspect up to ${MAX_METADATA_FILES} images at a time. Please remove some images first.`,
      );
      return;
    }

    let filesToProcess = files;
    if (files.length > remainingSlots) {
      await showWarning(
        "File Limit Warning",
        `Only the first ${remainingSlots} image${remainingSlots > 1 ? "s" : ""} were processed (Maximum ${MAX_METADATA_FILES} files allowed).`,
      );
      filesToProcess = files.slice(0, remainingSlots);
    }

    setIsLoading(true);
    const newItems: CompleteImageMetadata[] = [];
    const rejectedFiles: { name: string; reason: string }[] = [];

    for (const file of filesToProcess) {
      const validation = await validateImageFile(file);
      if (!validation.valid) {
        rejectedFiles.push({
          name: file.name,
          reason: validation.reason || "Invalid image file.",
        });
        continue;
      }

      try {
        const metadata = await extractImageMetadata(file);
        newItems.push(metadata);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : `Failed to inspect "${file.name}".`;
        rejectedFiles.push({
          name: file.name,
          reason: msg,
        });
      }
    }

    setIsLoading(false);

    if (rejectedFiles.length > 0) {
      const msg =
        rejectedFiles.length === 1
          ? rejectedFiles[0].reason
          : `${rejectedFiles.length} files were rejected:\n` +
            rejectedFiles.map((r) => `• ${r.name}: ${r.reason}`).join("\n");
      await showError("File Validation Error", msg);
    }

    if (newItems.length > 0) {
      setMetadataList((prev) => {
        const updated = [...prev, ...newItems];
        if (!activeId && updated.length > 0) {
          setActiveId(updated[0].id);
        }
        return updated;
      });
      if (!activeId) {
        setActiveId(newItems[0].id);
      }
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

  // Remove single image
  const handleRemoveItem = (id: string) => {
    const item = metadataList.find((i) => i.id === id);
    if (item && item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
    setMetadataList((prev) => {
      const remaining = prev.filter((i) => i.id !== id);
      if (activeId === id && remaining.length > 0) {
        setActiveId(remaining[0].id);
      } else if (remaining.length === 0) {
        setActiveId(null);
      }
      return remaining;
    });
  };

  // Clear all images
  const handleClearAll = async () => {
    if (metadataList.length === 0) return;
    const confirmed = await showConfirm(
      "Clear All Images",
      "Are you sure you want to clear all loaded images and metadata?",
    );
    if (!confirmed) return;

    metadataList.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });

    setMetadataList([]);
    setActiveId(null);
    setSearchQuery("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Copy helper
  const copyToClipboard = async (
    text: string,
    label: string,
    keyId?: string,
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      if (keyId) {
        setCopiedKey(keyId);
        setTimeout(() => setCopiedKey(null), 1500);
      }
      await showSuccess("Copied", `${label} copied to clipboard.`);
    } catch {
      await showError("Copy Failed", "Unable to access clipboard.");
    }
  };

  // Copy entire metadata summary
  const handleCopyAll = async () => {
    if (!activeMetadata) return;
    const lines = activeMetadata.rawEntries.map(
      (e) => `${e.category} > ${e.key}: ${e.value}`,
    );
    await copyToClipboard(
      lines.join("\n"),
      `Metadata for "${activeMetadata.fileInfo.fileName}"`,
    );
  };

  // Filtered raw metadata based on search query
  const filteredRawEntries = useMemo(() => {
    if (!activeMetadata) return [];
    if (!searchQuery.trim()) return activeMetadata.rawEntries;
    const q = searchQuery.toLowerCase().trim();
    return activeMetadata.rawEntries.filter(
      (e) =>
        e.category.toLowerCase().includes(q) ||
        e.key.toLowerCase().includes(q) ||
        e.value.toLowerCase().includes(q),
    );
  }, [activeMetadata, searchQuery]);

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
        {/* COMPACT TOOL BAR */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-xeoo-primary-soft text-xeoo-primary">
              <Eye size={18} />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-xeoo-text sm:text-base">
                Image Metadata Viewer
              </h1>
              <p className="text-xs text-xeoo-muted">
                Extract EXIF, GPS, IPTC, XMP & Container Specs • 100%
                Client-Side
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {isLoading && (
              <div className="flex items-center gap-1 text-xeoo-primary">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-[11px] font-medium">Extracting...</span>
              </div>
            )}
            <span className="rounded-md border border-xeoo-border bg-xeoo-surface-soft px-2.5 py-1 font-medium text-xeoo-text-soft">
              {metadataList.length} / {MAX_METADATA_FILES} Images
            </span>
            {metadataList.length > 0 && (
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
        {metadataList.length < MAX_METADATA_FILES && (
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
              {isLoading ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <Upload size={22} />
              )}
            </div>
            <p className="text-sm font-medium text-xeoo-text sm:text-base">
              {isLoading ? (
                "Inspecting image metadata..."
              ) : metadataList.length === 0 ? (
                <>
                  Drop up to {MAX_METADATA_FILES} images here, or{" "}
                  <span className="text-xeoo-primary underline underline-offset-2">
                    browse files
                  </span>
                </>
              ) : (
                <>
                  Drop up to {MAX_METADATA_FILES - metadataList.length} more
                  image
                  {MAX_METADATA_FILES - metadataList.length > 1 ? "s" : ""}{" "}
                  here, or{" "}
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

        {/* MULTI-FILE SELECTOR STRIP */}
        {metadataList.length > 1 && (
          <div className="mb-4 flex items-center gap-2 overflow-x-auto rounded-xl border border-xeoo-border bg-xeoo-surface p-2.5 scrollbar-thin">
            <span className="text-xs font-semibold uppercase tracking-wider text-xeoo-muted shrink-0 pl-1">
              Select Image:
            </span>
            <div className="flex gap-2 min-w-0 flex-1">
              {metadataList.map((item) => {
                const isActive = item.id === activeMetadata?.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveId(item.id)}
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? "border-xeoo-primary bg-xeoo-primary-soft text-xeoo-primary shadow-xs font-semibold"
                        : "border-xeoo-border bg-xeoo-surface-soft text-xeoo-text hover:border-xeoo-primary/50"
                    }`}
                  >
                    <div className="h-5 w-5 overflow-hidden rounded bg-black/20 shrink-0">
                      <img
                        src={item.previewUrl}
                        alt={item.fileInfo.fileName}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span className="max-w-[130px] truncate">
                      {item.fileInfo.fileName}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(item.id);
                      }}
                      className="text-xeoo-muted hover:text-xeoo-danger"
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MAIN VIEWER LAYOUT */}
        {activeMetadata && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* LEFT COLUMN: PREVIEW & QUICK ACTIONS (4 cols on lg) */}
            <div className="space-y-4 lg:col-span-4">
              {/* Image Preview Box */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 shadow-xs">
                <div className="relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-xeoo-border bg-zinc-950/20">
                  <img
                    src={activeMetadata.previewUrl}
                    alt={activeMetadata.fileInfo.fileName}
                    className="max-h-full max-w-full object-contain p-1"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewModalOpen(true)}
                    className="absolute right-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white backdrop-blur-xs hover:bg-black/80 transition-colors cursor-pointer"
                    title="Enlarge preview"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <p
                    className="truncate font-semibold text-xeoo-text"
                    title={activeMetadata.fileInfo.fileName}
                  >
                    {activeMetadata.fileInfo.fileName}
                  </p>
                  <div className="flex flex-wrap items-center justify-between text-xeoo-muted">
                    <span>
                      {activeMetadata.imageInfo.width} ×{" "}
                      {activeMetadata.imageInfo.height} px
                    </span>
                    <span className="font-mono">
                      {activeMetadata.fileInfo.fileSize}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between text-xeoo-muted">
                    <span>{activeMetadata.imageInfo.aspectRatio} Ratio</span>
                    <span className="rounded bg-xeoo-surface-soft px-1.5 py-0.5 text-[10px] font-semibold text-xeoo-text uppercase">
                      {activeMetadata.fileInfo.container}
                    </span>
                  </div>
                </div>

                {/* Export / Copy Toolbar */}
                <div className="mt-3.5 flex flex-wrap gap-1.5 border-t border-xeoo-border pt-3">
                  <button
                    type="button"
                    onClick={handleCopyAll}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-2.5 py-1.5 text-xs font-medium text-xeoo-text hover:border-xeoo-border-dark transition-colors cursor-pointer"
                    title="Copy all visible metadata to clipboard"
                  >
                    <Copy size={13} />
                    <span>Copy All</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportMetadataJson(activeMetadata)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-xeoo-primary/30 bg-xeoo-primary-soft px-2.5 py-1.5 text-xs font-medium text-xeoo-primary hover:bg-xeoo-primary/20 transition-colors cursor-pointer"
                    title="Download structured JSON"
                  >
                    <FileCode size={13} />
                    <span>JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportMetadataTxt(activeMetadata)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-2.5 py-1.5 text-xs font-medium text-xeoo-text hover:border-xeoo-border-dark transition-colors cursor-pointer"
                    title="Download formatted TXT"
                  >
                    <FileText size={13} />
                    <span>TXT</span>
                  </button>
                </div>
              </div>

              {/* PRIVACY CHECK SUMMARY CARD */}
              <div
                className={`rounded-xl border p-3.5 shadow-xs transition-colors ${
                  activeMetadata.privacyCheck.hasSensitiveData
                    ? "border-xeoo-warning/40 bg-xeoo-warning-soft/20"
                    : "border-xeoo-success/30 bg-xeoo-success-soft/20"
                }`}
              >
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {activeMetadata.privacyCheck.hasSensitiveData ? (
                      <ShieldAlert size={16} className="text-xeoo-warning" />
                    ) : (
                      <ShieldCheck size={16} className="text-xeoo-success" />
                    )}
                    <span className="text-xs font-semibold text-xeoo-text">
                      Privacy & Sensitive Data
                    </span>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                      activeMetadata.privacyCheck.hasSensitiveData
                        ? "bg-xeoo-warning-soft text-xeoo-warning border border-xeoo-warning/30"
                        : "bg-xeoo-success-soft text-xeoo-success border border-xeoo-success/30"
                    }`}
                  >
                    {activeMetadata.privacyCheck.hasSensitiveData
                      ? "Detected"
                      : "Clean"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {activeMetadata.privacyCheck.items.map((p) => (
                    <div
                      key={p.category}
                      className="flex items-start justify-between gap-2 border-b border-xeoo-border/50 pb-1 last:border-0 last:pb-0"
                    >
                      <span className="text-xeoo-muted">{p.category}</span>
                      <span
                        className={`text-right font-medium truncate max-w-[170px] ${
                          p.detected
                            ? p.warningLevel === "high"
                              ? "text-xeoo-danger font-semibold"
                              : "text-xeoo-warning"
                            : "text-xeoo-muted"
                        }`}
                        title={p.value}
                      >
                        {p.detected ? p.value : "None"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: SEARCH & METADATA ACCORDIONS (8 cols on lg) */}
            <div className="space-y-3 lg:col-span-8">
              {/* Search & Global Toggle Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-xeoo-border bg-xeoo-surface p-2.5 shadow-xs">
                <div className="relative flex-1 min-w-[200px]">
                  <Search
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xeoo-muted"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search metadata fields (e.g. ISO, GPS, DPI)..."
                    className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-1.5 pl-8 pr-7 text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-hidden"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xeoo-muted hover:text-xeoo-text"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleAllSections(true)}
                    className="rounded-md border border-xeoo-border bg-xeoo-surface-soft px-2 py-1 text-[11px] text-xeoo-text hover:border-xeoo-border-dark cursor-pointer"
                  >
                    Expand All
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAllSections(false)}
                    className="rounded-md border border-xeoo-border bg-xeoo-surface-soft px-2 py-1 text-[11px] text-xeoo-text hover:border-xeoo-border-dark cursor-pointer"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              {/* SECTION 1: FILE INFORMATION */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleSection("file")}
                  className="flex w-full items-center justify-between p-3 text-left hover:bg-xeoo-surface-soft/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileImage size={15} className="text-xeoo-primary" />
                    <span className="text-xs font-semibold text-xeoo-text">
                      File Information
                    </span>
                  </div>
                  {openSections.file ? (
                    <ChevronDown size={15} className="text-xeoo-muted" />
                  ) : (
                    <ChevronRight size={15} className="text-xeoo-muted" />
                  )}
                </button>

                {openSections.file && (
                  <div className="border-t border-xeoo-border p-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
                    <MetadataRow
                      label="Filename"
                      value={activeMetadata.fileInfo.fileName}
                      onCopy={() =>
                        copyToClipboard(
                          activeMetadata.fileInfo.fileName,
                          "Filename",
                          "file-name",
                        )
                      }
                      copied={copiedKey === "file-name"}
                    />
                    <MetadataRow
                      label="Format / Extension"
                      value={activeMetadata.fileInfo.extension}
                    />
                    <MetadataRow
                      label="MIME Type"
                      value={activeMetadata.fileInfo.mimeType}
                    />
                    <MetadataRow
                      label="File Size"
                      value={`${activeMetadata.fileInfo.fileSize} (${activeMetadata.fileInfo.fileSizeBytes.toLocaleString()} bytes)`}
                    />
                    <MetadataRow
                      label="Container Signature"
                      value={activeMetadata.fileInfo.container}
                    />
                    <MetadataRow
                      label="Last Modified"
                      value={activeMetadata.fileInfo.lastModified}
                    />
                  </div>
                )}
              </div>

              {/* SECTION 2: IMAGE & DIMENSIONS */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleSection("image")}
                  className="flex w-full items-center justify-between p-3 text-left hover:bg-xeoo-surface-soft/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Layers size={15} className="text-xeoo-primary" />
                    <span className="text-xs font-semibold text-xeoo-text">
                      Image Dimensions & Geometry
                    </span>
                  </div>
                  {openSections.image ? (
                    <ChevronDown size={15} className="text-xeoo-muted" />
                  ) : (
                    <ChevronRight size={15} className="text-xeoo-muted" />
                  )}
                </button>

                {openSections.image && (
                  <div className="border-t border-xeoo-border p-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
                    <MetadataRow
                      label="Dimensions"
                      value={`${activeMetadata.imageInfo.width} × ${activeMetadata.imageInfo.height} px`}
                    />
                    <MetadataRow
                      label="Aspect Ratio"
                      value={`${activeMetadata.imageInfo.aspectRatio} (${activeMetadata.imageInfo.aspectRatioDecimal})`}
                    />
                    <MetadataRow
                      label="Megapixels"
                      value={`${activeMetadata.imageInfo.megapixels} MP`}
                    />
                    <MetadataRow
                      label="Total Pixel Count"
                      value={`${activeMetadata.imageInfo.totalPixels.toLocaleString()} pixels`}
                    />
                    <MetadataRow
                      label="Orientation"
                      value={
                        activeMetadata.imageInfo.orientationLabel ||
                        "Standard (0°)"
                      }
                    />
                    <MetadataRow
                      label="Animation Type"
                      value={
                        activeMetadata.imageInfo.animated
                          ? `Animated (${activeMetadata.imageInfo.frameCount} frames)`
                          : "Static Image"
                      }
                    />
                    {activeMetadata.imageInfo.loopCount && (
                      <MetadataRow
                        label="Loop Count"
                        value={activeMetadata.imageInfo.loopCount}
                      />
                    )}
                    {activeMetadata.imageInfo.durationMs && (
                      <MetadataRow
                        label="Total Duration"
                        value={`${(activeMetadata.imageInfo.durationMs / 1000).toFixed(2)} s`}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 3: COLOR & RESOLUTION */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleSection("color")}
                  className="flex w-full items-center justify-between p-3 text-left hover:bg-xeoo-surface-soft/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Palette size={15} className="text-xeoo-primary" />
                    <span className="text-xs font-semibold text-xeoo-text">
                      Color & Print Resolution
                    </span>
                  </div>
                  {openSections.color ? (
                    <ChevronDown size={15} className="text-xeoo-muted" />
                  ) : (
                    <ChevronRight size={15} className="text-xeoo-muted" />
                  )}
                </button>

                {openSections.color && (
                  <div className="border-t border-xeoo-border p-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
                    <MetadataRow
                      label="Color Model"
                      value={activeMetadata.colorInfo.colorType}
                    />
                    <MetadataRow
                      label="Bit Depth"
                      value={
                        activeMetadata.colorInfo.bitDepth
                          ? `${activeMetadata.colorInfo.bitDepth}-bit`
                          : "Not available"
                      }
                    />
                    <MetadataRow
                      label="Color Space"
                      value={
                        activeMetadata.colorInfo.colorSpace ||
                        (activeMetadata.colorInfo.hasIccProfile
                          ? "Embedded ICC Profile"
                          : "sRGB (Standard)")
                      }
                    />
                    <MetadataRow
                      label="Alpha Channel"
                      value={
                        activeMetadata.colorInfo.hasAlpha
                          ? "Yes (Transparency present)"
                          : "No (Opaque)"
                      }
                    />
                    <MetadataRow
                      label="DPI Resolution"
                      value={
                        activeMetadata.resolutionInfo.available
                          ? `${activeMetadata.resolutionInfo.dpiX} × ${activeMetadata.resolutionInfo.dpiY} DPI`
                          : "Not available"
                      }
                    />
                    <MetadataRow
                      label="Physical Print Size"
                      value={
                        activeMetadata.resolutionInfo.printWidthInches
                          ? `${activeMetadata.resolutionInfo.printWidthInches}″ × ${activeMetadata.resolutionInfo.printHeightInches}″ (${activeMetadata.resolutionInfo.printWidthCm} × ${activeMetadata.resolutionInfo.printHeightCm} cm)`
                          : "Not available"
                      }
                    />
                  </div>
                )}
              </div>

              {/* SECTION 4: EXIF CAMERA DATA */}
              {activeMetadata.exifInfo && (
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => toggleSection("exif")}
                    className="flex w-full items-center justify-between p-3 text-left hover:bg-xeoo-surface-soft/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Camera size={15} className="text-xeoo-primary" />
                      <span className="text-xs font-semibold text-xeoo-text">
                        EXIF Camera & Exposure
                      </span>
                    </div>
                    {openSections.exif ? (
                      <ChevronDown size={15} className="text-xeoo-muted" />
                    ) : (
                      <ChevronRight size={15} className="text-xeoo-muted" />
                    )}
                  </button>

                  {openSections.exif && (
                    <div className="border-t border-xeoo-border p-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
                      {activeMetadata.exifInfo.make && (
                        <MetadataRow
                          label="Camera Make"
                          value={activeMetadata.exifInfo.make}
                        />
                      )}
                      {activeMetadata.exifInfo.model && (
                        <MetadataRow
                          label="Camera Model"
                          value={activeMetadata.exifInfo.model}
                        />
                      )}
                      {activeMetadata.exifInfo.lensModel && (
                        <MetadataRow
                          label="Lens"
                          value={activeMetadata.exifInfo.lensModel}
                        />
                      )}
                      {activeMetadata.exifInfo.exposureTime && (
                        <MetadataRow
                          label="Exposure Time"
                          value={activeMetadata.exifInfo.exposureTime}
                        />
                      )}
                      {activeMetadata.exifInfo.fNumber && (
                        <MetadataRow
                          label="Aperture"
                          value={activeMetadata.exifInfo.fNumber}
                        />
                      )}
                      {activeMetadata.exifInfo.iso && (
                        <MetadataRow
                          label="ISO Sensitivity"
                          value={`ISO ${activeMetadata.exifInfo.iso}`}
                        />
                      )}
                      {activeMetadata.exifInfo.focalLength && (
                        <MetadataRow
                          label="Focal Length"
                          value={`${activeMetadata.exifInfo.focalLength} ${
                            activeMetadata.exifInfo.focalLength35mm
                              ? `(${activeMetadata.exifInfo.focalLength35mm} in 35mm)`
                              : ""
                          }`}
                        />
                      )}
                      {activeMetadata.exifInfo.exposureBias && (
                        <MetadataRow
                          label="Exposure Bias"
                          value={activeMetadata.exifInfo.exposureBias}
                        />
                      )}
                      {activeMetadata.exifInfo.meteringMode && (
                        <MetadataRow
                          label="Metering Mode"
                          value={activeMetadata.exifInfo.meteringMode}
                        />
                      )}
                      {activeMetadata.exifInfo.flash && (
                        <MetadataRow
                          label="Flash"
                          value={activeMetadata.exifInfo.flash}
                        />
                      )}
                      {activeMetadata.exifInfo.whiteBalance && (
                        <MetadataRow
                          label="White Balance"
                          value={activeMetadata.exifInfo.whiteBalance}
                        />
                      )}
                      {activeMetadata.exifInfo.exposureProgram && (
                        <MetadataRow
                          label="Exposure Program"
                          value={activeMetadata.exifInfo.exposureProgram}
                        />
                      )}
                      {activeMetadata.exifInfo.dateTimeOriginal && (
                        <MetadataRow
                          label="Date Taken"
                          value={activeMetadata.exifInfo.dateTimeOriginal}
                        />
                      )}
                      {activeMetadata.exifInfo.software && (
                        <MetadataRow
                          label="Software"
                          value={activeMetadata.exifInfo.software}
                        />
                      )}
                      {activeMetadata.exifInfo.artist && (
                        <MetadataRow
                          label="Author / Artist"
                          value={activeMetadata.exifInfo.artist}
                        />
                      )}
                      {activeMetadata.exifInfo.copyright && (
                        <MetadataRow
                          label="Copyright"
                          value={activeMetadata.exifInfo.copyright}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 5: GPS / LOCATION */}
              {activeMetadata.gpsInfo?.hasGps && (
                <div className="rounded-xl border border-xeoo-danger/30 bg-xeoo-surface overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => toggleSection("gps")}
                    className="flex w-full items-center justify-between p-3 text-left hover:bg-xeoo-surface-soft/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-xeoo-danger">
                      <MapPin size={15} />
                      <span className="text-xs font-semibold text-xeoo-text">
                        GPS Location Metadata
                      </span>
                    </div>
                    {openSections.gps ? (
                      <ChevronDown size={15} className="text-xeoo-muted" />
                    ) : (
                      <ChevronRight size={15} className="text-xeoo-muted" />
                    )}
                  </button>

                  {openSections.gps && (
                    <div className="border-t border-xeoo-border p-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
                      <MetadataRow
                        label="Latitude"
                        value={`${activeMetadata.gpsInfo.latitude}° (${activeMetadata.gpsInfo.latitudeDms})`}
                        onCopy={() =>
                          copyToClipboard(
                            String(activeMetadata.gpsInfo?.latitude),
                            "Latitude",
                            "gps-lat",
                          )
                        }
                        copied={copiedKey === "gps-lat"}
                      />
                      <MetadataRow
                        label="Longitude"
                        value={`${activeMetadata.gpsInfo.longitude}° (${activeMetadata.gpsInfo.longitudeDms})`}
                        onCopy={() =>
                          copyToClipboard(
                            String(activeMetadata.gpsInfo?.longitude),
                            "Longitude",
                            "gps-lon",
                          )
                        }
                        copied={copiedKey === "gps-lon"}
                      />
                      {activeMetadata.gpsInfo.altitude && (
                        <MetadataRow
                          label="Altitude"
                          value={activeMetadata.gpsInfo.altitude}
                        />
                      )}
                      {activeMetadata.gpsInfo.dateTime && (
                        <MetadataRow
                          label="GPS Timestamp"
                          value={activeMetadata.gpsInfo.dateTime}
                        />
                      )}
                      {activeMetadata.gpsInfo.mapDatum && (
                        <MetadataRow
                          label="Map Datum"
                          value={activeMetadata.gpsInfo.mapDatum}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 6: IPTC METADATA */}
              {activeMetadata.iptcInfo && (
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => toggleSection("iptc")}
                    className="flex w-full items-center justify-between p-3 text-left hover:bg-xeoo-surface-soft/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Tag size={15} className="text-xeoo-primary" />
                      <span className="text-xs font-semibold text-xeoo-text">
                        IPTC Editorial & Rights
                      </span>
                    </div>
                    {openSections.iptc ? (
                      <ChevronDown size={15} className="text-xeoo-muted" />
                    ) : (
                      <ChevronRight size={15} className="text-xeoo-muted" />
                    )}
                  </button>

                  {openSections.iptc && (
                    <div className="border-t border-xeoo-border p-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
                      {activeMetadata.iptcInfo.title && (
                        <MetadataRow
                          label="Title"
                          value={activeMetadata.iptcInfo.title}
                        />
                      )}
                      {activeMetadata.iptcInfo.headline && (
                        <MetadataRow
                          label="Headline"
                          value={activeMetadata.iptcInfo.headline}
                        />
                      )}
                      {activeMetadata.iptcInfo.creator && (
                        <MetadataRow
                          label="Creator / Author"
                          value={activeMetadata.iptcInfo.creator}
                        />
                      )}
                      {activeMetadata.iptcInfo.caption && (
                        <div className="sm:col-span-2">
                          <MetadataRow
                            label="Caption / Description"
                            value={activeMetadata.iptcInfo.caption}
                          />
                        </div>
                      )}
                      {activeMetadata.iptcInfo.keywords && (
                        <div className="sm:col-span-2">
                          <MetadataRow
                            label="Keywords / Tags"
                            value={activeMetadata.iptcInfo.keywords.join(", ")}
                          />
                        </div>
                      )}
                      {activeMetadata.iptcInfo.city && (
                        <MetadataRow
                          label="City"
                          value={activeMetadata.iptcInfo.city}
                        />
                      )}
                      {activeMetadata.iptcInfo.country && (
                        <MetadataRow
                          label="Country"
                          value={activeMetadata.iptcInfo.country}
                        />
                      )}
                      {activeMetadata.iptcInfo.copyright && (
                        <MetadataRow
                          label="Copyright"
                          value={activeMetadata.iptcInfo.copyright}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 7: XMP METADATA */}
              {activeMetadata.xmpInfo && (
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => toggleSection("xmp")}
                    className="flex w-full items-center justify-between p-3 text-left hover:bg-xeoo-surface-soft/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileCode size={15} className="text-xeoo-primary" />
                      <span className="text-xs font-semibold text-xeoo-text">
                        XMP Adobe Extensible Metadata
                      </span>
                    </div>
                    {openSections.xmp ? (
                      <ChevronDown size={15} className="text-xeoo-muted" />
                    ) : (
                      <ChevronRight size={15} className="text-xeoo-muted" />
                    )}
                  </button>

                  {openSections.xmp && (
                    <div className="border-t border-xeoo-border p-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
                      {activeMetadata.xmpInfo.creator && (
                        <MetadataRow
                          label="Creator"
                          value={activeMetadata.xmpInfo.creator}
                        />
                      )}
                      {activeMetadata.xmpInfo.title && (
                        <MetadataRow
                          label="Title"
                          value={activeMetadata.xmpInfo.title}
                        />
                      )}
                      {activeMetadata.xmpInfo.creatorTool && (
                        <MetadataRow
                          label="Creator Tool"
                          value={activeMetadata.xmpInfo.creatorTool}
                        />
                      )}
                      {activeMetadata.xmpInfo.createDate && (
                        <MetadataRow
                          label="Create Date"
                          value={activeMetadata.xmpInfo.createDate}
                        />
                      )}
                      {activeMetadata.xmpInfo.rights && (
                        <MetadataRow
                          label="Rights"
                          value={activeMetadata.xmpInfo.rights}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 8: FORMAT SPECIFIC CHUNKS & MARKERS */}
              {activeMetadata.formatSpecific && (
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => toggleSection("format")}
                    className="flex w-full items-center justify-between p-3 text-left hover:bg-xeoo-surface-soft/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Info size={15} className="text-xeoo-primary" />
                      <span className="text-xs font-semibold text-xeoo-text">
                        {activeMetadata.formatSpecific.format}
                      </span>
                    </div>
                    {openSections.format ? (
                      <ChevronDown size={15} className="text-xeoo-muted" />
                    ) : (
                      <ChevronRight size={15} className="text-xeoo-muted" />
                    )}
                  </button>

                  {openSections.format && (
                    <div className="border-t border-xeoo-border p-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
                      {activeMetadata.formatSpecific.items.map((it) => (
                        <MetadataRow
                          key={it.label}
                          label={it.label}
                          value={String(it.value)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 9: RAW SEARCHABLE METADATA TABLE */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleSection("raw")}
                  className="flex w-full items-center justify-between p-3 text-left hover:bg-xeoo-surface-soft/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet size={15} className="text-xeoo-primary" />
                    <span className="text-xs font-semibold text-xeoo-text">
                      Raw Key / Value Index ({filteredRawEntries.length} items)
                    </span>
                  </div>
                  {openSections.raw ? (
                    <ChevronDown size={15} className="text-xeoo-muted" />
                  ) : (
                    <ChevronRight size={15} className="text-xeoo-muted" />
                  )}
                </button>

                {openSections.raw && (
                  <div className="border-t border-xeoo-border max-h-80 overflow-y-auto p-2 scrollbar-thin">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-xeoo-surface-soft text-[11px] font-semibold text-xeoo-muted">
                        <tr>
                          <th className="p-2">Category</th>
                          <th className="p-2">Property</th>
                          <th className="p-2">Value</th>
                          <th className="p-2 text-right">Copy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-xeoo-border">
                        {filteredRawEntries.map((e, idx) => (
                          <tr
                            key={`${e.category}-${e.key}-${idx}`}
                            className="hover:bg-xeoo-surface-soft/50 transition-colors"
                          >
                            <td className="p-2 font-medium text-xeoo-muted whitespace-nowrap">
                              {e.category}
                            </td>
                            <td className="p-2 font-medium text-xeoo-text whitespace-nowrap">
                              {e.key}
                            </td>
                            <td
                              className="p-2 font-mono text-xeoo-text-soft break-all max-w-[280px]"
                              title={e.value}
                            >
                              {e.value}
                            </td>
                            <td className="p-2 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(e.value, e.key, `raw-${idx}`)
                                }
                                className="text-xeoo-muted hover:text-xeoo-primary cursor-pointer"
                                title="Copy value"
                              >
                                {copiedKey === `raw-${idx}` ? (
                                  <Check
                                    size={12}
                                    className="text-xeoo-success"
                                  />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* IMAGE PREVIEW MODAL */}
        {previewModalOpen && activeMetadata && (
          <div
            onClick={() => setPreviewModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 shadow-2xl"
            >
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="truncate text-xs font-semibold text-xeoo-text">
                  {activeMetadata.fileInfo.fileName} (
                  {activeMetadata.imageInfo.width} ×{" "}
                  {activeMetadata.imageInfo.height} px)
                </p>
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-xeoo-border bg-xeoo-surface-soft text-xeoo-text hover:bg-xeoo-danger-soft hover:text-xeoo-danger cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex max-h-[75vh] items-center justify-center overflow-auto rounded-xl border border-xeoo-border bg-zinc-950/20 p-2">
                <img
                  src={activeMetadata.previewUrl}
                  alt={activeMetadata.fileInfo.fileName}
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

// Compact Sub-component for individual metadata key-value item with copy action
function MetadataRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value?: string | number | null;
  onCopy?: () => void;
  copied?: boolean;
}) {
  const displayVal =
    value !== undefined && value !== null && value !== ""
      ? String(value)
      : "Not available";
  const isAvailable = displayVal !== "Not available";

  return (
    <div className="flex items-start justify-between gap-2 rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 p-2 text-xs">
      <div className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium text-xeoo-muted">
          {label}
        </span>
        <span
          className={`block truncate font-mono text-xs ${
            isAvailable ? "text-xeoo-text font-medium" : "text-xeoo-muted"
          }`}
          title={displayVal}
        >
          {displayVal}
        </span>
      </div>

      {onCopy && isAvailable && (
        <button
          type="button"
          onClick={onCopy}
          className="mt-1 text-xeoo-muted hover:text-xeoo-primary transition-colors cursor-pointer shrink-0"
          title={`Copy ${label}`}
        >
          {copied ? (
            <Check size={13} className="text-xeoo-success" />
          ) : (
            <Copy size={13} />
          )}
        </button>
      )}
    </div>
  );
}
