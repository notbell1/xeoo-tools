import {
  Check,
  Copy,
  Download,
  FileCode,
  Info,
  RotateCcw,
} from "lucide-react";
import { useEffect, useId, useState } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showSuccess, showError } from "../../alert";

type ChangeFreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export default function SitemapGenerator() {
  const [urlsInput, setUrlsInput] = useState(
    "https://example.com/\nhttps://example.com/about\nhttps://example.com/contact\nhttps://example.com/tools"
  );
  const [changefreq, setChangefreq] = useState<ChangeFreq>("weekly");
  const [priority, setPriority] = useState("0.8");
  const [includeLastmod, setIncludeLastmod] = useState(true);
  const [lastmodDate, setLastmodDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [copied, setCopied] = useState(false);

  const textareaId = useId();
  const freqId = useId();
  const priorityId = useId();
  const lastmodId = useId();

  // Set document title & canonical
  useEffect(() => {
    document.title = "Sitemap Generator | XeooTools";
    const canonicalId = "canonical-sitemap-gen";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      link.href = "https://xeootools.site.je/tools/sitemap-generator";
      document.head.appendChild(link);
    }
    return () => {
      link?.remove();
    };
  }, []);

  // Parse, normalize, and deduplicate URLs
  const rawLines = urlsInput.split("\n");
  const seenUrls = new Set<string>();
  const parsedUrls: string[] = [];
  let duplicatesCount = 0;

  rawLines.forEach((line) => {
    let clean = line.trim();
    if (!clean) return;

    if (!/^https?:\/\//i.test(clean)) {
      clean = "https://" + clean;
    }

    try {
      const u = new URL(clean);
      const normalized = u.href;
      if (seenUrls.has(normalized)) {
        duplicatesCount++;
      } else {
        seenUrls.add(normalized);
        parsedUrls.push(normalized);
      }
    } catch {
      // Invalid URL skipped
    }
  });

  // Generate valid XML
  const generateXml = (): string => {
    if (parsedUrls.length === 0) {
      return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`;
    }

    const xmlLines: string[] = [];
    xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
    xmlLines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

    parsedUrls.forEach((u) => {
      xmlLines.push("  <url>");
      xmlLines.push(`    <loc>${escapeXml(u)}</loc>`);
      if (includeLastmod && lastmodDate) {
        xmlLines.push(`    <lastmod>${lastmodDate}</lastmod>`);
      }
      if (changefreq) {
        xmlLines.push(`    <changefreq>${changefreq}</changefreq>`);
      }
      if (priority) {
        xmlLines.push(`    <priority>${priority}</priority>`);
      }
      xmlLines.push("  </url>");
    });

    xmlLines.push("</urlset>");
    return xmlLines.join("\n");
  };

  const escapeXml = (unsafe: string): string => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case "'":
          return "&apos;";
        case '"':
          return "&quot;";
        default:
          return c;
      }
    });
  };

  const outputXml = generateXml();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputXml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      void showSuccess("Copied", "sitemap.xml copied to clipboard.");
    } catch {
      void showError("Copy Failed", "Could not copy to clipboard.");
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([outputXml], { type: "application/xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sitemap.xml";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      void showSuccess("Downloaded", "sitemap.xml downloaded successfully.");
    } catch {
      void showError("Download Failed", "Failed to download sitemap.xml.");
    }
  };

  const handleReset = () => {
    setUrlsInput("");
    setChangefreq("weekly");
    setPriority("0.8");
    setIncludeLastmod(true);
    setLastmodDate(new Date().toISOString().split("T")[0]);
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
                  <FileCode size={16} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold text-xeoo-text sm:text-sm">
                    XML SITEMAP GENERATOR
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Generate standards-compliant XML sitemaps from your list of website URLs.
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

            {/* FORM CONFIG */}
            <div className="p-3 sm:p-4 space-y-3">
              {/* URL List Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor={textareaId}
                    className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted"
                  >
                    Enter URLs (One per line)
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-semibold text-xeoo-text">
                      {parsedUrls.length} valid {parsedUrls.length === 1 ? "URL" : "URLs"}
                    </span>
                    {duplicatesCount > 0 && (
                      <span className="text-amber-500 font-medium">
                        ({duplicatesCount} duplicate removed)
                      </span>
                    )}
                  </div>
                </div>
                <textarea
                  id={textareaId}
                  rows={6}
                  value={urlsInput}
                  onChange={(e) => setUrlsInput(e.target.value)}
                  placeholder="https://example.com/&#10;https://example.com/about&#10;https://example.com/contact"
                  className="w-full font-mono rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 text-xs text-xeoo-text placeholder-xeoo-muted transition focus:border-xeoo-primary focus:outline-hidden focus:ring-1 focus:ring-xeoo-primary leading-relaxed"
                />
              </div>

              {/* Sitemap Options */}
              <div className="grid gap-3 sm:grid-cols-3 rounded-lg border border-xeoo-border bg-xeoo-surface-soft/40 p-3">
                {/* Change Frequency */}
                <div>
                  <label
                    htmlFor={freqId}
                    className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted"
                  >
                    Change Frequency
                  </label>
                  <select
                    id={freqId}
                    value={changefreq}
                    onChange={(e) => setChangefreq(e.target.value as ChangeFreq)}
                    className="w-full rounded border border-xeoo-border bg-xeoo-surface px-2.5 py-1.5 text-xs text-xeoo-text"
                  >
                    <option value="always">Always</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="never">Never</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label
                    htmlFor={priorityId}
                    className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted"
                  >
                    Priority (0.0 – 1.0)
                  </label>
                  <select
                    id={priorityId}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded border border-xeoo-border bg-xeoo-surface px-2.5 py-1.5 text-xs text-xeoo-text"
                  >
                    <option value="1.0">1.0 (Highest - Homepage)</option>
                    <option value="0.9">0.9</option>
                    <option value="0.8">0.8 (Important Pages)</option>
                    <option value="0.7">0.7</option>
                    <option value="0.6">0.6</option>
                    <option value="0.5">0.5 (Default Content)</option>
                    <option value="0.4">0.4</option>
                    <option value="0.3">0.3 (Low Priority)</option>
                    <option value="0.1">0.1</option>
                  </select>
                </div>

                {/* Last Modified */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor={lastmodId}
                      className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted"
                    >
                      Last Modified Date
                    </label>
                    <input
                      type="checkbox"
                      checked={includeLastmod}
                      onChange={(e) => setIncludeLastmod(e.target.checked)}
                      className="rounded border-xeoo-border text-xeoo-primary focus:ring-0"
                    />
                  </div>
                  <input
                    id={lastmodId}
                    type="date"
                    disabled={!includeLastmod}
                    value={lastmodDate}
                    onChange={(e) => setLastmodDate(e.target.value)}
                    className="w-full rounded border border-xeoo-border bg-xeoo-surface px-2.5 py-1.5 text-xs text-xeoo-text disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* GENERATED XML OUTPUT */}
          <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
            <div className="flex items-center justify-between border-b border-xeoo-border px-3 py-2.5 sm:px-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                  Generated XML ({parsedUrls.length} {parsedUrls.length === 1 ? "entry" : "entries"})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-xs font-semibold text-xeoo-text transition hover:bg-xeoo-surface-soft"
                >
                  {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-xeoo-primary px-3 py-1 text-xs font-semibold text-white transition hover:bg-xeoo-primary-hover"
                >
                  <Download size={13} />
                  <span>Download sitemap.xml</span>
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-slate-950">
              <pre className="font-mono text-xs text-slate-100 overflow-x-auto whitespace-pre leading-relaxed p-1 max-h-96">
                {outputXml}
              </pre>
            </div>
          </section>

          {/* DISCLAIMER / INFO */}
          <section className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 text-xs text-xeoo-muted shadow-xs">
            <div className="flex items-start gap-2">
              <Info size={15} className="mt-0.5 shrink-0 text-xeoo-primary" />
              <div className="space-y-1 text-[11px] leading-relaxed">
                <p className="font-semibold text-xeoo-text">Sitemap Indexing Notice</p>
                <p>
                  A sitemap helps search engines discover and navigate your website URLs efficiently. However, submitting a sitemap does not guarantee immediate crawling or indexing. Search engines rank and index pages based on overall content value, site health, and authority.
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

