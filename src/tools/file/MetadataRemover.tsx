import {
  AlertTriangle,
  Download,
  FileText,
  LoaderCircle,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { useState, useRef, type ChangeEvent, type DragEvent, type FormEvent } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showError, showSuccess } from "../../alert";
import {
  formatBytes,
  isFormatSupported,
  removeFileMetadata,
  type MetadataRemovalResult,
} from "./metadataRemoverLogic";

type ProcessStatus = "idle" | "sanitizing" | "completed" | "error";

export default function MetadataRemover() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessStatus>("idle");
  const [result, setResult] = useState<MetadataRemovalResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChosen = (file: File) => {
    if (!isFormatSupported(file)) {
      setErrorMsg("Selected file format is not supported. Please select a JPEG, PNG, WebP, or Text file.");
      void showError(
        "Unsupported Format",
        "Only JPEG, PNG, WebP, and Text-based files are supported for in-browser metadata removal."
      );
      setSelectedFile(null);
      setResult(null);
      return;
    }

    setSelectedFile(file);
    setResult(null);
    setErrorMsg("");
    setStatus("idle");
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChosen(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChosen(file);
    e.target.value = "";
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setErrorMsg("");
    setStatus("idle");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSanitize = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Please select a file to sanitize.");
      void showError("No File Selected", "Please select a file.");
      return;
    }

    setErrorMsg("");
    setStatus("sanitizing");

    try {
      const res = await removeFileMetadata(selectedFile);
      setResult(res);
      setStatus("completed");
      void showSuccess("Metadata Stripped", `Generated clean file "${res.cleanName}".`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Metadata removal failed.";
      setErrorMsg(msg);
      setStatus("error");
      void showError("Sanitization Error", msg);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.cleanBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.cleanName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const statusMeta = () => {
    switch (status) {
      case "sanitizing":
        return {
          label: "Stripping Metadata...",
          badge: "border-orange-500 bg-orange-500 text-white dark:border-orange-400 dark:bg-orange-500 dark:text-white",
        };
      case "completed":
        return {
          label: "Sanitized",
          badge: "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-600 dark:text-white",
        };
      case "error":
        return {
          label: "Error",
          badge: "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-600 dark:text-white",
        };
      default:
        return {
          label: selectedFile ? "Ready to Clean" : "Ready",
          badge: "border-slate-500 bg-slate-500 text-white dark:border-slate-400 dark:bg-slate-600 dark:text-white",
        };
    }
  };

  const meta = statusMeta();

  return (
    <div className="flex min-h-dvh flex-col bg-xeoo-bg text-xeoo-text">
      <Header />

      <main className="flex-1 px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto w-full max-w-6xl space-y-3">
          {/* ================================================================
              WORKSPACE CARD
          ================================================================ */}
          <section className="self-start overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
            {/* WORKSPACE HEADER */}
            <div className="flex items-center justify-between gap-3 border-b border-xeoo-border px-3 py-2.5 sm:px-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-xeoo-primary-soft text-xeoo-primary">
                  <Trash2 size={15} strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold text-xeoo-text sm:text-sm">
                    METADATA REMOVER
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Strip EXIF, location data, and embedded tags from images and text client-side.
                  </p>
                </div>
              </div>

              <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-bold ${meta.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full bg-white ${status === "sanitizing" ? "animate-pulse" : ""}`} />
                {meta.label}
              </span>
            </div>

            {/* FORM */}
            <div className="p-3 sm:p-4">
              <form onSubmit={handleSanitize} noValidate className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.txt,.csv,.json,.md,image/jpeg,image/png,image/webp,text/plain"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* DROPZONE */}
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Target File to Sanitize (JPEG, PNG, WebP, Text)
                  </label>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all sm:p-5 ${
                      isDragging
                        ? "border-xeoo-primary bg-xeoo-primary-soft/20 scale-[0.99]"
                        : selectedFile
                        ? "border-xeoo-primary/40 bg-xeoo-primary-soft/10"
                        : "border-xeoo-border bg-xeoo-bg hover:border-xeoo-primary/60 hover:bg-xeoo-surface-soft/60"
                    }`}
                  >
                    {selectedFile ? (
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-xeoo-primary-soft text-xeoo-primary">
                          <FileText size={20} />
                        </div>
                        <div className="min-w-0 max-w-md">
                          <p className="truncate text-xs font-bold text-xeoo-text">
                            {selectedFile.name}
                          </p>
                          <p className="font-mono text-[11px] text-xeoo-muted">
                            {formatBytes(selectedFile.size)} &bull; Click to change file
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
                            Choose a supported file or drag & drop here
                          </p>
                          <p className="text-[11px] text-xeoo-muted">
                            Supported: JPEG, PNG, WebP, TXT, CSV, JSON, MD &bull; Never uploaded
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SUPPORTED FORMATS NOTE */}
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft/40 p-3 text-[11px] text-xeoo-muted space-y-1">
                  <div className="font-bold text-xeoo-text uppercase tracking-wider text-[10px]">
                    Supported Formats & Mechanism
                  </div>
                  <div>
                    &bull; <strong className="text-xeoo-text">JPEG / PNG / WebP:</strong> Image pixel data is re-encoded onto a clean canvas, completely stripping all EXIF, GPS location tags, camera metadata, and thumbnail previews.
                  </div>
                  <div>
                    &bull; <strong className="text-xeoo-text">Text / Markdown / JSON / CSV:</strong> Removes UTF Byte Order Marks (BOM), trailing null characters, and control artifacts.
                  </div>
                  <div className="italic text-[10px]">
                    Your original file is left untouched. A new sanitized copy is produced.
                  </div>
                </div>

                {/* ACTION BAR */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={status === "sanitizing"}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 text-[11px] font-bold text-xeoo-text shadow-xs transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-95 disabled:opacity-50"
                      >
                        <RotateCcw size={13} />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "sanitizing" || !selectedFile}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-5 text-[11px] font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:px-6"
                  >
                    {status === "sanitizing" ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        <span>Stripping Metadata...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} />
                        <span>Remove Metadata</span>
                      </>
                    )}
                  </button>
                </div>

                {/* ERROR BANNER */}
                {errorMsg && (
                  <div className="flex items-start gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-2 text-[11px] font-semibold text-red-600 dark:text-red-400">
                    <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                    <span className="min-w-0 break-words">{errorMsg}</span>
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
              <div className="flex flex-col gap-2 border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <div className="flex min-w-0 items-center gap-1.5">
                  <Trash2 size={14} className="shrink-0 text-xeoo-muted" />
                  <div className="min-w-0">
                    <h2 className="truncate text-xs font-extrabold text-xeoo-text">
                      METADATA REMOVAL COMPLETE
                    </h2>
                    <p className="truncate text-[12px] text-xeoo-muted">
                      {result.cleanName} &bull; Ready to download
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
                {/* METRICS */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Original File
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text">
                      {result.originalName}
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      {formatBytes(result.originalSize)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Cleaned File Size
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text">
                      {formatBytes(result.cleanSize)}
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      Sanitized output
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      File Format
                    </div>
                    <div className="mt-1 font-mono text-xs font-bold text-xeoo-text">
                      {result.format}
                    </div>
                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Processed locally
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Sanitization Status
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      EXIF / Tags Stripped
                    </div>
                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Zero tracking tags
                    </div>
                  </div>
                </div>

                {/* DOWNLOAD ACTION */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-4 text-[11px] font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:scale-95"
                  >
                    <Download size={13} />
                    <span>Download {result.cleanName}</span>
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

