import { BACKEND_URL } from "../../config/backend";

export type ScanStatus = "idle" | "scanning" | "completed" | "error";

export type ConfidenceLevel = "High" | "Medium" | "Low";

export type SurfaceType =
  | "LOGIN PAGE"
  | "ADMIN PAGE"
  | "POSSIBLE AUTH SURFACE"
  | "BLOCKED"
  | "NOT DETECTED"
  | "INCONCLUSIVE"
  | "ERROR";

export type CandidateSurface = {
  url: string;
  path: string;
  host: string;
  category: string;
  type: SurfaceType;
  confidence: ConfidenceLevel;
  http_status: number | null;
  elapsed_ms: number;
  signals: string[];
};

export type DiscoveredHost = {
  host: string;
  status: "Active" | "Timeout" | "Blocked";
  ip: string | null;
};

export type AdminFinderResult = {
  target: string;
  active_url: string;
  final_url: string;
  scan_time_ms: number;
  discovered_hosts_count: number;
  live_hosts_count: number;
  auth_surfaces_count: number;
  hosts: DiscoveredHost[];
  surfaces: CandidateSurface[];
};

export type SarcasticBlock = {
  title: string;
  message: string;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: AdminFinderResult | null;
};

/**
 * Normalizes user target input for client-side UX.
 */
export function normalizeTargetInput(raw: string): string {
  const trimmed = raw.trim().replace(/^['"<([)]+|['">)\]]+$/g, "");
  return trimmed.replace(/\/+$/, "");
}

/**
 * Client-side preliminary syntax and SSRF-awareness check for immediate UX feedback.
 * (Authoritative validation and SSRF defenses strictly execute on the PHP backend.)
 */
export function validateTargetInput(input: string): {
  valid: boolean;
  error?: string;
  sarcasticBlock?: SarcasticBlock;
} {
  const clean = normalizeTargetInput(input);

  if (!clean) {
    return {
      valid: false,
      error: "Please enter a target URL or domain to scan.",
    };
  }

  // Pre-filter dangerous schemes
  const lower = clean.toLowerCase();
  if (
    lower.startsWith("file:") ||
    lower.startsWith("ftp:") ||
    lower.startsWith("gopher:") ||
    lower.startsWith("php:") ||
    lower.startsWith("dict:") ||
    lower.startsWith("ldap:") ||
    lower.startsWith("javascript:") ||
    lower.startsWith("data:")
  ) {
    return {
      valid: false,
      error: "Unsupported protocol scheme.",
      sarcasticBlock: {
        title: "Almost impressive.",
        message: "Unfortunately, that protocol isn't getting through.",
      },
    };
  }

  // Extract host part
  let hostPart = clean;
  if (/^https?:\/\//i.test(hostPart)) {
    try {
      const parsed = new URL(hostPart);
      hostPart = parsed.hostname;
    } catch {
      return {
        valid: false,
        error: "Invalid target URL structure.",
      };
    }
  } else {
    hostPart = hostPart.split("/")[0].split(":")[0];
  }

  const hostLower = hostPart.toLowerCase();

  // Client-side detection of private/loopback/cloud metadata destinations
  const isPrivateOrLoopback =
    hostLower === "localhost" ||
    hostLower === "localhost.localdomain" ||
    hostLower === "127.0.0.1" ||
    hostLower.startsWith("127.") ||
    hostLower === "0.0.0.0" ||
    hostLower === "::1" ||
    hostLower === "169.254.169.254" ||
    hostLower.startsWith("169.254.") ||
    hostLower.startsWith("192.168.") ||
    hostLower.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostLower) ||
    hostLower.endsWith(".local") ||
    hostLower.endsWith(".internal");

  if (isPrivateOrLoopback) {
    return {
      valid: false,
      error: "Scanning internal or private network targets is forbidden.",
      sarcasticBlock: {
        title: "Good imagination.",
        message: "The server isn't visiting that destination.",
      },
    };
  }

  // Basic domain or IP validation
  const domainPattern =
    /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  const ipPattern =
    /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4}$/;

  if (!domainPattern.test(hostPart) && !ipPattern.test(hostPart)) {
    return {
      valid: false,
      error: "Please enter a valid domain name (e.g. example.com).",
    };
  }

  return { valid: true };
}

/**
 * Returns sarcastic messages for server rejection responses.
 */
export function getSarcasticBlockMessage(
  status: number,
  backendMessage = "",
): SarcasticBlock {
  if (status === 429) {
    return {
      title: "Easy there, cowboy.",
      message:
        backendMessage ||
        "The scanner needs a breather. Please wait a moment before trying again.",
    };
  }

  const lower = backendMessage.toLowerCase();
  if (
    lower.includes("ssrf") ||
    lower.includes("private") ||
    lower.includes("reserved") ||
    lower.includes("internal")
  ) {
    return {
      title: "Good imagination.",
      message: "The server isn't visiting that destination.",
    };
  }

  if (status === 400 || lower.includes("invalid") || lower.includes("scheme")) {
    return {
      title: "Almost impressive.",
      message:
        backendMessage || "Unfortunately, that input isn't getting through.",
    };
  }

  return {
    title: "Nice try.",
    message:
      backendMessage || "That request didn't make it past the security gate.",
  };
}

/**
 * Executes the Admin Finder scan against the PHP backend.
 */
