import {
  Activity,
  AlertTriangle,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Globe,
  Info,
  LoaderCircle,
  Network,
  RefreshCw,
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
  getRecordMeta,
  getRecordValue,
  getResolverInfo,
  isValidHostname,
  lookupDNS,
  normalizeDomain,
  type DnsAnswer,
  type DnsApiResponse,
  type DnsData,
  type RecordType,
  type ResolverKey,
} from "./dnsLookupLogic";

type LookupStatus = "idle" | "loading" | "completed" | "error";

type RecordTypeOption = {
  value: RecordType;
  label: string;
  description: string;
};

type ResolverOption = {
  value: ResolverKey;
  label: string;
  server: string;
};

const RECORD_TYPE_OPTIONS: RecordTypeOption[] = [
  { value: "A", label: "A", description: "IPv4 address" },
  { value: "AAAA", label: "AAAA", description: "IPv6 address" },
  { value: "CNAME", label: "CNAME", description: "Canonical name" },
  { value: "MX", label: "MX", description: "Mail exchange" },
  { value: "NS", label: "NS", description: "Name server" },
  { value: "TXT", label: "TXT", description: "Text record" },
  { value: "SOA", label: "SOA", description: "Start of authority" },
  { value: "CAA", label: "CAA", description: "Certificate authority" },
  { value: "SRV", label: "SRV", description: "Service location" },
  { value: "ALL", label: "ALL", description: "All supported records" },
];

const RESOLVER_OPTIONS: ResolverOption[] = [
  { value: "cloudflare", label: "Cloudflare", server: "1.1.1.1" },
  { value: "google", label: "Google Public DNS", server: "8.8.8.8" },
  { value: "quad9", label: "Quad9", server: "9.9.9.9" },
];

const EMPTY_DNS_ANSWERS: DnsAnswer[] = [];

function getAnswerType(answer: DnsAnswer): string {
  return typeof answer.type === "string" && answer.type.trim()
    ? answer.type
    : "UNKNOWN";
}

