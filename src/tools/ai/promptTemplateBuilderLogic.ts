export interface TemplateVariable {
  id: string;
  key: string;
  label: string;
  description: string;
  defaultValue: string;
}

export interface PromptTemplateConfig {
  title: string;
  role: string;
  task: string;
  context: string;
  variables: TemplateVariable[];
  constraints: string;
  outputFormat: string;
}

export interface BuiltTemplateResult {
  templateText: string;
  exampleFilledText: string;
  detectedVariables: string[];
}

export function buildPromptTemplate(config: PromptTemplateConfig): BuiltTemplateResult {
  const parts: string[] = [];

  if (config.role.trim()) {
    parts.push(`[ROLE]\n${config.role.trim()}`);
  }

  if (config.task.trim()) {
    parts.push(`[PRIMARY TASK]\n${config.task.trim()}`);
  }

  if (config.context.trim()) {
    parts.push(`[CONTEXT & BACKGROUND]\n${config.context.trim()}`);
  }

  if (config.variables.length > 0) {
    const varLines = config.variables.map(
      (v) => `- {{${v.key.trim()}}}: ${v.description.trim() || v.label.trim()}`
    );
    parts.push(`[INPUT VARIABLES]\n${varLines.join("\n")}`);
  }

  if (config.constraints.trim()) {
    parts.push(`[CONSTRAINTS & RULES]\n${config.constraints.trim()}`);
  }

  if (config.outputFormat.trim()) {
    parts.push(`[OUTPUT FORMAT]\n${config.outputFormat.trim()}`);
  }

  const templateText = parts.join("\n\n");

  // Generate example filled text
  let filled = templateText;
  config.variables.forEach((v) => {
    const val = v.defaultValue.trim() || `[${v.label.trim() || v.key.trim()}]`;
    const regex = new RegExp(`\\{\\{${v.key.trim()}\\}\\}`, "g");
    filled = filled.replace(regex, val);
  });

  // Extract all {{var}} matches
  const matchSet = new Set<string>();
  const varMatches = templateText.matchAll(/\{\{([a-zA-Z0-9_-]+)\}\}/g);
  for (const m of varMatches) {
    if (m[1]) matchSet.add(m[1]);
  }

  return {
    templateText,
    exampleFilledText: filled,
    detectedVariables: Array.from(matchSet),
  };
}

