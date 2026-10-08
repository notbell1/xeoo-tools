import { useState, useRef, useTransition, type DragEvent, type ChangeEvent } from "react";
import {
  Check,
  Clipboard,
  FileText,
  Hash,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Upload,
  X,
  AlertTriangle,
} from "lucide-react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showError, showSuccess, showWarning } from "../../alert";
import {
  calculateAllBufferHashes,
  calculateBufferHash,
  formatFileSize,
  verifyChecksum,
  type FileHashAlgorithm,
  type FileHashResultItem,
  type FileMetadata,
} from "./fileHashCheckerLogic";

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-xeoo-muted">
      {label}
    </div>
  );
}

const ALGORITHMS: { id: FileHashAlgorithm; label: string; bits: string }[] = [
  { id: "SHA-256", label: "SHA-256", bits: "256 bits" },
  { id: "SHA-512", label: "SHA-512", bits: "512 bits" },
  { id: "SHA-384", label: "SHA-384", bits: "384 bits" },
  { id: "SHA-1", label: "SHA-1", bits: "160 bits (Legacy)" },
  { id: "MD5", label: "MD5", bits: "128 bits (Checksum)" },
];

export default function FileHashChecker() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileMeta, setFileMeta] = useState<FileMetadata | null>(null);
  const [selectedAlgo, setSelectedAlgo] = useState<FileHashAlgorithm | "ALL">("ALL");
  const [uppercase, setUppercase] = useState(false);
  const [expectedHash, setExpectedHash] = useState("");

  const [isDragging, setIsDragging] = useState(false);
  const [results, setResults] = useState<FileHashResultItem[]>([]);
  const [copiedAlgo, setCopiedAlgo] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  const handleFileSelection = (file: File) => {
    setSelectedFile(file);
    setFileMeta({
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      lastModified: file.lastModified,
    });
    setResults([]);

    if (file.size > 500 * 1024 * 1024) {
      void showWarning(
        "Large File Notice",
        "This file is larger than 500 MB. Processing might take a few moments depending on available memory."
      );
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleCalculate = async () => {
    if (!selectedFile) {
      void showError("No File Selected", "Please select or drop a file to compute hashes.");
      return;
    }

    setIsCalculating(true);

    try {
      const buffer = await selectedFile.arrayBuffer();

      startTransition(async () => {
        try {
          if (selectedAlgo === "ALL") {
            const list = await calculateAllBufferHashes(buffer, uppercase);
            setResults(list);
          } else {
            const singleHash = await calculateBufferHash(buffer, selectedAlgo, uppercase);
            const algoInfo = ALGORITHMS.find((a) => a.id === selectedAlgo);
            const bitLength = algoInfo?.id === "SHA-512" ? 512 : algoInfo?.id === "SHA-384" ? 384 : algoInfo?.id === "SHA-256" ? 256 : algoInfo?.id === "SHA-1" ? 160 : 128;
            setResults([
              {
                algorithm: selectedAlgo,
                hash: singleHash,
                bitLength,
              },
            ]);
          }
          await showSuccess("Completed", "File checksums computed successfully.");
        } catch (calcError) {
          console.error("Hash calculation error:", calcError);
          void showError("Computation Error", "Failed to calculate file hashes.");
        } finally {
          setIsCalculating(false);
        }
      });
    } catch (readError) {
      console.error("File read error:", readError);
      setIsCalculating(false);
      void showError("Read Error", "Failed to read the file into memory.");
    }
  };

  const handleCopy = async (hash: string, id: string) => {
    if (!hash) return;
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedAlgo(id);
      await showSuccess("Copied", "Checksum copied to clipboard.");
      window.setTimeout(() => setCopiedAlgo(null), 1500);
    } catch {
      setCopiedAlgo(null);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setFileMeta(null);
    setResults([]);
    setExpectedHash("");
    setCopiedAlgo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const verification = verifyChecksum(expectedHash, results);

  return (
    <div className="flex min-h-screen flex-col justify-between bg-xeoo-bg text-xeoo-text">
      <Header />

      <main className="flex-1 p-2 sm:p-4 lg:h-screen lg:max-h-screen lg:overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-2">
          {/* Algorithm Mode Bar */}
          <div className="flex w-full shrink-0 flex-wrap items-center justify-between gap-2 rounded-lg border border-xeoo-border bg-xeoo-surface p-1">
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedAlgo("ALL")}
                className={`min-h-8 rounded-md px-3 text-[12px] font-medium transition ${
                  selectedAlgo === "ALL"
                    ? "bg-xeoo-primary text-white"
                    : "text-xeoo-muted hover:bg-xeoo-bg hover:text-xeoo-text"
                }`}
              >
                All Checksums
              </button>
              {ALGORITHMS.map((algo) => (
                <button
                  key={algo.id}
                  type="button"
                  onClick={() => setSelectedAlgo(algo.id)}
                  className={`min-h-8 rounded-md px-3 text-[12px] font-medium transition ${
                    selectedAlgo === algo.id
                      ? "bg-xeoo-primary text-white"
                      : "text-xeoo-muted hover:bg-xeoo-bg hover:text-xeoo-text"
                  }`}
                >
                  {algo.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 px-2">
              <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-xeoo-muted hover:text-xeoo-text">
                <input
                  type="checkbox"
                  checked={uppercase}
                  onChange={(e) => setUppercase(e.target.checked)}
                  className="rounded border-xeoo-border text-xeoo-primary focus:ring-xeoo-primary"
                />
                Uppercase
              </label>
            </div>
          </div>

          {/* Two-Column Responsive Workspace */}
          <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-12">
            {/* Left Column: File Dropzone & Configuration */}
            <section className="flex flex-col gap-2.5 overflow-y-auto rounded-lg border border-xeoo-border bg-xeoo-surface p-3 lg:col-span-6">
              <div>
                <SectionLabel label="Upload Target File" />
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition ${
                    isDragging
                      ? "border-xeoo-primary bg-xeoo-primary/5"
                      : "border-xeoo-border bg-xeoo-bg/50 hover:border-xeoo-primary/60 hover:bg-xeoo-bg"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleInputChange}
                  />
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-xeoo-primary/10 text-xeoo-primary">
                    <Upload size={20} />
                  </div>
                  <div className="text-[13px] font-medium text-xeoo-text">
                    Drag and drop file here, or click to browse
                  </div>
                  <div className="mt-1 text-[11px] text-xeoo-muted">
                    Supports any file type. Processed 100% locally in your browser.
                  </div>
                </div>
              </div>

              {/* Selected File Metadata Card */}
              {fileMeta && (
                <div className="rounded-md border border-xeoo-border bg-xeoo-bg/40 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={18} className="shrink-0 text-xeoo-primary" />
                      <div className="min-w-0">
                        <div className="truncate text-[12px] font-semibold text-xeoo-text">
                          {fileMeta.name}
                        </div>
                        <div className="text-[11px] text-xeoo-muted">
                          {formatFileSize(fileMeta.size)} &bull; {fileMeta.type}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="rounded p-1 text-xeoo-muted transition hover:bg-xeoo-surface hover:text-xeoo-text"
                      title="Remove file"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {fileMeta.size > 300 * 1024 * 1024 && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-500">
                      <AlertTriangle size={13} className="shrink-0" />
                      <span>Large file: computing checksums will take a few seconds.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Expected Checksum Verification Input */}
              <div>
                <SectionLabel label="Compare with Expected Checksum (Optional)" />
                <input
                  type="text"
                  value={expectedHash}
                  onChange={(e) => setExpectedHash(e.target.value)}
                  placeholder="Paste expected SHA-256, SHA-512, MD5, etc."
                  className="h-9 w-full rounded-md border border-xeoo-border bg-xeoo-surface px-3 font-mono text-[12px] text-xeoo-text outline-none transition placeholder:font-sans focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
                  spellCheck={false}
                />
                <div className="mt-1 text-[11px] text-xeoo-muted">
                  Paste the checksum published by the file author to verify authenticity.
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCalculate}
                  disabled={!selectedFile || isCalculating}
                  className="inline-flex min-h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-xeoo-primary px-3 text-[12px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCalculating ? (
                    <>
                      <LoaderCircle size={14} className="animate-spin" />
                      Computing Hashes...
                    </>
                  ) : (
                    <>
                      <Hash size={14} />
                      Calculate Checksums
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isCalculating || (!selectedFile && !expectedHash && results.length === 0)}
                  className="inline-flex min-h-8 items-center justify-center gap-1 rounded-md border border-xeoo-border px-3 text-[12px] text-xeoo-muted transition hover:bg-xeoo-bg hover:text-xeoo-text disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw size={13} />
                  Reset
                </button>
              </div>
            </section>

            {/* Right Column: Checksum Output & Verification Status */}
            <section className="flex flex-col gap-2.5 overflow-y-auto rounded-lg border border-xeoo-border bg-xeoo-surface p-3 lg:col-span-6">
              <div className="flex items-center justify-between">
                <SectionLabel label="Checksum Results" />
                {results.length > 0 && (
                  <span className="text-[11px] font-medium text-xeoo-muted">
                    {results.length} algorithm{results.length > 1 ? "s" : ""} computed
                  </span>
                )}
              </div>

              {/* Expected Checksum Verification Banner */}
              {expectedHash.trim() && results.length > 0 && (
                <div
                  className={`flex items-start gap-2.5 rounded-md border p-2.5 text-[12px] ${
                    verification.isMatch
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                      : "border-red-500/40 bg-red-500/10 text-red-500"
                  }`}
                >
                  {verification.isMatch ? (
                    <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                  ) : (
                    <ShieldAlert size={18} className="mt-0.5 shrink-0 text-red-500" />
                  )}
                  <div>
                    <div className="font-semibold">
                      {verification.isMatch ? "Checksum Verified" : "Checksum Mismatch Warning"}
                    </div>
                    <div className="mt-0.5 text-[11px] opacity-90">{verification.details}</div>
                  </div>
                </div>
              )}

              {/* Results List */}
              {results.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {results.map((item) => {
                    const isMatchedAlgo =
                      verification.isMatch && verification.matchedAlgorithm === item.algorithm;

                    return (
                      <div
                        key={item.algorithm}
                        className={`rounded-md border p-2.5 transition ${
                          isMatchedAlgo
                            ? "border-emerald-500/50 bg-emerald-500/5"
                            : "border-xeoo-border bg-xeoo-bg/40"
                        }`}
                      >
                        <div className="mb-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px] font-semibold text-xeoo-text">
                              {item.algorithm}
                            </span>
                            <span className="rounded bg-xeoo-surface px-1.5 py-0.5 text-[10px] text-xeoo-muted">
                              {item.bitLength} bits
                            </span>
                            {isMatchedAlgo && (
                              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-500">
                                Match
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.hash, item.algorithm)}
                            className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-xeoo-muted transition hover:bg-xeoo-surface hover:text-xeoo-text"
                          >
                            {copiedAlgo === item.algorithm ? (
                              <>
                                <Check size={12} className="text-emerald-500" />
                                <span className="text-emerald-500">Copied</span>
                              </>
                            ) : (
                              <>
                                <Clipboard size={12} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="break-all font-mono text-[12px] text-xeoo-text select-all">
                          {item.hash}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-dashed border-xeoo-border p-8 text-center text-xeoo-muted">
                  <Hash size={28} className="mb-2 opacity-40" />
                  <div className="text-[13px] font-medium text-xeoo-text">No Hashes Computed</div>
                  <div className="mt-1 text-[11px]">
                    Select a file and click "Calculate Checksums" to generate cryptographic hashes.
                  </div>
                </div>
              )}

              {/* Informational Security Notice */}
              <div className="mt-auto rounded-md border border-xeoo-border bg-xeoo-bg/30 p-2.5 text-[11px] text-xeoo-muted">
                <div className="font-semibold text-xeoo-text">Zero-Knowledge File Verification</div>
                <div className="mt-0.5">
                  Hashing runs entirely in-memory using the browser's native Web Crypto API. Files
                  never leave your computer, ensuring complete privacy and confidentiality.
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

