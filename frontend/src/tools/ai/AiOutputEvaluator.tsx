import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
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

const DEFAULT_PROMPT = "Write a simple React TypeScript counter component with typed props.";
const DEFAULT_OUTPUT = `Here is the requested component:

\`\`\`tsx
import React, { useState } from "react";

interface CounterProps {
  initialCount?: number;
}

export const Counter: React.FC<CounterProps> = ({ initialCount = 0 }) => {
  const [count, setCount] = useState<number>(initialCount);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
};
\`\`\`

This component defines strict TypeScript interfaces and manages local React state cleanly.`;

export default function AiOutputEvaluator() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [output, setOutput] = useState(DEFAULT_OUTPUT);
  const [criteria, setCriteria] = useState<EvaluationCriterion[]>(DEFAULT_CRITERIA);
  const [report, setReport] = useState<EvaluationReport>(() =>
    evaluateAiOutput(DEFAULT_PROMPT, DEFAULT_OUTPUT, DEFAULT_CRITERIA)
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "AI Output Evaluator | XeooTools";
    const canonicalId = "canonical-ai-output-evaluator";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      link.href = "https://xeootools.site.je/tools/ai-output-evaluator";
      document.head.appendChild(link);
    }
    return () => {
      link?.remove();
    };
  }, []);

  useEffect(() => {
    setReport(evaluateAiOutput(prompt, output, criteria));
  }, [prompt, output, criteria]);

  const handleAddCriterion = () => {
    const newId = `c-${Date.now()}`;
    setCriteria((prev) => [
      ...prev,
      {
        id: newId,
        name: "New Custom Check",
        type: "required_words",
        weight: 2,
        param: "keyword",
      },
    ]);
  };

  const handleRemoveCriterion = (id: string) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdateCriterion = (
    id: string,
    field: keyof EvaluationCriterion,
    value: unknown
  ) => {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleCopy = async () => {
    const summary = `AI Output Evaluation Report\nOverall Score: ${report.overallScore}/100\nPassed: ${report.passedChecksCount}/${report.totalChecksCount}\n\nChecks:\n${report.criteriaResults.map((r) => `- [${r.passed ? "PASS" : "FAIL"}] ${r.name}: ${r.details}`).join("\n")}`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

      <main className="flex-1 px-3 py-4 sm:px-5 sm:py-6">
        <div className="mx-auto w-full max-w-5xl space-y-4">
          {/* HEADER */}
          <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
            <div className="flex items-center justify-between gap-3 border-b border-xeoo-border px-3.5 py-3 sm:px-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <ListCheck size={16} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold tracking-tight text-xeoo-text sm:text-sm">
                    AI OUTPUT EVALUATOR
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Deterministic rule-based verification of AI responses against custom checklists and constraints.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-7 items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-medium text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex items-center gap-2 border-b border-xeoo-border bg-xeoo-surface-soft px-3.5 py-2.5 text-[11px] text-xeoo-text-soft">
              <Info size={14} className="shrink-0 text-xeoo-primary" />
              <span>
                <strong className="font-semibold text-xeoo-text">Transparent Rule-Based Evaluation:</strong> Evaluates syntax, keywords, format adherence, and constraints locally in browser. No AI API, plagiarism checker, or detector used.
              </span>
            </div>

            {/* WORKSPACE */}
            <div className="grid grid-cols-1 gap-4 p-3.5 sm:p-5 lg:grid-cols-12">
              {/* LEFT: INPUTS & CRITERIA BUILDER */}
              <div className="space-y-4 lg:col-span-6">
                <div>
                  <label className="text-xs font-bold text-xeoo-text">User Prompt (Context)</label>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter the original prompt..."
                    className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-xeoo-text">AI Output to Evaluate</label>
                  <textarea
                    rows={7}
                    value={output}
                    onChange={(e) => setOutput(e.target.value)}
                    placeholder="Paste the generated response here..."
                    className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg p-2.5 font-mono text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  />
                </div>

                {/* CRITERIA LIST */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Rule Checkpoints ({criteria.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddCriterion}
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-medium text-xeoo-text shadow-xs transition hover:bg-xeoo-surface-soft"
                    >
                      <Plus size={11} />
                      <span>Add Check</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {criteria.map((c) => (
                      <div key={c.id} className="rounded border border-xeoo-border bg-xeoo-surface p-2 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={c.name}
                            onChange={(e) => handleUpdateCriterion(c.id, "name", e.target.value)}
                            className="w-1/2 font-semibold text-xs border-b border-xeoo-border bg-transparent px-1 focus:outline-none"
                          />

                          <select
                            value={c.type}
                            onChange={(e) => handleUpdateCriterion(c.id, "type", e.target.value)}
                            className="h-7.5 w-1/2 rounded-md border border-xeoo-border bg-xeoo-bg px-2 text-[11px] font-medium text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20 cursor-pointer"
                          >
                            <option value="required_words" className="bg-xeoo-surface text-xeoo-text">Required Keywords</option>
                            <option value="forbidden_words" className="bg-xeoo-surface text-xeoo-text">Forbidden Words</option>
                            <option value="min_length" className="bg-xeoo-surface text-xeoo-text">Min Word Count</option>
                            <option value="max_length" className="bg-xeoo-surface text-xeoo-text">Max Word Count</option>
                            <option value="contains_code" className="bg-xeoo-surface text-xeoo-text">Must Contain Code Block</option>
                            <option value="contains_list" className="bg-xeoo-surface text-xeoo-text">Must Contain List</option>
                            <option value="valid_json" className="bg-xeoo-surface text-xeoo-text">Must Be Valid JSON</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleRemoveCriterion(c.id)}
                            className="text-xeoo-muted hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {["required_words", "forbidden_words", "min_length", "max_length"].includes(c.type) && (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={c.param || ""}
                              onChange={(e) => handleUpdateCriterion(c.id, "param", e.target.value)}
                              placeholder={c.type.includes("words") ? "comma-separated words" : "number of words"}
                              className="w-full rounded border border-xeoo-border bg-xeoo-bg px-2 py-0.5 text-xs text-xeoo-text font-mono"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT: REPORT & SCORE */}
              <div className="space-y-4 lg:col-span-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-xeoo-text">Evaluation Report</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex h-7 items-center gap-1.5 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-medium text-xeoo-text shadow-xs transition hover:bg-xeoo-surface-soft"
                  >
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copied ? "Copied" : "Copy Report"}</span>
                  </button>
                </div>

                {/* OVERALL SCORE HERO */}
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-4 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-xeoo-muted">
                    Compliance Score
                  </span>
                  <div
                    className={`mt-1 text-3xl font-extrabold font-mono sm:text-4xl ${
                      report.overallScore >= 80
                        ? "text-emerald-600 dark:text-emerald-400"
                        : report.overallScore >= 50
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {report.overallScore} / 100
                  </div>
                  <span className="text-[11px] text-xeoo-muted block mt-1">
                    {report.passedChecksCount} of {report.totalChecksCount} checks passed
                  </span>
                </div>

                {/* DETAILED CHECK RESULTS */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted block">
                    Check Details
                  </span>

                  {report.criteriaResults.map((r) => (
                    <div
                      key={r.id}
                      className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-xs transition ${
                        r.passed
                          ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-950 dark:text-emerald-200"
                          : "border-red-500/30 bg-red-500/5 text-red-950 dark:text-red-200"
                      }`}
                    >
                      {r.passed ? (
                        <CheckCircle2 size={16} className="shrink-0 text-emerald-500 mt-0.5" />
                      ) : (
                        <XCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xeoo-text">{r.name}</span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[10px] font-extrabold uppercase ${
                              r.passed
                                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                : "bg-red-500/20 text-red-700 dark:text-red-300"
                            }`}
                          >
                            {r.passed ? "Pass" : "Fail"}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-xeoo-muted leading-relaxed">
                          {r.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* SUGGESTIONS */}
                {report.suggestions.length > 0 && (
                  <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-3 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted block">
                      Improvement Recommendations
                    </span>
                    <ul className="space-y-1 text-xs">
                      {report.suggestions.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px] text-xeoo-text">
                          <span className="text-sky-500 font-bold">•</span>
                          <span>{s}</span>
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

