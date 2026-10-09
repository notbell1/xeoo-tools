import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Copy,
  Info,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showSuccess, showError } from "../../alert";
import {
  optimizePrompt,
  type OptimizationSettings,
  type PromptGoal,
  type PromptTone,
  type OutputFormat,
  type OptimizedPromptResult,
} from "./promptOptimizerLogic";

const DEFAULT_PROMPT = "make me a modern landing page for a coffee subscription service";

export default function PromptOptimizer() {
  const [rawPrompt, setRawPrompt] = useState(DEFAULT_PROMPT);
  const [settings, setSettings] = useState<OptimizationSettings>({
    goal: "coding",
    tone: "professional",
    outputFormat: "markdown",
    includeConstraints: true,
    requestClarifications: true,
    targetModel: "General LLM",
  });
  const [result, setResult] = useState<OptimizedPromptResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"optimized" | "analysis" | "original">("optimized");

  useEffect(() => {
    document.title = "Prompt Optimizer | XeooTools";
    const canonicalId = "canonical-prompt-optimizer";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      link.href = "https://xeootools.site.je/tools/prompt-optimizer";
      document.head.appendChild(link);
    }
    return () => {
      link?.remove();
    };
  }, []);

  useEffect(() => {
    if (rawPrompt.trim()) {
      setResult(optimizePrompt(rawPrompt, settings));
    } else {
      setResult(null);
    }
  }, [rawPrompt, settings]);

  const handleCopy = async () => {
    if (!result?.optimizedPrompt) return;
    try {
      await navigator.clipboard.writeText(result.optimizedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      void showSuccess("Copied", "Optimized prompt copied to clipboard.");
    } catch {
      void showError("Copy Error", "Failed to copy text to clipboard.");
    }
  };

  const handleReset = () => {
    setRawPrompt("");
    setResult(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      <Header />

      <main className="flex-1 px-3 py-4 sm:px-5 sm:py-6">
        <div className="mx-auto w-full max-w-5xl space-y-4">
          {/* TOOL HEADER */}
          <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
            <div className="flex items-center justify-between gap-3 border-b border-xeoo-border px-3.5 py-3 sm:px-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Wand2 size={16} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold tracking-tight text-xeoo-text sm:text-sm">
                    PROMPT OPTIMIZER
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Improve prompt structure, clarity, constraints, and output instructions via deterministic rules.
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

            {/* NOTICE BANNER */}
            <div className="flex items-center gap-2 border-b border-xeoo-border bg-xeoo-surface-soft px-3.5 py-2.5 text-[11px] text-xeoo-text-soft">
              <Info size={14} className="shrink-0 text-xeoo-primary" />
              <span>
                <strong className="font-semibold text-xeoo-text">100% Private & Rule-Based:</strong> Processed entirely in your browser using structured prompt engineering heuristics. No AI API calls or data transmission.
              </span>
            </div>

            {/* WORKSPACE GRID */}
            <div className="grid grid-cols-1 gap-4 p-3.5 sm:p-5 lg:grid-cols-12">
              {/* LEFT COLUMN: CONTROLS & INPUT */}
              <div className="space-y-4 lg:col-span-5">
                <div className="space-y-1.5">
                  <label htmlFor="raw-prompt" className="flex items-center justify-between text-xs font-bold text-xeoo-text">
                    <span>Draft Prompt</span>
                    <span className="text-[11px] font-normal text-xeoo-muted">
                      {rawPrompt.length} chars • {rawPrompt.trim() ? rawPrompt.trim().split(/\s+/).length : 0} words
                    </span>
                  </label>
                  <textarea
                    id="raw-prompt"
                    rows={5}
                    value={rawPrompt}
                    onChange={(e) => setRawPrompt(e.target.value)}
                    placeholder="Enter a prompt to optimize (e.g. 'build a dashboard for sales analytics')..."
                    className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg p-2.5 text-xs text-xeoo-text placeholder:text-xeoo-muted/60 focus:border-xeoo-primary focus:outline-none focus:ring-1 focus:ring-xeoo-primary"
                  />
                </div>

                {/* CONFIGURATION OPTIONS */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                    Optimization Parameters
                  </span>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-semibold text-xeoo-text">Task Domain</label>
                      <select
                        value={settings.goal}
                        onChange={(e) => setSettings({ ...settings, goal: e.target.value as PromptGoal })}
                        className="mt-1 h-8.5 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 text-[11px] font-medium text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20 cursor-pointer"
                      >
                        <option value="general" className="bg-xeoo-surface text-xeoo-text">General Task</option>
                        <option value="coding" className="bg-xeoo-surface text-xeoo-text">Software Engineering</option>
                        <option value="writing" className="bg-xeoo-surface text-xeoo-text">Content Writing</option>
                        <option value="analysis" className="bg-xeoo-surface text-xeoo-text">Data & Systems Analysis</option>
                        <option value="education" className="bg-xeoo-surface text-xeoo-text">Educational Tutoring</option>
                        <option value="creative" className="bg-xeoo-surface text-xeoo-text">Creative & Conceptual</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-xeoo-text">Communication Tone</label>
                      <select
                        value={settings.tone}
                        onChange={(e) => setSettings({ ...settings, tone: e.target.value as PromptTone })}
                        className="mt-1 h-8.5 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 text-[11px] font-medium text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20 cursor-pointer"
                      >
                        <option value="professional" className="bg-xeoo-surface text-xeoo-text">Professional & Crisp</option>
                        <option value="concise" className="bg-xeoo-surface text-xeoo-text">Concise & Direct (No Fluff)</option>
                        <option value="educational" className="bg-xeoo-surface text-xeoo-text">Step-by-Step Educational</option>
                        <option value="engaging" className="bg-xeoo-surface text-xeoo-text">Conversational & Engaging</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-xeoo-text">Target Output Format</label>
                      <select
                        value={settings.outputFormat}
                        onChange={(e) => setSettings({ ...settings, outputFormat: e.target.value as OutputFormat })}
                        className="mt-1 h-8.5 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 text-[11px] font-medium text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20 cursor-pointer"
                      >
                        <option value="markdown" className="bg-xeoo-surface text-xeoo-text">Structured Markdown</option>
                        <option value="step_by_step" className="bg-xeoo-surface text-xeoo-text">Sequential Steps</option>
                        <option value="bullet_points" className="bg-xeoo-surface text-xeoo-text">Bullet Points</option>
                        <option value="code_explained" className="bg-xeoo-surface text-xeoo-text">Code + Explanation</option>
                        <option value="structured_json" className="bg-xeoo-surface text-xeoo-text">Strict JSON Schema</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-xeoo-text">Target Model Profile</label>
                      <select
                        value={settings.targetModel}
                        onChange={(e) => setSettings({ ...settings, targetModel: e.target.value })}
                        className="mt-1 h-8.5 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 text-[11px] font-medium text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20 cursor-pointer"
                      >
                        <option value="General LLM" className="bg-xeoo-surface text-xeoo-text">General LLM</option>
                        <option value="GPT-4o / Claude 3.5" className="bg-xeoo-surface text-xeoo-text">Advanced Frontier Model</option>
                        <option value="Compact / Local Model" className="bg-xeoo-surface text-xeoo-text">Local / Small Model (7B-8B)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-xeoo-border/60">
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] text-xeoo-text">
                      <input
                        type="checkbox"
                        checked={settings.includeConstraints}
                        onChange={(e) => setSettings({ ...settings, includeConstraints: e.target.checked })}
                        className="rounded border-xeoo-border text-xeoo-primary focus:ring-xeoo-primary"
                      />
                      <span>Enforce negative constraints (prevent fluff & off-topic padding)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-[11px] text-xeoo-text">
                      <input
                        type="checkbox"
                        checked={settings.requestClarifications}
                        onChange={(e) => setSettings({ ...settings, requestClarifications: e.target.checked })}
                        className="rounded border-xeoo-border text-xeoo-primary focus:ring-xeoo-primary"
                      />
                      <span>Inject clarification protocol for ambiguous criteria</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: PREVIEW & OUTPUT */}
              <div className="flex flex-col space-y-3 lg:col-span-7">
                {/* TABS & ACTION */}
                <div className="flex items-center justify-between border-b border-xeoo-border pb-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab("optimized")}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                        activeTab === "optimized"
                          ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                          : "text-xeoo-muted hover:text-xeoo-text"
                      }`}
                    >
                      Optimized Prompt
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("analysis")}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                        activeTab === "analysis"
                          ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                          : "text-xeoo-muted hover:text-xeoo-text"
                      }`}
                    >
                      Audit & Issues
                      {result?.analysis.detectedIssues.length ? (
                        <span className="ml-1.5 rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] text-amber-700 dark:text-amber-300">
                          {result.analysis.detectedIssues.length}
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("original")}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                        activeTab === "original"
                          ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                          : "text-xeoo-muted hover:text-xeoo-text"
                      }`}
                    >
                      Original
                    </button>
                  </div>

                  {result?.optimizedPrompt && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex h-7 items-center gap-1.5 rounded-md bg-xeoo-primary px-3 text-[11px] font-medium text-white shadow-xs transition hover:opacity-90"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                  )}
                </div>

                {/* TAB CONTENTS */}
                <div className="min-h-72 flex-1 rounded-lg border border-xeoo-border bg-xeoo-surface p-3.5">
                  {!rawPrompt.trim() ? (
                    <div className="flex h-full flex-col items-center justify-center text-center text-xeoo-muted py-12">
                      <Sparkles size={28} className="mb-2 opacity-40 text-xeoo-primary" />
                      <p className="text-xs font-semibold text-xeoo-text">No prompt entered</p>
                      <p className="text-[11px] text-xeoo-muted">Enter a prompt on the left to generate an optimized version.</p>
                    </div>
                  ) : activeTab === "optimized" && result ? (
                    <div className="space-y-3">
                      <div className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-xeoo-text select-all bg-xeoo-surface-soft p-3 rounded-md border border-xeoo-border">
                        {result.optimizedPrompt}
                      </div>

                      {/* Summary Notes */}
                      <div className="rounded-md border border-sky-500/20 bg-sky-500/5 p-2.5 text-[11px] text-sky-800 dark:text-sky-300">
                        <span className="font-bold uppercase tracking-wider block mb-1">Applied Heuristics:</span>
                        <ul className="space-y-0.5 list-disc list-inside">
                          {result.summary.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : activeTab === "analysis" && result ? (
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted block mb-1.5">
                          Detected Weaknesses in Input
                        </span>
                        {result.analysis.detectedIssues.length === 0 ? (
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                            ✓ No major prompt structure issues detected in your original draft.
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {result.analysis.detectedIssues.map((issue, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 p-2 text-[11px] text-amber-800 dark:text-amber-300"
                              >
                                <AlertTriangle size={13} className="shrink-0 text-amber-500 mt-0.5" />
                                <span>{issue}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-xeoo-border">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted block mb-1.5">
                          Heuristic Suggestions
                        </span>
                        <ul className="space-y-1">
                          {result.analysis.suggestions.map((sug, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-[11px] text-xeoo-text">
                              <ArrowRight size={12} className="shrink-0 text-xeoo-primary mt-0.5" />
                              <span>{sug}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-xeoo-muted p-2">
                      {rawPrompt}
                    </div>
                  )}
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

