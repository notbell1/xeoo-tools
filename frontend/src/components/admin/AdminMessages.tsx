import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderCircle,
  Mail,
  MessageCircle,
  Reply,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { showConfirm, showError, showSuccess } from "../../alert";
import { BACKEND_URL } from "../../config/backend";

import type {
  AdminMessage,
  ContactStatus,
  ContactType,
  MessagesResponse,
} from "../../types/admin";

const PER_PAGE = 5;

const TYPE_OPTIONS: Array<{
  value: "" | ContactType;
  label: string;
  shortLabel?: string;
}> = [
  {
    value: "",
    label: "All Requirements",
    shortLabel: "Requirements",
  },
  {
    value: "tool_suggestion",
    label: "Tools",
    shortLabel: "Tools",
  },
  {
    value: "partnership",
    label: "Partnerships",
    shortLabel: "Partnerships",
  },
  {
    value: "faq",
    label: "FAQ",
    shortLabel: "FAQ",
  },
  {
    value: "feedback",
    label: "Feedback",
    shortLabel: "Feedback",
  },
  {
    value: "criticism_suggestion",
    label: "Suggestion",
    shortLabel: "Suggestion",
  },
];

const STATUS_OPTIONS: Array<{
  value: "" | ContactStatus;
  label: string;
  shortLabel?: string;
}> = [
  {
    value: "",
    label: "All Status",
    shortLabel: "Status",
  },
  {
    value: "unread",
    label: "Unread",
    shortLabel: "Unread",
  },
  {
    value: "read",
    label: "Read",
    shortLabel: "Read",
  },
  {
    value: "replied",
    label: "Replied",
    shortLabel: "Replied",
  },
];

const TYPE_LABELS: Record<ContactType, string> = {
  tool_suggestion: "Tools",
  partnership: "Partnerships",
  faq: "FAQ",
  feedback: "Feedback",
  criticism_suggestion: "Suggestion",
};

const STATUS_META: Record<
  ContactStatus,
  {
    label: string;
    className: string;
  }
