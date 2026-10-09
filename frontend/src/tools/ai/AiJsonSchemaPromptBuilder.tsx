import { useEffect, useRef, useState } from "react";
import {
  Braces,
  Check,
  ChevronDown,
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

const FIELD_TYPE_OPTIONS: {
  value: JsonFieldType;
  label: string;
}[] = [
  { value: "string", label: "string" },
  { value: "number", label: "number" },
  { value: "boolean", label: "boolean" },
  { value: "array", label: "array" },
  { value: "object", label: "object" },
];

const dropdownTriggerClass =
  "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-xeoo-border bg-xeoo-bg px-3 text-left text-[11px] font-medium text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20 disabled:cursor-not-allowed disabled:opacity-60";

const dropdownMenuClass =
  "absolute left-0 z-30 mt-1 w-full overflow-hidden rounded-md border border-xeoo-border bg-xeoo-surface p-1 shadow-xl";

function FieldTypeDropdown({
  value,
  onChange,
}: {
  value: JsonFieldType;
  onChange: (value: JsonFieldType) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selectedOption =
    FIELD_TYPE_OPTIONS.find((option) => option.value === value) ??
    FIELD_TYPE_OPTIONS[0];

  return (
    <div ref={dropdownRef} className="relative w-1/3 min-w-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className={`${dropdownTriggerClass} ${
          open ? "border-xeoo-primary/60" : ""
        }`}
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown
          size={12}
          className={`shrink-0 text-xeoo-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Field type"
          className={dropdownMenuClass}
        >
          {FIELD_TYPE_OPTIONS.map((option) => {
            const selected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex h-7 w-full items-center justify-between gap-2 rounded px-2 text-left text-[10px] font-semibold transition ${
                  selected
                    ? "bg-xeoo-primary text-white"
                    : "text-xeoo-text hover:bg-xeoo-bg"
                }`}
              >
                <span>{option.label}</span>
                {selected && <Check size={11} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AiJsonSchemaPromptBuilder() {
  const [title, setTitle] = useState("ProductData");
  const [description, setDescription] = useState(
    "Extraction schema for catalog item specifications.",
  );
  const [strictMode, setStrictMode] = useState(true);
  const [fields, setFields] = useState<SchemaField[]>(DEFAULT_FIELDS);

  const [activeTab, setActiveTab] = useState<"prompt" | "schema" | "sample">(
    "prompt",
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "AI JSON Schema Prompt Builder | XeooTools";

    const canonicalId = "canonical-ai-json-schema-prompt-builder";
    let link = document.querySelector<HTMLLinkElement>(
      `link[rel="canonical"]#${canonicalId}`,
    );

    const createdLink = !link;

    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      link.href =
        "https://xeootools.site.je/tools/ai-json-schema-prompt-builder";
      document.head.appendChild(link);
    }

    return () => {
      if (createdLink) {
        link?.remove();
      }
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
    setFields((prev) => prev.filter((field) => field.id !== id));
  };

  const handleUpdateField = (
    id: string,
    key: keyof SchemaField,
    val: unknown,
  ) => {
    setFields((prev) =>
      prev.map((field) => {
        if (field.id !== id) return field;

        if (key === "name") {
          return {
            ...field,
            [key]: String(val).replace(/[^a-zA-Z0-9_]/g, ""),
          };
        }

        return { ...field, [key]: val };
      }),
    );
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);

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

  const outputText =
    activeTab === "prompt"
      ? result.promptText
      : activeTab === "schema"
        ? result.jsonSchemaText
        : result.sampleJsonText;

  // Styling bersama untuk keempat tombol output.
  const outputButtonBase =
    "inline-flex h-8 min-w-0 items-center justify-center gap-1 rounded-md border px-1.5 text-[10px] font-semibold leading-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xeoo-primary/30 sm:gap-1.5 sm:px-2 sm:text-[11px]";

  const outputTabClass = (tab: "prompt" | "schema" | "sample") =>
    `${outputButtonBase} flex-1 ${
      activeTab === tab
        ? "border-xeoo-text bg-xeoo-text text-xeoo-surface"
        : "border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:bg-xeoo-surface-soft hover:text-xeoo-text"
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      <Header />

      <main className="flex-1 px-3 py-4 sm:px-5 sm:py-6">
        <div className="mx-auto w-full max-w-5xl space-y-4">
          <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
            {/* HEADER */}
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
                    Build structured output prompts, draft-07 JSON schemas, and
                    extraction contracts for AI pipelines.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-medium text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            {/* INFORMATION */}
            <div className="flex items-start gap-2 border-b border-xeoo-border bg-xeoo-surface-soft px-3.5 py-2.5 text-[11px] text-xeoo-text-soft">
              <Info size={14} className="mt-0.5 shrink-0 text-xeoo-primary" />
              <span>
                <strong className="font-semibold text-xeoo-text">
                  Structured Outputs:
                </strong>{" "}
                Instructs frontier AI models (OpenAI Structured Outputs,
                Anthropic Tool Use, Gemini JSON mode) to respond strictly within
                a validated JSON format.
              </span>
            </div>

            {/* WORKSPACE */}
            <div className="grid grid-cols-1 gap-4 p-3.5 sm:p-5 lg:grid-cols-12">
              {/* LEFT: SCHEMA DEFINITION FORM */}
              <div className="space-y-3.5 lg:col-span-6">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="schema-name"
                      className="text-xs font-bold text-xeoo-text"
                    >
                      Schema Name
                    </label>
                    <input
                      id="schema-name"
                      type="text"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="e.g. UserProfile"
                      className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 font-mono text-xs text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-xeoo-text">
                      Strict Mode
                    </label>

                    <div className="mt-1 flex h-8 items-center">
                      <label className="flex cursor-pointer items-center gap-2 text-xs text-xeoo-text">
                        <input
                          type="checkbox"
                          checked={strictMode}
                          onChange={(event) =>
                            setStrictMode(event.target.checked)
                          }
                          className="rounded border-xeoo-border text-xeoo-primary focus:ring-xeoo-primary"
                        />
                        <span>Disallow extra keys</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="schema-description"
                    className="text-xs font-bold text-xeoo-text"
                  >
                    Purpose / Description
                  </label>
                  <input
                    id="schema-description"
                    type="text"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Brief description of the expected output"
                    className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
                  />
                </div>

                {/* FIELDS LIST */}
                <div className="space-y-2.5 rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Schema Properties ({fields.length})
                    </span>

                    <button
                      type="button"
                      onClick={handleAddField}
                      className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-medium text-xeoo-text shadow-xs transition hover:bg-xeoo-surface-soft"
                    >
                      <Plus size={11} />
                      <span>Add Property</span>
                    </button>
                  </div>

                  {fields.length === 0 ? (
                    <p className="text-[11px] italic text-xeoo-muted">
                      No fields defined. Click 'Add Property' above.
                    </p>
                  ) : (
                    <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                      {fields.map((field) => (
                        <div
                          key={field.id}
                          className="space-y-1.5 rounded border border-xeoo-border bg-xeoo-surface p-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={field.name}
                              onChange={(event) =>
                                handleUpdateField(
                                  field.id,
                                  "name",
                                  event.target.value,
                                )
                              }
                              placeholder="keyName"
                              aria-label="Property name"
                              className="w-1/3 min-w-0 rounded border border-xeoo-border bg-xeoo-bg px-2 py-1 font-mono text-xs font-bold text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
                            />

                            {/* CUSTOM TYPE DROPDOWN */}
                            <FieldTypeDropdown
                              value={field.type}
                              onChange={(value) =>
                                handleUpdateField(field.id, "type", value)
                              }
                            />

                            <label className="flex shrink-0 cursor-pointer items-center gap-1 text-[11px] text-xeoo-muted">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(event) =>
                                  handleUpdateField(
                                    field.id,
                                    "required",
                                    event.target.checked,
                                  )
                                }
                                className="rounded border-xeoo-border text-xeoo-primary focus:ring-xeoo-primary"
                              />
                              <span>Req</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => handleRemoveField(field.id)}
                              className="ml-auto shrink-0 text-xeoo-muted transition hover:text-red-500"
                              title="Delete property"
                              aria-label={`Delete ${field.name || "property"}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={field.description}
                              onChange={(event) =>
                                handleUpdateField(
                                  field.id,
                                  "description",
                                  event.target.value,
                                )
                              }
                              placeholder="Description for LLM (e.g. 'Customer full name')"
                              aria-label={`Description for ${field.name || "property"}`}
                              className="w-full rounded border border-xeoo-border bg-xeoo-bg px-2 py-1 text-[11px] text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
                            />
                          </div>

                          {field.type === "string" && (
                            <input
                              type="text"
                              value={field.enumValues || ""}
                              onChange={(event) =>
                                handleUpdateField(
                                  field.id,
                                  "enumValues",
                                  event.target.value,
                                )
                              }
                              placeholder="Optional enum options (e.g. 'active, pending, suspended')"
                              aria-label={`Enum values for ${field.name || "property"}`}
                              className="w-full rounded border border-xeoo-border/60 bg-transparent px-2 py-1 font-mono text-[10px] text-xeoo-muted outline-none transition focus:border-xeoo-primary focus:text-xeoo-text"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: LIVE OUTPUT */}
              <div className="flex min-w-0 flex-col space-y-3 lg:col-span-6">
                {/* FOUR CONSISTENT BUTTONS — ALWAYS ONE ROW */}
                <div className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-1 border-b border-xeoo-border pb-2 sm:gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("prompt")}
                    aria-pressed={activeTab === "prompt"}
                    className={outputTabClass("prompt")}
                  >
                    <span className="truncate">Prompt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("schema")}
                    aria-pressed={activeTab === "schema"}
                    className={outputTabClass("schema")}
                  >
                    <span className="truncate">JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("sample")}
                    aria-pressed={activeTab === "sample"}
                    className={outputTabClass("sample")}
                  >
                    <span className="truncate">Sample</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(outputText)}
                    className={`${outputButtonBase} shrink-0 border-xeoo-primary bg-xeoo-primary text-white hover:opacity-90`}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span className="hidden min-[420px]:inline">
                      {copied ? "Copied!" : "Copy"}
                    </span>
                    <span className="min-[420px]:hidden">
                      {copied ? "Copied" : "Copy"}
                    </span>
                  </button>
                </div>

                <div className="min-h-96 min-w-0 flex-1 rounded-lg border border-xeoo-border bg-xeoo-surface p-3.5">
                  <pre className="max-h-[560px] overflow-y-auto whitespace-pre-wrap break-words rounded-md border border-xeoo-border bg-xeoo-surface-soft p-3 font-mono text-[11px] leading-relaxed text-xeoo-text select-all">
                    {outputText}
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
