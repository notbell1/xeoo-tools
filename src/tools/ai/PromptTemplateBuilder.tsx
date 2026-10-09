import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  FileCode,
  Info,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showSuccess, showError } from "../../alert";
import {
  buildPromptTemplate,
  type PromptTemplateConfig,
  type TemplateVariable,
} from "./promptTemplateBuilderLogic";

const DEFAULT_VARIABLES: TemplateVariable[] = [
  {
    id: "v-1",
    key: "topic",
    label: "Topic",
    description: "The core subject matter to address",
    defaultValue: "Clean Architecture in TypeScript",
  },
  {
    id: "v-2",
    key: "audience",
    label: "Target Audience",
    description: "The background and expertise of readers",
    defaultValue: "Mid-level web developers",
  },
  {
    id: "v-3",
    key: "length",
    label: "Desired Length",
    description: "Length or depth requirement",
    defaultValue: "Under 600 words",
  },
];

export default function PromptTemplateBuilder() {
  const [title, setTitle] = useState("Technical Article Outline");
  const [role, setRole] = useState("You are an expert technical writer and software architect.");
  const [task, setTask] = useState("Generate a comprehensive, structured article outline about {{topic}} for {{audience}}.");
  const [context, setContext] = useState("The goal is to demystify complex concepts with clear architectural principles.");
  const [constraints, setConstraints] = useState("Strict length limit: {{length}}. Do not include marketing fluff. Provide code example suggestions.");
  const [outputFormat, setOutputFormat] = useState("Markdown document with Roman numeral sections and bullet point takeaways.");
  const [variables, setVariables] = useState<TemplateVariable[]>(DEFAULT_VARIABLES);

  const [activeTab, setActiveTab] = useState<"template" | "example">("template");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Prompt Template Builder | XeooTools";
    const canonicalId = "canonical-prompt-template-builder";
    let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]#${canonicalId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = canonicalId;
      link.rel = "canonical";
      link.href = "https://xeootools.site.je/tools/prompt-template-builder";
      document.head.appendChild(link);
    }
    return () => {
      link?.remove();
    };
  }, []);

  const config: PromptTemplateConfig = {
    title,
    role,
    task,
    context,
    variables,
    constraints,
    outputFormat,
  };

  const result = buildPromptTemplate(config);

  const handleAddVariable = () => {
    const newId = `v-${Date.now()}`;
    setVariables((prev) => [
      ...prev,
      {
        id: newId,
        key: `var_${prev.length + 1}`,
        label: `Variable ${prev.length + 1}`,
        description: "",
        defaultValue: "",
      },
    ]);
  };

  const handleRemoveVariable = (id: string) => {
    setVariables((prev) => prev.filter((v) => v.id !== id));
  };

  const handleUpdateVariable = (id: string, field: keyof TemplateVariable, value: string) => {
    setVariables((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        if (field === "key") {
          // Normalize variable key to alphanumeric/underscore
          return { ...v, [field]: value.replace(/[^a-zA-Z0-9_-]/g, "") };
        }
        return { ...v, [field]: value };
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
      void showError("Copy Error", "Failed to copy text to clipboard.");
    }
  };

  const handleReset = () => {
    setTitle("");
    setRole("");
    setTask("");
    setContext("");
    setConstraints("");
    setOutputFormat("");
    setVariables([]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      <Header />

      <main className="flex-1 px-3 py-4 sm:px-5 sm:py-6">
        <div className="mx-auto w-full max-w-5xl space-y-4">
          {/* TOOL HEADER */}
          <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
            <div className="flex items-center justify-between gap-3 border-b border-xeoo-border px-3.5 py-3 sm:px-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <FileCode size={16} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold tracking-tight text-xeoo-text sm:text-sm">
                    PROMPT TEMPLATE BUILDER
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Create reusable, parameterized AI prompt templates with dynamic variable placeholders.
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
                <strong className="font-semibold text-xeoo-text">Dynamic Placeholders:</strong> Use <code className="font-mono text-xeoo-primary">{"{{variable_name}}"}</code> placeholders to build reusable prompts that team members or workflows can easily fill in.
              </span>
            </div>

            {/* WORKSPACE */}
            <div className="grid grid-cols-1 gap-4 p-3.5 sm:p-5 lg:grid-cols-12">
              {/* LEFT: FORM INPUTS */}
              <div className="space-y-3.5 lg:col-span-6">
                <div>
                  <label className="text-xs font-bold text-xeoo-text">Template Name / Purpose</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Code Review Assistant"
                    className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-xeoo-text">AI Role & Persona</label>
                  <textarea
                    rows={2}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. You are an expert code reviewer specializing in clean code and security..."
                    className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg p-2 text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-xeoo-text">Primary Task (can include variables)</label>
                  <textarea
                    rows={2}
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="e.g. Review the provided {{language}} code snippet for performance and {{security_focus}}."
                    className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg p-2 text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  />
                </div>

                {/* VARIABLES SECTION */}
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Variables ({variables.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddVariable}
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] font-medium text-xeoo-text shadow-xs transition hover:bg-xeoo-surface-soft"
                    >
                      <Plus size={11} />
                      <span>Add Variable</span>
                    </button>
                  </div>

                  {variables.length === 0 ? (
                    <p className="text-[11px] italic text-xeoo-muted">No variables defined yet. Click 'Add Variable' above.</p>
                  ) : (
                    <div className="space-y-2">
                      {variables.map((v) => (
                        <div key={v.id} className="rounded border border-xeoo-border bg-xeoo-surface p-2 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-1/2">
                              <span className="text-[10px] text-xeoo-muted">Placeholder Key:</span>
                              <div className="flex items-center gap-0.5 text-xs font-mono text-xeoo-primary font-bold">
                                <span>{"{{"}</span>
                                <input
                                  type="text"
                                  value={v.key}
                                  onChange={(e) => handleUpdateVariable(v.id, "key", e.target.value)}
                                  placeholder="var_name"
                                  className="w-full bg-transparent px-1 py-0.5 text-xs text-xeoo-text border-b border-xeoo-border focus:border-xeoo-primary focus:outline-none"
                                />
                                <span>{"}}"}</span>
                              </div>
                            </div>

                            <div className="w-1/2">
                              <span className="text-[10px] text-xeoo-muted">Label:</span>
                              <input
                                type="text"
                                value={v.label}
                                onChange={(e) => handleUpdateVariable(v.id, "label", e.target.value)}
                                placeholder="Display Name"
                                className="w-full rounded border border-xeoo-border bg-xeoo-bg px-1.5 py-0.5 text-xs text-xeoo-text focus:outline-none"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveVariable(v.id)}
                              className="mt-3 text-xeoo-muted hover:text-red-500"
                              title="Delete Variable"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={v.defaultValue}
                              onChange={(e) => handleUpdateVariable(v.id, "defaultValue", e.target.value)}
                              placeholder="Example Value (for preview fill)"
                              className="w-full rounded border border-xeoo-border bg-xeoo-bg px-1.5 py-0.5 text-[11px] text-xeoo-text focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-xeoo-text">Constraints & Rules</label>
                  <textarea
                    rows={2}
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder="e.g. Do not recommend deprecated libraries. Keep explanations under 200 words."
                    className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg p-2 text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-xeoo-text">Desired Output Format</label>
                  <input
                    type="text"
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    placeholder="e.g. Markdown bullet points with code snippets"
                    className="mt-1 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* RIGHT: LIVE OUTPUT */}
              <div className="flex flex-col space-y-3 lg:col-span-6">
                <div className="flex items-center justify-between border-b border-xeoo-border pb-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab("template")}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                        activeTab === "template"
                          ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                          : "text-xeoo-muted hover:text-xeoo-text"
                      }`}
                    >
                      Template Schema
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("example")}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                        activeTab === "example"
                          ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                          : "text-xeoo-muted hover:text-xeoo-text"
                      }`}
                    >
                      Example Filled Prompt
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        activeTab === "template"
                          ? result.templateText
                          : result.exampleFilledText
                      )
                    }
                    className="inline-flex h-7 items-center gap-1.5 rounded-md bg-xeoo-primary px-3 text-[11px] font-medium text-white shadow-xs transition hover:opacity-90"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>

                <div className="min-h-96 flex-1 rounded-lg border border-xeoo-border bg-xeoo-surface p-3.5 space-y-3">
                  <div className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-xeoo-text select-all bg-xeoo-surface-soft p-3 rounded-md border border-xeoo-border max-h-[500px] overflow-y-auto">
                    {activeTab === "template" ? result.templateText : result.exampleFilledText}
                  </div>

                  {result.detectedVariables.length > 0 && (
                    <div className="rounded-md border border-xeoo-border bg-xeoo-surface-soft p-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted block mb-1">
                        Detected Variables in Template:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {result.detectedVariables.map((vKey) => (
                          <span
                            key={vKey}
                            className="rounded-md bg-sky-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-sky-700 dark:text-sky-300"
                          >
                            {"{{"}
                            {vKey}
                            {"}}"}
                          </span>
                        ))}
                      </div>
                    </div>
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

