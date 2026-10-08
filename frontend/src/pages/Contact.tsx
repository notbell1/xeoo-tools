import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Mail,
  MessageCircle,
  Send,
  UserRound,
  X,
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { BACKEND_URL } from "../config/backend";

const CONTACT_TYPES = [
  {
    value: "tool_suggestion",
    label: "Tool Suggestion",
    description: "Suggest a new tool for XeooTools.",
    template:
      "Hello XeooTools team,\n\nI would like to suggest a new tool.\n\nTool name:\nPurpose:\nReason:\n\nThank you.",
  },
  {
    value: "partnership",
    label: "Partnership",
    description: "Propose a potential partnership.",
    template:
      "Hello XeooTools team,\n\nI am interested in discussing a potential partnership.\n\nName/Organization:\nPartnership type:\nDetails:\n\nThank you.",
  },
  {
    value: "faq",
    label: "FAQ",
    description: "Ask a question about XeooTools.",
    template:
      "Hello XeooTools team,\n\nI would like to ask about:\n\nQuestion:\n\nThank you.",
  },
  {
    value: "feedback",
    label: "Feedback",
    description: "Share ideas for future improvements.",
    template:
      "Hello XeooTools team,\n\nI would like to share some feedback.\n\nFeedback:\nBenefit:\n\nThank you.",
  },
  {
    value: "criticism_suggestion",
    label: "Criticism & Suggestions",
    description: "Share criticism and suggestions for improvement.",
    template:
      "Hello XeooTools team,\n\nI would like to share some criticism and suggestions.\n\nCriticism:\nSuggested improvement:\n\nThank you.",
  },
] as const;

type ContactType = (typeof CONTACT_TYPES)[number]["value"];

type SubmitState = "idle" | "sending" | "success" | "error";

type FormState = {
  type: ContactType;
  name: string;
  email: string;
  message: string;
};

const INITIAL_FORM: FormState = {
  type: "tool_suggestion",
  name: "",
  email: "",
  message: "",
};