export async function runAdminFinderScan(
  target: string,
  signal?: AbortSignal,
): Promise<AdminFinderResult> {
  const cleanTarget = normalizeTargetInput(target);

  const response = await fetch(`${BACKEND_URL}/api/admin-finder.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ target: cleanTarget, url: cleanTarget }),
    signal,
  });

  const rawJson = (await response
    .json()
    .catch(() => null)) as ApiResponse | null;

  if (!response.ok || !rawJson?.success || !rawJson?.data) {
    const errorMsg =
      rawJson?.message || `Request failed with status code ${response.status}.`;
    const err = new Error(errorMsg) as Error & {
      httpStatus?: number;
      sarcasticBlock?: SarcasticBlock;
    };
    err.httpStatus = response.status;
    err.sarcasticBlock = getSarcasticBlockMessage(response.status, errorMsg);
    throw err;
  }

  return rawJson.data;
}

/**
 * Generates and triggers local JSON download.
 */
export function exportAsJson(result: AdminFinderResult): void {
  const jsonContent = JSON.stringify(result, null, 2);
  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8",
  });
  const sanitizedHost = result.target.replace(/[^a-zA-Z0-9.-]/g, "-");
  const filename = `admin-finder-${sanitizedHost}.json`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Generates and triggers local CSV download.
 */
export function exportAsCsv(result: AdminFinderResult): void {
  const escapeCsv = (str: string | number | null | undefined): string => {
    if (str === null || str === undefined) return '""';
    const val = String(str).replace(/"/g, '""');
    return `"${val}"`;
  };

  const header = [
    "Type",
    "Confidence",
    "URL",
    "Host",
    "Path",
    "Category",
    "HTTP Status",
    "Latency (ms)",
    "Signals",
  ];

  const rows = result.surfaces.map((s) => [
    escapeCsv(s.type),
    escapeCsv(s.confidence),
    escapeCsv(s.url),
    escapeCsv(s.host),
    escapeCsv(s.path),
    escapeCsv(s.category),
    escapeCsv(s.http_status ?? "N/A"),
    escapeCsv(s.elapsed_ms),
    escapeCsv(s.signals.join("; ")),
  ]);

  const csvContent =
    "\uFEFF" + [header.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const sanitizedHost = result.target.replace(/[^a-zA-Z0-9.-]/g, "-");
  const filename = `admin-finder-${sanitizedHost}.csv`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * UI Badges and Theme Color Helpers
 */

export function getConfidenceBadgeClass(confidence: ConfidenceLevel): string {
  switch (confidence) {
    case "High":
      return "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-600 dark:text-white font-bold";

    case "Medium":
      return "border-orange-500 bg-orange-500 text-white dark:border-orange-400 dark:bg-orange-500 dark:text-white font-bold";

    case "Low":
    default:
      return "border-slate-500 bg-slate-500 text-white dark:border-slate-400 dark:bg-slate-600 dark:text-white font-bold";
  }
}

export function getSurfaceTypeBadgeClass(type: SurfaceType): string {
  switch (type) {
    case "LOGIN PAGE":
      return "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-600 dark:text-white font-bold";

    case "ADMIN PAGE":
      return "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-600 dark:text-white font-bold";

    case "POSSIBLE AUTH SURFACE":
      return "border-orange-500 bg-orange-500 text-white dark:border-orange-400 dark:bg-orange-500 dark:text-white font-bold";

    case "BLOCKED":
      return "border-orange-600 bg-orange-600 text-white dark:border-orange-500 dark:bg-orange-600 dark:text-white font-bold";

    case "NOT DETECTED":
      return "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-600 dark:text-white font-bold";

    case "INCONCLUSIVE":
      return "border-orange-500 bg-orange-500 text-white dark:border-orange-400 dark:bg-orange-500 dark:text-white font-bold";

    case "ERROR":
      return "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-600 dark:text-white font-bold";

    default:
      return "border-slate-500 bg-slate-500 text-white dark:border-slate-400 dark:bg-slate-600 dark:text-white font-bold";
  }
}

export function getHttpStatusBadgeClass(status: number | null): string {
  if (status === null) {
    return "border-slate-500 bg-slate-500 text-white dark:border-slate-400 dark:bg-slate-600 dark:text-white font-bold";
  }

  // 2xx = successful response
  if (status >= 200 && status < 300) {
    return "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-600 dark:text-white font-bold";
  }

  // 3xx = redirect / neutral
  if (status >= 300 && status < 400) {
    return "border-slate-500 bg-slate-500 text-white dark:border-slate-400 dark:bg-slate-600 dark:text-white font-bold";
  }

  // Authentication / authorization block
  if (status === 401 || status === 403) {
    return "border-orange-500 bg-orange-500 text-white dark:border-orange-400 dark:bg-orange-500 dark:text-white font-bold";
  }

  // Client errors
  if (status >= 400 && status < 500) {
    return "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-600 dark:text-white font-bold";
  }

  // Server errors
  return "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-600 dark:text-white font-bold";
}

export function getHostStatusBadgeClass(status: string): string {
  switch (status) {
    case "Active":
      return "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-600 dark:text-white font-bold";

    case "Timeout":
      return "border-orange-500 bg-orange-500 text-white dark:border-orange-400 dark:bg-orange-500 dark:text-white font-bold";

    case "Blocked":
      return "border-orange-600 bg-orange-600 text-white dark:border-orange-500 dark:bg-orange-600 dark:text-white font-bold";

    default:
      return "border-slate-500 bg-slate-500 text-white dark:border-slate-400 dark:bg-slate-600 dark:text-white font-bold";
  }
}
