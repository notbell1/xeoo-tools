import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  ExternalLink,
  Globe,
  Info,
  KeyRound,
  Link2,
  LoaderCircle,
  Package,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  UserCheck,
  X,
} from "lucide-react";

import { useRef, useState, type FormEvent } from "react";

import Footer from "../../components/Footer";

import { showError, showSuccess } from "../../alert";

import {
  checkScamLink,
  getRiskTone,
  normalizeUrlInput,
  type ScamCheckItem,
  type ScamLinkResult,
} from "./scamLinkLogic";

const SAMPLE_TEST_CASES = [
  {
    label: "Fake Bank Reward",
    url: "bit.ly/bank_sinarm4s",
    desc: "Impersonation shortlink & leetspeak",
    category: "bank",
  },
  {
    label: "Courier Parcel Check",
    url: "j&t_expre$s.com/cekresi",
    desc: "Brand spoofing with special symbols",
    category: "resi",
  },
  {
    label: "Fake Job Portal",
    url: "job-street.cc/low0ng4n",
    desc: "Typosquatting .cc & obfuscation",
    category: "loker",
  },
  {
    label: "Phishing Social Media",
    url: "ig-f0topicture-b0tnet.com",
    desc: "Credential harvesting trap",
    category: "sosmed",
  },
  {
    label: "Official Bank Portal (Safe)",
    url: "https://www.bca.co.id",
    desc: "Verified authentic banking domain",
    category: "safe",
  },
];

function CheckStatusIcon({ status }: { status: ScamCheckItem["status"] }) {
  if (status === "pass") {
    return (
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
        <CheckCircle2 size={13} strokeWidth={2.4} />
      </div>
    );
  }

  if (status === "danger") {
    return (
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
        <ShieldAlert size={13} strokeWidth={2.4} />
      </div>
    );
  }

  if (status === "warning") {
    return (
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
        <AlertTriangle size={13} strokeWidth={2.4} />
      </div>
    );
  }

  return (
    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
      <Info size={13} strokeWidth={2.4} />
    </div>
  );
}

