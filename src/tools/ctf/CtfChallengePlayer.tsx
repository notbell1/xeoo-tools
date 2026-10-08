import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileCode,
  Globe,
  Terminal,
  Wrench,
  HelpCircle,
  CheckCircle2,
  Lock,
  Unlock,
  Copy,
  RotateCcw,
  Send,
  Loader2,
  AlertTriangle,
  Monitor,
  Tablet,
  Smartphone,
  FileText,
  Search,
} from "lucide-react";
import { ctfApi } from "./ctfApi";
import { useCtfAuth } from "./ctfAuth";
import type {
  ChallengeDetail,
  ChallengeArtifact,
  ChallengeHint,
} from "./ctfTypes";
import { buildSecureSandboxHtml, isValidFlagFormat } from "./ctfSecurity";
import { showConfirm, showError, showSuccess, showWarning } from "../../alert";

type ActiveTab = "briefing" | "artifacts" | "sandbox" | "dom" | "workbench" | "hints";

export const CtfChallengePlayer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, solvedChallengeIds, markChallengeSolved, settings } = useCtfAuth();

  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active workspace tab
  const [activeTab, setActiveTab] = useState<ActiveTab>("briefing");

  // Artifact explorer state
  const [selectedArtifactIndex, setSelectedArtifactIndex] = useState<number>(0);

  // Sandbox state
  const [sandboxViewport, setSandboxViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [sandboxKey, setSandboxKey] = useState<number>(0);

  // Flag submission state
  const [flagInput, setFlagInput] = useState<string>("");
  const [submittingFlag, setSubmittingFlag] = useState<boolean>(false);

  // Hints state
  const [hints, setHints] = useState<ChallengeHint[]>([]);
  const [unlockingHintId, setUnlockingHintId] = useState<number | null>(null);

  // Workbench helper state
  const [wbInput, setWbInput] = useState<string>("");
  const [wbOutput, setWbOutput] = useState<string>("");
  const [rotShift, setRotShift] = useState<number>(13);
  const [notes, setNotes] = useState<string>("");

  // Source search in DOM tab
  const [sourceSearch, setSourceSearch] = useState<string>("");

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setErrorMsg(null);

    ctfApi
      .getChallengeDetail(slug)
      .then((res) => {
        if (res.success && res.data?.challenge) {
          const ch = res.data.challenge;
          setChallenge(ch);
          setHints(ch.hints || []);
          setSelectedArtifactIndex(0);
          // Load local notes if any
          const savedNotes = localStorage.getItem(`ctf_notes_${ch.id}`);
          if (savedNotes) {
            setNotes(savedNotes);
          }
        } else {
          setErrorMsg(res.error || "Failed to load challenge file");
        }
      })
      .catch((err) => {
        setErrorMsg(err.message || "Failed to load challenge file");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  // Save notes locally
  const handleNotesChange = (val: string) => {
    setNotes(val);
    if (challenge) {
      localStorage.setItem(`ctf_notes_${challenge.id}`, val);
    }
  };

  const isSolved = useMemo(() => {
    if (!challenge) return false;
    return challenge.solved || solvedChallengeIds.has(challenge.id);
  }, [challenge, solvedChallengeIds]);

  // Selected artifact
  const currentArtifact: ChallengeArtifact | null = useMemo(() => {
    if (!challenge || !challenge.artifacts || challenge.artifacts.length === 0) return null;
    return challenge.artifacts[selectedArtifactIndex] || challenge.artifacts[0];
  }, [challenge, selectedArtifactIndex]);

  // Primary HTML artifact for live sandbox
  const primaryHtmlArtifact: ChallengeArtifact | null = useMemo(() => {
    if (!challenge || !challenge.artifacts) return null;
    return challenge.artifacts.find((a) => a.type === "html") || challenge.artifacts[0] || null;
  }, [challenge]);

  // Sandbox Document Content
  const sandboxDocument = useMemo(() => {
    if (!primaryHtmlArtifact) return "";
    return buildSecureSandboxHtml(primaryHtmlArtifact.content, challenge?.title);
  }, [primaryHtmlArtifact, challenge?.title]);

  // Flag Submission Handler
  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;

    const trimmedFlag = flagInput.trim();
    if (!trimmedFlag) {
      showWarning("Empty Submission", "Please enter a flag to submit.");
      return;
    }

    if (!isValidFlagFormat(trimmedFlag)) {
      showWarning("Invalid Format", "Flag must strictly match the format: XEOO{...}");
      return;
    }

    if (!isAuthenticated) {
      showWarning("Session Required", "Please log in to register your solve and earn points.");
      return;
    }

    if (!settings.submissions_enabled) {
      showWarning("Submissions Locked", "Flag submissions are currently paused by CTF Command.");
      return;
    }

    setSubmittingFlag(true);
    try {
      const res = await ctfApi.submitFlag(challenge.id, trimmedFlag);
      if (res.success && res.data) {
        if (res.data.solved) {
          showSuccess("FLAG ACCEPTED!", res.data.message || `+${res.data.points_awarded} Points Awarded!`);
          markChallengeSolved(challenge.id, res.data.points_awarded);
          setChallenge((prev) => (prev ? { ...prev, solved: true } : prev));
          setFlagInput("");
        } else {
          showError("Incorrect Flag", res.data.message || "That is not the correct flag for this case.");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission rejected";
      showError("Submission Error", msg);
    } finally {
      setSubmittingFlag(false);
    }
  };

  // Unlock Hint Handler
  const handleUnlockHint = async (hint: ChallengeHint) => {
    if (!challenge) return;
    if (hint.unlocked) return;

    if (!isAuthenticated) {
      showWarning("Authentication Required", "Please log in to unlock hints.");
      return;
    }

    if (!settings.submissions_enabled) {
      showWarning("Feature Disabled", "Revealing hints is temporarily disabled because flag submission is paused.");
      return;
    }

    const confirmed = await showConfirm(
      `Unlock Hint "${hint.title}"?`,
      `Unlocking this hint will deduct ${hint.cost} points from your final reward.`
    );

    if (!confirmed) return;

    setUnlockingHintId(hint.id);
    try {
      const res = await ctfApi.unlockHint(challenge.id, hint.id);
      if (res.success && res.data) {
        setHints((prev) =>
          prev.map((h) =>
            h.id === hint.id ? { ...h, unlocked: true, hint_text: res.data?.content || h.hint_text } : h
          )
        );
        showSuccess("Hint Unlocked", `Penalty of ${res.data.cost} points applied.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to unlock hint";
      showError("Unlock Failed", msg);
    } finally {
      setUnlockingHintId(null);
    }
  };

  // Workbench Actions
  const runBase64Decode = () => {
    try {
      setWbOutput(atob(wbInput.trim()));
    } catch {
      setWbOutput("[Error: Invalid Base64 payload]");
    }
  };

  const runBase64Encode = () => {
    try {
      setWbOutput(btoa(wbInput));
    } catch {
      setWbOutput("[Error: Unable to encode]");
    }
  };

  const runHexDecode = () => {
    try {
      const cleanHex = wbInput.replace(/[^0-9a-fA-F]/g, "");
      let str = "";
      for (let i = 0; i < cleanHex.length; i += 2) {
        str += String.fromCharCode(parseInt(cleanHex.substr(i, 2), 16));
      }
      setWbOutput(str);
    } catch {
      setWbOutput("[Error: Invalid Hex string]");
    }
  };

  const runHexEncode = () => {
    try {
      let hex = "";
      for (let i = 0; i < wbInput.length; i++) {
        hex += wbInput.charCodeAt(i).toString(16).padStart(2, "0");
      }
      setWbOutput(hex);
    } catch {
      setWbOutput("[Error: Unable to convert to Hex]");
    }
  };

  const runUrlDecode = () => {
    try {
      setWbOutput(decodeURIComponent(wbInput));
    } catch {
      setWbOutput("[Error: Invalid URL encoding]");
    }
  };

  const runRotCipher = () => {
    try {
      const shift = ((rotShift % 26) + 26) % 26;
      const res = wbInput.replace(/[a-zA-Z]/g, (char) => {
        const base = char <= "Z" ? 65 : 97;
        return String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);
      });
      setWbOutput(res);
    } catch {
      setWbOutput("[Error: Cipher transformation failed]");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess("Copied", "Text copied to clipboard.");
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-xeoo-primary" />
        <p className="text-xs font-mono text-xeoo-muted">Unpacking forensic evidence locker...</p>
      </div>
    );
  }

  if (errorMsg || !challenge) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full border border-xeoo-border bg-xeoo-surface rounded-2xl p-8 text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-xeoo-danger mx-auto" />
          <h2 className="text-lg font-bold text-xeoo-text">Failed to Access Case File</h2>
          <p className="text-xs text-xeoo-muted">{errorMsg || "Case file could not be loaded."}</p>
          <Link
            to="/ctf/challenges"
            className="inline-flex items-center gap-1.5 rounded-lg bg-xeoo-primary px-4 py-2 text-xs font-semibold text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Case Registry
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 lg:px-8 space-y-4">
      {/* Top Dossier Header Bar */}
      <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                to="/ctf/challenges"
                className="inline-flex items-center gap-1 text-xs font-semibold text-xeoo-muted hover:text-xeoo-text transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Case Files
              </Link>
              <span className="text-xeoo-muted text-xs">/</span>
              <span className="font-mono text-xs font-bold text-xeoo-primary">{challenge.case_reference}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-xeoo-text">{challenge.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                  challenge.difficulty === "easy"
                    ? "bg-xeoo-success/15 text-xeoo-success border border-xeoo-success/30"
                    : challenge.difficulty === "medium"
                    ? "bg-xeoo-warning/15 text-xeoo-warning border border-xeoo-warning/30"
                    : "bg-xeoo-danger/15 text-xeoo-danger border border-xeoo-danger/30"
                }`}
              >
                {challenge.difficulty}
              </span>
              <span className="rounded-md bg-xeoo-surface-soft border border-xeoo-border px-2 py-0.5 text-[10px] font-mono text-xeoo-muted uppercase">
                {challenge.category.replace(/_/g, " ")}
              </span>
              <span className="font-mono text-xs font-bold text-xeoo-primary">
                {challenge.points} PTS
              </span>
              <span className="text-xs text-xeoo-muted">•</span>
              <span className="font-mono text-xs text-xeoo-muted">~{challenge.estimated_minutes}m est.</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isSolved ? (
              <div className="flex items-center gap-2 rounded-xl border border-xeoo-success/40 bg-xeoo-success/10 px-4 py-2 text-xs font-bold text-xeoo-success">
                <CheckCircle2 className="h-4 w-4" />
                SOLVED (+{challenge.points} PTS)
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs font-mono text-xeoo-muted">
                <Lock className="h-3.5 w-3.5" />
                INVESTIGATION ACTIVE
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workspace Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-xeoo-border pb-1">
        {[
          { id: "briefing", label: "Dossier & Intel", icon: FileText },
          {
            id: "artifacts",
            label: `Evidence Locker (${challenge.artifacts?.length || 0})`,
            icon: FileCode,
          },
          { id: "sandbox", label: "Live Target Sandbox", icon: Globe },
          { id: "dom", label: "DOM & Source Inspector", icon: Terminal },
          { id: "workbench", label: "Forensic Workbench", icon: Wrench },
          {
            id: "hints",
            label: `Assistance (${hints.filter((h) => h.unlocked).length}/${hints.length})`,
            icon: HelpCircle,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                active
                  ? "bg-xeoo-primary text-white shadow-xs"
                  : "text-xeoo-muted hover:text-xeoo-text hover:bg-xeoo-surface"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Workspace Body */}
      <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5 min-h-[460px]">
        {/* TAB 1: DOSSIER & INTEL */}
        {activeTab === "briefing" && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-xeoo-muted mb-2 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-xeoo-primary" />
                Incident Briefing & Scenario
              </h2>
              <p className="text-sm text-xeoo-text leading-relaxed whitespace-pre-line">
                {challenge.scenario}
              </p>
            </div>

            {challenge.objective && (
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-xeoo-primary">
                  Forensic Objective
                </h3>
                <p className="text-xs text-xeoo-text leading-relaxed whitespace-pre-line font-mono">
                  {challenge.objective}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-4 space-y-1.5">
                <span className="text-[11px] font-mono font-bold uppercase text-xeoo-muted">Investigation Protocol</span>
                <p className="text-xs text-xeoo-text">
                  Inspect the artifacts, analyze source patterns, and decode obfuscated artifacts. The target
                  site does not contain plain flags.
                </p>
              </div>

              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-4 space-y-1.5">
                <span className="text-[11px] font-mono font-bold uppercase text-xeoo-muted">Verification Standard</span>
                <p className="text-xs text-xeoo-text font-mono">
                  Target Flag: <code className="text-xeoo-primary font-bold">XEOO&#123;...&#125;</code> (Server Verified)
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("artifacts")}
                className="inline-flex items-center gap-2 rounded-lg bg-xeoo-primary px-4 py-2 text-xs font-bold text-white hover:opacity-95 cursor-pointer"
              >
                <FileCode className="h-4 w-4" />
                Inspect Evidence Files
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("sandbox")}
                className="inline-flex items-center gap-2 rounded-lg border border-xeoo-border bg-xeoo-surface px-4 py-2 text-xs font-bold text-xeoo-text hover:bg-xeoo-surface-soft cursor-pointer"
              >
                <Globe className="h-4 w-4" />
                Launch Live Sandbox
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: ARTIFACTS & EVIDENCE LOCKER */}
        {activeTab === "artifacts" && (
          <div className="space-y-4">
            {/* Artifact File Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-xeoo-border">
              {challenge.artifacts?.map((art, idx) => (
                <button
                  key={art.id}
                  type="button"
                  onClick={() => setSelectedArtifactIndex(idx)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-mono transition-all cursor-pointer ${
                    selectedArtifactIndex === idx
                      ? "bg-xeoo-surface-soft border border-xeoo-primary/40 text-xeoo-primary font-bold"
                      : "text-xeoo-muted hover:text-xeoo-text"
                  }`}
                >
                  <FileCode className="h-3.5 w-3.5" />
                  <span>{art.name}</span>
                  <span className="text-[10px] uppercase opacity-75">({art.type})</span>
                </button>
              ))}
            </div>

            {/* Current Artifact Viewer */}
            {currentArtifact ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-xeoo-muted">
                    <span className="font-bold text-xeoo-text">{currentArtifact.name}</span>
                    <span>•</span>
                    <span className="uppercase text-xeoo-primary">{currentArtifact.role}</span>
                    <span>•</span>
                    <span>{currentArtifact.content.length} bytes</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(currentArtifact.content)}
                    className="flex items-center gap-1 text-xs text-xeoo-muted hover:text-xeoo-text cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Content
                  </button>
                </div>

                {/* Render code block */}
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 overflow-x-auto max-h-[500px]">
                  <pre className="font-mono text-xs text-xeoo-text leading-relaxed whitespace-pre">
                    {currentArtifact.content}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-xs text-xeoo-muted">No artifacts registered for this case.</p>
            )}
          </div>
        )}

        {/* TAB 3: LIVE TARGET SANDBOX */}
        {activeTab === "sandbox" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-xeoo-border pb-3">
              <div className="flex items-center gap-2 text-xs text-xeoo-muted">
                <Lock className="h-4 w-4 text-xeoo-success" />
                <span className="font-mono text-[11px]">ISOLATED CSP SANDBOX (NETWORK BLOCKED)</span>
              </div>

              {/* Viewport size switcher */}
              <div className="flex items-center gap-1 bg-xeoo-surface-soft border border-xeoo-border p-1 rounded-lg">
                <button
                  type="button"
                  title="Desktop View"
                  onClick={() => setSandboxViewport("desktop")}
                  className={`p-1.5 rounded ${
                    sandboxViewport === "desktop" ? "bg-xeoo-surface text-xeoo-primary shadow-xs" : "text-xeoo-muted"
                  }`}
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Tablet View (768px)"
                  onClick={() => setSandboxViewport("tablet")}
                  className={`p-1.5 rounded ${
                    sandboxViewport === "tablet" ? "bg-xeoo-surface text-xeoo-primary shadow-xs" : "text-xeoo-muted"
                  }`}
                >
                  <Tablet className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Mobile View (375px)"
                  onClick={() => setSandboxViewport("mobile")}
                  className={`p-1.5 rounded ${
                    sandboxViewport === "mobile" ? "bg-xeoo-surface text-xeoo-primary shadow-xs" : "text-xeoo-muted"
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                </button>
                <div className="h-4 w-px bg-xeoo-border mx-1" />
                <button
                  type="button"
                  title="Reload Sandbox"
                  onClick={() => setSandboxKey((k) => k + 1)}
                  className="p-1.5 rounded text-xeoo-muted hover:text-xeoo-text"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Sandbox Container */}
            <div className="flex justify-center bg-xeoo-surface-soft/60 p-2 sm:p-4 rounded-xl border border-xeoo-border overflow-x-auto min-h-[500px]">
              <div
                className={`transition-all duration-300 w-full bg-white rounded-lg shadow-sm overflow-hidden border border-xeoo-border ${
                  sandboxViewport === "tablet"
                    ? "max-w-[768px]"
                    : sandboxViewport === "mobile"
                    ? "max-w-[375px]"
                    : "max-w-full"
                }`}
                style={{ height: "550px" }}
              >
                <iframe
                  key={sandboxKey}
                  ref={iframeRef}
                  title="Target Sandbox"
                  srcDoc={sandboxDocument}
                  sandbox="allow-scripts"
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DOM & SOURCE INSPECTOR */}
        {activeTab === "dom" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xeoo-muted">
                  <Search className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  value={sourceSearch}
                  onChange={(e) => setSourceSearch(e.target.value)}
                  placeholder="Filter source code tokens..."
                  className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-1.5 pl-8 pr-3 text-xs text-xeoo-text focus:outline-none focus:border-xeoo-primary"
                />
              </div>

              {primaryHtmlArtifact && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(primaryHtmlArtifact.content)}
                  className="flex items-center gap-1.5 text-xs text-xeoo-muted hover:text-xeoo-text cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy Source
                </button>
              )}
            </div>

            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 overflow-x-auto max-h-[500px]">
              {primaryHtmlArtifact ? (
                <div className="space-y-1 font-mono text-xs">
                  {primaryHtmlArtifact.content.split("\n").map((line, idx) => {
                    const matchesSearch = sourceSearch.trim() && line.toLowerCase().includes(sourceSearch.toLowerCase());
                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 px-1 py-0.5 rounded ${
                          matchesSearch ? "bg-xeoo-warning/20 text-xeoo-warning font-bold" : "text-xeoo-text"
                        }`}
                      >
                        <span className="select-none text-xeoo-muted text-[11px] w-8 text-right shrink-0">
                          {idx + 1}
                        </span>
                        <span className="whitespace-pre">{line}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-xeoo-muted">No source artifact available.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: FORENSIC WORKBENCH */}
        {activeTab === "workbench" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Decoders & Transforms */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-xeoo-muted flex items-center gap-1.5">
                <Wrench className="h-4 w-4 text-xeoo-primary" />
                Forensic Transforms & Decoders
              </h3>

              <div>
                <label className="block text-xs font-semibold text-xeoo-text mb-1" htmlFor="wb-input">
                  Input Cipher / Encoded Payload
                </label>
                <textarea
                  id="wb-input"
                  rows={3}
                  value={wbInput}
                  onChange={(e) => setWbInput(e.target.value)}
                  placeholder="Paste payload or encoded string here..."
                  className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2.5 font-mono text-xs text-xeoo-text focus:outline-none focus:border-xeoo-primary"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={runBase64Decode}
                  className="rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-1.5 text-xs font-semibold text-xeoo-text hover:bg-xeoo-surface-soft cursor-pointer"
                >
                  Base64 Decode
                </button>
                <button
                  type="button"
                  onClick={runBase64Encode}
                  className="rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-1.5 text-xs font-semibold text-xeoo-text hover:bg-xeoo-surface-soft cursor-pointer"
                >
                  Base64 Encode
                </button>
                <button
                  type="button"
                  onClick={runHexDecode}
                  className="rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-1.5 text-xs font-semibold text-xeoo-text hover:bg-xeoo-surface-soft cursor-pointer"
                >
                  Hex to ASCII
                </button>
                <button
                  type="button"
                  onClick={runHexEncode}
                  className="rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-1.5 text-xs font-semibold text-xeoo-text hover:bg-xeoo-surface-soft cursor-pointer"
                >
                  ASCII to Hex
                </button>
                <button
                  type="button"
                  onClick={runUrlDecode}
                  className="rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-1.5 text-xs font-semibold text-xeoo-text hover:bg-xeoo-surface-soft cursor-pointer"
                >
                  URL Decode
                </button>
              </div>

              {/* ROT / Caesar Controls */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-semibold text-xeoo-text">Caesar Shift:</span>
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={rotShift}
                  onChange={(e) => setRotShift(parseInt(e.target.value) || 13)}
                  className="w-16 rounded border border-xeoo-border bg-xeoo-surface-soft px-2 py-1 text-xs text-xeoo-text font-mono"
                />
                <button
                  type="button"
                  onClick={runRotCipher}
                  className="rounded-lg bg-xeoo-primary px-3 py-1 text-xs font-semibold text-white hover:opacity-90 cursor-pointer"
                >
                  Apply ROT-{rotShift}
                </button>
              </div>

              {/* Workbench Output */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-xeoo-text" htmlFor="wb-output">Transform Result</label>
                  {wbOutput && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(wbOutput)}
                      className="text-xs text-xeoo-primary hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                  )}
                </div>
                <textarea
                  id="wb-output"
                  rows={4}
                  readOnly
                  value={wbOutput}
                  placeholder="Output appears here..."
                  className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2.5 font-mono text-xs text-xeoo-text focus:outline-none"
                />
              </div>
            </div>

            {/* Analyst Scratchpad */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-xeoo-muted flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-xeoo-primary" />
                Analyst Case Scratchpad
              </h3>
              <p className="text-xs text-xeoo-muted">
                Jot down clues, intermediate tokens, and hypothesis notes. Saved automatically in local storage.
              </p>
              <textarea
                rows={12}
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="1. Clue found in comment...&#10;2. Stage 2 hash...&#10;3. Candidate flag..."
                className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 font-mono text-xs text-xeoo-text focus:outline-none focus:border-xeoo-primary"
              />
            </div>
          </div>
        )}

        {/* TAB 6: HINTS & ASSISTANCE */}
        {activeTab === "hints" && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-xeoo-muted mb-1 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-xeoo-primary" />
                Progressive Investigation Clues
              </h3>
              <p className="text-xs text-xeoo-muted">
                Need guidance? Hints point you toward the correct artifact or forensic angle with a small point penalty.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {hints.map((hint) => (
                <div
                  key={hint.id}
                  className={`rounded-xl border p-4 transition-all ${
                    hint.unlocked
                      ? "border-xeoo-primary/30 bg-xeoo-primary/5"
                      : "border-xeoo-border bg-xeoo-surface-soft"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="font-mono text-xs font-bold text-xeoo-text">
                      {hint.title}
                    </span>
                    {hint.unlocked ? (
                      <span className="flex items-center gap-1 rounded bg-xeoo-primary/20 px-2 py-0.5 text-[10px] font-mono font-bold text-xeoo-primary">
                        <Unlock className="h-3 w-3" /> UNLOCKED (-{hint.cost} PTS)
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={unlockingHintId === hint.id}
                        onClick={() => handleUnlockHint(hint)}
                        className="flex items-center gap-1.5 rounded-lg bg-xeoo-primary px-3 py-1 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 cursor-pointer"
                      >
                        {unlockingHintId === hint.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Lock className="h-3 w-3" />
                        )}
                        Unlock (-{hint.cost} PTS)
                      </button>
                    )}
                  </div>

                  {hint.unlocked ? (
                    <p className="text-xs text-xeoo-text leading-relaxed font-mono whitespace-pre-line">
                      {hint.hint_text}
                    </p>
                  ) : (
                    <p className="text-xs text-xeoo-muted italic">
                      This hint is encrypted. Unlock to reveal forensic guidance.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Flag Submission Bar */}
      <div className="sticky bottom-4 z-40 rounded-xl border border-xeoo-border bg-xeoo-surface/95 backdrop-blur-md p-3 sm:p-4 shadow-lg space-y-2.5">
        {!settings.submissions_enabled && !isSolved && (
          <div className="flex items-center gap-2 rounded-lg border border-xeoo-warning/40 bg-xeoo-warning/10 p-2 text-xs text-xeoo-text">
            <AlertTriangle className="h-4 w-4 text-xeoo-warning shrink-0" />
            <p className="text-[11px] text-xeoo-muted">
              <span className="font-bold text-xeoo-warning">Submissions Dinonaktifkan:</span> Pengiriman flag dinonaktifkan sementara oleh administrator CTF Command.
            </p>
          </div>
        )}

        {isSolved ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xeoo-success">
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <p className="text-xs font-bold">Case Solved and Verified</p>
                <p className="text-[11px] text-xeoo-muted font-mono">
                  Points credited to your operator profile.
                </p>
              </div>
            </div>
            <Link
              to="/ctf/challenges"
              className="rounded-lg bg-xeoo-primary px-4 py-2 text-xs font-bold text-white hover:opacity-95"
            >
              Next Case File
            </Link>
          </div>
        ) : (
          <form onSubmit={handleFlagSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xeoo-muted">
                <Terminal className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={flagInput}
                disabled={!settings.submissions_enabled || submittingFlag}
                onChange={(e) => setFlagInput(e.target.value)}
                placeholder={!settings.submissions_enabled ? "Pengiriman flag dinonaktifkan oleh admin..." : "Enter flag format: XEOO{...}"}
                className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-2.5 pl-9 pr-3 text-xs text-xeoo-text placeholder-xeoo-muted font-mono focus:border-xeoo-primary focus:outline-none focus:ring-1 focus:ring-xeoo-primary disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={!settings.submissions_enabled || submittingFlag || !flagInput.trim()}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-xeoo-primary px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
            >
              {!settings.submissions_enabled ? (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  Submissions Disabled
                </>
              ) : submittingFlag ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Submit Flag
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

