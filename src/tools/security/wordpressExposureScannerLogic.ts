import { BACKEND_URL } from "../../config/backend";

export type ScanStatus = "idle" | "scanning" | "completed" | "error";

export type EndpointStatus =
  | "DETECTED"
  | "BLOCKED"
  | "NOT FOUND"
  | "SERVER ERROR"
  | "NOT DETECTED"
  | "TIMEOUT"
  | "SSL ERROR"
  | "CONNECTION ERROR"
  | "ERROR";

export type Assessment =
  | "POTENTIALLY VULNERABLE"
  | "INCONCLUSIVE"
  | "NOT DETECTED"
  | "ERROR";

export type WordPressInfo = {
  detected: boolean;
  signals: string[];
};

export type RestApiInfo = {
  status: string;
  http_status: number | null;
  url: string;
  detail: string;
};

export type ExposureSummary = {
  detected: number;
  blocked: number;
  not_found: number;
  inconclusive: number;
  total_checked: number;
};

export type EndpointCheck = {
  category: string;
  name: string;
  path: string;
  url: string;
  status: EndpointStatus;
  http_status: number | null;
  matched: string[];
  elapsed_ms: number;
};

export type ScanResult = {
  target: string;
  input: string;
  active_url: string;
  final_url: string;
  http_status: number | null;
  https_status: number | null;
  response_time: number;
  wordpress: WordPressInfo;
  wp_rest: RestApiInfo;
  exposure_summary: ExposureSummary;
  assessment: Assessment;
  assessment_label: string;
  assessment_description: string;
  upload_endpoints: EndpointCheck[];
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: ScanResult | null;
};

/**
 * Normalizes user target input for client-side UX.
 */
export function normalizeTargetInput(raw: string): string {
  const trimmed = raw.trim().replace(/^['"<(\[]+|['">)\]]+$/g, "");
  return trimmed.replace(/\/+$/, "");
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
      error: "Please enter a target URL or domain to scan.",
    };
  }

  // Reject invalid schemes
  const forbiddenScheme = clean.match(
    /^(file|ftp|gopher|data|javascript|php|ssh|telnet|dict|ldap|mailto):/i,
  );
  if (forbiddenScheme) {
    return {
      valid: false,
      error: `Scheme '${forbiddenScheme[1]}:' is not supported. Use http:// or https://.`,
    };
  }

  // Reject embedded credentials
  if (/@/.test(clean)) {
    return {
      valid: false,
      error: "Credentials in URLs (user:pass@host) are not permitted.",
    };
  }

  // Reject localhost or obvious internal loopbacks early for instant UX
  if (/^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/.*)?$/i.test(clean)) {
    return {
      valid: false,
      error: "Scanning localhost or internal destinations is not permitted.",
    };
  }

  return { valid: true };
}

const SARCASTIC_RESPONSES = [
  "Nice try. That request didn't make it past the security gate.",
  "Good imagination. The server isn't visiting that destination.",
  "Almost impressive. Unfortunately, that input isn't getting through.",
  "Wrong door. That target destination cannot be scanned.",
];

/**
 * Returns a playful yet secure generic message when the server rejects a target.
 */
export function getSarcasticBlockMessage(serverMessage?: string): string {
  if (serverMessage && serverMessage.toLowerCase().includes("rate limit")) {
    return "Easy there, cowboy. The scanner needs a breather.";
  }
  if (serverMessage && serverMessage.toLowerCase().includes("in progress")) {
    return "Hold your horses! A scan is already running for your session.";
  }
  const randomIndex = Math.floor(Math.random() * SARCASTIC_RESPONSES.length);
  return SARCASTIC_RESPONSES[randomIndex];
}

/**
 * Sends a scan request to the XeooTools PHP backend.
 */
export async function runWordPressScan(
  targetUrl: string,
  signal?: AbortSignal,
): Promise<ScanResult> {
  const normalized = normalizeTargetInput(targetUrl);

  const response = await fetch(
    `${BACKEND_URL}/api/wordpress-exposure-scan.php`,
    {
      method: "POST",
      signal,
      credentials: "include",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Accept: "application/json",
      },
      body: JSON.stringify({ url: normalized }),
    },
  );

  let result: ApiResponse | null = null;
  try {
    result = (await response.json()) as ApiResponse;
  } catch {
    result = null;
  }

  if (response.status === 429) {
    const msg =
      result?.message ||
      "Scan rate limit reached. Please wait a few minutes before scanning again.";
    throw new Error(msg);
  }

  if (!response.ok || !result || !result.success || !result.data) {
    const errorMsg =
      result?.message ||
      getSarcasticBlockMessage(result?.message);
    throw new Error(errorMsg);
  }

  return result.data;
}

