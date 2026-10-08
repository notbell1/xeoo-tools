import {
  AlertTriangle,
  BarChart2,
  Check,
  Copy,
  ExternalLink,
  Globe,
  Info,
  LoaderCircle,
  RotateCcw,
  Search,
  Shield,
  X,
} from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showError, showSuccess, showWarning } from "../../alert";
import {
  checkDaPa,
  formatMetricCount,
  formatMetricScore,
  normalizeTarget,
  validateTargetInput,
  type DaPaData,
  type ScanStatus,
} from "./daPaCheckerLogic";

export default function DaPaChecker() {
  const [targetInput, setTargetInput] = useState("");
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [result, setResult] = useState<DaPaData | null>(null);
  const [error, setError] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const inputId = useId();
  const abortControllerRef = useRef<AbortController | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);

  // Abort ongoing requests when component unmounts
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);

      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = window.setTimeout(() => {
        setCopiedText(null);
      }, 2000);
    } catch {
      void showError("Copy Failed", "Could not copy text to clipboard.");
    }
  };

  const handleCheck = async () => {
    const rawInput = targetInput;
    const validation = validateTargetInput(rawInput);

    if (!validation.valid) {
      const message =
        validation.error ?? "Please enter a valid website domain or URL.";
      setError(message);

      if (validation.isXss) {
        await showWarning(
          "WARNING • XSS ATTEMPT DETECTED",
          message,
        );
      } else {
        await showError("Validation Error", message);
      }

      return;
    }

    setError("");
    setScanStatus("checking");
    setResult(null);

    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const cleanTarget = normalizeTarget(rawInput);
      const data = await checkDaPa(cleanTarget, controller.signal);

      setResult(data);
      setScanStatus("completed");

      if (data.da !== null || data.pa !== null) {
        await showSuccess(
          "Metrics Retrieved",
          `Successfully fetched DA (${data.da ?? "N/A"}) and PA (${data.pa ?? "N/A"}) for ${data.domain}.`,
        );
      } else {
        await showSuccess(
          "Check Completed",
          `No historical metrics currently recorded for ${data.domain} in the provider database.`,
        );
      }
    } catch (checkErr) {
      if (checkErr instanceof DOMException && checkErr.name === "AbortError") {
        return;
      }

      const message =
        checkErr instanceof Error
          ? checkErr.message
          : "Unable to retrieve DA/PA metrics. Please try again later.";

      setError(message);
      setScanStatus("error");

      await showError("Check Failed", message);
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (scanStatus !== "checking") {
      void handleCheck();
    }
  };

  const handleReset = () => {
    abortControllerRef.current?.abort();
    setTargetInput("");
    setScanStatus("idle");
    setResult(null);
    setError("");
    setCopiedText(null);
  };

  const statusBadge = useMemo(() => {
    switch (scanStatus) {
      case "checking":
        return {
          label: "Checking...",
          badge:
            "border-orange-500 bg-orange-500 text-white dark:border-orange-400 dark:bg-orange-500 dark:text-white",
        };

      case "completed":
        return {
          label: "Completed",
          badge:
            "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-600 dark:text-white",
        };

      case "error":
        return {
          label: "Error",
          badge:
            "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-600 dark:text-white",
        };

      default:
        return {
          label: "Ready",
          badge:
            "border-slate-500 bg-slate-500 text-white dark:border-slate-400 dark:bg-slate-600 dark:text-white",
        };
    }
  }, [scanStatus]);

  return (
    <div className="flex min-h-dvh flex-col bg-xeoo-bg text-xeoo-text">
      <Header />

      <main className="flex-1 px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto w-full max-w-6xl space-y-3">
          {/* ================================================================
              LOOKUP WORKSPACE
          ================================================================ */}
          <section className="self-start overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
            {/* WORKSPACE HEADER */}
            <div className="flex items-center justify-between gap-3 border-b border-xeoo-border px-3 py-2.5 sm:px-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-xeoo-primary-soft text-xeoo-primary">
                  <BarChart2 size={16} strokeWidth={2.2} />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold text-xeoo-text sm:text-sm">
                    DA / PA CHECKER
                  </h1>

                  <p className="truncate text-[11px] text-xeoo-muted">
                    Check Domain Authority and Page Authority metrics from verified SEO intelligence.
                  </p>
                </div>
              </div>

              <span
                className={[
                  "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-bold",
                  statusBadge.badge,
                ].join(" ")}
              >
                <span
                  className={[
                    "h-1.5 w-1.5 rounded-full bg-white",
                    scanStatus === "checking" ? "animate-pulse" : "",
                  ].join(" ")}
                />
                {statusBadge.label}
              </span>
            </div>

            {/* FORM */}
            <div className="p-3 sm:p-4">
              <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
                <div>
                  <label
                    htmlFor={inputId}
                    className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted"
                  >
                    Website / URL
                  </label>

                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                    <div className="relative min-w-0 flex-1">
                      <Globe
                        size={13}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xeoo-muted"
                      />

                      <input
                        id={inputId}
                        type="text"
                        value={targetInput}
                        onChange={(event) => {
                          setTargetInput(event.target.value);
                          if (error) setError("");
                        }}
                        placeholder="example.com or https://example.com/page"
                        autoComplete="off"
                        spellCheck={false}
                        disabled={scanStatus === "checking"}
                        className="h-9 w-full rounded-lg border border-xeoo-border bg-xeoo-bg pl-8 pr-8 text-[11px] font-medium text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:bg-xeoo-surface focus:ring-2 focus:ring-xeoo-primary/15 disabled:cursor-not-allowed disabled:opacity-60 sm:h-10"
                      />

                      {targetInput && (
                        <button
                          type="button"
                          onClick={() => setTargetInput("")}
                          className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-0.5 text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                          title="Clear input"
                          aria-label="Clear target input"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={scanStatus === "checking" || !targetInput.trim()}
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-4 text-[11px] font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:px-5"
                    >
                      {scanStatus === "checking" ? (
                        <>
                          <LoaderCircle size={14} className="animate-spin" />
                          <span>Checking Metrics...</span>
                        </>
                      ) : (
                        <>
                          <Search size={14} />
                          <span>Check Metrics</span>
                        </>
                      )}
                    </button>

                    {(result || targetInput) && (
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={scanStatus === "checking"}
                        className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 text-[11px] font-semibold text-xeoo-text shadow-xs transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-[0.98] disabled:opacity-50 sm:h-10 sm:px-3.5"
                        title="Reset check"
                        aria-label="Reset check"
                      >
                        <RotateCcw size={13} />
                        <span className="hidden sm:inline">Reset</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* ERROR BANNER */}
                {error && (
                  <div className="flex items-start gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-2 text-[11px] font-semibold text-red-600 dark:text-red-400">
                    <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                    <span className="min-w-0 break-words">{error}</span>
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
              {/* RESULTS HEADER */}
              <div className="flex flex-col gap-2 border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <div className="flex min-w-0 items-center gap-1.5">
                  <BarChart2 size={14} className="shrink-0 text-xeoo-muted" />

                  <div className="min-w-0">
                    <h2 className="truncate text-xs font-extrabold text-xeoo-text">
                      METRIC RESULTS
                    </h2>

                    <p className="truncate font-mono text-[11px] text-xeoo-muted">
                      {result.domain}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-xeoo-border bg-xeoo-surface px-2 py-0.5 text-[11px] font-medium text-xeoo-muted">
                    Source: {result.source}
                  </span>
                </div>
              </div>

              <div className="space-y-3 p-3 sm:p-3.5">
                {/* ============================================================
                    SCORE CARDS GRID
                ============================================================ */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {/* DOMAIN AUTHORITY */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                        Domain Authority
                      </span>
                      <span className="rounded border border-xeoo-primary/20 bg-xeoo-primary-soft px-1.5 py-0.2 text-[9px] font-extrabold text-xeoo-primary">
                        DA
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-xeoo-text">
                        {formatMetricScore(result.da)}
                      </span>
                      {result.da !== null && (
                        <span className="text-xs font-semibold text-xeoo-muted">
                          / 100
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-xeoo-surface-soft">
                      <div
                        className="h-full rounded-full bg-xeoo-primary transition-all duration-500"
                        style={{
                          width: `${result.da !== null ? Math.min(Math.max(result.da, 0), 100) : 0}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1.5 truncate text-[10px] text-xeoo-muted">
                      Predicts root domain ranking strength
                    </p>
                  </div>

                  {/* PAGE AUTHORITY */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                        Page Authority
                      </span>
                      <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400">
                        PA
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-xeoo-text">
                        {formatMetricScore(result.pa)}
                      </span>
                      {result.pa !== null && (
                        <span className="text-xs font-semibold text-xeoo-muted">
                          / 100
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-xeoo-surface-soft">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{
                          width: `${result.pa !== null ? Math.min(Math.max(result.pa, 0), 100) : 0}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1.5 truncate text-[10px] text-xeoo-muted">
                      Predicts specific URL ranking strength
                    </p>
                  </div>

                  {/* SPAM SCORE */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                        Spam Score
                      </span>
                      <Shield size={12} className="text-xeoo-muted" />
                    </div>

                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-xeoo-text">
                        {result.spam_score !== null && result.spam_score !== undefined
                          ? `${result.spam_score}%`
                          : "Not available"}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-xeoo-surface-soft">
                      <div
                        className={[
                          "h-full rounded-full transition-all duration-500",
                          result.spam_score !== null && result.spam_score !== undefined && result.spam_score > 30
                            ? "bg-amber-500"
                            : "bg-xeoo-muted",
                        ].join(" ")}
                        style={{
                          width: `${
                            result.spam_score !== null && result.spam_score !== undefined
                              ? Math.min(Math.max(result.spam_score, 0), 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>

                    <p className="mt-1.5 truncate text-[10px] text-xeoo-muted">
                      Subdomain spam penalty indicator
                    </p>
                  </div>

                  {/* LINKING ROOT DOMAINS */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                        Linking Domains
                      </span>
                      <Globe size={12} className="text-xeoo-muted" />
                    </div>

                    <div className="mt-2 text-2xl font-black text-xeoo-text">
                      {formatMetricCount(result.linking_root_domains)}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-xeoo-muted">
                      <span>Total Backlinks:</span>
                      <span className="font-mono font-bold text-xeoo-text">
                        {formatMetricCount(result.backlinks)}
                      </span>
                    </div>

                    <p className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      External pages pointing to domain
                    </p>
                  </div>
                </div>

                {/* ============================================================
                    TARGET DETAILS CARD
                ============================================================ */}
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Target Identification
                  </div>

                  <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {/* ROOT DOMAIN */}
                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-xeoo-muted">
                          Root Domain
                        </span>

                        <button
                          type="button"
                          onClick={() => void handleCopyText(result.domain)}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-xeoo-muted hover:text-xeoo-text"
                          aria-label={`Copy domain ${result.domain}`}
                        >
                          {copiedText === result.domain ? (
                            <>
                              <Check size={11} className="text-green-500" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="mt-1 truncate font-mono text-xs font-bold text-xeoo-text">
                        {result.domain}
                      </div>
                    </div>

                    {/* TARGET URL */}
                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-xeoo-muted">
                          Exact Target URL
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handleCopyText(result.target)}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-xeoo-muted hover:text-xeoo-text"
                            aria-label={`Copy URL ${result.target}`}
                          >
                            {copiedText === result.target ? (
                              <>
                                <Check size={11} className="text-green-500" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={11} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <a
                            href={result.target}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-xeoo-primary hover:underline"
                            title="Open URL in new tab"
                          >
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>

                      <div className="mt-1 truncate font-mono text-xs font-bold text-xeoo-text">
                        {result.target}
                      </div>
                    </div>
                  </div>

                  {result.checked_at && (
                    <div className="mt-2 text-right text-[10px] text-xeoo-muted">
                      Checked at: {new Date(result.checked_at).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* ============================================================
                    METRIC EXPLANATIONS
                ============================================================ */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft/30 p-3 text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-xeoo-text">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-xeoo-primary" />
                      <span>Domain Authority (DA)</span>
                    </div>
                    <p className="mt-1 leading-relaxed text-xeoo-muted">
                      A search engine ranking score developed by Moz that predicts how likely a root domain is to rank in SERP (search engine result pages). Scored from 1 to 100 on a logarithmic scale.
                    </p>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft/30 p-3 text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-xeoo-text">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Page Authority (PA)</span>
                    </div>
                    <p className="mt-1 leading-relaxed text-xeoo-muted">
                      A score predicting how well a specific page/URL will rank on search engine result pages. Unlike Domain Authority which evaluates the entire domain, PA evaluates the exact individual webpage.
                    </p>
                  </div>
                </div>

                {/* ============================================================
                    DISCLAIMER
                ============================================================ */}
                <div className="flex items-start gap-2.5 rounded-xl border border-xeoo-border bg-xeoo-surface-soft/40 p-3 text-[11px] text-xeoo-muted">
                  <Info size={14} className="mt-0.5 shrink-0 text-xeoo-muted" />
                  <p className="leading-relaxed">
                    DA and PA are proprietary third-party SEO metrics and are not official Google ranking factors or guarantees of search engine ranking performance. All metrics are retrieved from authorized providers without alteration.
                  </p>
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

