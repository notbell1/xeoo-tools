import { useEffect, useState } from "react";

import { BACKEND_URL } from "../config/backend";
import { DEFAULT_TOOLS } from "../data/defaultTools";
import type { PublicToolStatus } from "./useTools";

export type PopularTool = {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  status: PublicToolStatus;
  category_name: string;
  category_slug: string;
  pageviews: number;
  unique_visitors: number;
  route: string;
};

type PopularToolsResponse = {
  success: boolean;
  message?: string;
  data?: PopularTool[];
};

// Fallback tools if database traffic has no records yet
const FALLBACK_POPULAR_SLUGS = [
  "defacement-ctf",
  "image-compressor",
  "scam-link-checker",
];

function getFallbackTools(): PopularTool[] {
  const result: PopularTool[] = [];
  for (const slug of FALLBACK_POPULAR_SLUGS) {
    const found = DEFAULT_TOOLS.find((t) => t.slug === slug);
    if (found) {
      result.push({
        id: found.id,
        name: found.name,
        slug: found.slug,
        description: found.description,
        icon: found.icon,
        status: found.status,
        category_name: found.category_name,
        category_slug: found.category_slug,
        pageviews: 0,
        unique_visitors: 0,
        route: found.slug === "defacement-ctf" ? "/ctf" : `/tools/${found.slug}`,
      });
    }
  }
  return result;
}

export function usePopularTools(limit = 3) {
  const [popularTools, setPopularTools] = useState<PopularTool[]>(getFallbackTools);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchPopular() {
      const endpoints = [
        `${BACKEND_URL}/api/traffic/popular.php?limit=${limit}`,
        `/php/api/traffic/popular.php?limit=${limit}`,
      ];

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            signal: controller.signal,
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          });

          if (!res.ok) continue;

          const json = (await res.json()) as PopularToolsResponse;
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            if (isMounted) {
              setPopularTools(json.data.slice(0, limit));
              setLoading(false);
            }
            return;
          }
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") {
            return;
          }
          // Try next endpoint fallback
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    void fetchPopular();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [limit]);

  return { popularTools, loading };
}
