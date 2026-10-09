export interface ContextWindowModel {
  id: string;
  name: string;
  provider: string;
  maxContext: number;
  defaultMaxOutput: number;
}

export const CONTEXT_WINDOW_MODELS: ContextWindowModel[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    maxContext: 128000,
    defaultMaxOutput: 4096,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    maxContext: 128000,
    defaultMaxOutput: 16384,
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    maxContext: 200000,
    defaultMaxOutput: 8192,
  },
  {
    id: "gemini-1-5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    maxContext: 1000000,
    defaultMaxOutput: 8192,
  },
  {
    id: "llama-3-8b",
    name: "Llama 3 8B (Local)",
    provider: "Meta / Open-weights",
    maxContext: 8192,
    defaultMaxOutput: 2048,
  },
  {
    id: "mistral-7b",
    name: "Mistral 7B Instruct",
    provider: "Mistral",
    maxContext: 32768,
    defaultMaxOutput: 4096,
  },
  {
    id: "custom",
    name: "Custom Context Window",
    provider: "Custom",
    maxContext: 8192,
    defaultMaxOutput: 2048,
  },
];

export interface ContextWindowInput {
  contextWindowSize: number;
  systemTokens: number;
  historyTokens: number;
  ragTokens: number;
  userInputTokens: number;
  reservedOutputTokens: number;
}

export interface ContextWindowBreakdown {
  totalContext: number;
  usedInputTokens: number;
  reservedOutputTokens: number;
  totalCommittedTokens: number;
  remainingTokens: number;
  usagePercentage: number;
  isOverflow: boolean;
  status: "safe" | "caution" | "critical" | "overflow";
  statusMessage: string;
}

export function calculateContextWindow(input: ContextWindowInput): ContextWindowBreakdown {
  const totalContext = Math.max(1, input.contextWindowSize);
  const system = Math.max(0, input.systemTokens);
  const history = Math.max(0, input.historyTokens);
  const rag = Math.max(0, input.ragTokens);
  const userInput = Math.max(0, input.userInputTokens);
  const reservedOutput = Math.max(0, input.reservedOutputTokens);

  const usedInputTokens = system + history + rag + userInput;
  const totalCommittedTokens = usedInputTokens + reservedOutput;
  const remainingTokens = totalContext - totalCommittedTokens;
  const isOverflow = remainingTokens < 0;

  const usagePercentage = Math.round((totalCommittedTokens / totalContext) * 1000) / 10;

  let status: "safe" | "caution" | "critical" | "overflow" = "safe";
  let statusMessage = "Ample context headroom available.";

  if (isOverflow) {
    status = "overflow";
    statusMessage = `Context limit exceeded by ${Math.abs(remainingTokens).toLocaleString()} tokens! Model will truncate or throw a 400 error.`;
  } else if (usagePercentage >= 90) {
    status = "critical";
    statusMessage = "Context window is nearly saturated (> 90%). High risk of history eviction.";
  } else if (usagePercentage >= 70) {
    status = "caution";
    statusMessage = "Moderate context utilization (70-90%). Consider summarizing conversation history.";
  }

  return {
    totalContext,
    usedInputTokens,
    reservedOutputTokens: reservedOutput,
    totalCommittedTokens,
    remainingTokens,
    usagePercentage,
    isOverflow,
    status,
    statusMessage,
  };
}

