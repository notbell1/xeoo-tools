import {
  AlertTriangle,
  Check,
  Copy,
  FileText,
  Info,
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
  extractFileMetadata,
  formatBytes,
  type FileMetadataResult,
} from "./fileMetadataViewerLogic";

type ProcessStatus = "idle" | "reading" | "completed" | "error";

export default function FileMetadataViewer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessStatus>("idle");
  const [result, setResult] = useState<FileMetadataResult | null>(null);
  const [copiedProp, setCopiedProp] = useState<string | null>(null);
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

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setErrorMsg("");
    setStatus("idle");
    setCopiedProp(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInspect = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Please select a file to view its metadata.");
      void showError("No File Selected", "Please select a target file.");
      return;
    }

    setErrorMsg("");
    setStatus("reading");

    try {
      const res = await extractFileMetadata(selectedFile);
      setResult(res);
      setStatus("completed");
      void showSuccess("Metadata Extracted", `Parsed properties for "${res.fileName}".`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Metadata parsing failed.";
      setErrorMsg(msg);
      setStatus("error");
      void showError("Inspection Error", msg);
    }
  };

  const handleCopy = async (val: string, prop: string) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopiedProp(prop);
      void showSuccess("Copied", `${prop} copied to clipboard.`);
      window.setTimeout(() => setCopiedProp(null), 1500);
    } catch {
      setCopiedProp(null);
    }
  };

  const statusMeta = () => {
    switch (status) {
      case "reading":
        return {
          label: "Reading Metadata...",
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
          label: selectedFile ? "Ready to Read" : "Ready",
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
                  <Info size={15} strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold text-xeoo-text sm:text-sm">
                    FILE METADATA VIEWER
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Inspect standard, temporal, and extended file metadata client-side.
                  </p>
                </div>
              </div>

              <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-bold ${meta.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full bg-white ${status === "reading" ? "animate-pulse" : ""}`} />
                {meta.label}
              </span>
            </div>

            {/* FORM */}
            <div className="p-3 sm:p-4">
              <form onSubmit={handleInspect} noValidate className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* DROPZONE */}
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Target File to Inspect
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
                            Supports any file format &bull; Inspected 100% locally in browser (no upload)
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
                        disabled={status === "reading"}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 text-[11px] font-bold text-xeoo-text shadow-xs transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-95 disabled:opacity-50"
                      >
                        <RotateCcw size={13} />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "reading" || !selectedFile}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-5 text-[11px] font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:px-6"
                  >
                    {status === "reading" ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        <span>Reading Metadata...</span>
                      </>
                    ) : (
                      <>
                        <Search size={14} />
                        <span>View Metadata</span>
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
                  <Info size={14} className="shrink-0 text-xeoo-muted" />
                  <div className="min-w-0">
                    <h2 className="truncate text-xs font-extrabold text-xeoo-text">
                      FILE METADATA
                    </h2>
                    <p className="truncate text-[12px] text-xeoo-muted">
                      {result.fileName} &bull; {result.basicInfo.length + result.extendedInfo.length} properties detected
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

              <div className="space-y-4 p-3 sm:p-3.5">
                {/* BASIC INFO TABLE */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Basic File Information
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-xeoo-border">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-xeoo-surface-soft text-[11px] font-bold text-xeoo-text">
                          <th className="w-48 border-b border-r border-xeoo-border px-3 py-2">PROPERTY</th>
                          <th className="border-b border-r border-xeoo-border px-3 py-2">VALUE</th>
                          <th className="w-20 border-b border-xeoo-border px-3 py-2 text-center">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.basicInfo.map((row) => (
                          <tr
                            key={row.property}
                            className="border-b border-xeoo-border/60 hover:bg-xeoo-surface-soft/40 transition-colors"
                          >
                            <td className="border-r border-xeoo-border/60 px-3 py-2 font-medium text-xeoo-muted">
                              {row.property}
                            </td>
                            <td className="border-r border-xeoo-border/60 px-3 py-2 font-mono text-[11px] text-xeoo-text break-all select-all">
                              {row.value}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {row.copyable && (
                                <button
                                  type="button"
                                  onClick={() => handleCopy(row.value, row.property)}
                                  className="inline-flex items-center gap-1 rounded bg-xeoo-surface border border-xeoo-border px-2 py-0.5 text-[10px] font-semibold text-xeoo-text hover:bg-xeoo-surface-soft transition active:scale-95"
                                >
                                  {copiedProp === row.property ? (
                                    <>
                                      <Check size={10} className="text-emerald-500" />
                                      <span className="text-emerald-500">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={10} />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* EXTENDED INFO TABLE (IF ANY) */}
                {result.extendedInfo.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Detected Extended Metadata
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-xeoo-border">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="bg-xeoo-surface-soft text-[11px] font-bold text-xeoo-text">
                            <th className="w-48 border-b border-r border-xeoo-border px-3 py-2">PROPERTY</th>
                            <th className="border-b border-r border-xeoo-border px-3 py-2">VALUE</th>
                            <th className="w-20 border-b border-xeoo-border px-3 py-2 text-center">ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.extendedInfo.map((row) => (
                            <tr
                              key={row.property}
                              className="border-b border-xeoo-border/60 hover:bg-xeoo-surface-soft/40 transition-colors"
                            >
                              <td className="border-r border-xeoo-border/60 px-3 py-2 font-medium text-xeoo-muted">
                                {row.property}
                              </td>
                              <td className="border-r border-xeoo-border/60 px-3 py-2 font-mono text-[11px] text-xeoo-text break-all select-all">
                                {row.value}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleCopy(row.value, row.property)}
                                  className="inline-flex items-center gap-1 rounded bg-xeoo-surface border border-xeoo-border px-2 py-0.5 text-[10px] font-semibold text-xeoo-text hover:bg-xeoo-surface-soft transition active:scale-95"
                                >
                                  {copiedProp === row.property ? (
                                    <>
                                      <Check size={10} className="text-emerald-500" />
                                      <span className="text-emerald-500">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={10} />
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
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

