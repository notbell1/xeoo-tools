import { useState } from "react";
import {
  Check,
  Clipboard,
  Copy,
  Fingerprint,
  RefreshCw,
  X,
} from "lucide-react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showSuccess } from "../../alert";
import { generateMultipleUuids, type UuidOptions } from "./uuidGeneratorLogic";

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-xeoo-muted">
      {label}
    </div>
  );
}

export default function UUIDGenerator() {
  const [quantity, setQuantity] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [withoutHyphens, setWithoutHyphens] = useState(false);
  const [braces, setBraces] = useState(false);

  const [uuids, setUuids] = useState<string[]>(() =>
    generateMultipleUuids(5, {
      uppercase: false,
      withoutHyphens: false,
      braces: false,
    }),
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = () => {
    const opts: UuidOptions = {
      uppercase,
      withoutHyphens,
      braces,
    };
    const list = generateMultipleUuids(quantity, opts);
    setUuids(list);
    setCopiedKey(null);
  };

  const handleCopySingle = async (text: string, keyId: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyId);
      await showSuccess("Copied", "UUID copied to clipboard.");
      window.setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      setCopiedKey(null);
    }
  };

  const handleCopyAll = async () => {
    if (uuids.length === 0) return;
    try {
      await navigator.clipboard.writeText(uuids.join("\n"));
      setCopiedKey("all");
      await showSuccess(
        "All Copied",
        `${uuids.length} UUIDs copied to clipboard.`,
      );
      window.setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      setCopiedKey(null);
    }
  };

  const handleClear = () => {
    setUuids([]);
    setCopiedKey(null);
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-xeoo-bg text-xeoo-text lg:h-screen lg:max-h-screen lg:overflow-hidden">
      <Header />

      <main className="min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3 lg:overflow-hidden lg:px-4 lg:py-2">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-2">
          {/* TOOL HEADER */}
          <div className="flex w-full shrink-0 items-center justify-between rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-xeoo-primary-soft text-xeoo-primary">
                <Fingerprint size={16} />
              </div>
              <div>
                <h1 className="text-xs font-extrabold text-xeoo-text sm:text-sm">
                  UUID V4 GENERATOR
                </h1>
                <p className="text-[11px] text-xeoo-muted">
                  Generate RFC 4122 compliant version 4 universally unique
                  identifiers via browser CSPRNG.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleGenerate}
                className="inline-flex h-7 items-center gap-1 rounded-md bg-xeoo-primary px-2.5 text-[11px] font-bold text-white transition hover:bg-xeoo-primary-hover active:scale-95"
              >
                <RefreshCw size={12} />
                <span>Regenerate</span>
              </button>

              {uuids.length > 0 && (
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
            {/* LEFT COLUMN: OPTIONS */}
            <section className="min-w-0 rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 lg:col-span-5 lg:overflow-y-auto">
              <div className="space-y-3">
                {/* QUANTITY */}
                <div>
                  <SectionLabel label="Batch Quantity" />
                  <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                    {[1, 5, 10, 25, 50, 100].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuantity(q)}
                        className={[
                          "rounded-md border py-1.5 text-center text-[11px] font-semibold transition active:scale-95",
                          quantity === q
                            ? "border-xeoo-primary bg-xeoo-primary-soft text-xeoo-primary"
                            : "border-xeoo-border bg-xeoo-surface text-xeoo-text hover:bg-xeoo-surface-soft",
                        ].join(" ")}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FORMATTING OPTIONS */}
                <div>
                  <SectionLabel label="Formatting Options" />
                  <div className="space-y-1.5">
                    <label className="flex h-8 cursor-pointer items-center justify-between gap-2 rounded-md border border-xeoo-border px-2.5 text-[12px]">
                      <span className="text-xeoo-text">
                        Uppercase (e.g. 550E84...)
                      </span>
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
                      <span className="text-xeoo-text">
                        Without Hyphens (Compact 32-hex)
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={withoutHyphens}
                        onClick={() => setWithoutHyphens(!withoutHyphens)}
                        className={`relative h-4 w-8 shrink-0 rounded-full transition ${
                          withoutHyphens ? "bg-xeoo-primary" : "bg-xeoo-border"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition ${
                            withoutHyphens ? "left-4.5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </label>

                    <label className="flex h-8 cursor-pointer items-center justify-between gap-2 rounded-md border border-xeoo-border px-2.5 text-[12px]">
                      <span className="text-xeoo-text">
                        Enclose in Braces &#123;...&#125;
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={braces}
                        onClick={() => setBraces(!braces)}
                        className={`relative h-4 w-8 shrink-0 rounded-full transition ${
                          braces ? "bg-xeoo-primary" : "bg-xeoo-border"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition ${
                            braces ? "left-4.5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </label>
                  </div>
                </div>

                {/* GENERATE ACTION BUTTON */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-xeoo-primary px-4 text-[12px] font-bold text-white transition hover:bg-xeoo-primary-hover active:scale-[0.98]"
                >
                  <RefreshCw size={13} />
                  <span>
                    Generate {quantity} UUID{quantity > 1 ? "s" : ""}
                  </span>
                </button>

                {/* RFC 4122 ARCHITECTURE DETAILS */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 p-2.5 text-[11px] text-xeoo-muted">
                  <div className="font-bold text-xeoo-text">
                    RFC 4122 v4 Standard Details
                  </div>
                  <p className="mt-1 leading-relaxed">
                    UUID version 4 utilizes 122 bits of cryptographically secure
                    pseudorandom randomness. The 13th hex digit is always fixed
                    to <code>4</code> (version 4) and the 17th hex digit is
                    fixed to <code>8</code>, <code>9</code>, <code>a</code>, or{" "}
                    <code>b</code> (variant 1).
                  </p>
                </div>
              </div>
            </section>

            {/* RIGHT COLUMN: GENERATED UUID LIST */}
            <section className="min-w-0 rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 lg:col-span-7 lg:flex lg:min-h-0 lg:flex-col lg:overflow-y-auto">
              <div className="flex h-full min-w-0 flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <SectionLabel
                    label={`Generated Output (${uuids.length} UUID${uuids.length !== 1 ? "s" : ""})`}
                  />

                  {uuids.length > 0 && (
                    <button
                      type="button"
                      onClick={handleCopyAll}
                      className="inline-flex h-6 items-center gap-1 rounded border border-xeoo-border px-2 text-[10px] font-semibold text-xeoo-text transition hover:bg-xeoo-surface-soft active:scale-95"
                    >
                      {copiedKey === "all" ? (
                        <Check size={11} className="text-green-500" />
                      ) : (
                        <Copy size={11} />
                      )}
                      <span>
                        {copiedKey === "all" ? "All Copied" : "Copy All"}
                      </span>
                    </button>
                  )}
                </div>

                {uuids.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-xeoo-border p-4 text-center text-[12px] text-xeoo-muted">
                    No UUIDs generated. Click generate to create new
                    identifiers.
                  </div>
                ) : (
                  <div className="flex-1 space-y-1.5 overflow-y-auto">
                    {uuids.map((id, index) => (
                      <div
                        key={`${id}-${index}`}
                        className="flex items-center justify-between gap-2 rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 transition hover:border-xeoo-primary"
                      >
                        <span
                          className="truncate font-mono text-[11px] font-semibold text-xeoo-text"
                          title={id}
                        >
                          {id}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleCopySingle(id, `uuid-${index}`)}
                          className="shrink-0 rounded p-1 text-xeoo-muted transition hover:text-xeoo-text"
                          title="Copy UUID"
                        >
                          {copiedKey === `uuid-${index}` ? (
                            <Check size={12} className="text-green-500" />
                          ) : (
                            <Clipboard size={12} />
                          )}
                        </button>
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
