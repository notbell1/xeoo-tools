import {
  CalendarClock,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Construction,
  Edit3,
  ExternalLink,
  LoaderCircle,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAdminTools } from "../../hooks/useAdminTools";
import { getCategoryBadgeClass } from "../../lib/adminCategories";
import { getToolIcon } from "../../lib/toolIcons";

import ToolDialog from "./ToolDialog";

import type { AdminCategory, AdminTool, ToolStatus } from "../../types/admin";

// MAX DATA PAGINATION
const TOOLS_PER_PAGE = 8;

const STATUS_OPTIONS: Array<{
  value: ToolStatus;
  label: string;
}> = [
  {
    value: "ready",
    label: "Ready",
  },
  {
    value: "maintenance",
    label: "Maintenance",
  },
  {
    value: "upcoming",
    label: "Upcoming",
  },
];

const STATUS_META: Record<
  ToolStatus,
  {
    label: string;
    className: string;
  }
> = {
  ready: {
    label: "Ready",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  maintenance: {
    label: "Maintenance",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  upcoming: {
    label: "Upcoming",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
};

function getStatusIcon(status: ToolStatus) {
  if (status === "ready") {
    return Check;
  }

  if (status === "maintenance") {
    return Construction;
  }

  return CalendarClock;
}

type FilterOption = {
  value: string;
  label: string;
  shortLabel?: string;
};

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

type AdminToolsProps = {
  tools: AdminTool[];
  categories: AdminCategory[];
  selectedCategory: string | null;
  onSelectedCategoryChange: (category: string | null) => void;
  onUnauthorized: () => void;
  onRefresh: () => Promise<void>;
};

export default function AdminTools({
  tools,
  categories,
  selectedCategory,
  onSelectedCategoryChange,
  onUnauthorized,
  onRefresh,
}: AdminToolsProps) {
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<"all" | ToolStatus>("all");

  const [categoryFilter, setCategoryFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);

  const {
    toolDialog,
    toolForm,
    toolSaving,
    toolSavingId,
    toolDeletingId,
    openCreateTool,
    openEditTool,
    closeToolDialog,
    updateToolForm,
    saveTool,
    updateStatus,
    deleteTool,
  } = useAdminTools({
    tools,
    categories,
    onUnauthorized,
    refreshData: onRefresh,
  });

  useEffect(() => {
    setCategoryFilter(selectedCategory ?? "all");
    setCurrentPage(1);
  }, [selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, categoryFilter]);

  const getToolCategory = (tool: AdminTool) => {
    return categories.find(
      (category) =>
        category.id === tool.category_id ||
        category.slug === tool.category_slug,
    );
  };

  const filteredTools = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const selectedCategoryRecord = categories.find(
      (category) => category.name === categoryFilter,
    );

    return tools.filter((tool) => {
      const matchesSearch =
        !keyword ||
        tool.name.toLowerCase().includes(keyword) ||
        tool.description.toLowerCase().includes(keyword) ||
        tool.slug.toLowerCase().includes(keyword) ||
        tool.category_name.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" || tool.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        tool.category_slug === selectedCategoryRecord?.slug;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [categories, categoryFilter, search, statusFilter, tools]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTools.length / TOOLS_PER_PAGE),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedTools = useMemo(() => {
    const start = (currentPage - 1) * TOOLS_PER_PAGE;

    return filteredTools.slice(start, start + TOOLS_PER_PAGE);
  }, [currentPage, filteredTools]);

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);

    onSelectedCategoryChange(value === "all" ? null : value);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    onSelectedCategoryChange(null);
  };

  const firstItem =
    filteredTools.length > 0 ? (currentPage - 1) * TOOLS_PER_PAGE + 1 : 0;

  const lastItem = Math.min(currentPage * TOOLS_PER_PAGE, filteredTools.length);

  return (
    <div>
      <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-sm">
        <div className="border-b border-xeoo-border p-2.5 sm:p-3">
          <div className="grid grid-cols-[minmax(0,1fr)_96px_112px] gap-1.5 md:grid-cols-3 md:gap-2 lg:grid-cols-[minmax(0,1fr)_160px_180px_auto]">
            <div className="relative">
              <Search
                size={12}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xeoo-muted sm:left-3"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tools..."
                className="h-8 w-full rounded-lg border border-xeoo-border bg-xeoo-bg pl-7 pr-2 text-[9px] text-xeoo-text outline-none placeholder:text-xeoo-muted focus:border-xeoo-primary focus:bg-xeoo-surface sm:h-9 sm:pl-8 sm:pr-3 sm:text-[11px]"
              />
            </div>

            <CompactFilterSelect
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as "all" | ToolStatus)}
              mobileLabel="Status"
              ariaLabel="Filter status"
              options={[
                {
                  value: "all",
                  label: "All",
                  shortLabel: "Status",
                },
                ...STATUS_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                  shortLabel: option.label,
                })),
              ]}
            />

            <CompactFilterSelect
              value={categoryFilter}
              onChange={handleCategoryFilterChange}
              mobileLabel="Category"
              ariaLabel="Filter Category"
              options={[
                {
                  value: "all",
                  label: "All",
                  shortLabel: "Category",
                },
                ...categories.map((category) => {
                  const displayName = category.name
                    .replace(/\s+Tools$/i, "")
                    .trim();

                  return {
                    value: category.name,
                    label: displayName,
                    shortLabel: displayName,
                  };
                }),
              ]}
            />

            <button
              type="button"
              onClick={openCreateTool}
              disabled={categories.length === 0}
              className="col-span-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-3 text-[9px] font-bold text-white transition hover:bg-xeoo-primary-hover disabled:cursor-not-allowed disabled:opacity-45 md:col-span-1 md:h-9 lg:col-span-1"
              title={
                categories.length === 0 ? "Add Category First" : "Add Tool"
              }
            >
              <Plus size={11} />
              Add Tool
            </button>
          </div>

          {categories.length === 0 ? (
            <p className="mt-2 text-[9px] font-semibold text-amber-700">
              No categories available. Please create a category before adding a tool.
            </p>
          ) : null}
        </div>

        {paginatedTools.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-xeoo-surface-soft text-xeoo-muted">
              <Search size={16} />
            </div>

            <h3 className="mt-2.5 text-sm font-bold text-xeoo-text">
              No tools found
            </h3>

            <p className="mt-1 text-[10px] text-xeoo-muted">
              No results match the filters.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-2.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-1.5 text-[9px] font-bold text-xeoo-text-soft transition hover:bg-xeoo-surface-soft"
            >
              Reset filter
            </button>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-280 border-collapse">
                  <thead>
                    <tr className="border-b border-xeoo-border bg-xeoo-surface-soft/60">
                      <th className="w-12 border-r border-xeoo-border px-2 py-2.5 text-center text-[11px] font-extrabold uppercase tracking-wide text-xeoo-muted">
                        No
                      </th>

                      <th className="w-14 border-r border-xeoo-border px-2 py-2.5 text-center text-[11px] font-extrabold uppercase tracking-wide text-xeoo-muted">
                        Icon
                      </th>

                      <th className="w-40 border-r border-xeoo-border px-3 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-wide text-xeoo-muted">
                        Tool Name
                      </th>

                      <th className="min-w-55 border-r border-xeoo-border px-3 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-wide text-xeoo-muted">
                        Description
                      </th>

                      <th className="w-36 border-r border-xeoo-border px-2 py-2.5 text-center text-[11px] font-extrabold uppercase tracking-wide text-xeoo-muted">
                        Category
                      </th>

                      <th className="w-28 border-r border-xeoo-border px-2 py-2.5 text-center text-[11px] font-extrabold uppercase tracking-wide text-xeoo-muted">
                        Status
                      </th>

                      <th className="w-32 border-r border-xeoo-border px-2 py-2.5 text-center text-[11px] font-extrabold uppercase tracking-wide text-xeoo-muted">
                        Update Status
                      </th>

                      <th className="w-20 border-r border-xeoo-border px-2 py-2.5 text-center text-[11px] font-extrabold uppercase tracking-wide text-xeoo-muted">
                        Action
                      </th>

                      <th className="w-16 px-2 py-2.5 text-center text-[11px] font-extrabold uppercase tracking-wide text-xeoo-muted">
                        View
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedTools.map((tool, index) => {
                      const ToolIcon = getToolIcon(tool.icon);

                      const isSaving = toolSavingId === tool.id;

                      const isDeleting = toolDeletingId === tool.id;

                      const rowNumber =
                        (currentPage - 1) * TOOLS_PER_PAGE + index + 1;

                      const statusMeta = STATUS_META[tool.status];

                      const category = getToolCategory(tool);

                      return (
                        <tr
                          key={tool.id}
                          className={[
                            "border-b border-xeoo-border transition last:border-b-0 hover:bg-xeoo-bg",
                            index % 2 === 0
                              ? "bg-xeoo-surface"
                              : "bg-xeoo-surface-soft/45",
                          ].join(" ")}
                        >
                          <td className="border-r border-xeoo-border px-2 py-2.5 text-center text-[10px] font-bold text-xeoo-muted">
                            {rowNumber}
                          </td>

                          <td className="border-r border-xeoo-border px-2 py-2.5">
                            <div
                              className={[
                                "mx-auto flex h-8 w-8 items-center justify-center rounded-lg border",
                                statusMeta.className,
                              ].join(" ")}
                            >
                              <ToolIcon size={15} strokeWidth={1.9} />
                            </div>
                          </td>

                          <td className="border-r border-xeoo-border px-3 py-2.5 align-middle">
                            <span
                              className="block truncate text-xs font-extrabold text-xeoo-text"
                              title={tool.name}
                            >
                              {tool.name}
                            </span>
                          </td>

                          <td className="border-r border-xeoo-border px-3 py-2.5 align-middle">
                            <p
                              className="line-clamp-2 text-[12px] leading-relaxed text-xeoo-text-soft"
                              title={tool.description}
                            >
                              {tool.description}
                            </p>
                          </td>

                          <td className="border-r border-xeoo-border px-2 py-2.5 text-center">
                            <span
                              className={[
                                "inline-flex max-w-full items-center rounded-lg border px-2 py-1.5 text-[10px] font-bold",
                                getCategoryBadgeClass(category?.color ?? ""),
                              ].join(" ")}
                              title={tool.category_name || "-"}
                            >
                              <span className="truncate">
                                {tool.category_name || "-"}
                              </span>
                            </span>
                          </td>

                          <td className="border-r border-xeoo-border px-2 py-2.5 text-center">
                            <span
                              className={[
                                "inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] font-extrabold",
                                statusMeta.className,
                              ].join(" ")}
                            >
                              {tool.status === "ready" ? (
                                <Check size={12} />
                              ) : tool.status === "maintenance" ? (
                                <Construction size={12} />
                              ) : (
                                <CalendarClock size={12} />
                              )}

                              {statusMeta.label}
                            </span>
                          </td>

                          <td className="border-r border-xeoo-border px-2 py-2.5">
                            <div className="flex items-center justify-center gap-1">
                              {STATUS_OPTIONS.map((option) => {
                                const isActive = tool.status === option.value;

                                const Icon = getStatusIcon(option.value);

                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    disabled={
                                      isSaving || isDeleting || isActive
                                    }
                                    onClick={() =>
                                      void updateStatus(tool.id, option.value)
                                    }
                                    title={`Set ${option.label}`}
                                    aria-label={`Set ${tool.name} to ${option.label}`}
                                    className={[
                                      "flex h-6 w-6 items-center justify-center rounded-md border transition",
                                      "disabled:cursor-not-allowed disabled:opacity-35",
                                      isActive
                                        ? STATUS_META[option.value].className
                                        : "border-xeoo-border bg-xeoo-surface text-xeoo-text-soft hover:bg-xeoo-surface-soft",
                                    ].join(" ")}
                                  >
                                    {isSaving &&
                                    tool.status === option.value ? (
                                      <LoaderCircle
                                        size={10}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Icon size={11} strokeWidth={2} />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </td>

                          <td className="border-r border-xeoo-border px-2 py-2.5">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                disabled={isSaving || isDeleting}
                                onClick={() => openEditTool(tool)}
                                title="Edit"
                                aria-label={`Edit ${tool.name}`}
                                className="flex h-6 w-6 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-text-soft transition hover:border-xeoo-primary/30 hover:bg-xeoo-primary-soft hover:text-xeoo-primary disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                <Edit3 size={10} strokeWidth={1.9} />
                              </button>

                              <button
                                type="button"
                                disabled={isSaving || isDeleting}
                                onClick={() => void deleteTool(tool.id)}
                                title="Delete"
                                aria-label={`Delete ${tool.name}`}
                                className="flex h-6 w-6 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-text-soft transition hover:border-xeoo-danger/30 hover:bg-xeoo-danger-soft hover:text-xeoo-danger disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                {isDeleting ? (
                                  <LoaderCircle
                                    size={10}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 size={10} strokeWidth={1.9} />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="px-2 py-2.5 text-center">
                            <a
                              href={`/tools/${encodeURIComponent(tool.slug)}`}
                              title={`View ${tool.name}`}
                              aria-label={`View ${tool.name}`}
                              className="mx-auto flex h-6 w-6 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-text-soft transition hover:border-xeoo-primary/30 hover:bg-xeoo-primary-soft hover:text-xeoo-primary"
                            >
                              <ExternalLink size={10} />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="divide-y divide-xeoo-border md:hidden">
              {paginatedTools.map((tool, index) => {
                const ToolIcon = getToolIcon(tool.icon);

                const isSaving = toolSavingId === tool.id;

                const isDeleting = toolDeletingId === tool.id;

                const statusMeta = STATUS_META[tool.status];

                const category = getToolCategory(tool);

                const rowNumber =
                  (currentPage - 1) * TOOLS_PER_PAGE + index + 1;

                return (
                  <article
                    key={tool.id}
                    className={[
                      "px-2.5 py-2",
                      index % 2 === 0
                        ? "bg-xeoo-surface"
                        : "bg-xeoo-surface-soft/45",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 shrink-0 text-center text-[9px] font-bold text-xeoo-muted">
                        {rowNumber}
                      </span>

                      <div
                        className={[
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                          statusMeta.className,
                        ].join(" ")}
                      >
                        <ToolIcon size={14} strokeWidth={1.9} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate text-[11px] font-extrabold text-xeoo-text"
                          title={tool.name}
                        >
                          {tool.name}
                        </p>

                        <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                          <span
                            className={[
                              "max-w-25 shrink-0 truncate rounded-md border px-1.5 py-0.5 text-[8px] font-bold",
                              getCategoryBadgeClass(category?.color ?? ""),
                            ].join(" ")}
                            title={tool.category_name || "-"}
                          >
                            {tool.category_name || "-"}
                          </span>

                          <p
                            className="min-w-0 truncate text-[9px] leading-tight text-xeoo-text-soft"
                            title={tool.description}
                          >
                            {tool.description}
                          </p>
                        </div>
                      </div>

                      <span
                        className={[
                          "inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[8px] font-bold",
                          statusMeta.className,
                        ].join(" ")}
                      >
                        {statusMeta.label}
                      </span>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          disabled={isSaving || isDeleting}
                          onClick={() => openEditTool(tool)}
                          title="Edit"
                          aria-label={`Edit ${tool.name}`}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-text-soft transition hover:border-xeoo-primary/30 hover:bg-xeoo-primary-soft hover:text-xeoo-primary disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Edit3 size={10} />
                        </button>

                        <button
                          type="button"
                          disabled={isSaving || isDeleting}
                          onClick={() => void deleteTool(tool.id)}
                          title="Delete"
                          aria-label={`Delete ${tool.name}`}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-text-soft transition hover:border-xeoo-danger/30 hover:bg-xeoo-danger-soft hover:text-xeoo-danger disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          {isDeleting ? (
                            <LoaderCircle size={10} className="animate-spin" />
                          ) : (
                            <Trash2 size={10} />
                          )}
                        </button>

                        <a
                          href={`/tools/${encodeURIComponent(tool.slug)}`}
                          title={`View ${tool.name}`}
                          aria-label={`View ${tool.name}`}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-text-soft transition hover:border-xeoo-primary/30 hover:bg-xeoo-primary-soft hover:text-xeoo-primary"
                        >
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>

                    <div className="mt-1.5 flex items-center justify-end gap-1">
                      <span className="mr-1 text-[8px] font-semibold text-xeoo-muted">
                        Update:
                      </span>

                      {STATUS_OPTIONS.map((option) => {
                        const isActive = tool.status === option.value;

                        const Icon = getStatusIcon(option.value);

                        return (
                          <button
                            key={option.value}
                            type="button"
                            disabled={isSaving || isDeleting || isActive}
                            onClick={() =>
                              void updateStatus(tool.id, option.value)
                            }
                            title={`Set ${option.label}`}
                            aria-label={`Set ${tool.name} to ${option.label}`}
                            className={[
                              "flex h-6 w-6 items-center justify-center rounded-md border transition",
                              "disabled:cursor-not-allowed disabled:opacity-35",
                              isActive
                                ? STATUS_META[option.value].className
                                : "border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:bg-xeoo-surface-soft",
                            ].join(" ")}
                          >
                            {isSaving && tool.status === option.value ? (
                              <LoaderCircle size={9} className="animate-spin" />
                            ) : (
                              <Icon size={10} strokeWidth={2} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        {filteredTools.length > 0 ? (
          <div className="flex items-center justify-between border-t border-xeoo-border px-2.5 py-2 sm:px-3">
            <span className="text-[8px] font-semibold text-xeoo-muted sm:text-[9px]">
              {firstItem}-{lastItem} / {filteredTools.length}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="flex h-6 w-6 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text disabled:pointer-events-none disabled:opacity-40 sm:h-7 sm:w-7"
                title="Previous page"
                aria-label="Previous page"
              >
                <ChevronLeft size={12} />
              </button>

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) => index + 1,
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={[
                    "flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-[8px] font-bold transition sm:h-7 sm:min-w-7 sm:px-2 sm:text-[9px]",
                    currentPage === page
                      ? "bg-xeoo-primary text-white"
                      : "border border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:bg-xeoo-surface-soft hover:text-xeoo-text",
                  ].join(" ")}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
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

      {toolDialog ? (
        <ToolDialog
          mode={toolDialog}
          form={toolForm}
          categories={categories}
          saving={toolSaving}
          onChange={updateToolForm}
          onClose={closeToolDialog}
          onSave={() => void saveTool()}
        />
      ) : null}
    </div>
  );
}
