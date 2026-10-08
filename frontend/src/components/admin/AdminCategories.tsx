import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wrench,
  Check,
} from "lucide-react";

import { getCategoryBadgeClass } from "../../lib/adminCategories";
import { getCategoryIcon } from "../../lib/toolIcons";

import type { AdminCategory } from "../../types/admin";

type AdminCategoriesProps = {
  categories: AdminCategory[];
  categoryLoading: boolean;
  categoryDeletingId: number | null;
  onCreate: () => void;
  onEdit: (category: AdminCategory) => void;
  onDelete: (category: AdminCategory) => void;
};

type CategoryFilter = "all" | "used" | "empty";

const CATEGORIES_PER_PAGE = 8;

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

export default function AdminCategories({
  categories,
  categoryLoading,
  categoryDeletingId,
  onCreate,
  onEdit,
  onDelete,
}: AdminCategoriesProps) {
  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<CategoryFilter>("all");

  const [currentPage, setCurrentPage] = useState(1);

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        !keyword ||
        category.name.toLowerCase().includes(keyword) ||
        category.slug.toLowerCase().includes(keyword) ||
        category.description.toLowerCase().includes(keyword);

      const matchesFilter =
        filter === "all" ||
        (filter === "used" && category.tool_count > 0) ||
        (filter === "empty" && category.tool_count === 0);

      return matchesSearch && matchesFilter;
    });
  }, [categories, filter, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / CATEGORIES_PER_PAGE),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * CATEGORIES_PER_PAGE;

  const paginatedCategories = filteredCategories.slice(
    startIndex,
    startIndex + CATEGORIES_PER_PAGE,
  );

  const firstItem = filteredCategories.length > 0 ? startIndex + 1 : 0;

  const lastItem = Math.min(
    startIndex + CATEGORIES_PER_PAGE,
    filteredCategories.length,
  );

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(1, page - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(totalPages, Math.max(1, page)));
  };

  const resetFilters = () => {
    setSearch("");
    setFilter("all");
  };

  return (
    <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-sm">
      <div className="border-b border-xeoo-border p-2.5 sm:p-3">
        <div className="grid grid-cols-[minmax(0,1fr)_118px] gap-1.5 md:grid-cols-2 md:gap-2 lg:grid-cols-[minmax(0,1fr)_180px_auto]">
          <div className="relative">
            <Search
              size={12}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xeoo-muted sm:left-3"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories..."
              className="h-8 w-full rounded-lg border border-xeoo-border bg-xeoo-bg pl-7 pr-2 text-[9px] text-xeoo-text outline-none placeholder:text-xeoo-muted focus:border-xeoo-primary focus:bg-xeoo-surface sm:h-9 sm:pl-8 sm:pr-3 sm:text-[11px]"
            />
          </div>

          <CompactFilterSelect
            value={filter}
            onChange={(value) => setFilter(value as CategoryFilter)}
            mobileLabel="Filter"
            ariaLabel="Category filter"
            options={[
              {
                value: "all",
                label: "All",
                shortLabel: "All",
              },
              {
                value: "used",
                label: "Tools Available",
                shortLabel: "Tools available",
              },
              {
                value: "empty",
                label: "Tools Not Available",
                shortLabel: "Tools not available",
              },
            ]}
          />

          <button
            type="button"
            onClick={onCreate}
            className="col-span-2 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-3 text-[9px] font-bold text-white transition hover:bg-xeoo-primary-hover md:col-span-2 md:h-9 lg:col-span-1"
          >
            <Plus size={11} />
            Add Category
          </button>
        </div>
      </div>

      {categoryLoading ? (
        <div className="flex items-center justify-center px-4 py-10">
          <div className="flex items-center gap-2 text-[10px] font-semibold text-xeoo-muted">
            <LoaderCircle size={15} className="animate-spin" />
            Loading categories...
          </div>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="px-4 py-9 text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-xeoo-surface-soft text-xeoo-muted">
            {categories.length === 0 ? (
              <Wrench size={16} />
            ) : (
              <Search size={16} />
            )}
          </div>

          <p className="mt-2.5 text-sm font-bold text-xeoo-text">
            {categories.length === 0 ? "No categories yet" : "Uncategorized"}
          </p>

          <p className="mt-1 text-[10px] text-xeoo-muted">
            {categories.length === 0
              ? "Add the first category."
              : "No results match the filters."}
          </p>

          {categories.length > 0 ? (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-2.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-1.5 text-[9px] font-bold text-xeoo-text-soft transition hover:bg-xeoo-surface-soft"
            >
              Reset filter
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-xeoo-border bg-xeoo-surface-soft/60">
                    <th className="w-12 border-r border-xeoo-border px-2 py-2.5 text-center text-[11px] font-extrabold uppercase tracking-wide text-xeoo-muted">
                      No
                    </th>

                    <th className="w-14 border-r border-xeoo-border px-2 py-2.5 text-center text-[11px] font-extrabold uppercase tracking-wide text-xeoo-muted">
                      Icon
                    </th>

                    <th className="w-55 border-r border-xeoo-border px-3 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-wide text-xeoo-muted">
                      Category Name
                    </th>

                    <th className="border-r border-xeoo-border px-3 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-wide text-xeoo-muted">
                      Description
                    </th>

                    <th className="w-28 border-r border-xeoo-border px-2 py-2.5 text-center text-[11px] font-extrabold uppercase tracking-wide text-xeoo-muted">
                      Total Tools
                    </th>

                    <th className="w-24 px-2 py-2.5 text-center text-[11px] font-extrabold uppercase tracking-wide text-xeoo-muted">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedCategories.map((category, index) => {
                    const CategoryIcon = getCategoryIcon(
                      category.icon || category.slug,
                    );

                    const isDeleting = categoryDeletingId === category.id;

                    return (
                      <tr
                        key={category.id}
                        className={[
                          "border-b border-xeoo-border transition last:border-b-0 hover:bg-xeoo-bg",
                          index % 2 === 0
                            ? "bg-xeoo-surface"
                            : "bg-xeoo-surface-soft/45",
                        ].join(" ")}
                      >
                        <td className="border-r border-xeoo-border px-2 py-2.5 text-center text-[10px] font-bold text-xeoo-muted">
                          {startIndex + index + 1}
                        </td>

                        <td className="border-r border-xeoo-border px-2 py-2.5">
                          <div
                            className={[
                              "mx-auto flex h-8 w-8 items-center justify-center rounded-lg border",
                              getCategoryBadgeClass(category.color),
                            ].join(" ")}
                          >
                            <CategoryIcon size={15} strokeWidth={1.9} />
                          </div>
                        </td>

                        <td className="border-r border-xeoo-border px-3 py-2.5">
                          <span className="block truncate text-xs font-extrabold text-xeoo-text">
                            {category.name}
                          </span>
                        </td>

                        <td className="border-r border-xeoo-border px-3 py-2.5">
                          <p
                            className="line-clamp-2 text-[12px] leading-relaxed text-xeoo-text-soft"
                            title={
                              category.description || "No description"
                            }
                          >
                            {category.description || "No description"}
                          </p>
                        </td>

                        <td className="border-r border-xeoo-border px-2 py-2.5 text-center">
                          <span className="inline-flex min-w-7 items-center justify-center rounded-full border border-xeoo-border bg-xeoo-surface-soft px-2 py-1 text-[10px] font-bold text-xeoo-text-soft">
                            {category.tool_count}
                          </span>
                        </td>

                        <td className="px-2 py-2.5">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => onEdit(category)}
                              className="flex h-6 w-6 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-text-soft transition hover:border-xeoo-primary/30 hover:bg-xeoo-primary-soft hover:text-xeoo-primary"
                              title="Edit"
                              aria-label={`Edit ${category.name}`}
                            >
                              <Pencil size={10} />
                            </button>

                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => onDelete(category)}
                              className="flex h-6 w-6 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-text-soft transition hover:border-xeoo-danger/30 hover:bg-xeoo-danger-soft hover:text-xeoo-danger disabled:cursor-not-allowed disabled:opacity-40"
                              title="Delete"
                              aria-label={`Delete ${category.name}`}
                            >
                              {isDeleting ? (
                                <LoaderCircle
                                  size={10}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={10} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="divide-y divide-xeoo-border md:hidden">
            {paginatedCategories.map((category, index) => {
              const CategoryIcon = getCategoryIcon(
                category.icon || category.slug,
              );

              const isDeleting = categoryDeletingId === category.id;

              return (
                <article
                  key={category.id}
                  className={[
                    "px-2.5 py-2",
                    index % 2 === 0
                      ? "bg-xeoo-surface"
                      : "bg-xeoo-surface-soft/45",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className={[
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                        getCategoryBadgeClass(category.color),
                      ].join(" ")}
                    >
                      <CategoryIcon size={14} strokeWidth={1.9} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <p className="min-w-0 truncate text-[11px] font-extrabold text-xeoo-text">
                          {category.name}
                        </p>

                        <span className="inline-flex shrink-0 rounded-full border border-xeoo-border bg-xeoo-surface-soft px-1.5 py-0.5 text-[8px] font-bold text-xeoo-text-soft">
                          {category.tool_count}
                        </span>
                      </div>

                      <p
                        className="mt-0.5 truncate text-[9px] leading-tight text-xeoo-text-soft"
                        title={category.description || "No description"}
                      >
                        {category.description || "No description"}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(category)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-text-soft transition hover:border-xeoo-primary/30 hover:bg-xeoo-primary-soft hover:text-xeoo-primary"
                        title="Edit"
                        aria-label={`Edit ${category.name}`}
                      >
                        <Pencil size={10} />
                      </button>

                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => onDelete(category)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-text-soft transition hover:border-xeoo-danger/30 hover:bg-xeoo-danger-soft hover:text-xeoo-danger disabled:cursor-not-allowed disabled:opacity-40"
                        title="Delete"
                        aria-label={`Delete ${category.name}`}
                      >
                        {isDeleting ? (
                          <LoaderCircle size={10} className="animate-spin" />
                        ) : (
                          <Trash2 size={10} />
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {filteredCategories.length > 0 && totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-xeoo-border px-2.5 py-2 sm:px-3">
          <span className="text-[8px] font-semibold text-xeoo-muted sm:text-[9px]">
            {firstItem}-{lastItem} / {filteredCategories.length}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goToPreviousPage}
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
                onClick={() => goToPage(page)}
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
              onClick={goToNextPage}
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
  );
}
