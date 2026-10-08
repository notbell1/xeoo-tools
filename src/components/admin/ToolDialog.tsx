import { Check, ChevronDown, LoaderCircle, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import { CATEGORY_ICONS, normalizeSlug } from "../../lib/adminCategories";
import { getCategoryIcon, getToolIcon } from "../../lib/toolIcons";

import type { AdminCategory, ToolForm, ToolStatus } from "../../types/admin";

type ToolDialogProps = {
  mode: "create" | "edit";
  form: ToolForm;
  categories: AdminCategory[];
  saving: boolean;
  onChange: (patch: Partial<ToolForm>) => void;
  onClose: () => void;
  onSave: () => void;
};

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

type FilterOption = {
  value: string;
  label: string;
  shortLabel?: string;
  icon?: string;
  iconType?: "tool" | "category";
};

function fieldClassName() {
  return "h-8 w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 text-[10px] text-xeoo-text outline-none transition focus:border-xeoo-primary focus:bg-xeoo-surface sm:h-8.5 sm:px-3 sm:text-[11px]";
}

function textareaClassName() {
  return "w-full resize-none rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-2 text-[10px] leading-4.5 text-xeoo-text outline-none transition focus:border-xeoo-primary focus:bg-xeoo-surface sm:px-3 sm:text-[11px] sm:leading-5";
}

function formatIconLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getOptionIcon(option?: FilterOption) {
  if (!option?.icon) {
    return null;
  }

  if (option.iconType === "category") {
    return getCategoryIcon(option.icon);
  }

  return getToolIcon(option.icon);
}

function CompactFilterSelect({
  value,
  onChange,
  options,
  ariaLabel,
  mobileLabel,
  iconMode = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  ariaLabel: string;
  mobileLabel: string;
  iconMode?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const directionRef = useRef<"up" | "down">("down");

  const initializedRef = useRef(false);

  const [menuStyle, setMenuStyle] = useState({
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

    initializedRef.current = false;

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
        Math.max(rect.width, 160),
        viewportWidth - horizontalPadding * 2,
      );

      const left = Math.max(
        horizontalPadding,
        Math.min(rect.left, viewportWidth - width - horizontalPadding),
      );

      const maxHeight = Math.min(270, Math.max(150, viewportHeight - 24));

      if (!initializedRef.current) {
        const estimatedMenuHeight = Math.min(
          options.length * 36 + 8,
          maxHeight,
        );

        const spaceBelow = viewportHeight - rect.bottom;

        const spaceAbove = rect.top;

        directionRef.current =
          spaceBelow < estimatedMenuHeight + 8 && spaceAbove > spaceBelow
            ? "up"
            : "down";

        initializedRef.current = true;
      }

      const actualMenuHeight =
        menuRef.current?.getBoundingClientRect().height ??
        Math.min(240, maxHeight);

      let top =
        directionRef.current === "up"
          ? rect.top - actualMenuHeight - 5
          : rect.bottom + 5;

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
  }, [open, options.length]);

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
    iconMode || selectedOption?.iconType === "category"
      ? getOptionIcon(selectedOption)
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
              <SelectedIcon size={12} strokeWidth={1.9} />
            </span>
          ) : null}

          <span className="truncate">
            <span className="sm:hidden">
              {selectedOption?.shortLabel ??
                selectedOption?.label ??
                mobileLabel}
            </span>

            <span className="hidden truncate sm:block">
              {selectedOption?.label ?? mobileLabel}
            </span>
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
                  iconMode || option.iconType === "category"
                    ? getOptionIcon(option)
                    : null;

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
                          <OptionIcon size={13} strokeWidth={1.9} />
                        </span>
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