/**
 * Sanitizes a domain name for safe local export filenames.
 */
export function sanitizeFilename(host: string): string {
  const clean = host.replace(/[^a-zA-Z0-9.-]/g, "-").replace(/-+/g, "-");
  return clean || "target";
}

/**
 * Generates and triggers download for JSON scan results.
 */
export function exportScanAsJson(data: ScanResult): void {
  const filename = `wordpress-scan-${sanitizeFilename(data.target)}.json`;
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  downloadBlob(blob, filename);
}

/**
 * Generates and triggers download for CSV scan results.
 */
export function exportScanAsCsv(data: ScanResult): void {
  const filename = `wordpress-scan-${sanitizeFilename(data.target)}.csv`;
  const headers = [
    "Category",
    "Endpoint Name",
    "Path",
    "Status",
    "HTTP Status",
    "Matched Signatures",
    "Response Time (ms)",
    "URL",
  ];

  const rows: string[][] = [
    headers,
    ...data.upload_endpoints.map((ep) => [
      escapeCsv(ep.category),
      escapeCsv(ep.name),
      escapeCsv(ep.path),
      escapeCsv(ep.status),
      escapeCsv(ep.http_status !== null ? String(ep.http_status) : "-"),
      escapeCsv(ep.matched.join("; ") || "-"),
      escapeCsv(String(ep.elapsed_ms)),
      escapeCsv(ep.url),
    ]),
  ];

  const csvContent = rows.map((row) => row.join(",")).join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, filename);
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Maps EndpointStatus to badge styling classes.
 */
export function getStatusBadgeClass(status: EndpointStatus): {
  container: string;
  dot: string;
} {
  switch (status) {
    case "DETECTED":
      return {
        container:
          "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-600 dark:text-white font-bold shadow-sm",
        dot: "bg-white",
      };

    case "BLOCKED":
      return {
        container:
          "border-orange-500 bg-orange-500 text-white dark:border-orange-400 dark:bg-orange-500 dark:text-white font-bold shadow-sm",
        dot: "bg-white",
      };

    case "NOT FOUND":
      return {
        container:
          "border-red-500 bg-red-500 text-white dark:border-red-400 dark:bg-red-500 dark:text-white font-bold shadow-sm",
        dot: "bg-white",
      };

    case "NOT DETECTED":
      return {
        container:
          "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-600 dark:text-white font-bold shadow-sm",
        dot: "bg-white",
      };

    case "TIMEOUT":
    case "SSL ERROR":
    case "CONNECTION ERROR":
    case "SERVER ERROR":
    case "ERROR":
      return {
        container:
          "border-orange-600 bg-orange-600 text-white dark:border-orange-500 dark:bg-orange-600 dark:text-white font-bold shadow-sm",
        dot: "bg-white",
      };

    default:
      return {
        container:
          "border-slate-500 bg-slate-500 text-white dark:border-slate-400 dark:bg-slate-600 dark:text-white font-semibold shadow-sm",
        dot: "bg-white",
      };
  }
}

/**
 * Maps Overall Assessment to visual tones and descriptions.
 */
export function getAssessmentTone(assessment: Assessment): {
  badgeClass: string;
  cardClass: string;
  tone: "danger" | "warning" | "neutral" | "error";
} {
  switch (assessment) {
    case "POTENTIALLY VULNERABLE":
      return {
        badgeClass:
          "border-red-300 bg-red-100 text-red-900 dark:border-red-600/50 dark:bg-red-950/80 dark:text-red-200 font-bold shadow-2xs",
        cardClass:
          "border-red-200 bg-red-50/50 dark:border-red-500/30 dark:bg-red-950/20",
        tone: "danger",
      };
    case "INCONCLUSIVE":
      return {
        badgeClass:
          "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-600/50 dark:bg-amber-950/80 dark:text-amber-200 font-bold shadow-2xs",
        cardClass:
          "border-amber-200 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-950/20",
        tone: "warning",
      };
    case "NOT DETECTED":
      return {
        badgeClass:
          "border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-600/50 dark:bg-emerald-950/80 dark:text-emerald-200 font-bold shadow-2xs",
        cardClass:
          "border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-950/15",
        tone: "neutral",
      };
    case "ERROR":
    default:
      return {
        badgeClass:
          "border-rose-300 bg-rose-100 text-rose-900 dark:border-rose-600/50 dark:bg-rose-950/80 dark:text-rose-200 font-bold shadow-2xs",
        cardClass:
          "border-rose-200 bg-rose-50/50 dark:border-rose-500/20 dark:bg-rose-950/20",
        tone: "error",
      };
  }
}

