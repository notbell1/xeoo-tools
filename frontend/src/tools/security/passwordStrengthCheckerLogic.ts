export type StrengthLevel =
  | "Very Weak"
  | "Weak"
  | "Moderate"
  | "Strong"
  | "Very Strong";

export interface PasswordCriterion {
  id: string;
  label: string;
  met: boolean;
  hint: string;
}

export interface PasswordStrengthAnalysis {
  password: string;
  length: number;
  entropy: number;
  score: number; // 0 to 100
  level: StrengthLevel;
  crackTimeDisplay: string;
  criteria: PasswordCriterion[];
  suggestions: string[];
  hasCommonPattern: boolean;
  hasRepeatedChars: boolean;
  hasSequentialChars: boolean;
}

const COMMON_WEAK_PASSWORDS = new Set([
  "password",
  "123456",
  "12345678",
  "123456789",
  "12345",
  "qwerty",
  "111111",
  "1234567",
  "dragon",
  "p@ssword",
  "admin",
  "welcome",
  "iloveyou",
  "letmein",
  "sunshine",
  "monkey",
  "football",
  "master",
  "starwars",
  "pass123",
  "root",
]);

/**
 * Checks for 3+ sequential characters e.g. abc, 123, cba.
 */
function checkSequential(val: string): boolean {
  if (val.length < 3) return false;
  const lower = val.toLowerCase();
  for (let i = 0; i < lower.length - 2; i++) {
    const a = lower.charCodeAt(i);
    const b = lower.charCodeAt(i + 1);
    const c = lower.charCodeAt(i + 2);
    if ((b === a + 1 && c === b + 1) || (b === a - 1 && c === b - 1)) {
      return true;
    }
  }
  return false;
}

/**
 * Checks for repeated characters e.g. aaa, 111.
 */
function checkRepeated(val: string): boolean {
  return /(.)\1\1/.test(val);
}

/**
 * Calculates raw Shannon/NIST pool-based entropy in bits.
 */
function calculateEntropy(password: string): number {
  if (!password) return 0;

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

  if (poolSize === 0) return 0;

  let entropy = password.length * Math.log2(poolSize);

  // Penalties
  if (checkRepeated(password)) entropy *= 0.85;
  if (checkSequential(password)) entropy *= 0.85;
  if (COMMON_WEAK_PASSWORDS.has(password.toLowerCase())) entropy = Math.min(entropy, 15);

  return Math.round(entropy * 10) / 10;
}

/**
 * Estimates human-readable cracking time for offline fast GPU attack (~10 billion guesses/sec).
 */
function estimateCrackTime(entropy: number): string {
  if (entropy <= 15) return "Instantly";
  if (entropy <= 28) return "A few milliseconds";
  if (entropy <= 36) return "A few seconds";
  if (entropy <= 45) return "A few minutes";
  if (entropy <= 55) return "Several hours";
  if (entropy <= 65) return "Several days";
  if (entropy <= 75) return "A few months";
  if (entropy <= 85) return "Several years";
  if (entropy <= 95) return "Centuries";
  return "Millions of years";
}

/**
 * Maps entropy to StrengthLevel.
 */
export function getStrengthLevel(entropy: number, length: number): StrengthLevel {
  if (length < 6 || entropy < 28) return "Very Weak";
  if (length < 8 || entropy < 45) return "Weak";
  if (length < 12 || entropy < 65) return "Moderate";
  if (length < 16 || entropy < 85) return "Strong";
  return "Very Strong";
}

/**
 * Comprehensive password analysis.
 */
export function analyzePassword(password: string): PasswordStrengthAnalysis {
  const length = password.length;
  const entropy = calculateEntropy(password);
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^a-zA-Z0-9]/.test(password);
  const hasSeq = checkSequential(password);
  const hasRep = checkRepeated(password);
  const isCommon = COMMON_WEAK_PASSWORDS.has(password.toLowerCase());

  const level = getStrengthLevel(entropy, length);

  // Calculate score (0 to 100)
  let score = Math.min(100, Math.round((entropy / 95) * 100));
  if (length === 0) score = 0;
  if (isCommon) score = Math.min(score, 10);

  const crackTimeDisplay = length === 0 ? "—" : estimateCrackTime(entropy);

  const criteria: PasswordCriterion[] = [
    {
      id: "length",
      label: "Minimum 12 characters",
      met: length >= 12,
      hint: length >= 12 ? "Good length" : `${Math.max(0, 12 - length)} more needed`,
    },
    {
      id: "lowercase",
      label: "Lowercase letters (a-z)",
      met: hasLower,
      hint: hasLower ? "Included" : "Missing lowercase",
    },
    {
      id: "uppercase",
      label: "Uppercase letters (A-Z)",
      met: hasUpper,
      hint: hasUpper ? "Included" : "Missing uppercase",
    },
    {
      id: "numbers",
      label: "Numbers (0-9)",
      met: hasNumbers,
      hint: hasNumbers ? "Included" : "Missing numbers",
    },
    {
      id: "symbols",
      label: "Special symbols (!@#$)",
      met: hasSymbols,
      hint: hasSymbols ? "Included" : "Missing symbols",
    },
    {
      id: "uniqueness",
      label: "No repetitive or sequential sequences",
      met: !hasSeq && !hasRep && !isCommon,
      hint: isCommon
        ? "Known weak password!"
        : hasRep
          ? "Repeated characters detected"
          : hasSeq
            ? "Sequential patterns detected"
            : "No repetitive patterns",
    },
  ];

  const suggestions: string[] = [];
  if (isCommon) {
    suggestions.push("This is a widely known dictionary password. Never use it for any account.");
  }
  if (length < 12) {
    suggestions.push(`Increase password length to at least 12 or 16 characters for significantly higher security.`);
  }
  if (!hasUpper) {
    suggestions.push("Add uppercase letters (A-Z) to expand the character keyspace.");
  }
  if (!hasLower) {
    suggestions.push("Add lowercase letters (a-z).");
  }
  if (!hasNumbers) {
    suggestions.push("Add numbers (0-9).");
  }
  if (!hasSymbols) {
    suggestions.push("Add special characters (e.g. !@#$%^&*).");
  }
  if (hasSeq) {
    suggestions.push("Avoid sequential characters like 'abc' or '123'.");
  }
  if (hasRep) {
    suggestions.push("Avoid repeating the same character consecutive times (e.g. 'aaa').");
  }

  if (suggestions.length === 0 && length >= 12) {
    suggestions.push("Excellent password! It has strong entropy and a diverse character pool.");
  }

  return {
    password,
    length,
    entropy,
    score,
    level,
    crackTimeDisplay,
    criteria,
    suggestions,
    hasCommonPattern: isCommon,
    hasRepeatedChars: hasRep,
    hasSequentialChars: hasSeq,
  };
}