function cleanDnsText(value: string): string {
  return value
    .replace(/\\:/g, ":")
    .replace(/\\"/g, '"')
    .trim();
}

function getAnswerObject(answer: DnsAnswer): Record<string, unknown> {
  return answer as unknown as Record<string, unknown>;
}

function getStringField(answer: DnsAnswer, ...keys: string[]): string {
  const object = getAnswerObject(answer);

  for (const key of keys) {
    const value = object[key];
    if (typeof value === "string" && value.trim() !== "") {
      return cleanDnsText(value);
    }
  }

  return "";
}

function getNumberField(answer: DnsAnswer, ...keys: string[]): number | null {
  const object = getAnswerObject(answer);

  for (const key of keys) {
    const value = object[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (
      typeof value === "string" &&
      value.trim() !== "" &&
      Number.isFinite(Number(value))
    ) {
      return Number(value);
    }
  }

  return null;
}

function getCleanRecordValue(answer: DnsAnswer): string {
  const value = getRecordValue(answer);
  return typeof value === "string" ? cleanDnsText(value) : "";
}

function getStructuredRecordRows(answer: DnsAnswer): Array<{
  label: string;
  value: string;
}> {
  const type = getAnswerType(answer);
  const rows: Array<{ label: string; value: string }> = [];

  if (type === "MX") {
    const priority = getNumberField(answer, "priority", "preference");
    const exchange = getStringField(answer, "exchange", "target", "mail_server");

    if (priority !== null) {
      rows.push({ label: "Priority", value: String(priority) });
    }
    if (exchange) {
      rows.push({ label: "Mail Server", value: exchange });
    }
  }

  if (type === "SRV") {
    const priority = getNumberField(answer, "priority");
    const weight = getNumberField(answer, "weight");
    const port = getNumberField(answer, "port");
    const target = getStringField(answer, "target");

    if (priority !== null) rows.push({ label: "Priority", value: String(priority) });
    if (weight !== null) rows.push({ label: "Weight", value: String(weight) });
    if (port !== null) rows.push({ label: "Port", value: String(port) });
    if (target) rows.push({ label: "Target", value: target });
  }

  if (type === "SOA") {
    const mname = getStringField(answer, "mname", "primary", "primary_name_server");
    const rname = getStringField(answer, "rname", "responsible", "responsible_mailbox");
    const serial = getNumberField(answer, "serial");
    const refresh = getNumberField(answer, "refresh");
    const retry = getNumberField(answer, "retry");
    const expire = getNumberField(answer, "expire");
    const minimum = getNumberField(answer, "minimum", "minimum_ttl");

    if (mname) rows.push({ label: "Primary Server", value: mname });
    if (rname) rows.push({ label: "Responsible", value: rname });
    if (serial !== null) rows.push({ label: "Serial", value: String(serial) });
    if (refresh !== null) rows.push({ label: "Refresh", value: `${refresh}s` });
    if (retry !== null) rows.push({ label: "Retry", value: `${retry}s` });
    if (expire !== null) rows.push({ label: "Expire", value: `${expire}s` });
    if (minimum !== null) rows.push({ label: "Minimum TTL", value: `${minimum}s` });
  }

  if (type === "CAA") {
    const flags = getNumberField(answer, "flags");
    const tag = getStringField(answer, "tag");
    const value = getStringField(answer, "value");

    if (flags !== null) rows.push({ label: "Flags", value: String(flags) });
    if (tag) rows.push({ label: "Tag", value: tag });
    if (value) rows.push({ label: "Value", value });
  }

  return rows;
}

function looksLikeInjectionAttempt(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) return false;
  if (normalized.length > 253) return true;

  const suspiciousPatterns = [
    /<[^>]*>/i,
    /javascript\s*:/i,
    /vbscript\s*:/i,
    /data\s*:/i,
    /file\s*:/i,
    /on[a-z]+\s*=/i,
    /<\/?[a-z][^>]*>/i,
    /&#x?[0-9a-f]+;/i,
    /%3c|%3e|%22|%27/i,
    /\b(alert|prompt|confirm)\s*\(/i,
    /\b(document|window|globalThis)\s*\./i,
    /\b(eval|Function)\s*\(/i,
    /\.\.\//,
    /\/\//,
    /[<>"'`{};]/,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(normalized));
}

function getFriendlyDnsError(message: string): string {
  const normalized = message.toLowerCase().trim();

  if (normalized.includes("http 400")) {
    return "The DNS resolver rejected the request. Please try another resolver or verify the hostname.";
  }
  if (normalized.includes("http 401") || normalized.includes("http 403")) {
    return "The DNS resolver denied access to this request.";
  }
  if (normalized.includes("http 404")) {
    return "The DNS resolver endpoint could not be found.";
  }
  if (normalized.includes("http 429")) {
    return "The DNS resolver is temporarily rate-limiting requests. Please try again shortly.";
  }
  if (
    normalized.includes("http 500") ||
    normalized.includes("http 502") ||
    normalized.includes("http 503") ||
    normalized.includes("http 504")
  ) {
    return "The DNS resolver is temporarily unavailable. Please try again or use another resolver.";
  }
  if (normalized.includes("timeout") || normalized.includes("timed out")) {
    return "The DNS resolver did not respond within the allowed time. Please try again.";
  }
  if (normalized.includes("connection") || normalized.includes("failed to connect")) {
    return "The DNS resolver could not be reached. Please check your network connection.";
  }

  return "The DNS lookup could not be completed. Please try again later.";
}

/* --------------------------------------------------------------------------
   DROPDOWNS
-------------------------------------------------------------------------- */

function RecordTypeDropdown({
  value,
  onChange,
  disabled,
}: {
  value: RecordType;
  onChange: (value: RecordType) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const selected =
    RECORD_TYPE_OPTIONS.find((option) => option.value === value) ??
    RECORD_TYPE_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={ref} className="relative min-w-32">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 w-full items-center justify-between rounded-lg border border-xeoo-border bg-xeoo-bg px-3 text-left text-[11px] font-semibold text-xeoo-text outline-none transition hover:bg-xeoo-surface focus:border-xeoo-primary focus:ring-2 focus:ring-xeoo-primary/15 disabled:cursor-not-allowed disabled:opacity-60 sm:h-10"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="font-bold text-xeoo-text">{selected.label}</span>
          <span className="hidden truncate text-[10px] text-xeoo-muted sm:inline">
            ({selected.description})
          </span>
        </span>

        <ChevronDown
          size={13}
          className={`shrink-0 text-xeoo-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xl">
          <div className="max-h-60 overflow-y-auto p-1">
            {RECORD_TYPE_OPTIONS.map((option) => {
              const active = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={[
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors",
                    active
                      ? "bg-xeoo-primary/10 font-bold text-xeoo-primary"
                      : "text-xeoo-text hover:bg-xeoo-surface-soft",
                  ].join(" ")}
                >
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold">
                      {option.label}
                    </span>
                    <span className="block truncate text-[10px] text-xeoo-muted">
                      {option.description}
                    </span>
                  </span>

                  {active && (
                    <Check size={13} className="shrink-0 text-xeoo-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ResolverDropdown({
  value,
  onChange,
  disabled,
}: {
  value: ResolverKey;
  onChange: (value: ResolverKey) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const selected =
    RESOLVER_OPTIONS.find((option) => option.value === value) ??
    RESOLVER_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={ref} className="relative min-w-36">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 w-full items-center justify-between rounded-lg border border-xeoo-border bg-xeoo-bg px-3 text-left text-[11px] font-semibold text-xeoo-text outline-none transition hover:bg-xeoo-surface focus:border-xeoo-primary focus:ring-2 focus:ring-xeoo-primary/15 disabled:cursor-not-allowed disabled:opacity-60 sm:h-10"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate font-bold text-xeoo-text">
            {selected.label}
          </span>
          <span className="hidden font-mono text-[10px] text-xeoo-muted md:inline">
            ({selected.server})
          </span>
        </span>

        <ChevronDown
          size={13}
          className={`shrink-0 text-xeoo-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xl">
          <div className="p-1">
            {RESOLVER_OPTIONS.map((option) => {
              const active = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={[
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors",
                    active
                      ? "bg-xeoo-primary/10 font-bold text-xeoo-primary"
                      : "text-xeoo-text hover:bg-xeoo-surface-soft",
                  ].join(" ")}
                >
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold">
                      {option.label}
                    </span>
                    <span className="block font-mono text-[10px] text-xeoo-muted">
                      {option.server}
                    </span>
                  </span>

                  {active && (
                    <Check size={13} className="shrink-0 text-xeoo-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
   MAIN COMPONENT
-------------------------------------------------------------------------- */

export default function DnsLookup() {
  const [query, setQuery] = useState("");
  const [recordType, setRecordType] = useState<RecordType>("A");
  const [resolver, setResolver] = useState<ResolverKey>("cloudflare");
  const [data, setData] = useState<DnsData | null>(null);
  const [status, setStatus] = useState<LookupStatus>("idle");
  const [error, setError] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");

  const [selectedAnswer, setSelectedAnswer] = useState<DnsAnswer | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const domainInputId = useId();
  const copyTimeoutRef = useRef<number | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  /*
   * Lock page scrolling while details modal is open.
   */
  useEffect(() => {
    if (!selectedAnswer) return;

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

    document.addEventListener("wheel", preventBackgroundScroll, { passive: false });
    document.addEventListener("touchmove", preventBackgroundScroll, { passive: false });
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
  }, [selectedAnswer]);

  const handleCopyText = async (text: string) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(cleanDnsText(text));
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

  function normalizeApiData(response: DnsApiResponse): DnsData {
    const raw = response?.data;
    const fallbackResolver = getResolverInfo(resolver);

    return {
      ...(raw ?? {}),
      domain: raw?.domain ?? "",
      requested_type: raw?.requested_type ?? recordType,
      answers: Array.isArray(raw?.answers) ? raw.answers : [],
      authority: Array.isArray(raw?.authority) ? raw.authority : [],
      status: raw?.status ?? { code: -1, name: "UNKNOWN" },
      flags: raw?.flags ?? {
        truncated: false,
        recursion_desired: false,
        recursion_available: false,
        authenticated_data: false,
        checking_disabled: false,
      },
      resolver: raw?.resolver ?? {
        name: fallbackResolver?.label ?? "Unknown",
        server: fallbackResolver?.server ?? "—",
      },
      answer_count:
        typeof raw?.answer_count === "number"
          ? raw.answer_count
          : Array.isArray(raw?.answers)
            ? raw.answers.length
            : 0,
      authority_count:
        typeof raw?.authority_count === "number"
          ? raw.authority_count
          : Array.isArray(raw?.authority)
            ? raw.authority.length
            : 0,
      resolver_response_time_ms:
        typeof raw?.resolver_response_time_ms === "number"
          ? raw.resolver_response_time_ms
          : 0,
      response_time_ms:
        typeof raw?.response_time_ms === "number"
          ? raw.response_time_ms
          : 0,
    };
  }

  const answers = Array.isArray(data?.answers) ? data.answers : EMPTY_DNS_ANSWERS;
  const authority = Array.isArray(data?.authority) ? data.authority : EMPTY_DNS_ANSWERS;

  const availableRecordTypes = useMemo(() => {
    const types = new Set<string>();
    answers.forEach((ans) => {
      types.add(getAnswerType(ans));
    });
    return Array.from(types).sort();
  }, [answers]);

  const filteredAnswers = useMemo(() => {
    let result = answers;

    if (selectedTypeFilter !== "ALL") {
      result = result.filter(
        (ans) => getAnswerType(ans) === selectedTypeFilter,
      );
    }

    const q = searchFilter.trim().toLowerCase();
    if (q) {
      result = result.filter((ans) => {
        const val = getCleanRecordValue(ans).toLowerCase();
        const name = (ans.name ?? "").toLowerCase();
        const type = getAnswerType(ans).toLowerCase();
        return val.includes(q) || name.includes(q) || type.includes(q);
      });
    }

    return result;
  }, [answers, selectedTypeFilter, searchFilter]);

  async function performLookup(value?: string) {
    const rawInput = value !== undefined ? value : query;
    const normalized = normalizeDomain(rawInput);
    const selectedResolver = getResolverInfo(resolver);

    if (!rawInput.trim()) {
      const msg = "Please enter a domain or hostname to lookup.";
      setError(msg);
      await showError("Validation Error", msg);
      return;
    }

    if (looksLikeInjectionAttempt(rawInput)) {
      const msg =
        "The DNS resolver has feelings too. That input is not a DNS hostname. Maybe give the poor resolver a real domain instead. ❤️";
      setError(msg);
      await showWarning("WARNING • XSS DETECTED • NICE TRY", msg);
      return;
    }

    if (!normalized || !isValidHostname(normalized)) {
      const msg =
        "Enter a valid domain or hostname. URLs, paths, and IP addresses are not accepted here.";
      setError(msg);
      await showError("Validation Error", msg);
      return;
    }

    setError("");
    setStatus("loading");
    setData(null);
    setSelectedAnswer(null);
    setSelectedTypeFilter("ALL");
    setSearchFilter("");

    try {
      const result = await lookupDNS(normalized, recordType, resolver);
      const normalizedData = normalizeApiData(result);

      setData(normalizedData);
      setQuery(normalized);
      setStatus("completed");

      const count = normalizedData.answers?.length ?? 0;
      await showSuccess(
        "Lookup Completed",
        `Found ${count} DNS record(s) for ${normalized} via ${selectedResolver?.label ?? "resolver"}.`,
      );
    } catch (err) {
      console.error("DNS lookup error:", err);
      const rawMessage =
        err instanceof Error
          ? err.message
          : "The DNS lookup could not be completed.";
      const friendlyMessage = getFriendlyDnsError(rawMessage);

      setData(null);
      setError(friendlyMessage);
      setStatus("error");

      await showError("Lookup Failed", friendlyMessage);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status !== "loading") {
      await performLookup(query);
    }
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

  const resolverInfo = getResolverInfo(resolver);
  const resolverName = data?.resolver?.name ?? resolverInfo?.label ?? "—";
  const resolverServer = data?.resolver?.server ?? resolverInfo?.server ?? "—";

  const responseTime =
    typeof data?.response_time_ms === "number"
      ? `${data.response_time_ms.toFixed(1)} ms`
      : "—";

  const resolverResponseTime =
    typeof data?.resolver_response_time_ms === "number"
      ? `${data.resolver_response_time_ms.toFixed(1)} ms`
      : "—";

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
                  <Globe size={15} strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold text-xeoo-text sm:text-sm">
                    DNS LOOKUP
                  </h1>

                  <p className="truncate text-[11px] text-xeoo-muted">
                    Query authoritative DNS records, resolver status, and response latency.
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
                    htmlFor={domainInputId}
                    className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted"
                  >
                    Domain / Hostname
                  </label>

                  <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-center">
                    {/* DOMAIN INPUT */}
                    <div className="relative min-w-0 flex-1">
                      <Globe
                        size={13}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xeoo-muted"
                      />

                      <input
                        id={domainInputId}
                        type="text"
                        value={query}
                        onChange={(event) => {
                          setQuery(event.target.value);
                          if (error) setError("");
                        }}
                        placeholder="e.g. google.com or cloudflare.com"
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
                          aria-label="Clear domain input"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {/* RECORD TYPE DROPDOWN */}
                    <div className="shrink-0">
                      <RecordTypeDropdown
                        value={recordType}
                        onChange={setRecordType}
                        disabled={status === "loading"}
                      />
                    </div>

                    {/* RESOLVER DROPDOWN */}
                    <div className="shrink-0">
                      <ResolverDropdown
                        value={resolver}
                        onChange={setResolver}
                        disabled={status === "loading"}
                      />
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button
                      type="submit"
                      disabled={status === "loading" || !query.trim()}
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
                  <Globe size={14} className="shrink-0 text-xeoo-muted" />

                  <div className="min-w-0">
                    <h2 className="truncate text-xs font-extrabold text-xeoo-text">
                      LOOKUP RESULTS
                    </h2>

                    <p className="truncate text-[12px] text-xeoo-muted">
                      {cleanDnsText(data.domain || query)} · {data.requested_type ?? recordType} · {answers.length} records found
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-xeoo-border bg-xeoo-surface px-2 py-0.5 text-[11px] font-medium text-xeoo-muted">
                    Resolver: {resolverName} ({resolverServer})
                  </span>

                  <button
                    type="button"
                    onClick={() => void performLookup(data.domain || query)}
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
                  {/* TARGET DOMAIN */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Target Domain
                    </div>

                    <div
                      className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text"
                      title={data.domain || query}
                    >
                      {cleanDnsText(data.domain || query)}
                    </div>

                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      Queried hostname
                    </div>
                  </div>

                  {/* RECORDS FOUND */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Records Found
                    </div>

                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        {answers.length}
                      </span>
                      <span className="text-[11px] text-xeoo-muted">
                        answer records
                      </span>
                    </div>

                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Type: {data.requested_type ?? recordType}
                    </div>
                  </div>

                  {/* RESPONSE TIME */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Response Time
                    </div>

                    <div className="mt-1 flex items-center gap-1.5">
                      <Clock3 size={13} className="text-xeoo-muted" />
                      <span className="font-mono text-[11px] font-bold text-xeoo-text">
                        {responseTime}
                      </span>
                    </div>

                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Round-trip latency
                    </div>
                  </div>

                  {/* DNS RESOLVER */}
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      DNS Resolver
                    </div>

                    <div
                      className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text"
                      title={resolverName}
                    >
                      {resolverName}
                    </div>

                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      {resolverServer} ({resolverResponseTime})
                    </div>
                  </div>
                </div>

                {/* ============================================================
                    RECORDS TABLE & FILTERS
                ============================================================ */}
                <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
                  {/* TOOLBAR */}
                  <div className="flex flex-col gap-2 border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-3.5">
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal size={13} className="text-xeoo-muted" />

                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                          Answer Records
                        </div>

                        <div className="mt-0.5 text-xs font-extrabold text-xeoo-text">
                          {filteredAnswers.length} Results
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* FILTER SEARCH INPUT */}
                      {answers.length > 4 && (
                        <div className="relative">
                          <Search
                            size={12}
                            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xeoo-muted"
                          />
                          <input
                            type="text"
                            value={searchFilter}
                            onChange={(event) =>
                              setSearchFilter(event.target.value)
                            }
                            placeholder="Filter records..."
                            className="h-8 w-36 rounded-md border border-xeoo-border bg-xeoo-surface pl-7 pr-2.5 text-[11px] text-xeoo-text outline-none placeholder:text-xeoo-muted focus:border-xeoo-primary sm:w-44"
                          />
                        </div>
                      )}

                      {/* FILTER TYPE BUTTONS */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTypeFilter("ALL");
                          setSearchFilter("");
                        }}
                        className={[
                          "inline-flex h-8 items-center justify-center rounded-md border px-2.5 text-[11px] font-bold transition-colors active:scale-[0.98]",
                          selectedTypeFilter === "ALL" && !searchFilter
                            ? "border-xeoo-text bg-xeoo-text text-xeoo-surface shadow-xs"
                            : "border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft hover:text-xeoo-text",
                        ].join(" ")}
                      >
                        All ({answers.length})
                      </button>

                      {availableRecordTypes.length > 1 &&
                        availableRecordTypes.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedTypeFilter(t)}
                            className={[
                              "inline-flex h-8 items-center justify-center rounded-md border px-2.5 text-[11px] font-bold transition-colors active:scale-[0.98]",
                              selectedTypeFilter === t
                                ? "border-xeoo-text bg-xeoo-text text-xeoo-surface shadow-xs"
                                : "border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft hover:text-xeoo-text",
                            ].join(" ")}
                          >
                            {t}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* DESKTOP TABLE */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[700px] border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-xeoo-surface-soft text-[11px] font-bold text-xeoo-text">
                          <th className="w-14 border-b border-r border-xeoo-border px-3.5 py-2.5 text-center">
                            #
                          </th>

                          <th className="w-20 border-b border-r border-xeoo-border px-3.5 py-2.5 text-center">
                            TYPE
                          </th>

                          <th className="w-44 border-b border-r border-xeoo-border px-3.5 py-2.5">
                            NAME / HOST
                          </th>

                          <th className="w-20 border-b border-r border-xeoo-border px-3.5 py-2.5 text-center">
                            TTL
                          </th>

                          <th className="border-b border-r border-xeoo-border px-3.5 py-2.5">
                            RECORD DATA / VALUE
                          </th>

                          <th className="w-28 border-b border-xeoo-border px-3.5 py-2.5 text-center">
                            ACTIONS
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredAnswers.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="border-b border-xeoo-border px-3.5 py-8 text-center text-[11px] text-xeoo-muted"
                            >
                              {answers.length === 0
                                ? "No answer records were returned by the DNS resolver."
                                : "No records match your filter criteria."}
                            </td>
                          </tr>
                        ) : (
                          filteredAnswers.map((answer, index) => {
                            const rawValue = getCleanRecordValue(answer);
                            const answerType = getAnswerType(answer);
                            const answerName =
                              typeof answer.name === "string" && answer.name.trim()
                                ? cleanDnsText(answer.name)
                                : "—";
                            const ttl =
                              typeof answer.ttl === "number" && Number.isFinite(answer.ttl)
                                ? `${answer.ttl}s`
                                : "—";

                            const zebraClass =
                              index % 2 === 0
                                ? "bg-xeoo-surface"
                                : "bg-xeoo-surface-soft/35";

                            return (
                              <tr
                                key={`${answerName}-${answerType}-${index}`}
                                className={[
                                  zebraClass,
                                  "transition-colors hover:bg-xeoo-primary-soft/35 dark:hover:bg-xeoo-primary-soft/10",
                                ].join(" ")}
                              >
                                {/* ROW NUMBER */}
                                <td className="border-b border-r border-xeoo-border px-3.5 py-2.5 text-center align-middle font-mono text-[11px] text-xeoo-muted">
                                  {index + 1}
                                </td>

                                {/* TYPE */}
                                <td className="border-b border-r border-xeoo-border px-3.5 py-2.5 text-center align-middle">
                                  <span className="inline-block rounded-md border border-xeoo-border bg-xeoo-surface-soft px-1.5 py-0.5 font-mono text-[10px] font-bold text-xeoo-primary">
                                    {answerType}
                                  </span>
                                </td>

                                {/* NAME */}
                                <td className="border-b border-r border-xeoo-border px-3.5 py-2.5 align-middle">
                                  <span
                                    className="block max-w-[180px] truncate font-mono text-[11px] font-medium text-xeoo-text"
                                    title={answerName}
                                  >
                                    {answerName}
                                  </span>
                                </td>

                                {/* TTL */}
                                <td className="border-b border-r border-xeoo-border px-3.5 py-2.5 text-center align-middle font-mono text-[11px] text-xeoo-muted">
                                  {ttl}
                                </td>

                                {/* VALUE */}
                                <td className="border-b border-r border-xeoo-border px-3.5 py-2.5 align-middle">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="max-w-[340px] truncate font-mono text-[11px] font-semibold text-xeoo-text"
                                      title={rawValue}
                                    >
                                      {rawValue || "—"}
                                    </span>

                                    {rawValue && (
                                      <button
                                        type="button"
                                        onClick={() => void handleCopyText(rawValue)}
                                        className="inline-flex items-center justify-center rounded p-1 text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                                        title="Copy value"
                                        aria-label="Copy record value"
                                      >
                                        {copiedText === rawValue ? (
                                          <Check
                                            size={11}
                                            className="text-green-600 dark:text-green-400"
                                          />
                                        ) : (
                                          <Copy size={11} />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </td>

                                {/* ACTIONS */}
                                <td className="whitespace-nowrap border-b border-xeoo-border px-3.5 py-2.5 text-center align-middle">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedAnswer(answer)}
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
                    {filteredAnswers.length === 0 ? (
                      <div className="px-3.5 py-8 text-center text-[11px] text-xeoo-muted">
                        {answers.length === 0
                          ? "No answer records were returned by the DNS resolver."
                          : "No records match your filter criteria."}
                      </div>
                    ) : (
                      filteredAnswers.map((answer, index) => {
                        const rawValue = getCleanRecordValue(answer);
                        const answerType = getAnswerType(answer);
                        const answerName =
                          typeof answer.name === "string" && answer.name.trim()
                            ? cleanDnsText(answer.name)
                            : "—";

                        return (
                          <div
                            key={`${answerName}-${answerType}-${index}`}
                            className="space-y-2 p-3 transition-colors hover:bg-xeoo-surface-soft/30"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="rounded-md border border-xeoo-border bg-xeoo-surface-soft px-1.5 py-0.5 font-mono text-[9px] font-bold text-xeoo-muted">
                                  #{index + 1}
                                </span>

                                <span className="rounded-md border border-xeoo-border bg-xeoo-surface-soft px-1.5 py-0.5 font-mono text-[10px] font-bold text-xeoo-primary">
                                  {answerType}
                                </span>

                                <span
                                  className="truncate font-mono text-[11px] font-semibold text-xeoo-text"
                                  title={answerName}
                                >
                                  {answerName}
                                </span>
                              </div>

                              {typeof answer.ttl === "number" && (
                                <span className="shrink-0 font-mono text-[10px] text-xeoo-muted">
                                  TTL {answer.ttl}s
                                </span>
                              )}
                            </div>

                            <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft/50 p-2 font-mono text-[11px] break-all text-xeoo-text">
                              {rawValue || "—"}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              {rawValue ? (
                                <button
                                  type="button"
                                  onClick={() => void handleCopyText(rawValue)}
                                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-xeoo-muted hover:text-xeoo-text"
                                >
                                  {copiedText === rawValue ? (
                                    <>
                                      <Check size={11} className="text-green-500" />
                                      <span>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={11} />
                                      <span>Copy Value</span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span />
                              )}

                              <button
                                type="button"
                                onClick={() => setSelectedAnswer(answer)}
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

                {/* ============================================================
                    AUTHORITY RECORDS (IF PRESENT)
                ============================================================ */}
                {authority.length > 0 && (
                  <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
                    <div className="border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2 sm:px-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Network size={13} className="text-xeoo-primary" />
                          <h3 className="text-xs font-bold text-xeoo-text">
                            Authority Records
                          </h3>
                        </div>
                        <span className="rounded-md bg-xeoo-surface-soft px-2 py-0.5 text-[10px] font-bold text-xeoo-muted">
                          {authority.length}
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-xeoo-border">
                      {authority.map((authAnswer, idx) => (
                        <div
                          key={`auth-${idx}`}
                          className="flex items-center justify-between gap-3 p-3 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="rounded-md border border-xeoo-border bg-xeoo-surface-soft px-1.5 py-0.5 font-mono text-[10px] font-bold text-xeoo-primary">
                                {getAnswerType(authAnswer)}
                              </span>
                              <span className="truncate font-mono text-[11px] font-medium text-xeoo-text">
                                {authAnswer.name || "—"}
                              </span>
                            </div>
                            <p className="mt-1 font-mono text-[11px] text-xeoo-muted truncate">
                              {getCleanRecordValue(authAnswer)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedAnswer(authAnswer)}
                            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-[10px] font-bold text-xeoo-text transition hover:bg-xeoo-surface-soft active:scale-95"
                          >
                            View Details
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* ============================================================
                    RESPONSE FLAGS & DIAGNOSTICS
                ============================================================ */}
                <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
                  <div className="border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2 sm:px-3.5">
                    <div className="flex items-center gap-2">
                      <Activity size={13} className="text-xeoo-primary" />
                      <h3 className="text-xs font-bold text-xeoo-text">
                        Response Flags & Protocol Details
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 sm:p-3.5 md:grid-cols-6">
                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 p-2 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                        Recursion Desired
                      </span>
                      <p className="mt-1 text-[11px] font-bold text-xeoo-text">
                        {data.flags?.recursion_desired ? "Yes" : "No"}
                      </p>
                    </div>

                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 p-2 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                        Recursion Avail
                      </span>
                      <p className="mt-1 text-[11px] font-bold text-xeoo-text">
                        {data.flags?.recursion_available ? "Yes" : "No"}
                      </p>
                    </div>

                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 p-2 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                        Authenticated
                      </span>
                      <p className="mt-1 text-[11px] font-bold text-xeoo-text">
                        {data.flags?.authenticated_data ? "Yes" : "No"}
                      </p>
                    </div>

                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 p-2 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                        Truncated
                      </span>
                      <p className="mt-1 text-[11px] font-bold text-xeoo-text">
                        {data.flags?.truncated ? "Yes" : "No"}
                      </p>
                    </div>

                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 p-2 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                        Check Disabled
                      </span>
                      <p className="mt-1 text-[11px] font-bold text-xeoo-text">
                        {data.flags?.checking_disabled ? "Yes" : "No"}
                      </p>
                    </div>

                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 p-2 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                        Status Code
                      </span>
                      <p className="mt-1 font-mono text-[11px] font-bold text-xeoo-text">
                        {data.status?.name ?? "NOERROR"} ({data.status?.code ?? 0})
                      </p>
                    </div>
                  </div>
                </section>

                {/* ============================================================
                    DISCLAIMER
                ============================================================ */}
                <div className="flex items-start gap-2.5 rounded-xl border border-xeoo-border bg-xeoo-surface-soft/40 p-3 text-[11px] text-xeoo-muted">
                  <Info size={14} className="mt-0.5 shrink-0 text-xeoo-muted" />
                  <p className="leading-relaxed">
                    DNS propagation, geographical routing, and caching policies vary across worldwide
                    resolvers. Results reflect the response directly returned by {resolverName} ({resolverServer})
                    at the moment of inquiry. Intended for public DNS diagnostics and verification.
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
      {selectedAnswer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dns-modal-title"
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
                  id="dns-modal-title"
                  className="text-xs font-bold uppercase tracking-wider text-xeoo-text sm:text-sm"
                >
                  DNS Record Details
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAnswer(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                title="Close modal"
                aria-label="Close details modal"
              >
                <X size={14} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="space-y-3.5 overflow-y-auto p-4 text-xs">
              {/* RECORD TYPE & HOST */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Record Type
                  </span>
                  <div className="mt-1 font-mono text-xs font-bold text-xeoo-primary">
                    {getAnswerType(selectedAnswer)}
                  </div>
                </div>

                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                    TTL (Time to Live)
                  </span>
                  <div className="mt-1 font-mono text-xs font-bold text-xeoo-text">
                    {typeof selectedAnswer.ttl === "number"
                      ? `${selectedAnswer.ttl} seconds`
                      : "Unavailable"}
                  </div>
                </div>
              </div>

              {/* HOSTNAME */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                  Name / Hostname
                </span>
                <div className="mt-1 break-all font-mono text-xs font-bold text-xeoo-text">
                  {selectedAnswer.name || "—"}
                </div>
              </div>

              {/* RAW VALUE */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Raw Record Data
                  </span>

                  {getCleanRecordValue(selectedAnswer) && (
                    <button
                      type="button"
                      onClick={() =>
                        void handleCopyText(getCleanRecordValue(selectedAnswer))
                      }
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-xeoo-muted hover:text-xeoo-text"
                    >
                      {copiedText === getCleanRecordValue(selectedAnswer) ? (
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
                  )}
                </div>

                <div className="mt-1.5 break-all font-mono text-xs font-semibold text-xeoo-text">
                  {getCleanRecordValue(selectedAnswer) || "—"}
                </div>

                {getRecordMeta(selectedAnswer) && (
                  <p className="mt-2 text-[11px] leading-relaxed text-xeoo-muted">
                    {cleanDnsText(getRecordMeta(selectedAnswer) || "")}
                  </p>
                )}
              </div>

              {/* STRUCTURED BREAKDOWN (IF ANY) */}
              {getStructuredRecordRows(selectedAnswer).length > 0 && (
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Structured Parameters
                  </span>

                  <div className="mt-2 divide-y divide-xeoo-border rounded-lg border border-xeoo-border bg-xeoo-surface-soft/30">
                    {getStructuredRecordRows(selectedAnswer).map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between gap-3 px-3 py-2 text-[11px]"
                      >
                        <span className="font-medium text-xeoo-muted">
                          {row.label}
                        </span>
                        <span className="font-mono font-bold text-xeoo-text">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-end border-t border-xeoo-border bg-xeoo-surface-soft/40 px-4 py-3">
              <button
                type="button"
                onClick={() => setSelectedAnswer(null)}
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