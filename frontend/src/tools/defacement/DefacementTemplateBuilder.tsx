import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  FolderOpen,
  Monitor,
  Plus,
  Redo,
  Save,
  ShieldAlert,
  Sliders,
  Smartphone,
  Tablet,
  Trash2,
  Undo,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import Footer from "../../components/Footer";
import {
  createNewElement,
  generateBuilderHtml,
  STARTER_BUILDER_TEMPLATES,
  type BuilderComponentType,
  type BuilderElement,
  type BuilderProject,
} from "./defacementBuilderLogic";
import { sanitizeFileName } from "./defacementGeneratorLogic";

export default function DefacementTemplateBuilder() {
  const [project, setProject] = useState<BuilderProject>(() => {
    return JSON.parse(JSON.stringify(STARTER_BUILDER_TEMPLATES["cyber-red"]));
  });

  const [history, setHistory] = useState<BuilderProject[]>([
    JSON.parse(JSON.stringify(STARTER_BUILDER_TEMPLATES["cyber-red"])),
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    project.elements[0]?.id || null,
  );
  const [deviceView, setDeviceView] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );
  const [zoomLevel, setZoomLevel] = useState(100);
  const [copied, setCopied] = useState(false);
  const [exportFileName, setExportFileName] = useState("index.html");

  const jsonInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Push new state to undo/redo history
  const pushHistory = (newProject: BuilderProject) => {
    const updated = history.slice(0, historyIndex + 1);
    updated.push(JSON.parse(JSON.stringify(newProject)));
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
    setProject(newProject);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setProject(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setProject(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  // Keyboard Shortcuts (Ctrl+Z / Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Z")
      ) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex, history]);

  // Selected element helper
  const selectedElement = useMemo(() => {
    return project.elements.find((el) => el.id === selectedElementId) || null;
  }, [project.elements, selectedElementId]);

  // Update selected element
  const updateSelectedElement = (patch: Partial<BuilderElement>) => {
    if (!selectedElementId) return;
    const updatedElements = project.elements.map((el) => {
      if (el.id === selectedElementId) {
        return {
          ...el,
          ...patch,
          style: {
            ...el.style,
            ...(patch.style || {}),
          },
        };
      }
      return el;
    });
    pushHistory({
      ...project,
      elements: updatedElements,
    });
  };

  // Add new component block
  const handleAddComponent = (type: BuilderComponentType) => {
    const newElem = createNewElement(type);
    const updated = [...project.elements, newElem];
    pushHistory({
      ...project,
      elements: updated,
    });
    setSelectedElementId(newElem.id);
  };

  // Delete element
  const handleDeleteElement = (id: string) => {
    const updated = project.elements.filter((el) => el.id !== id);
    pushHistory({
      ...project,
      elements: updated,
    });
    if (selectedElementId === id) {
      setSelectedElementId(updated[0]?.id || null);
    }
  };

  // Reorder elements
  const handleMoveElement = (id: string, direction: "up" | "down") => {
    const index = project.elements.findIndex((el) => el.id === id);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === project.elements.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...project.elements];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    pushHistory({
      ...project,
      elements: updated,
    });
  };

  // Toggle visibility
  const handleToggleVisibility = (id: string) => {
    const updated = project.elements.map((el) => {
      if (el.id === id) return { ...el, visible: !el.visible };
      return el;
    });
    pushHistory({
      ...project,
      elements: updated,
    });
  };

  // Apply starter template
  const handleApplyTemplate = (presetKey: string) => {
    const starter = STARTER_BUILDER_TEMPLATES[presetKey];
    if (!starter) return;
    if (
      confirm(
        `Load preset "${starter.title}"? Current canvas changes will be replaced.`,
      )
    ) {
      const cloned = JSON.parse(JSON.stringify(starter));
      pushHistory(cloned);
      setSelectedElementId(cloned.elements[0]?.id || null);
    }
  };

  // Save JSON Project
  const handleSaveJsonProject = () => {
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `xeoo-template-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Load JSON Project
  const handleLoadJsonProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loaded = JSON.parse(event.target?.result as string);
        if (loaded.elements && Array.isArray(loaded.elements)) {
          pushHistory(loaded);
          setSelectedElementId(loaded.elements[0]?.id || null);
        } else {
          alert("Invalid Xeoo project JSON format.");
        }
      } catch {
        alert("Failed to parse project JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Standalone HTML Export
  const standaloneHtml = useMemo(() => {
    return generateBuilderHtml(project);
  }, [project]);

  const handleDownload = (extension: "html" | "htm") => {
    let cleanName = sanitizeFileName(exportFileName);
    if (extension === "htm") {
      cleanName = cleanName.replace(/\.html$/i, ".htm");
      if (!cleanName.endsWith(".htm")) cleanName += ".htm";
    }

    const blob = new Blob([standaloneHtml], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = cleanName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopySource = async () => {
    try {
      await navigator.clipboard.writeText(standaloneHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Handle local image upload for image elements
  const handleImageElementUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElementId) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateSelectedElement({
        data: {
          ...(selectedElement?.data || {}),
          dataUrl,
          fileName: file.name,
        },
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      {/* BUILDER MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* TOP TOOLBAR */}
        <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 border-b border-xeoo-border bg-xeoo-surface px-4 py-2.5 shadow-xs">
          {/* Title & Preset */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xeoo-danger font-bold text-xs uppercase">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Template Builder</span>
            </div>

            <div className="h-4 w-px bg-xeoo-border" />

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-xeoo-muted font-semibold">
                Preset:
              </span>
              <select
                value={project.themeId}
                onChange={(e) => handleApplyTemplate(e.target.value)}
                className="rounded border border-xeoo-border bg-xeoo-bg px-2 py-1 text-xs text-xeoo-text outline-none"
              >
                <option value="cyber-red">Cyber Red Breach</option>
                <option value="matrix">Matrix Green Console</option>
              </select>
            </div>
          </div>

          {/* Undo / Redo & Device Switcher & Zoom */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="flex h-7 w-7 items-center justify-center rounded border border-xeoo-border text-xeoo-muted hover:text-xeoo-text disabled:opacity-30"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              className="flex h-7 w-7 items-center justify-center rounded border border-xeoo-border text-xeoo-muted hover:text-xeoo-text disabled:opacity-30"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-3.5 w-3.5" />
            </button>

            <div className="h-4 w-px bg-xeoo-border" />

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDeviceView("desktop")}
                className={`flex h-7 w-7 items-center justify-center rounded ${
                  deviceView === "desktop"
                    ? "bg-xeoo-text text-xeoo-surface"
                    : "text-xeoo-muted hover:text-xeoo-text"
                }`}
                title="Desktop"
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceView("tablet")}
                className={`flex h-7 w-7 items-center justify-center rounded ${
                  deviceView === "tablet"
                    ? "bg-xeoo-text text-xeoo-surface"
                    : "text-xeoo-muted hover:text-xeoo-text"
                }`}
                title="Tablet"
              >
                <Tablet className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceView("mobile")}
                className={`flex h-7 w-7 items-center justify-center rounded ${
                  deviceView === "mobile"
                    ? "bg-xeoo-text text-xeoo-surface"
                    : "text-xeoo-muted hover:text-xeoo-text"
                }`}
                title="Mobile"
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="h-4 w-px bg-xeoo-border" />

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                className="flex h-7 w-7 items-center justify-center rounded border border-xeoo-border text-xeoo-muted hover:text-xeoo-text"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono text-[11px] text-xeoo-muted min-w-[36px] text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                className="flex h-7 w-7 items-center justify-center rounded border border-xeoo-border text-xeoo-muted hover:text-xeoo-text"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Project JSON & Export Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveJsonProject}
              className="flex items-center gap-1 rounded border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-xs font-semibold text-xeoo-text hover:bg-xeoo-surface-soft"
              title="Save project locally as JSON"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save JSON</span>
            </button>

            <input
              type="file"
              ref={jsonInputRef}
              accept=".json"
              onChange={handleLoadJsonProject}
              className="hidden"
              id="json-file-input"
            />
            <label
              htmlFor="json-file-input"
              className="flex items-center gap-1 cursor-pointer rounded border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-xs font-semibold text-xeoo-text hover:bg-xeoo-surface-soft"
              title="Load saved project JSON"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              <span>Load JSON</span>
            </label>

            <div className="h-4 w-px bg-xeoo-border" />

            <button
              type="button"
              onClick={handleCopySource}
              className="flex items-center gap-1 rounded border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-xs font-semibold text-xeoo-text hover:bg-xeoo-surface-soft"
              title="Copy standalone HTML to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-xeoo-success" />
                  <span className="text-xeoo-success">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <input
              type="text"
              value={exportFileName}
              onChange={(e) => setExportFileName(e.target.value)}
              className="w-24 rounded border border-xeoo-border bg-xeoo-bg px-2 py-1 text-xs text-xeoo-text outline-none font-mono"
              placeholder="index.html"
              title="Export file name"
            />

            <button
              type="button"
              onClick={() => handleDownload("html")}
              className="flex items-center gap-1.5 rounded-lg bg-xeoo-text px-3 py-1 text-xs font-bold text-xeoo-surface shadow hover:opacity-90"
              title="Download standalone .html file"
            >
              <Download className="h-3.5 w-3.5" />
              <span>.HTML</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownload("htm")}
              className="flex items-center gap-1 rounded border border-xeoo-border bg-xeoo-surface px-2 py-1 text-xs font-semibold text-xeoo-text hover:bg-xeoo-surface-soft"
              title="Download standalone .htm file"
            >
              <span>.HTM</span>
            </button>
          </div>
        </div>

        {/* 3-COLUMN WORKSPACE: [LAYERS & BLOCKS (LEFT)] | [CANVAS (CENTER)] | [PROPERTIES (RIGHT)] */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 bg-xeoo-bg">
          {/* LEFT COLUMN: LAYERS & COMPONENT LIBRARY (3 COLS) */}
          <div className="border-r border-xeoo-border bg-xeoo-surface p-3 space-y-4 lg:col-span-3 overflow-y-auto max-h-[calc(100vh-140px)]">
            {/* Add Component Dropdown */}
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-xeoo-muted mb-2">
                Insert Component Block
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {(
                  [
                    { type: "headline", label: "Headline" },
                    { type: "subtitle", label: "Subtitle" },
                    { type: "paragraph", label: "Paragraph" },
                    { type: "badge", label: "Badge Pill" },
                    { type: "image", label: "Image Block" },
                    { type: "terminal", label: "Terminal Box" },
                    { type: "stats", label: "Stats Group" },
                    { type: "quote", label: "Quote Box" },
                    { type: "alert", label: "Alert Banner" },
                    { type: "marquee", label: "Marquee Scroll" },
                    { type: "divider", label: "Divider Line" },
                    { type: "footer", label: "Footer Row" },
                  ] as const
                ).map((comp) => (
                  <button
                    key={comp.type}
                    type="button"
                    onClick={() => handleAddComponent(comp.type)}
                    className="flex items-center gap-1.5 rounded-md border border-xeoo-border bg-xeoo-surface-soft px-2 py-1.5 text-left text-[11px] font-semibold text-xeoo-text hover:border-xeoo-primary hover:bg-xeoo-surface"
                  >
                    <Plus className="h-3 w-3 text-xeoo-primary" />
                    <span className="truncate">{comp.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Layers Tree */}
            <div className="border-t border-xeoo-border pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                  Layers Tree ({project.elements.length})
                </span>
              </div>

              <div className="space-y-1">
                {project.elements.map((elem, idx) => {
                  const isSelected = elem.id === selectedElementId;
                  return (
                    <div
                      key={elem.id}
                      onClick={() => setSelectedElementId(elem.id)}
                      className={`group flex items-center justify-between rounded-md border px-2 py-1.5 text-xs cursor-pointer transition ${
                        isSelected
                          ? "border-xeoo-primary bg-xeoo-primary-soft font-bold text-xeoo-primary"
                          : "border-xeoo-border bg-xeoo-surface-soft text-xeoo-text hover:bg-xeoo-surface"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-mono text-[10px] text-xeoo-muted">
                          #{idx + 1}
                        </span>
                        <span className="truncate">{elem.name}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleVisibility(elem.id);
                          }}
                          className="text-xeoo-muted hover:text-xeoo-text"
                          title="Toggle visibility"
                        >
                          {elem.visible ? (
                            <Eye className="h-3 w-3" />
                          ) : (
                            <EyeOff className="h-3 w-3 text-xeoo-danger" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveElement(elem.id, "up");
                          }}
                          disabled={idx === 0}
                          className="text-xeoo-muted hover:text-xeoo-text disabled:opacity-20"
                          title="Move up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveElement(elem.id, "down");
                          }}
                          disabled={idx === project.elements.length - 1}
                          className="text-xeoo-muted hover:text-xeoo-text disabled:opacity-20"
                          title="Move down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteElement(elem.id);
                          }}
                          className="text-xeoo-muted hover:text-xeoo-danger"
                          title="Delete element"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: LIVE INTERACTIVE CANVAS (6 COLS) */}
          <div className="lg:col-span-6 p-4 flex flex-col items-center justify-center bg-black/60 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div
              className="w-full transition-all duration-200 border border-xeoo-border rounded-xl shadow-2xl overflow-hidden min-h-[500px]"
              style={{
                maxWidth:
                  deviceView === "desktop"
                    ? "100%"
                    : deviceView === "tablet"
                      ? "768px"
                      : "375px",
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "top center",
              }}
            >
              <iframe
                title="Builder Live Canvas"
                srcDoc={standaloneHtml}
                sandbox="allow-scripts"
                className="w-full h-[620px] bg-transparent border-0"
              />
            </div>
          </div>

          {/* RIGHT COLUMN: PROPERTY INSPECTOR (3 COLS) */}
          <div className="border-l border-xeoo-border bg-xeoo-surface p-3 space-y-3.5 lg:col-span-3 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="border-b border-xeoo-border pb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                Properties Inspector
              </span>
              <Sliders className="h-3.5 w-3.5 text-xeoo-muted" />
            </div>

            {selectedElement ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-xeoo-muted uppercase">
                    Element Name
                  </label>
                  <input
                    type="text"
                    value={selectedElement.name}
                    onChange={(e) =>
                      updateSelectedElement({ name: e.target.value })
                    }
                    className="mt-1 w-full rounded border border-xeoo-border bg-xeoo-bg px-2 py-1 text-xs text-xeoo-text"
                  />
                </div>

                {/* Text Content */}
                {selectedElement.type !== "divider" &&
                  selectedElement.type !== "image" && (
                    <div>
                      <label className="block text-[10px] font-bold text-xeoo-muted uppercase">
                        Content Text
                      </label>
                      <textarea
                        rows={2}
                        value={selectedElement.content}
                        onChange={(e) =>
                          updateSelectedElement({ content: e.target.value })
                        }
                        className="mt-1 w-full rounded border border-xeoo-border bg-xeoo-bg px-2 py-1 text-xs text-xeoo-text"
                      />
                    </div>
                  )}

                {/* Image Block Upload */}
                {(selectedElement.type === "image" ||
                  selectedElement.type === "logo" ||
                  selectedElement.type === "hero") && (
                  <div className="rounded border border-dashed border-xeoo-border p-2.5 text-center">
                    {selectedElement.data?.dataUrl ? (
                      <div className="space-y-1.5">
                        <img
                          src={selectedElement.data.dataUrl}
                          alt="preview"
                          className="h-16 w-16 object-contain mx-auto rounded border"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateSelectedElement({
                              data: {
                                ...selectedElement.data,
                                dataUrl: "",
                              },
                            })
                          }
                          className="rounded bg-xeoo-danger-soft px-2 py-0.5 text-[10px] font-bold text-xeoo-danger"
                        >
                          Clear Image
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          ref={imageInputRef}
                          accept="image/*"
                          onChange={handleImageElementUpload}
                          className="hidden"
                          id="elem-img-upload"
                        />
                        <label
                          htmlFor="elem-img-upload"
                          className="cursor-pointer inline-block rounded bg-xeoo-text px-2.5 py-1 text-[11px] font-bold text-xeoo-surface"
                        >
                          Choose Local File
                        </label>
                        <p className="mt-1 text-[9px] text-xeoo-muted">
                          Local only • No server upload
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Typography Controls */}
                <div className="border-t border-xeoo-border pt-2 space-y-2">
                  <span className="block text-[10px] font-bold uppercase text-xeoo-muted">
                    Typography & Align
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-xeoo-muted">
                        Font Size (
                        {selectedElement.style?.fontSize || 14}px)
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="72"
                        value={selectedElement.style?.fontSize || 14}
                        onChange={(e) =>
                          updateSelectedElement({
                            style: {
                              ...selectedElement.style,
                              fontSize: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-xeoo-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-xeoo-muted">
                        Text Align
                      </label>
                      <select
                        value={selectedElement.style?.textAlign || "center"}
                        onChange={(e) =>
                          updateSelectedElement({
                            style: {
                              ...selectedElement.style,
                              textAlign: e.target.value as any,
                            },
                          })
                        }
                        className="w-full rounded border border-xeoo-border bg-xeoo-bg px-1.5 py-1 text-xs"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Spacing & Sizing */}
                <div className="border-t border-xeoo-border pt-2 space-y-2">
                  <span className="block text-[10px] font-bold uppercase text-xeoo-muted">
                    Margin & Padding
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-xeoo-muted">
                        Margin Bottom (
                        {selectedElement.style?.marginBottom || 0}px)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="60"
                        value={selectedElement.style?.marginBottom || 0}
                        onChange={(e) =>
                          updateSelectedElement({
                            style: {
                              ...selectedElement.style,
                              marginBottom: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-xeoo-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-xeoo-muted">
                        Border Radius (
                        {selectedElement.style?.borderRadius || 0}px)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={selectedElement.style?.borderRadius || 0}
                        onChange={(e) =>
                          updateSelectedElement({
                            style: {
                              ...selectedElement.style,
                              borderRadius: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-xeoo-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-xeoo-muted">
                Select an element from the layers or canvas to inspect
                properties.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
