import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Globe,
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

import Footer from "../../components/Footer";
import { showError, showSuccess } from "../../alert";
import {
  getStatusBadgeClass,
  runSubdomainScan,
  validateTargetInput,
  type ScanStatus,
  type SubdomainItem,
  type SubdomainScanResult,
} from "./subdomainScannerLogic";

type FilterKey = "ALL" | "RESOLVED" | "UNRESOLVED" | "ERROR";

export default function SubdomainScanner() {
  const [targetInput, setTargetInput] = useState("");
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [result, setResult] = useState<SubdomainScanResult | null>(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterKey>("ALL");

  const [selectedSubdomain, setSelectedSubdomain] =
    useState<SubdomainItem | null>(null);

  const [copiedText, setCopiedText] = useState<string | null>(null);

  const targetInputId = useId();

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
    if (!selectedSubdomain) {
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
  }, [selectedSubdomain]);

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

  const handleScan = async () => {
    const rawTarget = targetInput;
    const validation = validateTargetInput(rawTarget);

    if (!validation.valid) {
      const message = validation.error ?? "Please enter a valid target domain.";
      setError(message);
      await showError("Validation Error", message);
      return;
    }

    setError("");
    setScanStatus("scanning");
    setResult(null);
    setSelectedSubdomain(null);
    setStatusFilter("ALL");

    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const scanData = await runSubdomainScan(rawTarget, controller.signal);

      setResult(scanData);
      setScanStatus("completed");

      await showSuccess(
        "Scan Completed",
        `Discovered ${scanData.discovered} subdomains (${scanData.resolved} resolved).`,
      );
    } catch (scanErr) {
      if (scanErr instanceof DOMException && scanErr.name === "AbortError") {
        return;
      }

      const message =
        scanErr instanceof Error
          ? scanErr.message
          : "Failed to execute subdomain scan.";

      setError(message);
      setScanStatus("error");

      await showError("Scan Request Failed", message);
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (scanStatus !== "scanning") {
      void handleScan();
    }
  };

  const filteredResults = useMemo(() => {
    if (!result) {
      return [];
    }

    if (statusFilter === "ALL") {
      return result.results;
    }

    return result.results.filter((item) => item.status === statusFilter);
  }, [result, statusFilter]);

  const scanStatusMeta = useMemo(() => {
    switch (scanStatus) {
      case "scanning":
        return {
          label: "Scanning",
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

  const getFilterClass = (key: FilterKey, active: boolean): string => {
    if (active) {
      switch (key) {
        case "RESOLVED":
          return "border-green-600 bg-green-600 text-white shadow-xs dark:border-green-500 dark:bg-green-600 dark:text-white";

        case "UNRESOLVED":
          return "border-orange-600 bg-orange-600 text-white shadow-xs dark:border-orange-500 dark:bg-orange-600 dark:text-white";

        case "ERROR":
          return "border-red-600 bg-red-600 text-white shadow-xs dark:border-red-500 dark:bg-red-600 dark:text-white";

        case "ALL":
        default:
          return "border-xeoo-text bg-xeoo-text text-xeoo-surface shadow-xs";
      }
    }

    switch (key) {
      case "RESOLVED":
        return "border-green-500/50 bg-xeoo-surface text-green-700 hover:border-green-600 hover:bg-green-50 dark:border-green-500/40 dark:bg-xeoo-surface dark:text-green-300 dark:hover:bg-green-950/30";

      case "UNRESOLVED":
        return "border-orange-500/50 bg-xeoo-surface text-orange-700 hover:border-orange-600 hover:bg-orange-50 dark:border-orange-500/40 dark:bg-xeoo-surface dark:text-orange-300 dark:hover:bg-orange-950/30";

      case "ERROR":
        return "border-red-500/50 bg-xeoo-surface text-red-700 hover:border-red-600 hover:bg-red-50 dark:border-red-500/40 dark:bg-xeoo-surface dark:text-red-300 dark:hover:bg-red-950/30";

      case "ALL":
      default:
        return "border-xeoo-border bg-xeoo-surface text-xeoo-text hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft";
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-xeoo-bg text-xeoo-text">
      <main className="flex-1 px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto w-full max-w-6xl space-y-3">
          {/* ================================================================
              SCANNER WORKSPACE
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
                    SUBDOMAIN SCANNER
                  </h1>

                  <p className="truncate text-[11px] text-xeoo-muted">
                    Discover public subdomains and validate their DNS records.
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
                    htmlFor={targetInputId}
                    className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted"
                  >
                    Target
                  </label>

                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                    <div className="relative min-w-0 flex-1">
                      <Globe
                        size={13}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xeoo-muted"
                      />

                      <input
                        id={targetInputId}
                        type="text"
                        value={targetInput}
                        onChange={(event) => {
                          setTargetInput(event.target.value);

                          if (error) {
                            setError("");
                          }
                        }}
                        placeholder="example.com"
                        autoComplete="off"
                        spellCheck={false}
                        disabled={scanStatus === "scanning"}
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
                      disabled={
                        scanStatus === "scanning" || !targetInput.trim()
                      }
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-4 text-[11px] font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:px-5"
                    >
                      {scanStatus === "scanning" ? (
                        <>
                          <LoaderCircle size={14} className="animate-spin" />
                          <span>Scanning...</span>
                        </>
                      ) : (
                        <>
                          <Search size={14} />
                          <span>Scan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* ERROR */}
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
                      RESULTS
                    </h2>

                    <p className="truncate text-[12px] text-xeoo-muted">
                      {result.target} · {result.discovered} discovered ·{" "}
                      {result.resolved} resolved · {result.unresolved}{" "}
                      unresolved
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
                  {/* TARGET */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Target Domain
                    </div>

                    <div
                      className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text"
                      title={result.target}
                    >
                      {result.target}
                    </div>

                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      Source: {result.source}
                    </div>
                  </div>

                  {/* DISCOVERED */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Discovered
                    </div>

                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-sm font-extrabold text-xeoo-text">
                        {result.discovered}
                      </span>
                      <span className="text-[11px] text-xeoo-muted">hosts</span>
                    </div>

                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Total candidate hostnames
                    </div>
                  </div>

                  {/* RESOLVED */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Resolved
                    </div>

                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        {result.resolved}
                      </span>
                      <span className="text-[11px] text-xeoo-muted">
                        / {result.discovered}
                      </span>
                    </div>

                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Active with DNS records
                    </div>
                  </div>

                  {/* UNRESOLVED */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Unresolved
                    </div>

                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                        {result.unresolved}
                      </span>
                      <span className="text-[11px] text-xeoo-muted">
                        {result.errors > 0
                          ? `· ${result.errors} errors`
                          : "hosts"}
                      </span>
                    </div>

                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      No matching DNS records
                    </div>
                  </div>
                </div>

                {/* ============================================================
                    SUBDOMAIN TABLE & FILTERS
                ============================================================ */}
                <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
                  {/* TOOLBAR */}
                  <div className="flex flex-col gap-2 border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-3.5">
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal
                        size={13}
                        className="text-xeoo-muted"
                      />

                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                          Discovered Subdomains
                        </div>

                        <div className="mt-0.5 text-xs font-extrabold text-xeoo-text">
                          {filteredResults.length} Results
                        </div>
                      </div>
                    </div>

                    {/* FILTER BUTTONS */}
                    <div className="flex flex-wrap items-center gap-1">
                      {[
                        {
                          key: "ALL" as const,
                          label: `All (${result.discovered})`,
                        },
                        {
                          key: "RESOLVED" as const,
                          label: `Resolved (${result.resolved})`,
                        },
                        {
                          key: "UNRESOLVED" as const,
                          label: `Unresolved (${result.unresolved})`,
                        },
                        ...(result.errors > 0
                          ? [
                              {
                                key: "ERROR" as const,
                                label: `Errors (${result.errors})`,
                              },
                            ]
                          : []),
                      ].map((filter) => (
                        <button
                          key={filter.key}
                          type="button"
                          onClick={() => setStatusFilter(filter.key)}
                          className={[
                            "inline-flex h-8 items-center justify-center rounded-md border px-2.5 text-[11px] font-bold transition-colors active:scale-[0.98]",
                            getFilterClass(
                              filter.key,
                              statusFilter === filter.key,
                            ),
                          ].join(" ")}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* DESKTOP TABLE */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[760px] border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-xeoo-surface-soft text-[11px] font-bold text-xeoo-text">
                          <th className="border-b border-r border-xeoo-border px-3.5 py-2.5 text-center">
                            HOSTNAME
                          </th>

                          <th className="border-b border-r border-xeoo-border px-3.5 py-2.5 text-center">
                            STATUS
                          </th>

                          <th className="border-b border-r border-xeoo-border px-3.5 py-2.5 text-center">
                            A RECORDS
                          </th>

                          <th className="border-b border-r border-xeoo-border px-3.5 py-2.5 text-center">
                            AAAA (IPv6)
                          </th>

                          <th className="border-b border-r border-xeoo-border px-3.5 py-2.5 text-center">
                            CNAME
                          </th>

                          <th className="border-b border-xeoo-border px-3.5 py-2.5 text-center">
                            ACTIONS
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredResults.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="border-b border-xeoo-border px-3.5 py-8 text-center text-[11px] text-xeoo-muted"
                            >
                              No subdomains match the selected filter.
                            </td>
                          </tr>
                        ) : (
                          filteredResults.map((item, rowIndex) => {
                            const badge = getStatusBadgeClass(item.status);
                            const zebraClass =
                              rowIndex % 2 === 0
                                ? "bg-xeoo-surface"
                                : "bg-xeoo-surface-soft/35";

                            return (
                              <tr
                                key={item.hostname}
                                className={[
                                  zebraClass,
                                  "transition-colors hover:bg-xeoo-primary-soft/35 dark:hover:bg-xeoo-primary-soft/10",
                                  item.status === "RESOLVED"
                                    ? "shadow-[inset_3px_0_0_0_rgb(34_197_94)]"
                                    : "",
                                ].join(" ")}
                              >
                                {/* HOSTNAME */}
                                <td className="border-b border-r border-xeoo-border px-3.5 py-2.5 align-middle">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="max-w-[240px] truncate font-mono text-[11px] font-bold text-xeoo-text"
                                      title={item.hostname}
                                    >
                                      {item.hostname}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleCopyText(item.hostname)
                                      }
                                      className="inline-flex items-center justify-center rounded p-1 text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                                      title="Copy hostname"
                                      aria-label={`Copy hostname ${item.hostname}`}
                                    >
                                      {copiedText === item.hostname ? (
                                        <Check
                                          size={11}
                                          className="text-green-600 dark:text-green-400"
                                        />
                                      ) : (
                                        <Copy size={11} />
                                      )}
                                    </button>

                                    {item.status === "RESOLVED" && (
                                      <a
                                        href={`https://${item.hostname}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center rounded p-1 text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-primary"
                                        title={`Visit https://${item.hostname}`}
                                      >
                                        <ExternalLink size={11} />
                                      </a>
                                    )}
                                  </div>
                                </td>

                                {/* STATUS */}
                                <td className="whitespace-nowrap border-b border-r border-xeoo-border px-3.5 py-2.5 align-middle text-center">
                                  <span
                                    className={[
                                      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold",
                                      badge.container,
                                    ].join(" ")}
                                  >
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${badge.dot}`}
                                    />
                                    {item.status}
                                  </span>
                                </td>

                                {/* A RECORDS */}
                                <td className="border-b border-r border-xeoo-border px-3.5 py-2.5 align-middle">
                                  {item.a.length > 0 ? (
                                    <div className="max-w-[180px] truncate font-mono text-[11px] text-xeoo-text">
                                      {item.a.join(", ")}
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-xeoo-muted">
                                      -
                                    </span>
                                  )}
                                </td>

                                {/* AAAA RECORDS */}
                                <td className="border-b border-r border-xeoo-border px-3.5 py-2.5 align-middle">
                                  {item.aaaa.length > 0 ? (
                                    <div className="max-w-[150px] truncate font-mono text-[11px] text-xeoo-text">
                                      {item.aaaa.join(", ")}
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-xeoo-muted">
                                      -
                                    </span>
                                  )}
                                </td>

                                {/* CNAME */}
                                <td className="border-b border-r border-xeoo-border px-3.5 py-2.5 align-middle">
                                  {item.cname.length > 0 ? (
                                    <div className="max-w-[150px] truncate font-mono text-[11px] text-xeoo-text">
                                      {item.cname.join(", ")}
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-xeoo-muted">
                                      -
                                    </span>
                                  )}
                                </td>

                                {/* ACTIONS */}
                                <td className="whitespace-nowrap border-b border-xeoo-border px-3.5 py-2.5 text-center align-middle">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedSubdomain(item)}
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
                    {filteredResults.length === 0 ? (
                      <div className="px-3.5 py-8 text-center text-[11px] text-xeoo-muted">
                        No subdomains match the selected filter.
                      </div>
                    ) : (
                      filteredResults.map((item) => {
                        const badge = getStatusBadgeClass(item.status);

                        return (
                          <div
                            key={item.hostname}
                            className="space-y-2 p-3 transition-colors hover:bg-xeoo-surface-soft/30"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div
                                  className="truncate font-mono text-[11px] font-bold text-xeoo-text"
                                  title={item.hostname}
                                >
                                  {item.hostname}
                                </div>
                              </div>

                              <span
                                className={[
                                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-bold",
                                  badge.container,
                                ].join(" ")}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${badge.dot}`}
                                />
                                {item.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 gap-1 text-[11px]">
                              {item.a.length > 0 && (
                                <div className="flex items-baseline gap-1">
                                  <span className="w-12 shrink-0 text-[10px] font-bold text-xeoo-muted">
                                    A:
                                  </span>
                                  <span className="truncate font-mono text-xeoo-text">
                                    {item.a.join(", ")}
                                  </span>
                                </div>
                              )}

                              {item.aaaa.length > 0 && (
                                <div className="flex items-baseline gap-1">
                                  <span className="w-12 shrink-0 text-[10px] font-bold text-xeoo-muted">
                                    AAAA:
                                  </span>
                                  <span className="truncate font-mono text-xeoo-text">
                                    {item.aaaa.join(", ")}
                                  </span>
                                </div>
                              )}

                              {item.cname.length > 0 && (
                                <div className="flex items-baseline gap-1">
                                  <span className="w-12 shrink-0 text-[10px] font-bold text-xeoo-muted">
                                    CNAME:
                                  </span>
                                  <span className="truncate font-mono text-xeoo-text">
                                    {item.cname.join(", ")}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <button
                                type="button"
                                onClick={() =>
                                  void handleCopyText(item.hostname)
                                }
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-xeoo-muted hover:text-xeoo-text"
                              >
                                {copiedText === item.hostname ? (
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
                                    <span>Copy Host</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedSubdomain(item)}
                                className="inline-flex items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-[10px] font-bold text-xeoo-text transition hover:bg-xeoo-surface-soft active:scale-95"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* ====================================================================
          DETAILS MODAL
      ==================================================================== */}
      {selectedSubdomain && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="subdomain-modal-title"
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
                  id="subdomain-modal-title"
                  className="text-xs font-bold uppercase tracking-wider text-xeoo-text sm:text-sm"
                >
                  Subdomain Details
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSubdomain(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                title="Close modal"
                aria-label="Close details modal"
              >
                <X size={14} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="space-y-4 overflow-y-auto p-4 text-xs">
              {/* HOSTNAME */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Hostname
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      void handleCopyText(selectedSubdomain.hostname)
                    }
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-xeoo-muted hover:text-xeoo-text"
                  >
                    {copiedText === selectedSubdomain.hostname ? (
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
                  {selectedSubdomain.hostname}
                </div>
              </div>

              {/* STATUS */}
              <div className="flex items-center justify-between rounded-xl border border-xeoo-border bg-xeoo-surface p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                  DNS Resolution Status
                </span>

                <span
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold",
                    getStatusBadgeClass(selectedSubdomain.status).container,
                  ].join(" ")}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${getStatusBadgeClass(selectedSubdomain.status).dot}`}
                  />
                  {selectedSubdomain.status}
                </span>
              </div>

              {/* A RECORDS */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                  A Records (IPv4)
                </div>

                <div className="mt-1.5">
                  {selectedSubdomain.a.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSubdomain.a.map((ip) => (
                        <span
                          key={ip}
                          className="rounded-md border border-xeoo-border bg-xeoo-surface-soft px-2 py-0.5 font-mono text-[11px] text-xeoo-text"
                        >
                          {ip}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-xeoo-muted">
                      No IPv4 (A) records discovered.
                    </span>
                  )}
                </div>
              </div>

              {/* AAAA RECORDS */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                  AAAA Records (IPv6)
                </div>

                <div className="mt-1.5">
                  {selectedSubdomain.aaaa.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSubdomain.aaaa.map((ip6) => (
                        <span
                          key={ip6}
                          className="rounded-md border border-xeoo-border bg-xeoo-surface-soft px-2 py-0.5 font-mono text-[11px] text-xeoo-text"
                        >
                          {ip6}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-xeoo-muted">
                      No IPv6 (AAAA) records discovered.
                    </span>
                  )}
                </div>
              </div>

              {/* CNAME RECORDS */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                  CNAME Target
                </div>

                <div className="mt-1.5">
                  {selectedSubdomain.cname.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSubdomain.cname.map((alias) => (
                        <span
                          key={alias}
                          className="rounded-md border border-xeoo-border bg-xeoo-surface-soft px-2 py-0.5 font-mono text-[11px] text-xeoo-text"
                        >
                          {alias}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-xeoo-muted">
                      No CNAME records discovered.
                    </span>
                  )}
                </div>
              </div>

              {/* DISCOVERY SOURCE */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                  Discovery Source
                </div>

                <div className="mt-1 text-[11px] text-xeoo-text">
                  Certificate Transparency (Public Log Discovery)
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-end border-t border-xeoo-border bg-xeoo-surface-soft/40 px-4 py-3">
              <button
                type="button"
                onClick={() => setSelectedSubdomain(null)}
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
