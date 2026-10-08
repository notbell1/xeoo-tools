import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
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
  getConfidenceBadgeClass,
  getHostStatusBadgeClass,
  getHttpStatusBadgeClass,
  getSurfaceTypeBadgeClass,
  runAdminFinderScan,
  validateTargetInput,
  type AdminFinderResult,
  type CandidateSurface,
  type SarcasticBlock,
  type ScanStatus,
} from "./adminFinderLogic";

type FilterKey = "ALL" | "LOGIN" | "ADMIN" | "POSSIBLE" | "BLOCKED";

export default function AdminFinder() {
  const [targetUrl, setTargetUrl] = useState("");
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [result, setResult] = useState<AdminFinderResult | null>(null);
  const [error, setError] = useState("");
  const [sarcasticBlock, setSarcasticBlock] = useState<SarcasticBlock | null>(
    null,
  );

  const [statusFilter, setStatusFilter] = useState<FilterKey>("ALL");

  const [selectedSurface, setSelectedSurface] =
    useState<CandidateSurface | null>(null);

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [showHostsSection, setShowHostsSection] = useState(true);

  const targetInputId = useId();

  const abortControllerRef = useRef<AbortController | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);

  const signalModalRef = useRef<HTMLDivElement | null>(null);

  /*
   * Lock page scrolling while Signals modal is open.
   *
   * Important:
   * - Do NOT change body position.
   * - Do NOT change window scroll position.
   * - Do NOT call window.scrollTo().
   * - Keep the current page position untouched.
   * - Only the modal content can scroll.
   */
  useEffect(() => {
    if (!selectedSurface) {
      return;
    }

    const html = document.documentElement;
    const body = document.body;

    const previousHtmlOverflow = html.style.overflow;
    const previousHtmlOverscrollBehavior = html.style.overscrollBehavior;

    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscrollBehavior = body.style.overscrollBehavior;

    const previousBodyPaddingRight = body.style.paddingRight;

    /*
     * Prevent horizontal layout shift when the browser scrollbar
     * disappears after overflow:hidden.
     */
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    /*
     * Prevent wheel/touch scrolling on the background.
     * Scrolling inside the modal remains allowed.
     */
    const preventBackgroundScroll = (event: Event) => {
      const target = event.target;

      if (target instanceof Node && signalModalRef.current?.contains(target)) {
        return;
      }

      event.preventDefault();
    };

    /*
     * Escape does not close the Signals modal.
     * The modal can only be closed using X / Close.
     */
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

      /*
       * Intentionally do NOT restore scroll position.
       * The browser never moved it in the first place.
       */
    };
  }, [selectedSurface]);

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);

      setCopiedUrl(url);

      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = window.setTimeout(() => {
        setCopiedUrl(null);
      }, 2000);
    } catch {
      void showError("Copy Failed", "Could not copy URL to clipboard.");
    }
  };

  const handleScan = async () => {
    const rawTarget = targetUrl;
    const validation = validateTargetInput(rawTarget);

    if (!validation.valid) {
      if (validation.sarcasticBlock) {
        setSarcasticBlock(validation.sarcasticBlock);
      } else {
        const message = validation.error ?? "Please enter a valid target URL.";

        setError(message);

        await showError("Validation Error", message);
      }

      return;
    }

    setError("");
    setSarcasticBlock(null);
    setScanStatus("scanning");
    setResult(null);
    setSelectedSurface(null);
    setStatusFilter("ALL");
    setShowHostsSection(true);

    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const scanData = await runAdminFinderScan(rawTarget, controller.signal);

      setResult(scanData);
      setScanStatus("completed");

      if (scanData.auth_surfaces_count > 0) {
        await showSuccess(
          "Scan Completed",
          `Found ${scanData.auth_surfaces_count} authentication surface(s).`,
        );
      } else {
        await showSuccess(
          "Scan Completed",
          "No public authentication surfaces detected.",
        );
      }
    } catch (scanErr) {
      if (scanErr instanceof DOMException && scanErr.name === "AbortError") {
        return;
      }

      const errWithBlock = scanErr as {
        message?: string;
        sarcasticBlock?: SarcasticBlock;
      };

      if (errWithBlock?.sarcasticBlock) {
        setSarcasticBlock(errWithBlock.sarcasticBlock);
      } else {
        const message =
          scanErr instanceof Error
            ? scanErr.message
            : "Failed to execute scan.";

        setError(message);

        await showError("Scan Request Failed", message);
      }

      setScanStatus("error");
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

  const filteredSurfaces = useMemo(() => {
    if (!result) {
      return [];
    }

    if (statusFilter === "ALL") {
      return result.surfaces;
    }

    if (statusFilter === "LOGIN") {
      return result.surfaces.filter((surface) => surface.type === "LOGIN PAGE");
    }

    if (statusFilter === "ADMIN") {
      return result.surfaces.filter((surface) => surface.type === "ADMIN PAGE");
    }

    if (statusFilter === "POSSIBLE") {
      return result.surfaces.filter(
        (surface) => surface.type === "POSSIBLE AUTH SURFACE",
      );
    }

    if (statusFilter === "BLOCKED") {
      return result.surfaces.filter((surface) => surface.type === "BLOCKED");
    }

    return result.surfaces;
  }, [result, statusFilter]);

  const summaryCounts = useMemo(() => {
    if (!result) {
      return {
        login: 0,
        admin: 0,
        possible: 0,
        blocked: 0,
      };
    }

    return {
      login: result.surfaces.filter((surface) => surface.type === "LOGIN PAGE")
        .length,

      admin: result.surfaces.filter((surface) => surface.type === "ADMIN PAGE")
        .length,

      possible: result.surfaces.filter(
        (surface) => surface.type === "POSSIBLE AUTH SURFACE",
      ).length,

      blocked: result.surfaces.filter((surface) => surface.type === "BLOCKED")
        .length,
    };
  }, [result]);

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
        case "LOGIN":
          return "border-green-600 bg-green-600 text-white shadow-xs dark:border-green-500 dark:bg-green-600 dark:text-white";

        case "ADMIN":
          return "border-red-600 bg-red-600 text-white shadow-xs dark:border-red-500 dark:bg-red-600 dark:text-white";

        case "POSSIBLE":
          return "border-orange-500 bg-orange-500 text-white shadow-xs dark:border-orange-400 dark:bg-orange-500 dark:text-white";

        case "BLOCKED":
          return "border-orange-600 bg-orange-600 text-white shadow-xs dark:border-orange-500 dark:bg-orange-600 dark:text-white";

        case "ALL":
        default:
          return "border-xeoo-text bg-xeoo-text text-xeoo-surface shadow-xs";
      }
    }

    switch (key) {
      case "LOGIN":
        return "border-green-500/50 bg-xeoo-surface text-green-700 hover:border-green-600 hover:bg-green-50 dark:border-green-500/40 dark:bg-xeoo-surface dark:text-green-300 dark:hover:bg-green-950/30";

      case "ADMIN":
        return "border-red-500/50 bg-xeoo-surface text-red-700 hover:border-red-600 hover:bg-red-50 dark:border-red-500/40 dark:bg-xeoo-surface dark:text-red-300 dark:hover:bg-red-950/30";

      case "POSSIBLE":
        return "border-orange-500/50 bg-xeoo-surface text-orange-700 hover:border-orange-600 hover:bg-orange-50 dark:border-orange-500/40 dark:bg-xeoo-surface dark:text-orange-300 dark:hover:bg-orange-950/30";

      case "BLOCKED":
        return "border-orange-500/50 bg-xeoo-surface text-orange-700 hover:border-orange-600 hover:bg-orange-50 dark:border-orange-500/40 dark:bg-xeoo-surface dark:text-orange-300 dark:hover:bg-orange-950/30";

      case "ALL":
      default:
        return "border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft hover:text-xeoo-text";
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
                  <Globe size={15} strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold text-xeoo-text sm:text-sm">
                    ADMIN FINDER
                  </h1>

                  <p className="truncate text-[11px] text-xeoo-muted">
                    Find public admin and login pages.
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

                          if (sarcasticBlock) {
                            setSarcasticBlock(null);
                          }
                        }}
                        placeholder="example.com or https://site.org"
                        autoComplete="off"
                        spellCheck={false}
                        disabled={scanStatus === "scanning"}
                        className="h-9 w-full rounded-lg border border-xeoo-border bg-xeoo-bg pl-8 pr-8 text-[11px] font-medium text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:bg-xeoo-surface focus:ring-2 focus:ring-xeoo-primary/15 disabled:cursor-not-allowed disabled:opacity-60 sm:h-10"
                      />

                      {targetUrl && (
                        <button
                          type="button"
                          onClick={() => setTargetUrl("")}
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
                      disabled={scanStatus === "scanning" || !targetUrl.trim()}
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-4 text-[11px] font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:px-5"
                    >
                      {scanStatus === "scanning" ? (
                        <>
                          <LoaderCircle size={14} className="animate-spin" />
                          <span>Loading...</span>
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
              DISCOVERY RESULTS
          ================================================================ */}
          {result && (
            <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
              {/* HEADER */}
              <div className="flex flex-col gap-2 border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <div className="flex min-w-0 items-center gap-1.5">
                  <Network size={14} className="shrink-0 text-xeoo-muted" />

                  <div className="min-w-0">
                    <h2 className="truncate text-xs font-extrabold text-xeoo-text">
                      RESULTS
                    </h2>

                    <p className="truncate text-[12px] text-xeoo-muted">
                      {result.target} · {result.surfaces.length} Path ·{" "}
                      {result.hosts.length} Hosts
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

              {/* LEFT + RIGHT */}
              <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[270px_minmax(0,1fr)]">
                {/* LEFT — HOSTS */}
                <div className="min-w-0 border-b border-xeoo-border lg:border-b-0 lg:border-r">
                  <div className="flex items-center justify-between border-b border-xeoo-border px-3 py-2.5">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                        Hosts
                      </div>

                      <div className="mt-0.5 text-xs font-extrabold text-xeoo-text">
                        {result.hosts.length}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowHostsSection((previous) => !previous)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                      title={
                        showHostsSection ? "Collapse hosts" : "Expand hosts"
                      }
                      aria-label={
                        showHostsSection ? "Collapse hosts" : "Expand hosts"
                      }
                    >
                      {showHostsSection ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                  </div>

                  {showHostsSection && (
                    <div className="max-h-[420px] overflow-y-auto p-2.5">
                      {result.hosts.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-xeoo-border px-3 py-6 text-center text-[11px] text-xeoo-muted">
                          No hosts discovered.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {result.hosts.map((host) => (
                            <div
                              key={host.host}
                              className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-xeoo-border bg-xeoo-surface-soft/35 px-2.5 py-2"
                            >
                              <div className="min-w-0">
                                <div
                                  className="truncate font-mono text-[11px] font-bold text-xeoo-text"
                                  title={host.host}
                                >
                                  {host.host}
                                </div>

                                {host.ip && (
                                  <div className="mt-0.5 truncate font-mono text-[11px] text-xeoo-muted">
                                    {host.ip}
                                  </div>
                                )}
                              </div>

                              <span
                                className={[
                                  "inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[11px] font-bold",
                                  getHostStatusBadgeClass(host.status),
                                ].join(" ")}
                              >
                                {host.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* RIGHT — SURFACES */}
                <div className="min-w-0">
                  <div className="border-b border-xeoo-border">
                    <div className="flex flex-col gap-2 px-3 py-2.5 sm:px-3.5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-1.5">
                          <SlidersHorizontal
                            size={14}
                            className="shrink-0 text-xeoo-muted"
                          />

                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                              Discovered
                            </div>

                            <div className="mt-0.5 text-xs font-extrabold text-xeoo-text">
                              {result.surfaces.length} Results
                            </div>
                          </div>
                        </div>

                        {/* FILTER BUTTONS */}
                        <div className="flex flex-wrap items-center gap-1">
                          {[
                            {
                              key: "ALL" as const,
                              label: `All (${result.surfaces.length})`,
                            },
                            {
                              key: "LOGIN" as const,
                              label: `Login (${summaryCounts.login})`,
                            },
                            {
                              key: "ADMIN" as const,
                              label: `Admin (${summaryCounts.admin})`,
                            },
                            {
                              key: "POSSIBLE" as const,
                              label: `Possible (${summaryCounts.possible})`,
                            },
                            {
                              key: "BLOCKED" as const,
                              label: `Blocked (${summaryCounts.blocked})`,
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
                    </div>
                  </div>

                  {/* DESKTOP TABLE */}
                  <div className="hidden md:block">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left text-xs">
                        <thead>
                          <tr className="border-b border-xeoo-border bg-xeoo-surface-soft/35 text-[11px] font-bold text-xeoo-muted">
                            <th className="border-b border-r border-xeoo-border px-3 py-2.5 text-center">
                              HOST
                            </th>

                            <th className="border-b border-r border-xeoo-border px-3 py-2.5 text-center">
                              PATH / URL
                            </th>

                            <th className="border-b border-r border-xeoo-border px-3 py-2.5 text-center">
                              TYPE
                            </th>

                            <th className="border-b border-r border-xeoo-border px-3 py-2.5 text-center">
                              CVE
                            </th>

                            <th className="border-b border-r border-xeoo-border px-3 py-2.5 text-center">
                              HTTP
                            </th>

                            <th className="border-b border-r border-xeoo-border px-3 py-2.5 text-center">
                              TIME
                            </th>

                            <th className="border-b border-r border-xeoo-border px-3 py-2.5 text-center">
                              ACTIONS
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-xeoo-border">
                          {filteredSurfaces.length === 0 ? (
                            <tr>
                              <td
                                colSpan={7}
                                className="px-3 py-8 text-center text-[11px] text-xeoo-muted"
                              >
                                No surfaces match the selected filter.
                              </td>
                            </tr>
                          ) : (
                            filteredSurfaces.map((surface, rowIndex) => {
                              const typeBadge = getSurfaceTypeBadgeClass(
                                surface.type,
                              );

                              const confBadge = getConfidenceBadgeClass(
                                surface.confidence,
                              );

                              const httpBadge = getHttpStatusBadgeClass(
                                surface.http_status,
                              );

                              const isCopied = copiedUrl === surface.url;

                              const zebraClass =
                                rowIndex % 2 === 0
                                  ? "bg-xeoo-surface"
                                  : "bg-xeoo-surface-soft/35";

                              return (
                                <tr
                                  key={surface.url}
                                  className={[
                                    zebraClass,
                                    "transition-colors hover:bg-xeoo-primary-soft/35 dark:hover:bg-xeoo-primary-soft/10",
                                    surface.type === "LOGIN PAGE"
                                      ? "shadow-[inset_3px_0_0_0_rgb(34_197_94)]"
                                      : "",
                                  ].join(" ")}
                                >
                                  <td className="px-3 py-2.5">
                                    <div className="max-w-[140px] truncate font-mono text-[11px] font-bold text-xeoo-text">
                                      {surface.host}
                                    </div>

                                    <div className="mt-0.5 max-w-[140px] truncate text-[11px] text-xeoo-muted">
                                      {surface.category}
                                    </div>
                                  </td>

                                  <td className="px-3 py-2.5">
                                    <a
                                      href={surface.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="group inline-flex max-w-[280px] items-center gap-1 font-mono text-[11px] text-xeoo-text-soft transition-colors hover:text-xeoo-primary hover:underline"
                                      title={`Open ${surface.url} in new tab`}
                                    >
                                      <span className="break-all">
                                        {surface.path}
                                      </span>

                                      <ExternalLink
                                        size={10}
                                        className="shrink-0 text-xeoo-muted opacity-70 group-hover:text-xeoo-primary group-hover:opacity-100"
                                      />
                                    </a>
                                  </td>

                                  <td className="whitespace-nowrap px-3 py-2.5 text-center">
                                    <span
                                      className={[
                                        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px]",
                                        typeBadge,
                                      ].join(" ")}
                                    >
                                      {surface.type}
                                    </span>
                                  </td>

                                  <td className="whitespace-nowrap px-3 py-2.5 text-center">
                                    <span
                                      className={[
                                        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-bold",
                                        confBadge,
                                      ].join(" ")}
                                    >
                                      {surface.confidence}
                                    </span>
                                  </td>

                                  <td className="whitespace-nowrap px-3 py-2.5 text-center">
                                    <span
                                      className={[
                                        "inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[11px] font-bold",
                                        httpBadge,
                                      ].join(" ")}
                                    >
                                      {surface.http_status ?? "-"}
                                    </span>
                                  </td>

                                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-[11px] text-xeoo-muted">
                                    {surface.elapsed_ms} ms
                                  </td>

                                  <td className="whitespace-nowrap px-3 py-2.5 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setSelectedSurface(surface)
                                        }
                                        className="inline-flex items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2 py-1 text-[11px] font-bold text-xeoo-text transition hover:bg-xeoo-surface-soft active:scale-95"
                                      >
                                        More ({surface.signals.length})
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          void handleCopyUrl(surface.url)
                                        }
                                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text active:scale-95"
                                        title={
                                          isCopied ? "Copied!" : "Copy URL"
                                        }
                                        aria-label="Copy URL"
                                      >
                                        {isCopied ? (
                                          <Check
                                            size={11}
                                            className="text-green-500"
                                          />
                                        ) : (
                                          <Copy size={11} />
                                        )}
                                      </button>

                                      <a
                                        href={surface.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text active:scale-95"
                                        title="Open Login Page"
                                        aria-label="Open Login Page"
                                      >
                                        <ExternalLink size={11} />
                                      </a>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* MOBILE LIST */}
                  <div className="divide-y divide-xeoo-border md:hidden">
                    {filteredSurfaces.length === 0 ? (
                      <div className="px-3 py-8 text-center text-[11px] text-xeoo-muted">
                        No surfaces match the selected filter.
                      </div>
                    ) : (
                      filteredSurfaces.map((surface) => {
                        const typeBadge = getSurfaceTypeBadgeClass(
                          surface.type,
                        );

                        const confBadge = getConfidenceBadgeClass(
                          surface.confidence,
                        );

                        const httpBadge = getHttpStatusBadgeClass(
                          surface.http_status,
                        );

                        const isCopied = copiedUrl === surface.url;

                        return (
                          <div
                            key={surface.url}
                            className={[
                              "space-y-2 p-3",
                              surface.type === "LOGIN PAGE"
                                ? "bg-green-500/5 dark:bg-green-950/20"
                                : "",
                            ].join(" ")}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="truncate font-mono text-[11px] font-bold text-xeoo-text">
                                  {surface.host}
                                </div>

                                <div className="truncate text-[11px] text-xeoo-muted">
                                  {surface.category}
                                </div>
                              </div>

                              <div className="flex shrink-0 flex-wrap justify-end gap-1">
                                <span
                                  className={[
                                    "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px]",
                                    typeBadge,
                                  ].join(" ")}
                                >
                                  {surface.type}
                                </span>

                                <span
                                  className={[
                                    "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-bold",
                                    confBadge,
                                  ].join(" ")}
                                >
                                  {surface.confidence}
                                </span>
                              </div>
                            </div>

                            <a
                              href={surface.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex break-all font-mono text-[11px] text-xeoo-text-soft transition-colors hover:text-xeoo-primary hover:underline"
                            >
                              <span>{surface.path}</span>

                              <ExternalLink
                                size={10}
                                className="ml-1 mt-0.5 shrink-0 text-xeoo-muted opacity-70 group-hover:text-xeoo-primary group-hover:opacity-100"
                              />
                            </a>

                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={[
                                    "inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[11px] font-bold",
                                    httpBadge,
                                  ].join(" ")}
                                >
                                  HTTP {surface.http_status ?? "-"}
                                </span>

                                <span className="text-[11px] text-xeoo-muted">
                                  {surface.elapsed_ms} ms
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setSelectedSurface(surface)}
                                  className="inline-flex items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2 py-1 text-[11px] font-bold text-xeoo-text transition hover:bg-xeoo-surface-soft active:scale-95"
                                >
                                  Signals ({surface.signals.length})
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleCopyUrl(surface.url)
                                  }
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text active:scale-95"
                                  title={isCopied ? "Copied!" : "Copy URL"}
                                  aria-label="Copy URL"
                                >
                                  {isCopied ? (
                                    <Check
                                      size={11}
                                      className="text-green-500"
                                    />
                                  ) : (
                                    <Copy size={11} />
                                  )}
                                </button>

                                <a
                                  href={surface.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text active:scale-95"
                                  title="Open Login Page"
                                  aria-label="Open Login Page"
                                >
                                  <ExternalLink size={11} />
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ================================================================
              SECURITY BLOCK MODAL
          ================================================================ */}
          {sarcasticBlock && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-xs sm:p-4"
              role="dialog"
              aria-modal="true"
              aria-label="Security Notice"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setSarcasticBlock(null);
                }
              }}
            >
              <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-2xl">
                <div className="flex items-center justify-between border-b border-xeoo-border bg-xeoo-surface-soft/50 px-3.5 py-2.5">
                  <h3 className="text-xs font-bold text-xeoo-text">
                    Security Notice
                  </h3>

                  <button
                    type="button"
                    onClick={() => setSarcasticBlock(null)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                    aria-label="Close dialog"
                  >
                    <X size={12} />
                  </button>
                </div>

                <div className="space-y-2 p-4 text-center">
                  <div className="text-sm font-extrabold text-xeoo-text">
                    {sarcasticBlock.title}
                  </div>

                  <p className="text-[11px] leading-5 text-xeoo-muted">
                    {sarcasticBlock.message}
                  </p>
                </div>

                <div className="border-t border-xeoo-border bg-xeoo-surface-soft/30 px-4 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => setSarcasticBlock(null)}
                    className="inline-flex h-8 items-center justify-center rounded-lg bg-xeoo-primary px-3 text-[11px] font-bold text-white transition hover:bg-xeoo-primary-hover active:scale-95"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              SIGNALS MODAL
          ================================================================ */}
          {selectedSurface && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-xs sm:p-4"
              role="dialog"
              aria-modal="true"
              aria-label="Surface Detection Signals"
            >
              <div
                ref={signalModalRef}
                className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-2xl sm:max-h-[calc(100dvh-2rem)]"
              >
                {/* MODAL HEADER */}
                <div className="flex shrink-0 items-center justify-between border-b border-xeoo-border px-3.5 py-2.5">
                  <h3 className="text-xs font-bold text-xeoo-text">
                    Surface Detection Signals
                  </h3>

                  <button
                    type="button"
                    onClick={() => setSelectedSurface(null)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                    aria-label="Close dialog"
                    title="Close"
                  >
                    <X size={12} />
                  </button>
                </div>

                {/* MODAL BODY */}
                <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-3.5 text-[11px]">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Surface Type & Confidence
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span
                        className={[
                          "inline-flex items-center rounded-md border px-2 py-1 text-[11px]",
                          getSurfaceTypeBadgeClass(selectedSurface.type),
                        ].join(" ")}
                      >
                        {selectedSurface.type}
                      </span>

                      <span
                        className={[
                          "inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-bold",
                          getConfidenceBadgeClass(selectedSurface.confidence),
                        ].join(" ")}
                      >
                        {selectedSurface.confidence} Confidence
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Target URL
                    </div>

                    <a
                      href={selectedSurface.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group mt-1 inline-flex max-w-full items-center gap-1 break-all font-mono text-[11px] text-xeoo-text-soft transition-colors hover:text-xeoo-primary hover:underline"
                    >
                      <span>{selectedSurface.url}</span>

                      <ExternalLink
                        size={10}
                        className="shrink-0 text-xeoo-muted opacity-70 group-hover:text-xeoo-primary group-hover:opacity-100"
                      />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 px-2.5 py-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                        HTTP Status
                      </div>

                      <div className="mt-1 font-mono text-xs font-bold text-xeoo-text">
                        HTTP {selectedSurface.http_status ?? "-"}
                      </div>
                    </div>

                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 px-2.5 py-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                        Response Time
                      </div>

                      <div className="mt-1 font-mono text-xs font-bold text-xeoo-text">
                        {selectedSurface.elapsed_ms} ms
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Detection Signals ({selectedSurface.signals.length})
                    </div>

                    <div className="mt-1.5 space-y-1.5">
                      {selectedSurface.signals.map((signal, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-1.5 rounded-md border border-xeoo-border bg-xeoo-surface-soft/60 px-2.5 py-2 text-[11px] text-xeoo-text"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />

                          <span>{signal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* MODAL FOOTER */}
                <div className="flex shrink-0 flex-col gap-2 border-t border-xeoo-border bg-xeoo-surface-soft/30 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => void handleCopyUrl(selectedSurface.url)}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-semibold text-xeoo-text transition hover:bg-xeoo-surface-soft active:scale-95"
                    >
                      {copiedUrl === selectedSurface.url ? (
                        <>
                          <Check size={12} className="text-green-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    <a
                      href={selectedSurface.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-xeoo-primary px-2.5 text-[11px] font-bold text-white transition hover:bg-xeoo-primary-hover active:scale-95"
                    >
                      <ExternalLink size={12} />
                      <span>Open Page</span>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedSurface(null)}
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-semibold text-xeoo-text transition hover:bg-xeoo-surface-soft active:scale-95"
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
