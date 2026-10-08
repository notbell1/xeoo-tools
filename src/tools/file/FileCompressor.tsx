import {
  AlertTriangle,
  Download,
  FileArchive,
  FileText,
  LoaderCircle,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";
import { useState, useRef, type ChangeEvent, type DragEvent, type FormEvent } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showError, showSuccess } from "../../alert";
import {
  compressFiles,
  formatBytes,
  type CompressionLevel,
  type CompressionResult,
  type FileToCompress,
} from "./fileCompressorLogic";

type ProcessStatus = "idle" | "compressing" | "completed" | "error";

export default function FileCompressor() {
  const [selectedFiles, setSelectedFiles] = useState<FileToCompress[]>([]);
  const [archiveName, setArchiveName] = useState("compressed_archive.zip");
  const [level, setLevel] = useState<CompressionLevel>(6);
  const [status, setStatus] = useState<ProcessStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const addFiles = (files: FileList | File[]) => {
    const list: FileToCompress[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      list.push({
        id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
        file: f,
        name: f.name,
        size: f.size,
      });
    }

    setSelectedFiles((prev) => [...prev, ...list]);
    setResult(null);
    setErrorMsg("");
    setStatus("idle");
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((item) => item.id !== id));
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    e.target.value = "";
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setResult(null);
    setErrorMsg("");
    setStatus("idle");
    setProgress(0);
    setArchiveName("compressed_archive.zip");
    setLevel(6);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCompress = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setErrorMsg("Please add at least one file to compress.");
      void showError("No Files Selected", "Please select files to compress.");
      return;
    }

    setErrorMsg("");
    setStatus("compressing");
    setProgress(0);

    try {
      const res = await compressFiles(
        selectedFiles,
        {
          level,
          archiveName: archiveName.trim() || "compressed_archive.zip",
        },
        (pct) => setProgress(pct)
      );

      setResult(res);
      setStatus("completed");
      void showSuccess(
        "Compression Complete",
        `Created "${res.archiveName}" (${formatBytes(res.compressedSize)}) from ${res.fileCount} files.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Compression failed.";
      setErrorMsg(msg);
      setStatus("error");
      void showError("Compression Failed", msg);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.archiveBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.archiveName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalInputBytes = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  const statusMeta = () => {
    switch (status) {
      case "compressing":
        return {
          label: `Compressing (${progress}%)...`,
          badge: "border-orange-500 bg-orange-500 text-white dark:border-orange-400 dark:bg-orange-500 dark:text-white",
        };
      case "completed":
        return {
          label: "Completed",
          badge: "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-600 dark:text-white",
        };
      case "error":
        return {
          label: "Error",
          badge: "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-600 dark:text-white",
        };
      default:
        return {
          label: selectedFiles.length > 0 ? `${selectedFiles.length} File${selectedFiles.length > 1 ? "s" : ""} Ready` : "Ready",
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
                  <FileArchive size={15} strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold text-xeoo-text sm:text-sm">
                    FILE COMPRESSOR
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Compress and bundle multiple files into a ZIP archive locally in your browser.
                  </p>
                </div>
              </div>

              <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-bold ${meta.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full bg-white ${status === "compressing" ? "animate-pulse" : ""}`} />
                {meta.label}
              </span>
            </div>

            {/* FORM */}
            <div className="p-3 sm:p-4">
              <form onSubmit={handleCompress} noValidate className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* DROPZONE */}
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Files to Compress {selectedFiles.length > 0 && `(${selectedFiles.length} selected · ${formatBytes(totalInputBytes)})`}
                  </label>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all sm:p-5 ${
                      isDragging
                        ? "border-xeoo-primary bg-xeoo-primary-soft/20 scale-[0.99]"
                        : selectedFiles.length > 0
                        ? "border-xeoo-primary/40 bg-xeoo-primary-soft/10"
                        : "border-xeoo-border bg-xeoo-bg hover:border-xeoo-primary/60 hover:bg-xeoo-surface-soft/60"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1.5 text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-xeoo-surface-soft text-xeoo-muted group-hover:scale-105 transition-transform">
                        <Upload size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-xeoo-text">
                          Choose files or drag & drop here
                        </p>
                        <p className="text-[11px] text-xeoo-muted">
                          Supports multiple files &bull; Compressed client-side (no upload)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SELECTED FILES LIST */}
                {selectedFiles.length > 0 && (
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft/30 p-2.5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-xeoo-muted uppercase tracking-wider px-1">
                      <span>Selected Files ({selectedFiles.length})</span>
                      <button
                        type="button"
                        onClick={() => setSelectedFiles([])}
                        className="text-red-500 hover:underline"
                      >
                        Remove All
                      </button>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                      {selectedFiles.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 py-1.5 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText size={14} className="shrink-0 text-xeoo-muted" />
                            <span className="truncate font-medium text-xeoo-text">{item.name}</span>
                            <span className="font-mono text-[10px] text-xeoo-muted shrink-0">
                              ({formatBytes(item.size)})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(item.id)}
                            className="rounded p-1 text-xeoo-muted hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                            aria-label={`Remove ${item.name}`}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* COMPRESSION SETTINGS */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Output Archive Name
                    </label>
                    <input
                      type="text"
                      value={archiveName}
                      onChange={(e) => setArchiveName(e.target.value)}
                      placeholder="archive.zip"
                      className="h-9 w-full rounded-md border border-xeoo-border bg-xeoo-surface px-3 text-[12px] text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Compression Level
                    </label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(Number(e.target.value) as CompressionLevel)}
                      className="h-9 w-full rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[12px] text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
                    >
                      <option value={0}>Store (No compression, fastest)</option>
                      <option value={1}>Fast (Low compression)</option>
                      <option value={6}>Normal (Balanced, recommended)</option>
                      <option value={9}>Maximum (Best compression)</option>
                    </select>
                  </div>
                </div>

                {/* ACTION BAR */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    {selectedFiles.length > 0 && (
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={status === "compressing"}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 text-[11px] font-bold text-xeoo-text shadow-xs transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-95 disabled:opacity-50"
                      >
                        <RotateCcw size={13} />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "compressing" || selectedFiles.length === 0}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-5 text-[11px] font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:px-6"
                  >
                    {status === "compressing" ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        <span>Compressing ({progress}%)...</span>
                      </>
                    ) : (
                      <>
                        <FileArchive size={14} />
                        <span>Compress Files</span>
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
                  <FileArchive size={14} className="shrink-0 text-xeoo-muted" />
                  <div className="min-w-0">
                    <h2 className="truncate text-xs font-extrabold text-xeoo-text">
                      COMPRESSION RESULT
                    </h2>
                    <p className="truncate text-[12px] text-xeoo-muted">
                      {result.archiveName} &bull; {result.fileCount} files compressed
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
                      Original Size
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text">
                      {formatBytes(result.originalTotalSize)}
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      Combined input size
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Compressed Size
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text">
                      {formatBytes(result.compressedSize)}
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      ZIP file size
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Space Saved
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      {result.compressionRatio.toFixed(1)}%
                    </div>
                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Reduction percentage
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Files Included
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-xeoo-text">
                      {result.fileCount}
                    </div>
                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Total items in archive
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
                    <span>Download {result.archiveName}</span>
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
