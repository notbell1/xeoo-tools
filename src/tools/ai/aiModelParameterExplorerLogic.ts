export interface ParameterConfig {
  temperature: number; // 0.0 - 2.0
  topP: number; // 0.0 - 1.0
  maxTokens: number; // 1 - 16384
  frequencyPenalty: number; // -2.0 - 2.0
  presencePenalty: number; // -2.0 - 2.0
  seed: number | null; // integer or null
  stopSequences: string[];
}

export interface PresetConfiguration {
  id: string;
  name: string;
  description: string;
  config: ParameterConfig;
}

export const PARAMETER_PRESETS: PresetConfiguration[] = [
  {
    id: "coding",
    name: "Code & Math (Deterministic)",
    description: "Lowest randomness for programming, unit tests, and rigorous mathematical steps.",
    config: {
      temperature: 0.1,
      topP: 0.1,
      maxTokens: 2048,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      seed: 42,
      stopSequences: ["```\n\n", "<!-- end -->"],
    },
  },
  {
    id: "factual",
    name: "Factual Q&A / Customer Support",
    description: "High fidelity and factual adherence with natural phrasing.",
    config: {
      temperature: 0.4,
      topP: 0.7,
      maxTokens: 1024,
      frequencyPenalty: 0.2,
      presencePenalty: 0.1,
      seed: null,
      stopSequences: [],
    },
  },
  {
    id: "creative",
    name: "Creative Writing & Storytelling",
    description: "Higher variance and expressive vocabulary exploration.",
    config: {
      temperature: 0.9,
      topP: 0.95,
      maxTokens: 4096,
      frequencyPenalty: 0.5,
      presencePenalty: 0.4,
      seed: null,
      stopSequences: [],
    },
  },
  {
    id: "brainstorming",
    name: "Open Ideation & Lateral Thinking",
    description: "Elevated exploration to break conventional associative pathways.",
    config: {
      temperature: 1.2,
      topP: 0.98,
      maxTokens: 2048,
      frequencyPenalty: 0.8,
      presencePenalty: 0.6,
      seed: null,
      stopSequences: [],
    },
  },
];

export function getBehaviorDescription(config: ParameterConfig): {
  temperatureSummary: string;
  topPSummary: string;
  penaltiesSummary: string;
  overallTradeoff: string;
} {
  let temperatureSummary = "";
  if (config.temperature <= 0.2) {
    temperatureSummary = "Extremely deterministic & focused. Selects top probability tokens; best for code, logic, and extraction.";
  } else if (config.temperature <= 0.7) {
    temperatureSummary = "Balanced coherence. Natural variety while maintaining grounded factual consistency.";
  } else if (config.temperature <= 1.0) {
    temperatureSummary = "Creative & varied. Explores wider token distributions; higher lyrical and narrative richness.";
  } else {
    temperatureSummary = "High randomness. May exhibit unexpected associative leaps, stream-of-consciousness, or hallucination.";
  }

  let topPSummary = "";
  if (config.topP <= 0.3) {
    topPSummary = "Nucleus sampling restricted to top 10-30% cumulative probability mass. Drastically cuts off long-tail tokens.";
  } else if (config.topP <= 0.8) {
    topPSummary = "Standard nucleus sampling. Balances vocabulary diversity with grammatical correctness.";
  } else {
    topPSummary = "Unrestricted nucleus sampling. Considers almost the full vocabulary pool for each generation step.";
  }

  let penaltiesSummary = "";
  if (config.frequencyPenalty > 0 || config.presencePenalty > 0) {
    penaltiesSummary = `Penalizes repeated words (${config.frequencyPenalty}) and encourages introducing new topics (${config.presencePenalty}).`;
  } else {
    penaltiesSummary = "Neutral penalties (0.0). Model uses natural token frequencies from training priors.";
  }

  const overallTradeoff = `Predictability Index: ${Math.round((1 - (config.temperature / 2)) * 100)}% | Diversity Index: ${Math.round((config.temperature / 2) * 100)}%`;

  return {
    temperatureSummary,
    topPSummary,
    penaltiesSummary,
    overallTradeoff,
  };
}

