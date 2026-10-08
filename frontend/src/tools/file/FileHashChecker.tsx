import {
  AlertTriangle,
  Check,
  Copy,
  FileText,
  Hash,
  LoaderCircle,
  RotateCcw,
  Search,
  Upload,
} from "lucide-react";
import { useState, useRef, type ChangeEvent, type DragEvent, type FormEvent } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showError, showSuccess } from "../../alert";
import {
  calculateAllFileHashes,
  formatBytes,
  type FileHashSummary,
} from "./fileHashCheckerLogic";

type ProcessStatus = "idle" | "calculating" | "completed" | "error";

export default function FileHashChecker() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uppercase, setUppercase] = useState(false);
  const [status, setStatus] = useState<ProcessStatus>("idle");
  const [summary, setSummary] = useState<FileHashSummary | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChosen = (file: File) => {
    setSelectedFile(file);
    setSummary(null);
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
    setSummary(null);
    setErrorMsg("");
    setStatus("idle");
    setCopiedKey(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCalculate = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Please select a file to compute checksums.");
      void showError("No File Selected", "Please select a file to calculate hashes.");
      return;
    }

    setErrorMsg("");
    setStatus("calculating");

    try {
      const res = await calculateAllFileHashes(selectedFile, uppercase);
      setSummary(res);
      setStatus("completed");
      void showSuccess("Hashes Computed", `Generated checksums for "${res.fileName}".`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Hash calculation failed.";
      setErrorMsg(msg);
      setStatus("error");
      void showError("Computation Error", msg);
    }
  };

  const handleCopy = async (hash: string, algo: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedKey(algo);
      void showSuccess("Copied", `${algo} checksum copied to clipboard.`);
      window.setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      setCopiedKey(null);
    }
  };

  const statusMeta = () => {
    switch (status) {
      case "calculating":
        return {
          label: "Computing Hashes...",
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
          label: selectedFile ? "Ready to Hash" : "Ready",
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
                  <Hash size={15} strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold text-xeoo-text sm:text-sm">
                    FILE HASH CHECKER
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Calculate SHA-256, SHA-512, SHA-384, SHA-1, and MD5 file checksums client-side.
                  </p>
                </div>
              </div>

              <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-bold ${meta.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full bg-white ${status === "calculating" ? "animate-pulse" : ""}`} />
                {meta.label}
              </span>
            </div>

            {/* FORM */}
            <div className="p-3 sm:p-4">
              <form onSubmit={handleCalculate} noValidate className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* DROPZONE */}
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Target File to Hash
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
                            Supports any file format &bull; Processed 100% locally in browser (no upload)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* OPTIONS */}
                <div className="flex items-center gap-2 pt-1">
                  <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-xeoo-muted hover:text-xeoo-text">
                    <input
                      type="checkbox"
                      checked={uppercase}
                      onChange={(e) => setUppercase(e.target.checked)}
                      className="rounded border-xeoo-border text-xeoo-primary focus:ring-xeoo-primary"
                    />
                    <span>Uppercase Hex Output</span>
                  </label>
                </div>

                {/* ACTION BAR */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={status === "calculating"}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 text-[11px] font-bold text-xeoo-text shadow-xs transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-95 disabled:opacity-50"
                      >
                        <RotateCcw size={13} />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "calculating" || !selectedFile}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-5 text-[11px] font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:px-6"
                  >
                    {status === "calculating" ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        <span>Calculating Hashes...</span>
                      </>
                    ) : (
                      <>
                        <Search size={14} />
                        <span>Calculate Hashes</span>
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
              RESULTS SECTION (HASHES TABLE)
          ================================================================ */}
          {summary && (
            <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
              <div className="flex flex-col gap-2 border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <div className="flex min-w-0 items-center gap-1.5">
                  <Hash size={14} className="shrink-0 text-xeoo-muted" />
                  <div className="min-w-0">
                    <h2 className="truncate text-xs font-extrabold text-xeoo-text">
                      COMPUTED CHECKSUMS
                    </h2>
                    <p className="truncate text-[12px] text-xeoo-muted">
                      {summary.fileName} &bull; {summary.hashes.length} algorithms calculated
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
                      Target File
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text">
                      {summary.fileName}
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      Source filename
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      File Size
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text">
                      {formatBytes(summary.fileSize)}
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      {summary.fileSize.toLocaleString()} bytes
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      MIME Type
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text">
                      {summary.mimeType}
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      Browser detected type
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Processing Mode
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      100% Client-Side
                    </div>
                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Web Crypto API
                    </div>
                  </div>
                </div>

                {/* HASHES TABLE */}
                <div className="overflow-x-auto rounded-lg border border-xeoo-border">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-xeoo-surface-soft text-[11px] font-bold text-xeoo-text">
                        <th className="w-28 border-b border-r border-xeoo-border px-3 py-2 text-center">ALGORITHM</th>
                        <th className="border-b border-r border-xeoo-border px-3 py-2">HASH / CHECKSUM</th>
                        <th className="w-20 border-b border-r border-xeoo-border px-3 py-2 text-center">BITS</th>
                        <th className="w-24 border-b border-xeoo-border px-3 py-2 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.hashes.map((item) => (
                        <tr
                          key={item.algorithm}
                          className="border-b border-xeoo-border/60 hover:bg-xeoo-surface-soft/40 transition-colors"
                        >
                          <td className="border-r border-xeoo-border/60 px-3 py-2 text-center font-bold text-xeoo-text">
                            {item.algorithm}
                          </td>
                          <td className="border-r border-xeoo-border/60 px-3 py-2 font-mono text-[11px] text-xeoo-text break-all select-all">
                            {item.hash}
                          </td>
                          <td className="border-r border-xeoo-border/60 px-3 py-2 text-center text-xeoo-muted font-mono text-[11px]">
                            {item.bitLength}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleCopy(item.hash, item.algorithm)}
                              className="inline-flex items-center gap-1 rounded bg-xeoo-surface border border-xeoo-border px-2 py-1 text-[10px] font-semibold text-xeoo-text hover:bg-xeoo-surface-soft transition active:scale-95"
                            >
                              {copiedKey === item.algorithm ? (
                                <>
                                  <Check size={11} className="text-emerald-500" />
                                  <span className="text-emerald-500">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={11} />
                                  <span>Copy</span>
                                </>
                              )}
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

