import {
  AlertTriangle,
  Download,
  File,
  Folder,
  FolderArchive,
  LoaderCircle,
  RotateCcw,
  Search,
  Upload,
} from "lucide-react";
import { useState, useRef, useMemo, type ChangeEvent, type DragEvent, type FormEvent } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showError, showSuccess } from "../../alert";
import {
  extractSingleFile,
  formatBytes,
  loadArchive,
  type ArchiveExtractionSummary,
  type ExtractedEntry,
} from "./fileExtractorLogic";

type ProcessStatus = "idle" | "loading" | "loaded" | "error";

export default function FileExtractor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessStatus>("idle");
  const [summary, setSummary] = useState<ArchiveExtractionSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChosen = (file: File) => {
    setSelectedFile(file);
    setSummary(null);
    setErrorMsg("");
    setStatus("idle");
    setSearchQuery("");
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
    setSearchQuery("");
    setDownloadingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenArchive = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Please select a ZIP archive to open.");
      void showError("No File Selected", "Please select a ZIP archive.");
      return;
    }

    setErrorMsg("");
    setStatus("loading");

    try {
      const data = await loadArchive(selectedFile);
      setSummary(data);
      setStatus("loaded");
      void showSuccess("Archive Loaded", `Loaded ${data.totalEntries} entries from "${data.archiveName}".`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to open ZIP archive.";
      setErrorMsg(msg);
      setStatus("error");
      void showError("Extraction Error", msg);
    }
  };

  const handleDownloadEntry = async (entry: ExtractedEntry) => {
    if (entry.isFolder || !summary) return;

    setDownloadingId(entry.id);
    try {
      const blob = await extractSingleFile(summary.zipInstance, entry.path);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = entry.baseName || "file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to extract file.";
      void showError("Download Failed", msg);
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredEntries = useMemo(() => {
    if (!summary) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return summary.entries;
    return summary.entries.filter((item) => item.name.toLowerCase().includes(q));
  }, [summary, searchQuery]);

  const statusMeta = () => {
    switch (status) {
      case "loading":
        return {
          label: "Reading Archive...",
          badge: "border-orange-500 bg-orange-500 text-white dark:border-orange-400 dark:bg-orange-500 dark:text-white",
        };
      case "loaded":
        return {
          label: "Archive Ready",
          badge: "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-600 dark:text-white",
        };
      case "error":
        return {
          label: "Error",
          badge: "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-600 dark:text-white",
        };
      default:
        return {
          label: selectedFile ? "Ready to Open" : "Ready",
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
                    FILE EXTRACTOR
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Open ZIP archives and extract individual files directly in your browser.
                  </p>
                </div>
              </div>

              <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-bold ${meta.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full bg-white ${status === "loading" ? "animate-pulse" : ""}`} />
                {meta.label}
              </span>
            </div>

            {/* FORM */}
            <div className="p-3 sm:p-4">
              <form onSubmit={handleOpenArchive} noValidate className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* DROPZONE */}
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Target ZIP Archive
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
                          <FolderArchive size={20} />
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
                            Choose a ZIP archive or drag & drop here
                          </p>
                          <p className="text-[11px] text-xeoo-muted">
                            Standard .zip format &bull; Extracted client-side (no upload)
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
                        disabled={status === "loading"}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 text-[11px] font-bold text-xeoo-text shadow-xs transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-95 disabled:opacity-50"
                      >
                        <RotateCcw size={13} />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading" || !selectedFile}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-5 text-[11px] font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:px-6"
                  >
                    {status === "loading" ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        <span>Loading Archive...</span>
                      </>
                    ) : (
                      <>
                        <FolderArchive size={14} />
                        <span>Open Archive</span>
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
              RESULTS SECTION (ARCHIVE CONTENTS)
          ================================================================ */}
          {summary && (
            <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
              <div className="flex flex-col gap-2 border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <div className="flex min-w-0 items-center gap-1.5">
                  <FolderArchive size={14} className="shrink-0 text-xeoo-muted" />
                  <div className="min-w-0">
                    <h2 className="truncate text-xs font-extrabold text-xeoo-text">
                      ARCHIVE CONTENTS
                    </h2>
                    <p className="truncate text-[12px] text-xeoo-muted">
                      {summary.archiveName} &bull; {summary.fileCount} files, {summary.folderCount} folders
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
                      Archive Size
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text">
                      {formatBytes(summary.archiveSize)}
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      Compressed file size
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Uncompressed Size
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text">
                      {formatBytes(summary.totalUncompressedSize)}
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      Extracted size
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Total Files
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-xeoo-text">
                      {summary.fileCount}
                    </div>
                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Extractable files
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Directories
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-xeoo-text">
                      {summary.folderCount}
                    </div>
                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Folder structures
                    </div>
                  </div>
                </div>

                {/* SEARCH FILTER */}
                {summary.entries.length > 5 && (
                  <div className="relative">
                    <Search
                      size={12}
                      className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xeoo-muted"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter files by name or path..."
                      className="h-8 w-full max-w-sm rounded-md border border-xeoo-border bg-xeoo-surface pl-7 pr-2.5 text-[11px] text-xeoo-text outline-none placeholder:text-xeoo-muted focus:border-xeoo-primary"
                    />
                  </div>
                )}

                {/* ENTRIES TABLE */}
                <div className="overflow-x-auto rounded-lg border border-xeoo-border">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-xeoo-surface-soft text-[11px] font-bold text-xeoo-text">
                        <th className="w-12 border-b border-r border-xeoo-border px-3 py-2 text-center">#</th>
                        <th className="w-16 border-b border-r border-xeoo-border px-3 py-2 text-center">TYPE</th>
                        <th className="border-b border-r border-xeoo-border px-3 py-2">NAME / PATH</th>
                        <th className="w-28 border-b border-r border-xeoo-border px-3 py-2 text-right">SIZE</th>
                        <th className="w-24 border-b border-xeoo-border px-3 py-2 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map((entry) => (
                        <tr
                          key={entry.id}
                          className="border-b border-xeoo-border/60 hover:bg-xeoo-surface-soft/40 transition-colors"
                        >
                          <td className="border-r border-xeoo-border/60 px-3 py-2 text-center text-xeoo-muted font-mono text-[11px]">
                            {entry.id}
                          </td>
                          <td className="border-r border-xeoo-border/60 px-3 py-2 text-center">
                            {entry.isFolder ? (
                              <Folder size={14} className="mx-auto text-amber-500" />
                            ) : (
                              <File size={14} className="mx-auto text-xeoo-muted" />
                            )}
                          </td>
                          <td className="border-r border-xeoo-border/60 px-3 py-2">
                            <span className="font-medium text-xeoo-text break-all">{entry.name}</span>
                          </td>
                          <td className="border-r border-xeoo-border/60 px-3 py-2 text-right font-mono text-[11px] text-xeoo-muted">
                            {entry.isFolder ? "-" : formatBytes(entry.uncompressedSize)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {!entry.isFolder && (
                              <button
                                type="button"
                                onClick={() => handleDownloadEntry(entry)}
                                disabled={downloadingId === entry.id}
                                className="inline-flex items-center gap-1 rounded bg-xeoo-surface border border-xeoo-border px-2 py-1 text-[10px] font-semibold text-xeoo-text hover:bg-xeoo-surface-soft transition active:scale-95 disabled:opacity-50"
                              >
                                {downloadingId === entry.id ? (
                                  <LoaderCircle size={11} className="animate-spin text-xeoo-primary" />
                                ) : (
                                  <Download size={11} />
                                )}
                                <span>Save</span>
                              </button>
                            )}
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

