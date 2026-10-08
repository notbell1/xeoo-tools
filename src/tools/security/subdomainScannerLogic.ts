import { BACKEND_URL } from "../../config/backend";

export type ScanStatus = "idle" | "scanning" | "completed" | "error";

export type SubdomainStatus = "RESOLVED" | "UNRESOLVED" | "ERROR";

export interface SubdomainItem {
  hostname: string;
  status: SubdomainStatus;
  a: string[];
  aaaa: string[];
  cname: string[];
}

export interface SubdomainScanResult {
  target: string;
  source: string;
  discovered: number;
  resolved: number;
  unresolved: number;
  errors: number;
  results: SubdomainItem[];
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: SubdomainScanResult;
}

/**
 * Normalizes user target input for client-side UX.
 */
export function normalizeTargetInput(raw: string): string {
  const trimmed = raw.trim().replace(/^['"<(\[]+|['">)\]]+$/g, "");
  // Strip protocol
  const withoutProtocol = trimmed.replace(/^https?:\/\//i, "");
  // Strip path or port
  const hostPart = withoutProtocol.split(/[/?#:]/)[0] ?? withoutProtocol;
  return hostPart.toLowerCase().replace(/\.+$/, "");
}

/**
 * Client-side preliminary syntax validation for immediate UX feedback.
 * (Authoritative validation and SSRF defenses strictly execute on the PHP backend.)
 */
export function validateTargetInput(input: string): {
  valid: boolean;
  error?: string;
} {
  const clean = normalizeTargetInput(input);

  if (!clean) {
    return {
      valid: false,
      error: "Please enter a target domain to scan (e.g., example.com).",
    };
  }

  // Reject unsupported schemes
  const forbiddenScheme = input
    .trim()
    .match(
      /^(file|ftp|gopher|data|javascript|php|ssh|telnet|dict|ldap|mailto):/i,
    );
  if (forbiddenScheme) {
    return {
      valid: false,
      error: `Scheme '${forbiddenScheme[1]}:' is not supported. Please provide a domain name.`,
    };
  }

  // Reject embedded credentials
  if (/@/.test(input)) {
    return {
      valid: false,
      error: "Credentials in URLs (user:pass@host) are not permitted.",
    };
  }

  // Reject localhost or obvious internal loopbacks early
  if (
    /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/.*)?$/i.test(
      input.trim(),
    )
  ) {
    return {
      valid: false,
      error: "Scanning localhost or internal destinations is not permitted.",
    };
  }

  // IP addresses cannot have subdomains
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(clean) || clean.includes(":")) {
    return {
      valid: false,
      error:
        "IP addresses cannot be scanned for subdomains. Please provide a domain name (e.g., example.com).",
    };
  }

  // Must contain at least one dot
  if (!clean.includes(".")) {
    return {
      valid: false,
      error:
        "Please enter a valid domain containing an extension (e.g., example.com).",
    };
  }

  // Length check (RFC 1035)
  if (clean.length > 253) {
    return {
      valid: false,
      error: "Domain exceeds maximum allowed length of 253 characters.",
    };
  }

  // Character validation
  if (
    !/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(
      clean,
    )
  ) {
    return {
      valid: false,
      error:
        "Invalid domain format. Only letters, numbers, hyphens, and dots are permitted.",
    };
  }

  return { valid: true };
}

/**
 * Returns badge styling classes for subdomain resolution statuses.
 */
export function getStatusBadgeClass(status: SubdomainStatus): {
  container: string;
  dot: string;
} {
  switch (status) {
    case "RESOLVED":
      return {
        container:
          "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-600 dark:text-white",
        dot: "bg-white",
      };

    case "UNRESOLVED":
      return {
        container:
          "border-orange-600 bg-orange-600 text-white dark:border-orange-500 dark:bg-orange-600 dark:text-white",
        dot: "bg-white",
      };

    case "ERROR":
    default:
      return {
        container:
          "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-600 dark:text-white",
        dot: "bg-white",
      };
  }
}

/**
 * Executes a subdomain scan via the PHP backend.
 */
export async function runSubdomainScan(
  target: string,
  signal?: AbortSignal,
): Promise<SubdomainScanResult> {
  const cleanTarget = normalizeTargetInput(target);

  const response = await fetch(`${BACKEND_URL}/api/subdomain-scan.php`, {
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
  let json: ApiResponse;

  try {
    json = JSON.parse(rawJson) as ApiResponse;
  } catch {
    throw new Error(
      `Invalid server response (HTTP ${response.status}). The server returned malformed data.`,
    );
  }

  if (!response.ok || !json.success || !json.data) {
    throw new Error(
      json.message ||
        `Subdomain scan failed (HTTP ${response.status}). Please verify the domain and try again.`,
    );
  }

  return json.data;
}
