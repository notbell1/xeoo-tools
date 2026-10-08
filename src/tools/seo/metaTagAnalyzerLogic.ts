import { BACKEND_URL } from "../../config/backend";

export interface BasicSeoTag {
  value: string;
  length?: number;
  status: "Good" | "Warning" | "Missing";
  recommendation?: string;
}

export interface MetaTagAnalysisData {
  url: string;
  http_code: number;
  seo_score: number;
  score_label: string;
  basic_seo: {
    title: BasicSeoTag;
    description: BasicSeoTag;
    robots: BasicSeoTag;
    canonical: BasicSeoTag;
    language: BasicSeoTag;
    charset: BasicSeoTag;
  };
  headings: {
    h1_count: number;
    h1_items: string[];
    h1_status: "Good" | "Warning" | "Missing";
    h2_count: number;
    h3_count: number;
  };
  links: {
    internal_count: number;
    external_count: number;
    total_count: number;
  };
  images: {
    total: number;
    with_alt: number;
    without_alt: number;
    status: "Good" | "Warning" | "Missing";
  };
  open_graph: {
    status: "Good" | "Warning" | "Missing";
    tags: {
      "og:title": string;
      "og:description": string;
      "og:image": string;
      "og:url": string;
      "og:type": string;
    };
  };
  twitter: {
    status: "Good" | "Warning" | "Missing";
    tags: {
      "twitter:card": string;
      "twitter:title": string;
      "twitter:description": string;
      "twitter:image": string;
    };
  };
}

export interface AnalyzeResultResponse {
  success: boolean;
  message?: string;
  data?: MetaTagAnalysisData;
}

export function validateUrlInput(input: string): { valid: boolean; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: "Please enter a website URL or domain." };
  }

  if (trimmed.length > 2048) {
    return { valid: false, error: "URL is too long (maximum 2048 characters)." };
  }

  // Reject basic XSS payloads
  if (/<script|javascript:|data:/i.test(trimmed)) {
    return { valid: false, error: "Invalid URL characters detected." };
  }

  return { valid: true };
}

export async function analyzeMetaTags(
  url: string,
  signal?: AbortSignal
): Promise<MetaTagAnalysisData> {
  const response = await fetch(`${BACKEND_URL}/api/seo/meta-tag-analyzer.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ url }),
    signal,
  });

  const json: AnalyzeResultResponse = await response.json();

  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.message || "Failed to analyze meta tags.");
  }

  return json.data;
}

