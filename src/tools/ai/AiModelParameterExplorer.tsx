import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Info,
  RotateCcw,
  Sliders,
} from "lucide-react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showSuccess, showError } from "../../alert";
import {
  getBehaviorDescription,
  PARAMETER_PRESETS,
  type ParameterConfig,
} from "./aiModelParameterExplorerLogic";

export default function AiModelParameterExplorer() {
  const [config, setConfig] = useState<ParameterConfig>(PARAMETER_PRESETS[0].config);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "AI Model Parameter Explorer | XeooTools";
    const canonicalId = "canonical-ai-model-parameter-explorer";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      link.href = "https://xeootools.site.je/tools/ai-model-parameter-explorer";
      document.head.appendChild(link);
    }
    return () => {
      link?.remove();
    };
  }, []);

  const behavior = getBehaviorDescription(config);

  const handleApplyPreset = (presetId: string) => {
    const preset = PARAMETER_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setConfig(preset.config);
    }
  };

  const handleCopyJson = async () => {
    try {
      const json = JSON.stringify(config, null, 2);
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      void showSuccess("Copied", "Parameter JSON config copied to clipboard.");
    } catch {
      void showError("Copy Error", "Failed to copy JSON.");
    }
  };

  const handleReset = () => {
    setConfig(PARAMETER_PRESETS[0].config);
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
                  <Sliders size={16} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold tracking-tight text-xeoo-text sm:text-sm">
                    AI MODEL PARAMETER EXPLORER
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Explore generation hyperparameters (Temperature, Top-P, Penalties, Max Tokens) and their behavioral effects.
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

            {/* PRESET CHIPS */}
            <div className="border-b border-xeoo-border bg-xeoo-surface-soft/40 px-3.5 py-2 sm:px-4 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted mr-1">
                Presets:
              </span>
              {PARAMETER_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleApplyPreset(p.id)}
                  className="rounded border border-xeoo-border bg-xeoo-surface px-2 py-0.5 text-[11px] font-medium text-xeoo-text hover:bg-xeoo-surface-soft"
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* MANDATORY DISCLAIMER (Rule 23) */}
            <div className="flex items-center gap-2 border-b border-xeoo-border bg-amber-500/5 px-3.5 py-2 text-[11px] text-amber-800 dark:text-amber-300">
              <Info size={14} className="shrink-0 text-amber-500" />
              <span>
                <strong>Educational Simulation:</strong> Parameters influence probabilistic token sampling distributions. Individual model architectures (e.g. Anthropic vs OpenAI vs open-weights) may scale sampling temperatures slightly differently.
              </span>
            </div>

            {/* WORKSPACE */}
            <div className="grid grid-cols-1 gap-4 p-3.5 sm:p-5 lg:grid-cols-12">
              {/* LEFT: SLIDERS & CONTROLS */}
              <div className="space-y-4 lg:col-span-7">
                {/* TEMPERATURE */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-xeoo-text">Temperature</span>
                      <span className="text-[11px] text-xeoo-muted ml-2">Controls randomness & sharpness</span>
                    </div>
                    <span className="font-mono text-xs font-extrabold text-xeoo-primary">{config.temperature.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="2.0"
                    step="0.05"
                    value={config.temperature}
                    onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-xeoo-primary"
                  />
                  <div className="flex justify-between text-[10px] text-xeoo-muted font-mono">
                    <span>0.0 (Strict / Greedy)</span>
                    <span>1.0 (Balanced)</span>
                    <span>2.0 (High Variance)</span>
                  </div>
                </div>

                {/* TOP P */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-xeoo-text">Top P (Nucleus Sampling)</span>
                      <span className="text-[11px] text-xeoo-muted ml-2">Cumulative probability cutoff</span>
                    </div>
                    <span className="font-mono text-xs font-extrabold text-xeoo-primary">{config.topP.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={config.topP}
                    onChange={(e) => setConfig({ ...config, topP: parseFloat(e.target.value) })}
                    className="w-full accent-xeoo-primary"
                  />
                  <div className="flex justify-between text-[10px] text-xeoo-muted font-mono">
                    <span>0.1 (Top tokens only)</span>
                    <span>0.5 (Median)</span>
                    <span>1.0 (Entire vocabulary)</span>
                  </div>
                </div>

                {/* MAX TOKENS */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-xeoo-text">Max Tokens</span>
                      <span className="text-[11px] text-xeoo-muted ml-2">Upper ceiling for generated response</span>
                    </div>
                    <span className="font-mono text-xs font-extrabold text-xeoo-primary">{config.maxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="128"
                    max="16384"
                    step="128"
                    value={config.maxTokens}
                    onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                    className="w-full accent-xeoo-primary"
                  />
                  <div className="flex justify-between text-[10px] text-xeoo-muted font-mono">
                    <span>128</span>
                    <span>4,096</span>
                    <span>16,384</span>
                  </div>
                </div>

                {/* PENALTIES GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-xeoo-text">Frequency Penalty</span>
                      <span className="font-mono text-xs font-extrabold text-xeoo-text">{config.frequencyPenalty.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="-2.0"
                      max="2.0"
                      step="0.1"
                      value={config.frequencyPenalty}
                      onChange={(e) => setConfig({ ...config, frequencyPenalty: parseFloat(e.target.value) })}
                      className="w-full accent-xeoo-primary"
                    />
                    <span className="text-[10px] text-xeoo-muted block">Reduces verbatim word repetition</span>
                  </div>

                  <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-xeoo-text">Presence Penalty</span>
                      <span className="font-mono text-xs font-extrabold text-xeoo-text">{config.presencePenalty.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="-2.0"
                      max="2.0"
                      step="0.1"
                      value={config.presencePenalty}
                      onChange={(e) => setConfig({ ...config, presencePenalty: parseFloat(e.target.value) })}
                      className="w-full accent-xeoo-primary"
                    />
                    <span className="text-[10px] text-xeoo-muted block">Encourages introducing novel subjects</span>
                  </div>
                </div>
              </div>

              {/* RIGHT: BEHAVIOR INTERPRETATION & JSON EXPORT */}
              <div className="space-y-4 lg:col-span-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-xeoo-text">Behavior Analysis</span>
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="inline-flex items-center gap-1 rounded bg-xeoo-surface-soft border border-xeoo-border px-2 py-1 text-[11px] font-medium text-xeoo-text hover:bg-xeoo-surface"
                  >
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copied ? "Copied" : "Copy JSON"}</span>
                  </button>
                </div>

                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3.5 space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted block">
                    Expected Model Posture
                  </span>

                  <div className="rounded border border-xeoo-border bg-xeoo-surface p-2.5 space-y-1">
                    <span className="text-xs font-bold text-xeoo-text block">Temperature Effect:</span>
                    <p className="text-[11px] text-xeoo-muted leading-relaxed">{behavior.temperatureSummary}</p>
                  </div>

                  <div className="rounded border border-xeoo-border bg-xeoo-surface p-2.5 space-y-1">
                    <span className="text-xs font-bold text-xeoo-text block">Sampling Cutoff:</span>
                    <p className="text-[11px] text-xeoo-muted leading-relaxed">{behavior.topPSummary}</p>
                  </div>

                  <div className="rounded border border-xeoo-border bg-xeoo-surface p-2.5 space-y-1">
                    <span className="text-xs font-bold text-xeoo-text block">Repetition Dynamics:</span>
                    <p className="text-[11px] text-xeoo-muted leading-relaxed">{behavior.penaltiesSummary}</p>
                  </div>
                </div>

                {/* RAW CONFIG JSON PREVIEW */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-xeoo-muted block mb-1">
                    API Parameters Payload (JSON)
                  </span>
                  <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-xeoo-text select-all bg-xeoo-surface-soft p-3 rounded-md border border-xeoo-border">
                    {JSON.stringify(config, null, 2)}
                  </pre>
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

