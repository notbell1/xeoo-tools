import {
  Bug,
  Check,
  CheckCircle2,
  ChevronDown,
  Flag,
  Layout,
  LoaderCircle,
  Send,
  ShieldAlert,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { BACKEND_URL } from "../config/backend";

import type { AdminTool, ReportType, ToolsResponse } from "../types/admin";

type ReportForm = {
  type: ReportType | "";
  toolId: string;
  message: string;
};

type ReportTypeOption = {
  value: ReportType;
  label: string;
  icon: typeof Bug;
};

const REPORT_TYPES: ReportTypeOption[] = [
  {
    value: "bug",
    label: "Bug / Error",
    icon: Bug,
  },
  {
    value: "tool",
    label: "Tool Problem",
    icon: Wrench,
  },
  {
    value: "ui",
    label: "UI / Design",
    icon: Layout,
  },
  {
    value: "other",
    label: "Other",
    icon: Flag,
  },
];

const INITIAL_FORM: ReportForm = {
  type: "",
  toolId: "",
  message: "",
};

const SUSPICIOUS_PATTERNS: RegExp[] = [
  /<\s*script\b/i,
  /<\s*\/\s*script\s*>/i,
  /<\s*(iframe|object|embed|svg|img|style|link|meta|form|input)\b/i,
  /\bon[a-z]+\s*=/i,
  /\bjavascript\s*:/i,
  /\bvbscript\s*:/i,
  /\bdata\s*:\s*text\/html/i,
  /\bdata\s*:\s*text\/javascript/i,
  /document\s*\.\s*(cookie|location|write)/i,
  /window\s*\.\s*(location|open|eval)/i,
  /<\s*\/?\s*[a-z][^>]*>/i,
];

const SECURITY_FALLBACKS = [
  "Relax, boss. This is a report form, not a JavaScript terminal.",
  "Nice try 😌. The payload was rejected. This form only accepts reports, not executable surprises.",
  "XeooTools accepts bug reports, not script injections. Please submit the issue as plain text.",
  "That was a close call. But this report column doesn't accept JavaScript drama.",
  "The browser remains secure. Suspicious payload rejected. Please return with a human-readable report.",
  "The script might be clever, but it doesn't belong in this report column.",
];

function randomSecurityFallback() {
  return SECURITY_FALLBACKS[
    Math.floor(Math.random() * SECURITY_FALLBACKS.length)
  ];
}

function normalizeInput(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
}

function decodeEntities(value: string) {
  return value
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&amp;/gi, "&");
}

function containsSuspiciousInput(value: string) {
  const normalized = normalizeInput(value);
  const decoded = decodeEntities(normalized);

  return SUSPICIOUS_PATTERNS.some(
    (pattern) => pattern.test(normalized) || pattern.test(decoded),
  );
}

function cleanField(value: string, maxLength: number) {
  return normalizeInput(value).slice(0, maxLength);
}

function getReportType(value: ReportType | "") {
  return REPORT_TYPES.find((item) => item.value === value) ?? null;
}

