import { useEffect, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Info,
  ListCheck,
  Plus,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showSuccess, showError } from "../../alert";
import {
  evaluateAiOutput,
  type EvaluationCriterion,
  type EvaluationReport,
} from "./aiOutputEvaluatorLogic";

const DEFAULT_CRITERIA: EvaluationCriterion[] = [
  {
    id: "c-1",
    name: "Required Keywords",
    type: "required_words",
    weight: 3,
    param: "React, TypeScript, component",
  },
  {
    id: "c-2",
    name: "No Speculation / Banned Terms",
    type: "forbidden_words",
    weight: 2,
    param: "as an ai, i cannot, apology",
  },
  {
    id: "c-3",
    name: "Contains Code Block",
    type: "contains_code",
    weight: 3,
  },
  {
    id: "c-4",
    name: "Minimum Length (20 words)",
    type: "min_length",
    weight: 1,
    param: "20",
  },
];

const DEFAULT_PROMPT =
  "Write a simple React TypeScript counter component with typed props.";

const DEFAULT_OUTPUT = `Here is the requested component:

\`\`\`tsx
import React, { useState } from "react";

interface CounterProps {
  initialCount?: number;
}

export const Counter: React.FC<CounterProps> = ({ initialCount = 0 }) => {
  const [count, setCount] = useState<number>(initialCount);

  return (
    <button onClick={() => setCount((current) => current + 1)}>
      Count: {count}
    </button>
  );
};
\`\`\`

This component defines strict TypeScript interfaces and manages local React state cleanly.`;

const dropdownTriggerClass =
  "flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-xeoo-border bg-xeoo-bg px-3 text-left text-[11px] font-medium text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20";

const CRITERION_TYPES = [
  { value: "required_words", label: "Required Keywords" },
  { value: "forbidden_words", label: "Forbidden Words" },
  { value: "min_length", label: "Min Word Count" },
  { value: "max_length", label: "Max Word Count" },
  { value: "contains_code", label: "Must Contain Code Block" },
  { value: "contains_list", label: "Must Contain List" },
  { value: "valid_json", label: "Must Be Valid JSON" },
] as const;

const DROPDOWN_MAX_HEIGHT = 192;
const DROPDOWN_GAP = 4;
const VIEWPORT_PADDING = 8;

type DropdownPosition = {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
  openUp: boolean;
};

function CriterionTypeDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<DropdownPosition | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = CRITERION_TYPES.find(
    (option) => option.value === value,
  );

  const updatePosition = () => {
    const trigger = triggerRef.current;

    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();

    const spaceAbove = Math.max(0, rect.top - VIEWPORT_PADDING - DROPDOWN_GAP);

    const spaceBelow = Math.max(
      0,
      window.innerHeight - rect.bottom - VIEWPORT_PADDING - DROPDOWN_GAP,
    );

    // Open upward when the menu would not fit below
    // and there is more useful space above the trigger.
    const openUp = spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow;

    const availableSpace = openUp ? spaceAbove : spaceBelow;

    const maxHeight = Math.max(
      0,
      Math.min(DROPDOWN_MAX_HEIGHT, availableSpace),
    );

    const top = openUp
      ? rect.top - maxHeight - DROPDOWN_GAP
      : rect.bottom + DROPDOWN_GAP;

    setPosition({
      left: Math.max(
        VIEWPORT_PADDING,
        Math.min(rect.left, window.innerWidth - rect.width - VIEWPORT_PADDING),
      ),
      top,
      width: rect.width,
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

    // Capture scroll events from the criteria list as well as the page.
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
          size={14}
          className={`shrink-0 text-xeoo-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && position && position.maxHeight > 0 && (
        <div
          ref={menuRef}
          role="listbox"
          aria-label="Criterion type"
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
            style={{ maxHeight: position.maxHeight - 8 }}
          >
            {CRITERION_TYPES.map((option) => {
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
                  className={`flex min-h-8 w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-[10px] font-semibold transition ${
                    isSelected
                      ? "bg-xeoo-primary text-white"
                      : "text-xeoo-text hover:bg-xeoo-bg"
                  }`}
                >
                  <span className="min-w-0 flex-1 whitespace-normal break-words">
                    {option.label}
                  </span>

                  {isSelected && <Check size={11} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AiOutputEvaluator() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [output, setOutput] = useState(DEFAULT_OUTPUT);
  const [criteria, setCriteria] =
    useState<EvaluationCriterion[]>(DEFAULT_CRITERIA);

  const [report, setReport] = useState<EvaluationReport>(() =>
    evaluateAiOutput(DEFAULT_PROMPT, DEFAULT_OUTPUT, DEFAULT_CRITERIA),
  );

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "AI Output Evaluator | XeooTools";

    const canonicalId = "canonical-ai-output-evaluator";

    let link = document.querySelector<HTMLLinkElement>(`link#${canonicalId}`);

    const createdLink = !link;

    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      document.head.appendChild(link);
    }

    link.rel = "canonical";
    link.href = "https://xeootools.site.je/tools/ai-output-evaluator";

    return () => {
      if (createdLink) {
        link?.remove();
      }
    };
  }, []);

  useEffect(() => {
    setReport(evaluateAiOutput(prompt, output, criteria));
  }, [prompt, output, criteria]);

  const handleAddCriterion = () => {
    setCriteria((previous) => [
      ...previous,
      {
        id: `c-${Date.now()}`,
        name: "New Custom Check",
        type: "required_words",
        weight: 2,
        param: "keyword",
      },
    ]);
  };

  const handleRemoveCriterion = (id: string) => {
    setCriteria((previous) =>
      previous.filter((criterion) => criterion.id !== id),
    );
  };

  const handleUpdateCriterion = (
    id: string,
    field: keyof EvaluationCriterion,
    value: unknown,
  ) => {
    setCriteria((previous) =>
      previous.map((criterion) =>
        criterion.id === id ? { ...criterion, [field]: value } : criterion,
      ),
    );
  };

  const handleCopy = async () => {
    const summary = `AI Output Evaluation Report
Overall Score: ${report.overallScore}/100
Passed: ${report.passedChecksCount}/${report.totalChecksCount}

Checks:
${report.criteriaResults
  .map(
    (result) =>
      `- [${result.passed ? "PASS" : "FAIL"}] ${result.name}: ${result.details}`,
  )
  .join("\n")}`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);

      window.setTimeout(() => setCopied(false), 2000);

      void showSuccess("Copied", "Evaluation report copied to clipboard.");
    } catch {
      void showError("Copy Error", "Failed to copy report.");
    }
  };

  const handleReset = () => {
    setPrompt("");
    setOutput("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      <Header />

      <main className="min-w-0 flex-1 px-3 py-4 sm:px-5 sm:py-6">
        <div className="mx-auto w-full max-w-5xl space-y-4">
          <section className="min-w-0 overflow-visible rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
            {/* PAGE HEADER */}
            <div className="flex min-w-0 items-center justify-between gap-3 rounded-t-xl border-b border-xeoo-border px-3.5 py-3 sm:px-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <ListCheck size={16} strokeWidth={2.2} />
                </div>

                <div className="min-w-0 flex-1">
                  <h1 className="break-words text-xs font-extrabold tracking-tight text-xeoo-text sm:text-sm">
                    AI OUTPUT EVALUATOR
                  </h1>

                  <p className="text-[11px] leading-relaxed text-xeoo-muted">
                    Deterministic rule-based verification of AI responses
                    against custom checklists and constraints.
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

            {/* DISCLAIMER */}
            <div className="flex min-w-0 items-start gap-2 border-b border-xeoo-border bg-xeoo-surface-soft px-3.5 py-2.5 text-[11px] leading-relaxed text-xeoo-text-soft">
              <Info size={14} className="mt-0.5 shrink-0 text-xeoo-primary" />

              <span className="min-w-0 break-words">
                <strong className="font-semibold text-xeoo-text">
                  Transparent Rule-Based Evaluation:
                </strong>{" "}
                Evaluates syntax, keywords, format adherence, and constraints
                locally in the browser. No AI API, plagiarism checker, or
                detector is used.
              </span>
            </div>

            {/* MAIN WORKSPACE */}
            <div className="grid min-w-0 grid-cols-1 gap-4 rounded-b-xl p-3.5 sm:p-5 lg:grid-cols-12">
              {/* LEFT COLUMN */}
              <div className="min-w-0 space-y-4 lg:col-span-6">
                <div className="min-w-0">
                  <label className="text-xs font-bold text-xeoo-text">
                    User Prompt (Context)
                  </label>

                  <input
                    type="text"
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Enter the original prompt..."
                    className="mt-1 w-full min-w-0 rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  />
                </div>

                <div className="min-w-0">
                  <label className="text-xs font-bold text-xeoo-text">
                    AI Output to Evaluate
                  </label>

                  <textarea
                    rows={7}
                    value={output}
                    onChange={(event) => setOutput(event.target.value)}
                    placeholder="Paste the generated response here..."
                    className="mt-1 w-full min-w-0 resize-y rounded-md border border-xeoo-border bg-xeoo-bg p-2.5 font-mono text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  />
                </div>

                {/* CRITERIA BUILDER */}
                <div className="min-w-0 space-y-2.5 rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <span className="min-w-0 break-words text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Rule Checkpoints ({criteria.length})
                    </span>

                    <button
                      type="button"
                      onClick={handleAddCriterion}
                      className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-medium text-xeoo-text shadow-xs transition hover:bg-xeoo-surface-soft"
                    >
                      <Plus size={11} />
                      <span>Add Check</span>
                    </button>
                  </div>

                  <div className="max-h-[min(60vh,32rem)] space-y-2 overflow-y-auto overscroll-contain pr-1">
                    {criteria.map((criterion) => (
                      <div
                        key={criterion.id}
                        className="relative min-w-0 space-y-2 rounded border border-xeoo-border bg-xeoo-surface p-2"
                      >
                        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap">
                          <input
                            type="text"
                            value={criterion.name}
                            aria-label="Criterion name"
                            onChange={(event) =>
                              handleUpdateCriterion(
                                criterion.id,
                                "name",
                                event.target.value,
                              )
                            }
                            className="min-w-0 flex-1 basis-full rounded-sm border-b border-xeoo-border bg-transparent px-1 py-1 pr-7 text-xs font-semibold text-xeoo-text focus:border-xeoo-primary focus:outline-none sm:basis-0"
                          />

                          <div className="w-full min-w-0 sm:w-1/2 sm:flex-none">
                            <CriterionTypeDropdown
                              value={criterion.type}
                              onChange={(value) =>
                                handleUpdateCriterion(
                                  criterion.id,
                                  "type",
                                  value,
                                )
                              }
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveCriterion(criterion.id)}
                            className="absolute right-2 top-2 shrink-0 rounded p-1 text-xeoo-muted transition hover:bg-red-500/10 hover:text-red-500 sm:static sm:p-0"
                            title="Delete"
                            aria-label={`Delete ${criterion.name}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {[
                          "required_words",
                          "forbidden_words",
                          "min_length",
                          "max_length",
                        ].includes(criterion.type) && (
                          <input
                            type="text"
                            value={criterion.param || ""}
                            onChange={(event) =>
                              handleUpdateCriterion(
                                criterion.id,
                                "param",
                                event.target.value,
                              )
                            }
                            placeholder={
                              criterion.type.includes("words")
                                ? "comma-separated words"
                                : "number of words"
                            }
                            className="w-full min-w-0 rounded border border-xeoo-border bg-xeoo-bg px-2 py-1 font-mono text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="min-w-0 space-y-4 lg:col-span-6">
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <span className="min-w-0 break-words text-xs font-bold text-xeoo-text">
                    Evaluation Report
                  </span>

                  <button
                    type="button"
                    onClick={handleCopy}
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

                {/* SCORE */}
                <div className="min-w-0 rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-4 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Compliance Score
                  </span>

                  <div
                    className={`mt-1 break-words font-mono text-3xl font-extrabold sm:text-4xl ${
                      report.overallScore >= 80
                        ? "text-emerald-600 dark:text-emerald-400"
                        : report.overallScore >= 50
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {report.overallScore} / 100
                  </div>

                  <span className="mt-1 block break-words text-[11px] text-xeoo-muted">
                    {report.passedChecksCount} of {report.totalChecksCount}{" "}
                    checks passed
                  </span>
                </div>

                {/* CHECK DETAILS */}
                <div className="min-w-0 space-y-2">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Check Details
                  </span>

                  {report.criteriaResults.map((result) => (
                    <div
                      key={result.id}
                      className={`flex min-w-0 items-start gap-2.5 rounded-lg border p-2.5 text-xs transition ${
                        result.passed
                          ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-950 dark:text-emerald-200"
                          : "border-red-500/30 bg-red-500/5 text-red-950 dark:text-red-200"
                      }`}
                    >
                      {result.passed ? (
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 shrink-0 text-emerald-500"
                        />
                      ) : (
                        <XCircle
                          size={16}
                          className="mt-0.5 shrink-0 text-red-500"
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-start justify-between gap-2">
                          <span className="min-w-0 break-words font-bold text-xeoo-text">
                            {result.name}
                          </span>

                          <span
                            className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase ${
                              result.passed
                                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                : "bg-red-500/20 text-red-700 dark:text-red-300"
                            }`}
                          >
                            {result.passed ? "Pass" : "Fail"}
                          </span>
                        </div>

                        <p className="mt-0.5 min-w-0 break-words text-[11px] leading-relaxed text-xeoo-muted">
                          {result.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* SUGGESTIONS */}
                {report.suggestions.length > 0 && (
                  <div className="min-w-0 space-y-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface p-3">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Improvement Recommendations
                    </span>

                    <ul className="space-y-1">
                      {report.suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="flex min-w-0 items-start gap-1.5 text-[11px] text-xeoo-text"
                        >
                          <span className="shrink-0 font-bold text-sky-500">
                            •
                          </span>

                          <span className="min-w-0 break-words">
                            {suggestion}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
