import {
  AlertTriangle,
  Download,
  FileArchive,
  FileText,
  LoaderCircle,
  RotateCcw,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import { useState, useRef, useMemo, type ChangeEvent, type DragEvent, type FormEvent } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showError, showSuccess } from "../../alert";
import {
  calculatePartsCount,
  createZipOfChunks,
  formatBytes,
  splitFile,
  type FileChunkItem,
  type SplitResult,
} from "./fileSplitterLogic";

type ProcessStatus = "idle" | "splitting" | "zipping" | "completed" | "error";

const PRESET_CHUNK_SIZES = [
  { label: "1 MB", bytes: 1 * 1024 * 1024 },
  { label: "5 MB", bytes: 5 * 1024 * 1024 },
  { label: "10 MB", bytes: 10 * 1024 * 1024 },
  { label: "50 MB", bytes: 50 * 1024 * 1024 },
  { label: "100 MB", bytes: 100 * 1024 * 1024 },
];

export default function FileSplitter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chunkSizeBytes, setChunkSizeBytes] = useState<number>(5 * 1024 * 1024);
  const [customMb, setCustomMb] = useState<string>("5");
  const [isCustom, setIsCustom] = useState(false);

  const [status, setStatus] = useState<ProcessStatus>("idle");
  const [result, setResult] = useState<SplitResult | null>(null);
  const [zipProgress, setZipProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChosen = (file: File) => {
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

  const handlePresetSelect = (bytes: number) => {
    setIsCustom(false);
    setChunkSizeBytes(bytes);
  };

  const handleCustomMbChange = (val: string) => {
    setCustomMb(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setChunkSizeBytes(Math.round(num * 1024 * 1024));
    }
  };

  const estimatedParts = useMemo(() => {
    if (!selectedFile) return 0;
    return calculatePartsCount(selectedFile.size, chunkSizeBytes);
  }, [selectedFile, chunkSizeBytes]);

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setErrorMsg("");
    setStatus("idle");
    setChunkSizeBytes(5 * 1024 * 1024);
    setCustomMb("5");
    setIsCustom(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSplit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Please select a file to split.");
      void showError("No File Selected", "Please select a file to split.");
      return;
    }
    if (chunkSizeBytes <= 0) {
      setErrorMsg("Chunk size must be greater than zero.");
      void showError("Invalid Chunk Size", "Chunk size must be positive.");
      return;
    }

    setErrorMsg("");
    setStatus("splitting");

    try {
      const res = splitFile(selectedFile, chunkSizeBytes);
      setResult(res);
      setStatus("completed");
      void showSuccess("File Split Complete", `Created ${res.totalParts} parts from "${res.originalName}".`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Splitting failed.";
      setErrorMsg(msg);
      setStatus("error");
      void showError("Split Failed", msg);
    }
  };

  const handleDownloadPart = (part: FileChunkItem) => {
    const url = URL.createObjectURL(part.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = part.partName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllZip = async () => {
    if (!result) return;
    setStatus("zipping");
    setZipProgress(0);

    try {
      const zipBlob = await createZipOfChunks(result, (pct) => setZipProgress(pct));
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.originalName}.parts.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus("completed");
      void showSuccess("Download Started", "All parts packaged and downloaded.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to package parts.";
      setStatus("completed");
      void showError("Download Error", msg);
    }
  };

  const statusMeta = () => {
    switch (status) {
      case "splitting":
        return {
          label: "Splitting File...",
          badge: "border-orange-500 bg-orange-500 text-white dark:border-orange-400 dark:bg-orange-500 dark:text-white",
        };
      case "zipping":
        return {
          label: `Zipping Parts (${zipProgress}%)...`,
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
          label: selectedFile ? "Ready to Split" : "Ready",
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
                  <SlidersHorizontal size={15} strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold text-xeoo-text sm:text-sm">
                    FILE SPLITTER
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Split large files into smaller parts client-side with zero data upload.
                  </p>
                </div>
              </div>

              <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-bold ${meta.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full bg-white ${status === "splitting" || status === "zipping" ? "animate-pulse" : ""}`} />
                {meta.label}
              </span>
            </div>

            {/* FORM */}
            <div className="p-3 sm:p-4">
              <form onSubmit={handleSplit} noValidate className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* DROPZONE */}
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Target File to Split
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
                            Choose a file or drag & drop here
                          </p>
                          <p className="text-[11px] text-xeoo-muted">
                            Fast browser slicing via Blob API &bull; No file size uploaded
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CHUNK SIZE SELECTOR */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Chunk Size
                  </label>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {PRESET_CHUNK_SIZES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePresetSelect(preset.bytes)}
                        className={`inline-flex h-8 items-center justify-center rounded-md border px-3 text-[11px] font-bold transition-colors active:scale-[0.98] ${
                          !isCustom && chunkSizeBytes === preset.bytes
                            ? "border-xeoo-text bg-xeoo-text text-xeoo-surface shadow-xs"
                            : "border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setIsCustom(true)}
                      className={`inline-flex h-8 items-center justify-center rounded-md border px-3 text-[11px] font-bold transition-colors active:scale-[0.98] ${
                        isCustom
                          ? "border-xeoo-text bg-xeoo-text text-xeoo-surface shadow-xs"
                          : "border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                      }`}
                    >
                      Custom MB
                    </button>

                    {isCustom && (
                      <div className="flex items-center gap-1 ml-1">
                        <input
                          type="number"
                          min="0.1"
                          step="0.5"
                          value={customMb}
                          onChange={(e) => handleCustomMbChange(e.target.value)}
                          placeholder="e.g. 25"
                          className="h-8 w-24 rounded-md border border-xeoo-border bg-xeoo-surface px-2 text-[11px] text-xeoo-text outline-none focus:border-xeoo-primary"
                        />
                        <span className="text-[11px] font-bold text-xeoo-muted">MB</span>
                      </div>
                    )}
                  </div>

                  {selectedFile && (
                    <div className="mt-2 text-[11px] text-xeoo-muted">
                      Will create approximately <span className="font-bold text-xeoo-text">{estimatedParts} part{estimatedParts > 1 ? "s" : ""}</span> of {formatBytes(chunkSizeBytes)} each.
                    </div>
                  )}
                </div>

                {/* ACTION BAR */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={status === "splitting" || status === "zipping"}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 text-[11px] font-bold text-xeoo-text shadow-xs transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-95 disabled:opacity-50"
                      >
                        <RotateCcw size={13} />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "splitting" || status === "zipping" || !selectedFile}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-5 text-[11px] font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:px-6"
                  >
                    {status === "splitting" ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        <span>Splitting File...</span>
                      </>
                    ) : (
                      <>
                        <SlidersHorizontal size={14} />
                        <span>Split File</span>
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
              RESULTS SECTION (PARTS LIST)
          ================================================================ */}
          {result && (
            <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
              <div className="flex flex-col gap-2 border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <div className="flex min-w-0 items-center gap-1.5">
                  <SlidersHorizontal size={14} className="shrink-0 text-xeoo-muted" />
                  <div className="min-w-0">
                    <h2 className="truncate text-xs font-extrabold text-xeoo-text">
                      FILE SPLIT COMPLETE
                    </h2>
                    <p className="truncate text-[12px] text-xeoo-muted">
                      {result.originalName} &bull; {result.totalParts} parts generated
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadAllZip}
                    disabled={status === "zipping"}
                    className="inline-flex items-center gap-1 rounded-md bg-xeoo-primary px-3 py-1 text-[11px] font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:scale-95 disabled:opacity-50"
                  >
                    {status === "zipping" ? (
                      <>
                        <LoaderCircle size={11} className="animate-spin" />
                        <span>Zipping {zipProgress}%...</span>
                      </>
                    ) : (
                      <>
                        <FileArchive size={11} />
                        <span>Download All as ZIP</span>
                      </>
                    )}
                  </button>

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
                      Original File Size
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text">
                      {formatBytes(result.originalSize)}
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      Single source file
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Configured Chunk Size
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text">
                      {formatBytes(result.chunkSize)}
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      Max part boundary
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Total Parts Created
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-xeoo-text">
                      {result.totalParts}
                    </div>
                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Sequential chunks
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Chunk Naming
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text">
                      .part01 .. part{result.totalParts}
                    </div>
                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Mergeable format
                    </div>
                  </div>
                </div>

                {/* PARTS TABLE */}
                <div className="overflow-x-auto rounded-lg border border-xeoo-border">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-xeoo-surface-soft text-[11px] font-bold text-xeoo-text">
                        <th className="w-14 border-b border-r border-xeoo-border px-3 py-2 text-center">PART #</th>
                        <th className="border-b border-r border-xeoo-border px-3 py-2">PART FILENAME</th>
                        <th className="w-28 border-b border-r border-xeoo-border px-3 py-2 text-right">SIZE</th>
                        <th className="w-24 border-b border-xeoo-border px-3 py-2 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.chunks.map((chunk) => (
                        <tr
                          key={chunk.partName}
                          className="border-b border-xeoo-border/60 hover:bg-xeoo-surface-soft/40 transition-colors"
                        >
                          <td className="border-r border-xeoo-border/60 px-3 py-2 text-center text-xeoo-muted font-mono text-[11px]">
                            {chunk.partIndex}
                          </td>
                          <td className="border-r border-xeoo-border/60 px-3 py-2 font-mono text-xs text-xeoo-text break-all">
                            {chunk.partName}
                          </td>
                          <td className="border-r border-xeoo-border/60 px-3 py-2 text-right font-mono text-[11px] text-xeoo-muted">
                            {formatBytes(chunk.size)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDownloadPart(chunk)}
                              className="inline-flex items-center gap-1 rounded bg-xeoo-surface border border-xeoo-border px-2 py-1 text-[10px] font-semibold text-xeoo-text hover:bg-xeoo-surface-soft transition active:scale-95"
                            >
                              <Download size={11} />
                              <span>Save</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

