export type PromptGoal =
  | "general"
  | "coding"
  | "writing"
  | "analysis"
  | "education"
  | "creative";

export type PromptTone =
  | "professional"
  | "concise"
  | "educational"
  | "engaging";

export type OutputFormat =
  | "markdown"
  | "step_by_step"
  | "bullet_points"
  | "code_explained"
  | "structured_json";

export interface OptimizationSettings {
  goal: PromptGoal;
  tone: PromptTone;
  outputFormat: OutputFormat;
  includeConstraints: boolean;
  requestClarifications: boolean;
  targetModel: string;
}

export interface PromptAnalysis {
  wordCount: number;
  charCount: number;
  hasRole: boolean;
  hasClearAction: boolean;
  hasContext: boolean;
  hasConstraints: boolean;
  hasOutputSpec: boolean;
  detectedIssues: string[];
  suggestions: string[];
}

export interface OptimizedPromptResult {
  original: string;
  analysis: PromptAnalysis;
  optimizedPrompt: string;
  summary: string[];
}

const ACTION_VERBS = [
  "create",
  "build",
  "write",
  "explain",
  "analyze",
  "generate",
  "debug",
  "review",
  "summarize",
  "design",
  "develop",
  "evaluate",
  "draft",
  "translate",
  "compare",
];

const VAGUE_TERMS = [
  "make me",
  "do something",
  "a website",
  "some code",
  "help with",
  "stuff",
  "things",
  "etc",
  "good job",
  "nice",
  "fix this",
];

export function analyzePrompt(raw: string): PromptAnalysis {
  const text = raw.trim();
  const lower = text.toLowerCase();
  const words = text ? text.split(/\s+/).filter(Boolean) : [];

  const wordCount = words.length;
  const charCount = text.length;

  const hasRole =
    lower.includes("act as") ||
    lower.includes("you are a") ||
    lower.includes("role:") ||
    lower.includes("expert") ||
    lower.includes("specialist");

  const hasClearAction = ACTION_VERBS.some((verb) =>
    lower.includes(verb)
  );

  const hasContext =
    wordCount > 15 ||
    lower.includes("because") ||
    lower.includes("for") ||
    lower.includes("context:") ||
    lower.includes("given");

  const hasConstraints =
    lower.includes("do not") ||
    lower.includes("must") ||
    lower.includes("limit") ||
    lower.includes("without") ||
    lower.includes("constraints:") ||
    lower.includes("only");

  const hasOutputSpec =
    lower.includes("format:") ||
    lower.includes("markdown") ||
    lower.includes("json") ||
    lower.includes("bullet") ||
    lower.includes("table") ||
    lower.includes("steps");

  const detectedIssues: string[] = [];
  const suggestions: string[] = [];

  if (wordCount < 5) {
    detectedIssues.push("Extremely short prompt: Lacks essential context and requirements.");
    suggestions.push("Specify background context, constraints, and the target audience.");
  }

  if (!hasRole) {
    detectedIssues.push("No persona or role specified: Model has to infer perspective.");
    suggestions.push("Define an expert persona (e.g. 'Senior React Developer' or 'Technical Editor').");
  }

  if (!hasClearAction) {
    detectedIssues.push("Ambiguous intent: Missing strong imperative action verbs.");
    suggestions.push("Start instructions with precise action words like 'Analyze', 'Generate', or 'Implement'.");
  }

  if (!hasOutputSpec) {
    detectedIssues.push("Unspecified output format: Model will default to generic chat prose.");
    suggestions.push("Explicitly dictate structural requirements (Markdown sections, JSON, tables, etc.).");
  }

  if (!hasConstraints) {
    detectedIssues.push("Missing negative boundaries: No explicit constraints or out-of-scope boundaries.");
    suggestions.push("Add constraints on scope, dependencies, brevity, and edge case handling.");
  }

  const foundVagueTerms = VAGUE_TERMS.filter((v) => lower.includes(v));
  if (foundVagueTerms.length > 0) {
    detectedIssues.push(`Vague wording detected: ${foundVagueTerms.map((t) => `"${t}"`).join(", ")}.`);
    suggestions.push("Replace colloquial or ambiguous phrases with concrete specifications.");
  }

  return {
    wordCount,
    charCount,
    hasRole,
    hasClearAction,
    hasContext,
    hasConstraints,
    hasOutputSpec,
    detectedIssues,
    suggestions,
  };
}

