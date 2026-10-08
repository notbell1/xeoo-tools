import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Globe,
  Heading,
  Image,
  Info,
  Link2,
  LoaderCircle,
  RotateCcw,
  Search,
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
  analyzeMetaTags,
  validateUrlInput,
  type MetaTagAnalysisData,
} from "./metaTagAnalyzerLogic";

export default function MetaTagAnalyzer() {
  const [urlInput, setUrlInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "completed" | "error">("idle");
  const [result, setResult] = useState<MetaTagAnalysisData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const inputId = useId();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Set document title & canonical
  useEffect(() => {
    document.title = "Meta Tag Analyzer | XeooTools";
    const canonicalId = "canonical-meta-tag-analyzer";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      link.href = "https://xeootools.site.je/tools/meta-tag-analyzer";
      document.head.appendChild(link);
    }
    return () => {
      abortControllerRef.current?.abort();
      link?.remove();
    };
  }, []);

  const handleAnalyze = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    const validation = validateUrlInput(urlInput);
    if (!validation.valid) {
      setErrorMsg(validation.error || "Please enter a valid URL.");
      void showError("Validation Error", validation.error || "Please enter a valid URL.");
      return;
    }

    setErrorMsg("");
    setStatus("loading");
    setResult(null);

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      const data = await analyzeMetaTags(urlInput, abortControllerRef.current.signal);
      setResult(data);
      setStatus("completed");
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      const msg = err instanceof Error ? err.message : "Failed to analyze target website.";
      setErrorMsg(msg);
      setStatus("error");
      void showError("Analysis Error", msg);
    }
  };

  const handleReset = () => {
    abortControllerRef.current?.abort();
    setUrlInput("");
    setStatus("idle");
    setResult(null);
    setErrorMsg("");
  };

  const handleCopySummary = async () => {
    if (!result) return;
    const summary = [
      `XeooTools Meta Tag Analysis for: ${result.url}`,
      `SEO Check Score: ${result.seo_score}/100`,
      `Title (${result.basic_seo.title.status}): ${result.basic_seo.title.value || "None"} (${result.basic_seo.title.length || 0} chars)`,
      `Description (${result.basic_seo.description.status}): ${result.basic_seo.description.value || "None"} (${result.basic_seo.description.length || 0} chars)`,
      `Canonical: ${result.basic_seo.canonical.value || "None"}`,
      `Headings: H1: ${result.headings.h1_count}, H2: ${result.headings.h2_count}, H3: ${result.headings.h3_count}`,
      `Images: ${result.images.total} total (${result.images.with_alt} with alt, ${result.images.without_alt} missing alt)`,
      `Open Graph: ${result.open_graph.status}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      void showSuccess("Copied", "SEO summary copied to clipboard.");
    } catch {
      void showError("Copy Failed", "Failed to copy summary to clipboard.");
    }
  };

  const renderBadge = (statusVal: "Good" | "Warning" | "Missing") => {
    if (statusVal === "Good") {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-green-500/10 px-2 py-0.5 text-[11px] font-bold text-green-600 dark:text-green-400">
          <CheckCircle2 size={12} />
          Good
        </span>
      );
    }
    if (statusVal === "Warning") {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
          <AlertTriangle size={12} />
          Warning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 text-[11px] font-bold text-red-600 dark:text-red-400">
        <XCircle size={12} />
        Missing
      </span>
    );
  };

  return (
    <div className="flex min-h-dvh flex-col bg-xeoo-bg text-xeoo-text">
      <Header />

      <main className="flex-1 px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto w-full max-w-5xl space-y-3">
          {/* TOOL WORKSPACE HEADER */}
          <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
            <div className="flex items-center justify-between gap-3 border-b border-xeoo-border px-3 py-2.5 sm:px-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-xeoo-primary-soft text-xeoo-primary">
                  <Search size={16} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold text-xeoo-text sm:text-sm">
                    META TAG ANALYZER
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Inspect on-page HTML metadata, title tags, descriptions, Open Graph, and social previews.
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
                  ? "Analyzing..."
                  : status === "completed"
                  ? "Completed"
                  : status === "error"
                  ? "Error"
                  : "Ready"}
              </span>
            </div>

            {/* FORM INPUT */}
            <div className="p-3 sm:p-4">
              <form onSubmit={handleAnalyze} noValidate className="space-y-3">
                <div>
                  <label
                    htmlFor={inputId}
                    className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted"
                  >
                    Target Website URL / Domain
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
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <span>Analyze</span>
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
              {/* TOP SCORE OVERVIEW */}
              <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface p-4 shadow-xs">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-primary">
                      {result.score_label}
                    </span>
                    <h2 className="text-base font-bold text-xeoo-text sm:text-lg">
                      SEO Overview for{" "}
                      <span className="font-mono text-xs text-xeoo-muted">{result.url}</span>
                    </h2>
                    <p className="text-xs text-xeoo-muted">
                      Evaluated on title tags, meta description length, headings, links, canonical, and social cards.
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-xeoo-border bg-xeoo-surface-soft px-6 py-2.5 text-center">
                      <span className="text-2xl font-black text-xeoo-text sm:text-3xl">
                        {result.seo_score}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-xeoo-muted">
                        Out of 100
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-2 text-xs font-semibold text-xeoo-text transition hover:bg-xeoo-surface-soft"
                    >
                      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      <span>{copied ? "Copied" : "Copy Summary"}</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* BASIC SEO AUDIT */}
              <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
                <div className="border-b border-xeoo-border px-3 py-2.5 sm:px-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                    Core Meta Tags
                  </h3>
                </div>

                <div className="divide-y divide-xeoo-border p-3 sm:p-4 text-xs">
                  {/* Title */}
                  <div className="py-2.5 first:pt-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xeoo-text">Title Tag</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-xeoo-muted">
                          {result.basic_seo.title.length} characters
                        </span>
                        {renderBadge(result.basic_seo.title.status)}
                      </div>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-xeoo-muted break-all">
                      {result.basic_seo.title.value || "<Missing title tag>"}
                    </p>
                    {result.basic_seo.title.recommendation && (
                      <p className="mt-0.5 text-[11px] text-xeoo-muted italic">
                        {result.basic_seo.title.recommendation}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xeoo-text">Meta Description</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-xeoo-muted">
                          {result.basic_seo.description.length} characters
                        </span>
                        {renderBadge(result.basic_seo.description.status)}
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] text-xeoo-muted break-all">
                      {result.basic_seo.description.value || "<Missing meta description>"}
                    </p>
                    {result.basic_seo.description.recommendation && (
                      <p className="mt-0.5 text-[11px] text-xeoo-muted italic">
                        {result.basic_seo.description.recommendation}
                      </p>
                    )}
                  </div>

                  {/* Canonical */}
                  <div className="py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xeoo-text">Canonical URL</span>
                      {renderBadge(result.basic_seo.canonical.status)}
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-xeoo-muted break-all">
                      {result.basic_seo.canonical.value || "Not specified"}
                    </p>
                  </div>

                  {/* Robots & Others */}
                  <div className="grid gap-3 pt-2.5 sm:grid-cols-3">
                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2.5">
                      <span className="block text-[10px] font-bold uppercase text-xeoo-muted">
                        Robots Meta
                      </span>
                      <span className="mt-0.5 block font-mono text-xs text-xeoo-text">
                        {result.basic_seo.robots.value}
                      </span>
                    </div>

                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2.5">
                      <span className="block text-[10px] font-bold uppercase text-xeoo-muted">
                        Language
                      </span>
                      <span className="mt-0.5 block font-mono text-xs text-xeoo-text">
                        {result.basic_seo.language.value || "Not declared"}
                      </span>
                    </div>

                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2.5">
                      <span className="block text-[10px] font-bold uppercase text-xeoo-muted">
                        Charset
                      </span>
                      <span className="mt-0.5 block font-mono text-xs text-xeoo-text">
                        {result.basic_seo.charset.value || "Not declared"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* HEADINGS & CONTENT STRUCTURE */}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Headings */}
                <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
                  <div className="flex items-center justify-between border-b border-xeoo-border px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-xeoo-text">
                      <Heading size={14} className="text-xeoo-primary" />
                      <span>Headings Structure</span>
                    </div>
                    {renderBadge(result.headings.h1_status)}
                  </div>
                  <div className="p-3 text-xs space-y-2.5">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2">
                        <span className="block text-[10px] font-bold text-xeoo-muted">H1 Tags</span>
                        <span className="text-base font-bold text-xeoo-text">{result.headings.h1_count}</span>
                      </div>
                      <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2">
                        <span className="block text-[10px] font-bold text-xeoo-muted">H2 Tags</span>
                        <span className="text-base font-bold text-xeoo-text">{result.headings.h2_count}</span>
                      </div>
                      <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2">
                        <span className="block text-[10px] font-bold text-xeoo-muted">H3 Tags</span>
                        <span className="text-base font-bold text-xeoo-text">{result.headings.h3_count}</span>
                      </div>
                    </div>
                    {result.headings.h1_items.length > 0 && (
                      <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2 text-[11px]">
                        <span className="block font-bold text-xeoo-muted mb-1">H1 Heading:</span>
                        <p className="italic text-xeoo-text">"{result.headings.h1_items[0]}"</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Media & Links */}
                <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
                  <div className="flex items-center justify-between border-b border-xeoo-border px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-xeoo-text">
                      <Link2 size={14} className="text-xeoo-primary" />
                      <span>Links & Images</span>
                    </div>
                    {renderBadge(result.images.status)}
                  </div>
                  <div className="p-3 text-xs space-y-2.5">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2">
                        <span className="block text-[10px] font-bold text-xeoo-muted">Internal Links</span>
                        <span className="text-base font-bold text-xeoo-text">{result.links.internal_count}</span>
                      </div>
                      <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2">
                        <span className="block text-[10px] font-bold text-xeoo-muted">External Links</span>
                        <span className="text-base font-bold text-xeoo-text">{result.links.external_count}</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2 text-[11px] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Image size={13} className="text-xeoo-muted" />
                        <span>Images with ALT:</span>
                      </div>
                      <span className="font-semibold text-xeoo-text">
                        {result.images.with_alt} / {result.images.total}
                      </span>
                    </div>
                  </div>
                </section>
              </div>

              {/* SOCIAL METADATA (OPEN GRAPH & TWITTER) */}
              <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
                <div className="flex items-center justify-between border-b border-xeoo-border px-3 py-2.5 sm:px-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-xeoo-text">
                    <Share2 size={14} className="text-xeoo-primary" />
                    <span>Social Media Tags</span>
                  </div>
                  <div className="flex gap-2">
                    {renderBadge(result.open_graph.status)}
                  </div>
                </div>

                <div className="p-3 sm:p-4 text-xs space-y-2">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2.5 space-y-1">
                      <span className="block text-[10px] font-bold uppercase text-xeoo-primary">
                        Open Graph
                      </span>
                      <div className="space-y-0.5 text-[11px]">
                        <p><strong className="text-xeoo-muted">og:title:</strong> {result.open_graph.tags["og:title"] || "—"}</p>
                        <p><strong className="text-xeoo-muted">og:description:</strong> {result.open_graph.tags["og:description"] || "—"}</p>
                        <p><strong className="text-xeoo-muted">og:image:</strong> {result.open_graph.tags["og:image"] ? "Present" : "—"}</p>
                        <p><strong className="text-xeoo-muted">og:type:</strong> {result.open_graph.tags["og:type"] || "—"}</p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2.5 space-y-1">
                      <span className="block text-[10px] font-bold uppercase text-xeoo-primary">
                        Twitter Cards
                      </span>
                      <div className="space-y-0.5 text-[11px]">
                        <p><strong className="text-xeoo-muted">twitter:card:</strong> {result.twitter.tags["twitter:card"] || "—"}</p>
                        <p><strong className="text-xeoo-muted">twitter:title:</strong> {result.twitter.tags["twitter:title"] || "—"}</p>
                        <p><strong className="text-xeoo-muted">twitter:description:</strong> {result.twitter.tags["twitter:description"] || "—"}</p>
                        <p><strong className="text-xeoo-muted">twitter:image:</strong> {result.twitter.tags["twitter:image"] ? "Present" : "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* DISCLAIMER / INFO */}
          <section className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 text-xs text-xeoo-muted shadow-xs">
            <div className="flex items-start gap-2">
              <Info size={15} className="mt-0.5 shrink-0 text-xeoo-primary" />
              <div className="space-y-1 text-[11px] leading-relaxed">
                <p className="font-semibold text-xeoo-text">About This Analysis</p>
                <p>
                  This tool analyzes publicly accessible HTML metadata directly from the target page. The score provided is an internal XeooTools benchmark and does not represent an official search engine ranking. Results are informational and should be evaluated alongside overall site quality.
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

