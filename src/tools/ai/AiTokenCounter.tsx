import { useEffect, useRef, useState } from "react";
import {
  Binary,
  Check,
  ChevronDown,
  Copy,
  Info,
  RotateCcw,
} from "lucide-react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showSuccess, showError } from "../../alert";
import {
  estimateTokens,
  type TokenizerProfile,
  type TokenStats,
} from "./aiTokenCounterLogic";

const SAMPLE_TEXT = `Artificial Intelligence (AI) models process text using sub-word tokens rather than individual letters or entire words.

A token can be as short as one character (like 'a') or as long as one word (like 'apple'). On average, 1,000 tokens equal approximately 750 English words. Understanding token length is crucial for budgeting API costs and context window capacity.`;

const PROFILE_OPTIONS: {
  value: TokenizerProfile;
  label: string;
}[] = [
  {
    value: "gpt_o200k",
    label: "GPT-4o / o1 (o200k_base)",
  },
  {
    value: "gpt_cl100k",
    label: "GPT-4 / GPT-3.5 (cl100k_base)",
  },
  {
    value: "claude",
    label: "Claude 3.5 / 3 (Anthropic)",
  },
  {
    value: "llama3",
    label: "Llama 3 / 3.1 (128k BPE)",
  },
];

const DROPDOWN_MAX_HEIGHT = 192;
const DROPDOWN_GAP = 4;
const VIEWPORT_PADDING = 8;

const dropdownTriggerClass =
  "flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 text-left text-[11px] font-medium text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20";

type DropdownPosition = {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
  openUp: boolean;
};

