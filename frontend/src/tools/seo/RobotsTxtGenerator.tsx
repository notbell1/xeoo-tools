import {
  Check,
  Copy,
  Download,
  FileCode,
  Info,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useEffect, useId, useState } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showSuccess, showError } from "../../alert";

interface AgentRule {
  id: string;
  userAgent: string;
  allows: string[];
  disallows: string[];
  crawlDelay?: string;
}

export default function RobotsTxtGenerator() {
  const [sitemapUrl, setSitemapUrl] = useState("https://example.com/sitemap.xml");
  const [rules, setRules] = useState<AgentRule[]>([
    {
      id: "rule-1",
      userAgent: "*",
      allows: ["/"],
      disallows: ["/admin/", "/private/", "/api/"],
      crawlDelay: "",
    },
  ]);

  const [copied, setCopied] = useState(false);
  const sitemapInputId = useId();

  // Set document title & canonical
  useEffect(() => {
    document.title = "Robots.txt Generator | XeooTools";
    const canonicalId = "canonical-robots-txt";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      link.href = "https://xeootools.site.je/tools/robots-txt-generator";
      document.head.appendChild(link);
    }
    return () => {
      link?.remove();
    };
  }, []);

  // Generate robots.txt text
  const generateRobotsTxt = (): string => {
    const lines: string[] = [];
    lines.push("# robots.txt generated with XeooTools (https://xeootools.site.je)");
    lines.push("");

    rules.forEach((rule) => {
      const agent = rule.userAgent.trim() || "*";
      lines.push(`User-agent: ${agent}`);

      rule.allows.forEach((p) => {
        const trimmed = p.trim();
        if (trimmed) lines.push(`Allow: ${trimmed}`);
      });

      rule.disallows.forEach((p) => {
        const trimmed = p.trim();
        if (trimmed) lines.push(`Disallow: ${trimmed}`);
      });

      if (rule.crawlDelay && rule.crawlDelay.trim() !== "") {
        lines.push(`Crawl-delay: ${rule.crawlDelay.trim()}`);
      }

      lines.push("");
    });

    if (sitemapUrl.trim()) {
      lines.push(`Sitemap: ${sitemapUrl.trim()}`);
    }

    return lines.join("\n").trim() + "\n";
  };

  const outputContent = generateRobotsTxt();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      void showSuccess("Copied", "robots.txt content copied to clipboard.");
    } catch {
      void showError("Copy Failed", "Could not copy to clipboard.");
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([outputContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "robots.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      void showSuccess("Downloaded", "robots.txt file downloaded successfully.");
    } catch {
      void showError("Download Failed", "Failed to download robots.txt.");
    }
  };

  const handleReset = () => {
    setSitemapUrl("https://example.com/sitemap.xml");
    setRules([
      {
        id: "rule-1",
        userAgent: "*",
        allows: ["/"],
        disallows: ["/admin/", "/private/", "/api/"],
        crawlDelay: "",
      },
    ]);
  };

  const handleAddRule = () => {
    setRules((prev) => [
      ...prev,
      {
        id: `rule-${Date.now()}`,
        userAgent: "Googlebot",
        allows: ["/"],
        disallows: [],
        crawlDelay: "",
      },
    ]);
  };

  const handleRemoveRule = (id: string) => {
    if (rules.length <= 1) {
      void showError("Notice", "At least one User-agent block is required.");
      return;
    }
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddPath = (ruleId: string, type: "allow" | "disallow") => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id !== ruleId) return r;
        if (type === "allow") {
          return { ...r, allows: [...r.allows, "/"] };
        }
        return { ...r, disallows: [...r.disallows, "/new-path/"] };
      })
    );
  };

  const handleRemovePath = (ruleId: string, type: "allow" | "disallow", index: number) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id !== ruleId) return r;
        if (type === "allow") {
          return { ...r, allows: r.allows.filter((_, i) => i !== index) };
        }
        return { ...r, disallows: r.disallows.filter((_, i) => i !== index) };
      })
    );
  };

  const handlePathChange = (
    ruleId: string,
    type: "allow" | "disallow",
    index: number,
    value: string
  ) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id !== ruleId) return r;
        if (type === "allow") {
          const updated = [...r.allows];
          updated[index] = value;
          return { ...r, allows: updated };
        }
        const updated = [...r.disallows];
        updated[index] = value;
        return { ...r, disallows: updated };
      })
    );
  };

  const applyPreset = (presetName: string) => {
    if (presetName === "allow-all") {
      setRules([
        {
          id: "rule-1",
          userAgent: "*",
          allows: ["/"],
          disallows: [],
          crawlDelay: "",
        },
      ]);
    } else if (presetName === "block-admin") {
      setRules([
        {
          id: "rule-1",
          userAgent: "*",
          allows: ["/"],
          disallows: ["/admin/", "/dashboard/", "/login/", "/secret/"],
          crawlDelay: "",
        },
      ]);
    } else if (presetName === "wordpress") {
      setRules([
        {
          id: "rule-1",
          userAgent: "*",
          allows: ["/wp-admin/admin-ajax.php"],
          disallows: ["/wp-admin/", "/wp-includes/"],
          crawlDelay: "",
        },
      ]);
    }
    void showSuccess("Preset Applied", `Loaded ${presetName} template.`);
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
                    ROBOTS.TXT GENERATOR
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Create clean, valid robots.txt directives for web crawlers, search engines, and bots.
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

            {/* PRESETS ROW */}
            <div className="border-b border-xeoo-border bg-xeoo-surface-soft/40 px-3 py-2 sm:px-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                Quick Presets:
              </span>
              <button
                type="button"
                onClick={() => applyPreset("allow-all")}
                className="rounded border border-xeoo-border bg-xeoo-surface px-2 py-0.5 text-[11px] text-xeoo-text hover:bg-xeoo-surface-soft"
              >
                Allow All
              </button>
              <button
                type="button"
                onClick={() => applyPreset("block-admin")}
                className="rounded border border-xeoo-border bg-xeoo-surface px-2 py-0.5 text-[11px] text-xeoo-text hover:bg-xeoo-surface-soft"
              >
                Standard Admin Block
              </button>
              <button
                type="button"
                onClick={() => applyPreset("wordpress")}
                className="rounded border border-xeoo-border bg-xeoo-surface px-2 py-0.5 text-[11px] text-xeoo-text hover:bg-xeoo-surface-soft"
              >
                WordPress Site
              </button>
            </div>

            {/* RULES EDITOR */}
            <div className="p-3 sm:p-4 space-y-4">
              {/* Sitemap URL input */}
              <div>
                <label
                  htmlFor={sitemapInputId}
                  className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted"
                >
                  Sitemap XML URL (Optional)
                </label>
                <input
                  id={sitemapInputId}
                  type="text"
                  value={sitemapUrl}
                  onChange={(e) => setSitemapUrl(e.target.value)}
                  placeholder="https://example.com/sitemap.xml"
                  className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 py-2 text-xs text-xeoo-text placeholder-xeoo-muted transition focus:border-xeoo-primary focus:outline-hidden focus:ring-1 focus:ring-xeoo-primary"
                />
              </div>

              {/* Rules List */}
              <div className="space-y-3">
                {rules.map((rule, ruleIdx) => (
                  <div
                    key={rule.id}
                    className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-xeoo-border pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-xeoo-primary">
                          Agent Rule #{ruleIdx + 1}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <label className="text-[11px] text-xeoo-muted">User-agent:</label>
                          <select
                            value={
                              ["*", "Googlebot", "Bingbot"].includes(rule.userAgent)
                                ? rule.userAgent
                                : "Custom"
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              setRules((prev) =>
                                prev.map((r) =>
                                  r.id === rule.id
                                    ? { ...r, userAgent: val === "Custom" ? "Baiduspider" : val }
                                    : r
                                )
                              );
                            }}
                            className="rounded border border-xeoo-border bg-xeoo-surface px-2 py-1 text-xs text-xeoo-text"
                          >
                            <option value="*">* (All Robots)</option>
                            <option value="Googlebot">Googlebot</option>
                            <option value="Bingbot">Bingbot</option>
                            <option value="Custom">Custom User-agent</option>
                          </select>

                          {!["*", "Googlebot", "Bingbot"].includes(rule.userAgent) && (
                            <input
                              type="text"
                              value={rule.userAgent}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRules((prev) =>
                                  prev.map((r) => (r.id === rule.id ? { ...r, userAgent: val } : r))
                                );
                              }}
                              placeholder="e.g. Slurp"
                              className="rounded border border-xeoo-border bg-xeoo-surface px-2 py-1 text-xs text-xeoo-text w-32"
                            />
                          )}
                        </div>
                      </div>

                      {rules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRule(rule.id)}
                          className="text-red-500 hover:text-red-600 p-1"
                          title="Remove Rule Block"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {/* Allow Paths */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-green-600 dark:text-green-400">
                            Allow Paths:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddPath(rule.id, "allow")}
                            className="inline-flex items-center gap-1 text-[11px] text-xeoo-primary hover:underline"
                          >
                            <Plus size={11} /> Add
                          </button>
                        </div>
                        {rule.allows.length === 0 ? (
                          <p className="text-[11px] text-xeoo-muted italic">No specific allow path.</p>
                        ) : (
                          rule.allows.map((pathVal, pIdx) => (
                            <div key={pIdx} className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={pathVal}
                                onChange={(e) =>
                                  handlePathChange(rule.id, "allow", pIdx, e.target.value)
                                }
                                placeholder="/path/"
                                className="w-full rounded border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-xs text-xeoo-text font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemovePath(rule.id, "allow", pIdx)}
                                className="text-xeoo-muted hover:text-red-500 p-1"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Disallow Paths */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-red-600 dark:text-red-400">
                            Disallow Paths:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddPath(rule.id, "disallow")}
                            className="inline-flex items-center gap-1 text-[11px] text-xeoo-primary hover:underline"
                          >
                            <Plus size={11} /> Add
                          </button>
                        </div>
                        {rule.disallows.length === 0 ? (
                          <p className="text-[11px] text-xeoo-muted italic">No disallowed path.</p>
                        ) : (
                          rule.disallows.map((pathVal, pIdx) => (
                            <div key={pIdx} className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={pathVal}
                                onChange={(e) =>
                                  handlePathChange(rule.id, "disallow", pIdx, e.target.value)
                                }
                                placeholder="/admin/"
                                className="w-full rounded border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-xs text-xeoo-text font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemovePath(rule.id, "disallow", pIdx)}
                                className="text-xeoo-muted hover:text-red-500 p-1"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddRule}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-xeoo-border px-3 py-2 text-xs font-medium text-xeoo-primary hover:bg-xeoo-surface-soft transition w-full justify-center"
                >
                  <Plus size={14} />
                  <span>Add Another User-Agent Block</span>
                </button>
              </div>
            </div>
          </section>

          {/* GENERATED OUTPUT & ACTIONS */}
          <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
            <div className="flex items-center justify-between border-b border-xeoo-border px-3 py-2.5 sm:px-4">
              <span className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                Generated robots.txt
              </span>

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
                  <span>Download robots.txt</span>
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-slate-950">
              <pre className="font-mono text-xs text-slate-100 overflow-x-auto whitespace-pre leading-relaxed p-1">
                {outputContent}
              </pre>
            </div>
          </section>

          {/* DISCLAIMER / INFO */}
          <section className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 text-xs text-xeoo-muted shadow-xs">
            <div className="flex items-start gap-2">
              <Info size={15} className="mt-0.5 shrink-0 text-xeoo-primary" />
              <div className="space-y-1 text-[11px] leading-relaxed">
                <p className="font-semibold text-xeoo-text">Important robots.txt Information</p>
                <p>
                  A robots.txt file provides crawl guidance to well-behaved search engine crawlers. It is public and accessible to everyone. Disallowing a directory does not hide it from users or protect sensitive files. Never place private credentials or secret URLs inside your robots.txt.
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

