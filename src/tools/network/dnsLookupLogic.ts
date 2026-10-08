export type RecordType =
  | "A"
  | "AAAA"
  | "CNAME"
  | "MX"
  | "NS"
  | "TXT"
  | "SOA"
  | "CAA"
  | "SRV"
  | "ALL";

export type ResolverKey = "cloudflare" | "google" | "quad9";

export interface DnsAnswer {
  name: string | null;
  type: string | null;
  type_code: number | null;
  ttl: number | null;
  data: string | null;
  priority?: number | null;
  target?: string | null;
  port?: number | null;
  weight?: number | null;
  flags?: string | null;
  tag?: string | null;
  value?: string | null;
  mname?: string | null;
  rname?: string | null;
  serial?: number | null;
  refresh?: number | null;
  retry?: number | null;
  expire?: number | null;
  minimum?: number | null;
}

export interface DnsStatus {
  code: number | null;
  name: string | null;
}

export interface DnsFlags {
  truncated: boolean | null;
  recursion_desired: boolean | null;
  recursion_available: boolean | null;
  authenticated_data: boolean | null;
  checking_disabled: boolean | null;
}

export interface DnsResolver {
  name: string | null;
  server: string | null;
}

export interface DnsRecordGroup {
  type: string;
  answers: DnsAnswer[];
}

export interface DnsData {
  status: DnsStatus;
  answer_count: number | null;
  answers: DnsAnswer[];
  authority_count: number | null;
  authority: DnsAnswer[];
  flags: DnsFlags;
  resolver_response_time_ms: number | null;
  domain: string | null;
  requested_type: string | null;
  resolver: DnsResolver | null;
  response_time_ms: number | null;
}

export interface DnsApiResponse {
  success: boolean;
  message: string;
  data?: DnsData;
}

export const API_BASE =
  import.meta.env.VITE_API_URL || "/php/api";

export const RECORD_TYPES: Array<{
  value: RecordType;
  label: string;
  description: string;
}> = [
  {
    value: "A",
    label: "A",
    description: "IPv4 Address",
  },
  {
    value: "AAAA",
    label: "AAAA",
    description: "IPv6 Address",
  },
  {
    value: "CNAME",
    label: "CNAME",
    description: "Canonical Name",
  },
  {
    value: "MX",
    label: "MX",
    description: "Mail Exchange",
  },
  {
    value: "NS",
    label: "NS",
    description: "Name Server",
  },
  {
    value: "TXT",
    label: "TXT",
    description: "Text Record",
  },
  {
    value: "SOA",
    label: "SOA",
    description: "Start of Authority",
  },
  {
    value: "CAA",
    label: "CAA",
    description: "Certification Authority Authorization",
  },
  {
    value: "SRV",
    label: "SRV",
    description: "Service Record",
  },
  {
    value: "ALL",
    label: "ALL",
    description: "All Supported Records",
  },
];

export const RESOLVERS: Array<{
  value: ResolverKey;
  label: string;
  server: string;
}> = [
  {
    value: "cloudflare",
    label: "Cloudflare",
    server: "1.1.1.1",
  },
  {
    value: "google",
    label: "Google",
    server: "8.8.8.8",
  },
  {
    value: "quad9",
    label: "Quad9",
    server: "9.9.9.9",
  },
];

/**
 * Normalisasi input domain/host.
 *
 * Dapat menerima:
 * - example.com
 * - example.com/
 * - www.example.com
 * - http://example.com
 * - https://example.com
 * - http://www.example.com/
 * - https://www.example.com/path
 * - https://www.example.com/path?foo=bar#test
 *
 * Hasil akhirnya hanya hostname:
 * example.com
 */