function ProfileDropdown({
  value,
  onChange,
}: {
  value: TokenizerProfile;
  onChange: (value: TokenizerProfile) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<DropdownPosition | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = PROFILE_OPTIONS.find(
    (option) => option.value === value,
  );

  const updatePosition = () => {
    const trigger = triggerRef.current;

    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();

    // Gunakan lebar dan posisi tombol pemicu sebagai acuan.
    // Karena tombol memiliki w-full, lebarnya sama dengan textarea.
    const availableWidth = window.innerWidth - VIEWPORT_PADDING * 2;
    const width = Math.min(rect.width, availableWidth);

    const left = Math.max(
      VIEWPORT_PADDING,
      Math.min(rect.left, window.innerWidth - width - VIEWPORT_PADDING),
    );

    const spaceAbove = Math.max(0, rect.top - VIEWPORT_PADDING - DROPDOWN_GAP);

    const spaceBelow = Math.max(
      0,
      window.innerHeight - rect.bottom - VIEWPORT_PADDING - DROPDOWN_GAP,
    );

    // Buka ke atas jika ruang di bawah tidak cukup
    // dan ruang di atas lebih besar.
    const openUp = spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow;

    const availableSpace = openUp ? spaceAbove : spaceBelow;

    const maxHeight = Math.min(DROPDOWN_MAX_HEIGHT, availableSpace);

    const top = openUp
      ? rect.top - maxHeight - DROPDOWN_GAP
      : rect.bottom + DROPDOWN_GAP;

    setPosition({
      left,
      top,
      width,
      maxHeight,
      openUp,
    });
  };

  useEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }

    updatePosition();

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        dropdownRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleViewportChange = () => {
      updatePosition();
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen]);

  return (
    <div
      ref={dropdownRef}
      className={`relative w-full min-w-0 ${isOpen ? "z-[100]" : "z-0"}`}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
        className={dropdownTriggerClass}
      >
        <span className="min-w-0 flex-1 break-words text-left">
          {selectedOption?.label ?? value}
        </span>

        <ChevronDown
          size={13}
          className={`shrink-0 text-xeoo-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && position && position.maxHeight > 0 && (
        <div
          ref={menuRef}
          role="listbox"
          aria-label="Tokenizer profile"
          className="fixed z-[9999] overflow-hidden rounded-md border border-xeoo-border bg-xeoo-surface p-1 shadow-2xl"
          style={{
            left: position.left,
            top: position.top,
            width: position.width,
            maxHeight: position.maxHeight,
          }}
        >
          <div
            className="overflow-x-hidden overflow-y-auto overscroll-contain"
            style={{
              maxHeight: Math.max(0, position.maxHeight - 8),
            }}
          >
            {PROFILE_OPTIONS.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex min-h-8 w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-[10px] font-medium transition ${
                    isSelected
                      ? "bg-xeoo-primary text-white"
                      : "text-xeoo-text hover:bg-xeoo-bg"
                  }`}
                >
                  <span className="min-w-0 flex-1 whitespace-normal break-words">
                    {option.label}
                  </span>

                  {isSelected && <Check size={12} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AiTokenCounter() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [profile, setProfile] = useState<TokenizerProfile>("gpt_o200k");

  const [stats, setStats] = useState<TokenStats>(() =>
    estimateTokens(SAMPLE_TEXT, "gpt_o200k"),
  );

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "AI Token Counter | XeooTools";

    const canonicalId = "canonical-ai-token-counter";

    let link = document.querySelector<HTMLLinkElement>(
      `link[rel="canonical"]#${canonicalId}`,
    );

    const createdLink = !link;

    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      document.head.appendChild(link);
    }

    link.href = "https://xeootools.site.je/tools/ai-token-counter";

    return () => {
      if (createdLink) {
        link?.remove();
      }
    };
  }, []);

  useEffect(() => {
    setStats(estimateTokens(text, profile));
  }, [text, profile]);

  const handleCopyStats = async () => {
    const summary = `Estimated Tokens: ${stats.estimatedTokens}
Characters: ${stats.charsTotal}
Words: ${stats.wordCount}
Lines: ${stats.lineCount}
Profile: ${profile}`;

    try {
      await navigator.clipboard.writeText(summary);

      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);

      void showSuccess(
        "Copied",
        "Token statistics summary copied to clipboard.",
      );
    } catch {
      void showError("Copy Error", "Failed to copy statistics.");
    }
  };

  const handleReset = () => {
    setText("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      <Header />

      <main className="flex-1 px-3 py-4 sm:px-5 sm:py-6">
        <div className="mx-auto w-full max-w-5xl space-y-4">
          {/* HEADER */}
          <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
            <div className="flex items-center justify-between gap-3 border-b border-xeoo-border px-3.5 py-3 sm:px-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Binary size={16} strokeWidth={2.2} />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold tracking-tight text-xeoo-text sm:text-sm">
                    AI TOKEN COUNTER
                  </h1>

                  <p className="truncate text-[11px] text-xeoo-muted">
                    Estimate token counts, character density, and text capacity
                    across model tokenizers.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-medium text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            {/* MANDATORY DISCLAIMER */}
            <div className="flex items-start gap-2 border-b border-xeoo-border bg-xeoo-surface-soft px-3.5 py-2.5 text-[11px] text-xeoo-text-soft">
              <Info size={14} className="mt-0.5 shrink-0 text-xeoo-primary" />

              <span className="min-w-0">
                <strong className="font-semibold text-xeoo-text">
                  Heuristic Estimation Notice:
                </strong>{" "}
                Token counts are estimates calculated locally in the browser.
                Exact token counts may vary slightly by tokenizer vocabulary
                (Byte-Pair Encoding).
              </span>
            </div>

            {/* WORKSPACE */}
            <div className="grid grid-cols-1 gap-4 p-3.5 sm:p-5 lg:grid-cols-12">
              {/* LEFT: TEXTAREA & PROFILE */}
              <div className="min-w-0 space-y-3.5 lg:col-span-7">
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <label
                    htmlFor="token-text"
                    className="text-xs font-bold text-xeoo-text"
                  >
                    Input Prompt or Document
                  </label>

                  <span className="shrink-0 text-[11px] text-xeoo-muted">
                    Profile
                  </span>
                </div>

                {/* Dropdown dibuat selebar textarea */}
                <ProfileDropdown value={profile} onChange={setProfile} />

                <textarea
                  id="token-text"
                  rows={10}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Paste or type text to calculate tokens..."
                  className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg p-3 font-mono text-xs text-xeoo-text placeholder:text-xeoo-muted/60 focus:border-xeoo-primary focus:outline-none"
                />
              </div>

              {/* RIGHT: METRICS TILES */}
              <div className="min-w-0 space-y-3.5 lg:col-span-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-xeoo-text">
                    Analysis Metrics
                  </span>

                  <button
                    type="button"
                    onClick={handleCopyStats}
                    className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-medium text-xeoo-text shadow-xs transition hover:bg-xeoo-surface-soft"
                  >
                    {copied ? (
                      <Check size={12} className="text-emerald-500" />
                    ) : (
                      <Copy size={12} />
                    )}

                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                {/* PRIMARY ESTIMATED TOKENS HERO CARD */}
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-4 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Estimated Tokens
                  </span>

                  <div className="mt-1 font-mono text-3xl font-extrabold text-xeoo-primary sm:text-4xl">
                    {stats.estimatedTokens.toLocaleString()}
                  </div>

                  <span className="mt-1 block text-[11px] text-xeoo-muted">
                    ~{stats.charsPerToken} characters per token
                  </span>
                </div>

                {/* DETAILED STATS GRID */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5">
                    <span className="mb-1 block text-[10px] font-bold uppercase text-xeoo-muted">
                      Total Characters
                    </span>

                    <span className="font-mono text-base font-bold text-xeoo-text">
                      {stats.charsTotal.toLocaleString()}
                    </span>

                    <span className="block text-[10px] text-xeoo-muted">
                      ({stats.charsNoSpaces} without spaces)
                    </span>
                  </div>

                  <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5">
                    <span className="mb-1 block text-[10px] font-bold uppercase text-xeoo-muted">
                      Word Count
                    </span>

                    <span className="font-mono text-base font-bold text-xeoo-text">
                      {stats.wordCount.toLocaleString()}
                    </span>

                    <span className="block text-[10px] text-xeoo-muted">
                      words
                    </span>
                  </div>

                  <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5">
                    <span className="mb-1 block text-[10px] font-bold uppercase text-xeoo-muted">
                      Lines &amp; Paragraphs
                    </span>

                    <span className="font-mono text-base font-bold text-xeoo-text">
                      {stats.lineCount} / {stats.paragraphCount}
                    </span>

                    <span className="block text-[10px] text-xeoo-muted">
                      lines / paragraphs
                    </span>
                  </div>

                  <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5">
                    <span className="mb-1 block text-[10px] font-bold uppercase text-xeoo-muted">
                      Estimated Reading
                    </span>

                    <span className="font-mono text-base font-bold text-xeoo-text">
                      ~
                      {stats.estimatedReadingTimeSec < 60
                        ? `${stats.estimatedReadingTimeSec}s`
                        : `${Math.ceil(stats.estimatedReadingTimeSec / 60)}m`}
                    </span>

                    <span className="block text-[10px] text-xeoo-muted">
                      at 200 WPM
                    </span>
                  </div>
                </div>

                {/* CONTEXT WINDOW COMPARISON */}
                <div className="space-y-2 rounded-lg border border-xeoo-border bg-xeoo-surface p-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Context Window Usage Comparison
                  </span>

                  {[
                    { name: "8k Window (GPT-4 8k / Small)", max: 8192 },
                    { name: "32k Window (Llama 3)", max: 32768 },
                    { name: "128k Window (GPT-4o)", max: 128000 },
                    { name: "200k Window (Claude 3.5)", max: 200000 },
                  ].map((win) => {
                    const pct = Math.min(
                      100,
                      Math.round((stats.estimatedTokens / win.max) * 1000) / 10,
                    );

                    return (
                      <div key={win.name} className="space-y-0.5">
                        <div className="flex justify-between gap-2 text-[10px]">
                          <span className="min-w-0 break-words font-medium text-xeoo-text">
                            {win.name}
                          </span>

                          <span className="shrink-0 font-mono text-xeoo-muted">
                            {pct}%
                          </span>
                        </div>

                        <div className="h-1.5 w-full overflow-hidden rounded-full border border-xeoo-border bg-xeoo-surface-soft">
                          <div
                            className="h-full bg-sky-500 transition-all duration-300"
                            style={{ width: `${Math.max(1, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
