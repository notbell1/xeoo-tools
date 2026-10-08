import { BACKEND_URL } from "../../config/backend";

export type ScanStatus = "idle" | "scanning" | "completed" | "error";

export interface ReverseIpData {
  ip: string;
  ptr: string | null;
  domains_found: number;
  domains: string[];
  source: string;
}

export interface ReverseIpResponse {
  success: boolean;
  message: string;
  data?: ReverseIpData;
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
  /svg/i,
  /document\.cookie/i,
  /alert\s*\(/i,
  /prompt\s*\(/i,
  /confirm\s*\(/i,
  /[<>'"`]/,
];

const ROMANTIC_XSS_WARNINGS = [
  "Warning: Cinta boleh injection, input jangan. 😏",
  "Warning: Kalau mau cari perhatian, jangan lewat XSS. Cari yang sayang saja. ❤️",
  "Warning: Hubungan saja perlu validasi, apalagi input. XSS rejected. 💔",
  "Warning: Cinta sepihak masih bisa diperjuangkan. XSS tidak. 🥀",
  "Warning: Jangan spam script di sini. Chat dia saja belum tentu dibalas. 💌",
  "Warning: Hatiku terbuka, tapi form ini tertutup untuk script injection. 🔒",
];

export function getRandomRomanticXssWarning(): string {
  const index = Math.floor(Math.random() * ROMANTIC_XSS_WARNINGS.length);
  return ROMANTIC_XSS_WARNINGS[index] ?? ROMANTIC_XSS_WARNINGS[0];
}

/**
 * Validates IPv4 format.
 */
function isValidIpv4(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;

  return parts.every((part) => {
    if (!/^\d+$/.test(part)) return false;
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255 && (part === "0" || !part.startsWith("0"));
  });
}

/**
 * Validates IPv6 format.
 */
function isValidIpv6(ip: string): boolean {
  // Allow IPv6 with standard hexadecimal groups and single double-colon compression
  const ipv6Regex =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9]))$/;

  return ipv6Regex.test(ip);
}

/**
 * Normalizes user IP input.
 */
export function normalizeIpInput(raw: string): string {
  return raw.trim().replace(/^\[+|\]+$/g, "").toLowerCase();
}

/**
 * Validates input on client-side for UX and XSS attempt prevention.
 */
export function validateIpInput(input: string): ValidationResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      valid: false,
      error: "Please enter an IP address to lookup.",
    };
  }

  // 1. Check for XSS attempt patterns
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        valid: false,
        isXss: true,
        error: getRandomRomanticXssWarning(),
      };
    }
  }

  // 2. Reject URLs, schemes, paths
  if (
    /^(https?|file|ftp|gopher|php|data|javascript):/i.test(trimmed) ||
    trimmed.includes("/")
  ) {
    return {
      valid: false,
      error: "Invalid input. Please provide a plain IP address, not a URL or path.",
    };
  }

  // 3. Reject credentials
  if (trimmed.includes("@")) {
    return {
      valid: false,
      error: "Credentials in input are not permitted.",
    };
  }

  // 4. Length check (IPv6 max string length is 45)
  if (trimmed.length > 45) {
    return {
      valid: false,
      error: "IP address exceeds maximum allowed length of 45 characters.",
    };
  }

  // 5. Strict IPv4 / IPv6 validation
  const cleanIp = normalizeIpInput(trimmed);
  if (!isValidIpv4(cleanIp) && !isValidIpv6(cleanIp)) {
    return {
      valid: false,
      error: "Invalid IP address format. Please enter a valid IPv4 or IPv6 address (e.g., 8.8.8.8 or 2001:4860:4860::8888).",
    };
  }

  return { valid: true };
}

/**
 * Executes a reverse IP lookup request to the PHP backend.
 */
export async function runReverseIpLookup(
  ip: string,
  signal?: AbortSignal,
): Promise<ReverseIpData> {
  const cleanIp = normalizeIpInput(ip);

  const response = await fetch(`${BACKEND_URL}/api/reverse-ip-lookup.php`, {
    method: "POST",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Accept: "application/json",
    },
    body: JSON.stringify({ ip: cleanIp }),
  });

  const rawJson = await response.text();
  let json: ReverseIpResponse;

  try {
    json = JSON.parse(rawJson) as ReverseIpResponse;
  } catch {
    throw new Error(
      `Invalid server response (HTTP ${response.status}). The server returned malformed data.`,
    );
  }

  if (!response.ok || !json.success || !json.data) {
    throw new Error(
      json.message ||
        `Reverse IP lookup failed (HTTP ${response.status}). Please verify the IP and try again.`,
    );
  }

  return json.data;
}

