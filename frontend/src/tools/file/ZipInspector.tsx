import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  File,
  FileArchive,
  Folder,
  FolderArchive,
  Info,
  LoaderCircle,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Upload,
  X,
} from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showError, showSuccess, showWarning } from "../../alert";

import {
  extractZipEntryBlob,
  formatBytes,
  formatRatio,
  inspectZipFile,
  validateZipFile,
  MAX_ZIP_SIZE_BYTES,
  type ZipEntry,
  type ZipInspectionResult,
} from "./zipInspectorLogic";

type FilterType = "ALL" | "FILES" | "FOLDERS" | "SUSPICIOUS";
type InspectionStatus = "idle" | "inspecting" | "completed" | "error";

export default function ZipInspector() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inspectionStatus, setInspectionStatus] =
    useState<InspectionStatus>("idle");
  const [result, setResult] = useState<ZipInspectionResult | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<ZipEntry | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const fileInputId = useId();

  /*
   * Lock page scrolling while details modal is open.
   */
  useEffect(() => {
    if (!selectedEntry) return;

    const html = document.documentElement;
    const body = document.body;

    const previousHtmlOverflow = html.style.overflow;
    const previousHtmlOverscrollBehavior = html.style.overscrollBehavior;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscrollBehavior = body.style.overscrollBehavior;
    const previousBodyPaddingRight = body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - html.clientWidth;

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const preventBackgroundScroll = (event: Event) => {
      const target = event.target;
      if (target instanceof Node && modalRef.current?.contains(target)) {
        return;
      }
      event.preventDefault();
    };

    const preventEscapeClose = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
      }
    };

    document.addEventListener("wheel", preventBackgroundScroll, { passive: false });
    document.addEventListener("touchmove", preventBackgroundScroll, { passive: false });
    document.addEventListener("keydown", preventEscapeClose);

    return () => {
      document.removeEventListener("wheel", preventBackgroundScroll);
      document.removeEventListener("touchmove", preventBackgroundScroll);
      document.removeEventListener("keydown", preventEscapeClose);

      html.style.overflow = previousHtmlOverflow;
      html.style.overscrollBehavior = previousHtmlOverscrollBehavior;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscrollBehavior;
      body.style.paddingRight = previousBodyPaddingRight;
    };
  }, [selectedEntry]);

  const handleCopyText = async (text: string) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);

      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = window.setTimeout(() => {
        setCopiedText(null);
      }, 2000);
    } catch {
      void showError("Copy Failed", "Could not copy text to clipboard.");
    }
  };

  const handleDownloadEntry = async (entry: ZipEntry) => {
    if (entry.type === "folder") return;
    if (!result?.zipInstance) {
      void showError("Download Error", "Archive instance is not available.");
      return;
    }

    try {
      setDownloadingId(entry.id);
      const blob = await extractZipEntryBlob(result.zipInstance, entry.name);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = entry.baseName || "downloaded-file";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error("Failed to download file:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to extract file from archive.";
      void showError("Download Failed", msg);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleFileChosen = async (file: File) => {
    const validation = await validateZipFile(file);
    if (!validation.valid) {
      const msg = validation.error || "Invalid ZIP file.";
      setError(msg);
      setSelectedFile(null);
      setResult(null);
      await showError("Validation Error", msg);
      return;
    }

    setError("");
    setSelectedFile(file);
    setResult(null);
    setInspectionStatus("idle");
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void handleFileChosen(file);
    }
    // reset input value so re-selecting same file triggers change
    event.target.value = "";
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      void handleFileChosen(file);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError("");
    setInspectionStatus("idle");
    setActiveFilter("ALL");
    setSearchQuery("");
    setSelectedEntry(null);
    setDownloadingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInspect = async () => {
    if (!selectedFile) {
      const msg = "Please select a ZIP file to inspect.";
      setError(msg);
      await showError("No File Selected", msg);
      return;
    }

    setError("");
    setInspectionStatus("inspecting");
    setResult(null);
    setSelectedEntry(null);
    setActiveFilter("ALL");
    setSearchQuery("");

    try {
      const data = await inspectZipFile(selectedFile);
      setResult(data);
      setInspectionStatus("completed");

      if (data.security.hasWarnings) {
        await showWarning(
          "Inspection Finished with Warnings",
          `Archive analyzed: ${data.totalEntries} entries found. Some potential security considerations were flagged.`,
        );
      } else {
        await showSuccess(
          "Inspection Complete",
          `Successfully analyzed ${data.totalEntries} entries in "${data.name}". Structure is valid.`,
        );
      }
    } catch (err: unknown) {
      console.error("ZIP inspection error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Unable to inspect this ZIP archive.";

      setError(msg);
      setInspectionStatus("error");
      await showError("Inspection Failed", msg);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inspectionStatus !== "inspecting") {
      void handleInspect();
    }
  };

  const suspiciousEntriesCount = useMemo(() => {
    if (!result) return 0;
    return result.entries.filter((e) => e.isSuspicious).length;
  }, [result]);

  const filteredEntries = useMemo(() => {
    if (!result) return [];

    let list = result.entries;

    if (activeFilter === "FILES") {
      list = list.filter((e) => e.type === "file");
    } else if (activeFilter === "FOLDERS") {
      list = list.filter((e) => e.type === "folder");
    } else if (activeFilter === "SUSPICIOUS") {
      list = list.filter((e) => e.isSuspicious);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((e) => e.name.toLowerCase().includes(q));
    }

    return list;
  }, [result, activeFilter, searchQuery]);

  const statusMeta = useMemo(() => {
    switch (inspectionStatus) {
      case "inspecting":
        return {
          label: "Inspecting...",
          badge:
            "border-orange-500 bg-orange-500 text-white dark:border-orange-400 dark:bg-orange-500 dark:text-white",
        };

      case "completed":
        return {
          label: "Completed",
          badge:
            "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-600 dark:text-white",
        };

      case "error":
        return {
          label: "Error",
          badge:
            "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-600 dark:text-white",
        };

      default:
        return {
          label: selectedFile ? "Ready to Inspect" : "Ready",
          badge:
            "border-slate-500 bg-slate-500 text-white dark:border-slate-400 dark:bg-slate-600 dark:text-white",
        };
    }
  }, [inspectionStatus, selectedFile]);

  return (
    <div className="flex min-h-dvh flex-col bg-xeoo-bg text-xeoo-text">
      <Header />

      <main className="flex-1 px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto w-full max-w-6xl space-y-3">
          {/* ================================================================
              LOOKUP WORKSPACE
          ================================================================ */}
          <section className="self-start overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
            {/* HEADER */}
            <div className="flex items-center justify-between gap-3 border-b border-xeoo-border px-3 py-2.5 sm:px-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-xeoo-primary-soft text-xeoo-primary">
                  <FolderArchive size={15} strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold text-xeoo-text sm:text-sm">
                    ZIP INSPECTOR
                  </h1>

                  <p className="truncate text-[11px] text-xeoo-muted">
                    Safely inspect ZIP structure, metadata, and security parameters 100% in-browser.
                  </p>
                </div>
              </div>

              <span
                className={[
                  "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-bold",
                  statusMeta.badge,
                ].join(" ")}
              >
                <span
                  className={[
                    "h-1.5 w-1.5 rounded-full bg-white",
                    inspectionStatus === "inspecting" ? "animate-pulse" : "",
                  ].join(" ")}
                />
                {statusMeta.label}
              </span>
            </div>

            {/* FORM / FILE PICKER */}
            <div className="p-3 sm:p-4">
              <form onSubmit={handleSubmit} noValidate className="space-y-3">
                <input
                  ref={fileInputRef}
                  id={fileInputId}
                  type="file"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div>
                  <label
                    htmlFor={fileInputId}
                    className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted"
                  >
                    Target ZIP Archive (Max {formatBytes(MAX_ZIP_SIZE_BYTES)})
                  </label>

                  {/* DROPZONE */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={[
                      "group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all sm:p-5",
                      isDragging
                        ? "border-xeoo-primary bg-xeoo-primary-soft/20 scale-[0.99]"
                        : selectedFile
                          ? "border-xeoo-primary/40 bg-xeoo-primary-soft/10"
                          : "border-xeoo-border bg-xeoo-bg hover:border-xeoo-primary/60 hover:bg-xeoo-surface-soft/60",
                    ].join(" ")}
                  >
                    {selectedFile ? (
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-xeoo-primary-soft text-xeoo-primary">
                          <FileArchive size={20} />
                        </div>

                        <div className="min-w-0 max-w-md">
                          <p className="truncate text-xs font-bold text-xeoo-text">
                            {selectedFile.name}
                          </p>
                          <p className="font-mono text-[11px] text-xeoo-muted">
                            {formatBytes(selectedFile.size)} · Click to change file
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-xeoo-surface-soft text-xeoo-muted group-hover:scale-105 transition-transform">
                          <Upload size={18} />
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-xeoo-text">
                            Choose a ZIP file or drag & drop here
                          </p>
                          <p className="text-[11px] text-xeoo-muted">
                            Standard .zip format • Processed client-side only (no upload)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ACTION BAR */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={inspectionStatus === "inspecting"}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 text-[11px] font-bold text-xeoo-text shadow-xs transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-95 disabled:opacity-50"
                      >
                        <RotateCcw size={13} />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={inspectionStatus === "inspecting" || !selectedFile}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-5 text-[11px] font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:px-6"
                  >
                    {inspectionStatus === "inspecting" ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        <span>Inspecting ZIP...</span>
                      </>
                    ) : (
                      <>
                        <Search size={14} />
                        <span>Inspect ZIP</span>
                      </>
                    )}
                  </button>
                </div>

                {/* ERROR BANNER */}
                {error && (
                  <div className="flex items-start gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-2 text-[11px] font-semibold text-red-600 dark:text-red-400">
                    <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                    <span className="min-w-0 break-words">{error}</span>
                  </div>
                )}
              </form>
            </div>
          </section>

          {/* ================================================================
              RESULTS SECTION
          ================================================================ */}
          {result && (
            <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
              {/* RESULTS HEADER */}
              <div className="flex flex-col gap-2 border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <div className="flex min-w-0 items-center gap-1.5">
                  <FolderArchive size={14} className="shrink-0 text-xeoo-muted" />

                  <div className="min-w-0">
                    <h2 className="truncate text-xs font-extrabold text-xeoo-text">
                      ARCHIVE INSPECTION RESULTS
                    </h2>

                    <p className="truncate text-[12px] text-xeoo-muted">
                      {result.name} · {result.totalEntries} entries ({result.fileCount} files, {result.folderCount} folders)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-[11px] font-bold text-xeoo-text transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-95"
                  >
                    <RotateCcw size={11} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3 p-3 sm:p-3.5">
                {/* ============================================================
                    OVERVIEW SUMMARY CARDS
                ============================================================ */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {/* ARCHIVE SIZE */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Archive Size
                    </div>

                    <div
                      className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text"
                      title={formatBytes(result.size)}
                    >
                      {formatBytes(result.size)}
                    </div>

                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      Physical ZIP file
                    </div>
                  </div>

                  {/* TOTAL ENTRIES */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Total Entries
                    </div>

                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-sm font-extrabold text-xeoo-text">
                        {result.totalEntries}
                      </span>
                      <span className="text-[10px] text-xeoo-muted">
                        ({result.fileCount} files, {result.folderCount} dirs)
                      </span>
                    </div>

                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Archive structure count
                    </div>
                  </div>

                  {/* UNCOMPRESSED SIZE */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Uncompressed Size
                    </div>

                    <div
                      className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text"
                      title={formatBytes(result.totalUncompressedSize)}
                    >
                      {formatBytes(result.totalUncompressedSize)}
                    </div>

                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      Compressed: {formatBytes(result.totalCompressedSize)}
                    </div>
                  </div>

                  {/* COMPRESSION RATIO */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Space Reduction
                    </div>

                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatRatio(result.overallCompressionRatio)}
                      </span>
                      <span className="text-[10px] text-xeoo-muted">
                        saved
                      </span>
                    </div>

                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Overall compression ratio
                    </div>
                  </div>
                </div>

                {/* ARCHIVE COMMENT (IF ANY) */}
                {result.comment && (
                  <section className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft/40 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Archive Comment
                    </span>
                    <pre className="mt-1 whitespace-pre-wrap break-all font-mono text-xs text-xeoo-text">
                      {result.comment}
                    </pre>
                  </section>
                )}

                {/* ============================================================
                    ENTRIES TABLE & FILTERS
                ============================================================ */}
                <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
                  {/* TOOLBAR */}
                  <div className="flex flex-col gap-2 border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-3.5">
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal size={13} className="text-xeoo-muted" />

                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                          Archive Entries
                        </div>

                        <div className="mt-0.5 text-xs font-extrabold text-xeoo-text">
                          {filteredEntries.length} Results
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* SEARCH FILTER */}
                      {result.totalEntries > 4 && (
                        <div className="relative">
                          <Search
                            size={12}
                            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xeoo-muted"
                          />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter entries..."
                            className="h-8 w-36 rounded-md border border-xeoo-border bg-xeoo-surface pl-7 pr-2.5 text-[11px] text-xeoo-text outline-none placeholder:text-xeoo-muted focus:border-xeoo-primary sm:w-44"
                          />
                        </div>
                      )}

                      {/* FILTER BUTTONS */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveFilter("ALL");
                          setSearchQuery("");
                        }}
                        className={[
                          "inline-flex h-8 items-center justify-center rounded-md border px-2.5 text-[11px] font-bold transition-colors active:scale-[0.98]",
                          activeFilter === "ALL" && !searchQuery
                            ? "border-xeoo-text bg-xeoo-text text-xeoo-surface shadow-xs"
                            : "border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft hover:text-xeoo-text",
                        ].join(" ")}
                      >
                        All ({result.totalEntries})
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveFilter("FILES")}
                        className={[
                          "inline-flex h-8 items-center justify-center rounded-md border px-2.5 text-[11px] font-bold transition-colors active:scale-[0.98]",
                          activeFilter === "FILES"
                            ? "border-xeoo-text bg-xeoo-text text-xeoo-surface shadow-xs"
                            : "border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft hover:text-xeoo-text",
                        ].join(" ")}
                      >
                        Files ({result.fileCount})
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveFilter("FOLDERS")}
                        className={[
                          "inline-flex h-8 items-center justify-center rounded-md border px-2.5 text-[11px] font-bold transition-colors active:scale-[0.98]",
                          activeFilter === "FOLDERS"
                            ? "border-xeoo-text bg-xeoo-text text-xeoo-surface shadow-xs"
                            : "border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft hover:text-xeoo-text",
                        ].join(" ")}
                      >
                        Folders ({result.folderCount})
                      </button>

                      {suspiciousEntriesCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveFilter("SUSPICIOUS")}
                          className={[
                            "inline-flex h-8 items-center justify-center rounded-md border px-2.5 text-[11px] font-bold transition-colors active:scale-[0.98]",
                            activeFilter === "SUSPICIOUS"
                              ? "border-amber-500 bg-amber-500 text-white shadow-xs"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20",
                          ].join(" ")}
                        >
                          Suspicious ({suspiciousEntriesCount})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* DESKTOP TABLE */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[700px] border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-xeoo-surface-soft text-[11px] font-bold text-xeoo-text">
                          <th className="w-14 border-b border-r border-xeoo-border px-3.5 py-2.5 text-center">
                            #
                          </th>

                          <th className="w-20 border-b border-r border-xeoo-border px-3.5 py-2.5 text-center">
                            TYPE
                          </th>

                          <th className="border-b border-r border-xeoo-border px-3.5 py-2.5">
                            NAME / PATH
                          </th>

                          <th className="w-24 border-b border-r border-xeoo-border px-3.5 py-2.5 text-right">
                            ORIGINAL
                          </th>

                          <th className="w-24 border-b border-r border-xeoo-border px-3.5 py-2.5 text-right">
                            COMPRESSED
                          </th>

                          <th className="w-20 border-b border-r border-xeoo-border px-3.5 py-2.5 text-center">
                            RATIO
                          </th>

                          <th className="w-24 border-b border-r border-xeoo-border px-3.5 py-2.5 text-center">
                            STATUS
                          </th>

                          <th className="w-44 border-b border-xeoo-border px-3.5 py-2.5 text-center">
                            ACTIONS
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredEntries.length === 0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="border-b border-xeoo-border px-3.5 py-8 text-center text-[11px] text-xeoo-muted"
                            >
                              No archive entries match your filter criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredEntries.map((entry, index) => {
                            const isFolder = entry.type === "folder";
                            const zebraClass =
                              index % 2 === 0
                                ? "bg-xeoo-surface"
                                : "bg-xeoo-surface-soft/35";

                            return (
                              <tr
                                key={`${entry.name}-${index}`}
                                className={[
                                  zebraClass,
                                  "transition-colors hover:bg-xeoo-primary-soft/35 dark:hover:bg-xeoo-primary-soft/10",
                                ].join(" ")}
                              >
                                {/* ROW NUMBER */}
                                <td className="border-b border-r border-xeoo-border px-3.5 py-2.5 text-center align-middle font-mono text-[11px] text-xeoo-muted">
                                  {index + 1}
                                </td>

                                {/* TYPE */}
                                <td className="border-b border-r border-xeoo-border px-3.5 py-2.5 text-center align-middle">
                                  <span
                                    className={[
                                      "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold",
                                      isFolder
                                        ? "border-xeoo-border bg-xeoo-surface-soft text-xeoo-muted"
                                        : "border-xeoo-primary/20 bg-xeoo-primary-soft text-xeoo-primary",
                                    ].join(" ")}
                                  >
                                    {isFolder ? (
                                      <>
                                        <Folder size={10} />
                                        <span>DIR</span>
                                      </>
                                    ) : (
                                      <>
                                        <File size={10} />
                                        <span>FILE</span>
                                      </>
                                    )}
                                  </span>
                                </td>

                                {/* NAME / PATH */}
                                <td className="border-b border-r border-xeoo-border px-3.5 py-2.5 align-middle">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="max-w-[340px] truncate font-mono text-[11px] font-semibold text-xeoo-text"
                                      title={entry.name}
                                    >
                                      {entry.name}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() => void handleCopyText(entry.name)}
                                      className="inline-flex items-center justify-center rounded p-1 text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                                      title="Copy path"
                                      aria-label={`Copy path ${entry.name}`}
                                    >
                                      {copiedText === entry.name ? (
                                        <Check
                                          size={11}
                                          className="text-green-600 dark:text-green-400"
                                        />
                                      ) : (
                                        <Copy size={11} />
                                      )}
                                    </button>
                                  </div>
                                </td>

                                {/* ORIGINAL SIZE */}
                                <td className="border-b border-r border-xeoo-border px-3.5 py-2.5 text-right align-middle font-mono text-[11px] text-xeoo-text">
                                  {isFolder ? "—" : formatBytes(entry.uncompressedSize)}
                                </td>

                                {/* COMPRESSED SIZE */}
                                <td className="border-b border-r border-xeoo-border px-3.5 py-2.5 text-right align-middle font-mono text-[11px] text-xeoo-muted">
                                  {isFolder ? "—" : formatBytes(entry.compressedSize)}
                                </td>

                                {/* RATIO */}
                                <td className="border-b border-r border-xeoo-border px-3.5 py-2.5 text-center align-middle font-mono text-[11px]">
                                  {isFolder ? "—" : formatRatio(entry.compressionRatio)}
                                </td>

                                {/* STATUS */}
                                <td className="border-b border-r border-xeoo-border px-3.5 py-2.5 text-center align-middle">
                                  {entry.isSuspicious ? (
                                    <span
                                      className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400"
                                      title={entry.suspiciousReasons.join("; ")}
                                    >
                                      <AlertTriangle size={10} />
                                      <span>Flagged</span>
                                    </span>
                                  ) : (
                                    <span className="inline-block rounded-md border border-xeoo-border bg-xeoo-surface-soft px-1.5 py-0.5 text-[9px] font-bold text-xeoo-muted">
                                      Normal
                                    </span>
                                  )}
                                </td>

                                {/* ACTIONS */}
                                <td className="whitespace-nowrap border-b border-xeoo-border px-3.5 py-2.5 text-center align-middle">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {!isFolder && (
                                      <button
                                        type="button"
                                        disabled={downloadingId === entry.id}
                                        onClick={() => void handleDownloadEntry(entry)}
                                        className="inline-flex items-center gap-1 rounded-md border border-xeoo-primary/30 bg-xeoo-primary/10 px-2 py-1 text-[10px] font-bold text-xeoo-primary transition hover:bg-xeoo-primary hover:text-white disabled:opacity-50 active:scale-95"
                                        title={`Download ${entry.baseName}`}
                                      >
                                        {downloadingId === entry.id ? (
                                          <LoaderCircle size={11} className="animate-spin" />
                                        ) : (
                                          <Download size={11} />
                                        )}
                                        <span>Download</span>
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setSelectedEntry(entry)}
                                      className="inline-flex items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2 py-1 text-[10px] font-bold text-xeoo-text transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-95"
                                    >
                                      Details
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE VIEW */}
                  <div className="divide-y divide-xeoo-border md:hidden">
                    {filteredEntries.length === 0 ? (
                      <div className="px-3.5 py-8 text-center text-[11px] text-xeoo-muted">
                        No archive entries match your filter criteria.
                      </div>
                    ) : (
                      filteredEntries.map((entry, index) => {
                        const isFolder = entry.type === "folder";

                        return (
                          <div
                            key={`${entry.name}-${index}`}
                            className="space-y-2 p-3 transition-colors hover:bg-xeoo-surface-soft/30"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="rounded-md border border-xeoo-border bg-xeoo-surface-soft px-1.5 py-0.5 font-mono text-[9px] font-bold text-xeoo-muted">
                                  #{index + 1}
                                </span>

                                <span
                                  className={[
                                    "rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-bold",
                                    isFolder
                                      ? "border-xeoo-border bg-xeoo-surface-soft text-xeoo-muted"
                                      : "border-xeoo-primary/20 bg-xeoo-primary-soft text-xeoo-primary",
                                  ].join(" ")}
                                >
                                  {entry.type.toUpperCase()}
                                </span>

                                <span
                                  className="truncate font-mono text-[11px] font-bold text-xeoo-text"
                                  title={entry.name}
                                >
                                  {entry.name}
                                </span>
                              </div>

                              {entry.isSuspicious && (
                                <span className="shrink-0 rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                                  Flagged
                                </span>
                              )}
                            </div>

                            {!isFolder && (
                              <div className="grid grid-cols-3 gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 p-2 text-center text-[10px]">
                                <div>
                                  <span className="text-xeoo-muted">Size</span>
                                  <p className="font-mono font-bold text-xeoo-text">
                                    {formatBytes(entry.uncompressedSize)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xeoo-muted">Compressed</span>
                                  <p className="font-mono font-bold text-xeoo-muted">
                                    {formatBytes(entry.compressedSize)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xeoo-muted">Ratio</span>
                                  <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatRatio(entry.compressionRatio)}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1">
                              <button
                                type="button"
                                onClick={() => void handleCopyText(entry.name)}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-xeoo-muted hover:text-xeoo-text"
                              >
                                {copiedText === entry.name ? (
                                  <>
                                    <Check size={11} className="text-green-500" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={11} />
                                    <span>Copy Path</span>
                                  </>
                                )}
                              </button>

                              <div className="flex items-center gap-1.5">
                                {!isFolder && (
                                  <button
                                    type="button"
                                    disabled={downloadingId === entry.id}
                                    onClick={() => void handleDownloadEntry(entry)}
                                    className="inline-flex items-center gap-1 rounded-md border border-xeoo-primary/30 bg-xeoo-primary/10 px-2 py-1 text-[10px] font-bold text-xeoo-primary transition hover:bg-xeoo-primary hover:text-white disabled:opacity-50 active:scale-95"
                                  >
                                    {downloadingId === entry.id ? (
                                      <LoaderCircle size={11} className="animate-spin" />
                                    ) : (
                                      <Download size={11} />
                                    )}
                                    <span>Download</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setSelectedEntry(entry)}
                                  className="inline-flex items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-[10px] font-bold text-xeoo-text transition hover:bg-xeoo-surface-soft active:scale-95"
                                >
                                  Details
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>

                {/* ============================================================
                    DISCLAIMER
                ============================================================ */}
                <div className="flex items-start gap-2.5 rounded-xl border border-xeoo-border bg-xeoo-surface-soft/40 p-3 text-[11px] text-xeoo-muted">
                  <Info size={14} className="mt-0.5 shrink-0 text-xeoo-muted" />
                  <p className="leading-relaxed">
                    ZIP Inspector analyzes archive structure and metadata client-side directly
                    in your browser. Files can be extracted and downloaded individually on-demand
                    without unpacking the entire archive to disk or executing scripts.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* ====================================================================
          DETAILS MODAL
      ==================================================================== */}
      {selectedEntry && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="zip-entry-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs sm:p-4"
        >
          <div
            ref={modalRef}
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-xeoo-border bg-xeoo-surface shadow-2xl"
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-xeoo-border px-4 py-3">
              <div className="flex items-center gap-2">
                <FolderArchive size={16} className="text-xeoo-primary" />
                <h3
                  id="zip-entry-modal-title"
                  className="text-xs font-bold uppercase tracking-wider text-xeoo-text sm:text-sm"
                >
                  Archive Entry Details
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                title="Close modal"
                aria-label="Close details modal"
              >
                <X size={14} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="space-y-3.5 overflow-y-auto p-4 text-xs">
              {/* ENTRY PATH */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Full Path Inside Archive
                  </span>

                  <button
                    type="button"
                    onClick={() => void handleCopyText(selectedEntry.name)}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-xeoo-muted hover:text-xeoo-text"
                  >
                    {copiedText === selectedEntry.name ? (
                      <>
                        <Check size={11} className="text-green-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-1 break-all font-mono text-xs font-bold text-xeoo-text">
                  {selectedEntry.name}
                </div>
              </div>

              {/* SECURITY FLAGS (IF ANY) */}
              {selectedEntry.isSuspicious && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={13} className="shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Flagged Considerations
                    </span>
                  </div>

                  <ul className="mt-2 list-disc list-inside space-y-1 text-[11px] text-amber-600 dark:text-amber-400">
                    {selectedEntry.suspiciousReasons.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* TYPE & METHOD */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Entry Type
                  </span>
                  <div className="mt-1 font-mono text-xs font-bold text-xeoo-text capitalize">
                    {selectedEntry.type}
                  </div>
                </div>

                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Method
                  </span>
                  <div className="mt-1 font-mono text-xs font-bold text-xeoo-text">
                    {selectedEntry.compressionMethod}
                  </div>
                </div>
              </div>

              {/* SIZES */}
              {selectedEntry.type === "file" && (
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Original
                    </span>
                    <div className="mt-1 font-mono text-xs font-bold text-xeoo-text">
                      {formatBytes(selectedEntry.uncompressedSize)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Compressed
                    </span>
                    <div className="mt-1 font-mono text-xs font-bold text-xeoo-text">
                      {formatBytes(selectedEntry.compressedSize)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Ratio
                    </span>
                    <div className="mt-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {formatRatio(selectedEntry.compressionRatio)}
                    </div>
                  </div>
                </div>
              )}

              {/* MODIFICATION DATE */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                  Modified Timestamp
                </span>
                <div className="mt-1 font-mono text-xs font-bold text-xeoo-text">
                  {selectedEntry.modifiedAt
                    ? new Date(selectedEntry.modifiedAt).toLocaleString()
                    : "Unavailable"}
                </div>
              </div>

              {/* COMMENT */}
              {selectedEntry.comment && (
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Entry Comment
                  </span>
                  <div className="mt-1 break-all font-mono text-xs text-xeoo-text">
                    {selectedEntry.comment}
                  </div>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-between border-t border-xeoo-border bg-xeoo-surface-soft/40 px-4 py-3">
              {selectedEntry.type === "file" ? (
                <button
                  type="button"
                  disabled={downloadingId === selectedEntry.id}
                  onClick={() => void handleDownloadEntry(selectedEntry)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-xeoo-primary/30 bg-xeoo-primary px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:opacity-90 disabled:opacity-50 active:scale-95"
                >
                  {downloadingId === selectedEntry.id ? (
                    <LoaderCircle size={13} className="animate-spin" />
                  ) : (
                    <Download size={13} />
                  )}
                  <span>Download File</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="inline-flex items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface px-4 py-1.5 text-xs font-semibold text-xeoo-text transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

