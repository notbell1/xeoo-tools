import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Globe,
  ImageIcon,
  Info,
  LoaderCircle,
  RotateCcw,
  Share2,
  XCircle,
} from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showError, showSuccess } from "../../alert";
import {
  checkOpenGraph,
  type OpenGraphAnalysisData,
} from "./openGraphCheckerLogic";

export default function OpenGraphChecker() {
  const [urlInput, setUrlInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "completed" | "error">("idle");
  const [result, setResult] = useState<OpenGraphAnalysisData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [previewTab, setPreviewTab] = useState<"general" | "twitter">("general");
  const [copied, setCopied] = useState(false);

  const inputId = useId();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Set document title & canonical
  useEffect(() => {
    document.title = "Open Graph Checker | XeooTools";
    const canonicalId = "canonical-og-checker";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      link.href = "https://xeootools.site.je/tools/open-graph-checker";
      document.head.appendChild(link);
    }
    return () => {
      abortControllerRef.current?.abort();
      link?.remove();
    };
  }, []);

  const handleCheck = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMsg("Please enter a website URL.");
      void showError("Validation Error", "Please enter a website URL.");
      return;
    }

    setErrorMsg("");
    setStatus("loading");
    setResult(null);

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      const data = await checkOpenGraph(trimmed, abortControllerRef.current.signal);
      setResult(data);
      setStatus("completed");
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      const msg = err instanceof Error ? err.message : "Failed to fetch Open Graph metadata.";
      setErrorMsg(msg);
      setStatus("error");
      void showError("Check Failed", msg);
    }
  };

  const handleReset = () => {
    abortControllerRef.current?.abort();
    setUrlInput("");
    setStatus("idle");
    setResult(null);
    setErrorMsg("");
  };

  const handleCopyTags = async () => {
    if (!result) return;
    const tagSummary = result.tags
      .map((t) => `${t.property}: ${t.value || "<Missing>"}`)
      .join("\n");

    try {
      await navigator.clipboard.writeText(tagSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      void showSuccess("Copied", "Open Graph tags copied to clipboard.");
    } catch {
      void showError("Copy Failed", "Failed to copy tags.");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-xeoo-bg text-xeoo-text">
      <Header />

      <main className="flex-1 px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto w-full max-w-5xl space-y-3">
          {/* WORKSPACE HEADER */}
          <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
            <div className="flex items-center justify-between gap-3 border-b border-xeoo-border px-3 py-2.5 sm:px-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-xeoo-primary-soft text-xeoo-primary">
                  <Share2 size={16} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold text-xeoo-text sm:text-sm">
                    OPEN GRAPH CHECKER
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Validate Open Graph and Twitter Card tags to ensure attractive social media previews.
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold ${
                  status === "loading"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    : status === "completed"
                    ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                    : status === "error"
                    ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                    : "bg-xeoo-surface-soft text-xeoo-muted border border-xeoo-border"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    status === "loading"
                      ? "bg-amber-500 animate-pulse"
                      : status === "completed"
                      ? "bg-green-500"
                      : status === "error"
                      ? "bg-red-500"
                      : "bg-xeoo-muted"
                  }`}
                />
                {status === "loading"
                  ? "Checking..."
                  : status === "completed"
                  ? "Completed"
                  : status === "error"
                  ? "Error"
                  : "Ready"}
              </span>
            </div>

            {/* FORM INPUT */}
            <div className="p-3 sm:p-4">
              <form onSubmit={handleCheck} noValidate className="space-y-3">
                <div>
                  <label
                    htmlFor={inputId}
                    className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted"
                  >
                    Target Website URL
                  </label>
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                    <div className="relative min-w-0 flex-1">
                      <Globe
                        size={15}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xeoo-muted"
                      />
                      <input
                        id={inputId}
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="example.com or https://example.com"
                        disabled={status === "loading"}
                        className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-2 pl-9 pr-3 text-xs text-xeoo-text placeholder-xeoo-muted transition focus:border-xeoo-primary focus:outline-hidden focus:ring-1 focus:ring-xeoo-primary"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-xeoo-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {status === "loading" ? (
                          <>
                            <LoaderCircle size={14} className="animate-spin" />
                            <span>Checking...</span>
                          </>
                        ) : (
                          <>
                            <span>Inspect Tags</span>
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>

                      {(result || urlInput) && (
                        <button
                          type="button"
                          onClick={handleReset}
                          disabled={status === "loading"}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-2 text-xs font-medium text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                          title="Reset form"
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-2.5 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </form>
            </div>
          </section>

          {/* RESULTS DISPLAY */}
          {result && (
            <div className="space-y-3">
              {/* SOCIAL SHARE PREVIEW CARD */}
              <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
                <div className="flex items-center justify-between border-b border-xeoo-border px-3 py-2.5 sm:px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                      Social Share Preview
                    </span>
                  </div>

                  <div className="flex items-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-0.5">
                    <button
                      type="button"
                      onClick={() => setPreviewTab("general")}
                      className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${
                        previewTab === "general"
                          ? "bg-xeoo-surface text-xeoo-text shadow-xs"
                          : "text-xeoo-muted hover:text-xeoo-text"
                      }`}
                    >
                      General / Facebook
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab("twitter")}
                      className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${
                        previewTab === "twitter"
                          ? "bg-xeoo-surface text-xeoo-text shadow-xs"
                          : "text-xeoo-muted hover:text-xeoo-text"
                      }`}
                    >
                      Twitter Card
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6 bg-slate-50 dark:bg-[#15181e] flex justify-center">
                  {/* Card Container */}
                  <div className="w-full max-w-md overflow-hidden rounded-2xl border border-xeoo-border bg-white dark:bg-[#1e232d] shadow-sm">
                    {/* Thumbnail Image */}
                    {result.preview.image ? (
                      <div className="relative aspect-[1.91/1] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                        <img
                          src={result.preview.image}
                          alt={result.preview.title}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[1.91/1] w-full flex-col items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800">
                        <ImageIcon size={32} strokeWidth={1.5} />
                        <span className="mt-1 text-xs">No preview image found</span>
                      </div>
                    )}

                    {/* Metadata Content */}
                    <div className="p-3.5 space-y-1">
                      <span className="block text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                        {result.preview.site_name || new URL(result.url).hostname}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {result.preview.title || "Untitled Page"}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {result.preview.description || "No description provided."}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* DETAILED TAG AUDIT TABLE */}
              <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
                <div className="flex items-center justify-between border-b border-xeoo-border px-3 py-2.5 sm:px-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                    Detected Metadata Tags ({result.tags.filter((t) => t.status === "Present").length} / {result.tags.length})
                  </h3>

                  <button
                    type="button"
                    onClick={handleCopyTags}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-xs font-semibold text-xeoo-text transition hover:bg-xeoo-surface-soft"
                  >
                    {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                    <span>{copied ? "Copied" : "Copy Tags"}</span>
                  </button>
                </div>

                <div className="divide-y divide-xeoo-border">
                  {result.tags.map((tag) => (
                    <div
                      key={tag.property}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 text-xs gap-1.5"
                    >
                      <div className="min-w-0 sm:w-1/3">
                        <span className="font-mono font-semibold text-xeoo-text">
                          {tag.property}
                        </span>
                        {tag.required && (
                          <span className="ml-1 text-[10px] text-amber-500 font-bold">
                            *Core
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {tag.status === "Present" ? (
                          <span className="font-mono text-[11px] text-xeoo-muted break-all">
                            {tag.value}
                          </span>
                        ) : (
                          <span className="text-[11px] text-red-500 italic">
                            Tag missing from page
                          </span>
                        )}
                      </div>

                      <div className="shrink-0 self-start sm:self-center">
                        {tag.status === "Present" ? (
                          <span className="inline-flex items-center gap-1 rounded bg-green-500/10 px-2 py-0.5 text-[11px] font-bold text-green-600 dark:text-green-400">
                            <CheckCircle2 size={12} />
                            Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 text-[11px] font-bold text-red-600 dark:text-red-400">
                            <XCircle size={12} />
                            Missing
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* DISCLAIMER / INFO */}
          <section className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 text-xs text-xeoo-muted shadow-xs">
            <div className="flex items-start gap-2">
              <Info size={15} className="mt-0.5 shrink-0 text-xeoo-primary" />
              <div className="space-y-1 text-[11px] leading-relaxed">
                <p className="font-semibold text-xeoo-text">Open Graph Protocols Notice</p>
                <p>
                  This tool inspects the live metadata defined on the page. Major platforms like Facebook, Twitter, WhatsApp, and LinkedIn independently cache preview metadata. If you update your tags, you may need to use each platform's debugger tool to refresh their cached card.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

