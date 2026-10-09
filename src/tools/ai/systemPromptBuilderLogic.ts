export interface SystemPromptSections {
  role: string;
  mission: string;
  tone: string;
  rules: string;
  context: string;
  responseFormat: string;
  errorHandling: string;
  safetyBoundaries: string;
  useXmlTags: boolean;
}

export function buildSystemPrompt(sections: SystemPromptSections): string {
  const {
    role,
    mission,
    tone,
    rules,
    context,
    responseFormat,
    errorHandling,
    safetyBoundaries,
    useXmlTags,
  } = sections;

  if (useXmlTags) {
    const blocks: string[] = [];
    blocks.push("<system_instructions>");

    if (role.trim()) {
      blocks.push(`  <identity>\n    ${role.trim()}\n  </identity>`);
    }

    if (mission.trim()) {
      blocks.push(`  <primary_mission>\n    ${mission.trim()}\n  </primary_mission>`);
    }

    if (tone.trim()) {
      blocks.push(`  <communication_style>\n    ${tone.trim()}\n  </communication_style>`);
    }

    if (rules.trim()) {
      blocks.push(`  <operational_rules>\n    ${rules.trim()}\n  </operational_rules>`);
    }

    if (context.trim()) {
      blocks.push(`  <domain_context>\n    ${context.trim()}\n  </domain_context>`);
    }

    if (responseFormat.trim()) {
      blocks.push(`  <response_format>\n    ${responseFormat.trim()}\n  </response_format>`);
    }

    if (errorHandling.trim()) {
      blocks.push(`  <fallback_protocol>\n    ${errorHandling.trim()}\n  </fallback_protocol>`);
    }

    if (safetyBoundaries.trim()) {
      blocks.push(`  <safety_boundaries>\n    ${safetyBoundaries.trim()}\n  </safety_boundaries>`);
    }

    blocks.push("</system_instructions>");
    return blocks.join("\n\n");
  }

  // Markdown format
  const parts: string[] = [];

  if (role.trim()) {
    parts.push(`## 1. Identity & Role\n${role.trim()}`);
  }

  if (mission.trim()) {
    parts.push(`## 2. Core Mission & Objectives\n${mission.trim()}`);
  }

  if (tone.trim()) {
    parts.push(`## 3. Communication Style & Tone\n${tone.trim()}`);
  }

  if (rules.trim()) {
    parts.push(`## 4. Hard Rules & Negative Constraints\n${rules.trim()}`);
  }

  if (context.trim()) {
    parts.push(`## 5. Domain Context & Knowledge\n${context.trim()}`);
  }

  if (responseFormat.trim()) {
    parts.push(`## 6. Output Contract & Format\n${responseFormat.trim()}`);
  }

  if (errorHandling.trim()) {
    parts.push(`## 7. Error Handling & Uncertainty\n${errorHandling.trim()}`);
  }

  if (safetyBoundaries.trim()) {
    parts.push(`## 8. Safety & Integrity Guardrails\n${safetyBoundaries.trim()}`);
  }

  return parts.join("\n\n");
}