export function optimizePrompt(
  raw: string,
  settings: OptimizationSettings
): OptimizedPromptResult {
  const cleanInput = raw.trim();
  const analysis = analyzePrompt(cleanInput);

  if (!cleanInput) {
    return {
      original: "",
      analysis,
      optimizedPrompt: "",
      summary: ["Please provide a prompt to optimize."],
    };
  }

  // Determine role based on goal
  let roleTitle = "an expert assistant";
  switch (settings.goal) {
    case "coding":
      roleTitle = "a Senior Software Engineer and Architect";
      break;
    case "writing":
      roleTitle = "a Professional Editor and Content Strategist";
      break;
    case "analysis":
      roleTitle = "a Senior Data & Systems Analyst";
      break;
    case "education":
      roleTitle = "a Subject Matter Expert and Pedagogical Mentor";
      break;
    case "creative":
      roleTitle = "a Creative Director and Master Storyteller";
      break;
    default:
      roleTitle = "a High-Caliber Subject Matter Specialist";
      break;
  }

  // Determine tone instructions
  let toneInstruction = "Professional, articulate, and objective.";
  switch (settings.tone) {
    case "concise":
      toneInstruction = "Extremely concise, punchy, and direct without boilerplate fluff.";
      break;
    case "educational":
      toneInstruction = "Instructive, empathetic, and thorough with step-by-step conceptual clarity.";
      break;
    case "engaging":
      toneInstruction = "Engaging, lively, and conversational while maintaining rigorous precision.";
      break;
    default:
      toneInstruction = "Professional, authoritative, structured, and clear.";
      break;
  }

  // Determine output format
  let formatInstruction = "Clear Markdown with headings and structured paragraphs.";
  switch (settings.outputFormat) {
    case "step_by_step":
      formatInstruction = "Numbered sequential steps with prerequisites and verification checkpoints.";
      break;
    case "bullet_points":
      formatInstruction = "Crisp hierarchical bullet points grouped by thematic categories.";
      break;
    case "code_explained":
      formatInstruction = "Production-grade, fully commented code blocks followed by concise architectural explanations.";
      break;
    case "structured_json":
      formatInstruction = "Strictly valid, well-formatted JSON without extraneous conversational preamble.";
      break;
    default:
      formatInstruction = "Well-organized Markdown with distinct headings, code blocks if relevant, and summary takeaways.";
      break;
  }

  const sections: string[] = [];

  // 1. Role & Identity
  sections.push(`### Role & Persona\nYou are ${roleTitle}. Your communication style is ${toneInstruction.toLowerCase()}`);

  // 2. Primary Objective
  sections.push(`### Core Objective\n${cleanInput}`);

  // 3. Execution Requirements
  const requirements: string[] = [
    `Deliverable Format: ${formatInstruction}`,
    "Thoroughness: Provide high-fidelity, actionable output that directly addresses all core criteria.",
    "Accuracy: Ground answers in validated best practices; state assumptions clearly whenever specifications are open.",
  ];

  if (settings.includeConstraints) {
    requirements.push("Constraints: Avoid superficial summaries or generic platitudes. Focus on tangible substance.");
  }

  if (settings.requestClarifications) {
    requirements.push("Clarification Protocol: If critical technical parameters are ambiguous, provide the best standard recommendation first, then list 2-3 specific clarifying questions.");
  }

  sections.push(`### Guidelines & Requirements\n${requirements.map((r) => `- ${r}`).join("\n")}`);

  // 4. Verification Checkpoint
  sections.push(`### Quality Verification\nBefore responding, verify that your output satisfies all structural constraints and adheres strictly to the requested tone.`);

  const optimizedPrompt = sections.join("\n\n");

  const summary = [
    `Enriched original text with explicit ${roleTitle} persona framing.`,
    `Structured instructions into distinct operational sections (Role, Objective, Requirements, Quality Verification).`,
    `Enforced ${settings.outputFormat.replace("_", " ")} output schema and ${settings.tone} tone boundaries.`,
    `Optimized for ${settings.targetModel || "General LLM"} context-following performance.`,
  ];

  return {
    original: cleanInput,
    analysis,
    optimizedPrompt,
    summary,
  };
}

