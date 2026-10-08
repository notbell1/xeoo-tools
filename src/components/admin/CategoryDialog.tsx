import { createPortal } from "react-dom";
import { Check, ChevronDown, LoaderCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  normalizeSlug,
} from "../../lib/adminCategories";
import { getCategoryIcon } from "../../lib/toolIcons";

import type { CategoryForm } from "../../types/admin";

type CategoryDialogProps = {
  mode: "create" | "edit";
  form: CategoryForm;
  saving: boolean;
  onChange: (patch: Partial<CategoryForm>) => void;
  onClose: () => void;
  onSave: () => void;
};

type SelectOption = {
  value: string;
  label: string;
  icon?: string;
  color?: string;
};

function CompactSelect({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder,
  iconMode = false,
  colorMode = false,
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
  iconMode?: boolean;
  colorMode?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const [menuStyle, setMenuStyle] = useState({
    top: 0,
    left: 0,
    width: 170,
    maxHeight: 250,
  });

  const selectedOption =
    options.find((option) => option.value === value) ?? null;

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

      const padding = 8;

      const width = Math.min(
        Math.max(rect.width, 160),
        viewportWidth - padding * 2,
      );

      const left = Math.max(
        padding,
        Math.min(rect.left, viewportWidth - width - padding),
      );

      const maxHeight = Math.min(270, Math.max(150, viewportHeight - 24));

      const actualHeight =
        menuRef.current?.getBoundingClientRect().height ?? maxHeight;

      const spaceBelow = viewportHeight - rect.bottom;

      const spaceAbove = rect.top;

      let top = rect.bottom + 5;

      if (spaceBelow < actualHeight + 8 && spaceAbove > spaceBelow) {
        top =
          rect.top - Math.min(actualHeight, Math.max(120, spaceAbove - 8)) - 5;
      }

      top = Math.max(
        8,
        Math.min(top, viewportHeight - Math.min(actualHeight, maxHeight) - 8),
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

  const SelectedIcon =
    iconMode && selectedOption?.icon
      ? getCategoryIcon(selectedOption.icon)
      : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 text-[10px] font-semibold text-xeoo-text outline-none transition hover:bg-xeoo-surface focus:border-xeoo-primary focus:bg-xeoo-surface sm:h-8.5 sm:px-3 sm:text-[11px]"
      >
        <span className="flex min-w-0 items-center gap-2">
          {SelectedIcon ? (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-text-soft">
              <SelectedIcon size={12} />
            </span>
          ) : colorMode && selectedOption?.color ? (
            <span
              className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10"
              style={{
                backgroundColor: getColorHex(selectedOption.color),
              }}
            />
          ) : null}

          <span className="truncate">
            {selectedOption?.label ?? placeholder ?? "Select"}
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

                const OptionIcon =
                  iconMode && option.icon ? getCategoryIcon(option.icon) : null;

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
                      "flex min-h-8 w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-[9px] font-semibold transition sm:min-h-9 sm:px-2.5 sm:text-[10px]",
                      active
                        ? "bg-xeoo-primary-soft text-xeoo-primary"
                        : "text-xeoo-text-soft hover:bg-xeoo-surface-soft hover:text-xeoo-text",
                    ].join(" ")}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {OptionIcon ? (
                        <span
                          className={[
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
                            active
                              ? "border-xeoo-primary/20 bg-white/70"
                              : "border-xeoo-border bg-xeoo-surface",
                          ].join(" ")}
                        >
                          <OptionIcon size={13} />
                        </span>
                      ) : colorMode && option.color ? (
                        <span
                          className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                          style={{
                            backgroundColor: getColorHex(option.color),
                          }}
                        />
                      ) : null}

                      <span className="min-w-0 truncate">{option.label}</span>
                    </span>

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

function getColorHex(color: string) {
  const colors: Record<string, string> = {
    slate: "#64748b",
    gray: "#6b7280",
    zinc: "#71717a",
    neutral: "#737373",
    stone: "#78716c",
    red: "#ef4444",
    orange: "#f97316",
    amber: "#f59e0b",
    yellow: "#eab308",
    lime: "#84cc16",
    green: "#22c55e",
    emerald: "#10b981",
    teal: "#14b8a6",
    cyan: "#06b6d4",
    sky: "#0ea5e9",
    blue: "#3b82f6",
    indigo: "#6366f1",
    violet: "#8b5cf6",
    purple: "#a855f7",
    fuchsia: "#d946ef",
    pink: "#ec4899",
    rose: "#f43f5e",
  };

  return colors[color] ?? "#64748b";
}

export default function CategoryDialog({
  mode,
  form,
  saving,
  onChange,
  onClose,
  onSave,
}: CategoryDialogProps) {
  const iconOptions = CATEGORY_ICONS.map((icon) => ({
    value: icon,
    label: formatIconLabel(icon),
    icon,
  }));

  const colorOptions = CATEGORY_COLORS.map((color) => ({
    value: color.value,
    label: color.label,
    color: color.value,
  }));

  const safeIcon = CATEGORY_ICONS.includes(
    form.icon as (typeof CATEGORY_ICONS)[number],
  )
    ? form.icon
    : "wrench";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-3">
      <div className="flex max-h-[calc(100dvh-0.75rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-2xl sm:max-h-[calc(100dvh-1.5rem)] sm:rounded-2xl">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-xeoo-border px-3 py-2.5 sm:px-4 sm:py-3">
          <h2 className="truncate text-[13px] font-extrabold text-xeoo-text sm:text-sm">
            {mode === "edit" ? "Edit Category" : "Add Category"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-xeoo-border text-xeoo-text-muted transition hover:bg-xeoo-surface-soft disabled:opacity-40"
            aria-label="Close"
          >
            <X size={12} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 sm:py-4">
          <div className="space-y-3">
            <div>
              <label
                htmlFor="category-name"
                className="mb-1 block text-[9px] font-bold text-xeoo-text sm:text-[10px]"
              >
                Category Name
              </label>

              <input
                id="category-name"
                type="text"
                value={form.name}
                onChange={(event) => {
                  const value = event.target.value;

                  onChange({
                    name: value,
                    slug: normalizeSlug(value),
                  });
                }}
                placeholder="e.g. Math"
                className="h-8 w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 text-[10px] text-xeoo-text outline-none transition focus:border-xeoo-primary focus:bg-xeoo-surface sm:h-8.5 sm:px-3 sm:text-[11px]"
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="category-slug"
                className="mb-1 block text-[9px] font-bold text-xeoo-text sm:text-[10px]"
              >
                Slug
              </label>

              <input
                id="category-slug"
                type="text"
                value={form.slug}
                readOnly
                disabled
                className="h-8 w-full cursor-not-allowed rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-2.5 font-mono text-[10px] text-xeoo-muted outline-none sm:h-8.5 sm:px-3 sm:text-[11px]"
              />
            </div>

            <div>
              <label
                htmlFor="category-description"
                className="mb-1 block text-[9px] font-bold text-xeoo-text sm:text-[10px]"
              >
                Description
              </label>

              <textarea
                id="category-description"
                value={form.description}
                onChange={(event) =>
                  onChange({
                    description: event.target.value,
                  })
                }
                placeholder="Brief category description..."
                rows={2}
                className="w-full resize-none rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-2 text-[10px] leading-4.5 text-xeoo-text outline-none transition focus:border-xeoo-primary focus:bg-xeoo-surface sm:px-3 sm:text-[11px] sm:leading-5"
              />
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[9px] font-bold text-xeoo-text sm:text-[10px]">
                  Icon
                </label>

                <CompactSelect
                  value={safeIcon}
                  options={iconOptions}
                  onChange={(value) =>
                    onChange({
                      icon: value,
                    })
                  }
                  ariaLabel="Select category icon"
                  placeholder="Select icon"
                  iconMode
                />
              </div>

              <div>
                <label className="mb-1 block text-[9px] font-bold text-xeoo-text sm:text-[10px]">
                  Color
                </label>

                <CompactSelect
                  value={form.color}
                  options={colorOptions}
                  onChange={(value) =>
                    onChange({
                      color: value,
                    })
                  }
                  ariaLabel="Select category color"
                  placeholder="Select color"
                  colorMode
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-1.5 border-t border-xeoo-border bg-xeoo-surface-soft px-3 py-2.5 sm:gap-2 sm:px-4 sm:py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-8 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 text-[9px] font-bold text-xeoo-text-soft transition hover:bg-xeoo-surface-soft disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-[10px]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-2.5 text-[9px] font-bold text-white transition hover:bg-xeoo-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-[10px]"
          >
            {saving ? (
              <LoaderCircle size={10} className="animate-spin" />
            ) : (
              <Check size={10} />
            )}

            {mode === "edit" ? "Save Changes" : "Add Category"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatIconLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
