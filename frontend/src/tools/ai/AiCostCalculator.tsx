import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  DollarSign,
  Info,
  RotateCcw,
} from "lucide-react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showSuccess, showError } from "../../alert";
import {
  calculateAiCost,
  MODEL_PRESETS,
  PRICING_LAST_UPDATED,
  type CostCalculationResult,
} from "./aiCostCalculatorLogic";

export default function AiCostCalculator() {
  const [selectedModelId, setSelectedModelId] = useState<string>("gpt-4o");
  const [inputTokens, setInputTokens] = useState<number>(1500);
  const [outputTokens, setOutputTokens] = useState<number>(500);
  const [inputPricePerM, setInputPricePerM] = useState<number>(2.5);
  const [outputPricePerM, setOutputPricePerM] = useState<number>(10.0);
  const [dailyRequests, setDailyRequests] = useState<number>(100);

  const [result, setResult] = useState<CostCalculationResult>(() =>
    calculateAiCost({
      inputTokens: 1500,
      outputTokens: 500,
      inputPricePerM: 2.5,
      outputPricePerM: 10.0,
      dailyRequests: 100,
    })
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "AI Cost Calculator | XeooTools";
    const canonicalId = "canonical-ai-cost-calculator";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      link.href = "https://xeootools.site.je/tools/ai-cost-calculator";
      document.head.appendChild(link);
    }
    return () => {
      link?.remove();
    };
  }, []);

  const handleModelChange = (id: string) => {
    setSelectedModelId(id);
    const preset = MODEL_PRESETS.find((m) => m.id === id);
    if (preset && preset.id !== "custom") {
      setInputPricePerM(preset.inputPerMillion);
      setOutputPricePerM(preset.outputPerMillion);
    }
  };

  useEffect(() => {
    setResult(
      calculateAiCost({
        inputTokens,
        outputTokens,
        inputPricePerM,
        outputPricePerM,
        dailyRequests,
      })
    );
  }, [inputTokens, outputTokens, inputPricePerM, outputPricePerM, dailyRequests]);

  const handleCopy = async () => {
    const summary = `AI Cost Estimate (${selectedModelId})\n- Per Request: $${result.costTotalPerCall.toFixed(6)}\n- Daily (${dailyRequests} calls): $${result.costDaily.toFixed(4)}\n- Monthly: $${result.costMonthly.toFixed(2)}`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      void showSuccess("Copied", "Cost summary copied to clipboard.");
    } catch {
      void showError("Copy Error", "Failed to copy cost summary.");
    }
  };

  const handleReset = () => {
    setSelectedModelId("gpt-4o");
    setInputTokens(1000);
    setOutputTokens(500);
    setInputPricePerM(2.5);
    setOutputPricePerM(10.0);
    setDailyRequests(100);
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
                  <DollarSign size={16} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold tracking-tight text-xeoo-text sm:text-sm">
                    AI COST CALCULATOR
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Calculate API costs from token usage with preset or custom pricing models.
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

            {/* PRICING DISCLAIMER */}
            <div className="flex items-center gap-2 border-b border-xeoo-border bg-xeoo-surface-soft px-3.5 py-2.5 text-[11px] text-xeoo-text-soft">
              <Info size={14} className="shrink-0 text-xeoo-primary" />
              <span>
                <strong className="font-semibold text-xeoo-text">Pricing Reference:</strong> Preset rates reflect official public prices as of <em>{PRICING_LAST_UPDATED}</em>. You can customize the exact rates per 1M tokens below anytime.
              </span>
            </div>

            {/* WORKSPACE */}
            <div className="grid grid-cols-1 gap-4 p-3.5 sm:p-5 lg:grid-cols-12">
              {/* LEFT: INPUTS */}
              <div className="space-y-4 lg:col-span-6">
                <div>
                  <label className="text-xs font-bold text-xeoo-text">Model Preset</label>
                  <select
                    value={selectedModelId}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-3 text-[11px] font-medium text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {MODEL_PRESETS.map((m) => (
                      <option key={m.id} value={m.id} className="bg-xeoo-surface text-xeoo-text">
                        {m.name} ({m.provider})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-xeoo-text">Input Tokens / Req</label>
                    <input
                      type="number"
                      min={0}
                      value={inputTokens}
                      onChange={(e) => setInputTokens(Math.max(0, Number(e.target.value) || 0))}
                      className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 font-mono text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-xeoo-text">Output Tokens / Req</label>
                    <input
                      type="number"
                      min={0}
                      value={outputTokens}
                      onChange={(e) => setOutputTokens(Math.max(0, Number(e.target.value) || 0))}
                      className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 font-mono text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* RATE INPUTS */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted block">
                    Pricing Rate Configuration ($ per 1 Million Tokens)
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-xeoo-muted block">Input Price / 1M</span>
                      <div className="mt-1 flex items-center rounded-md border border-xeoo-border bg-xeoo-surface px-2 py-1">
                        <span className="text-xs text-xeoo-muted">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          value={inputPricePerM}
                          onChange={(e) => {
                            setSelectedModelId("custom");
                            setInputPricePerM(Math.max(0, Number(e.target.value) || 0));
                          }}
                          className="w-full bg-transparent pl-1 font-mono text-xs text-xeoo-text focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-xeoo-muted block">Output Price / 1M</span>
                      <div className="mt-1 flex items-center rounded-md border border-xeoo-border bg-xeoo-surface px-2 py-1">
                        <span className="text-xs text-xeoo-muted">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          value={outputPricePerM}
                          onChange={(e) => {
                            setSelectedModelId("custom");
                            setOutputPricePerM(Math.max(0, Number(e.target.value) || 0));
                          }}
                          className="w-full bg-transparent pl-1 font-mono text-xs text-xeoo-text focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-xeoo-text">Estimated Volume (Calls / Day)</label>
                  <input
                    type="number"
                    min={1}
                    value={dailyRequests}
                    onChange={(e) => setDailyRequests(Math.max(1, Number(e.target.value) || 1))}
                    className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 font-mono text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  />
                  <span className="text-[10px] text-xeoo-muted mt-0.5 block">
                    Total: ~{(dailyRequests * 30).toLocaleString()} requests/month
                  </span>
                </div>
              </div>

              {/* RIGHT: PROJECTED COST BREAKDOWN */}
              <div className="space-y-4 lg:col-span-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-xeoo-text">Projected Expenses</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex h-7 items-center gap-1.5 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-medium text-xeoo-text shadow-xs transition hover:bg-xeoo-surface-soft"
                  >
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copied ? "Copied" : "Copy Projection"}</span>
                  </button>
                </div>

                {/* HERO CARD: COST PER REQUEST */}
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-4 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-xeoo-muted">
                    Cost per Single Request
                  </span>
                  <div className="mt-1 text-3xl font-extrabold text-xeoo-text font-mono sm:text-4xl">
                    ${result.costTotalPerCall < 0.0001 ? result.costTotalPerCall.toFixed(6) : result.costTotalPerCall.toFixed(4)}
                  </div>
                  <div className="flex justify-center gap-4 mt-2 text-[11px] text-xeoo-muted">
                    <span>Input: ${result.costInputPerCall.toFixed(6)}</span>
                    <span>•</span>
                    <span>Output: ${result.costOutputPerCall.toFixed(6)}</span>
                  </div>
                </div>

                {/* VOLUME PROJECTIONS */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg border border-xeoo-border bg-xeoo-surface p-3">
                    <div>
                      <span className="text-xs font-bold text-xeoo-text block">Daily Total</span>
                      <span className="text-[10px] text-xeoo-muted">({dailyRequests.toLocaleString()} calls/day)</span>
                    </div>
                    <span className="font-mono text-base font-extrabold text-xeoo-text">
                      ${result.costDaily.toFixed(4)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-xeoo-border bg-xeoo-surface p-3">
                    <div>
                      <span className="text-xs font-bold text-xeoo-text block">Monthly Estimated Total</span>
                      <span className="text-[10px] text-xeoo-muted">(30-day projection)</span>
                    </div>
                    <span className="font-mono text-lg font-extrabold text-xeoo-primary">
                      ${result.costMonthly.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-xeoo-border bg-xeoo-surface p-3">
                    <div>
                      <span className="text-xs font-bold text-xeoo-text block">Annual Projected Total</span>
                      <span className="text-[10px] text-xeoo-muted">(365-day projection)</span>
                    </div>
                    <span className="font-mono text-base font-extrabold text-xeoo-text">
                      ${result.costAnnual.toFixed(2)}
                    </span>
                  </div>
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

