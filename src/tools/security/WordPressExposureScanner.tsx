import {
  AlertTriangle,
  ExternalLink,
  Globe,
  LoaderCircle,
  Search,
  ShieldCheck,
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
  runWordPressScan,
  validateTargetInput,
  type EndpointCheck,
  type ScanResult,
  type ScanStatus,
} from "./wordpressExposureScannerLogic";

type FilterKey = "ALL" | "DETECTED" | "BLOCKED" | "NOT FOUND" | "ERRORS";

export default function WordPressExposureScanner() {
  const [targetUrl, setTargetUrl] = useState("");
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");

  const [result, setResult] = useState<ScanResult | null>(null);

  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState<FilterKey>("ALL");

  const [selectedEndpoint, setSelectedEndpoint] =
    useState<EndpointCheck | null>(null);

  const targetInputId = useId();

  const abortControllerRef = useRef<AbortController | null>(null);

  const endpointModalRef = useRef<HTMLDivElement | null>(null);

  /*
   * Lock the page while endpoint signature modal is open.
   *
   * Important:
   * - Do not use body position: fixed.
   * - Do not change window.scrollTo().
   * - Keep current page position untouched.
   * - Only the modal content is scrollable.
   */
  useEffect(() => {
    if (!selectedEndpoint) {
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

      if (
        target instanceof Node &&
        endpointModalRef.current?.contains(target)
      ) {
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
  }, [selectedEndpoint]);

  const handleScan = async () => {
    const rawTarget = targetUrl;

    const validation = validateTargetInput(rawTarget);

    if (!validation.valid) {
      const message = validation.error ?? "Please enter a valid target URL.";

      setError(message);

      await showError("Validation Error", message);

      return;
    }

    setError("");
    setScanStatus("scanning");
    setResult(null);
    setSelectedEndpoint(null);
    setStatusFilter("ALL");

    abortControllerRef.current?.abort();

    const controller = new AbortController();

    abortControllerRef.current = controller;

    try {
      const scanData = await runWordPressScan(rawTarget, controller.signal);

      setResult(scanData);
      setScanStatus("completed");

      await showSuccess(
        "Scan Completed",
        `Assessment: ${scanData.assessment_label}`,
      );
    } catch (scanErr) {
      if (scanErr instanceof DOMException && scanErr.name === "AbortError") {
        return;
      }

      const message =
        scanErr instanceof Error ? scanErr.message : "Failed to execute scan.";

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

  const filteredEndpoints = useMemo(() => {
    if (!result) {
      return [];
    }

    if (statusFilter === "ALL") {
      return result.upload_endpoints;
    }

    if (statusFilter === "ERRORS") {
      return result.upload_endpoints.filter((endpoint) =>
        [
          "TIMEOUT",
          "SSL ERROR",
          "CONNECTION ERROR",
          "SERVER ERROR",
          "ERROR",
        ].includes(endpoint.status),
      );
    }

    return result.upload_endpoints.filter(
      (endpoint) => endpoint.status === statusFilter,
    );
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
            "border-slate-500 bg-black-500 text-white dark:border-slate-400 dark:bg-slate-600 dark:text-white",
        };
    }
  }, [scanStatus]);

  /*
   * Filter buttons styled consistently with Admin Finder.
   */
  const getFilterClass = (key: FilterKey, active: boolean): string => {
    if (active) {
      switch (key) {
        case "DETECTED":
          return "border-red-600 bg-red-600 text-white shadow-xs dark:border-red-500 dark:bg-red-600 dark:text-white";

        case "BLOCKED":
          return "border-orange-500 bg-orange-500 text-white shadow-xs dark:border-orange-400 dark:bg-orange-500 dark:text-white";

        case "NOT FOUND":
          return "border-red-500 bg-red-500 text-white shadow-xs dark:border-red-400 dark:bg-red-500 dark:text-white";

        case "ERRORS":
          return "border-orange-600 bg-orange-600 text-white shadow-xs dark:border-orange-500 dark:bg-orange-600 dark:text-white";

        case "ALL":
        default:
          return "border-xeoo-text bg-xeoo-text text-xeoo-surface shadow-xs";
      }
    }

    switch (key) {
      case "DETECTED":
        return "border-red-500/50 bg-xeoo-surface text-red-700 hover:border-red-600 hover:bg-red-50 dark:border-red-500/40 dark:bg-xeoo-surface dark:text-red-300 dark:hover:bg-red-950/30";

      case "BLOCKED":
        return "border-orange-500/50 bg-xeoo-surface text-orange-700 hover:border-orange-600 hover:bg-orange-50 dark:border-orange-500/40 dark:bg-xeoo-surface dark:text-orange-300 dark:hover:bg-orange-950/30";

      case "NOT FOUND":
        return "border-red-500/50 bg-xeoo-surface text-red-700 hover:border-red-600 hover:bg-red-50 dark:border-red-500/40 dark:bg-xeoo-surface dark:text-red-300 dark:hover:bg-red-950/30";

      case "ERRORS":
        return "border-orange-500/50 bg-xeoo-surface text-orange-700 hover:border-orange-600 hover:bg-orange-50 dark:border-orange-500/40 dark:bg-xeoo-surface dark:text-orange-300 dark:hover:bg-orange-950/30";

      case "ALL":
      default:
        return "border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft";
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-xeoo-bg text-xeoo-muted">
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
                  <Globe size={15} strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold text-xeoo-text sm:text-sm">
                    WORDPRESS EXPOSURE SCANNER
                  </h1>

                  <p className="truncate text-[11px] text-xeoo-muted">
                    Detect publicly exposed WordPress endpoints.
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
                        value={targetUrl}
                        onChange={(event) => {
                          setTargetUrl(event.target.value);

                          if (error) {
                            setError("");
                          }
                        }}
                        placeholder="example.com or https://site.org"
                        autoComplete="off"
                        spellCheck={false}
                        disabled={scanStatus === "scanning"}
                        className="h-9 w-full rounded-lg border border-xeoo-border bg-xeoo-bg pl-8 pr-8 text-[11px] font-medium text-xeoo-muted outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:bg-xeoo-surface focus:ring-2 focus:ring-xeoo-primary/15 disabled:cursor-not-allowed disabled:opacity-60 sm:h-10"
                      />

                      {targetUrl && (
                        <button
                          type="button"
                          onClick={() => setTargetUrl("")}
                          className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-0.5 text-xeoo-muted transition hover:bg-xeoo-surface-soft"
                          title="Clear input"
                          aria-label="Clear target input"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={scanStatus === "scanning" || !targetUrl.trim()}
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
              RESULTS
          ================================================================ */}
          {result && (
            <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
              {/* RESULTS HEADER */}
              <div className="flex flex-col gap-2 border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <div className="flex min-w-0 items-center gap-1.5">
                  <ShieldCheck size={14} className="shrink-0 text-xeoo-muted" />

                  <div className="min-w-0">
                    <h2 className="truncate text-xs font-extrabold text-xeoo-muted">
                      RESULTS
                    </h2>

                    <p className="truncate text-[11px] text-xeoo-muted">
                      {result.target} · {result.upload_endpoints.length}{" "}
                      endpoint checks
                    </p>
                  </div>
                </div>

                <div
                  className="max-w-full truncate font-mono text-[11px] text-xeoo-muted"
                  title={result.active_url}
                >
                  {result.active_url}
                </div>
              </div>

              <div className="space-y-3 p-3 sm:p-3.5">
                {/* ============================================================
                    OVERVIEW
                ============================================================ */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {/* TARGET */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Target Domain
                    </div>

                    <div
                      className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-muted"
                      title={result.target}
                    >
                      {result.target}
                    </div>

                    <div
                      className="mt-0.5 truncate text-[10px] text-xeoo-muted"
                      title={result.active_url}
                    >
                      Active: {result.active_url}
                    </div>
                  </div>

                  {/* WORDPRESS */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      WordPress Platform
                    </div>

                    <div className="mt-1 flex items-center gap-1.5">
                      <span
                        className={[
                          "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-bold",
                          result.wordpress.detected
                            ? "border-blue-300 bg-blue-100 text-blue-900 dark:border-blue-600/40 dark:bg-blue-950/50 dark:text-blue-200"
                            : "border-xeoo-border bg-xeoo-surface-soft text-xeoo-muted",
                        ].join(" ")}
                      >
                        {result.wordpress.detected
                          ? "Detected"
                          : "Not Detected"}
                      </span>
                    </div>

                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      {result.wordpress.signals.length > 0
                        ? `${result.wordpress.signals.length} fingerprint signal(s)`
                        : "No WP signatures detected"}
                    </div>
                  </div>

                  {/* REST API */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      REST API
                    </div>

                    <div className="mt-1 flex items-center gap-1.5">
                      <span
                        className={[
                          "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-bold",
                          result.wp_rest.status === "DETECTED"
                            ? "border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-600/40 dark:bg-emerald-950/50 dark:text-emerald-200"
                            : result.wp_rest.status === "BLOCKED"
                              ? "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-600/50 dark:bg-amber-950/60 dark:text-amber-200"
                              : "border-xeoo-border bg-xeoo-surface-soft text-xeoo-muted",
                        ].join(" ")}
                      >
                        {result.wp_rest.status === "DETECTED"
                          ? "Available"
                          : result.wp_rest.status}
                      </span>

                      {result.wp_rest.http_status && (
                        <span className="font-mono text-[10px] text-xeoo-muted">
                          HTTP {result.wp_rest.http_status}
                        </span>
                      )}
                    </div>

                    <div
                      className="mt-0.5 truncate text-[10px] text-xeoo-muted"
                      title={result.wp_rest.detail}
                    >
                      {result.wp_rest.detail}
                    </div>
                  </div>

                  {/* FINDINGS */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Exposure Findings
                    </div>

                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span
                        className={[
                          "text-sm font-extrabold",
                          result.exposure_summary.detected > 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-xeoo-muted",
                        ].join(" ")}
                      >
                        {result.exposure_summary.detected} Detected
                      </span>

                      <span className="text-[11px] text-xeoo-muted">
                        / {result.exposure_summary.total_checked}
                      </span>
                    </div>

                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      {result.exposure_summary.blocked} Blocked •{" "}
                      {result.exposure_summary.not_found} Not Found
                    </div>
                  </div>
                </div>

                {/* ============================================================
                    WORDPRESS SIGNATURES
                ============================================================ */}
                {result.wordpress.signals.length > 0 && (
                  <section className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Detected WordPress Signatures (
                      {result.wordpress.signals.length})
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {result.wordpress.signals.map((signal) => (
                        <span
                          key={signal}
                          className="rounded-md border border-xeoo-border bg-xeoo-surface-soft px-2 py-0.5 font-mono text-[11px] text-xeoo-muted"
                        >
                          {signal}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* ============================================================
                    ENDPOINT CHECKS
                ============================================================ */}
                <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
                  {/* TOOLBAR */}
                  <div className="flex flex-col gap-2 border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-3.5">
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal size={13} className="text-xeoo-muted" />

                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                          Endpoint Checks
                        </div>

                        <div className="mt-0.5 text-xs font-extrabold text-xeoo-muted">
                          {result.upload_endpoints.length} Results
                        </div>
                      </div>
                    </div>

                    {/* FILTER BUTTONS */}
                    <div className="flex flex-wrap items-center gap-1">
                      {[
                        {
                          key: "ALL" as const,
                          label: `All (${result.upload_endpoints.length})`,
                        },
                        {
                          key: "DETECTED" as const,
                          label: `Detected (${result.exposure_summary.detected})`,
                        },
                        {
                          key: "BLOCKED" as const,
                          label: `Blocked (${result.exposure_summary.blocked})`,
                        },
                        {
                          key: "NOT FOUND" as const,
                          label: `Not Found (${result.exposure_summary.not_found})`,
                        },
                        {
                          key: "ERRORS" as const,
                          label: `Errors (${result.exposure_summary.inconclusive})`,
                        },
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

                  {/* ==========================================================
                      DESKTOP TABLE
                  ========================================================== */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[760px] border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-xeoo-surface-soft text-[11px] font-bold text-xeoo-muted">
                          <th className="border-b border-r border-xeoo-border px-3.5 py-2.5 text-center">
                            ENDPOINT
                          </th>

                          <th className="border-b border-r border-xeoo-border px-3.5 py-2.5 text-center">
                            PATH
                          </th>

                          <th className="border-b border-r border-xeoo-border px-3.5 py-2.5 text-center">
                            STATUS
                          </th>

                          <th className="border-b border-r border-xeoo-border px-3.5 py-2.5 text-center">
                            HTTP
                          </th>

                          <th className="border-b border-r border-xeoo-border px-3.5 py-2.5 text-center">
                            LATENCY
                          </th>

                          <th className="border-b border-xeoo-border px-3.5 py-2.5 text-center">
                            SIGNATURES
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredEndpoints.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="border-b border-xeoo-border px-3.5 py-8 text-center text-[11px] text-xeoo-muted"
                            >
                              No endpoints match the selected filter.
                            </td>
                          </tr>
                        ) : (
                          filteredEndpoints.map((endpoint, rowIndex) => {
                            const badge = getStatusBadgeClass(endpoint.status);

                            const zebraClass =
                              rowIndex % 2 === 0
                                ? "bg-xeoo-surface"
                                : "bg-xeoo-surface-soft/35";

                            return (
                              <tr
                                key={endpoint.path}
                                className={[
                                  zebraClass,
                                  "transition-colors hover:bg-xeoo-primary-soft/35 dark:hover:bg-xeoo-primary-soft/10",
                                  endpoint.status === "DETECTED"
                                    ? "shadow-[inset_3px_0_0_0_rgb(220_38_38)]"
                                    : "",
                                ].join(" ")}
                              >
                                <td className="border-b border-r border-xeoo-border px-3.5 py-2.5 align-top">
                                  <div className="text-[11px] font-semibold text-xeoo-muted">
                                    {endpoint.name}
                                  </div>

                                  <div className="mt-0.5 text-[10px] text-xeoo-muted">
                                    {endpoint.category}
                                  </div>
                                </td>

                                <td className="border-b border-r border-xeoo-border px-3.5 py-2.5 align-top">
                                  <a
                                    href={endpoint.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex max-w-[300px] items-start gap-1 break-all font-mono text-[11px] text-xeoo-muted transition-colors hover:text-xeoo-primary hover:underline"
                                    title={`Open ${endpoint.url} in new tab`}
                                  >
                                    <span>{endpoint.path}</span>

                                    <ExternalLink
                                      size={10}
                                      className="mt-0.5 shrink-0 text-xeoo-muted group-hover:text-xeoo-primary"
                                    />
                                  </a>
                                </td>

                                <td className="whitespace-nowrap border-b border-r border-xeoo-border px-3.5 py-2.5 align-top text-center">
                                  <span
                                    className={[
                                      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold",
                                      badge.container,
                                    ].join(" ")}
                                  >
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${badge.dot}`}
                                    />

                                    {endpoint.status}
                                  </span>
                                </td>

                                <td className="whitespace-nowrap border-b border-r border-xeoo-border px-3.5 py-2.5 text-center align-top">
                                  <span className="font-mono text-[11px] font-semibold text-xeoo-muted">
                                    {endpoint.http_status ?? "-"}
                                  </span>
                                </td>

                                <td className="whitespace-nowrap border-b border-r border-xeoo-border px-3.5 py-2.5 text-center align-top font-mono text-[11px] text-xeoo-muted">
                                  {endpoint.elapsed_ms} ms
                                </td>

                                <td className="whitespace-nowrap border-b border-xeoo-border px-3.5 py-2.5 text-center align-top">
                                  {endpoint.matched.length > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedEndpoint(endpoint)
                                      }
                                      className="inline-flex items-center gap-1 rounded-md border border-red-500/50 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700 transition hover:border-red-600 hover:bg-red-100 active:scale-95 dark:border-red-500/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                                    >
                                      View ({endpoint.matched.length})
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-xeoo-muted">
                                      -
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* ==========================================================
                      MOBILE LIST
                  ========================================================== */}
                  <div className="divide-y divide-xeoo-border md:hidden">
                    {filteredEndpoints.length === 0 ? (
                      <div className="px-3 py-8 text-center text-[11px] text-xeoo-muted">
                        No endpoints match the selected filter.
                      </div>
                    ) : (
                      filteredEndpoints.map((endpoint, index) => {
                        const badge = getStatusBadgeClass(endpoint.status);

                        const zebraClass =
                          index % 2 === 0
                            ? "bg-xeoo-surface"
                            : "bg-xeoo-surface-soft/35";

                        return (
                          <article
                            key={endpoint.path}
                            className={[
                              zebraClass,
                              "space-y-2.5 border-l-[3px] p-3",
                              endpoint.status === "DETECTED"
                                ? "border-l-red-500"
                                : endpoint.status === "BLOCKED"
                                  ? "border-l-orange-500"
                                  : "border-l-transparent",
                            ].join(" ")}
                          >
                            {/* TOP */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="truncate text-[11px] font-bold text-xeoo-muted">
                                  {endpoint.name}
                                </div>

                                <div className="truncate text-[10px] text-xeoo-muted">
                                  {endpoint.category}
                                </div>
                              </div>

                              <span
                                className={[
                                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold",
                                  badge.container,
                                ].join(" ")}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${badge.dot}`}
                                />

                                {endpoint.status}
                              </span>
                            </div>

                            {/* PATH */}
                            <div className="rounded-lg border border-xeoo-border bg-xeoo-bg/45 px-2.5 py-2">
                              <a
                                href={endpoint.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex break-all font-mono text-[11px] font-medium text-xeoo-muted transition-colors hover:text-xeoo-primary hover:underline"
                                title={endpoint.url}
                              >
                                <span>{endpoint.path}</span>

                                <ExternalLink
                                  size={10}
                                  className="ml-1 mt-0.5 shrink-0 text-xeoo-muted group-hover:text-xeoo-primary"
                                />
                              </a>
                            </div>

                            {/* METRICS */}
                            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                              <div className="rounded-md border border-xeoo-border bg-xeoo-surface px-2 py-1.5">
                                <div className="text-[10px] font-bold uppercase tracking-wide text-xeoo-muted">
                                  HTTP
                                </div>

                                <div className="mt-0.5 font-mono text-[11px] font-bold text-xeoo-muted">
                                  HTTP {endpoint.http_status ?? "-"}
                                </div>
                              </div>

                              <div className="rounded-md border border-xeoo-border bg-xeoo-surface px-2 py-1.5">
                                <div className="text-[10px] font-bold uppercase tracking-wide text-xeoo-muted">
                                  Time
                                </div>

                                <div className="mt-0.5 font-mono text-[11px] font-bold text-xeoo-muted">
                                  {endpoint.elapsed_ms} ms
                                </div>
                              </div>

                              <div className="col-span-2 rounded-md border border-xeoo-border bg-xeoo-surface px-2 py-1.5 sm:col-span-1">
                                <div className="text-[10px] font-bold uppercase tracking-wide text-xeoo-muted">
                                  Signatures
                                </div>

                                <div className="mt-0.5 font-mono text-[11px] font-bold text-xeoo-muted">
                                  {endpoint.matched.length} detected
                                </div>
                              </div>
                            </div>

                            {/* ACTION */}
                            {endpoint.matched.length > 0 && (
                              <div className="border-t border-xeoo-border pt-2.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedEndpoint(endpoint)}
                                  className="inline-flex h-8 w-full items-center justify-center rounded-md border border-red-500/50 bg-red-50 px-2.5 text-[11px] font-bold text-red-700 transition hover:border-red-600 hover:bg-red-100 active:scale-95 dark:border-red-500/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                                >
                                  View Signatures ({endpoint.matched.length})
                                </button>
                              </div>
                            )}
                          </article>
                        );
                      })
                    )}
                  </div>
                </section>
              </div>
            </section>
          )}

          {/* ================================================================
              ENDPOINT SIGNATURE MODAL
          ================================================================ */}
          {selectedEndpoint && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-xeoo-overlay p-3 backdrop-blur-xs sm:p-4"
              role="dialog"
              aria-modal="true"
              aria-label="Detected Endpoint Details"
            >
              <div
                ref={endpointModalRef}
                className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-2xl sm:max-h-[calc(100dvh-2rem)]"
              >
                {/* HEADER */}
                <div className="flex shrink-0 items-center justify-between border-b border-xeoo-border px-3.5 py-2.5">
                  <h3 className="text-xs font-bold text-xeoo-muted">
                    Endpoint Signature Matches
                  </h3>

                  <button
                    type="button"
                    onClick={() => setSelectedEndpoint(null)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:bg-xeoo-surface-soft"
                    aria-label="Close dialog"
                    title="Close"
                  >
                    <X size={12} />
                  </button>
                </div>

                {/* BODY */}
                <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-3.5 text-[11px]">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Endpoint
                    </div>

                    <div className="mt-0.5 text-[11px] font-bold text-xeoo-muted">
                      {selectedEndpoint.name}

                      <span className="font-normal text-xeoo-muted">
                        {" "}
                        ({selectedEndpoint.category})
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Target URL
                    </div>

                    <a
                      href={selectedEndpoint.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group mt-0.5 inline-flex max-w-full items-start gap-1 break-all font-mono text-[11px] text-xeoo-muted transition-colors hover:text-xeoo-primary hover:underline"
                    >
                      <span>{selectedEndpoint.url}</span>

                      <ExternalLink
                        size={10}
                        className="mt-0.5 shrink-0 text-xeoo-muted group-hover:text-xeoo-primary"
                      />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-2.5 py-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                        HTTP Response
                      </div>

                      <div className="mt-0.5 font-mono text-xs font-bold text-xeoo-muted">
                        HTTP {selectedEndpoint.http_status ?? "-"}
                      </div>
                    </div>

                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-2.5 py-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                        Response Latency
                      </div>

                      <div className="mt-0.5 font-mono text-xs font-bold text-xeoo-muted">
                        {selectedEndpoint.elapsed_ms} ms
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Matched Signatures
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {selectedEndpoint.matched.map((signature) => (
                        <span
                          key={signature}
                          className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-red-600 dark:text-red-400"
                        >
                          {signature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-2.5 py-2.5 text-[11px] leading-relaxed text-xeoo-muted">
                    This endpoint returned active markers matching known file
                    upload or file manager signatures. If unintended, restrict
                    access via web server rules or deactivate the component.
                  </div>
                </div>

                {/* FOOTER */}
                <div className="flex shrink-0 justify-end border-t border-xeoo-border bg-xeoo-surface-soft/30 px-3.5 py-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedEndpoint(null)}
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface px-3 text-[11px] font-semibold text-xeoo-muted transition hover:bg-xeoo-surface-soft active:scale-95"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
