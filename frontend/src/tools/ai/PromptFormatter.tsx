import { useEffect, useState } from "react";
import {
  AlignLeft,
  Check,
  Copy,
  Info,
  RotateCcw,
} from "lucide-react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showSuccess, showError } from "../../alert";
import {
  formatPrompt,
  type FormatterOptions,
  type FormattedPromptResult,
} from "./promptFormatterLogic";

const SAMPLE_MESSY_PROMPT = `Role:    Senior Python Developer  

Task:    write a script   to parse a csv file    
• read the file from disk
* calculate column averages   
• output the result in json    

Constraints:
must use python 3.12 
do not use heavy pandas library if standard csv library suffices.`;

export default function PromptFormatter() {
  const [inputPrompt, setInputPrompt] = useState(SAMPLE_MESSY_PROMPT);
  const [options, setOptions] = useState<FormatterOptions>({
    normalizeWhitespace: true,
    normalizeNewlines: true,
    standardizeLists: true,
    normalizeHeadings: true,
    xmlTagStyle: false,
  });
  const [result, setResult] = useState<FormattedPromptResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Prompt Formatter | XeooTools";
    const canonicalId = "canonical-prompt-formatter";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      link.href = "https://xeootools.site.je/tools/prompt-formatter";
      document.head.appendChild(link);
    }
    return () => {
      link?.remove();
    };
  }, []);

  useEffect(() => {
    setResult(formatPrompt(inputPrompt, options));
  }, [inputPrompt, options]);

  const handleCopy = async () => {
    if (!result?.formattedText) return;
    try {
      await navigator.clipboard.writeText(result.formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      void showSuccess("Copied", "Formatted prompt copied to clipboard.");
    } catch {
      void showError("Copy Error", "Failed to copy text to clipboard.");
    }
  };

  const handleReset = () => {
    setInputPrompt("");
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
                  <AlignLeft size={16} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold tracking-tight text-xeoo-text sm:text-sm">
                    PROMPT FORMATTER
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Clean whitespace, standardize indentation, and format headings without altering semantic meaning.
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
                <strong className="font-semibold text-xeoo-text">Pure Structural Formatting:</strong> Cleans up messy text, bullet points, and headers while 100% preserving your exact instructions and requirements.
              </span>
            </div>

            {/* WORKSPACE */}
            <div className="grid grid-cols-1 gap-4 p-3.5 sm:p-5 lg:grid-cols-12">
              {/* LEFT: INPUT & OPTIONS */}
              <div className="space-y-4 lg:col-span-6">
                <div>
                  <label htmlFor="messy-input" className="block text-xs font-bold text-xeoo-text mb-1">
                    Unformatted Prompt
                  </label>
                  <textarea
                    id="messy-input"
                    rows={8}
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    placeholder="Paste your unformatted or cluttered prompt here..."
                    className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg p-2.5 font-mono text-xs text-xeoo-text placeholder:text-xeoo-muted/60 focus:border-xeoo-primary focus:outline-none"
                  />
                </div>

                {/* FORMATTING OPTIONS */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted block">
                    Cleaning Directives
                  </span>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-xeoo-text">
                    <input
                      type="checkbox"
                      checked={options.normalizeWhitespace}
                      onChange={(e) => setOptions({ ...options, normalizeWhitespace: e.target.checked })}
                      className="rounded border-xeoo-border text-xeoo-primary focus:ring-xeoo-primary"
                    />
                    <span>Collapse redundant inline spaces & trim trailing whitespace</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-xeoo-text">
                    <input
                      type="checkbox"
                      checked={options.normalizeNewlines}
                      onChange={(e) => setOptions({ ...options, normalizeNewlines: e.target.checked })}
                      className="rounded border-xeoo-border text-xeoo-primary focus:ring-xeoo-primary"
                    />
                    <span>Collapse multiple empty lines into clean paragraph breaks</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-xeoo-text">
                    <input
                      type="checkbox"
                      checked={options.standardizeLists}
                      onChange={(e) => setOptions({ ...options, standardizeLists: e.target.checked })}
                      className="rounded border-xeoo-border text-xeoo-primary focus:ring-xeoo-primary"
                    />
                    <span>Standardize mixed bullet markers (e.g. •, * to uniform -)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-xeoo-text">
                    <input
                      type="checkbox"
                      checked={options.normalizeHeadings}
                      onChange={(e) => setOptions({ ...options, normalizeHeadings: e.target.checked })}
                      className="rounded border-xeoo-border text-xeoo-primary focus:ring-xeoo-primary"
                    />
                    <span>Convert section labels (Role:, Task:) to Markdown headings (###)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-xeoo-text">
                    <input
                      type="checkbox"
                      checked={options.xmlTagStyle}
                      onChange={(e) => setOptions({ ...options, xmlTagStyle: e.target.checked })}
                      className="rounded border-xeoo-border text-xeoo-primary focus:ring-xeoo-primary"
                    />
                    <span>Wrap prompt in {"<instructions>"} XML block tags (Claude/Anthropic style)</span>
                  </label>
                </div>

                {/* STATS COMPARISON */}
                {result && (
                  <div className="grid grid-cols-3 gap-2 rounded-lg border border-xeoo-border bg-xeoo-surface p-3 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-xeoo-muted block">Characters</span>
                      <span className="font-mono text-xs font-bold text-xeoo-text">
                        {result.stats.charsBefore} → {result.stats.charsAfter}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-xeoo-muted block">Words</span>
                      <span className="font-mono text-xs font-bold text-xeoo-text">
                        {result.stats.wordsBefore} → {result.stats.wordsAfter}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-xeoo-muted block">Lines</span>
                      <span className="font-mono text-xs font-bold text-xeoo-text">
                        {result.stats.linesBefore} → {result.stats.linesAfter}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: OUTPUT */}
              <div className="flex flex-col space-y-3 lg:col-span-6">
                <div className="flex items-center justify-between border-b border-xeoo-border pb-2">
                  <span className="text-xs font-bold text-xeoo-text">Clean Formatted Output</span>
                  {result?.formattedText && (
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

                <div className="min-h-80 flex-1 rounded-lg border border-xeoo-border bg-xeoo-surface p-3.5">
                  {!inputPrompt.trim() ? (
                    <div className="flex h-full flex-col items-center justify-center text-center text-xeoo-muted py-12">
                      <p className="text-xs font-semibold text-xeoo-text">Nothing to format</p>
                      <p className="text-[11px] text-xeoo-muted">Paste your prompt on the left to see clean output.</p>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-xeoo-text select-all bg-xeoo-surface-soft p-3 rounded-md border border-xeoo-border overflow-y-auto max-h-[500px]">
                      {result?.formattedText}
                    </pre>
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

