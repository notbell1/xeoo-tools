import { BACKEND_URL } from "../../config/backend";

export type ScanStatus = "idle" | "checking" | "completed" | "error";

export interface DaPaData {
  target: string;
  domain: string;
  da: number | null;
  pa: number | null;
  spam_score?: number | null;
  linking_root_domains?: number | null;
  backlinks?: number | null;
  source: string;
  checked_at?: string;
}

export interface DaPaResponse {
  success: boolean;
  message: string;
  data?: DaPaData;
}

export interface ValidationResult {
  valid: boolean;
  isXss?: boolean;
  error?: string;
}

const XSS_PATTERNS = [
  /<script/i,
  /<\/script/i,
  /javascript:/i,
  /onerror\s*=/i,
  /onload\s*=/i,
  /onclick\s*=/i,
  /<iframe/i,
  /<img/i,
  /<svg/i,
  /document\.cookie/i,
  /alert\s*\(/i,
  /prompt\s*\(/i,
  /confirm\s*\(/i,
  /[<>'"`]/,
];

const WITTY_XSS_WARNINGS = [
  "Warning: SEO metrics dulu. Drama XSS belakangan. 😏",
  "WARNING • Nice try. DA/PA checks accept URLs, not love letters to the DOM. ❤️",
  "Warning: Kalau mau cari perhatian, jangan lewat <script>. Input rejected.",
  "Warning: Hubungan saja perlu validasi, apalagi input. XSS rejected. 💔",
];

export function getRandomWittyXssWarning(): string {
  const index = Math.floor(Math.random() * WITTY_XSS_WARNINGS.length);
  return WITTY_XSS_WARNINGS[index] ?? WITTY_XSS_WARNINGS[0];
}

/**
 * Normalizes user target input to a clean URL.
 * Preserves the page path for Page Authority (PA), while dropping fragments (#...).
 */
export function normalizeTarget(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  // Drop any fragment (#...)
  const noFragment = trimmed.split("#")[0] ?? trimmed;

  // Prepend https:// if protocol is absent
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(noFragment);
  const withScheme = hasScheme ? noFragment : `https://${noFragment}`;

  try {
    const url = new URL(withScheme);
    // Lowercase hostname
    url.hostname = url.hostname.toLowerCase();
    return url.toString();
  } catch {
    return withScheme;
  }
}

/**
 * Extracts the root domain/host from a target URL or input.
 */
export function extractDomain(target: string): string {
  const normalized = normalizeTarget(target);
  try {
    const url = new URL(normalized);
    return url.hostname.toLowerCase();
  } catch {
    return target.trim().toLowerCase();
  }
}

/**
 * Validates input on client-side for immediate UX feedback and security checks.
 */
export function validateTargetInput(input: string): ValidationResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      valid: false,
      error: "Please enter a website domain or URL to check.",
    };
  }

  // 1. Check for XSS attempt patterns
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        valid: false,
        isXss: true,
        error: getRandomWittyXssWarning(),
      };
    }
  }

  // 2. Reject disallowed schemes
  if (
    /^(ftp|file|gopher|ssh|data|blob|php|javascript):/i.test(trimmed)
  ) {
    return {
      valid: false,
      error: "Unsupported protocol scheme. Only HTTP and HTTPS URLs are accepted.",
    };
  }

  // 3. Reject credentials
  if (trimmed.includes("@")) {
    return {
      valid: false,
      error: "URLs containing user credentials are not allowed.",
    };
  }

  // 4. Max length check
  if (trimmed.length > 2048) {
    return {
      valid: false,
      error: "Target URL exceeds maximum length of 2,048 characters.",
    };
  }

  // 5. URL structure and Hostname validation
  const normalized = normalizeTarget(trimmed);
  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return {
      valid: false,
      error: "Please enter a valid website domain or URL (e.g., example.com).",
    };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      valid: false,
      error: "Only HTTP and HTTPS URLs are supported.",
    };
  }

  const host = parsed.hostname.toLowerCase();
  if (host.length > 253) {
    return {
      valid: false,
      error: "Hostname exceeds maximum allowed length of 253 characters.",
    };
  }

  // Reject local and internal hostnames
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".test")
  ) {
    return {
      valid: false,
      error: "Local or internal hostnames cannot be checked.",
    };
  }

  // Check IPv4 private/reserved ranges if IP
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
    const parts = host.split(".").map(Number);
    if (parts.some((p) => p < 0 || p > 255)) {
      return { valid: false, error: "Invalid IP address format." };
    }
    const [p0, p1] = parts;
    if (
      p0 === 127 || // loopback
      p0 === 10 || // private 10.0.0.0/8
      (p0 === 172 && p1 !== undefined && p1 >= 16 && p1 <= 31) || // private 172.16.0.0/12
      (p0 === 192 && p1 === 168) || // private 192.168.0.0/16
      (p0 === 169 && p1 === 254) || // link-local 169.254.0.0/16
      p0 === 0
    ) {
      return {
        valid: false,
        error: "Private or reserved IP addresses cannot be checked.",
      };
    }
  }

  return { valid: true };
}

/**
 * Calls the backend API to check DA/PA metrics via authorized provider.
 */
export async function checkDaPa(
  target: string,
  signal?: AbortSignal,
): Promise<DaPaData> {
  const cleanTarget = normalizeTarget(target);

  const response = await fetch(`${BACKEND_URL}/api/da-pa-checker.php`, {
    method: "POST",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Accept: "application/json",
    },
    body: JSON.stringify({ target: cleanTarget }),
  });

  const rawJson = await response.text();
  let json: DaPaResponse;

  try {
    json = JSON.parse(rawJson) as DaPaResponse;
  } catch {
    throw new Error(
      `Invalid server response (HTTP ${response.status}). The server returned malformed data.`,
    );
  }

  if (!response.ok || !json.success || !json.data) {
    throw new Error(
      json.message ||
        `DA/PA check failed (HTTP ${response.status}). Please try again later.`,
    );
  }

  return json.data;
}

/**
 * Formats a metric score into a clean display string.
 */
export function formatMetricScore(val: number | null | undefined): string {
  if (val === null || val === undefined || !Number.isFinite(val)) {
    return "Not available";
  }
  return String(val);
}

/**
 * Formats large count numbers (e.g. backlinks, linking domains) with comma separators.
 */
export function formatMetricCount(val: number | null | undefined): string {
  if (val === null || val === undefined || !Number.isFinite(val)) {
    return "Not available";
  }
  return new Intl.NumberFormat().format(val);
}

