import {
  Activity,
  AlertTriangle,
  Building2,
  Check,
  Copy,
  ExternalLink,
  Globe,
  Globe2,
  HardDrive,
  Info,
  LoaderCircle,
  MapPin,
  Network,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showError, showSuccess } from "../../alert";

import {
  buildMapUrl,
  formatCoordinate,
  isValidIP,
  lookupIP,
  normalizeIP,
  type IPLookupData,
} from "./ipLookupLogic";

type LookupStatus = "idle" | "loading" | "completed" | "error";

interface DataRowProps {
  label: string;
  value: string;
  icon: LucideIcon;
  mono?: boolean;
  onCopy?: (val: string) => void;
  copied?: boolean;
}

function DataRow({
  label,
  value,
  icon: Icon,
  mono = false,
  onCopy,
  copied,
}: DataRowProps) {
  const isAvailable = value && value !== "Unavailable" && value !== "—";

  return (
    <div className="flex min-w-0 flex-col justify-between rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 p-2.5 transition-colors hover:bg-xeoo-surface-soft/70">
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <Icon size={12} className="shrink-0 text-xeoo-muted" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
            {label}
          </span>
        </div>

        {onCopy && isAvailable && (
          <button
            type="button"
            onClick={() => onCopy(value)}
            className="inline-flex items-center justify-center rounded p-1 text-xeoo-muted transition hover:bg-xeoo-surface hover:text-xeoo-text"
            title={`Copy ${label}`}
            aria-label={`Copy ${label}`}
          >
            {copied ? (
              <Check size={11} className="text-green-600 dark:text-green-400" />
            ) : (
              <Copy size={11} />
            )}
          </button>
        )}
      </div>

      <p
        className={[
          "mt-1.5 truncate text-[11px] font-semibold text-xeoo-text",
          mono ? "font-mono" : "",
        ].join(" ")}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

export default function IPLookup() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<IPLookupData | null>(null);
  const [status, setStatus] = useState<LookupStatus>("idle");
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const ipInputId = useId();
  const copyTimeoutRef = useRef<number | null>(null);

  const handleCopyText = async (text: string, key: string) => {
    if (!text || text === "Unavailable" || text === "—") return;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);

      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = window.setTimeout(() => {
        setCopiedKey(null);
      }, 2000);
    } catch {
      void showError("Copy Failed", "Could not copy text to clipboard.");
    }
  };

  const locationLabel = useMemo(() => {
    if (!data) return "—";

    return (
      [data.city, data.region, data.country].filter(Boolean).join(", ") ||
      "Unavailable"
    );
  }, [data]);

  const normalizedQuery = normalizeIP(query);
  const canLookup = normalizedQuery !== "" && isValidIP(normalizedQuery);

  async function performLookup(value?: string) {
    const target = value !== undefined ? normalizeIP(value) : "";

    if (target && !isValidIP(target)) {
      const msg = "Invalid IP address format. Enter a valid IPv4 or IPv6 address.";
      setError(msg);
      await showError("Validation Error", msg);
      return;
    }

    setError("");
    setStatus("loading");

    try {
      const result = await lookupIP(target || undefined);
      setData(result);
      setStatus("completed");

      await showSuccess(
        "Lookup Completed",
        `Information for ${result.ip} has been successfully loaded.`,
      );
    } catch (err) {
      console.error("IP lookup error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "The IP lookup service could not return valid data.";

      setData(null);
      setError(msg);
      setStatus("error");

      await showError("Lookup Failed", msg);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canLookup) {
      if (!normalizedQuery) {
        setError("Please enter an IP address to lookup.");
      } else {
        setError("Invalid IP address format. Enter a valid IPv4 or IPv6 address.");
      }
      return;
    }

    await performLookup(normalizedQuery);
  }

  async function handleMyIP() {
    setQuery("");
    setError("");
    await performLookup();
  }

  const statusMeta = useMemo(() => {
    switch (status) {
      case "loading":
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
  }, [status]);

  const latitude = data?.latitude ?? null;
  const longitude = data?.longitude ?? null;
  const validCoordinates = latitude !== null && longitude !== null;
  const mapUrl = buildMapUrl(latitude, longitude);

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
                    IP LOOKUP
                  </h1>

                  <p className="truncate text-[11px] text-xeoo-muted">
                    Inspect public IP address details, autonomous system, and geolocation.
                  </p>
                </div>
              </div>

              <span
                className={[
                  "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-bold",
                  statusMeta.badge,
                ].join(" ")}
              >
                <span
                  className={[
                    "h-1.5 w-1.5 rounded-full bg-white",
                    status === "loading" ? "animate-pulse" : "",
                  ].join(" ")}
                />
                {statusMeta.label}
              </span>
            </div>

            {/* FORM */}
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
                        value={query}
                        onChange={(event) => {
                          setQuery(event.target.value);
                          if (error) {
                            setError("");
                          }
                        }}
                        placeholder="e.g. 8.8.8.8 or 2001:4860:4860::8888"
                        autoComplete="off"
                        spellCheck={false}
                        disabled={status === "loading"}
                        className="h-9 w-full rounded-lg border border-xeoo-border bg-xeoo-bg pl-8 pr-8 text-[11px] font-medium text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:bg-xeoo-surface focus:ring-2 focus:ring-xeoo-primary/15 disabled:cursor-not-allowed disabled:opacity-60 sm:h-10"
                      />

                      {query && (
                        <button
                          type="button"
                          onClick={() => setQuery("")}
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
                      disabled={status === "loading" || !canLookup}
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-4 text-[11px] font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:px-5"
                    >
                      {status === "loading" ? (
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

                    <button
                      type="button"
                      onClick={() => void handleMyIP()}
                      disabled={status === "loading"}
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 text-[11px] font-bold text-xeoo-text shadow-xs transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-[0.98] disabled:opacity-50 sm:h-10 sm:px-4"
                    >
                      <Activity size={13} className="text-xeoo-muted" />
                      <span>My IP</span>
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
          {data && (
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
                      {data.ip} · {locationLabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-xeoo-border bg-xeoo-surface px-2 py-0.5 text-[11px] font-bold text-xeoo-muted">
                    {data.version}
                  </span>

                  <button
                    type="button"
                    onClick={() => void handleCopyText(data.ip, "ip-main")}
                    className="inline-flex items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-[11px] font-bold text-xeoo-text transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-95"
                  >
                    {copiedKey === "ip-main" ? (
                      <>
                        <Check size={11} className="text-green-600 dark:text-green-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copy IP</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => void performLookup(data.ip)}
                    disabled={status === "loading"}
                    className="inline-flex items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-[11px] font-bold text-xeoo-text transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw size={11} />
                    <span>Refresh</span>
                  </button>
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
                      title={data.ip}
                    >
                      {data.ip}
                    </div>

                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      {data.version} · Target host
                    </div>
                  </div>

                  {/* LOCATION */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Location
                    </div>

                    <div
                      className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text"
                      title={locationLabel}
                    >
                      {data.city || data.region || data.country || "Unavailable"}
                    </div>

                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      {data.country || "Approximate location"}
                    </div>
                  </div>

                  {/* ORGANIZATION / ISP */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Organization / ISP
                    </div>

                    <div
                      className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text"
                      title={data.organization || data.asn || "Unavailable"}
                    >
                      {data.organization || data.asn || "Unavailable"}
                    </div>

                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      {data.asn || "Autonomous system"}
                    </div>
                  </div>

                  {/* HOSTNAME */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      PTR / Hostname
                    </div>

                    <div
                      className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text"
                      title={data.hostname || "No Hostname"}
                    >
                      {data.hostname || "No Hostname"}
                    </div>

                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      Reverse DNS pointer
                    </div>
                  </div>
                </div>

                {/* ============================================================
                    DETAILED SECTIONS GRID
                ============================================================ */}
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {/* CARD 1: GEOGRAPHIC LOCATION */}
                  <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
                    <div className="flex items-center justify-between border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2 sm:px-3.5">
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-xeoo-primary" />
                        <h3 className="text-xs font-bold text-xeoo-text">
                          Geographic Location
                        </h3>
                      </div>

                      {validCoordinates && (
                        <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          Coordinates Mapped
                        </span>
                      )}
                    </div>

                    <div className="space-y-2.5 p-3 sm:p-3.5">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        <DataRow
                          label="Country"
                          value={data.country ?? "Unavailable"}
                          icon={Globe2}
                          onCopy={(v) => void handleCopyText(v, "country")}
                          copied={copiedKey === "country"}
                        />

                        <DataRow
                          label="Region / State"
                          value={data.region ?? "Unavailable"}
                          icon={MapPin}
                          onCopy={(v) => void handleCopyText(v, "region")}
                          copied={copiedKey === "region"}
                        />

                        <DataRow
                          label="City"
                          value={data.city ?? "Unavailable"}
                          icon={Building2}
                          onCopy={(v) => void handleCopyText(v, "city")}
                          copied={copiedKey === "city"}
                        />

                        <DataRow
                          label="Postal Code"
                          value={data.postal ?? "Unavailable"}
                          icon={MapPin}
                          mono
                          onCopy={(v) => void handleCopyText(v, "postal")}
                          copied={copiedKey === "postal"}
                        />

                        <DataRow
                          label="Continent"
                          value={data.continent ?? "Unavailable"}
                          icon={Globe2}
                        />

                        <DataRow
                          label="Coordinates"
                          value={
                            validCoordinates
                              ? `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`
                              : "Unavailable"
                          }
                          icon={MapPin}
                          mono
                          onCopy={(v) => void handleCopyText(v, "coords")}
                          copied={copiedKey === "coords"}
                        />
                      </div>

                      {validCoordinates && mapUrl && (
                        <div className="pt-1">
                          <a
                            href={mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface-soft/60 px-3 text-[11px] font-bold text-xeoo-text transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft hover:text-xeoo-primary"
                          >
                            <MapPin size={12} />
                            <span>View Coordinates on OpenStreetMap</span>
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* CARD 2: NETWORK & ROUTING */}
                  <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
                    <div className="flex items-center justify-between border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2 sm:px-3.5">
                      <div className="flex items-center gap-2">
                        <Server size={13} className="text-xeoo-primary" />
                        <h3 className="text-xs font-bold text-xeoo-text">
                          Network & Autonomous System
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3 sm:p-3.5">
                      <DataRow
                        label="ASN"
                        value={data.asn ?? "Unavailable"}
                        icon={Network}
                        mono
                        onCopy={(v) => void handleCopyText(v, "asn")}
                        copied={copiedKey === "asn"}
                      />

                      <DataRow
                        label="Organization"
                        value={data.organization ?? "Unavailable"}
                        icon={Building2}
                        onCopy={(v) => void handleCopyText(v, "org")}
                        copied={copiedKey === "org"}
                      />

                      <DataRow
                        label="PTR Hostname"
                        value={data.hostname ?? "Unavailable"}
                        icon={Server}
                        mono
                        onCopy={(v) => void handleCopyText(v, "host")}
                        copied={copiedKey === "host"}
                      />

                      <DataRow
                        label="IP Protocol"
                        value={data.version}
                        icon={HardDrive}
                        mono
                      />
                    </div>
                  </section>

                  {/* CARD 3: REGIONAL & LOCALE */}
                  <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
                    <div className="flex items-center justify-between border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2 sm:px-3.5">
                      <div className="flex items-center gap-2">
                        <Activity size={13} className="text-xeoo-primary" />
                        <h3 className="text-xs font-bold text-xeoo-text">
                          Regional & Locale Details
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 sm:p-3.5">
                      <DataRow
                        label="Timezone"
                        value={data.timezone ?? "Unavailable"}
                        icon={Activity}
                        onCopy={(v) => void handleCopyText(v, "tz")}
                        copied={copiedKey === "tz"}
                      />

                      <DataRow
                        label="UTC Offset"
                        value={data.utcOffset ?? "Unavailable"}
                        icon={Activity}
                        mono
                      />

                      <DataRow
                        label="Currency"
                        value={
                          data.currency
                            ? `${data.currency}${data.currencyName ? ` · ${data.currencyName}` : ""}`
                            : "Unavailable"
                        }
                        icon={Globe2}
                      />

                      <DataRow
                        label="Calling Code"
                        value={data.callingCode ?? "Unavailable"}
                        icon={Globe2}
                        mono
                      />

                      <DataRow
                        label="Languages"
                        value={data.languages ?? "Unavailable"}
                        icon={Globe2}
                      />
                    </div>
                  </section>

                  {/* CARD 4: COUNTRY CODES & STANDARDS */}
                  <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
                    <div className="flex items-center justify-between border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2 sm:px-3.5">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={13} className="text-xeoo-primary" />
                        <h3 className="text-xs font-bold text-xeoo-text">
                          Country Standards & Codes
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 sm:p-3.5">
                      <DataRow
                        label="Country Code (ISO2)"
                        value={data.countryCode ?? "Unavailable"}
                        icon={Globe2}
                        mono
                        onCopy={(v) => void handleCopyText(v, "iso2")}
                        copied={copiedKey === "iso2"}
                      />

                      <DataRow
                        label="ISO3 Code"
                        value={data.countryCodeIso3 ?? "Unavailable"}
                        icon={Globe2}
                        mono
                        onCopy={(v) => void handleCopyText(v, "iso3")}
                        copied={copiedKey === "iso3"}
                      />

                      <DataRow
                        label="Region Code"
                        value={data.regionCode ?? "Unavailable"}
                        icon={MapPin}
                        mono
                      />
                    </div>
                  </section>
                </div>

                {/* ============================================================
                    DISCLAIMER
                ============================================================ */}
                <div className="flex items-start gap-2.5 rounded-xl border border-xeoo-border bg-xeoo-surface-soft/40 p-3 text-[11px] text-xeoo-muted">
                  <Info size={14} className="mt-0.5 shrink-0 text-xeoo-muted" />
                  <p className="leading-relaxed">
                    IP geolocation is approximate. Coordinates and regional data represent
                    registered network routing points or ISP facilities rather than an
                    exact physical device location. Geolocation lookups are intended for
                    informational and public network diagnostic purposes only.
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
