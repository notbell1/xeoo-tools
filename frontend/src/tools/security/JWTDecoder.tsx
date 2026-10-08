import { useMemo, useState } from "react";
import { Check, Clipboard, KeyRound, Sparkles, X } from "lucide-react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showSuccess } from "../../alert";
import { decodeJwt } from "./jwtDecoderLogic";

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-xeoo-muted">
      {label}
    </div>
  );
}

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIERvZSIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTg5MzQ1NjAwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JWTDecoder() {
  const [tokenInput, setTokenInput] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const decoded = useMemo(() => decodeJwt(tokenInput), [tokenInput]);

  const handleCopy = async (text: string, keyId: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyId);
      await showSuccess("Copied", "Content copied to clipboard.");
      window.setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      setCopiedKey(null);
    }
  };

  const handleClear = () => {
    setTokenInput("");
    setCopiedKey(null);
  };

  const handleSample = () => {
    setTokenInput(SAMPLE_JWT);
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
                  JWT DECODER
                </h1>
                <p className="text-[11px] text-xeoo-muted">
                  Decode and inspect JSON Web Token headers and payload claims locally in your browser.
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
                <span className="hidden sm:inline">Sample JWT</span>
              </button>

              {tokenInput && (
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
            {/* LEFT COLUMN: ENCODED TOKEN INPUT & STANDARD CLAIMS */}
            <section className="min-w-0 rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 lg:col-span-5 lg:overflow-y-auto">
              <div className="space-y-3">
                {/* ENCODED JWT INPUT */}
                <div>
                  <SectionLabel label="Encoded Token String" />
                  <textarea
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Paste your JWT here (header.payload.signature)..."
                    rows={6}
                    className="w-full rounded-md border border-xeoo-border bg-xeoo-surface p-2.5 font-mono text-[11px] text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
                    spellCheck={false}
                  />
                </div>

                {/* ERROR NOTIFICATION */}
                {tokenInput && !decoded.valid && decoded.error && (
                  <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2.5 text-[11px] font-semibold text-red-600 dark:text-red-400">
                    {decoded.error}
                  </div>
                )}

                {/* STANDARD CLAIMS SUMMARY */}
                {decoded.valid && (
                  <div>
                    <SectionLabel label="Standard Token Claims" />
                    <div className="space-y-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 p-2.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-xeoo-muted">Status:</span>
                        <span
                          className={[
                            "rounded px-1.5 py-0.2 text-[10px] font-bold uppercase",
                            decoded.expirationStatus === "active"
                              ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                              : decoded.expirationStatus === "expired"
                                ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                : "bg-xeoo-surface text-xeoo-muted border border-xeoo-border",
                          ].join(" ")}
                        >
                          {decoded.expirationStatus === "active"
                            ? "Active"
                            : decoded.expirationStatus === "expired"
                              ? "Expired"
                              : "No Exp"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-xeoo-muted">Expires (exp):</span>
                        <span className="font-mono font-medium text-xeoo-text">
                          {decoded.expirationDisplay}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-xeoo-muted">Issued At (iat):</span>
                        <span className="font-mono font-medium text-xeoo-text">
                          {decoded.issuedAtDisplay}
                        </span>
                      </div>

                      {decoded.standardClaims.sub && (
                        <div className="flex justify-between">
                          <span className="text-xeoo-muted">Subject (sub):</span>
                          <span className="font-mono font-medium text-xeoo-text">
                            {decoded.standardClaims.sub}
                          </span>
                        </div>
                      )}

                      {decoded.standardClaims.iss && (
                        <div className="flex justify-between">
                          <span className="text-xeoo-muted">Issuer (iss):</span>
                          <span className="font-mono font-medium text-xeoo-text">
                            {decoded.standardClaims.iss}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SIGNATURE INFORMATION */}
                {decoded.valid && (
                  <div>
                    <div className="flex items-center justify-between">
                      <SectionLabel label="Signature Token" />
                      <button
                        type="button"
                        onClick={() => handleCopy(decoded.rawSignature, "sig")}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-xeoo-muted hover:text-xeoo-text"
                      >
                        {copiedKey === "sig" ? <Check size={11} className="text-green-500" /> : <Clipboard size={11} />}
                        <span>{copiedKey === "sig" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    <div className="break-all rounded-md border border-xeoo-border bg-xeoo-bg p-2 font-mono text-[10px] text-xeoo-muted">
                      {decoded.rawSignature || "No signature"}
                    </div>
                  </div>
                )}

                {/* SECURITY NOTICE */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 p-2.5 text-[11px] text-xeoo-muted">
                  <div className="font-bold text-xeoo-text">Decoding ≠ Cryptographic Verification</div>
                  <p className="mt-1 leading-relaxed">
                    Decoding unpacks the JSON header and payload claims client-side. It does NOT verify the signature secret or public key.
                    Tokens are never transmitted to external servers.
                  </p>
                </div>
              </div>
            </section>

            {/* RIGHT COLUMN: DECODED HEADER & PAYLOAD JSON */}
            <section className="min-w-0 rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 lg:col-span-7 lg:flex lg:min-h-0 lg:flex-col lg:overflow-y-auto">
              <div className="min-w-0 space-y-3">
                {/* DECODED HEADER */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <SectionLabel label="Header: Algorithm & Token Type" />
                    {decoded.valid && (
                      <button
                        type="button"
                        onClick={() => handleCopy(decoded.formattedHeader, "header")}
                        className="inline-flex h-6 items-center gap-1 rounded border border-xeoo-border px-1.5 text-[10px] font-medium text-xeoo-muted transition hover:text-xeoo-text active:scale-95"
                      >
                        {copiedKey === "header" ? <Check size={11} className="text-green-500" /> : <Clipboard size={11} />}
                        <span>{copiedKey === "header" ? "Copied" : "Copy Header"}</span>
                      </button>
                    )}
                  </div>

                  <pre className="mt-1 max-h-40 overflow-auto rounded-md border border-xeoo-border bg-xeoo-bg p-2 font-mono text-[11px] text-xeoo-text">
                    {decoded.valid
                      ? decoded.formattedHeader
                      : "// Header will appear here after token input"}
                  </pre>
                </div>

                {/* DECODED PAYLOAD */}
                <div className="flex-1 rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <SectionLabel label="Payload: Data Claims" />
                    {decoded.valid && (
                      <button
                        type="button"
                        onClick={() => handleCopy(decoded.formattedPayload, "payload")}
                        className="inline-flex h-6 items-center gap-1 rounded border border-xeoo-border px-1.5 text-[10px] font-medium text-xeoo-muted transition hover:text-xeoo-text active:scale-95"
                      >
                        {copiedKey === "payload" ? <Check size={11} className="text-green-500" /> : <Clipboard size={11} />}
                        <span>{copiedKey === "payload" ? "Copied" : "Copy Payload"}</span>
                      </button>
                    )}
                  </div>

                  <pre className="mt-1 min-h-48 overflow-auto rounded-md border border-xeoo-border bg-xeoo-bg p-2 font-mono text-[11px] text-xeoo-text">
                    {decoded.valid
                      ? decoded.formattedPayload
                      : "// Payload claims will appear here after token input"}
                  </pre>
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

