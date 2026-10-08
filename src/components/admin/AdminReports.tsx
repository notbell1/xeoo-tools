import {
  Bug,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Flag,
  LoaderCircle,
  RotateCcw,
  Search,
  Wrench,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { showConfirm, showError, showSuccess } from "../../alert";
import { useReports } from "../../hooks/useReports";
import { getCategoryBadgeClass } from "../../lib/adminCategories";
import { getCategoryIcon } from "../../lib/toolIcons";

import type { AdminReport, ReportStatus, ReportType } from "../../types/admin";

interface AdminReportsProps {
  onUnauthorized?: () => void;
}

const REPORT_TYPE_META: Record<
  ReportType,
  {
    label: string;
    shortLabel: string;
    icon: typeof Bug;
    className: string;
  }
> = {
  bug: {
    label: "Bug / Error",
    shortLabel: "Bug",
    icon: Bug,
    className: "border-red-200 bg-red-50 text-red-700",
  },
  tool: {
    label: "Tool Problem",
    shortLabel: "Tool",
    icon: Wrench,
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  ui: {
    label: "UI / Design",
    shortLabel: "UI",
    icon: Flag,
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  other: {
    label: "Other",
    shortLabel: "Other",
    icon: Flag,
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
};

const STATUS_META: Record<
  ReportStatus,
  {
    label: string;
    className: string;
  }
> = {
  waiting: {
    label: "Waiting",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  fix: {
    label: "Fix",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

const CATEGORY_COLOR_BY_SLUG: Record<string, string> = {
  math: "violet",
  psychology: "purple",
  law: "slate",
  health: "rose",
  network: "cyan",
  security: "emerald",
  image: "pink",
  file: "blue",
  encoding: "orange",
  seo: "amber",
  defacement: "red",
  code: "indigo",
};

type FilterOption = {
  value: string;
  label: string;
  shortLabel?: string;
};

function parseReportDate(value: string): Date {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");

  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(normalized);

  return new Date(hasTimezone ? normalized : `${normalized}+07:00`);
}

function formatReportDate(value: string): string {
  const date = parseReportDate(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatReportTime(value: string): string {
  const date = parseReportDate(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getTypeMeta(type: ReportType) {
  return REPORT_TYPE_META[type];
}

function getStatusMeta(status: ReportStatus) {
  return STATUS_META[status];
}

function truncateMessage(value: string, maxLength = 88) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}...`;
}

function buildPagination(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis-left" | "ellipsis-right"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis-left" | "ellipsis-right"> = [1];

  if (currentPage > 4) {
    pages.push("ellipsis-left");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (currentPage < totalPages - 3) {
    pages.push("ellipsis-right");
  }

  pages.push(totalPages);

  return pages;
}

function getCategoryClass(slug: string | null) {
  const color = slug ? CATEGORY_COLOR_BY_SLUG[slug] : undefined;

  return getCategoryBadgeClass(color ?? "");
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const meta = getStatusMeta(status);

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold sm:text-[9px]",
        meta.className,
      ].join(" ")}
    >
      {status === "waiting" ? (
        <LoaderCircle size={9} className="animate-spin" />
      ) : (
        <Check size={9} />
      )}
      {meta.label}
    </span>
  );
}

function TypeBadge({ type }: { type: ReportType }) {
  const meta = getTypeMeta(type);
  const Icon = meta.icon;

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold sm:text-[9px]",
        meta.className,
      ].join(" ")}
    >
      <Icon size={9} />
      {meta.shortLabel}
    </span>
  );
}

function CategoryBadge({
  name,
  slug,
}: {
  name: string | null;
  slug?: string | null;
}) {
  const CategoryIcon = getCategoryIcon(slug || "uncategorized");

  return (
    <span
      className={[
        "inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold sm:text-[9px]",
        getCategoryClass(slug ?? null),
      ].join(" ")}
    >
      <CategoryIcon size={8} strokeWidth={1.9} />
      <span className="truncate">{name || "Uncategorized"}</span>
    </span>
  );
}

function CompactFilterSelect({
  value,
  onChange,
  options,
  ariaLabel,
  mobileLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  ariaLabel: string;
  mobileLabel: string;
}) {
  const [open, setOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  }>({
    top: 0,
    left: 0,
    width: 156,
    maxHeight: 240,
  });

  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) {
      return;
    }

    const updatePosition = () => {
      const button = buttonRef.current;

      if (!button) {
        return;
      }

      const rect = button.getBoundingClientRect();

      const viewportWidth = window.innerWidth;

      const viewportHeight = window.innerHeight;

      const horizontalPadding = 8;

      const width = Math.min(
        Math.max(rect.width, 148),
        viewportWidth - horizontalPadding * 2,
      );

      const left = Math.max(
        horizontalPadding,
        Math.min(rect.left, viewportWidth - width - horizontalPadding),
      );

      const maxHeight = Math.min(250, Math.max(140, viewportHeight - 24));

      const actualMenuHeight =
        menuRef.current?.getBoundingClientRect().height ?? maxHeight;

      const spaceBelow = viewportHeight - rect.bottom;

      const spaceAbove = rect.top;

      let top = rect.bottom + 5;

      if (spaceBelow < actualMenuHeight + 8 && spaceAbove > spaceBelow) {
        top =
          rect.top -
          Math.min(actualMenuHeight, Math.max(120, spaceAbove - 8)) -
          5;
      }

      top = Math.max(
        8,
        Math.min(
          top,
          viewportHeight - Math.min(actualMenuHeight, maxHeight) - 8,
        ),
      );

      setMenuStyle({
        top,
        left,
        width,
        maxHeight,
      });
    };

    const frame = window.requestAnimationFrame(updatePosition);

    window.addEventListener("resize", updatePosition);

    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.cancelAnimationFrame(frame);

      window.removeEventListener("resize", updatePosition);

      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selectedButtonLabel =
    value === ""
      ? mobileLabel
      : (selectedOption?.shortLabel ?? selectedOption?.label ?? mobileLabel);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={[
          "flex h-8 w-full min-w-0 items-center justify-between gap-1 rounded-lg border border-xeoo-border bg-xeoo-bg px-2 text-[9px] font-semibold text-xeoo-text outline-none transition",
          "hover:bg-xeoo-surface",
          "focus:border-xeoo-primary focus:bg-xeoo-surface",
          "sm:h-9 sm:px-3 sm:text-[11px]",
        ].join(" ")}
      >
        <span className="min-w-0 truncate text-left">
          <span className="sm:hidden">{selectedButtonLabel}</span>

          <span className="hidden truncate sm:block">
            {selectedOption?.label ?? mobileLabel}
          </span>
        </span>

        <ChevronDown
          size={11}
          className={[
            "shrink-0 text-xeoo-muted transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open
        ? createPortal(
            <div
              ref={menuRef}
              role="listbox"
              aria-label={ariaLabel}
              className="fixed z-100 overflow-y-auto rounded-lg border border-xeoo-border bg-xeoo-surface p-1 shadow-2xl ring-1 ring-black/5"
              style={{
                top: menuStyle.top,
                left: menuStyle.left,
                width: menuStyle.width,
                maxHeight: menuStyle.maxHeight,
              }}
            >
              {options.map((option) => {
                const active = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                      buttonRef.current?.focus();
                    }}
                    className={[
                      "flex min-h-8 w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-[9px] font-semibold transition",
                      "sm:min-h-9 sm:px-2.5 sm:text-[10px]",
                      active
                        ? "bg-xeoo-primary-soft text-xeoo-primary"
                        : "text-xeoo-text-soft hover:bg-xeoo-surface-soft hover:text-xeoo-text",
                    ].join(" ")}
                  >
                    <span className="min-w-0 truncate">{option.label}</span>

                    {active ? <Check size={11} className="shrink-0" /> : null}
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export default function AdminReports({ onUnauthorized }: AdminReportsProps) {
  const {
    reports,
    pagination,
    filters,
    loading,
    updatingId,
    error,
    loadReports,
    setSearch,
    setTypeFilter,
    setStatusFilter,
    goToPage,
    resetFilters,
    updateReportStatus,
    clearError,
  } = useReports({
    onUnauthorized,
    initialPerPage: 5,
  });

  const [searchInput, setSearchInput] = useState(filters.search);

  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId) ?? null,
    [reports, selectedReportId],
  );

  const paginationItems = useMemo(
    () => buildPagination(pagination.page, pagination.total_pages),
    [pagination.page, pagination.total_pages],
  );

  const firstLoadRef = useRef(false);

  useEffect(() => {
    const firstLoad = !firstLoadRef.current;

    firstLoadRef.current = true;

    void loadReports(
      {
        page: filters.page,
        perPage: filters.perPage,
        search: filters.search,
        type: filters.type,
        status: filters.status,
      },
      {
        showLoading: firstLoad,
        showErrorMessage: true,
      },
    );
  }, [
    filters.page,
    filters.perPage,
    filters.search,
    filters.type,
    filters.status,
    loadReports,
  ]);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const nextSearch = searchInput.trim().slice(0, 100);

    if (nextSearch === filters.search) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSearch(nextSearch);
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput, filters.search, setSearch]);

  const handleResetFilters = () => {
    setSearchInput("");
    resetFilters();
  };

  const handleStatusChange = async (
    report: AdminReport,
    nextStatus: ReportStatus,
  ) => {
    if (updatingId !== null || report.status === nextStatus) {
      return;
    }

    const nextLabel = getStatusMeta(nextStatus).label;

    const confirmed = await showConfirm(
      nextStatus === "fix"
        ? "Mark report as Fixed?"
        : "Reopen report?",
      nextStatus === "fix"
        ? `Report #${report.id} will be marked as resolved.`
        : `Report #${report.id} will be reverted to Waiting status.`,
    );

    if (!confirmed) {
      return;
    }

    const updated = await updateReportStatus(report.id, nextStatus);

    if (!updated) {
      await showError(
        "Failed to update status",
        "Report status could not be updated.",
      );

      return;
    }

    await showSuccess(
      "Status updated",
      `Report #${report.id} is now ${nextLabel}.`,
    );
  };

  const handleOpenReport = (report: AdminReport) => {
    setSelectedReportId(report.id);
  };

  const handleCloseReport = () => {
    setSelectedReportId(null);
  };

  const isFiltered =
    filters.search.trim() !== "" ||
    filters.type !== "" ||
    filters.status !== "";

  return (
    <div>
      <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-sm">
        <div className="border-b border-xeoo-border p-2.5 sm:p-3">
          <div className="grid grid-cols-[minmax(0,1fr)_72px_82px_30px] gap-1.5 md:grid-cols-[minmax(0,1fr)_140px_140px_auto] lg:grid-cols-[minmax(0,1fr)_160px_160px_auto]">
            <div className="relative min-w-0">
              <Search
                size={12}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xeoo-muted sm:left-3"
              />

              <input
                type="search"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value.slice(0, 100))
                }
                placeholder="Search tools or report details..."
                className="h-8 w-full rounded-lg border border-xeoo-border bg-xeoo-bg pl-7 pr-2 text-[9px] text-xeoo-text outline-none placeholder:text-xeoo-muted focus:border-xeoo-primary focus:bg-xeoo-surface sm:h-9 sm:pl-8 sm:pr-3 sm:text-[11px]"
              />
            </div>

            <CompactFilterSelect
              value={filters.type}
              onChange={(value) => setTypeFilter(value as ReportType | "")}
              mobileLabel="Type"
              ariaLabel="Filter report type"
              options={[
                {
                  value: "",
                  label: "All",
                  shortLabel: "Type",
                },
                {
                  value: "bug",
                  label: "Bug / Error",
                  shortLabel: "Bug",
                },
                {
                  value: "tool",
                  label: "Tool Problem",
                  shortLabel: "Tool",
                },
                {
                  value: "ui",
                  label: "UI / Design",
                  shortLabel: "UI",
                },
                {
                  value: "other",
                  label: "Other",
                  shortLabel: "Other",
                },
              ]}
            />

            <CompactFilterSelect
              value={filters.status}
              onChange={(value) => setStatusFilter(value as ReportStatus | "")}
              mobileLabel="Status"
              ariaLabel="Filter report status"
              options={[
                {
                  value: "",
                  label: "All",
                  shortLabel: "Status",
                },
                {
                  value: "waiting",
                  label: "Waiting",
                  shortLabel: "Waiting",
                },
                {
                  value: "fix",
                  label: "Fix",
                  shortLabel: "Fix",
                },
              ]}
            />

            <button
              type="button"
              onClick={handleResetFilters}
              className="flex h-8 w-full items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-text-soft transition hover:bg-xeoo-surface-soft hover:text-xeoo-text sm:h-9 sm:w-auto sm:px-3"
              title="Reset filters"
              aria-label="Reset filters"
            >
              <RotateCcw size={11} />
            </button>
          </div>
        </div>

        {error ? (
          <div className="border-b border-xeoo-danger/20 bg-xeoo-danger-soft px-2.5 py-2 sm:px-3">
            <div className="flex items-start justify-between gap-2">
              <p className="wrap-break-word text-[9px] leading-4 text-xeoo-danger">
                {error}
              </p>

              <button
                type="button"
                onClick={clearError}
                className="shrink-0 text-[9px] font-bold text-xeoo-danger underline underline-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center px-4 py-10">
            <div className="flex items-center gap-2 text-[10px] font-semibold text-xeoo-muted">
              <LoaderCircle size={15} className="animate-spin" />
              Loading reports...
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="px-4 py-9 text-center">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-xeoo-surface-soft text-xeoo-muted">
              <Flag size={16} />
            </div>

            <p className="mt-2.5 text-sm font-bold text-xeoo-text">
              No reports
            </p>

            <p className="mt-1 text-[10px] text-xeoo-muted">
              No reports match current filters.
            </p>

            {isFiltered ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-1.5 text-[9px] font-bold text-xeoo-text-soft transition hover:bg-xeoo-surface-soft"
              >
                Reset filters
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-240 border-collapse">
                  <thead>
                    <tr className="border-b border-xeoo-border bg-xeoo-surface-soft/60">
                      <TableHead className="w-12 text-center">No</TableHead>

                      <TableHead className="w-22 text-center">Type</TableHead>

                      <TableHead className="w-44 text-left">Tool</TableHead>

                      <TableHead className="w-36 text-center">
                        Category
                      </TableHead>

                      <TableHead className="text-left">Report</TableHead>

                      <TableHead className="w-28 text-center">
                        Date
                      </TableHead>

                      <TableHead className="w-24 text-center">Status</TableHead>

                      <TableHead className="w-24 text-center">Action</TableHead>
                    </tr>
                  </thead>

                  <tbody>
                    {reports.map((report, index) => (
                      <tr
                        key={report.id}
                        className={[
                          "border-b border-xeoo-border transition last:border-b-0 hover:bg-xeoo-bg",
                          index % 2 === 0
                            ? "bg-xeoo-surface"
                            : "bg-xeoo-surface-soft/45",
                        ].join(" ")}
                      >
                        <TableCell className="text-center">
                          <span className="text-[12px] font-bold text-xeoo-muted">
                            {(pagination.page - 1) * pagination.per_page +
                              index +
                              1}
                          </span>
                        </TableCell>

                        <TableCell className="text-center">
                          <TypeBadge type={report.type} />
                        </TableCell>

                        <TableCell>
                          <button
                            type="button"
                            onClick={() => handleOpenReport(report)}
                            className="block min-w-0 max-w-full text-left"
                            title={`View report ${report.tool_name}`}
                          >
                            <p className="truncate text-[12px] font-extrabold text-xeoo-text hover:text-xeoo-primary">
                              {report.tool_name}
                            </p>
                          </button>
                        </TableCell>

                        <TableCell className="text-center">
                          <CategoryBadge
                            name={report.category_name}
                            slug={report.category_slug}
                          />
                        </TableCell>

                        <TableCell>
                          <p
                            className="line-clamp-2 wrap-break-word text-[12px] leading-5 text-xeoo-text-soft"
                            title={report.message}
                          >
                            {truncateMessage(report.message, 100)}
                          </p>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-xeoo-text-soft">
                              {formatReportDate(report.created_at)}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <StatusBadge status={report.status} />
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <ActionButton
                              label="View"
                              icon={Eye}
                              onClick={() => handleOpenReport(report)}
                            />

                            <ActionButton
                              label={
                                report.status === "waiting" ? "Fix" : "Reopen"
                              }
                              icon={
                                report.status === "waiting"
                                  ? CheckCircle2
                                  : RotateCcw
                              }
                              loading={updatingId === report.id}
                              onClick={() =>
                                void handleStatusChange(
                                  report,
                                  report.status === "waiting"
                                    ? "fix"
                                    : "waiting",
                                )
                              }
                            />
                          </div>
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="divide-y divide-xeoo-border md:hidden">
              {reports.map((report, index) => (
                <article
                  key={report.id}
                  className={[
                    "px-2.5 py-2.5",
                    index % 2 === 0
                      ? "bg-xeoo-surface"
                      : "bg-xeoo-surface-soft/45",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface-soft text-xeoo-muted">
                      <Flag size={14} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <p className="min-w-0 truncate text-[11px] font-extrabold text-xeoo-text">
                          {report.tool_name}
                        </p>

                        <StatusBadge status={report.status} />
                      </div>

                      <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-1.5">
                        <TypeBadge type={report.type} />

                        <CategoryBadge
                          name={report.category_name}
                          slug={report.category_slug}
                        />

                        <span className="text-[8px] text-xeoo-muted">
                          {formatReportDate(report.created_at)}
                        </span>

                        <span className="text-[8px] text-xeoo-muted">
                          {formatReportTime(report.created_at)}
                        </span>
                      </div>
                    </div>

                    <span className="shrink-0 pt-0.5 text-[8px] font-bold text-xeoo-muted">
                      #{(pagination.page - 1) * pagination.per_page + index + 1}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenReport(report)}
                    className="mt-2 block w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-2 text-left transition hover:border-xeoo-primary/30 hover:bg-xeoo-primary-soft"
                  >
                    <p className="line-clamp-3 wrap-break-word text-[9px] leading-relaxed text-xeoo-text-soft">
                      {truncateMessage(report.message, 150)}
                    </p>
                  </button>

                  <div className="mt-2 flex items-center justify-end gap-1">
                    <ActionButton
                      label="View"
                      icon={Eye}
                      onClick={() => handleOpenReport(report)}
                    />

                    <ActionButton
                      label={report.status === "waiting" ? "Fix" : "Reopen"}
                      icon={
                        report.status === "waiting" ? CheckCircle2 : RotateCcw
                      }
                      loading={updatingId === report.id}
                      onClick={() =>
                        void handleStatusChange(
                          report,
                          report.status === "waiting" ? "fix" : "waiting",
                        )
                      }
                    />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {!loading && pagination.total_pages > 1 ? (
          <div className="flex items-center justify-end gap-2 border-t border-xeoo-border px-2.5 py-2 sm:px-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => goToPage(pagination.page - 1)}
                className="flex h-6 w-6 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text disabled:pointer-events-none disabled:opacity-40 sm:h-7 sm:w-7"
                title="Previous page"
                aria-label="Previous page"
              >
                <ChevronLeft size={12} />
              </button>

              {paginationItems.map((item) =>
                typeof item === "number" ? (
                  <button
                    key={item}
                    type="button"
                    onClick={() => goToPage(item)}
                    className={[
                      "flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-[8px] font-bold transition sm:h-7 sm:min-w-7 sm:px-2 sm:text-[9px]",
                      item === pagination.page
                        ? "bg-xeoo-primary text-white"
                        : "border border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:bg-xeoo-surface-soft hover:text-xeoo-text",
                    ].join(" ")}
                    aria-current={item === pagination.page ? "page" : undefined}
                    aria-label={`Page ${item}`}
                  >
                    {item}
                  </button>
                ) : (
                  <span
                    key={item}
                    className="flex h-6 w-5 items-center justify-center text-[8px] text-xeoo-muted sm:h-7 sm:text-[9px]"
                  >
                    ...
                  </span>
                ),
              )}

              <button
                type="button"
                disabled={pagination.page >= pagination.total_pages}
                onClick={() => goToPage(pagination.page + 1)}
                className="flex h-6 w-6 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text disabled:pointer-events-none disabled:opacity-40 sm:h-7 sm:w-7"
                title="Next page"
                aria-label="Next page"
              >
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {selectedReport ? (
        <ReportDetailDialog
          report={selectedReport}
          updating={updatingId === selectedReport.id}
          onClose={handleCloseReport}
          onStatusChange={(status) =>
            void handleStatusChange(selectedReport, status)
          }
        />
      ) : null}
    </div>
  );
}

function TableHead({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={[
        "border-r border-xeoo-border px-2 py-2.5 text-[11px] font-extrabold uppercase tracking-wide text-xeoo-muted last:border-r-0",
        className,
      ].join(" ")}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={[
        "border-r border-xeoo-border px-2.5 py-2.5 align-middle last:border-r-0",
        className,
      ].join(" ")}
    >
      {children}
    </td>
  );
}

function ActionButton({
  label,
  icon: Icon,
  loading = false,
  onClick,
}: {
  label: string;
  icon: typeof Eye;
  loading?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title={label}
      aria-label={label}
      className="flex h-6 w-6 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-text-soft transition hover:border-xeoo-primary/30 hover:bg-xeoo-primary-soft hover:text-xeoo-primary disabled:cursor-not-allowed disabled:opacity-40 sm:h-7 sm:w-7"
    >
      {loading ? (
        <LoaderCircle size={10} className="animate-spin" />
      ) : (
        <Icon size={10} />
      )}
    </button>
  );
}

function ReportDetailDialog({
  report,
  updating,
  onClose,
  onStatusChange,
}: {
  report: AdminReport;
  updating: boolean;
  onClose: () => void;
  onStatusChange: (status: ReportStatus) => void;
}) {
  const typeMeta = getTypeMeta(report.type);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2.5 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Report #${report.id}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[calc(100dvh-1.25rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-2xl sm:max-h-[calc(100dvh-2rem)]">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-xeoo-border px-3 py-3 sm:px-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <TypeBadge type={report.type} />

              <StatusBadge status={report.status} />

              <span className="text-[8px] font-semibold text-xeoo-muted sm:text-[9px]">
                #{report.id}
              </span>
            </div>

            <h3 className="mt-2 truncate text-sm font-extrabold text-xeoo-text sm:text-base">
              {report.tool_name}
            </h3>

            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <CategoryBadge
                name={report.category_name}
                slug={report.category_slug}
              />

              <span className="text-[8px] text-xeoo-muted sm:text-[9px]">
                {typeMeta.label}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
            aria-label="Close report details"
          >
            <X size={12} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3.5 sm:px-4">
          <div className="grid grid-cols-2 gap-2">
            <MetaItem
              label="Date"
              value={formatReportDate(report.created_at)}
            />

            <MetaItem label="Time" value={formatReportTime(report.created_at)} />

            <MetaItem
              label="Tool ID"
              value={
                report.tool_id !== null
                  ? `#${report.tool_id}`
                  : "Tool has been removed"
              }
            />

            <MetaItem
              label="Status"
              value={<StatusBadge status={report.status} />}
            />
          </div>

          <div className="mt-3">
            <p className="mb-1.5 text-[8px] font-extrabold uppercase tracking-wide text-xeoo-muted sm:text-[9px]">
              Report Description
            </p>

            <div className="wrap-break-word rounded-lg border border-xeoo-border bg-xeoo-bg px-3 py-3 sm:rounded-xl">
              <p className="whitespace-pre-wrap text-[10px] leading-5 text-xeoo-text sm:text-[11px]">
                {report.message}
              </p>
            </div>
          </div>

          {report.updated_at ? (
            <p className="mt-2 text-[8px] text-xeoo-muted sm:text-[9px]">
              Last updated: {formatReportDate(report.updated_at)}{" "}
              {formatReportTime(report.updated_at)}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-1.5 border-t border-xeoo-border px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <button
            type="button"
            onClick={onClose}
            className="order-2 flex h-8 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface px-3 text-[9px] font-bold text-xeoo-text-soft transition hover:bg-xeoo-surface-soft hover:text-xeoo-text sm:order-1"
          >
            Close
          </button>

          <button
            type="button"
            disabled={updating}
            onClick={() =>
              onStatusChange(report.status === "waiting" ? "fix" : "waiting")
            }
            className="order-1 flex h-8 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-3 text-[9px] font-bold text-white transition hover:bg-xeoo-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:order-2 sm:h-9 sm:text-[10px] shadow-xs"
          >
            {updating ? (
              <LoaderCircle size={11} className="animate-spin" />
            ) : report.status === "waiting" ? (
              <CheckCircle2 size={11} />
            ) : (
              <RotateCcw size={11} />
            )}

            {report.status === "waiting" ? "Mark as Fix" : "Reopen Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-2.5 py-2">
      <p className="text-[8px] font-extrabold uppercase tracking-wide text-xeoo-muted">
        {label}
      </p>

      <div className="mt-1 min-w-0 text-[9px] font-bold text-xeoo-text sm:text-[10px]">
        {value}
      </div>
    </div>
  );
}
