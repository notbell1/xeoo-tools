import {
  Check,
  Copy,
  Globe,
  Info,
  Laptop,
  RotateCcw,
  Search,
  Smartphone,
} from "lucide-react";
import { useEffect, useId, useState } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showSuccess, showError } from "../../alert";

export default function SerpSnippetPreview() {
  const [title, setTitle] = useState("XeooTools - Free Online Tools & Utilities");
  const [url, setUrl] = useState("https://xeootools.site.je/tools");
  const [description, setDescription] = useState(
    "Free online developer and everyday tools for calculations, networking, security, files, encoding, and productivity tasks."
  );
  const [breadcrumb, setBreadcrumb] = useState("tools › seo");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const titleId = useId();
  const urlId = useId();
  const descId = useId();
  const breadcrumbId = useId();

  // Set document title & canonical
  useEffect(() => {
    document.title = "SERP Snippet Preview | XeooTools";
    const canonicalId = "canonical-serp-preview";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      link.href = "https://xeootools.site.je/tools/serp-snippet-preview";
      document.head.appendChild(link);
    }
    return () => {
      link?.remove();
    };
  }, []);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
      void showSuccess("Copied", `${key} copied to clipboard.`);
    } catch {
      void showError("Copy Failed", "Could not copy to clipboard.");
    }
  };

  const handleReset = () => {
    setTitle("");
    setUrl("");
    setDescription("");
    setBreadcrumb("");
  };

  const titleLen = title.length;
  const descLen = description.length;

  // Title status guidelines: ~60 chars max
  const getTitleStatus = () => {
    if (titleLen === 0) return { label: "Empty", color: "text-xeoo-muted" };
    if (titleLen < 30) return { label: "Too short", color: "text-amber-500" };
    if (titleLen <= 60) return { label: "Good", color: "text-green-500" };
    return { label: "Long (may truncate)", color: "text-red-500" };
  };

  // Desc status guidelines: ~160 chars max
  const getDescStatus = () => {
    if (descLen === 0) return { label: "Empty", color: "text-xeoo-muted" };
    if (descLen < 70) return { label: "Too short", color: "text-amber-500" };
    if (descLen <= 160) return { label: "Good", color: "text-green-500" };
    return { label: "Long (may truncate)", color: "text-red-500" };
  };

  const titleStatus = getTitleStatus();
  const descStatus = getDescStatus();

  // Format display URL & breadcrumb
  let displayDomain = "example.com";
  let displayPath = "";
  try {
    const validUrl = url.startsWith("http") ? url : `https://${url}`;
    const parsed = new URL(validUrl);
    displayDomain = parsed.hostname;
    displayPath = parsed.pathname !== "/" ? parsed.pathname.replace(/^\//, "").replace(/\//g, " › ") : "";
  } catch {
    displayDomain = url || "example.com";
  }

  const finalBreadcrumb = breadcrumb ? breadcrumb.replace(/\//g, " › ") : displayPath;

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
                    SERP SNIPPET PREVIEW
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Simulate how your webpage title and meta description will appear in search engine result pages.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-[11px] font-medium text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* FORM INPUTS */}
            <div className="p-3 sm:p-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Page Title */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor={titleId}
                      className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted"
                    >
                      Page Title
                    </label>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className={`font-semibold ${titleStatus.color}`}>{titleStatus.label}</span>
                      <span className="font-mono text-xeoo-muted">{titleLen} / 60</span>
                    </div>
                  </div>
                  <input
                    id={titleId}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter engaging page title..."
                    className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 py-2 text-xs text-xeoo-text placeholder-xeoo-muted transition focus:border-xeoo-primary focus:outline-hidden focus:ring-1 focus:ring-xeoo-primary"
                  />
                </div>

                {/* Target URL */}
                <div>
                  <label
                    htmlFor={urlId}
                    className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted"
                  >
                    Page URL
                  </label>
                  <input
                    id={urlId}
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/page-path"
                    className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 py-2 text-xs text-xeoo-text placeholder-xeoo-muted transition focus:border-xeoo-primary focus:outline-hidden focus:ring-1 focus:ring-xeoo-primary"
                  />
                </div>
              </div>

              {/* Breadcrumb (Optional) */}
              <div>
                <label
                  htmlFor={breadcrumbId}
                  className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted"
                >
                  Breadcrumb Navigation <span className="font-normal lowercase text-[10px]">(optional)</span>
                </label>
                <input
                  id={breadcrumbId}
                  type="text"
                  value={breadcrumb}
                  onChange={(e) => setBreadcrumb(e.target.value)}
                  placeholder="category › subcategory"
                  className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 py-2 text-xs text-xeoo-text placeholder-xeoo-muted transition focus:border-xeoo-primary focus:outline-hidden focus:ring-1 focus:ring-xeoo-primary"
                />
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor={descId}
                    className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted"
                  >
                    Meta Description
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className={`font-semibold ${descStatus.color}`}>{descStatus.label}</span>
                    <span className="font-mono text-xeoo-muted">{descLen} / 160</span>
                  </div>
                </div>
                <textarea
                  id={descId}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter informative meta description summarizing the page content..."
                  className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 text-xs text-xeoo-text placeholder-xeoo-muted transition focus:border-xeoo-primary focus:outline-hidden focus:ring-1 focus:ring-xeoo-primary"
                />
              </div>
            </div>
          </section>

          {/* LIVE SEARCH RESULT PREVIEW */}
          <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
            <div className="flex items-center justify-between border-b border-xeoo-border px-3 py-2.5 sm:px-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                  Search Result Preview
                </span>
                <span className="rounded bg-xeoo-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-xeoo-primary uppercase">
                  Simulated
                </span>
              </div>

              {/* Device View Mode Toggle */}
              <div className="flex items-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("desktop")}
                  className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition ${
                    viewMode === "desktop"
                      ? "bg-xeoo-surface text-xeoo-text shadow-xs"
                      : "text-xeoo-muted hover:text-xeoo-text"
                  }`}
                >
                  <Laptop size={12} />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("mobile")}
                  className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition ${
                    viewMode === "mobile"
                      ? "bg-xeoo-surface text-xeoo-text shadow-xs"
                      : "text-xeoo-muted hover:text-xeoo-text"
                  }`}
                >
                  <Smartphone size={12} />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="p-4 sm:p-6 bg-white dark:bg-[#1a1d24]">
              <div
                className={`transition-all ${
                  viewMode === "mobile" ? "max-w-[390px] border border-xeoo-border rounded-xl p-3 bg-white dark:bg-[#20242c]" : "max-w-2xl"
                }`}
              >
                {/* Simulated Search Snippet Card */}
                <div className="space-y-1.5 text-left font-sans">
                  {/* URL / Breadcrumb Row */}
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <Globe size={13} />
                    </div>
                    <div className="min-w-0 text-xs leading-none">
                      <span className="block font-medium text-slate-800 dark:text-slate-200 truncate">
                        {displayDomain}
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {url || "https://example.com"}
                        {finalBreadcrumb ? ` › ${finalBreadcrumb}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Title Link */}
                  <h3 className="text-base sm:text-lg font-medium leading-snug text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer break-words">
                    {title || "Example Webpage Title"}
                  </h3>

                  {/* Description Snippet */}
                  <p className="text-xs sm:text-[13px] leading-relaxed text-[#4d5156] dark:text-[#bdc1c6] break-words">
                    {description || "Provide a meta description to preview how your summary appears to search engine users."}
                  </p>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-xeoo-border bg-xeoo-surface-soft/50 p-2.5 sm:px-4">
              <button
                type="button"
                onClick={() => handleCopy(title, "Title")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 py-1.5 text-xs font-semibold text-xeoo-text transition hover:bg-xeoo-surface-soft"
              >
                {copiedKey === "Title" ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                <span>Copy Title</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(description, "Description")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 py-1.5 text-xs font-semibold text-xeoo-text transition hover:bg-xeoo-surface-soft"
              >
                {copiedKey === "Description" ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                <span>Copy Description</span>
              </button>
            </div>
          </section>

          {/* DISCLAIMER / INFO */}
          <section className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 text-xs text-xeoo-muted shadow-xs">
            <div className="flex items-start gap-2">
              <Info size={15} className="mt-0.5 shrink-0 text-xeoo-primary" />
              <div className="space-y-1 text-[11px] leading-relaxed">
                <p className="font-semibold text-xeoo-text">Search Result Preview Notes</p>
                <p>
                  This preview renders a standard representation of how snippets generally display in search engines. Character count thresholds (60 for titles, 160 for descriptions) are advisory guidelines. Search engines may truncate, alter, or replace snippets based on device viewport, pixel width, or query context.
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

