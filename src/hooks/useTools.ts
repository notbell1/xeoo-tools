import { useCallback, useEffect, useState } from "react";

import { BACKEND_URL } from "../config/backend";
import { DEFAULT_TOOLS } from "../data/defaultTools";

export const TOOLS_UPDATED_EVENT = "xeoo_tools_updated";

export type PublicToolStatus = "ready" | "maintenance" | "upcoming";

export type PublicTool = {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  status: PublicToolStatus;
  category_id: number;
  category_name: string;
  category_slug: string;
};

type ToolApiItem = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  status?: string;
  category_id?: number;
  category_name?: string;
  category_slug?: string;
};

type ToolsResponse = {
  success: boolean;
  message?: string;
  data?: ToolApiItem[];
};

export type UseToolsResult = {
  tools: PublicTool[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

function normalizeStatus(value: unknown): PublicToolStatus {
  if (value === "maintenance") {
    return "maintenance";
  }

  if (value === "upcoming") {
    return "upcoming";
  }

  return "ready";
}

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeTool(tool: ToolApiItem): PublicTool {
  const categoryName = tool.category_name?.trim() || "Uncategorized";

  const categorySlug =
    tool.category_slug?.trim() ||
    normalizeSlug(categoryName) ||
    "uncategorized";

  return {
    id: Number(tool.id) || 0,
    name: String(tool.name ?? ""),
    slug: String(tool.slug ?? ""),
    description: String(tool.description ?? ""),
    icon: String(tool.icon ?? "wrench"),
    status: normalizeStatus(tool.status),
    category_id: Number(tool.category_id) || 0,
    category_name: categoryName,
    category_slug: categorySlug,
  };
}

let memoryCachedTools: PublicTool[] | null = null;
let activeFetchPromise: Promise<PublicTool[]> | null = null;
const subscribers = new Set<(tools: PublicTool[], loading: boolean) => void>();

function notifySubscribers(tools: PublicTool[], loading: boolean) {
  subscribers.forEach((fn) => fn(tools, loading));
}

async function executeFetchTools(): Promise<PublicTool[]> {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/tools.php?_=${Date.now()}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const result: ToolsResponse = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Gagal mengambil data tools.");
    }

    const normalizedTools = (result.data ?? [])
      .map(normalizeTool)
      .filter((tool) => tool.id > 0);

    const liveSlugs = new Set(normalizedTools.map((t) => t.slug));
    const missingDefaults = DEFAULT_TOOLS.filter((t) => !liveSlugs.has(t.slug));

    const finalTools = [...normalizedTools, ...missingDefaults];
    memoryCachedTools = finalTools;
    notifySubscribers(finalTools, false);
    return finalTools;
  } catch (reason) {
    console.error("useTools error:", reason);
    const fallbackTools = DEFAULT_TOOLS;
    memoryCachedTools = fallbackTools;
    notifySubscribers(fallbackTools, false);
    return fallbackTools;
  } finally {
    activeFetchPromise = null;
  }
}

export function useTools(): UseToolsResult {
  const [tools, setTools] = useState<PublicTool[]>(() => memoryCachedTools ?? []);
  const [loading, setLoading] = useState<boolean>(() => memoryCachedTools === null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (!activeFetchPromise) {
      activeFetchPromise = executeFetchTools();
    }
    try {
      const data = await activeFetchPromise;
      setTools(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Data tools tidak dapat dimuat."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const onUpdate = (newTools: PublicTool[], newLoading: boolean) => {
      setTools(newTools);
      setLoading(newLoading);
    };
    subscribers.add(onUpdate);

    if (memoryCachedTools === null) {
      if (!activeFetchPromise) {
        activeFetchPromise = executeFetchTools();
      }
      activeFetchPromise.then((data) => {
        setTools(data);
        setLoading(false);
      });
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== TOOLS_UPDATED_EVENT) {
        return;
      }
      memoryCachedTools = null;
      void refresh();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };

    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      subscribers.delete(onUpdate);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refresh]);

  return {
    tools,
    loading,
    error,
    refresh,
  };
}