function ToolSelect({
  value,
  tools,
  loading,
  disabled,
  onChange,
}: {
  value: string;
  tools: AdminTool[];
  loading: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const readyTools = useMemo(
    () => tools.filter((tool) => tool.status === "ready"),
    [tools],
  );

  const selectedTool = useMemo(
    () => readyTools.find((tool) => String(tool.id) === value) ?? null,
    [readyTools, value],
  );

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          "flex min-h-10 w-full items-center justify-between gap-2 rounded-lg border bg-xeoo-bg px-2.5 text-left outline-none transition",
          open
            ? "border-xeoo-primary bg-xeoo-surface"
            : "border-xeoo-border hover:bg-xeoo-surface-soft",
          disabled ? "cursor-not-allowed opacity-60" : "",
        ].join(" ")}
      >
        <span className="min-w-0">
          <span className="block truncate text-[11px] font-bold text-xeoo-text">
            {loading
              ? "Memuat tools..."
              : selectedTool
                ? selectedTool.name
                : readyTools.length === 0
                  ? "No tools are ready"
                  : "Select tools"}
          </span>

          {selectedTool ? (
            <span className="mt-0.5 block truncate text-[10px] text-xeoo-muted">
              Ready
            </span>
          ) : null}
        </span>

        <ChevronDown
          size={13}
          className={[
            "shrink-0 text-xeoo-muted transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && !disabled ? (
        <div className="absolute left-0 right-0 top-full z-40 mt-1.5 overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface p-1 shadow-xl">
          <div
            className="max-h-60 overflow-y-auto"
            role="listbox"
            aria-label="Daftar tools ready"
          >
            {readyTools.length === 0 ? (
              <div className="px-3 py-3 text-[10px] text-xeoo-muted">
                Tidak ada tool ready tersedia.
              </div>
            ) : (
              readyTools.map((tool) => {
                const active = String(tool.id) === value;

                return (
                  <button
                    key={tool.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(String(tool.id));
                      setOpen(false);
                    }}
                    className={[
                      "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition",
                      active
                        ? "bg-xeoo-black text-white"
                        : "hover:bg-xeoo-surface-soft",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                        active
                          ? "border-xeoo-surface/15 bg-xeoo-surface/10"
                          : "border-xeoo-border bg-xeoo-bg",
                      ].join(" ")}
                    >
                      {active ? <Check size={10} /> : <Wrench size={10} />}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={[
                          "block truncate text-[10px] font-bold sm:text-[11px]",
                          active ? "text-white" : "text-xeoo-text",
                        ].join(" ")}
                      >
                        {tool.name}
                      </span>

                      <span
                        className={[
                          "mt-0.5 block truncate text-[10px]",
                          active ? "text-white/65" : "text-xeoo-muted",
                        ].join(" ")}
                      >
                        Ready
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ConfirmModal({
  form,
  tool,
  submitting,
  onCancel,
  onConfirm,
}: {
  form: ReportForm;
  tool: AdminTool | null;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const type = getReportType(form.type);

  return (
    <div
      className="fixed inset-0 z-90 flex items-center justify-center bg-black/40 p-3 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Konfirmasi pengiriman report"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-xeoo-border bg-xeoo-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-xeoo-border px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-xeoo-black text-white">
              <Send size={13} />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-xs font-extrabold text-xeoo-text">
                Report Confirmation
              </h2>

              <p className="text-[10px] text-xeoo-muted">
                Ensure the data is correct.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text disabled:opacity-40"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-2.5 p-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-xeoo-border bg-xeoo-bg px-3 py-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-xeoo-muted">
                Tipe
              </p>

              <p className="mt-1 text-[10px] font-bold text-xeoo-text">
                {type?.label ?? "-"}
              </p>
            </div>

            <div className="rounded-lg border border-xeoo-border bg-xeoo-bg px-3 py-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-xeoo-muted">
                Tool
              </p>

              <p className="mt-1 truncate text-[10px] font-bold text-xeoo-text">
                {tool?.name ?? "-"}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-xeoo-border bg-xeoo-bg p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-xeoo-muted">
              Description
            </p>

            <div className="mt-1.5 max-h-40 overflow-y-auto whitespace-pre-wrap wrap-break-word text-[10px] leading-4.5 text-xeoo-text sm:text-[10px] sm:leading-5">
              {form.message}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-xeoo-border pt-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="h-9 rounded-lg border border-xeoo-border px-3 text-[10px] font-bold text-xeoo-text-soft transition hover:bg-xeoo-surface-soft disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-xeoo-black px-3.5 text-[10px] font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={12} className="animate-spin" />
                  Send...
                </>
              ) : (
                <>
                  <Check size={12} />
                  Yes, Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityModal({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/45 p-3 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Input ditolak"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-xeoo-warning/40 shadow-2xl">
        <div className="flex items-center justify-between border-b border-xeoo-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-xeoo-warning-soft text-xeoo-warning">
              <ShieldAlert size={14} />
            </div>

            <div>
              <h2 className="text-xs font-extrabold text-xeoo-text sm:text-sm">
                Nice Try
              </h2>

              <p className="text-[10px] text-xeoo-muted">Input not accepted.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-4">
          <div className="rounded-xl border border-xeoo-warning/40 bg-xeoo-warning-soft px-3 py-3 text-[10px] leading-5 text-xeoo-warning">
            {message}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-3 h-9 w-full rounded-lg bg-xeoo-black text-[10px] font-bold text-white transition hover:opacity-90"
          >
            Oke
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Report() {
  const [form, setForm] = useState<ReportForm>(INITIAL_FORM);

  const [tools, setTools] = useState<AdminTool[]>([]);

  const [loadingTools, setLoadingTools] = useState(true);

  const [toolsError, setToolsError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [securityMessage, setSecurityMessage] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);

  const readyTools = useMemo(
    () => tools.filter((tool) => tool.status === "ready"),
    [tools],
  );

  const selectedType = useMemo(() => getReportType(form.type), [form.type]);

  const selectedTool = useMemo(
    () => readyTools.find((tool) => String(tool.id) === form.toolId) ?? null,
    [readyTools, form.toolId],
  );

  const updateField = <K extends keyof ReportForm>(
    field: K,
    value: ReportForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrorMessage("");
    setSecurityMessage("");
  };

  useEffect(() => {
    let mounted = true;

    const loadTools = async () => {
      setLoadingTools(true);
      setToolsError("");

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/tools.php?_=${Date.now()}`,
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

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const result: ToolsResponse = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Failed to retrieve the list of tools.",
          );
        }

        if (!mounted) {
          return;
        }

        const normalizedTools = (result.data ?? [])
          .filter((tool) => Number.isInteger(Number(tool.id)))
          .map(
            (tool): AdminTool => ({
              ...tool,
              id: Number(tool.id),
              status:
                tool.status === "maintenance"
                  ? "maintenance"
                  : tool.status === "upcoming"
                    ? "upcoming"
                    : "ready",
              icon: typeof tool.icon === "string" ? tool.icon : "wrench",
              category_name: tool.category_name || "Uncategorized",
              category_slug: tool.category_slug || "uncategorized",
            }),
          );

        setTools(normalizedTools);
      } catch (error) {
        console.error("Load report tools error:", error);

        if (!mounted) {
          return;
        }

        setToolsError(
          error instanceof Error
            ? error.message
            : "Daftar tools tidak dapat dimuat.",
        );
      } finally {
        if (mounted) {
          setLoadingTools(false);
        }
      }
    };

    void loadTools();

    return () => {
      mounted = false;
    };
  }, []);

  const validate = () => {
    setErrorMessage("");
    setSecurityMessage("");

    const type = form.type;
    const toolId = Number(form.toolId);

    const message = cleanField(form.message.trim(), 4000);

    if (!type) {
      setErrorMessage("Select the report type first.");
      return null;
    }

    if (!Number.isInteger(toolId) || toolId <= 0) {
      setErrorMessage("Select the tool you want to report.");
      return null;
    }

    if (message.length < 10) {
      setErrorMessage(
        "The report description must be at least 10 characters long.",
      );
      return null;
    }

    if (containsSuspiciousInput(message)) {
      setSecurityMessage(randomSecurityFallback());
      return null;
    }

    const toolExists = readyTools.some((tool) => tool.id === toolId);

    if (!toolExists) {
      setErrorMessage(
        "The selected tool is no longer available or is currently not ready. Reload the page and try again.",
      );
      return null;
    }

    return {
      type,
      toolId,
      message,
    };
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const validated = validate();

    if (!validated) {
      return;
    }

    setForm((current) => ({
      ...current,
      type: validated.type,
      toolId: String(validated.toolId),
      message: validated.message,
    }));

    setConfirmOpen(true);
  };

  const sendReport = async () => {
    if (submitting) {
      return;
    }

    const validated = validate();

    if (!validated) {
      setConfirmOpen(false);
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSecurityMessage("");

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
          type: validated.type,
          tool_id: validated.toolId,
          message: validated.message,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        if (result?.suspicious) {
          setSecurityMessage(result?.message || randomSecurityFallback());
        } else {
          setErrorMessage(
            result?.message || "Report failed to send. Please try again.",
          );
        }

        return;
      }

      setSubmitted(true);
      setForm(INITIAL_FORM);
      setConfirmOpen(false);
    } catch (error) {
      console.error("Report submit error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The server cannot be reached. Please try again in a moment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-xeoo-bg text-xeoo-text">
      <Header />

      <main className="flex-1 px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
        <div className="mx-auto w-full max-w-4xl">
          <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-sm">
            <div className="border-b border-xeoo-border px-3 py-3 sm:px-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-xeoo-danger-soft text-xeoo-danger">
                  <Flag size={14} />
                </div>

                <div className="min-w-0">
                  <h1 className="text-sm font-extrabold tracking-tight sm:text-base">
                    Report an Issue
                  </h1>

                  <p className="mt-0.5 text-[10px] text-xeoo-muted sm:text-[10px]">
                    Report bugs, tool issues, or display problems.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              {submitted ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />

                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-emerald-800">
                        The report has been successfully sent.
                      </p>

                      <p className="mt-0.5 text-[10px] leading-4 text-emerald-700/80">
                        The report has been submitted to the system and will be
                        reviewed by the admin.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setSubmitted(false);
                          setErrorMessage("");
                          setSecurityMessage("");
                        }}
                        className="mt-2.5 inline-flex h-8 items-center justify-center rounded-lg border border-emerald-200 bg-white px-3 text-[10px] font-bold text-emerald-800 transition hover:bg-emerald-50"
                      >
                        Send another report
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-3">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-xeoo-muted">
                        Tipe Report
                      </label>

                      {selectedType ? (
                        <span className="text-[10px] font-bold text-xeoo-primary">
                          {selectedType.label}
                        </span>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {REPORT_TYPES.map((item) => {
                        const Icon = item.icon;

                        const active = form.type === item.value;

                        return (
                          <label
                            key={item.value}
                            className={[
                              "flex min-w-0 cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 transition",
                              active
                                ? "border-xeoo-primary bg-xeoo-primary-soft"
                                : "border-xeoo-border bg-xeoo-bg hover:bg-xeoo-surface-soft",
                            ].join(" ")}
                          >
                            <input
                              type="radio"
                              name="report-type"
                              value={item.value}
                              checked={active}
                              onChange={() => updateField("type", item.value)}
                              className="sr-only"
                            />

                            <div
                              className={[
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                                active
                                  ? "bg-xeoo-primary text-white"
                                  : "bg-xeoo-surface-soft text-xeoo-muted",
                              ].join(" ")}
                            >
                              <Icon size={14} />
                            </div>

                            <span className="min-w-0 truncate text-[10px] font-bold text-xeoo-text sm:text-[11px]">
                              {item.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wide text-xeoo-muted">
                      Tool
                    </label>

                    <ToolSelect
                      value={form.toolId}
                      tools={tools}
                      loading={loadingTools}
                      disabled={
                        loadingTools || submitting || readyTools.length === 0
                      }
                      onChange={(value) => updateField("toolId", value)}
                    />

                    {toolsError ? (
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <p className="wrap-break-word text-[10px] leading-4 text-xeoo-danger">
                          {toolsError}
                        </p>

                        <button
                          type="button"
                          onClick={() => window.location.reload()}
                          className="shrink-0 text-[10px] font-bold text-xeoo-primary underline underline-offset-2"
                        >
                          Muat ulang
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <label
                        htmlFor="report-message"
                        className="text-[10px] font-extrabold uppercase tracking-wide text-xeoo-muted"
                      >
                        Description
                      </label>

                      <span className="text-[10px] text-xeoo-muted">
                        {form.message.length}/4000
                      </span>
                    </div>

                    <textarea
                      id="report-message"
                      name="message"
                      rows={7}
                      maxLength={4000}
                      value={form.message}
                      autoComplete="off"
                      disabled={submitting}
                      placeholder="Explain the problem that occurred..."
                      onChange={(event) =>
                        updateField(
                          "message",
                          cleanField(event.target.value, 4000),
                        )
                      }
                      className="block min-h-36 w-full resize-y rounded-xl border border-xeoo-border bg-xeoo-bg px-3 py-2.5 text-[10px] leading-4.5 text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:bg-xeoo-surface disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-40 sm:text-[11px]"
                    />
                  </div>

                  {errorMessage ? (
                    <div
                      role="alert"
                      className="rounded-lg border border-xeoo-danger/40 bg-xeoo-danger-soft px-3 py-2 text-[10px] font-semibold leading-4 text-xeoo-danger"
                    >
                      {errorMessage}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-2.5 border-t border-xeoo-border pt-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-2"></div>

                    <button
                      type="submit"
                      disabled={
                        submitting ||
                        loadingTools ||
                        readyTools.length === 0 ||
                        !form.type ||
                        !form.toolId ||
                        !form.message.trim()
                      }
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-xeoo-black px-3.5 text-[10px] font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:text-[11px]"
                    >
                      {submitting ? (
                        <>
                          <LoaderCircle size={12} className="animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send size={12} />
                          Send Report
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {confirmOpen ? (
        <ConfirmModal
          form={form}
          tool={selectedTool}
          submitting={submitting}
          onCancel={() => {
            if (!submitting) {
              setConfirmOpen(false);
            }
          }}
          onConfirm={() => void sendReport()}
        />
      ) : null}

      {securityMessage ? (
        <SecurityModal
          message={securityMessage}
          onClose={() => setSecurityMessage("")}
        />
      ) : null}
    </div>
  );
}
