import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Globe,
  Info,
  LoaderCircle,
  Network,
  Search,
  SlidersHorizontal,
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
  normalizeIpInput,
  runReverseIpLookup,
  validateIpInput,
  type ReverseIpData,
  type ScanStatus,
} from "./reverseIpLookupLogic";

type FilterKey = "ALL";

export default function ReverseIpLookup() {
  const [ipInput, setIpInput] = useState("");
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [result, setResult] = useState<ReverseIpData | null>(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterKey>("ALL");
  const [searchDomain, setSearchDomain] = useState("");

  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const ipInputId = useId();

  const abortControllerRef = useRef<AbortController | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  /*
   * Lock page scrolling while details modal is open.
   *
   * Important:
   * - Do NOT change body position.
   * - Do NOT change window scroll position.
   * - Do NOT call window.scrollTo().
   * - Keep the current page position untouched.
   * - Only the modal content can scroll.
   */
  useEffect(() => {
    if (!selectedDomain) {
      return;
    }

    const html = document.documentElement;
    const body = document.body;

    const previousHtmlOverflow = html.style.overflow;
    const previousHtmlOverscrollBehavior = html.style.overscrollBehavior;

    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscrollBehavior = body.style.overscrollBehavior;

    const previousBodyPaddingRight = body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - html.clientWidth;

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const preventBackgroundScroll = (event: Event) => {
      const target = event.target;

      if (target instanceof Node && modalRef.current?.contains(target)) {
        return;
      }

      event.preventDefault();
    };

    const preventEscapeClose = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
      }
    };

    document.addEventListener("wheel", preventBackgroundScroll, {
      passive: false,
    });

    document.addEventListener("touchmove", preventBackgroundScroll, {
      passive: false,
    });

    document.addEventListener("keydown", preventEscapeClose);

    return () => {
      document.removeEventListener("wheel", preventBackgroundScroll);
      document.removeEventListener("touchmove", preventBackgroundScroll);
      document.removeEventListener("keydown", preventEscapeClose);

      html.style.overflow = previousHtmlOverflow;
      html.style.overscrollBehavior = previousHtmlOverscrollBehavior;

      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscrollBehavior;

      body.style.paddingRight = previousBodyPaddingRight;
    };
  }, [selectedDomain]);

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

  const handleLookup = async () => {
    const rawInput = ipInput;
    const validation = validateIpInput(rawInput);

    if (!validation.valid) {
      const message = validation.error ?? "Please enter a valid IP address.";
      setError(message);

      if (validation.isXss) {
        await showWarning(
          "WARNING • XSS DETECTED • NICE TRY ❤️",
          message,
        );
      } else {
        await showError("Validation Error", message);
      }

      return;
    }

    setError("");
    setScanStatus("scanning");
    setResult(null);
    setSelectedDomain(null);
    setStatusFilter("ALL");
    setSearchDomain("");

    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const cleanIp = normalizeIpInput(rawInput);
      const data = await runReverseIpLookup(cleanIp, controller.signal);

      setResult(data);
      setScanStatus("completed");

      if (data.domains_found > 0) {
        await showSuccess(
          "Lookup Completed",
          `Found ${data.domains_found} domain(s) for ${data.ip}.`,
        );
      } else {
        await showSuccess(
          "Lookup Completed",
          `No domains found for ${data.ip}.`,
        );
      }
    } catch (lookupErr) {
      if (lookupErr instanceof DOMException && lookupErr.name === "AbortError") {
        return;
      }

      const message =
        lookupErr instanceof Error
          ? lookupErr.message
          : "Unable to complete reverse IP lookup. Please try again later.";

      setError(message);
      setScanStatus("error");

      await showError("Lookup Request Failed", message);
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (scanStatus !== "scanning") {
      void handleLookup();
    }
  };

  const filteredDomains = useMemo(() => {
    if (!result) {
      return [];
    }

    const query = searchDomain.trim().toLowerCase();
    if (!query) {
      return result.domains;
    }

    return result.domains.filter((domain) =>
      domain.toLowerCase().includes(query),
    );
  }, [result, searchDomain]);

  const scanStatusMeta = useMemo(() => {
    switch (scanStatus) {
      case "scanning":
        return {
          label: "Looking up...",
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
            {/* HEADER */}
            <div className="flex items-center justify-between gap-3 border-b border-xeoo-border px-3 py-2.5 sm:px-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-xeoo-primary-soft text-xeoo-primary">
                  <Network size={15} strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold text-xeoo-text sm:text-sm">
                    REVERSE IP LOOKUP
                  </h1>

                  <p className="truncate text-[11px] text-xeoo-muted">
                    Discover domains and hostnames associated with an IP address.
                  </p>
                </div>
              </div>

              <span
                className={[
                  "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-bold",
                  scanStatusMeta.badge,
                ].join(" ")}
              >
                <span
                  className={[
                    "h-1.5 w-1.5 rounded-full bg-white",
                    scanStatus === "scanning" ? "animate-pulse" : "",
                  ].join(" ")}
                />
                {scanStatusMeta.label}
              </span>
            </div>

            {/* SEARCH */}
            <div className="p-3 sm:p-4">
              <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
                <div>
                  <label
                    htmlFor={ipInputId}
                    className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted"
                  >
                    IP Address
                  </label>

                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                    <div className="relative min-w-0 flex-1">
                      <Globe
                        size={13}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xeoo-muted"
                      />

                      <input
                        id={ipInputId}
                        type="text"
                        value={ipInput}
                        onChange={(event) => {
                          setIpInput(event.target.value);

                          if (error) {
                            setError("");
                          }
                        }}
                        placeholder="e.g. 8.8.8.8"
                        autoComplete="off"
                        spellCheck={false}
                        disabled={scanStatus === "scanning"}
                        className="h-9 w-full rounded-lg border border-xeoo-border bg-xeoo-bg pl-8 pr-8 text-[11px] font-medium text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:bg-xeoo-surface focus:ring-2 focus:ring-xeoo-primary/15 disabled:cursor-not-allowed disabled:opacity-60 sm:h-10"
                      />

                      {ipInput && (
                        <button
                          type="button"
                          onClick={() => setIpInput("")}
                          className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-0.5 text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                          title="Clear input"
                          aria-label="Clear IP input"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={scanStatus === "scanning" || !ipInput.trim()}
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-4 text-[11px] font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:px-5"
                    >
                      {scanStatus === "scanning" ? (
                        <>
                          <LoaderCircle size={14} className="animate-spin" />
                          <span>Looking up...</span>
                        </>
                      ) : (
                        <>
                          <Search size={14} />
                          <span>Lookup</span>
                        </>
                      )}
                    </button>
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
                  <Network size={14} className="shrink-0 text-xeoo-muted" />

                  <div className="min-w-0">
                    <h2 className="truncate text-xs font-extrabold text-xeoo-text">
                      LOOKUP RESULTS
                    </h2>

                    <p className="truncate text-[12px] text-xeoo-muted">
                      {result.ip} · {result.domains_found} domains found
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
                    OVERVIEW SUMMARY CARDS
                ============================================================ */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {/* IP ADDRESS */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      IP Address
                    </div>

                    <div
                      className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text"
                      title={result.ip}
                    >
                      {result.ip}
                    </div>

                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      Target IP
                    </div>
                  </div>

                  {/* PTR / HOSTNAME */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      PTR / Hostname
                    </div>

                    <div
                      className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text"
                      title={result.ptr ?? "No PTR Record"}
                    >
                      {result.ptr ?? "No PTR Record"}
                    </div>

                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      Reverse DNS record
                    </div>
                  </div>

                  {/* DOMAINS FOUND */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Domains Found
                    </div>

                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        {result.domains_found}
                      </span>
                      <span className="text-[11px] text-xeoo-muted">
                        associated hosts
                      </span>
                    </div>

                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Discovered domains
                    </div>
                  </div>

                  {/* SOURCE */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Source
                    </div>

                    <div
                      className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text"
                      title={result.source}
                    >
                      {result.source}
                    </div>

                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Provider intelligence
                    </div>
                  </div>
                </div>

                {/* ============================================================
                    DOMAINS TABLE & FILTERS
                ============================================================ */}
                <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
                  {/* TOOLBAR */}
                  <div className="flex flex-col gap-2 border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-3.5">
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal size={13} className="text-xeoo-muted" />

                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                          Associated Domains
                        </div>

                        <div className="mt-0.5 text-xs font-extrabold text-xeoo-text">
                          {filteredDomains.length} Results
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* FILTER SEARCH INPUT */}
                      {result.domains.length > 5 && (
                        <div className="relative">
                          <Search
                            size={12}
                            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xeoo-muted"
                          />
                          <input
                            type="text"
                            value={searchDomain}
                            onChange={(event) =>
                              setSearchDomain(event.target.value)
                            }
                            placeholder="Filter domains..."
                            className="h-8 w-36 rounded-md border border-xeoo-border bg-xeoo-surface pl-7 pr-2.5 text-[11px] text-xeoo-text outline-none placeholder:text-xeoo-muted focus:border-xeoo-primary sm:w-48"
                          />
                        </div>
                      )}

                      {/* FILTER BUTTON */}
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter("ALL");
                          setSearchDomain("");
                        }}
                        className={[
                          "inline-flex h-8 items-center justify-center rounded-md border px-2.5 text-[11px] font-bold transition-colors active:scale-[0.98]",
                          statusFilter === "ALL" && !searchDomain
                            ? "border-xeoo-text bg-xeoo-text text-xeoo-surface shadow-xs"
                            : "border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft hover:text-xeoo-text",
                        ].join(" ")}
                      >
                        All ({result.domains_found})
                      </button>
                    </div>
                  </div>

                  {/* DESKTOP TABLE */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[600px] border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-xeoo-surface-soft text-[11px] font-bold text-xeoo-text">
                          <th className="w-16 border-b border-r border-xeoo-border px-3.5 py-2.5 text-center">
                            #
                          </th>

                          <th className="border-b border-r border-xeoo-border px-3.5 py-2.5">
                            DOMAIN / HOSTNAME
                          </th>

                          <th className="w-32 border-b border-xeoo-border px-3.5 py-2.5 text-center">
                            ACTIONS
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredDomains.length === 0 ? (
                          <tr>
                            <td
                              colSpan={3}
                              className="border-b border-xeoo-border px-3.5 py-8 text-center text-[11px] text-xeoo-muted"
                            >
                              {result.domains.length === 0
                                ? "No domains were found for this IP address."
                                : "No domains match the search query."}
                            </td>
                          </tr>
                        ) : (
                          filteredDomains.map((domain, index) => {
                            const zebraClass =
                              index % 2 === 0
                                ? "bg-xeoo-surface"
                                : "bg-xeoo-surface-soft/35";

                            return (
                              <tr
                                key={domain}
                                className={[
                                  zebraClass,
                                  "transition-colors hover:bg-xeoo-primary-soft/35 dark:hover:bg-xeoo-primary-soft/10",
                                ].join(" ")}
                              >
                                {/* ROW NUMBER */}
                                <td className="border-b border-r border-xeoo-border px-3.5 py-2.5 text-center align-middle font-mono text-[11px] text-xeoo-muted">
                                  {index + 1}
                                </td>

                                {/* DOMAIN */}
                                <td className="border-b border-r border-xeoo-border px-3.5 py-2.5 align-middle">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="max-w-[420px] truncate font-mono text-[11px] font-bold text-xeoo-text"
                                      title={domain}
                                    >
                                      {domain}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() => void handleCopyText(domain)}
                                      className="inline-flex items-center justify-center rounded p-1 text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                                      title="Copy domain"
                                      aria-label={`Copy domain ${domain}`}
                                    >
                                      {copiedText === domain ? (
                                        <Check
                                          size={11}
                                          className="text-green-600 dark:text-green-400"
                                        />
                                      ) : (
                                        <Copy size={11} />
                                      )}
                                    </button>

                                    <a
                                      href={`https://${encodeURIComponent(domain)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center justify-center rounded p-1 text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-primary"
                                      title={`Visit https://${domain}`}
                                    >
                                      <ExternalLink size={11} />
                                    </a>
                                  </div>
                                </td>

                                {/* ACTIONS */}
                                <td className="whitespace-nowrap border-b border-xeoo-border px-3.5 py-2.5 text-center align-middle">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedDomain(domain)}
                                    className="inline-flex items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-[10px] font-bold text-xeoo-text transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-95"
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE VIEW */}
                  <div className="divide-y divide-xeoo-border md:hidden">
                    {filteredDomains.length === 0 ? (
                      <div className="px-3.5 py-8 text-center text-[11px] text-xeoo-muted">
                        {result.domains.length === 0
                          ? "No domains were found for this IP address."
                          : "No domains match the search query."}
                      </div>
                    ) : (
                      filteredDomains.map((domain, index) => (
                        <div
                          key={domain}
                          className="space-y-2 p-3 transition-colors hover:bg-xeoo-surface-soft/30"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="rounded-md border border-xeoo-border bg-xeoo-surface-soft px-1.5 py-0.5 font-mono text-[9px] font-bold text-xeoo-muted">
                                #{index + 1}
                              </span>

                              <div
                                className="truncate font-mono text-[11px] font-bold text-xeoo-text"
                                title={domain}
                              >
                                {domain}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => void handleCopyText(domain)}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-xeoo-muted hover:text-xeoo-text"
                              >
                                {copiedText === domain ? (
                                  <>
                                    <Check
                                      size={11}
                                      className="text-green-500"
                                    />
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
                                href={`https://${encodeURIComponent(domain)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-xeoo-muted hover:text-xeoo-primary"
                              >
                                <ExternalLink size={11} />
                                <span>Open</span>
                              </a>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedDomain(domain)}
                              className="inline-flex items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-[10px] font-bold text-xeoo-text transition hover:bg-xeoo-surface-soft active:scale-95"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* ============================================================
                    DISCLAIMER
                ============================================================ */}
                <div className="flex items-start gap-2.5 rounded-xl border border-xeoo-border bg-xeoo-surface-soft/40 p-3 text-[11px] text-xeoo-muted">
                  <Info size={14} className="mt-0.5 shrink-0 text-xeoo-muted" />
                  <p className="leading-relaxed">
                    Reverse IP results are based on third-party datasets and may be
                    incomplete or outdated. A listed domain does not necessarily mean
                    it is currently hosted on this IP address. Reverse IP lookup is
                    for informational and public reconnaissance purposes only.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* ====================================================================
          DETAILS MODAL
      ==================================================================== */}
      {selectedDomain && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reverse-ip-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs sm:p-4"
        >
          <div
            ref={modalRef}
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-xeoo-border bg-xeoo-surface shadow-2xl"
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-xeoo-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Network size={16} className="text-xeoo-primary" />
                <h3
                  id="reverse-ip-modal-title"
                  className="text-xs font-bold uppercase tracking-wider text-xeoo-text sm:text-sm"
                >
                  Domain Details
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDomain(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                title="Close modal"
                aria-label="Close details modal"
              >
                <X size={14} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="space-y-4 overflow-y-auto p-4 text-xs">
              {/* DOMAIN */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Domain / Hostname
                  </span>

                  <button
                    type="button"
                    onClick={() => void handleCopyText(selectedDomain)}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-xeoo-muted hover:text-xeoo-text"
                  >
                    {copiedText === selectedDomain ? (
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

                <div className="mt-1 break-all font-mono text-sm font-bold text-xeoo-text">
                  {selectedDomain}
                </div>
              </div>

              {/* IP ADDRESS */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                  IP Address
                </span>

                <div className="mt-1 font-mono text-xs font-bold text-xeoo-text">
                  {result?.ip}
                </div>
              </div>

              {/* PTR / HOSTNAME */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                  PTR / Reverse DNS Hostname
                </span>

                <div className="mt-1 font-mono text-xs font-bold text-xeoo-text">
                  {result?.ptr ?? "No PTR Record"}
                </div>
              </div>

              {/* DISCOVERY SOURCE */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                  Data Source
                </span>

                <div className="mt-1 text-[11px] text-xeoo-text">
                  {result?.source ?? "Reverse IP Database"}
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-end border-t border-xeoo-border bg-xeoo-surface-soft/40 px-4 py-3">
              <button
                type="button"
                onClick={() => setSelectedDomain(null)}
                className="inline-flex items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface px-4 py-1.5 text-xs font-semibold text-xeoo-text transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

