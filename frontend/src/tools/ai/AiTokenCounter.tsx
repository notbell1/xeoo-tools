import { useEffect, useState } from "react";
import {
  Binary,
  Check,
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

export default function AiTokenCounter() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [profile, setProfile] = useState<TokenizerProfile>("gpt_o200k");
  const [stats, setStats] = useState<TokenStats>(() => estimateTokens(SAMPLE_TEXT, "gpt_o200k"));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "AI Token Counter | XeooTools";
    const canonicalId = "canonical-ai-token-counter";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      link.href = "https://xeootools.site.je/tools/ai-token-counter";
      document.head.appendChild(link);
    }
    return () => {
      link?.remove();
    };
  }, []);

  useEffect(() => {
    setStats(estimateTokens(text, profile));
  }, [text, profile]);

  const handleCopyStats = async () => {
    const summary = `Estimated Tokens: ${stats.estimatedTokens}\nCharacters: ${stats.charsTotal}\nWords: ${stats.wordCount}\nLines: ${stats.lineCount}\nProfile: ${profile}`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      void showSuccess("Copied", "Token statistics summary copied to clipboard.");
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
                    Estimate token counts, character density, and text capacity across model tokenizers.
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

            {/* MANDATORY DISCLAIMER (Rule 21) */}
            <div className="flex items-center gap-2 border-b border-xeoo-border bg-amber-500/5 px-3.5 py-2 text-[11px] text-amber-800 dark:text-amber-300">
              <Info size={14} className="shrink-0 text-amber-500" />
              <span>
                <strong>Heuristic Estimation Notice:</strong> Token counts are estimates calculated locally in browser. Exact token counts may vary slightly by tokenizer vocabulary (Byte-Pair Encoding).
              </span>
            </div>

            {/* WORKSPACE */}
            <div className="grid grid-cols-1 gap-4 p-3.5 sm:p-5 lg:grid-cols-12">
              {/* LEFT: TEXTAREA & PROFILE */}
              <div className="space-y-3.5 lg:col-span-7">
                <div className="flex items-center justify-between">
                  <label htmlFor="token-text" className="text-xs font-bold text-xeoo-text">
                    Input Prompt or Document
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-xeoo-muted">Profile:</span>
                    <select
                      value={profile}
                      onChange={(e) => setProfile(e.target.value as TokenizerProfile)}
                      className="rounded border border-xeoo-border bg-xeoo-surface px-2 py-1 text-xs text-xeoo-text focus:outline-none"
                    >
                      <option value="gpt_o200k">GPT-4o / o1 (o200k_base)</option>
                      <option value="gpt_cl100k">GPT-4 / GPT-3.5 (cl100k_base)</option>
                      <option value="claude">Claude 3.5 / 3 (Anthropic)</option>
                      <option value="llama3">Llama 3 / 3.1 (128k BPE)</option>
                    </select>
                  </div>
                </div>

                <textarea
                  id="token-text"
                  rows={10}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste or type text to calculate tokens..."
                  className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg p-3 font-mono text-xs text-xeoo-text placeholder:text-xeoo-muted/60 focus:border-xeoo-primary focus:outline-none"
                />
              </div>

              {/* RIGHT: METRICS TILES */}
              <div className="space-y-3.5 lg:col-span-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-xeoo-text">Analysis Metrics</span>
                  <button
                    type="button"
                    onClick={handleCopyStats}
                    className="inline-flex items-center gap-1 rounded bg-xeoo-surface-soft border border-xeoo-border px-2 py-1 text-[11px] font-medium text-xeoo-text hover:bg-xeoo-surface"
                  >
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copied ? "Copied" : "Copy Stats"}</span>
                  </button>
                </div>

                {/* PRIMARY ESTIMATED TOKENS HERO CARD */}
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-4 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-xeoo-muted">
                    Estimated Tokens
                  </span>
                  <div className="mt-1 text-3xl font-extrabold text-xeoo-primary font-mono sm:text-4xl">
                    {stats.estimatedTokens.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-xeoo-muted block mt-1">
                    ~{stats.charsPerToken} characters per token
                  </span>
                </div>

                {/* DETAILED STATS GRID */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5">
                    <span className="text-[10px] uppercase font-bold text-xeoo-muted block">Total Characters</span>
                    <span className="font-mono text-base font-bold text-xeoo-text">
                      {stats.charsTotal.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-xeoo-muted block">({stats.charsNoSpaces} without spaces)</span>
                  </div>

                  <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5">
                    <span className="text-[10px] uppercase font-bold text-xeoo-muted block">Word Count</span>
                    <span className="font-mono text-base font-bold text-xeoo-text">
                      {stats.wordCount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-xeoo-muted block">words</span>
                  </div>

                  <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5">
                    <span className="text-[10px] uppercase font-bold text-xeoo-muted block">Lines & Paragraphs</span>
                    <span className="font-mono text-base font-bold text-xeoo-text">
                      {stats.lineCount} / {stats.paragraphCount}
                    </span>
                    <span className="text-[10px] text-xeoo-muted block">lines / paragraphs</span>
                  </div>

                  <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5">
                    <span className="text-[10px] uppercase font-bold text-xeoo-muted block">Estimated Reading</span>
                    <span className="font-mono text-base font-bold text-xeoo-text">
                      ~{stats.estimatedReadingTimeSec < 60 ? `${stats.estimatedReadingTimeSec}s` : `${Math.ceil(stats.estimatedReadingTimeSec / 60)}m`}
                    </span>
                    <span className="text-[10px] text-xeoo-muted block">at 200 WPM</span>
                  </div>
                </div>

                {/* CONTEXT PERCENTAGE BARS EXAMPLES */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-3 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted block">
                    Context Window Usage Comparison
                  </span>

                  {[
                    { name: "8k Window (GPT-4 8k / Small)", max: 8192 },
                    { name: "32k Window (Llama 3)", max: 32768 },
                    { name: "128k Window (GPT-4o)", max: 128000 },
                    { name: "200k Window (Claude 3.5)", max: 200000 },
                  ].map((win) => {
                    const pct = Math.min(100, Math.round((stats.estimatedTokens / win.max) * 1000) / 10);
                    return (
                      <div key={win.name} className="space-y-0.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-xeoo-text font-medium">{win.name}</span>
                          <span className="text-xeoo-muted font-mono">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-xeoo-surface-soft border border-xeoo-border">
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

