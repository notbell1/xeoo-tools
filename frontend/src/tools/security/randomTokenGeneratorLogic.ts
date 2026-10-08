export type TokenCharsetType =
  | "alphanumeric"
  | "hex"
  | "base64url"
  | "symbols"
  | "numeric";

export interface TokenGeneratorOptions {
  length: number;
  charset: TokenCharsetType;
  uppercaseOnly?: boolean;
  lowercaseOnly?: boolean;
}

const CHARSET_POOLS: Record<TokenCharsetType, string> = {
  alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  hex: "0123456789abcdef",
  base64url: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
  symbols: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?",
  numeric: "0123456789",
};

/**
 * Generates an integer uniformly distributed in [0, max) using crypto.getRandomValues.
 * Uses rejection sampling to eliminate bias.
 */
function secureRandomInt(max: number): number {
  if (max <= 0) return 0;

  const cryptoObj = globalThis.crypto;
  if (!cryptoObj?.getRandomValues) {
    throw new Error("crypto.getRandomValues() is not available.");
  }

  const maxUint32 = 0xffffffff;
  const limit = Math.floor((maxUint32 + 1) / max) * max;
  const buffer = new Uint32Array(1);

  do {
    cryptoObj.getRandomValues(buffer);
  } while (buffer[0] >= limit);

  return buffer[0] % max;
}

/**
 * Builds the resolved character pool based on options.
 */
export function getCharacterPool(options: TokenGeneratorOptions): string {
  let pool = CHARSET_POOLS[options.charset] || CHARSET_POOLS.alphanumeric;

  if (options.uppercaseOnly) {
    pool = Array.from(new Set(pool.toUpperCase())).join("");
  } else if (options.lowercaseOnly) {
    pool = Array.from(new Set(pool.toLowerCase())).join("");
  }

  return pool;
}

/**
 * Generates a single cryptographically secure token.
 */
export function generateToken(options: TokenGeneratorOptions): string {
  const pool = getCharacterPool(options);
  const poolLen = pool.length;
  if (poolLen === 0) return "";

  const tokenChars: string[] = [];
  for (let i = 0; i < options.length; i++) {
    const idx = secureRandomInt(poolLen);
    tokenChars.push(pool[idx]);
  }

  return tokenChars.join("");
}

/**
 * Generates multiple tokens.
 */
export function generateTokens(
  options: TokenGeneratorOptions,
  count: number = 1
): string[] {
  const safeCount = Math.min(50, Math.max(1, count));
  const list: string[] = [];
  for (let i = 0; i < safeCount; i++) {
    list.push(generateToken(options));
  }
  return list;
}

/**
 * Estimates entropy in bits: length * log2(poolSize).
 */
export function estimateTokenEntropy(
  length: number,
  charset: TokenCharsetType,
  uppercaseOnly?: boolean,
  lowercaseOnly?: boolean
): number {
  const pool = getCharacterPool({
    length,
    charset,
    uppercaseOnly,
    lowercaseOnly,
  });
  if (pool.length <= 1) return 0;
  return Math.round(length * Math.log2(pool.length) * 10) / 10;
}

