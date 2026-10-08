import {
  AlertTriangle,
  Check,
  Copy,
  FileCheck,
  FileText,
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
  formatBytes,
  verifyFileIntegrity,
  type IntegrityAlgorithm,
  type IntegrityVerificationResult,
} from "./fileIntegrityCheckerLogic";

type ProcessStatus = "idle" | "verifying" | "completed" | "error";

const ALGORITHMS: { id: IntegrityAlgorithm; label: string }[] = [
  { id: "AUTO", label: "Auto-Detect Algorithm" },
  { id: "SHA-256", label: "SHA-256 (256-bit)" },
  { id: "SHA-512", label: "SHA-512 (512-bit)" },
  { id: "SHA-384", label: "SHA-384 (384-bit)" },
  { id: "SHA-1", label: "SHA-1 (Legacy)" },
  { id: "MD5", label: "MD5 (Checksum)" },
];

export default function FileIntegrityChecker() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expectedHash, setExpectedHash] = useState("");
  const [algorithm, setAlgorithm] = useState<IntegrityAlgorithm>("AUTO");

  const [status, setStatus] = useState<ProcessStatus>("idle");
  const [result, setResult] = useState<IntegrityVerificationResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
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
    setExpectedHash("");
    setAlgorithm("AUTO");
    setResult(null);
    setErrorMsg("");
    setStatus("idle");
    setCopiedKey(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Please select a target file to verify.");
      void showError("No File Selected", "Please select a target file.");
      return;
    }
    if (!expectedHash.trim()) {
      setErrorMsg("Please enter the expected hash or checksum.");
      void showError("Expected Hash Required", "Please paste the expected hash.");
      return;
    }

    setErrorMsg("");
    setStatus("verifying");

    try {
      const res = await verifyFileIntegrity(selectedFile, expectedHash, algorithm);
      setResult(res);
      setStatus("completed");
      if (res.isMatch) {
        void showSuccess("Integrity Verified", "File hash matches the expected checksum.");
      } else {
        void showError("Integrity Mismatch", "The computed checksum does not match.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed.";
      setErrorMsg(msg);
      setStatus("error");
      void showError("Verification Error", msg);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      void showSuccess("Copied", "Hash copied to clipboard.");
      window.setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      setCopiedKey(null);
    }
  };

  const statusMeta = () => {
    switch (status) {
      case "verifying":
        return {
          label: "Verifying File...",
          badge: "border-orange-500 bg-orange-500 text-white dark:border-orange-400 dark:bg-orange-500 dark:text-white",
        };
      case "completed":
        return {
          label: result?.isMatch ? "Match Verified" : "Mismatch",
          badge: result?.isMatch
            ? "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-600 dark:text-white"
            : "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-600 dark:text-white",
        };
      case "error":
        return {
          label: "Error",
          badge: "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-600 dark:text-white",
        };
      default:
        return {
          label: selectedFile ? "Ready to Verify" : "Ready",
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
                  <FileCheck size={15} strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold text-xeoo-text sm:text-sm">
                    FILE INTEGRITY CHECKER
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Compare file hashes against expected values to detect tampering or corruption.
                  </p>
                </div>
              </div>

              <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-bold ${meta.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full bg-white ${status === "verifying" ? "animate-pulse" : ""}`} />
                {meta.label}
              </span>
            </div>

            {/* FORM */}
            <div className="p-3 sm:p-4">
              <form onSubmit={handleVerify} noValidate className="space-y-3">
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
                            Processed locally in browser &bull; File bytes never leave your machine
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* EXPECTED HASH & ALGORITHM */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Expected Checksum / Hash
                    </label>
                    <input
                      type="text"
                      value={expectedHash}
                      onChange={(e) => setExpectedHash(e.target.value)}
                      placeholder="Paste expected SHA-256, SHA-512, MD5, etc."
                      className="h-9 w-full rounded-md border border-xeoo-border bg-xeoo-surface px-3 font-mono text-[12px] text-xeoo-text outline-none transition placeholder:font-sans placeholder:text-xeoo-muted focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Hash Algorithm
                    </label>
                    <select
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value as IntegrityAlgorithm)}
                      className="h-9 w-full rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[12px] text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
                    >
                      {ALGORITHMS.map((algo) => (
                        <option key={algo.id} value={algo.id}>
                          {algo.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ACTION BAR */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={status === "verifying"}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 text-[11px] font-bold text-xeoo-text shadow-xs transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-95 disabled:opacity-50"
                      >
                        <RotateCcw size={13} />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "verifying" || !selectedFile || !expectedHash.trim()}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-5 text-[11px] font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:px-6"
                  >
                    {status === "verifying" ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        <span>Verifying Integrity...</span>
                      </>
                    ) : (
                      <>
                        <Search size={14} />
                        <span>Verify Integrity</span>
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
                  <FileCheck size={14} className="shrink-0 text-xeoo-muted" />
                  <div className="min-w-0">
                    <h2 className="truncate text-xs font-extrabold text-xeoo-text">
                      INTEGRITY VERIFICATION RESULT
                    </h2>
                    <p className="truncate text-[12px] text-xeoo-muted">
                      {result.fileName} &bull; Verified via {result.algorithmUsed}
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
                {/* VERDICT BANNER */}
                <div
                  className={`rounded-xl border p-3 ${
                    result.isMatch
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold">
                    {result.isMatch ? <Check size={16} /> : <AlertTriangle size={16} />}
                    <span>{result.isMatch ? "INTEGRITY MATCH CONFIRMED" : "INTEGRITY MISMATCH DETECTED"}</span>
                  </div>
                  <p className="mt-1 text-xs opacity-90">
                    {result.verdictMessage}
                  </p>
                </div>

                {/* METRICS */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Target File
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text">
                      {result.fileName}
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      {formatBytes(result.fileSize)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Algorithm Used
                    </div>
                    <div className="mt-1 font-mono text-[11px] font-bold text-xeoo-text">
                      {result.algorithmUsed}
                    </div>
                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Cryptographic digest
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Comparison Result
                    </div>
                    <div
                      className={`mt-1 font-bold text-xs ${
                        result.isMatch
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {result.isMatch ? "MATCH" : "DOES NOT MATCH"}
                    </div>
                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Character comparison
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      File Authenticity
                    </div>
                    <div className="mt-1 text-xs font-bold text-xeoo-text">
                      {result.isMatch ? "Unaltered File" : "Altered / Incomplete"}
                    </div>
                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Digest equality check
                    </div>
                  </div>
                </div>

                {/* SIDE BY SIDE COMPARISON */}
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft/30 p-3 space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                        Computed Hash ({result.algorithmUsed})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(result.computedHash, "computed")}
                        className="inline-flex items-center gap-1 text-[10px] text-xeoo-muted hover:text-xeoo-text"
                      >
                        {copiedKey === "computed" ? (
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
                    </div>
                    <div className="rounded-md border border-xeoo-border bg-xeoo-surface p-2 font-mono text-[11px] text-xeoo-text break-all select-all">
                      {result.computedHash}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                        Expected Hash (Provided)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(result.expectedHash, "expected")}
                        className="inline-flex items-center gap-1 text-[10px] text-xeoo-muted hover:text-xeoo-text"
                      >
                        {copiedKey === "expected" ? (
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
                    </div>
                    <div className="rounded-md border border-xeoo-border bg-xeoo-surface p-2 font-mono text-[11px] text-xeoo-text break-all select-all">
                      {result.expectedHash}
                    </div>
                  </div>
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

