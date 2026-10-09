export type TokenizerProfile =
  | "gpt_o200k" // GPT-4o, o1 (~3.8 chars/token English, higher efficiency for code & non-English)
  | "gpt_cl100k" // GPT-4, GPT-3.5-turbo (~4.0 chars/token)
  | "claude" // Claude 3 / 3.5 (~3.9 chars/token)
  | "llama3"; // Llama 3 / 128k tiktoken (~3.85 chars/token)

export interface TokenStats {
  charsTotal: number;
  charsNoSpaces: number;
  wordCount: number;
  lineCount: number;
  paragraphCount: number;
  estimatedTokens: number;
  charsPerToken: number;
  estimatedReadingTimeSec: number;
}

export function estimateTokens(text: string, profile: TokenizerProfile): TokenStats {
  const charsTotal = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const lines = text ? text.split("\n") : [];
  const lineCount = lines.length;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(Boolean) : [];
  const paragraphCount = paragraphs.length;

  if (charsTotal === 0) {
    return {
      charsTotal: 0,
      charsNoSpaces: 0,
      wordCount: 0,
      lineCount: 0,
      paragraphCount: 0,
      estimatedTokens: 0,
      charsPerToken: 0,
      estimatedReadingTimeSec: 0,
    };
  }

  // Profile-specific heuristic estimation:
  // Most BPE tokenizers compress alphanumeric words, but punctuation, whitespace, emojis and non-ASCII have specific token weight.
  let baseFactor = 3.9;
  switch (profile) {
    case "gpt_o200k":
      baseFactor = 3.75;
      break;
    case "gpt_cl100k":
      baseFactor = 4.0;
      break;
    case "claude":
      baseFactor = 3.9;
      break;
    case "llama3":
      baseFactor = 3.8;
      break;
  }

  // Count non-ASCII characters (e.g. Cyrillic, CJK, Emoji, accents take 1-3 tokens per char)
  let nonAsciiWeight = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code > 127) {
      nonAsciiWeight += 1.2; // Extra token overhead for non-ASCII
    }
  }

  // Token estimate formula combining word count and char length
  const tokenFromChars = charsTotal / baseFactor;
  const tokenFromWords = wordCount * 1.3;
  const baseTokens = Math.round((tokenFromChars * 0.65) + (tokenFromWords * 0.35) + nonAsciiWeight);
  const estimatedTokens = Math.max(1, baseTokens);

  const charsPerToken = Math.round((charsTotal / estimatedTokens) * 100) / 100;
  // Average reading speed: 200 words per minute -> 200 / 60 words per second
  const estimatedReadingTimeSec = Math.ceil(wordCount / (200 / 60));

  return {
    charsTotal,
    charsNoSpaces,
    wordCount,
    lineCount,
    paragraphCount,
    estimatedTokens,
    charsPerToken,
    estimatedReadingTimeSec,
  };
}