> = {
  unread: {
    label: "Unread",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  read: {
    label: "Read",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },
  replied: {
    label: "Replied",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

type FilterOption = {
  value: string;
  label: string;
  shortLabel?: string;
};

function formatDate(value: string) {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");

  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(normalized);

  const date = new Date(hasTimezone ? normalized : `${normalized}+07:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value: string) {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");

  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(normalized);

  const date = new Date(hasTimezone ? normalized : `${normalized}+07:00`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function buildPagination(current: number, total: number) {
  if (total <= 1) {
    return [1];
  }

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, -1, total];
  }

  if (current >= total - 3) {
    return [1, -1, total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, -1, current - 1, current, current + 1, -1, total];
}

function truncateMessage(value: string, maxLength = 110) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}...`;
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

export default function AdminMessages() {
  const [messages, setMessages] = useState<AdminMessage[]>([]);

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState<"" | ContactType>("");

  const [statusFilter, setStatusFilter] = useState<"" | ContactStatus>("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(
    null,
  );

  const initialLoadRef = useRef(false);

  const loadMessages = useCallback(
    async (showSpinner = true) => {
      if (showSpinner) {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams();

        params.set("page", String(page));

        params.set("per_page", String(PER_PAGE));

        if (search.trim()) {
          params.set("search", search.trim().slice(0, 100));
        }

        if (typeFilter) {
          params.set("type", typeFilter);
        }

        if (statusFilter) {
          params.set("status", statusFilter);
        }

        params.set("_", String(Date.now()));

        const response = await fetch(
          `${BACKEND_URL}/api/contact.php?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (response.status === 401) {
          throw new Error("The admin session has ended.");
        }

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const result: MessagesResponse = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to retrieve the message.");
        }

        setMessages(result.data?.messages ?? []);

        setPage(result.data?.pagination.page ?? 1);

        setTotalPages(result.data?.pagination.total_pages ?? 1);

        setTotal(result.data?.pagination.total ?? 0);
      } catch (error) {
        console.error("Load messages error:", error);

        await showError(
          "Failed to load messages",
          error instanceof Error
            ? error.message
            : "The message could not be retrieved.",
        );
      } finally {
        if (showSpinner) {
          setLoading(false);
        }
      }
    },
    [page, search, typeFilter, statusFilter],
  );

  useEffect(() => {
    const firstLoad = !initialLoadRef.current;

    initialLoadRef.current = true;

    void loadMessages(firstLoad);
  }, [loadMessages]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const value = searchInput.trim().slice(0, 100);

      setPage(1);
      setSearch(value);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (!selectedMessage) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedMessage(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedMessage]);

  const paginationItems = useMemo(
    () => buildPagination(page, totalPages),
    [page, totalPages],
  );

  const isFiltered =
    search.trim() !== "" || typeFilter !== "" || statusFilter !== "";

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setTypeFilter("");
    setStatusFilter("");
    setPage(1);
  };

  const updateStatus = async (
    message: AdminMessage,
    nextStatus: ContactStatus,
  ) => {
    if (updatingId !== null || message.status === nextStatus) {
      return;
    }

    const nextLabel = STATUS_META[nextStatus].label;

    const confirmed = await showConfirm(
      `Change status #${message.id}?`,
      `The message will be changed to ${nextLabel}.`,
    );

    if (!confirmed) {
      return;
    }

    setUpdatingId(message.id);

    try {
      const body = new URLSearchParams();

      body.append("action", "update_status");

      body.append("id", String(message.id));

      body.append("status", nextStatus);

      const response = await fetch(`${BACKEND_URL}/api/contact.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          Accept: "application/json",
        },
        body,
      });

      if (response.status === 401) {
        throw new Error("Admin session has expired.");
      }

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "The status cannot be updated.");
      }

      const updated = result.data as AdminMessage | undefined;

      if (updated) {
        setMessages((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );

        setSelectedMessage((current) =>
          current?.id === updated.id ? updated : current,
        );
      }

      await loadMessages(false);

      await showSuccess(
        "Status updated",
        `Message #${message.id} now ${nextLabel}.`,
      );
    } catch (error) {
      console.error("Error updating message status:", error);

      await showError(
        "Status failed to update",
        error instanceof Error
          ? error.message
          : "The message status cannot be updated.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const firstItem = total > 0 ? (page - 1) * PER_PAGE + 1 : 0;

  const lastItem = Math.min(page * PER_PAGE, total);

  return (
    <div>
      <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-sm">
        <div className="border-b border-xeoo-border p-2.5 sm:p-3">
          <div className="grid grid-cols-[minmax(0,1fr)_82px_78px_30px] gap-1.5 md:grid-cols-[minmax(0,1fr)_170px_150px_auto] lg:grid-cols-[minmax(0,1fr)_180px_160px_auto]">
            <div className="relative min-w-0">
              <Search
                size={12}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xeoo-muted sm:left-3"
              />

              <input
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value.slice(0, 100))
                }
                placeholder="Search for a name, email, or message..."
                className="h-8 w-full rounded-lg border border-xeoo-border bg-xeoo-bg pl-7 pr-2 text-[9px] text-xeoo-text outline-none placeholder:text-xeoo-muted focus:border-xeoo-primary focus:bg-xeoo-surface sm:h-9 sm:pl-8 sm:pr-3 sm:text-[11px]"
              />
            </div>

            <CompactFilterSelect
              value={typeFilter}
              onChange={(value) => {
                setTypeFilter(value as "" | ContactType);
                setPage(1);
              }}
              mobileLabel="Requirements"
              ariaLabel="Filter message requirements"
              options={TYPE_OPTIONS}
            />

            <CompactFilterSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value as "" | ContactStatus);
                setPage(1);
              }}
              mobileLabel="Status"
              ariaLabel="Message status filter"
              options={STATUS_OPTIONS}
            />
          </div>
        </div>

        {loading && messages.length === 0 ? (
          <div className="flex min-h-60 items-center justify-center">
            <div className="flex items-center gap-2 text-[10px] font-semibold text-xeoo-muted">
              <LoaderCircle size={15} className="animate-spin" />
              Loading messages...
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center px-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-xeoo-surface-soft text-xeoo-muted">
              <Mail size={17} />
            </div>

            <h3 className="mt-3 text-xs font-extrabold text-xeoo-text">
              No messages
            </h3>

            <p className="mt-1 max-w-xs text-[10px] leading-4 text-xeoo-muted">
              No messages match the current filters.
            </p>

            {isFiltered ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-1.5 text-[9px] font-bold text-xeoo-text-soft transition hover:bg-xeoo-surface-soft"
              >
                Reset filter
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="md:hidden">
              <div className="divide-y divide-xeoo-border">
                {messages.map((message) => {
                  const status = STATUS_META[message.status];

                  return (
                    <article key={message.id} className="px-2.5 py-2.5">
                      <div className="flex items-start gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface-soft text-xeoo-muted">
                          <MessageCircle size={13} strokeWidth={1.8} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-extrabold text-xeoo-text">
                                {message.name || "Without a name"}
                              </p>

                              <p className="truncate text-[9px] text-xeoo-muted">
                                {message.email || "Without Email"}
                              </p>
                            </div>

                            <span
                              className={[
                                "shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-bold",
                                status.className,
                              ].join(" ")}
                            >
                              {status.label}
                            </span>
                          </div>

                          <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5">
                            <span className="inline-flex max-w-full rounded-md border border-xeoo-border bg-xeoo-surface-soft px-2 py-0.5 text-[8px] font-bold text-xeoo-text-soft">
                              {TYPE_LABELS[message.type]}
                            </span>

                            <span className="text-[8px] text-xeoo-muted">
                              {formatDate(message.created_at)}
                            </span>

                            <span className="text-[8px] text-xeoo-muted">
                              {formatTime(message.created_at)}
                            </span>
                          </div>
                        </div>

                        <span className="shrink-0 pt-0.5 text-[8px] font-bold text-xeoo-muted">
                          #
                          {(page - 1) * PER_PAGE +
                            messages.indexOf(message) +
                            1}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedMessage(message)}
                        className="mt-2 block w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-2 text-left transition hover:border-xeoo-primary/30 hover:bg-xeoo-primary-soft"
                      >
                        <p className="line-clamp-3 wrap-break-word text-[9px] leading-relaxed text-xeoo-text-soft">
                          {truncateMessage(message.message, 150)}
                        </p>
                      </button>

                      <div className="mt-2 flex items-center justify-end gap-1">
                        <ActionButton
                          label="View"
                          icon={Eye}
                          onClick={() => setSelectedMessage(message)}
                        />

                        {message.status === "unread" ? (
                          <ActionButton
                            label="Mark as read"
                            icon={Check}
                            loading={updatingId === message.id}
                            onClick={() => void updateStatus(message, "read")}
                          />
                        ) : null}

                        {message.status !== "replied" ? (
                          <ActionButton
                            label="Mark replied"
                            icon={Reply}
                            loading={updatingId === message.id}
                            onClick={() =>
                              void updateStatus(message, "replied")
                            }
                          />
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-240 border-collapse">
                <thead>
                  <tr className="border-b border-xeoo-border bg-xeoo-surface-soft/60">
                    <TableHead className="w-12 text-center">No</TableHead>

                    <TableHead className="w-44 text-left">Sender</TableHead>

                    <TableHead className="w-40 text-center">
                      Requirements
                    </TableHead>

                    <TableHead className="text-left">Message</TableHead>

                    <TableHead className="w-28 text-center">Date</TableHead>

                    <TableHead className="w-24 text-center">Status</TableHead>

                    <TableHead className="w-24 text-center">Action</TableHead>
                  </tr>
                </thead>

                <tbody className="text-[12px]">
                  {messages.map((message, index) => {
                    const status = STATUS_META[message.status];

                    const rowNumber = (page - 1) * PER_PAGE + index + 1;

                    return (
                      <tr
                        key={message.id}
                        className={[
                          "border-b border-xeoo-border last:border-b-0",
                          index % 2 === 0
                            ? "bg-xeoo-surface"
                            : "bg-xeoo-surface-soft/45",
                        ].join(" ")}
                      >
                        <TableCell className="text-center">
                          <span className="font-bold text-xeoo-muted">
                            {rowNumber}
                          </span>
                        </TableCell>

                        <TableCell>
                          <p className="truncate font-extrabold text-xeoo-text">
                            {message.name || "Without a name"}
                          </p>

                          <p className="mt-0.5 truncate text-xeoo-muted">
                            {message.email || "Without Email"}
                          </p>
                        </TableCell>

                        <TableCell className="text-center">
                          <span className="inline-flex max-w-full rounded-md border border-xeoo-border bg-xeoo-surface-soft px-2 py-1 font-bold text-xeoo-text-soft">
                            {TYPE_LABELS[message.type]}
                          </span>
                        </TableCell>

                        <TableCell>
                          <button
                            type="button"
                            onClick={() => setSelectedMessage(message)}
                            className="block min-w-0 max-w-full text-left"
                            title={`View message #${message.id}`}
                          >
                            <p
                              className="line-clamp-2 wrap-break-word leading-5 text-xeoo-text-muted"
                              title={message.message}
                            >
                              {truncateMessage(message.message, 110)}
                            </p>
                          </button>
                        </TableCell>

                        <TableCell className="text-center">
                          <p className="font-semibold text-xeoo-text-soft">
                            {formatDate(message.created_at)}
                          </p>

                          <p className="mt-0.5 text-xeoo-muted">
                            {formatTime(message.created_at)}
                          </p>
                        </TableCell>

                        <TableCell className="text-center">
                          <span
                            className={[
                              "inline-flex rounded-full border px-2 py-1 font-bold",
                              status.className,
                            ].join(" ")}
                          >
                            {status.label}
                          </span>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <ActionButton
                              label="View"
                              icon={Eye}
                              onClick={() => setSelectedMessage(message)}
                            />

                            {message.status === "unread" ? (
                              <ActionButton
                                label="Mark as read"
                                icon={Check}
                                loading={updatingId === message.id}
                                onClick={() =>
                                  void updateStatus(message, "read")
                                }
                              />
                            ) : null}

                            {message.status !== "replied" ? (
                              <ActionButton
                                label="Mark replied"
                                icon={Reply}
                                loading={updatingId === message.id}
                                onClick={() =>
                                  void updateStatus(message, "replied")
                                }
                              />
                            ) : null}
                          </div>
                        </TableCell>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 ? (
              <div className="flex flex-col gap-2 border-t border-xeoo-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[9px] text-xeoo-muted">
                  Showing{" "}
                  <span className="font-bold text-xeoo-text">{firstItem}</span>{" "}
                  – <span className="font-bold text-xeoo-text">{lastItem}</span>{" "}
                  of <span className="font-bold text-xeoo-text">{total}</span>
                </p>

                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-xeoo-border text-xeoo-text-soft transition hover:bg-xeoo-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
                    title="Previous page"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={11} />
                  </button>

                  {paginationItems.map((item, index) =>
                    item === -1 ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="flex h-7 min-w-5 items-center justify-center text-[9px] text-xeoo-muted"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setPage(item)}
                        className={[
                          "flex h-7 min-w-7 items-center justify-center rounded-md border px-1.5 text-[9px] font-bold transition",
                          page === item
                            ? "border-xeoo-primary bg-xeoo-primary text-white"
                            : "border-xeoo-border text-xeoo-text-soft hover:bg-xeoo-surface-soft",
                        ].join(" ")}
                        aria-current={page === item ? "page" : undefined}
                      >
                        {item}
                      </button>
                    ),
                  )}

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-xeoo-border text-xeoo-text-soft transition hover:bg-xeoo-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
                    title="Next page"
                    aria-label="Next page"
                  >
                    <ChevronRight size={11} />
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>

      {selectedMessage ? (
        <MessageDetailDialog
          message={selectedMessage}
          updating={updatingId === selectedMessage.id}
          onClose={() => setSelectedMessage(null)}
          onStatusChange={(status) =>
            void updateStatus(selectedMessage, status)
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

function MessageDetailDialog({
  message,
  updating,
  onClose,
  onStatusChange,
}: {
  message: AdminMessage;
  updating: boolean;
  onClose: () => void;
  onStatusChange: (status: ContactStatus) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/35 p-2.5 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Message #${message.id}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[calc(100dvh-1.25rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-2xl sm:max-h-[calc(100dvh-2rem)]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-xeoo-border px-3 py-3 sm:px-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-extrabold text-xeoo-text">
              Message #{message.id}
            </h3>

            <p className="text-[9px] text-xeoo-muted">
              {formatDate(message.created_at)} {formatTime(message.created_at)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
            aria-label="Close"
          >
            <X size={12} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3.5 sm:px-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <MetaItem label="Name" value={message.name || "Without a name"} />

            <MetaItem label="Email" value={message.email || "Without Email"} />

            <MetaItem label="Requirements" value={TYPE_LABELS[message.type]} />

            <MetaItem
              label="Status"
              value={
                <span
                  className={[
                    "inline-flex rounded-full border px-2 py-0.5 text-[8px] font-bold",
                    STATUS_META[message.status].className,
                  ].join(" ")}
                >
                  {STATUS_META[message.status].label}
                </span>
              }
            />
          </div>

          <div className="mt-3">
            <p className="mb-1.5 text-[8px] font-extrabold uppercase tracking-wide text-xeoo-muted sm:text-[9px]">
              Message
            </p>

            <div className="wrap-break-word rounded-lg border border-xeoo-border bg-xeoo-bg px-3 py-3 sm:rounded-xl">
              <p className="whitespace-pre-wrap text-[10px] leading-5 text-xeoo-text sm:text-[11px]">
                {message.message}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-1.5 border-t border-xeoo-border px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface px-3 text-[9px] font-bold text-xeoo-text-soft transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
          >
            Close
          </button>

          <div className="flex flex-col gap-1.5 sm:flex-row">
            {message.status === "unread" ? (
              <button
                type="button"
                disabled={updating}
                onClick={() => onStatusChange("read")}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-xeoo-border px-3 text-[9px] font-bold text-xeoo-text-soft transition hover:bg-xeoo-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
              >
                {updating ? (
                  <LoaderCircle size={11} className="animate-spin" />
                ) : (
                  <Check size={11} />
                )}
                Mark as read
              </button>
            ) : null}

            {message.status !== "replied" ? (
              <button
                type="button"
                disabled={updating}
                onClick={() => onStatusChange("replied")}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-3 text-[9px] font-bold text-white transition hover:bg-xeoo-primary-hover disabled:cursor-not-allowed disabled:opacity-40 shadow-xs"
              >
                {updating ? (
                  <LoaderCircle size={11} className="animate-spin" />
                ) : (
                  <Reply size={11} />
                )}
                Mark as Replied
              </button>
            ) : null}

            {message.status === "replied" ? (
              <button
                type="button"
                disabled={updating}
                onClick={() => onStatusChange("read")}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-xeoo-border px-3 text-[9px] font-bold text-xeoo-text-soft transition hover:bg-xeoo-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
              >
                {updating ? (
                  <LoaderCircle size={11} className="animate-spin" />
                ) : (
                  <RotateCcw size={11} />
                )}
                Mark as read
              </button>
            ) : null}
          </div>
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

      <div className="mt-1 min-w-0 wrap-break-word text-[9px] font-bold text-xeoo-text sm:text-[10px]">
        {value}
      </div>
    </div>
  );
}
