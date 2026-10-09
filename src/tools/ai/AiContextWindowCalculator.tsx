import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Gauge,
  Info,
  RotateCcw,
} from "lucide-react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showSuccess, showError } from "../../alert";
import {
  calculateContextWindow,
  CONTEXT_WINDOW_MODELS,
  type ContextWindowBreakdown,
  type ContextWindowInput,
} from "./aiContextWindowCalculatorLogic";

export default function AiContextWindowCalculator() {
  const [selectedModelId, setSelectedModelId] = useState<string>("gpt-4o");
  const [contextSize, setContextSize] = useState<number>(128000);
  const [systemTokens, setSystemTokens] = useState<number>(1200);
  const [historyTokens, setHistoryTokens] = useState<number>(4500);
  const [ragTokens, setRagTokens] = useState<number>(6000);
  const [userInputTokens, setUserInputTokens] = useState<number>(850);
  const [reservedOutputTokens, setReservedOutputTokens] = useState<number>(4096);

  const [breakdown, setBreakdown] = useState<ContextWindowBreakdown>(() =>
    calculateContextWindow({
      contextWindowSize: 128000,
      systemTokens: 1200,
      historyTokens: 4500,
      ragTokens: 6000,
      userInputTokens: 850,
      reservedOutputTokens: 4096,
    })
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "AI Context Window Calculator | XeooTools";
    const canonicalId = "canonical-ai-context-window-calculator";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      link.href = "https://xeootools.site.je/tools/ai-context-window-calculator";
      document.head.appendChild(link);
    }
    return () => {
      link?.remove();
    };
  }, []);

  const handleModelChange = (id: string) => {
    setSelectedModelId(id);
    const m = CONTEXT_WINDOW_MODELS.find((item) => item.id === id);
    if (m && m.id !== "custom") {
      setContextSize(m.maxContext);
      setReservedOutputTokens(m.defaultMaxOutput);
    }
  };

  useEffect(() => {
    const input: ContextWindowInput = {
      contextWindowSize: contextSize,
      systemTokens,
      historyTokens,
      ragTokens,
      userInputTokens,
      reservedOutputTokens,
    };
    setBreakdown(calculateContextWindow(input));
  }, [
    contextSize,
    systemTokens,
    historyTokens,
    ragTokens,
    userInputTokens,
    reservedOutputTokens,
  ]);

  const handleCopy = async () => {
    const summary = `Context Window Budget\nTotal: ${breakdown.totalContext.toLocaleString()}\nUsed: ${breakdown.usedInputTokens.toLocaleString()}\nReserved Output: ${breakdown.reservedOutputTokens.toLocaleString()}\nRemaining: ${breakdown.remainingTokens.toLocaleString()} (${breakdown.usagePercentage}%)\nStatus: ${breakdown.status.toUpperCase()}`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      void showSuccess("Copied", "Context budget copied to clipboard.");
    } catch {
      void showError("Copy Error", "Failed to copy context summary.");
    }
  };

  const handleReset = () => {
    setSelectedModelId("gpt-4o");
    setContextSize(128000);
    setSystemTokens(1000);
    setHistoryTokens(2000);
    setRagTokens(3000);
    setUserInputTokens(500);
    setReservedOutputTokens(4096);
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
                  <Gauge size={16} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold tracking-tight text-xeoo-text sm:text-sm">
                    AI CONTEXT WINDOW CALCULATOR
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Calculate context allocation across system instructions, conversation turns, RAG documents, and reserved output.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-[11px] font-medium text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex items-center gap-2 border-b border-xeoo-border bg-sky-500/5 px-3.5 py-2 text-[11px] text-sky-800 dark:text-sky-300">
              <Info size={14} className="shrink-0 text-sky-500" />
              <span>
                <strong>Context Headroom Planning:</strong> An LLM's context window contains BOTH prompt inputs and the generated completion tokens. Always reserve sufficient room for output!
              </span>
            </div>

            {/* WORKSPACE */}
            <div className="grid grid-cols-1 gap-4 p-3.5 sm:p-5 lg:grid-cols-12">
              {/* LEFT: INPUTS */}
              <div className="space-y-3.5 lg:col-span-6">
                <div>
                  <label className="text-xs font-bold text-xeoo-text">Model Architecture Preset</label>
                  <select
                    value={selectedModelId}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 py-1.5 text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  >
                    {CONTEXT_WINDOW_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.maxContext.toLocaleString()} tokens)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-xeoo-text">Total Context Window Ceiling</label>
                  <input
                    type="number"
                    min={512}
                    value={contextSize}
                    onChange={(e) => {
                      setSelectedModelId("custom");
                      setContextSize(Math.max(1, Number(e.target.value) || 1));
                    }}
                    className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 font-mono text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  />
                </div>

                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted block">
                    Input Allocation Tokens
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-xeoo-muted block">System Prompt</span>
                      <input
                        type="number"
                        min={0}
                        value={systemTokens}
                        onChange={(e) => setSystemTokens(Math.max(0, Number(e.target.value) || 0))}
                        className="mt-1 w-full rounded border border-xeoo-border bg-xeoo-surface px-2 py-1 font-mono text-xs text-xeoo-text"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-xeoo-muted block">Conversation History</span>
                      <input
                        type="number"
                        min={0}
                        value={historyTokens}
                        onChange={(e) => setHistoryTokens(Math.max(0, Number(e.target.value) || 0))}
                        className="mt-1 w-full rounded border border-xeoo-border bg-xeoo-surface px-2 py-1 font-mono text-xs text-xeoo-text"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-xeoo-muted block">RAG / Documents</span>
                      <input
                        type="number"
                        min={0}
                        value={ragTokens}
                        onChange={(e) => setRagTokens(Math.max(0, Number(e.target.value) || 0))}
                        className="mt-1 w-full rounded border border-xeoo-border bg-xeoo-surface px-2 py-1 font-mono text-xs text-xeoo-text"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-xeoo-muted block">Current User Query</span>
                      <input
                        type="number"
                        min={0}
                        value={userInputTokens}
                        onChange={(e) => setUserInputTokens(Math.max(0, Number(e.target.value) || 0))}
                        className="mt-1 w-full rounded border border-xeoo-border bg-xeoo-surface px-2 py-1 font-mono text-xs text-xeoo-text"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-xeoo-text">Reserved Output Tokens (Max Completion)</label>
                  <input
                    type="number"
                    min={1}
                    value={reservedOutputTokens}
                    onChange={(e) => setReservedOutputTokens(Math.max(1, Number(e.target.value) || 1))}
                    className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 font-mono text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  />
                  <span className="text-[10px] text-xeoo-muted block mt-0.5">
                    Buffer reserved so the model does not cut off mid-sentence.
                  </span>
                </div>
              </div>

              {/* RIGHT: LIVE CAPACITY METRICS */}
              <div className="space-y-4 lg:col-span-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-xeoo-text">Context Allocation Summary</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 rounded bg-xeoo-surface-soft border border-xeoo-border px-2.5 py-1 text-[11px] font-medium text-xeoo-text hover:bg-xeoo-surface"
                  >
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copied ? "Copied" : "Copy Budget"}</span>
                  </button>
                </div>

                {/* CAPACITY HERO CARD */}
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-4 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-xeoo-muted">
                    {breakdown.isOverflow ? "Context Exceeded By" : "Remaining Headroom"}
                  </span>
                  <div
                    className={`mt-1 text-3xl font-extrabold font-mono sm:text-4xl ${
                      breakdown.isOverflow
                        ? "text-red-600 dark:text-red-400"
                        : breakdown.usagePercentage > 90
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {Math.abs(breakdown.remainingTokens).toLocaleString()} tokens
                  </div>
                  <span className="text-[11px] text-xeoo-muted block mt-1">
                    {breakdown.usagePercentage}% utilized of {breakdown.totalContext.toLocaleString()} window
                  </span>
                </div>

                {/* VISUAL ALLOCATION PROGRESS BAR */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-3 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted block">
                    Context Breakdown Visualization
                  </span>

                  <div className="h-4 w-full overflow-hidden rounded-full bg-xeoo-surface-soft border border-xeoo-border flex">
                    <div
                      style={{ width: `${(systemTokens / breakdown.totalContext) * 100}%` }}
                      className="bg-indigo-500"
                      title={`System: ${systemTokens.toLocaleString()} tokens`}
                    />
                    <div
                      style={{ width: `${(historyTokens / breakdown.totalContext) * 100}%` }}
                      className="bg-sky-500"
                      title={`History: ${historyTokens.toLocaleString()} tokens`}
                    />
                    <div
                      style={{ width: `${(ragTokens / breakdown.totalContext) * 100}%` }}
                      className="bg-purple-500"
                      title={`RAG: ${ragTokens.toLocaleString()} tokens`}
                    />
                    <div
                      style={{ width: `${(userInputTokens / breakdown.totalContext) * 100}%` }}
                      className="bg-blue-500"
                      title={`User Query: ${userInputTokens.toLocaleString()} tokens`}
                    />
                    <div
                      style={{ width: `${(reservedOutputTokens / breakdown.totalContext) * 100}%` }}
                      className="bg-amber-500"
                      title={`Reserved Output: ${reservedOutputTokens.toLocaleString()} tokens`}
                    />
                  </div>

                  {/* LEGEND */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-xs bg-indigo-500" />
                      <span>System ({systemTokens.toLocaleString()})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-xs bg-sky-500" />
                      <span>History ({historyTokens.toLocaleString()})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-xs bg-purple-500" />
                      <span>RAG ({ragTokens.toLocaleString()})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-xs bg-blue-500" />
                      <span>Query ({userInputTokens.toLocaleString()})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-xs bg-amber-500" />
                      <span>Output ({reservedOutputTokens.toLocaleString()})</span>
                    </div>
                  </div>
                </div>

                {/* STATUS ALERT */}
                <div
                  className={`rounded-lg border p-3 flex items-start gap-2 text-xs leading-relaxed ${
                    breakdown.isOverflow
                      ? "border-red-500/30 bg-red-500/5 text-red-900 dark:text-red-200"
                      : breakdown.status === "critical"
                        ? "border-amber-500/30 bg-amber-500/5 text-amber-900 dark:text-amber-200"
                        : "border-emerald-500/30 bg-emerald-500/5 text-emerald-900 dark:text-emerald-200"
                  }`}
                >
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <span>{breakdown.statusMessage}</span>
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

