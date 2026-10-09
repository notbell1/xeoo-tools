export interface ModelPricing {
  id: string;
  provider: string;
  name: string;
  inputPerMillion: number; // in USD per 1M tokens
  outputPerMillion: number; // in USD per 1M tokens
}

export const PRICING_LAST_UPDATED = "January 2025 (Tier 1 Public API Rates)";

export const MODEL_PRESETS: ModelPricing[] = [
  {
    id: "gpt-4o",
    provider: "OpenAI",
    name: "GPT-4o",
    inputPerMillion: 2.5,
    outputPerMillion: 10.0,
  },
  {
    id: "gpt-4o-mini",
    provider: "OpenAI",
    name: "GPT-4o Mini",
    inputPerMillion: 0.15,
    outputPerMillion: 0.6,
  },
  {
    id: "claude-3-5-sonnet",
    provider: "Anthropic",
    name: "Claude 3.5 Sonnet",
    inputPerMillion: 3.0,
    outputPerMillion: 15.0,
  },
  {
    id: "claude-3-5-haiku",
    provider: "Anthropic",
    name: "Claude 3.5 Haiku",
    inputPerMillion: 0.8,
    outputPerMillion: 4.0,
  },
  {
    id: "gemini-1-5-pro",
    provider: "Google",
    name: "Gemini 1.5 Pro",
    inputPerMillion: 1.25,
    outputPerMillion: 5.0,
  },
  {
    id: "gemini-1-5-flash",
    provider: "Google",
    name: "Gemini 1.5 Flash",
    inputPerMillion: 0.075,
    outputPerMillion: 0.3,
  },
  {
    id: "deepseek-v3",
    provider: "DeepSeek",
    name: "DeepSeek-V3",
    inputPerMillion: 0.14,
    outputPerMillion: 0.28,
  },
  {
    id: "custom",
    provider: "Custom",
    name: "Custom / Self-Defined Rate",
    inputPerMillion: 1.0,
    outputPerMillion: 2.0,
  },
];

export interface CostCalculationInput {
  inputTokens: number;
  outputTokens: number;
  inputPricePerM: number;
  outputPricePerM: number;
  dailyRequests: number;
}

export interface CostCalculationResult {
  costInputPerCall: number;
  costOutputPerCall: number;
  costTotalPerCall: number;
  costDaily: number;
  costMonthly: number;
  costAnnual: number;
}

export function calculateAiCost(input: CostCalculationInput): CostCalculationResult {
  const safeInputTokens = Math.max(0, input.inputTokens);
  const safeOutputTokens = Math.max(0, input.outputTokens);
  const safeInputPrice = Math.max(0, input.inputPricePerM);
  const safeOutputPrice = Math.max(0, input.outputPricePerM);
  const safeDailyRequests = Math.max(1, input.dailyRequests);

  const costInputPerCall = (safeInputTokens / 1_000_000) * safeInputPrice;
  const costOutputPerCall = (safeOutputTokens / 1_000_000) * safeOutputPrice;
  const costTotalPerCall = costInputPerCall + costOutputPerCall;

  const costDaily = costTotalPerCall * safeDailyRequests;
  const costMonthly = costDaily * 30;
  const costAnnual = costDaily * 365;

  return {
    costInputPerCall,
    costOutputPerCall,
    costTotalPerCall,
    costDaily,
    costMonthly,
    costAnnual,
  };
}

