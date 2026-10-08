import {
  AlertTriangle,
  Download,
  FileText,
  FolderArchive,
  LoaderCircle,
  RotateCcw,
  Upload,
  X,
  ArrowUpDown,
} from "lucide-react";
import { useState, useRef, type ChangeEvent, type DragEvent, type FormEvent } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showError, showSuccess } from "../../alert";
import {
  formatBytes,
  guessOutputFileName,
  mergeChunks,
  naturalSortChunks,
  type ChunkToMerge,
  type MergeResult,
} from "./fileMergerLogic";

type ProcessStatus = "idle" | "merging" | "completed" | "error";

export default function FileMerger() {
  const [chunks, setChunks] = useState<ChunkToMerge[]>([]);
  const [outputFileName, setOutputFileName] = useState("");
  const [status, setStatus] = useState<ProcessStatus>("idle");
  const [result, setResult] = useState<MergeResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const addChunks = (fileList: FileList | File[]) => {
    const list: ChunkToMerge[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      list.push({
        id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
        file: f,
        name: f.name,
        size: f.size,
      });
    }

    const updated = naturalSortChunks([...chunks, ...list]);
    setChunks(updated);

    if (updated.length > 0 && !outputFileName) {
      setOutputFileName(guessOutputFileName(updated[0].name));
    }

    setResult(null);
    setErrorMsg("");
    setStatus("idle");
  };

  const removeChunk = (id: string) => {
    setChunks((prev) => prev.filter((item) => item.id !== id));
  };

  const moveChunk = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === chunks.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const nextList = [...chunks];
    const temp = nextList[index];
    nextList[index] = nextList[targetIndex];
    nextList[targetIndex] = temp;
    setChunks(nextList);
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
      addChunks(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addChunks(e.target.files);
    }
    e.target.value = "";
  };

  const handleSortNatural = () => {
    setChunks((prev) => naturalSortChunks(prev));
  };

  const handleReset = () => {
    setChunks([]);
    setOutputFileName("");
    setResult(null);
    setErrorMsg("");
    setStatus("idle");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMerge = (e: FormEvent) => {
    e.preventDefault();
    if (chunks.length < 2) {
      setErrorMsg("Please select at least 2 file chunks to merge.");
      void showError("Chunks Required", "Please select at least 2 file chunks.");
      return;
    }

    setErrorMsg("");
    setStatus("merging");

    try {
      const res = mergeChunks(chunks, outputFileName);
      setResult(res);
      setStatus("completed");
      void showSuccess(
        "Merge Complete",
        `Successfully joined ${res.partsCount} chunks into "${res.outputFileName}" (${formatBytes(res.totalSize)}).`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Merging failed.";
      setErrorMsg(msg);
      setStatus("error");
      void showError("Merge Failed", msg);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.mergedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.outputFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalInputBytes = chunks.reduce((acc, c) => acc + c.size, 0);

  const statusMeta = () => {
    switch (status) {
      case "merging":
        return {
          label: "Merging Chunks...",
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
          label: chunks.length >= 2 ? `${chunks.length} Chunks Ready` : "Waiting for Chunks",
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
                  <FolderArchive size={15} strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold text-xeoo-text sm:text-sm">
                    FILE MERGER
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Combine split file chunks back into the original file client-side.
                  </p>
                </div>
              </div>

              <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-bold ${meta.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full bg-white ${status === "merging" ? "animate-pulse" : ""}`} />
                {meta.label}
              </span>
            </div>

            {/* FORM */}
            <div className="p-3 sm:p-4">
              <form onSubmit={handleMerge} noValidate className="space-y-3">
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
                    Select Chunks to Merge {chunks.length > 0 && `(${chunks.length} parts · ${formatBytes(totalInputBytes)})`}
                  </label>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all sm:p-5 ${
                      isDragging
                        ? "border-xeoo-primary bg-xeoo-primary-soft/20 scale-[0.99]"
                        : chunks.length > 0
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
                          Choose split chunks (.part01, .part02...) or drag & drop here
                        </p>
                        <p className="text-[11px] text-xeoo-muted">
                          Select multiple files in sequential order &bull; Merged client-side
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CHUNKS ORDER LIST */}
                {chunks.length > 0 && (
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft/30 p-2.5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-xeoo-muted uppercase tracking-wider px-1">
                      <span>Chunk Sequence ({chunks.length} parts)</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSortNatural}
                          className="inline-flex items-center gap-1 text-xeoo-primary hover:underline"
                        >
                          <ArrowUpDown size={11} />
                          <span>Sort by Name</span>
                        </button>
                        <span className="text-xeoo-border">&bull;</span>
                        <button
                          type="button"
                          onClick={() => setChunks([])}
                          className="text-red-500 hover:underline"
                        >
                          Remove All
                        </button>
                      </div>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                      {chunks.map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 py-1.5 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-[10px] font-bold text-xeoo-muted w-5 shrink-0 text-center">
                              #{idx + 1}
                            </span>
                            <FileText size={14} className="shrink-0 text-xeoo-muted" />
                            <span className="truncate font-medium text-xeoo-text">{item.name}</span>
                            <span className="font-mono text-[10px] text-xeoo-muted shrink-0">
                              ({formatBytes(item.size)})
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveChunk(idx, "up")}
                              disabled={idx === 0}
                              className="rounded px-1 text-[10px] text-xeoo-muted hover:bg-xeoo-surface-soft hover:text-xeoo-text disabled:opacity-30"
                              title="Move Up"
                            >
                              &uarr;
                            </button>
                            <button
                              type="button"
                              onClick={() => moveChunk(idx, "down")}
                              disabled={idx === chunks.length - 1}
                              className="rounded px-1 text-[10px] text-xeoo-muted hover:bg-xeoo-surface-soft hover:text-xeoo-text disabled:opacity-30"
                              title="Move Down"
                            >
                              &darr;
                            </button>
                            <button
                              type="button"
                              onClick={() => removeChunk(item.id)}
                              className="rounded p-1 text-xeoo-muted hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                              title="Remove"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* OUTPUT FILENAME */}
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Merged Output File Name
                  </label>
                  <input
                    type="text"
                    value={outputFileName}
                    onChange={(e) => setOutputFileName(e.target.value)}
                    placeholder="e.g. original_file.zip"
                    className="h-9 w-full rounded-md border border-xeoo-border bg-xeoo-surface px-3 text-[12px] text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
                  />
                </div>

                {/* ACTION BAR */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    {chunks.length > 0 && (
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={status === "merging"}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 text-[11px] font-bold text-xeoo-text shadow-xs transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-95 disabled:opacity-50"
                      >
                        <RotateCcw size={13} />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "merging" || chunks.length < 2}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-5 text-[11px] font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:px-6"
                  >
                    {status === "merging" ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        <span>Merging Chunks...</span>
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        <span>Merge Files</span>
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
                  <FolderArchive size={14} className="shrink-0 text-xeoo-muted" />
                  <div className="min-w-0">
                    <h2 className="truncate text-xs font-extrabold text-xeoo-text">
                      FILE MERGED SUCCESSFULLY
                    </h2>
                    <p className="truncate text-[12px] text-xeoo-muted">
                      {result.outputFileName} &bull; {result.partsCount} chunks joined
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
                      Merged File Name
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text">
                      {result.outputFileName}
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      Restored file
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Combined Size
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text">
                      {formatBytes(result.totalSize)}
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      Exact byte length
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Chunks Merged
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-xeoo-text">
                      {result.partsCount}
                    </div>
                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Consecutive parts
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Process Status
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      Completed
                    </div>
                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      100% in-browser
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
                    <span>Download {result.outputFileName}</span>
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