export function normalizeDomain(value: string): string {
  let input = value.trim();

  if (!input) {
    return "";
  }

  // Jika user memasukkan //example.com
  if (input.startsWith("//")) {
    input = `https:${input}`;
  }

  // Jika tidak ada protocol, tambahkan https://
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(input)) {
    input = `https://${input}`;
  }

  try {
    const url = new URL(input);

    let hostname = url.hostname
      .trim()
      .toLowerCase();

    // URL.hostname bisa mengandung IPv6 bracket.
    hostname = hostname.replace(/^\[|\]$/g, "");

    // DNS lookup kita membutuhkan domain/hostname,
    // bukan prefix www.
    if (hostname.startsWith("www.")) {
      hostname = hostname.slice(4);
    }

    // Hilangkan trailing dot.
    hostname = hostname.replace(/\.+$/, "");

    return hostname;
  } catch {
    // Fallback untuk input sederhana seperti:
    // example.com/
    // www.example.com/
    // example.com/path
    let fallback = value
      .trim()
      .replace(
        /^[a-z][a-z0-9+.-]*:\/\//i,
        "",
      )
      .replace(/^\/\//, "")
      .split(/[/?#]/)[0]
      .trim()
      .toLowerCase();

    if (fallback.startsWith("www.")) {
      fallback = fallback.slice(4);
    }

    fallback = fallback.replace(/\.+$/, "");

    return fallback;
  }
}

/**
 * Validasi hostname/domain.
 *
 * Mendukung:
 * - domain.com
 * - sub.domain.com
 * - _dmarc.domain.com
 * - _sip._tcp.domain.com
 */
export function isValidHostname(value: string): boolean {
  const hostname = normalizeDomain(value);

  if (!hostname) {
    return false;
  }

  // Panjang maksimum hostname DNS.
  if (hostname.length > 253) {
    return false;
  }

  // Jangan menerima IP sebagai domain DNS lookup.
  if (isIPv4(hostname) || isIPv6(hostname)) {
    return false;
  }

  // Domain dengan underscore diperbolehkan karena record
  // seperti _dmarc, _domainkey, dan _sip._tcp memang valid.
  const labels = hostname.split(".");

  if (labels.length < 2) {
    return false;
  }

  for (const label of labels) {
    if (!label) {
      return false;
    }

    if (label.length > 63) {
      return false;
    }

    if (!/^[a-z0-9_-]+$/i.test(label)) {
      return false;
    }

    if (
      label.startsWith("-") ||
      label.endsWith("-")
    ) {
      return false;
    }
  }

  // TLD normalnya minimal 2 karakter.
  const tld = labels[labels.length - 1];

  if (!tld || tld.length < 2) {
    return false;
  }

  return true;
}

function isIPv4(value: string): boolean {
  const parts = value.split(".");

  if (parts.length !== 4) {
    return false;
  }

  return parts.every((part) => {
    if (!/^\d+$/.test(part)) {
      return false;
    }

    const number = Number(part);

    return (
      number >= 0 &&
      number <= 255
    );
  });
}

function isIPv6(value: string): boolean {
  return value.includes(":");
}

export function formatTtl(
  ttl: number | null | undefined,
): string {
  if (
    ttl === null ||
    ttl === undefined ||
    !Number.isFinite(ttl)
  ) {
    return "—";
  }

  if (ttl < 60) {
    return `${ttl}s`;
  }

  if (ttl < 3600) {
    const minutes = Math.floor(ttl / 60);
    const seconds = ttl % 60;

    if (seconds === 0) {
      return `${minutes}m`;
    }

    return `${minutes}m ${seconds}s`;
  }

  if (ttl < 86400) {
    const hours = Math.floor(ttl / 3600);
    const minutes = Math.floor(
      (ttl % 3600) / 60,
    );

    if (minutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
  }

  const days = Math.floor(ttl / 86400);
  const hours = Math.floor(
    (ttl % 86400) / 3600,
  );

  if (hours === 0) {
    return `${days}d`;
  }

  return `${days}d ${hours}h`;
}

export function formatMilliseconds(
  value: number | null | undefined,
): string {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return `${value.toFixed(2)} ms`;
}

export function getStatusClass(
  code: number | null | undefined,
): string {
  if (code === 0) {
    return "text-emerald-600";
  }

  if (code === 3) {
    return "text-amber-600";
  }

  return "text-red-600";
}

export function getRecordValue(
  answer: DnsAnswer,
): string {
  if (answer.data !== null && answer.data !== undefined) {
    return answer.data;
  }

  if (
    answer.value !== null &&
    answer.value !== undefined
  ) {
    return answer.value;
  }

  if (
    answer.target !== null &&
    answer.target !== undefined
  ) {
    return answer.target;
  }

  return "—";
}

export function getRecordMeta(
  answer: DnsAnswer,
): string {
  const parts: string[] = [];

  if (
    answer.priority !== null &&
    answer.priority !== undefined
  ) {
    parts.push(`Priority ${answer.priority}`);
  }

  if (
    answer.weight !== null &&
    answer.weight !== undefined
  ) {
    parts.push(`Weight ${answer.weight}`);
  }

  if (
    answer.port !== null &&
    answer.port !== undefined
  ) {
    parts.push(`Port ${answer.port}`);
  }

  if (
    answer.tag !== null &&
    answer.tag !== undefined
  ) {
    parts.push(`Tag ${answer.tag}`);
  }

  return parts.join(" • ");
}

export function getRecordTypeInfo(
  type: string | null | undefined,
): {
  label: string;
  description: string;
} {
  const normalized =
    type?.toUpperCase() || "UNKNOWN";

  const found = RECORD_TYPES.find(
    (item) => item.value === normalized,
  );

  if (found) {
    return {
      label: found.label,
      description: found.description,
    };
  }

  return {
    label: normalized,
    description: "DNS Record",
  };
}

export function getResolverInfo(
  resolver: ResolverKey,
) {
  return (
    RESOLVERS.find(
      (item) => item.value === resolver,
    ) || RESOLVERS[0]
  );
}

export async function lookupDNS(
  domain: string,
  type: RecordType,
  resolver: ResolverKey,
): Promise<DnsApiResponse> {
  const normalizedDomain =
    normalizeDomain(domain);

  if (!normalizedDomain) {
    throw new Error(
      "Host atau domain wajib diisi.",
    );
  }

  if (!isValidHostname(normalizedDomain)) {
    throw new Error(
      "Host atau domain tidak valid.",
    );
  }

  const params = new URLSearchParams({
    domain: normalizedDomain,
    type,
    resolver,
  });

  const response = await fetch(
    `${API_BASE}/dns-lookup.php?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  const contentType =
    response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      "Server mengembalikan response yang bukan JSON.",
    );
  }

  const result =
    (await response.json()) as DnsApiResponse;

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "DNS lookup gagal.",
    );
  }

  return result;
}