export default function ToolDialog({
  mode,
  form,
  categories,
  saving,
  onChange,
  onClose,
  onSave,
}: ToolDialogProps) {
  const safeIcon = CATEGORY_ICONS.includes(
    form.icon as (typeof CATEGORY_ICONS)[number],
  )
    ? form.icon
    : "wrench";

  const PreviewIcon = useMemo(() => getToolIcon(safeIcon), [safeIcon]);

  const canSave =
    form.name.trim().length > 0 &&
    form.slug.trim().length > 0 &&
    form.description.trim().length > 0 &&
    form.icon.trim().length > 0 &&
    Number(form.category_id) > 0;

  const iconOptions: FilterOption[] = CATEGORY_ICONS.map((icon) => ({
    value: icon,
    label: formatIconLabel(icon),
    shortLabel: formatIconLabel(icon),
    icon,
    iconType: "tool",
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-3">
      <div className="flex max-h-[calc(100dvh-0.75rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-2xl sm:max-h-[calc(100dvh-1.5rem)] sm:rounded-2xl">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-xeoo-border px-3 py-2.5 sm:px-4 sm:py-3">
          <h2 className="truncate text-[13px] font-extrabold text-xeoo-text sm:text-sm">
            {mode === "edit" ? "Edit Tool" : "Add Tool"}
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
            <div className="grid gap-2.5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="tool-name"
                  className="mb-1 block text-[9px] font-bold text-xeoo-text sm:text-[10px]"
                >
                  Tool Name
                </label>

                <input
                  id="tool-name"
                  type="text"
                  value={form.name}
                  onChange={(event) => {
                    const value = event.target.value;

                    onChange({
                      name: value,
                      slug: normalizeSlug(value),
                    });
                  }}
                  placeholder="e.g. Calculator"
                  className={fieldClassName()}
                  autoFocus
                  disabled={saving}
                />
              </div>

              <div>
                <label
                  htmlFor="tool-slug"
                  className="mb-1 block text-[9px] font-bold text-xeoo-text sm:text-[10px]"
                >
                  Slug
                </label>

                <input
                  id="tool-slug"
                  type="text"
                  value={form.slug}
                  readOnly
                  disabled
                  placeholder="calculator"
                  className={`${fieldClassName()} cursor-not-allowed bg-xeoo-surface-soft font-mono text-xeoo-muted`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="tool-description"
                className="mb-1 block text-[9px] font-bold text-xeoo-text sm:text-[10px]"
              >
                Description
              </label>

              <textarea
                id="tool-description"
                value={form.description}
                onChange={(event) =>
                  onChange({
                    description: event.target.value,
                  })
                }
                placeholder="Brief tool description..."
                rows={2}
                disabled={saving}
                className={textareaClassName()}
              />
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="tool-category"
                  className="mb-1 block text-[9px] font-bold text-xeoo-text sm:text-[10px]"
                >
                  Category
                </label>

                <CompactFilterSelect
                  value={String(form.category_id)}
                  onChange={(value) =>
                    onChange({
                      category_id: Number(value),
                    })
                  }
                  mobileLabel="Category"
                  ariaLabel="Select Category"
                  options={[
                    {
                      value: "0",
                      label: "Select Category",
                      shortLabel: "Category",
                    },
                    ...categories.map((category) => ({
                      value: String(category.id),
                      label: category.name,
                      shortLabel: category.name.replace(/\s+Tools$/i, ""),
                      icon: category.icon,
                      iconType: "category" as const,
                    })),
                  ]}
                />
              </div>

              <div>
                <label
                  htmlFor="tool-status"
                  className="mb-1 block text-[9px] font-bold text-xeoo-text sm:text-[10px]"
                >
                  Status
                </label>

                <CompactFilterSelect
                  value={form.status}
                  onChange={(value) =>
                    onChange({
                      status: value as ToolStatus,
                    })
                  }
                  mobileLabel="Status"
                  ariaLabel="Select status"
                  options={STATUS_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                    shortLabel: option.label,
                  }))}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="tool-icon"
                className="mb-1 block text-[9px] font-bold text-xeoo-text sm:text-[10px]"
              >
                Icon
              </label>

              <CompactFilterSelect
                value={safeIcon}
                onChange={(value) =>
                  onChange({
                    icon: value,
                  })
                }
                mobileLabel="Icon"
                ariaLabel="Select tool icon"
                options={iconOptions}
                iconMode
              />
            </div>

            <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft/70 p-2.5 sm:rounded-xl sm:p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-text sm:h-8 sm:w-8">
                  <PreviewIcon size={13} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="min-w-0 truncate text-[10px] font-extrabold text-xeoo-text sm:text-[11px]">
                      {form.name || "Tool Name"}
                    </span>

                    <span className="max-w-28 truncate rounded bg-xeoo-surface px-1.5 py-0.5 font-mono text-[7px] font-bold text-xeoo-muted sm:max-w-none sm:text-[8px]">
                      {form.slug || "slug"}
                    </span>
                  </div>

                  <p className="mt-0.5 line-clamp-1 text-[8px] leading-4 text-xeoo-muted sm:line-clamp-2 sm:text-[9px]">
                    {form.description || "Tool description will appear here."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-1.5 border-t border-xeoo-border bg-xeoo-surface-soft px-3 py-2.5 sm:gap-2 sm:px-4 sm:py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 text-[9px] font-bold text-xeoo-text-soft transition hover:bg-xeoo-surface-soft disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-[10px]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving || !canSave}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-xeoo-primary px-2.5 text-[9px] font-bold text-white transition hover:bg-xeoo-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-[10px]"
          >
            {saving ? (
              <LoaderCircle size={10} className="animate-spin" />
            ) : (
              <Check size={10} />
            )}

            {mode === "edit" ? "Save Changes" : "Add Tool"}
          </button>
        </div>
      </div>
    </div>
  );
}
