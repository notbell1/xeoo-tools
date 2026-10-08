import { useMemo, useState } from "react";
import { Check, Clipboard, Copy, KeyRound, RefreshCw, X } from "lucide-react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showSuccess } from "../../alert";
import {
  estimateTokenEntropy,
  generateTokens,
  type TokenCharsetType,
  type TokenGeneratorOptions,
} from "./randomTokenGeneratorLogic";

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-xeoo-muted">
      {label}
    </div>
  );
}

const PRESET_LENGTHS = [16, 32, 64, 128, 256];

const CHARSETS: { id: TokenCharsetType; label: string; desc: string }[] = [
  { id: "alphanumeric", label: "Alphanumeric", desc: "A-Z, a-z, 0-9 (62 chars)" },
  { id: "hex", label: "Hexadecimal", desc: "0-9, a-f (16 chars)" },
  { id: "base64url", label: "Base64URL", desc: "A-Z, a-z, 0-9, -, _ (64 chars)" },
  { id: "symbols", label: "Alphanumeric + Symbols", desc: "Full ASCII security pool (~95 chars)" },
  { id: "numeric", label: "Numeric", desc: "0-9 only (OTP / PIN format)" },
];

export default function RandomTokenGenerator() {
  const [length, setLength] = useState(32);
  const [charset, setCharset] = useState<TokenCharsetType>("alphanumeric");
  const [uppercaseOnly, setUppercaseOnly] = useState(false);
  const [lowercaseOnly, setLowercaseOnly] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [generatedTokens, setGeneratedTokens] = useState<string[]>(() =>
    generateTokens({ length: 32, charset: "alphanumeric" }, 1)
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const entropy = useMemo(
    () => estimateTokenEntropy(length, charset, uppercaseOnly, lowercaseOnly),
    [length, charset, uppercaseOnly, lowercaseOnly]
  );

  const primaryToken = generatedTokens[0] || "";

  const handleGenerate = () => {
    const options: TokenGeneratorOptions = {
      length,
      charset,
      uppercaseOnly,
      lowercaseOnly,
    };
    const list = generateTokens(options, quantity);
    setGeneratedTokens(list);
    setCopiedKey(null);
  };

  const handleCopySingle = async (text: string, keyId: string = "primary") => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyId);
      await showSuccess("Copied", "Token copied to clipboard.");
      window.setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      setCopiedKey(null);
    }
  };

  const handleCopyAll = async () => {
    if (generatedTokens.length === 0) return;
    try {
      await navigator.clipboard.writeText(generatedTokens.join("\n"));
      setCopiedKey("all");
      await showSuccess("All Copied", `${generatedTokens.length} tokens copied to clipboard.`);
      window.setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      setCopiedKey(null);
    }
  };

  const handleClear = () => {
    setGeneratedTokens([]);
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
                <KeyRound size={16} />
              </div>
              <div>
                <h1 className="text-xs font-extrabold text-xeoo-text sm:text-sm">
                  RANDOM TOKEN GENERATOR
                </h1>
                <p className="text-[11px] text-xeoo-muted">
                  Generate cryptographically secure API keys and random tokens via Web Crypto API.
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

              {generatedTokens.length > 0 && (
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
            {/* LEFT COLUMN: CONFIGURATION */}
            <section className="min-w-0 rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 lg:col-span-6 lg:overflow-y-auto">
              <div className="space-y-3">
                {/* TOKEN LENGTH */}
                <div>
                  <div className="flex items-center justify-between">
                    <SectionLabel label="Token Length" />
                    <span className="font-mono text-xs font-bold text-xeoo-text">
                      {length} characters
                    </span>
                  </div>

                  {/* PRESET PILLS */}
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {PRESET_LENGTHS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setLength(preset)}
                        className={[
                          "rounded-md border px-2.5 py-1 text-[11px] font-semibold transition active:scale-95",
                          length === preset
                            ? "border-xeoo-primary bg-xeoo-primary-soft text-xeoo-primary"
                            : "border-xeoo-border bg-xeoo-surface-soft/60 text-xeoo-text hover:bg-xeoo-surface-soft",
                        ].join(" ")}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <input
                    type="range"
                    min={8}
                    max={256}
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-xeoo-surface-soft accent-xeoo-primary"
                  />
                </div>

                {/* CHARACTER SET */}
                <div>
                  <SectionLabel label="Character Pool" />
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {CHARSETS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCharset(item.id)}
                        className={[
                          "flex flex-col rounded-md border p-2 text-left text-[11px] transition active:scale-95",
                          charset === item.id
                            ? "border-xeoo-primary bg-xeoo-primary-soft text-xeoo-primary"
                            : "border-xeoo-border bg-xeoo-surface text-xeoo-text hover:bg-xeoo-surface-soft",
                        ].join(" ")}
                      >
                        <span className="font-bold">{item.label}</span>
                        <span className="text-[10px] text-xeoo-muted">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CASING & OPTIONS */}
                <div>
                  <SectionLabel label="Casing Constraints" />
                  <div className="grid grid-cols-2 gap-1.5">
                    <label className="flex h-8 cursor-pointer items-center justify-between gap-2 rounded-md border border-xeoo-border px-2.5 text-[12px]">
                      <span className="text-xeoo-text">Uppercase Only</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={uppercaseOnly}
                        onClick={() => {
                          setUppercaseOnly(!uppercaseOnly);
                          if (!uppercaseOnly) setLowercaseOnly(false);
                        }}
                        className={`relative h-4 w-8 shrink-0 rounded-full transition ${
                          uppercaseOnly ? "bg-xeoo-primary" : "bg-xeoo-border"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition ${
                            uppercaseOnly ? "left-4.5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </label>

                    <label className="flex h-8 cursor-pointer items-center justify-between gap-2 rounded-md border border-xeoo-border px-2.5 text-[12px]">
                      <span className="text-xeoo-text">Lowercase Only</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={lowercaseOnly}
                        onClick={() => {
                          setLowercaseOnly(!lowercaseOnly);
                          if (!lowercaseOnly) setUppercaseOnly(false);
                        }}
                        className={`relative h-4 w-8 shrink-0 rounded-full transition ${
                          lowercaseOnly ? "bg-xeoo-primary" : "bg-xeoo-border"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition ${
                            lowercaseOnly ? "left-4.5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </label>
                  </div>
                </div>

                {/* QUANTITY */}
                <div>
                  <div className="flex items-center justify-between">
                    <SectionLabel label="Batch Quantity" />
                    <span className="font-mono text-xs font-bold text-xeoo-text">
                      {quantity} token{quantity > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    {[1, 5, 10, 25, 50].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuantity(q)}
                        className={[
                          "flex-1 rounded-md border py-1 text-center text-[11px] font-semibold transition active:scale-95",
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

                {/* GENERATE ACTION BUTTON */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-xeoo-primary px-4 text-[12px] font-bold text-white transition hover:bg-xeoo-primary-hover active:scale-[0.98]"
                >
                  <RefreshCw size={13} />
                  <span>Generate Secure Token</span>
                </button>
              </div>
            </section>

            {/* RIGHT COLUMN: GENERATED TOKEN(S) */}
            <section className="min-w-0 rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 lg:col-span-6 lg:flex lg:min-h-0 lg:flex-col lg:overflow-y-auto">
              <div className="min-w-0 space-y-3">
                {/* PRIMARY TOKEN CARD */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <SectionLabel label="Primary Generated Token" />
                    <span className="text-[10px] font-bold text-xeoo-muted">
                      {entropy} bits entropy
                    </span>
                  </div>

                  <div className="mt-1">
                    <textarea
                      readOnly
                      rows={3}
                      value={primaryToken}
                      placeholder="Token will appear here..."
                      className="w-full rounded-md border border-xeoo-border bg-xeoo-bg p-2 font-mono text-[11px] font-bold text-xeoo-text outline-none"
                    />

                    {primaryToken && (
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-xeoo-muted">
                        <span>{primaryToken.length} characters</span>
                        <button
                          type="button"
                          onClick={() => handleCopySingle(primaryToken, "primary")}
                          className="inline-flex h-7 items-center gap-1.5 rounded-md border border-xeoo-border px-2 text-[11px] font-medium text-xeoo-muted transition hover:text-xeoo-text active:scale-95"
                        >
                          {copiedKey === "primary" ? (
                            <Check size={12} className="text-green-500" />
                          ) : (
                            <Clipboard size={12} />
                          )}
                          <span>{copiedKey === "primary" ? "Copied" : "Copy Token"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* BATCH TOKENS (IF QUANTITY > 1) */}
                {generatedTokens.length > 1 && (
                  <div className="flex-1 rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <SectionLabel label={`Batch List (${generatedTokens.length} Tokens)`} />
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
                        <span>{copiedKey === "all" ? "All Copied" : "Copy All"}</span>
                      </button>
                    </div>

                    <div className="mt-1 max-h-56 space-y-1.5 overflow-y-auto">
                      {generatedTokens.map((tok, idx) => (
                        <div
                          key={`${tok}-${idx}`}
                          className="flex items-center justify-between gap-2 rounded-md border border-xeoo-border bg-xeoo-bg p-1.5 text-[11px]"
                        >
                          <span className="truncate font-mono font-medium text-xeoo-text" title={tok}>
                            {tok}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleCopySingle(tok, `token-${idx}`)}
                            className="shrink-0 p-1 text-xeoo-muted transition hover:text-xeoo-text"
                            title="Copy this token"
                          >
                            {copiedKey === `token-${idx}` ? (
                              <Check size={12} className="text-green-500" />
                            ) : (
                              <Clipboard size={12} />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECURITY NOTICE */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 p-2.5 text-[11px] text-xeoo-muted">
                  <div className="font-bold text-xeoo-text">Cryptographic CSPRNG Guarantee</div>
                  <p className="mt-1 leading-relaxed">
                    Tokens are produced using <code>crypto.getRandomValues()</code> with rejection sampling to eliminate modular arithmetic bias.
                    Zero Math.random(). Generated entirely within your browser and never logged or stored.
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

