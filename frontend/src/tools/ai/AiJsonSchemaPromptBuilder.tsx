import { useEffect, useState } from "react";
import {
  Braces,
  Check,
  Copy,
  Info,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showSuccess, showError } from "../../alert";
import {
  generateJsonSchemaAndPrompt,
  type JsonFieldType,
  type SchemaField,
} from "./aiJsonSchemaPromptBuilderLogic";

const DEFAULT_FIELDS: SchemaField[] = [
  {
    id: "f-1",
    name: "productName",
    type: "string",
    description: "The official product name",
    required: true,
  },
  {
    id: "f-2",
    name: "priceUsd",
    type: "number",
    description: "Retail price in US Dollars",
    required: true,
  },
  {
    id: "f-3",
    name: "category",
    type: "string",
    description: "Department category",
    required: true,
    enumValues: "electronics, clothing, home, books",
  },
  {
    id: "f-4",
    name: "tags",
    type: "array",
    description: "Associated product keywords",
    required: false,
    itemType: "string",
  },
  {
    id: "f-5",
    name: "inStock",
    type: "boolean",
    description: "Whether the product is currently in warehouse",
    required: true,
  },
];

export default function AiJsonSchemaPromptBuilder() {
  const [title, setTitle] = useState("ProductData");
  const [description, setDescription] = useState("Extraction schema for catalog item specifications.");
  const [strictMode, setStrictMode] = useState(true);
  const [fields, setFields] = useState<SchemaField[]>(DEFAULT_FIELDS);

  const [activeTab, setActiveTab] = useState<"prompt" | "schema" | "sample">("prompt");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "AI JSON Schema Prompt Builder | XeooTools";
    const canonicalId = "canonical-ai-json-schema-prompt-builder";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      link.href = "https://xeootools.site.je/tools/ai-json-schema-prompt-builder";
      document.head.appendChild(link);
    }
    return () => {
      link?.remove();
    };
  }, []);

  const result = generateJsonSchemaAndPrompt({
    title,
    description,
    strictMode,
    fields,
  });

  const handleAddField = () => {
    const newId = `f-${Date.now()}`;
    setFields((prev) => [
      ...prev,
      {
        id: newId,
        name: `field_${prev.length + 1}`,
        type: "string",
        description: "",
        required: true,
      },
    ]);
  };

  const handleRemoveField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpdateField = (
    id: string,
    key: keyof SchemaField,
    val: unknown
  ) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        if (key === "name") {
          return { ...f, [key]: String(val).replace(/[^a-zA-Z0-9_]/g, "") };
        }
        return { ...f, [key]: val };
      })
    );
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      void showSuccess("Copied", "Content copied to clipboard.");
    } catch {
      void showError("Copy Error", "Failed to copy content.");
    }
  };

  const handleReset = () => {
    setTitle("OutputSchema");
    setDescription("");
    setFields([]);
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
                  <Braces size={16} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold tracking-tight text-xeoo-text sm:text-sm">
                    AI JSON SCHEMA PROMPT BUILDER
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Build structured output prompts, draft-07 JSON schemas, and extraction contracts for AI pipelines.
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

            <div className="flex items-center gap-2 border-b border-xeoo-border bg-sky-500/5 px-3.5 py-2 text-[11px] text-sky-800 dark:text-sky-300">
              <Info size={14} className="shrink-0 text-sky-500" />
              <span>
                <strong>Structured Outputs:</strong> Instructs frontier AI models (OpenAI Structured Outputs, Anthropic Tool Use, Gemini JSON mode) to respond strictly within a validated JSON format.
              </span>
            </div>

            {/* WORKSPACE */}
            <div className="grid grid-cols-1 gap-4 p-3.5 sm:p-5 lg:grid-cols-12">
              {/* LEFT: SCHEMA DEFINITION FORM */}
              <div className="space-y-3.5 lg:col-span-6">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-xeoo-text">Schema Name</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. UserProfile"
                      className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 font-mono text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-xeoo-text">Strict Mode</label>
                    <div className="mt-1 flex items-center h-8">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-xeoo-text">
                        <input
                          type="checkbox"
                          checked={strictMode}
                          onChange={(e) => setStrictMode(e.target.checked)}
                          className="rounded border-xeoo-border text-xeoo-primary focus:ring-xeoo-primary"
                        />
                        <span>Disallow extra keys</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-xeoo-text">Purpose / Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the expected output"
                    className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  />
                </div>

                {/* FIELDS LIST */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Schema Properties ({fields.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddField}
                      className="inline-flex items-center gap-1 rounded bg-xeoo-text px-2 py-0.5 text-[10px] font-semibold text-xeoo-surface hover:opacity-90"
                    >
                      <Plus size={11} />
                      <span>Add Property</span>
                    </button>
                  </div>

                  {fields.length === 0 ? (
                    <p className="text-[11px] italic text-xeoo-muted">No fields defined. Click 'Add Property' above.</p>
                  ) : (
                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                      {fields.map((f) => (
                        <div key={f.id} className="rounded border border-xeoo-border bg-xeoo-surface p-2.5 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={f.name}
                              onChange={(e) => handleUpdateField(f.id, "name", e.target.value)}
                              placeholder="keyName"
                              className="w-1/3 rounded border border-xeoo-border bg-xeoo-bg px-2 py-1 font-mono text-xs text-xeoo-text focus:outline-none font-bold"
                            />

                            <select
                              value={f.type}
                              onChange={(e) => handleUpdateField(f.id, "type", e.target.value as JsonFieldType)}
                              className="w-1/3 rounded border border-xeoo-border bg-xeoo-surface px-1.5 py-1 text-xs text-xeoo-text"
                            >
                              <option value="string">string</option>
                              <option value="number">number</option>
                              <option value="boolean">boolean</option>
                              <option value="array">array</option>
                              <option value="object">object</option>
                            </select>

                            <label className="flex items-center gap-1 text-[11px] text-xeoo-muted cursor-pointer shrink-0">
                              <input
                                type="checkbox"
                                checked={f.required}
                                onChange={(e) => handleUpdateField(f.id, "required", e.target.checked)}
                                className="rounded border-xeoo-border text-xeoo-primary"
                              />
                              <span>Req</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => handleRemoveField(f.id)}
                              className="text-xeoo-muted hover:text-red-500 ml-auto"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={f.description}
                              onChange={(e) => handleUpdateField(f.id, "description", e.target.value)}
                              placeholder="Description for LLM (e.g. 'Customer full name')"
                              className="w-full rounded border border-xeoo-border bg-xeoo-bg px-2 py-0.5 text-[11px] text-xeoo-text focus:outline-none"
                            />
                          </div>

                          {f.type === "string" && (
                            <input
                              type="text"
                              value={f.enumValues || ""}
                              onChange={(e) => handleUpdateField(f.id, "enumValues", e.target.value)}
                              placeholder="Optional enum options (e.g. 'active, pending, suspended')"
                              className="w-full rounded border border-xeoo-border/60 bg-transparent px-2 py-0.5 text-[10px] text-xeoo-muted font-mono focus:outline-none"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: LIVE OUTPUT */}
              <div className="flex flex-col space-y-3 lg:col-span-6">
                <div className="flex items-center justify-between border-b border-xeoo-border pb-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab("prompt")}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                        activeTab === "prompt"
                          ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                          : "text-xeoo-muted hover:text-xeoo-text"
                      }`}
                    >
                      Prompt Directive
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("schema")}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                        activeTab === "schema"
                          ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                          : "text-xeoo-muted hover:text-xeoo-text"
                      }`}
                    >
                      JSON Schema
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("sample")}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                        activeTab === "sample"
                          ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                          : "text-xeoo-muted hover:text-xeoo-text"
                      }`}
                    >
                      Sample JSON
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        activeTab === "prompt"
                          ? result.promptText
                          : activeTab === "schema"
                            ? result.jsonSchemaText
                            : result.sampleJsonText
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-md bg-xeoo-primary px-3 py-1 text-xs font-semibold text-white shadow-xs transition hover:opacity-90"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copied ? "Copied!" : "Copy Output"}</span>
                  </button>
                </div>

                <div className="min-h-96 flex-1 rounded-lg border border-xeoo-border bg-xeoo-surface p-3.5">
                  <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-xeoo-text select-all bg-xeoo-surface-soft p-3 rounded-md border border-xeoo-border overflow-y-auto max-h-[560px]">
                    {activeTab === "prompt"
                      ? result.promptText
                      : activeTab === "schema"
                        ? result.jsonSchemaText
                        : result.sampleJsonText}
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