const SECURITY_PATTERNS = [
  /<\s*script\b/i,
  /<\s*\/\s*script\s*>/i,
  /<\s*iframe\b/i,
  /<\s*object\b/i,
  /<\s*embed\b/i,
  /<\s*svg\b/i,
  /<\s*style\b/i,
  /\bon[a-z]+\s*=/i,
  /\bjavascript\s*:/i,
  /\bvbscript\s*:/i,
  /document\s*\.\s*cookie/i,
  /\blocalStorage\b/i,
  /\bsessionStorage\b/i,
  /\beval\s*\(/i,
  /\bnew\s+Function\s*\(/i,
  /\bwindow\s*\.\s*(open|eval|location)/i,
];

const SECURITY_FALLBACKS = [
  "Nice try. This is a contact form, not a JavaScript terminal.",
  "Nice try. The payload was rejected. Please send a normal message instead.",
  "XeooTools accepts messages, not executable surprises.",
  "Scripts may be clever, but this is not the place for them.",
  "Your input was rejected for security reasons. Please try again with a normal message.",
  "Almost. This form does not accept JavaScript drama.",
];

function getContactType(value: ContactType) {
  return CONTACT_TYPES.find((item) => item.value === value) ?? CONTACT_TYPES[0];
}

function randomSecurityFallback() {
  return SECURITY_FALLBACKS[
    Math.floor(Math.random() * SECURITY_FALLBACKS.length)
  ];
}

function cleanText(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

function containsSecurityPattern(value: string) {
  return SECURITY_PATTERNS.some((pattern) => pattern.test(value));
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function ContactSelect({
  value,
  onChange,
  disabled,
}: {
  value: ContactType;
  onChange: (value: ContactType) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const selected = getContactType(value);

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
          <span className="block truncate text-[12px] font-bold text-xeoo-text">
            {selected.label}
          </span>

          <span className="mt-0.5 block truncate text-[10px] text-xeoo-muted">
            {selected.description}
          </span>
        </span>

        <ChevronDown
          size={13}
          className={[
            "shrink-0 text-xeoo-muted transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1.5 rounded-xl border border-xeoo-border bg-xeoo-surface p-1 shadow-xl">
          <div className="max-h-56 overflow-y-auto">
            {CONTACT_TYPES.map((item) => {
              const active = item.value === value;

              return (
                <button
                  key={item.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  className={[
                    "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition",
                    active
                      ? "bg-xeoo-black text-white"
                      : "hover:bg-xeoo-surface-soft",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                      active
                        ? "border-xeoo-surface/15 bg-xeoo-surface/10"
                        : "border-xeoo-border bg-xeoo-bg",
                    ].join(" ")}
                  >
                    {active ? <Check size={10} /> : <MessageCircle size={10} />}
                  </span>

                  <span className="min-w-0">
                    <span
                      className={[
                        "block truncate text-[10px] font-bold sm:text-[11px]",
                        active ? "text-white" : "text-xeoo-text",
                      ].join(" ")}
                    >
                      {item.label}
                    </span>

                    <span
                      className={[
                        "mt-0.5 block truncate text-[10px]",
                        active ? "text-white/65" : "text-xeoo-muted",
                      ].join(" ")}
                    >
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ConfirmModal({
  form,
  onCancel,
  onConfirm,
  submitting,
}: {
  form: FormState;
  onCancel: () => void;
  onConfirm: () => void;
  submitting: boolean;
}) {
  const type = getContactType(form.type);

  return (
    <div
      className="fixed inset-0 z-90 flex items-center justify-center bg-black/40 p-3 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Send confirmation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
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
                Confirm Submission
              </h2>

              <p className="text-[10px] text-xeoo-muted">
                Make sure your information is correct.
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
                Purpose
              </p>

              <p className="mt-1 text-[10px] font-bold text-xeoo-text">
                {type.label}
              </p>
            </div>

            <div className="rounded-lg border border-xeoo-border bg-xeoo-bg px-3 py-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-xeoo-muted">
                Sender
              </p>

              <p className="mt-1 truncate text-[10px] font-bold text-xeoo-text">
                {form.name}
              </p>

              <p className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                {form.email}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-xeoo-border bg-xeoo-bg p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-xeoo-muted">
              Message
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
              <Check size={12} />

              {submitting ? "Sending..." : "Yes, Send"}
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
      aria-label="Input rejected"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-xeoo-warning/40 bg-xeoo-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-xeoo-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-xeoo-warning-soft text-xeoo-warning">
              <AlertTriangle size={14} />
            </div>

            <div>
              <h2 className="text-xs font-extrabold text-xeoo-text sm:text-sm">
                Nice Try
              </h2>

              <p className="text-[10px] text-xeoo-muted">Input was rejected.</p>
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
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const [templateValue, setTemplateValue] = useState<string>(
    CONTACT_TYPES[0].template,
  );

  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const [errorMessage, setErrorMessage] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [securityMessage, setSecurityMessage] = useState("");

  const activeMeta = useMemo(() => getContactType(form.type), [form.type]);

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSubmitState("idle");
    setErrorMessage("");
    setSecurityMessage("");
  };

  const handleTypeChange = (type: ContactType) => {
    const meta = getContactType(type);

    const shouldReplace =
      !form.message.trim() || form.message.trim() === templateValue.trim();

    setForm((current) => ({
      ...current,
      type,
      message: shouldReplace ? meta.template : current.message,
    }));

    setTemplateValue(meta.template);
    setSubmitState("idle");
    setErrorMessage("");
    setSecurityMessage("");
  };

  const applyTemplate = () => {
    setForm((current) => ({
      ...current,
      message: activeMeta.template,
    }));

    setTemplateValue(activeMeta.template);

    setSubmitState("idle");
    setErrorMessage("");
  };

  const validate = () => {
    const name = cleanText(form.name);
    const email = cleanText(form.email);
    const message = cleanText(form.message);

    const combined = [name, email, message].join("\n");

    if (containsSecurityPattern(combined)) {
      setSecurityMessage(randomSecurityFallback());

      return null;
    }

    if (!name) {
      setErrorMessage("Name is required.");
      setSubmitState("error");
      return null;
    }

    if (name.length > 100) {
      setErrorMessage("Name is too long.");
      setSubmitState("error");
      return null;
    }

    if (!email) {
      setErrorMessage("Email is required.");
      setSubmitState("error");
      return null;
    }

    if (!isValidEmail(email)) {
      setErrorMessage("Invalid email format.");
      setSubmitState("error");
      return null;
    }

    if (email.length > 190) {
      setErrorMessage("Email is too long.");
      setSubmitState("error");
      return null;
    }

    if (!message) {
      setErrorMessage("Message cannot be empty.");
      setSubmitState("error");
      return null;
    }

    if (message.length < 5) {
      setErrorMessage("Message is too short.");
      setSubmitState("error");
      return null;
    }

    if (message.length > 5000) {
      setErrorMessage("Message is too long.");
      setSubmitState("error");
      return null;
    }

    return {
      type: form.type,
      name,
      email,
      message,
    };
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitState === "sending") {
      return;
    }

    const validated = validate();

    if (!validated) {
      return;
    }

    setForm(validated);
    setConfirmOpen(true);
  };

  const sendMessage = async () => {
    if (submitState === "sending") {
      return;
    }

    const validated = validate();

    if (!validated) {
      setConfirmOpen(false);
      return;
    }

    setSubmitState("sending");
    setErrorMessage("");

    try {
      const body = new URLSearchParams();

      body.append("action", "create");

      body.append("type", validated.type);

      body.append("name", validated.name);

      body.append("email", validated.email);

      body.append("message", validated.message);

      const response = await fetch(`${BACKEND_URL}/api/contact.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          Accept: "application/json",
        },
        body,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message || `Failed to send message. HTTP ${response.status}`,
        );
      }

      if (!result?.success) {
        throw new Error(result?.message || "Message failed to send.");
      }

      const keepType = validated.type;

      setForm({
        ...INITIAL_FORM,
        type: keepType,
      });

      setTemplateValue(getContactType(keepType).template);

      setConfirmOpen(false);
      setSubmitState("success");
      setErrorMessage("");
    } catch (error) {
      setConfirmOpen(false);
      setSubmitState("error");

      setErrorMessage(
        error instanceof Error ? error.message : "Message failed to send.",
      );
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-xeoo-black text-white">
                  <Mail size={14} />
                </div>

                <div className="min-w-0">
                  <h1 className="text-sm font-extrabold tracking-tight sm:text-base">
                    Contact XeooTools
                  </h1>

                  <p className="mt-0.5 text-[10px] text-xeoo-muted sm:text-[10px]">
                    Send us a message based on what you need.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-3 sm:p-4">
              <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div className="space-y-2.5">
                  <div>
                    <label
                      htmlFor="contact-type"
                      className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wide text-xeoo-muted"
                    >
                      Purpose
                    </label>

                    <ContactSelect
                      value={form.type}
                      onChange={handleTypeChange}
                      disabled={submitState === "sending"}
                    />
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wide text-xeoo-muted"
                      >
                        Name
                      </label>

                      <div className="relative">
                        <UserRound
                          size={12}
                          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xeoo-muted"
                        />

                        <input
                          id="contact-name"
                          type="text"
                          value={form.name}
                          onChange={(event) =>
                            updateField("name", event.target.value)
                          }
                          maxLength={100}
                          autoComplete="name"
                          disabled={submitState === "sending"}
                          placeholder="Your name"
                          className="h-9 w-full rounded-lg border border-xeoo-border bg-xeoo-bg pl-8 pr-2.5 text-[10px] text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:bg-xeoo-surface disabled:cursor-not-allowed disabled:opacity-60 sm:text-[11px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wide text-xeoo-muted"
                      >
                        Email
                      </label>

                      <div className="relative">
                        <Mail
                          size={12}
                          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xeoo-muted"
                        />

                        <input
                          id="contact-email"
                          type="email"
                          value={form.email}
                          onChange={(event) =>
                            updateField("email", event.target.value)
                          }
                          maxLength={190}
                          autoComplete="email"
                          disabled={submitState === "sending"}
                          placeholder="name@email.com"
                          className="h-9 w-full rounded-lg border border-xeoo-border bg-xeoo-bg pl-8 pr-2.5 text-[10px] text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:bg-xeoo-surface disabled:cursor-not-allowed disabled:opacity-60 sm:text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label
                      htmlFor="contact-message"
                      className="text-[10px] font-extrabold uppercase tracking-wide text-xeoo-muted"
                    >
                      Message
                    </label>

                    <button
                      type="button"
                      onClick={applyTemplate}
                      disabled={submitState === "sending"}
                      className="rounded-md border border-xeoo-border bg-xeoo-surface-soft px-2 py-1 text-[10px] font-bold text-xeoo-text-soft transition hover:bg-xeoo-surface disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Template
                    </button>
                  </div>

                  <textarea
                    id="contact-message"
                    value={form.message}
                    onChange={(event) =>
                      updateField("message", event.target.value)
                    }
                    maxLength={5000}
                    rows={9}
                    disabled={submitState === "sending"}
                    placeholder={activeMeta.template}
                    className="block min-h-40 w-full resize-y rounded-xl border border-xeoo-border bg-xeoo-bg px-3 py-2.5 text-[10px] leading-4.5 text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:bg-xeoo-surface disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-48 sm:text-[11px]"
                  />

                  <div className="mt-1 flex justify-end">
                    <span className="text-[10px] text-xeoo-muted">
                      {form.message.length}
                      /5000
                    </span>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="mt-2.5 rounded-lg border border-xeoo-danger/40 bg-xeoo-danger-soft px-3 py-2 text-[10px] font-semibold leading-4 text-xeoo-danger">
                  {errorMessage}
                </div>
              )}

              {submitState === "success" && (
                <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-xeoo-success/40 bg-xeoo-success-soft px-3 py-2 text-[10px] font-semibold text-xeoo-success">
                  <CheckCircle2 size={12} />
                  Message sent successfully.
                </div>
              )}

              <div className="mt-2.5 flex justify-end border-t border-xeoo-border pt-2.5">
                <button
                  type="submit"
                  disabled={
                    submitState === "sending" ||
                    !form.name.trim() ||
                    !form.email.trim() ||
                    !form.message.trim()
                  }
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-xeoo-black px-3.5 text-[10px] font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:text-[11px]"
                >
                  <Send size={12} />

                  {submitState === "sending" ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>

      <Footer />

      {confirmOpen && (
        <ConfirmModal
          form={form}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => void sendMessage()}
          submitting={submitState === "sending"}
        />
      )}

      {securityMessage && (
        <SecurityModal
          message={securityMessage}
          onClose={() => setSecurityMessage("")}
        />
      )}
    </div>
  );
}