export default function ScamLinkChecker() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScamLinkResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const abortRef = useRef<AbortController | null>(null);

  const handleCheck = async (targetUrl?: string) => {
    const query = typeof targetUrl === "string" ? targetUrl : url;
    const normalized = normalizeUrlInput(query);

    if (!normalized) {
      setError("Masukkan link atau alamat website yang ingin diperiksa.");
      return;
    }

    setError("");
    setResult(null);
    setLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await checkScamLink(query, controller.signal);
      setResult(data);
    } catch (requestError) {
      if (
        requestError instanceof DOMException &&
        requestError.name === "AbortError"
      ) {
        return;
      }

      const message =
        requestError instanceof Error
          ? requestError.message
          : "Gagal memeriksa URL ini.";

      setError(message);
      showError(message);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loading) {
      void handleCheck();
    }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setError("");
    setResult(null);
    setUrl("");
  };

  const handleCopy = async () => {
    if (!result?.url) return;
    try {
      await navigator.clipboard.writeText(result.url);
      showSuccess("Link berhasil disalin ke clipboard.");
    } catch {
      showError("Gagal menyalin link.");
    }
  };

  const handleSampleClick = (sampleUrl: string) => {
    setUrl(sampleUrl);
    void handleCheck(sampleUrl);
  };

  const tone = result ? getRiskTone(result.risk.level) : null;

  return (
    <div className="flex min-h-dvh flex-col bg-xeoo-bg text-xeoo-text">
      <main className="flex-1 px-3 py-4 sm:px-5 sm:py-6">
        <div className="mx-auto w-full max-w-4xl space-y-4">
          {/* TOOL HERO CARD */}
          <section className="overflow-hidden rounded-2xl border border-xeoo-border bg-xeoo-surface shadow-xs">
            <div className="border-b border-xeoo-border bg-xeoo-surface-soft p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-xeoo-primary/20 bg-xeoo-primary-soft text-xeoo-primary">
                    <ShieldCheck size={20} strokeWidth={2} />
                  </div>

                  <div>
                    <h1 className="text-base font-bold tracking-tight text-xeoo-text sm:text-lg">
                      Scam & Phishing Link Checker
                    </h1>
                    <p className="text-xs text-xeoo-muted">
                      Verify suspicious URLs, fake government aid, courier APK traps, fake job portals, and phishing links.
                    </p>
                  </div>
                </div>

                {result && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex h-8 items-center gap-1.5 self-start rounded-lg border border-xeoo-border bg-xeoo-surface px-3 text-xs font-semibold text-xeoo-text transition hover:bg-xeoo-surface-soft active:scale-95 sm:self-center"
                  >
                    <RefreshCw size={12} />
                    Check Another Link
                  </button>
                )}
              </div>
            </div>

            {/* FORM INPUT */}
            <div className="p-4 sm:p-5">
              <form onSubmit={handleSubmit} noValidate className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative min-w-0 flex-1">
                    <Link2
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xeoo-muted"
                    />

                    <input
                      id="scam-link-url"
                      type="text"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Enter suspicious link, shortlink, or domain (e.g. bit.ly/bank_sinarm4s)..."
                      autoComplete="off"
                      spellCheck={false}
                      disabled={loading}
                      className="h-10 w-full rounded-xl border border-xeoo-border bg-xeoo-bg pl-9 pr-9 text-xs font-medium text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:bg-xeoo-surface focus:ring-1 focus:ring-xeoo-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    {url && (
                      <button
                        type="button"
                        onClick={() => setUrl("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xeoo-muted transition hover:text-xeoo-text"
                        title="Clear input"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !url.trim()}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-xeoo-text px-5 text-xs font-bold text-xeoo-surface transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Search size={14} />
                        <span>Check Security</span>
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* SAMPLES QUICK SELECT */}
                <div className="pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Quick Sample Test Cases:
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {SAMPLE_TEST_CASES.map((sample) => (
                      <button
                        key={sample.url}
                        type="button"
                        onClick={() => handleSampleClick(sample.url)}
                        disabled={loading}
                        className={[
                          "group inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-left text-[11px] font-medium transition active:scale-95 disabled:pointer-events-none",
                          sample.category === "safe"
                            ? "border-emerald-200 bg-emerald-50/50 text-emerald-800 hover:border-emerald-300 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                            : "border-xeoo-border bg-xeoo-surface hover:border-xeoo-primary/40 hover:bg-xeoo-surface-soft text-xeoo-text",
                        ].join(" ")}
                        title={sample.desc}
                      >
                        <span className="font-semibold">{sample.label}</span>
                        <ChevronRight
                          size={12}
                          className="text-xeoo-muted transition group-hover:translate-x-0.5"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              {/* LOADING STATE */}
              {loading && (
                <div className="mt-6 rounded-2xl border border-dashed border-xeoo-border bg-xeoo-bg/50 px-4 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-xeoo-primary/30 bg-xeoo-primary-soft text-xeoo-primary shadow-xs">
                    <LoaderCircle size={24} className="animate-spin" />
                  </div>
                  <h3 className="mt-3.5 text-sm font-bold text-xeoo-text">
                    Sedang Memeriksa & Mendekode URL...
                  </h3>
                  <p className="mt-1 text-xs text-xeoo-muted">
                    Memeriksa leetspeak, pencatutan brand, pola modus penipuan, TLD berbahaya, dan intelijen ancaman.
                  </p>
                </div>
              )}

              {/* RESULT DISPLAY */}
              {result && !loading && (
                <div className="mt-6 space-y-4">
                  {/* MAIN RISK CARD */}
                  <div
                    className={[
                      "relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all",
                      tone?.cardBg,
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={[
                              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide",
                              tone?.badge,
                            ].join(" ")}
                          >
                            {result.risk.level === "dangerous" ? (
                              <ShieldAlert size={14} strokeWidth={2.5} />
                            ) : result.risk.level === "high" ||
                              result.risk.level === "suspicious" ? (
                              <AlertTriangle size={14} strokeWidth={2.5} />
                            ) : (
                              <ShieldCheck size={14} strokeWidth={2.5} />
                            )}
                            {result.risk.label}
                          </span>

                          {result.brandImpersonated && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                              Mencatut: {result.brandImpersonated}
                            </span>
                          )}
                        </div>

                        <h2 className="text-base font-black sm:text-lg">
                          {result.risk.summary}
                        </h2>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <div className="inline-flex items-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface/90 px-2.5 py-1 text-xs font-semibold text-xeoo-text">
                            <Globe size={13} className="text-xeoo-muted" />
                            <span>Host: {result.hostname}</span>
                          </div>

                          <button
                            type="button"
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-xs font-medium text-xeoo-muted hover:text-xeoo-text"
                            title="Salin URL"
                          >
                            <Clipboard size={12} />
                            <span>Salin</span>
                          </button>

                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="inline-flex items-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-xs font-medium text-xeoo-muted hover:text-xeoo-text"
                            title="Kunjungi website (Hati-hati)"
                          >
                            <ExternalLink size={12} />
                            <span>Buka URL</span>
                          </a>
                        </div>
                      </div>

                      {/* RISK SCORE GAUGE */}
                      <div className="flex shrink-0 items-center justify-between rounded-2xl border border-xeoo-border bg-xeoo-surface/80 p-4 shadow-xs sm:flex-col sm:justify-center sm:text-center sm:min-w-32">
                        <div>
                          <p className="text-[9px] font-extrabold uppercase tracking-widest text-xeoo-muted">
                            Skor Risiko
                          </p>
                          <p
                            className={[
                              "text-3xl font-black leading-tight sm:text-4xl",
                              tone?.scoreColor,
                            ].join(" ")}
                          >
                            {result.risk.score}
                            <span className="text-xs font-bold text-xeoo-muted">
                              /100
                            </span>
                          </p>
                        </div>

                        <div className="h-2 w-24 overflow-hidden rounded-full bg-xeoo-border/60 sm:mt-2">
                          <div
                            className={["h-full rounded-full transition-all duration-500", tone?.barColor].join(" ")}
                            style={{ width: `${Math.max(8, result.risk.score)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DETECTED MODUS & IMPERSONATION ALERT */}
                  {(result.detectedModus && result.detectedModus.length > 0) ||
                  result.brandImpersonated ? (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <AlertOctagon size={20} className="shrink-0 text-red-600 dark:text-red-400" />
                        <div className="min-w-0 space-y-1.5">
                          <h3 className="text-xs font-black uppercase tracking-wide text-red-700 dark:text-red-400">
                            Peringatan Modus Penipuan Terdeteksi
                          </h3>
                          <ul className="list-inside list-disc space-y-1 text-xs text-xeoo-text">
                            {result.brandImpersonated && (
                              <li>
                                <strong className="font-bold text-red-600 dark:text-red-400">
                                  Pencatutan Entitas:
                                </strong>{" "}
                                Website ini bukan milik{" "}
                                <strong>{result.brandImpersonated}</strong> dan berupaya
                                mengelabui korban dengan domain tiruan.
                              </li>
                            )}
                            {result.detectedModus?.map((modus, idx) => (
                              <li key={idx}>
                                <strong>{modus}:</strong> Hati-hati terhadap
                                permintaan data akun, PIN, OTP, atau transfer dana.
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* RECOMMENDATIONS BOX */}
                  {result.recommendations && result.recommendations.length > 0 && (
                    <div className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5">
                      <div className="flex items-center gap-2 border-b border-xeoo-border pb-3">
                        <Shield className="text-xeoo-primary" size={16} />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                          Langkah & Panduan Keamanan
                        </h3>
                      </div>
                      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                        {result.recommendations.map((rec, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2.5 rounded-xl border border-xeoo-border/60 bg-xeoo-bg/50 p-3 text-xs text-xeoo-text"
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-xeoo-primary/10 text-[10px] font-bold text-xeoo-primary">
                              {index + 1}
                            </span>
                            <span className="leading-5">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CHECKS DETAIL & URL ANALYSIS */}
                  <div className="grid gap-4 lg:grid-cols-2">
                    {/* SECURITY CHECKS */}
                    <div className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5">
                      <div className="flex items-center justify-between border-b border-xeoo-border pb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-xeoo-primary" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                            Hasil Pemeriksaan Sinyal ({result.checks.length})
                          </h3>
                        </div>
                      </div>

                      <div className="mt-3 divide-y divide-xeoo-border/60">
                        {result.checks.map((chk) => (
                          <div
                            key={chk.key}
                            className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
                          >
                            <CheckStatusIcon status={chk.status} />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-xeoo-text">
                                {chk.label}
                              </p>
                              <p className="mt-0.5 text-[11px] leading-4 text-xeoo-muted">
                                {chk.detail}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* URL ANALYSIS GRID */}
                    <div className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5">
                      <div className="flex items-center gap-2 border-b border-xeoo-border pb-3">
                        <Globe size={16} className="text-xeoo-primary" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                          Struktur & Analisis Domain
                        </h3>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {[
                          {
                            label: "Protokol HTTPS",
                            status: result.urlAnalysis.https ? "Aman (HTTPS)" : "Tidak Aman (HTTP)",
                            valid: result.urlAnalysis.https,
                          },
                          {
                            label: "Pemendek URL",
                            status: result.urlAnalysis.shortlink ? "Shortlink" : "Domain Langsung",
                            valid: !result.urlAnalysis.shortlink,
                          },
                          {
                            label: "IP Alih-alih Domain",
                            status: result.urlAnalysis.ipHost ? "Ya (IP Host)" : "Normal (Domain)",
                            valid: !result.urlAnalysis.ipHost,
                          },
                          {
                            label: "Ekstensi Mencurigakan",
                            status: result.urlAnalysis.suspiciousTld ? "TLD Berisiko" : "TLD Standar",
                            valid: !result.urlAnalysis.suspiciousTld,
                          },
                          {
                            label: "Karakter Aneh ($ & _)",
                            status: result.urlAnalysis.specialCharsInHost ? "Terdeteksi" : "Bersih",
                            valid: !result.urlAnalysis.specialCharsInHost,
                          },
                          {
                            label: "Subdomain Berlapis",
                            status: result.urlAnalysis.excessiveSubdomains ? "Terlalu Dalam" : "Normal",
                            valid: !result.urlAnalysis.excessiveSubdomains,
                          },
                          {
                            label: "Punycode / Homograf",
                            status: result.urlAnalysis.punycode ? "Ya (IDN)" : "Tidak",
                            valid: !result.urlAnalysis.punycode,
                          },
                          {
                            label: "Sintaks User-Info (@)",
                            status: result.urlAnalysis.userInfo ? "Terdeteksi (@)" : "Tidak Ada",
                            valid: !result.urlAnalysis.userInfo,
                          },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="rounded-xl border border-xeoo-border/60 bg-xeoo-bg/50 p-2.5"
                          >
                            <p className="text-[10px] text-xeoo-muted">{item.label}</p>
                            <p
                              className={[
                                "mt-0.5 text-xs font-bold",
                                item.valid
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-amber-600 dark:text-amber-400",
                              ].join(" ")}
                            >
                              {item.status}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* EDUCATIONAL KNOWLEDGE CARDS */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <KeyRound size={18} />
              </div>
              <h3 className="mt-3 text-xs font-bold text-xeoo-text">
                Modus Hadiah & Bansos
              </h3>
              <p className="mt-1 text-[11px] leading-4 text-xeoo-muted">
                Menggunakan link tiruan bank (contoh: <code>sinarm4s</code>) untuk mencuri kode OTP dan PIN m-banking.
              </p>
            </div>

            <div className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <Package size={18} />
              </div>
              <h3 className="mt-3 text-xs font-bold text-xeoo-text">
                Modus Cek Resi Palsu
              </h3>
              <p className="mt-1 text-[11px] leading-4 text-xeoo-muted">
                Menyerupai nama ekspedisi (contoh: <code>j&t_expre$s.com</code>) untuk menyebarkan file APK berbahaya.
              </p>
            </div>

            <div className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                <UserCheck size={18} />
              </div>
              <h3 className="mt-3 text-xs font-bold text-xeoo-text">
                Modus Loker / Tugas
              </h3>
              <p className="mt-1 text-[11px] leading-4 text-xeoo-muted">
                Memodifikasi domain job portal (contoh: <code>job-street.cc</code>) untuk penipuan deposit kerja paruh waktu.
              </p>
            </div>

            <div className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
                <Smartphone size={18} />
              </div>
              <h3 className="mt-3 text-xs font-bold text-xeoo-text">
                Sanggahan Akun Sosmed
              </h3>
              <p className="mt-1 text-[11px] leading-4 text-xeoo-muted">
                Peringatan penutupan akun palsu (contoh: <code>ig-f0topicture-b0tnet.com</code>) untuk membajak akun.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
