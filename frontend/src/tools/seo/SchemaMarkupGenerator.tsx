import {
  Check,
  Code2,
  Copy,
  Download,
  Info,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useEffect, useId, useState } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showSuccess, showError } from "../../alert";

type SchemaType =
  | "Article"
  | "Organization"
  | "WebSite"
  | "WebPage"
  | "FAQPage"
  | "BreadcrumbList"
  | "LocalBusiness";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface BreadcrumbItem {
  id: string;
  name: string;
  url: string;
}

export default function SchemaMarkupGenerator() {
  const [schemaType, setSchemaType] = useState<SchemaType>("Article");
  const [outputTab, setOutputTab] = useState<"html" | "json">("html");
  const [copied, setCopied] = useState(false);

  // Article state
  const [article, setArticle] = useState({
    headline: "How to Optimize Your Website SEO",
    description: "A comprehensive guide on improving search engine visibility and performance.",
    image: "https://example.com/images/article-banner.jpg",
    author: "Jane Doe",
    publisher: "XeooTools Publishing",
    datePublished: new Date().toISOString().split("T")[0],
    dateModified: new Date().toISOString().split("T")[0],
  });

  // Organization state
  const [org, setOrg] = useState({
    name: "XeooTools Inc.",
    url: "https://xeootools.site.je",
    logo: "https://xeootools.site.je/xeoo-icon.png",
    description: "Free developer and productivity tools platform.",
  });

  // WebSite state
  const [website, setWebsite] = useState({
    name: "XeooTools",
    url: "https://xeootools.site.je",
    description: "Free online developer and everyday utilities.",
  });

  // WebPage state
  const [webPage, setWebPage] = useState({
    name: "Developer Tools Directory",
    url: "https://xeootools.site.je/tools",
    description: "Browse free developer tools for networking, security, and everyday tasks.",
  });

  // FAQ state
  const [faqList, setFaqList] = useState<FaqItem[]>([
    {
      id: "faq-1",
      question: "Are XeooTools utilities free to use?",
      answer: "Yes, all tools on XeooTools are completely free and process tasks directly.",
    },
    {
      id: "faq-2",
      question: "Do you store my uploaded files or scan inputs?",
      answer: "No, files are processed locally in your browser and never retained.",
    },
  ]);

  // Breadcrumbs state
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: "bc-1", name: "Home", url: "https://xeootools.site.je" },
    { id: "bc-2", name: "Tools", url: "https://xeootools.site.je/tools" },
    { id: "bc-3", name: "SEO", url: "https://xeootools.site.je/category/seo" },
  ]);

  // LocalBusiness state
  const [localBiz, setLocalBiz] = useState({
    name: "XeooTech Studio",
    url: "https://example.com",
    image: "https://example.com/storefront.jpg",
    telephone: "+1-555-0199",
    address: "123 Innovation Drive",
    city: "San Francisco",
    region: "CA",
    postalCode: "94103",
    country: "US",
  });

  const schemaTypeId = useId();

  // Set document title & canonical
  useEffect(() => {
    document.title = "Schema Markup Generator | XeooTools";
    const canonicalId = "canonical-schema-markup";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      link.href = "https://xeootools.site.je/tools/schema-markup-generator";
      document.head.appendChild(link);
    }
    return () => {
      link?.remove();
    };
  }, []);

  // Generate clean JSON-LD structure based on selected type
  const buildJsonLd = (): Record<string, unknown> => {
    const base: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": schemaType,
    };

    switch (schemaType) {
      case "Article":
        if (article.headline) base.headline = article.headline;
        if (article.description) base.description = article.description;
        if (article.image) base.image = article.image;
        if (article.author) base.author = { "@type": "Person", name: article.author };
        if (article.publisher) base.publisher = { "@type": "Organization", name: article.publisher };
        if (article.datePublished) base.datePublished = article.datePublished;
        if (article.dateModified) base.dateModified = article.dateModified;
        break;

      case "Organization":
        if (org.name) base.name = org.name;
        if (org.url) base.url = org.url;
        if (org.logo) base.logo = org.logo;
        if (org.description) base.description = org.description;
        break;

      case "WebSite":
        if (website.name) base.name = website.name;
        if (website.url) base.url = website.url;
        if (website.description) base.description = website.description;
        break;

      case "WebPage":
        if (webPage.name) base.name = webPage.name;
        if (webPage.url) base.url = webPage.url;
        if (webPage.description) base.description = webPage.description;
        break;

      case "FAQPage":
        base.mainEntity = faqList.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.answer,
          },
        }));
        break;

      case "BreadcrumbList":
        base.itemListElement = breadcrumbs.map((b, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: b.name,
          item: b.url,
        }));
        break;

      case "LocalBusiness":
        if (localBiz.name) base.name = localBiz.name;
        if (localBiz.url) base.url = localBiz.url;
        if (localBiz.image) base.image = localBiz.image;
        if (localBiz.telephone) base.telephone = localBiz.telephone;
        base.address = {
          "@type": "PostalAddress",
          streetAddress: localBiz.address,
          addressLocality: localBiz.city,
          addressRegion: localBiz.region,
          postalCode: localBiz.postalCode,
          addressCountry: localBiz.country,
        };
        break;
    }

    return base;
  };

  const rawJsonObject = buildJsonLd();
  const formattedJson = JSON.stringify(rawJsonObject, null, 2);
  const formattedHtml = `<script type="application/ld+json">\n${formattedJson}\n</script>`;
  const activeOutput = outputTab === "html" ? formattedHtml : formattedJson;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      void showSuccess("Copied", `${schemaType} schema copied to clipboard.`);
    } catch {
      void showError("Copy Failed", "Could not copy schema.");
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([formattedJson], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `schema-${schemaType.toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      void showSuccess("Downloaded", "Schema JSON file downloaded successfully.");
    } catch {
      void showError("Download Failed", "Failed to download schema JSON.");
    }
  };

  const handleReset = () => {
    if (schemaType === "Article") {
      setArticle({
        headline: "",
        description: "",
        image: "",
        author: "",
        publisher: "",
        datePublished: new Date().toISOString().split("T")[0],
        dateModified: new Date().toISOString().split("T")[0],
      });
    } else if (schemaType === "FAQPage") {
      setFaqList([{ id: "faq-1", question: "", answer: "" }]);
    } else if (schemaType === "BreadcrumbList") {
      setBreadcrumbs([{ id: "bc-1", name: "", url: "" }]);
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
                  <Code2 size={16} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold text-xeoo-text sm:text-sm">
                    SCHEMA MARKUP GENERATOR
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Generate valid JSON-LD structured data for rich snippets and search engines.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-[11px] font-medium text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
              >
                <RotateCcw size={12} />
                <span>Reset Fields</span>
              </button>
            </div>

            {/* SCHEMA TYPE SELECTOR */}
            <div className="p-3 sm:p-4 border-b border-xeoo-border bg-xeoo-surface-soft/40">
              <label
                htmlFor={schemaTypeId}
                className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted"
              >
                Select Schema Type
              </label>
              <select
                id={schemaTypeId}
                value={schemaType}
                onChange={(e) => setSchemaType(e.target.value as SchemaType)}
                className="w-full sm:w-72 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-1.5 text-xs font-semibold text-xeoo-text"
              >
                <option value="Article">Article / Blog Post</option>
                <option value="Organization">Organization / Company</option>
                <option value="WebSite">WebSite (Search Box)</option>
                <option value="WebPage">WebPage (General)</option>
                <option value="FAQPage">FAQPage (Frequently Asked Questions)</option>
                <option value="BreadcrumbList">BreadcrumbList (Navigation)</option>
                <option value="LocalBusiness">LocalBusiness (Physical Store/Office)</option>
              </select>
            </div>

            {/* DYNAMIC FORM FIELDS */}
            <div className="p-3 sm:p-4 space-y-3">
              {schemaType === "Article" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Headline / Title</label>
                    <input
                      type="text"
                      value={article.headline}
                      onChange={(e) => setArticle({ ...article, headline: e.target.value })}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs text-xeoo-text"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Short Description</label>
                    <textarea
                      rows={2}
                      value={article.description}
                      onChange={(e) => setArticle({ ...article, description: e.target.value })}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs text-xeoo-text"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Featured Image URL</label>
                    <input
                      type="text"
                      value={article.image}
                      onChange={(e) => setArticle({ ...article, image: e.target.value })}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs text-xeoo-text"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Author Name</label>
                    <input
                      type="text"
                      value={article.author}
                      onChange={(e) => setArticle({ ...article, author: e.target.value })}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs text-xeoo-text"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Publisher Name</label>
                    <input
                      type="text"
                      value={article.publisher}
                      onChange={(e) => setArticle({ ...article, publisher: e.target.value })}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs text-xeoo-text"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Date Published</label>
                      <input
                        type="date"
                        value={article.datePublished}
                        onChange={(e) => setArticle({ ...article, datePublished: e.target.value })}
                        className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-2 py-1.5 text-xs text-xeoo-text"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Date Modified</label>
                      <input
                        type="date"
                        value={article.dateModified}
                        onChange={(e) => setArticle({ ...article, dateModified: e.target.value })}
                        className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-2 py-1.5 text-xs text-xeoo-text"
                      />
                    </div>
                  </div>
                </div>
              )}

              {schemaType === "Organization" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Organization Name</label>
                    <input
                      type="text"
                      value={org.name}
                      onChange={(e) => setOrg({ ...org, name: e.target.value })}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs text-xeoo-text"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Official Website URL</label>
                    <input
                      type="text"
                      value={org.url}
                      onChange={(e) => setOrg({ ...org, url: e.target.value })}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs text-xeoo-text"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Logo URL</label>
                    <input
                      type="text"
                      value={org.logo}
                      onChange={(e) => setOrg({ ...org, logo: e.target.value })}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs text-xeoo-text"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Brief Description</label>
                    <input
                      type="text"
                      value={org.description}
                      onChange={(e) => setOrg({ ...org, description: e.target.value })}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs text-xeoo-text"
                    />
                  </div>
                </div>
              )}

              {schemaType === "WebSite" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Website Name</label>
                    <input
                      type="text"
                      value={website.name}
                      onChange={(e) => setWebsite({ ...website, name: e.target.value })}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs text-xeoo-text"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Website URL</label>
                    <input
                      type="text"
                      value={website.url}
                      onChange={(e) => setWebsite({ ...website, url: e.target.value })}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs text-xeoo-text"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Description</label>
                    <textarea
                      rows={2}
                      value={website.description}
                      onChange={(e) => setWebsite({ ...website, description: e.target.value })}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs text-xeoo-text"
                    />
                  </div>
                </div>
              )}

              {schemaType === "WebPage" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Page Title / Name</label>
                    <input
                      type="text"
                      value={webPage.name}
                      onChange={(e) => setWebPage({ ...webPage, name: e.target.value })}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs text-xeoo-text"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Page URL</label>
                    <input
                      type="text"
                      value={webPage.url}
                      onChange={(e) => setWebPage({ ...webPage, url: e.target.value })}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs text-xeoo-text"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Description</label>
                    <textarea
                      rows={2}
                      value={webPage.description}
                      onChange={(e) => setWebPage({ ...webPage, description: e.target.value })}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs text-xeoo-text"
                    />
                  </div>
                </div>
              )}

              {schemaType === "FAQPage" && (
                <div className="space-y-3">
                  {faqList.map((faq, idx) => (
                    <div key={faq.id} className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-xeoo-primary">Question #{idx + 1}</span>
                        {faqList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFaqList((prev) => prev.filter((item) => item.id !== faq.id))}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFaqList((prev) => prev.map((f) => (f.id === faq.id ? { ...f, question: val } : f)));
                        }}
                        placeholder="e.g. What payment methods do you support?"
                        className="w-full rounded border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-xs text-xeoo-text"
                      />
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFaqList((prev) => prev.map((f) => (f.id === faq.id ? { ...f, answer: val } : f)));
                        }}
                        placeholder="Provide clear answer..."
                        className="w-full rounded border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-xs text-xeoo-text"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setFaqList((prev) => [...prev, { id: `faq-${Date.now()}`, question: "", answer: "" }])
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-xeoo-border px-3 py-2 text-xs font-semibold text-xeoo-primary hover:bg-xeoo-surface-soft w-full justify-center"
                  >
                    <Plus size={14} /> Add Question
                  </button>
                </div>
              )}

              {schemaType === "BreadcrumbList" && (
                <div className="space-y-3">
                  {breadcrumbs.map((b, idx) => (
                    <div key={b.id} className="flex items-center gap-2 rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2">
                      <span className="text-[11px] font-bold text-xeoo-muted w-6 text-center">{idx + 1}</span>
                      <input
                        type="text"
                        value={b.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBreadcrumbs((prev) => prev.map((item) => (item.id === b.id ? { ...item, name: val } : item)));
                        }}
                        placeholder="Page Name"
                        className="flex-1 rounded border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-xs text-xeoo-text"
                      />
                      <input
                        type="text"
                        value={b.url}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBreadcrumbs((prev) => prev.map((item) => (item.id === b.id ? { ...item, url: val } : item)));
                        }}
                        placeholder="https://example.com/path"
                        className="flex-1 rounded border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-xs text-xeoo-text"
                      />
                      {breadcrumbs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setBreadcrumbs((prev) => prev.filter((item) => item.id !== b.id))}
                          className="text-red-500 hover:text-red-600 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setBreadcrumbs((prev) => [...prev, { id: `bc-${Date.now()}`, name: "", url: "" }])
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-xeoo-border px-3 py-2 text-xs font-semibold text-xeoo-primary hover:bg-xeoo-surface-soft w-full justify-center"
                  >
                    <Plus size={14} /> Add Breadcrumb
                  </button>
                </div>
              )}

              {schemaType === "LocalBusiness" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Business Name</label>
                    <input
                      type="text"
                      value={localBiz.name}
                      onChange={(e) => setLocalBiz({ ...localBiz, name: e.target.value })}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs text-xeoo-text"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Website URL</label>
                    <input
                      type="text"
                      value={localBiz.url}
                      onChange={(e) => setLocalBiz({ ...localBiz, url: e.target.value })}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs text-xeoo-text"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Image / Storefront URL</label>
                    <input
                      type="text"
                      value={localBiz.image}
                      onChange={(e) => setLocalBiz({ ...localBiz, image: e.target.value })}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs text-xeoo-text"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Phone Number</label>
                    <input
                      type="text"
                      value={localBiz.telephone}
                      onChange={(e) => setLocalBiz({ ...localBiz, telephone: e.target.value })}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs text-xeoo-text"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Street Address</label>
                    <input
                      type="text"
                      value={localBiz.address}
                      onChange={(e) => setLocalBiz({ ...localBiz, address: e.target.value })}
                      className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs text-xeoo-text"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">City</label>
                      <input
                        type="text"
                        value={localBiz.city}
                        onChange={(e) => setLocalBiz({ ...localBiz, city: e.target.value })}
                        className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-2 py-1.5 text-xs text-xeoo-text"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">State / Region</label>
                      <input
                        type="text"
                        value={localBiz.region}
                        onChange={(e) => setLocalBiz({ ...localBiz, region: e.target.value })}
                        className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-2 py-1.5 text-xs text-xeoo-text"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Postal Code</label>
                      <input
                        type="text"
                        value={localBiz.postalCode}
                        onChange={(e) => setLocalBiz({ ...localBiz, postalCode: e.target.value })}
                        className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-2 py-1.5 text-xs text-xeoo-text"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-xeoo-muted">Country Code (e.g. US, ID)</label>
                      <input
                        type="text"
                        value={localBiz.country}
                        onChange={(e) => setLocalBiz({ ...localBiz, country: e.target.value })}
                        className="w-full rounded border border-xeoo-border bg-xeoo-surface-soft px-2 py-1.5 text-xs text-xeoo-text"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* GENERATED SCHEMA OUTPUT */}
          <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
            <div className="flex items-center justify-between border-b border-xeoo-border px-3 py-2.5 sm:px-4">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setOutputTab("html")}
                  className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                    outputTab === "html"
                      ? "bg-xeoo-primary text-white"
                      : "bg-xeoo-surface-soft text-xeoo-muted hover:text-xeoo-text"
                  }`}
                >
                  HTML Script Tag
                </button>
                <button
                  type="button"
                  onClick={() => setOutputTab("json")}
                  className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                    outputTab === "json"
                      ? "bg-xeoo-primary text-white"
                      : "bg-xeoo-surface-soft text-xeoo-muted hover:text-xeoo-text"
                  }`}
                >
                  Pure JSON-LD
                </button>
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
                  <span>Download .json</span>
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-slate-950">
              <pre className="font-mono text-xs text-slate-100 overflow-x-auto whitespace-pre leading-relaxed p-1 max-h-96">
                {activeOutput}
              </pre>
            </div>
          </section>

          {/* DISCLAIMER / INFO */}
          <section className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 text-xs text-xeoo-muted shadow-xs">
            <div className="flex items-start gap-2">
              <Info size={15} className="mt-0.5 shrink-0 text-xeoo-primary" />
              <div className="space-y-1 text-[11px] leading-relaxed">
                <p className="font-semibold text-xeoo-text">Structured Data Guidelines</p>
                <p>
                  Generated schema markup adheres to standard Schema.org specifications. Structured data should be reviewed and verified using tools like the Schema.org Validator before publishing. Implementing schema markup does not guarantee that search engines will display rich snippets.
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

