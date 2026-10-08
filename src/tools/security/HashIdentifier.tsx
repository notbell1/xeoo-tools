import { useMemo, useState } from "react";
import { Check, Clipboard, Search, Sparkles, X } from "lucide-react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showSuccess } from "../../alert";
import {
  identifyHash,
  type PossibleHashMatch,
} from "./hashIdentifierLogic";

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-xeoo-muted">
      {label}
    </div>
  );
}

const SAMPLE_HASHES = [
  { label: "MD5", hash: "5d41402abc4b2a76b9719d911017c592" },
  { label: "SHA-1", hash: "2aae6c35c94fcfb415dbe95f408b9ce91ee846ed" },
  { label: "SHA-256", hash: "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824" },
  { label: "bcrypt", hash: "$2a$12$R9h/cIPz0gi.URNNXRkh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW" },
  { label: "CRC-32", hash: "3610a686" },
];

export default function HashIdentifier() {
  const [inputHash, setInputHash] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const result = useMemo(() => identifyHash(inputHash), [inputHash]);

  const handleCopyMatch = async (match: PossibleHashMatch, index: number) => {
    try {
      await navigator.clipboard.writeText(match.name);
      setCopiedIndex(index);
      await showSuccess("Copied", `Copied algorithm name "${match.name}".`);
      window.setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      setCopiedIndex(null);
    }
  };

  const handleClear = () => {
    setInputHash("");
    setCopiedIndex(null);
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-xeoo-bg text-xeoo-text lg:h-screen lg:max-h-screen lg:overflow-hidden">
      <Header />

      <main className="min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3 lg:overflow-hidden lg:px-4 lg:py-2">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-2">
          {/* HEADER */}
          <div className="flex w-full shrink-0 items-center justify-between rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-xeoo-primary-soft text-xeoo-primary">
                <Search size={16} />
              </div>
              <div>
                <h1 className="text-xs font-extrabold text-xeoo-text sm:text-sm">
                  HASH IDENTIFIER
                </h1>
                <p className="text-[11px] text-xeoo-muted">
                  Analyze and identify probable cryptographic hash types by length, format, and signature heuristics.
                </p>
              </div>
            </div>

            {inputHash && (
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

          {/* MAIN GRID */}
          <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-12">
            {/* LEFT COLUMN: INPUT & CHARACTERISTICS */}
            <section className="min-w-0 rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 lg:col-span-6 lg:overflow-y-auto">
              <div className="space-y-3">
                {/* HASH INPUT */}
                <div>
                  <SectionLabel label="Hash String to Identify" />
                  <textarea
                    value={inputHash}
                    onChange={(e) => setInputHash(e.target.value)}
                    placeholder="Paste a hash string (e.g. 5d41402abc4b2a76b9719d911017c592)..."
                    rows={4}
                    className="w-full rounded-md border border-xeoo-border bg-xeoo-surface p-2.5 font-mono text-[11px] text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
                    spellCheck={false}
                  />
                </div>

                {/* QUICK SAMPLES */}
                <div>
                  <div className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-xeoo-muted">
                    <Sparkles size={12} className="text-xeoo-primary" />
                    <span>Quick Sample Presets:</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_HASHES.map((sample) => (
                      <button
                        key={sample.label}
                        type="button"
                        onClick={() => setInputHash(sample.hash)}
                        className="rounded-md border border-xeoo-border bg-xeoo-surface-soft/60 px-2 py-1 text-[11px] font-medium text-xeoo-text transition hover:border-xeoo-primary active:scale-95"
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DETECTED CHARACTERISTICS */}
                {inputHash && (
                  <div>
                    <SectionLabel label="Detected Structural Characteristics" />
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] sm:grid-cols-4">
                      <div className="rounded-md border border-xeoo-border bg-xeoo-surface-soft/40 p-2 text-center">
                        <span className="text-xeoo-muted">Length</span>
                        <p className="font-mono text-xs font-bold text-xeoo-text">
                          {result.length}
                        </p>
                      </div>

                      <div className="rounded-md border border-xeoo-border bg-xeoo-surface-soft/40 p-2 text-center">
                        <span className="text-xeoo-muted">Encoding</span>
                        <p className="font-semibold text-xeoo-text">
                          {result.isHex ? "Hexadecimal" : result.isBase64 ? "Base64" : "Custom"}
                        </p>
                      </div>

                      <div className="rounded-md border border-xeoo-border bg-xeoo-surface-soft/40 p-2 text-center">
                        <span className="text-xeoo-muted">Prefix</span>
                        <p className="font-semibold text-xeoo-text">
                          {result.hasSpecialPrefix ? "Crypt $" : "Standard"}
                        </p>
                      </div>

                      <div className="rounded-md border border-xeoo-border bg-xeoo-surface-soft/40 p-2 text-center">
                        <span className="text-xeoo-muted">Matches</span>
                        <p className="font-mono text-xs font-bold text-xeoo-primary">
                          {result.matches.length}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* DISCLAIMER CARD */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 p-2.5 text-[11px] text-xeoo-muted">
                  <div className="font-bold text-xeoo-text">Identification Scope & Non-Cracking Notice</div>
                  <p className="mt-1 leading-relaxed">
                    Hash identification relies on string lengths and known encoding formats. Since multiple distinct algorithms can produce hashes of identical bit length (e.g. MD5 and NTLM are both 32 hex chars), results represent educated possibilities rather than a mathematical guarantee.
                    This utility does NOT perform hash cracking or dictionary attacks.
                  </p>
                </div>
              </div>
            </section>

            {/* RIGHT COLUMN: CANDIDATE MATCHES LIST */}
            <section className="min-w-0 rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 lg:col-span-6 lg:flex lg:min-h-0 lg:flex-col lg:overflow-y-auto">
              <div className="min-w-0 space-y-2">
                <div className="flex items-center justify-between">
                  <SectionLabel label="Probable Algorithm Matches" />
                  {inputHash && (
                    <span className="text-[11px] font-semibold text-xeoo-muted">
                      {result.matches.length} candidate(s)
                    </span>
                  )}
                </div>

                {!inputHash ? (
                  <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-xeoo-border p-4 text-center text-[12px] text-xeoo-muted">
                    Paste or type a hash on the left to identify potential algorithms.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {result.matches.map((match, index) => (
                      <div
                        key={`${match.name}-${index}`}
                        className="rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 shadow-xs transition hover:border-xeoo-border-dark"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-xeoo-text">
                                {match.name}
                              </span>

                              <span
                                className={[
                                  "rounded px-1.5 py-0.2 text-[9px] font-extrabold uppercase",
                                  match.confidence === "High"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : match.confidence === "Medium"
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                      : "bg-xeoo-surface-soft text-xeoo-muted border border-xeoo-border",
                                ].join(" ")}
                              >
                                {match.confidence} Confidence
                              </span>
                            </div>

                            <span className="text-[10px] font-medium text-xeoo-muted">
                              Category: {match.category}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyMatch(match, index)}
                            className="inline-flex h-6 items-center gap-1 rounded border border-xeoo-border px-1.5 text-[10px] font-medium text-xeoo-muted transition hover:text-xeoo-text"
                            title="Copy algorithm name"
                          >
                            {copiedIndex === index ? (
                              <Check size={11} className="text-green-500" />
                            ) : (
                              <Clipboard size={11} />
                            )}
                            <span>{copiedIndex === index ? "Copied" : "Copy"}</span>
                          </button>
                        </div>

                        <p className="mt-1.5 text-[11px] leading-relaxed text-xeoo-muted">
                          {match.details}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

