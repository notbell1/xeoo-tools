import { BACKEND_URL } from "../../config/backend";

export interface OpenGraphTagItem {
  property: string;
  value: string;
  status: "Present" | "Missing";
  required: boolean;
}

export interface OpenGraphPreviewData {
  title: string;
  description: string;
  image: string;
  url: string;
  site_name: string;
  twitter_card: string;
}

export interface OpenGraphAnalysisData {
  url: string;
  http_code: number;
  preview: OpenGraphPreviewData;
  tags: OpenGraphTagItem[];
  has_og: boolean;
  has_twitter: boolean;
}

export interface OpenGraphResponse {
  success: boolean;
  message?: string;
  data?: OpenGraphAnalysisData;
}

export async function checkOpenGraph(
  url: string,
  signal?: AbortSignal
): Promise<OpenGraphAnalysisData> {
  const response = await fetch(`${BACKEND_URL}/api/seo/open-graph-checker.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ url }),
    signal,
  });

  const json: OpenGraphResponse = await response.json();

  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.message || "Failed to check Open Graph metadata.");
  }

  return json.data;
}

