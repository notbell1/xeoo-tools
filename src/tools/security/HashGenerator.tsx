import { useState, useTransition } from "react";
import { Check, Clipboard, Hash, RefreshCw, Sparkles, X } from "lucide-react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showError, showSuccess } from "../../alert";
import {
  calculateAllHashes,
  calculateHash,
  getUtf8ByteLength,
  type HashAlgorithm,
  type HashResultItem,
} from "./hashGeneratorLogic";

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-xeoo-muted">
      {label}
    </div>
  );
}

const ALGORITHMS: { id: HashAlgorithm; label: string; bits: string }[] = [
  { id: "SHA-256", label: "SHA-256", bits: "256 bits" },
  { id: "SHA-512", label: "SHA-512", bits: "512 bits" },
  { id: "SHA-384", label: "SHA-384", bits: "384 bits" },
  { id: "SHA-1", label: "SHA-1", bits: "160 bits (Legacy)" },
  { id: "MD5", label: "MD5", bits: "128 bits (Checksum)" },
];

export default function HashGenerator() {
  const [inputText, setInputText] = useState("");
  const [selectedAlgo, setSelectedAlgo] = useState<HashAlgorithm | "ALL">("SHA-256");
  const [uppercase, setUppercase] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(false);

  const [activeHash, setActiveHash] = useState("");
  const [allHashes, setAllHashes] = useState<HashResultItem[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    let text = inputText;
    if (trimWhitespace) {
      text = text.trim();
    }

    if (!text) {
      void showError("Input Required", "Please enter text to hash.");
      return;
    }

    startTransition(async () => {
      try {
        if (selectedAlgo === "ALL") {
          const list = await calculateAllHashes(text, uppercase);
          setAllHashes(list);
          setActiveHash(list[0]?.hash ?? "");
        } else {
          const hash = await calculateHash(text, selectedAlgo, uppercase);
          setActiveHash(hash);
          setAllHashes([]);
        }
      } catch (err) {
        console.error("Hashing error:", err);
        void showError("Hashing Error", "Failed to calculate hash.");
      }
    });
  };

  const handleCopy = async (value: string, keyId: string = "main") => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(keyId);
      await showSuccess("Copied", "Hash copied to clipboard.");
      window.setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      setCopiedKey(null);
    }
  };

  const handleClear = () => {
    setInputText("");
    setActiveHash("");
    setAllHashes([]);
    setCopiedKey(null);
  };

  const handleSample = () => {
    setInputText("hello");
  };

  const byteLength = getUtf8ByteLength(trimWhitespace ? inputText.trim() : inputText);
  const charLength = (trimWhitespace ? inputText.trim() : inputText).length;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-xeoo-bg text-xeoo-text lg:h-screen lg:max-h-screen lg:overflow-hidden">
      <Header />

      <main className="min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3 lg:overflow-hidden lg:px-4 lg:py-2">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-2">
          {/* TOOL HEADER */}
          <div className="flex w-full shrink-0 items-center justify-between rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-xeoo-primary-soft text-xeoo-primary">
                <Hash size={16} />
              </div>
              <div>
                <h1 className="text-xs font-extrabold text-xeoo-text sm:text-sm">
                  HASH GENERATOR
                </h1>
                <p className="text-[11px] text-xeoo-muted">
                  Generate cryptographic digests locally via Web Crypto API (SHA-256, SHA-512, MD5).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSample}
                className="inline-flex h-7 items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2 text-[11px] font-medium text-xeoo-text transition hover:bg-xeoo-surface-soft active:scale-95"
              >
                <Sparkles size={12} className="text-xeoo-primary" />
                <span className="hidden sm:inline">Sample Text</span>
              </button>

              {(inputText || activeHash) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex h-7 items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2 text-[11px] font-medium text-xeoo-muted transition hover:text-xeoo-text active:scale-95"
                >
                  <X size={12} />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-12">
            {/* LEFT COLUMN: INPUT & ALGORITHMS */}
            <section className="min-w-0 rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 lg:col-span-7 lg:overflow-y-auto">
              <div className="space-y-3">
                {/* TEXT INPUT */}
                <div>
                  <div className="flex items-center justify-between">
                    <SectionLabel label="Input Plaintext" />
                    <span className="text-[11px] text-xeoo-muted">
                      {charLength} chars · {byteLength} bytes
                    </span>
                  </div>

                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter plaintext to calculate hash..."
                    rows={4}
                    className="w-full rounded-md border border-xeoo-border bg-xeoo-surface p-2.5 font-mono text-[12px] text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
                    spellCheck={false}
                  />
                </div>

                {/* ALGORITHM SELECTOR */}
                <div>
                  <SectionLabel label="Select Hash Algorithm" />
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {ALGORITHMS.map((algo) => (
                      <button
                        key={algo.id}
                        type="button"
                        onClick={() => setSelectedAlgo(algo.id)}
                        className={[
                          "flex flex-col rounded-md border px-2.5 py-1.5 text-left text-[11px] transition active:scale-95",
                          selectedAlgo === algo.id
                            ? "border-xeoo-primary bg-xeoo-primary-soft text-xeoo-primary"
                            : "border-xeoo-border bg-xeoo-surface text-xeoo-text hover:bg-xeoo-surface-soft",
                        ].join(" ")}
                      >
                        <span className="font-bold">{algo.label}</span>
                        <span className="text-[10px] text-xeoo-muted">{algo.bits}</span>
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setSelectedAlgo("ALL")}
                      className={[
                        "flex flex-col justify-center rounded-md border px-2.5 py-1.5 text-left text-[11px] transition active:scale-95",
                        selectedAlgo === "ALL"
                          ? "border-xeoo-primary bg-xeoo-primary-soft text-xeoo-primary"
                          : "border-xeoo-border bg-xeoo-surface text-xeoo-text hover:bg-xeoo-surface-soft",
                      ].join(" ")}
                    >
                      <span className="font-bold">All Algorithms</span>
                      <span className="text-[10px] text-xeoo-muted">Compute simultaneously</span>
                    </button>
                  </div>
                </div>

                {/* OPTIONS */}
                <div>
                  <SectionLabel label="Output Formatting" />
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    <label className="flex h-8 cursor-pointer items-center justify-between gap-2 rounded-md border border-xeoo-border px-2.5 text-[12px]">
                      <span className="text-xeoo-text">Uppercase Hex</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={uppercase}
                        onClick={() => setUppercase(!uppercase)}
                        className={`relative h-4 w-8 shrink-0 rounded-full transition ${
                          uppercase ? "bg-xeoo-primary" : "bg-xeoo-border"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition ${
                            uppercase ? "left-4.5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </label>

                    <label className="flex h-8 cursor-pointer items-center justify-between gap-2 rounded-md border border-xeoo-border px-2.5 text-[12px]">
                      <span className="text-xeoo-text">Trim Whitespace</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={trimWhitespace}
                        onClick={() => setTrimWhitespace(!trimWhitespace)}
                        className={`relative h-4 w-8 shrink-0 rounded-full transition ${
                          trimWhitespace ? "bg-xeoo-primary" : "bg-xeoo-border"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition ${
                            trimWhitespace ? "left-4.5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </label>
                  </div>
                </div>

                {/* ACTION BUTTON */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isPending || !inputText.trim()}
                    className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-xeoo-primary px-4 text-[12px] font-bold text-white transition hover:bg-xeoo-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={isPending ? "animate-spin" : ""} />
                    <span>Generate Cryptographic Hash</span>
                  </button>
                </div>
              </div>
            </section>

            {/* RIGHT COLUMN: HASH RESULT */}
            <section className="min-w-0 rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 lg:col-span-5 lg:flex lg:min-h-0 lg:flex-col lg:overflow-y-auto">
              <div className="min-w-0 space-y-3">
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <SectionLabel label="Generated Output" />
                    {activeHash && (
                      <span className="rounded bg-xeoo-primary-soft px-1.5 py-0.5 text-[10px] font-extrabold text-xeoo-primary">
                        {selectedAlgo}
                      </span>
                    )}
                  </div>

                  {/* SINGLE ACTIVE HASH RESULT */}
                  {selectedAlgo !== "ALL" && (
                    <div className="mt-1">
                      <div className="relative">
                        <textarea
                          readOnly
                          rows={3}
                          value={activeHash}
                          placeholder="Hash output will appear here..."
                          className="w-full rounded-md border border-xeoo-border bg-xeoo-bg p-2 font-mono text-[11px] font-bold text-xeoo-text outline-none"
                        />
                      </div>

                      {activeHash && (
                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-xeoo-muted">
                          <span>{activeHash.length} hex characters</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(activeHash, "single")}
                            className="inline-flex h-7 items-center gap-1.5 rounded-md border border-xeoo-border px-2 text-[11px] font-medium text-xeoo-muted transition hover:text-xeoo-text active:scale-95"
                          >
                            {copiedKey === "single" ? (
                              <Check size={12} className="text-green-500" />
                            ) : (
                              <Clipboard size={12} />
                            )}
                            <span>{copiedKey === "single" ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ALL HASHES LIST */}
                  {selectedAlgo === "ALL" && allHashes.length > 0 && (
                    <div className="mt-1 space-y-2">
                      {allHashes.map((item) => (
                        <div
                          key={item.algorithm}
                          className="rounded-md border border-xeoo-border bg-xeoo-bg p-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-xeoo-muted">
                              {item.algorithm} ({item.bitLength} bits)
                            </span>

                            <button
                              type="button"
                              onClick={() => handleCopy(item.hash, item.algorithm)}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-xeoo-muted hover:text-xeoo-text"
                            >
                              {copiedKey === item.algorithm ? (
                                <>
                                  <Check size={11} className="text-green-500" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Clipboard size={11} />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="mt-1 break-all font-mono text-[11px] font-semibold text-xeoo-text">
                            {item.hash}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!activeHash && selectedAlgo === "ALL" && (
                    <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-xeoo-border text-[11px] text-xeoo-muted">
                      Click generate to calculate all digests.
                    </div>
                  )}
                </div>

                {/* CRYPTOGRAPHIC DISCLAIMER NOTICE */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 p-2.5 text-[11px] text-xeoo-muted">
                  <div className="font-bold text-xeoo-text">Important Cryptographic Notice</div>
                  <p className="mt-1 leading-relaxed">
                    Cryptographic hashes are one-way irreversible digests. They cannot be decrypted back to plaintext.
                    Notice: Algorithms like MD5 and SHA-1 are legacy digests suitable for file checksums, but should not be used for secure password storage (prefer bcrypt or Argon2).
                  </p>
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

