import { useCallback, useRef, useState } from "react";

import { BACKEND_URL } from "../config/backend";

import type {
  AdminReport,
  ReportCreateResponse,
  ReportStatus,
  ReportStatusResponse,
  ReportType,
  ReportsResponse,
} from "../types/admin";

export type ReportTypeFilter = ReportType | "";

export type ReportStatusFilter = ReportStatus | "";

export interface ReportFilters {
  page: number;
  perPage: number;
  search: string;
  type: ReportTypeFilter;
  status: ReportStatusFilter;
}

const EMPTY_SUMMARY = {
  total: 0,
  waiting: 0,
  fix: 0,
};

export function useReports(options?: {
  onUnauthorized?: () => void;
  initialPerPage?: number;
}) {
  const initialPerPage = options?.initialPerPage ?? 8;

  const onUnauthorizedRef = useRef(options?.onUnauthorized);

  onUnauthorizedRef.current = options?.onUnauthorized;

  const filtersRef = useRef<ReportFilters>({
    page: 1,
    perPage: initialPerPage,
    search: "",
    type: "",
    status: "",
  });

  const [reports, setReports] = useState<AdminReport[]>([]);

  const [pagination, setPagination] = useState({
    page: 1,
    per_page: initialPerPage,
    total: 0,
    total_pages: 1,
  });

  const [summary, setSummary] = useState(EMPTY_SUMMARY);

  const [filters, setFilters] = useState<ReportFilters>(filtersRef.current);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [creating, setCreating] = useState(false);

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [error, setError] = useState("");

  const buildQuery = (currentFilters: ReportFilters) => {
    const params = new URLSearchParams();

    params.set("action", "list");

    params.set("page", String(currentFilters.page));

    params.set("per_page", String(currentFilters.perPage));

    if (currentFilters.search.trim()) {
      params.set("search", currentFilters.search.trim());
    }

    if (currentFilters.type) {
      params.set("type", currentFilters.type);
    }

    if (currentFilters.status) {
      params.set("status", currentFilters.status);
    }

    return params.toString();
  };

  const loadReports = useCallback(
    async (
      overrideFilters?: Partial<ReportFilters>,
      options?: {
        showLoading?: boolean;
        showErrorMessage?: boolean;
      },
    ): Promise<boolean> => {
      const currentFilters = filtersRef.current;

      const nextFilters: ReportFilters = {
        ...currentFilters,
        ...overrideFilters,
      };

      filtersRef.current = nextFilters;

      const showLoading = options?.showLoading ?? true;

      const showErrorMessage = options?.showErrorMessage ?? true;

      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      try {
        const query = buildQuery(nextFilters);

        const response = await fetch(
          `${BACKEND_URL}/api/reports.php?${query}`,
          {
            method: "GET",
            mode: "cors",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (response.status === 401) {
          onUnauthorizedRef.current?.();
          return false;
        }

        const result: ReportsResponse = await response.json();

        if (!response.ok) {
          throw new Error(result.message || `HTTP error: ${response.status}`);
        }

        if (!result.success) {
          throw new Error(result.message || "Failed to retrieve reports data.");
        }

        const responseData = result.data;

        setReports(responseData?.reports ?? []);

        setPagination(
          responseData?.pagination ?? {
            page: nextFilters.page,
            per_page: nextFilters.perPage,
            total: 0,
            total_pages: 1,
          },
        );

        setSummary(responseData?.summary ?? EMPTY_SUMMARY);

        return true;
      } catch (requestError) {
        console.error("Load reports error:", requestError);

        const message =
          requestError instanceof Error
            ? requestError.message
            : "Reports data could not be retrieved from the server.";

        if (showErrorMessage) {
          setError(message);
        }

        return false;
      } finally {
        if (showLoading) {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    },
    [],
  );

  const refreshReports = useCallback(async () => {
    return loadReports(undefined, {
      showLoading: false,
      showErrorMessage: true,
    });
  }, [loadReports]);

  const setSearch = useCallback((search: string) => {
    const nextFilters: ReportFilters = {
      ...filtersRef.current,
      page: 1,
      search,
    };

    filtersRef.current = nextFilters;

    setFilters(nextFilters);
  }, []);

  const setTypeFilter = useCallback((type: ReportTypeFilter) => {
    const nextFilters: ReportFilters = {
      ...filtersRef.current,
      page: 1,
      type,
    };

    filtersRef.current = nextFilters;

    setFilters(nextFilters);
  }, []);

  const setStatusFilter = useCallback((status: ReportStatusFilter) => {
    const nextFilters: ReportFilters = {
      ...filtersRef.current,
      page: 1,
      status,
    };

    filtersRef.current = nextFilters;

    setFilters(nextFilters);
  }, []);

  const setPerPage = useCallback((perPage: number) => {
    const normalized = Math.max(1, Math.min(50, perPage));

    const nextFilters: ReportFilters = {
      ...filtersRef.current,
      page: 1,
      perPage: normalized,
    };

    filtersRef.current = nextFilters;

    setFilters(nextFilters);
  }, []);

  const goToPage = useCallback((page: number) => {
    const nextFilters: ReportFilters = {
      ...filtersRef.current,
      page: Math.max(1, page),
    };

    filtersRef.current = nextFilters;

    setFilters(nextFilters);
  }, []);

  const nextPage = useCallback(() => {
    const current = filtersRef.current;

    if (current.page >= pagination.total_pages) {
      return;
    }

    const nextFilters: ReportFilters = {
      ...current,
      page: current.page + 1,
    };

    filtersRef.current = nextFilters;

    setFilters(nextFilters);
  }, [pagination.total_pages]);

  const previousPage = useCallback(() => {
    const current = filtersRef.current;

    if (current.page <= 1) {
      return;
    }

    const nextFilters: ReportFilters = {
      ...current,
      page: current.page - 1,
    };

    filtersRef.current = nextFilters;

    setFilters(nextFilters);
  }, []);

  const resetFilters = useCallback(() => {
    const nextFilters: ReportFilters = {
      ...filtersRef.current,
      page: 1,
      search: "",
      type: "",
      status: "",
    };

    filtersRef.current = nextFilters;

    setFilters(nextFilters);
  }, []);

  const createReport = useCallback(
    async (params: {
      type: ReportType;
      toolId: number;
      message: string;
    }): Promise<AdminReport | null> => {
      if (creating) {
        return null;
      }

      setCreating(true);
      setError("");

      try {
        const response = await fetch(`${BACKEND_URL}/api/reports.php`, {
          method: "POST",
          mode: "cors",
          credentials: "include",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Accept: "application/json",
          },
          body: JSON.stringify({
            type: params.type,
            tool_id: params.toolId,
            message: params.message,
          }),
        });

        const result: ReportCreateResponse = await response.json();

        if (!response.ok) {
          throw new Error(result.message || `HTTP error: ${response.status}`);
        }

        if (!result.success) {
          throw new Error(result.message || "Failed to submit report.");
        }

        return result.data?.report ?? null;
      } catch (requestError) {
        console.error("Create report error:", requestError);

        const message =
          requestError instanceof Error
            ? requestError.message
            : "The report could not be submitted.";

        setError(message);

        return null;
      } finally {
        setCreating(false);
      }
    },
    [creating],
  );

  const updateReportStatus = useCallback(
    async (id: number, status: ReportStatus): Promise<AdminReport | null> => {
      if (updatingId !== null) {
        return null;
      }

      setUpdatingId(id);
      setError("");

      try {
        const response = await fetch(`${BACKEND_URL}/api/reports.php`, {
          method: "POST",
          mode: "cors",
          credentials: "include",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Accept: "application/json",
          },
          body: JSON.stringify({
            action: "update_status",
            id,
            status,
          }),
        });

        if (response.status === 401) {
          onUnauthorizedRef.current?.();
          return null;
        }

        const result: ReportStatusResponse = await response.json();

        if (!response.ok) {
          throw new Error(result.message || `HTTP error: ${response.status}`);
        }

        if (!result.success) {
          throw new Error(result.message || "Failed to update report status.");
        }

        const updatedReport = result.data?.report ?? null;

        if (updatedReport) {
          setReports((current) =>
            current.map((report) =>
              report.id === updatedReport.id ? updatedReport : report,
            ),
          );

          setSummary((current) => {
            const previousStatus = reports.find(
              (report) => report.id === id,
            )?.status;

            if (!previousStatus || previousStatus === updatedReport.status) {
              return current;
            }

            return {
              ...current,
              waiting:
                previousStatus === "waiting"
                  ? Math.max(0, current.waiting - 1)
                  : current.waiting + 1,
              fix:
                previousStatus === "fix"
                  ? Math.max(0, current.fix - 1)
                  : current.fix + 1,
            };
          });
        }

        return updatedReport;
      } catch (requestError) {
        console.error("Update report status error:", requestError);

        const message =
          requestError instanceof Error
            ? requestError.message
            : "The report status could not be updated.";

        setError(message);

        return null;
      } finally {
        setUpdatingId(null);
      }
    },
    [reports, updatingId],
  );

  return {
    reports,
    pagination,
    summary,
    filters,

    loading,
    refreshing,
    creating,
    updatingId,
    error,

    loadReports,
    refreshReports,

    setSearch,
    setTypeFilter,
    setStatusFilter,
    setPerPage,

    goToPage,
    nextPage,
    previousPage,
    resetFilters,

    createReport,
    updateReportStatus,

    clearError: () => setError(""),
  };
}
