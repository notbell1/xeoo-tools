export type PasswordMode = "password" | "passphrase" | "pin";

export type StrengthLevel =
  | "Very Weak"
  | "Weak"
  | "Moderate"
  | "Strong"
  | "Very Strong";

export type Separator = "-" | "_" | "." | " ";

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  customCharacters: string;
  excludeCharacters: string;
  allowDuplicates: boolean;
  avoidSequential: boolean;
  minimumUppercase: number;
  minimumLowercase: number;
  minimumNumbers: number;
  minimumSymbols: number;
}

export interface PassphraseOptions {
  words: number;
  separator: Separator;
  capitalizeWords: boolean;
  addNumber: boolean;
  addSymbol: boolean;
}

export interface PinOptions {
  length: number;
  allowRepeatedDigits: boolean;
  avoidSequential: boolean;
}

export interface PasswordResult {
  value: string;
  poolSize: number;
  entropy: number;
  strength: StrengthLevel;
}

export interface PasswordPreset {
  name: string;
  description: string;
  options: Partial<PasswordOptions>;
}

export interface StrengthResult {
  level: StrengthLevel;
  entropy: number;
  percentage: number;
}

export const CHARACTER_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?/~`",
  similar: "O0oIl1L5S2ZB8G6",
  ambiguous: "{}[]()/'\"`~,;:.<>",
  digits: "0123456789",
} as const;

export const PASSPHRASE_WORDS = [
  "apple",
  "arrow",
  "atlas",
  "autumn",
  "bamboo",
  "beacon",
  "berry",
  "bird",
  "blanket",
  "blossom",
  "blue",
  "breeze",
  "bridge",
  "brook",
  "cactus",
  "candle",
  "canyon",
  "castle",
  "cedar",
  "circle",
  "cloud",
  "coffee",
  "comet",
  "coral",
  "cosmos",
  "crystal",
  "daisy",
  "dawn",
  "desert",
  "diamond",
  "drift",
  "eagle",
  "earth",
  "ember",
  "falcon",
  "feather",
  "field",
  "fire",
  "forest",
  "fox",
  "galaxy",
  "garden",
  "glacier",
  "gold",
  "harbor",
  "harmony",
  "hazel",
  "horizon",
  "island",
  "jasmine",
  "jungle",
  "lantern",
  "leaf",
  "lemon",
  "light",
  "lily",
  "lion",
  "maple",
  "meadow",
  "meteor",
  "midnight",
  "mirror",
  "moon",
  "mountain",
  "ocean",
  "olive",
  "orange",
  "orchid",
  "otter",
  "pearl",
  "pebble",
  "pine",
  "planet",
  "plum",
  "pond",
  "rain",
  "rainbow",
  "raven",
  "reef",
  "river",
  "rocket",
  "rose",
  "sapphire",
  "shadow",
  "shell",
  "silver",
  "sky",
  "snow",
  "solar",
  "spark",
  "spring",
  "star",
  "stone",
  "storm",
  "summer",
  "sunset",
  "thunder",
  "tiger",
  "timber",
  "toast",
  "trail",
  "tree",
  "tulip",
  "valley",
  "violet",
  "wave",
  "willow",
  "winter",
  "wolf",
  "wood",
  "yellow",
] as const;

export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeSimilar: false,
  excludeAmbiguous: false,
  customCharacters: "",
  excludeCharacters: "",
  allowDuplicates: true,
  avoidSequential: false,
  minimumUppercase: 0,
  minimumLowercase: 0,
  minimumNumbers: 0,
  minimumSymbols: 0,
};

export const DEFAULT_PASSPHRASE_OPTIONS: PassphraseOptions = {
  words: 5,
  separator: "-",
  capitalizeWords: false,
  addNumber: false,
  addSymbol: false,
};

export const DEFAULT_PIN_OPTIONS: PinOptions = {
  length: 6,
  allowRepeatedDigits: true,
  avoidSequential: false,
};

export const PASSWORD_PRESETS: PasswordPreset[] = [
  {
    name: "Balanced",
    description: "A strong general-purpose password.",
    options: {
      length: 20,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      allowDuplicates: true,
      avoidSequential: false,
      minimumUppercase: 1,
      minimumLowercase: 1,
      minimumNumbers: 1,
      minimumSymbols: 1,
    },
  },
  {
    name: "Maximum Security",
    description: "Long password using a broad character pool.",
    options: {
      length: 32,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      allowDuplicates: true,
      avoidSequential: false,
      minimumUppercase: 1,
      minimumLowercase: 1,
      minimumNumbers: 1,
      minimumSymbols: 1,
    },
  },
  {
    name: "Easy to Type",
    description: "Avoids visually confusing characters and symbols.",
    options: {
      length: 20,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false,
      excludeSimilar: true,
      excludeAmbiguous: true,
      allowDuplicates: true,
      avoidSequential: false,
      minimumUppercase: 1,
      minimumLowercase: 1,
      minimumNumbers: 1,
      minimumSymbols: 0,
    },
  },
  {
    name: "PIN",
    description: "Numeric code for devices and services.",
    options: {
      length: 6,
      uppercase: false,
      lowercase: false,
      numbers: true,
      symbols: false,
    },
  },
];

function uniqueCharacters(value: string): string {
  return Array.from(new Set(Array.from(value))).join("");
}

function normalizePositiveInteger(
  value: number,
  minimum: number,
  maximum: number,
): number {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.min(maximum, Math.max(minimum, Math.floor(value)));
}

function sanitizeCharacters(value: string): string {
  return Array.from(value)
    .filter((character) => {
      const codePoint = character.codePointAt(0);

      if (codePoint === undefined) {
        return false;
      }

      return codePoint >= 32 && codePoint !== 127;
    })
    .join("");
}

export function secureRandomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error("Invalid random range.");
  }

  if (
    typeof globalThis.crypto === "undefined" ||
    typeof globalThis.crypto.getRandomValues !== "function"
  ) {
    throw new Error(
      "Secure random generation is not available in this browser.",
    );
  }

  if (maxExclusive === 1) {
    return 0;
  }

  const range = 0x100000000;
  const limit = range - (range % maxExclusive);
  const randomValues = new Uint32Array(1);

  while (true) {
    globalThis.crypto.getRandomValues(randomValues);

    const value = randomValues[0];

    if (value < limit) {
      return value % maxExclusive;
    }
  }
}

export function secureRandomCharacter(characters: string): string {
  const pool = Array.from(characters);

  if (pool.length === 0) {
    throw new Error("Character pool is empty.");
  }

  return pool[secureRandomInt(pool.length)];
}

export function secureRandomIndex(length: number): number {
  return secureRandomInt(length);
}

export function buildCharacterPool(options: PasswordOptions): string {
  let pool = "";

  if (options.uppercase) {
    pool += CHARACTER_SETS.uppercase;
  }

  if (options.lowercase) {
    pool += CHARACTER_SETS.lowercase;
  }

  if (options.numbers) {
    pool += CHARACTER_SETS.numbers;
  }

  if (options.symbols) {
    pool += CHARACTER_SETS.symbols;
  }

  pool += sanitizeCharacters(options.customCharacters);

  pool = uniqueCharacters(pool);

  if (options.excludeSimilar) {
    pool = removeCharacters(pool, CHARACTER_SETS.similar);
  }

  if (options.excludeAmbiguous) {
    pool = removeCharacters(pool, CHARACTER_SETS.ambiguous);
  }

  if (options.excludeCharacters) {
    pool = removeCharacters(
      pool,
      sanitizeCharacters(options.excludeCharacters),
    );
  }

  return pool;
}

export function removeCharacters(
  source: string,
  charactersToRemove: string,
): string {
  const removeSet = new Set(Array.from(charactersToRemove));

  return Array.from(source)
    .filter((character) => !removeSet.has(character))
    .join("");
}

export function getCharacterClass(
  character: string,
): "uppercase" | "lowercase" | "number" | "symbol" | "other" {
  if (CHARACTER_SETS.uppercase.includes(character)) {
    return "uppercase";
  }

  if (CHARACTER_SETS.lowercase.includes(character)) {
    return "lowercase";
  }

  if (CHARACTER_SETS.numbers.includes(character)) {
    return "number";
  }

  if (CHARACTER_SETS.symbols.includes(character)) {
    return "symbol";
  }

  return "other";
}

export function getPoolCounts(options: PasswordOptions): {
  uppercase: number;
  lowercase: number;
  numbers: number;
  symbols: number;
  total: number;
} {
  const pool = buildCharacterPool(options);

  return {
    uppercase: Array.from(pool).filter(
      (character) => getCharacterClass(character) === "uppercase",
    ).length,

    lowercase: Array.from(pool).filter(
      (character) => getCharacterClass(character) === "lowercase",
    ).length,

    numbers: Array.from(pool).filter(
      (character) => getCharacterClass(character) === "number",
    ).length,

    symbols: Array.from(pool).filter(
      (character) => getCharacterClass(character) === "symbol",
    ).length,

    total: Array.from(pool).length,
  };
}

function isSequentialPair(previous: string, current: string): boolean {
  const a = previous.charCodeAt(0);
  const b = current.charCodeAt(0);

  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return false;
  }

  return Math.abs(a - b) === 1;
}

function violatesSequentialRule(result: string, character: string): boolean {
  if (result.length === 0) {
    return false;
  }

  return isSequentialPair(result[result.length - 1], character);
}

function generateCharacter(
  pool: string,
  result: string,
  allowDuplicates: boolean,
  avoidSequential: boolean,
): string {
  let available: string = pool;

  if (!allowDuplicates) {
    available = removeCharacters(available, result);
  }

  if (available.length === 0) {
    throw new Error(
      "The selected options do not provide enough unique characters.",
    );
  }

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const character = secureRandomCharacter(available);

    if (avoidSequential && violatesSequentialRule(result, character)) {
      continue;
    }

    return character;
  }

  if (avoidSequential) {
    available = Array.from(available)
      .filter((character) => !violatesSequentialRule(result, character))
      .join("");
  }

  if (available.length === 0) {
    throw new Error(
      "The selected options cannot satisfy the sequential-character rule.",
    );
  }

  return secureRandomCharacter(available);
}

function countClass(
  value: string,
  className: "uppercase" | "lowercase" | "number" | "symbol",
): number {
  return Array.from(value).filter(
    (character) => getCharacterClass(character) === className,
  ).length;
}

function minimumRequirementsPossible(
  pool: string,
  options: PasswordOptions,
): boolean {
  const counts = {
    uppercase: countClass(pool, "uppercase"),
    lowercase: countClass(pool, "lowercase"),
    number: countClass(pool, "number"),
    symbol: countClass(pool, "symbol"),
  };

  if (options.minimumUppercase > 0 && counts.uppercase === 0) {
    return false;
  }

  if (options.minimumLowercase > 0 && counts.lowercase === 0) {
    return false;
  }

  if (options.minimumNumbers > 0 && counts.number === 0) {
    return false;
  }

  if (options.minimumSymbols > 0 && counts.symbol === 0) {
    return false;
  }

  const minimumRequired =
    options.minimumUppercase +
    options.minimumLowercase +
    options.minimumNumbers +
    options.minimumSymbols;

  return minimumRequired <= options.length;
}

function pickRequiredCharacter(
  pool: string,
  className: "uppercase" | "lowercase" | "number" | "symbol",
  current: string,
  allowDuplicates: boolean,
  avoidSequential: boolean,
): string {
  let classPool: string = Array.from(pool)
    .filter((character) => getCharacterClass(character) === className)
    .join("");

  if (!allowDuplicates) {
    classPool = removeCharacters(classPool, current);
  }

  if (classPool.length === 0) {
    throw new Error(`Unable to satisfy the ${className} requirement.`);
  }

  if (avoidSequential) {
    const filtered = Array.from(classPool)
      .filter((character) => !violatesSequentialRule(current, character))
      .join("");

    if (filtered.length > 0) {
      classPool = filtered;
    }
  }

  return secureRandomCharacter(classPool);
}

export function generatePassword(
  inputOptions: Partial<PasswordOptions> = {},
): PasswordResult {
  const options: PasswordOptions = {
    ...DEFAULT_PASSWORD_OPTIONS,
    ...inputOptions,
  };

  options.length = normalizePositiveInteger(options.length, 4, 128);

  options.minimumUppercase = normalizePositiveInteger(
    options.minimumUppercase,
    0,
    options.length,
  );

  options.minimumLowercase = normalizePositiveInteger(
    options.minimumLowercase,
    0,
    options.length,
  );

  options.minimumNumbers = normalizePositiveInteger(
    options.minimumNumbers,
    0,
    options.length,
  );

  options.minimumSymbols = normalizePositiveInteger(
    options.minimumSymbols,
    0,
    options.length,
  );

  const pool = buildCharacterPool(options);

  if (pool.length === 0) {
    throw new Error(
      "Character pool is empty. Select at least one character type.",
    );
  }

  if (!minimumRequirementsPossible(pool, options)) {
    throw new Error(
      "The selected character settings cannot satisfy the required character counts.",
    );
  }

  if (!options.allowDuplicates && pool.length < options.length) {
    throw new Error(
      "There are not enough unique characters for the requested password length.",
    );
  }

  let password = "";

  const requirements: Array<
    ["uppercase" | "lowercase" | "number" | "symbol", number]
  > = [
    ["uppercase", options.minimumUppercase],
    ["lowercase", options.minimumLowercase],
    ["number", options.minimumNumbers],
    ["symbol", options.minimumSymbols],
  ];

  for (const [className, count] of requirements) {
    for (let i = 0; i < count; i += 1) {
      password += pickRequiredCharacter(
        pool,
        className,
        password,
        options.allowDuplicates,
        options.avoidSequential,
      );
    }
  }

  while (Array.from(password).length < options.length) {
    password += generateCharacter(
      pool,
      password,
      options.allowDuplicates,
      options.avoidSequential,
    );
  }

  password = secureShuffle(password);

  const entropy = estimatePasswordEntropy(password, pool.length);

  return {
    value: password,
    poolSize: pool.length,
    entropy,
    strength: getStrengthLevel(entropy),
  };
}

export function secureShuffle(value: string): string {
  const characters = Array.from(value);

  for (let i = characters.length - 1; i > 0; i -= 1) {
    const j = secureRandomInt(i + 1);

    [characters[i], characters[j]] = [characters[j], characters[i]];
  }

  return characters.join("");
}

export function generatePassphrase(
  inputOptions: Partial<PassphraseOptions> = {},
): PasswordResult {
  const options: PassphraseOptions = {
    ...DEFAULT_PASSPHRASE_OPTIONS,
    ...inputOptions,
  };

  options.words = normalizePositiveInteger(options.words, 3, 12);

  const selectedWords: string[] = [];

  for (let i = 0; i < options.words; i += 1) {
    let word = PASSPHRASE_WORDS[secureRandomIndex(PASSPHRASE_WORDS.length)];

    if (options.capitalizeWords) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }

    selectedWords.push(word);
  }

  let value = selectedWords.join(options.separator);

  if (options.addNumber) {
    value += secureRandomCharacter(CHARACTER_SETS.numbers);
  }

  if (options.addSymbol) {
    value += secureRandomCharacter(CHARACTER_SETS.symbols);
  }

  let entropy = options.words * Math.log2(PASSPHRASE_WORDS.length);

  if (options.addNumber) {
    entropy += Math.log2(CHARACTER_SETS.numbers.length);
  }

  if (options.addSymbol) {
    entropy += Math.log2(CHARACTER_SETS.symbols.length);
  }

  return {
    value,
    poolSize: PASSPHRASE_WORDS.length,
    entropy,
    strength: getStrengthLevel(entropy),
  };
}

export function generatePin(
  inputOptions: Partial<PinOptions> = {},
): PasswordResult {
  const options: PinOptions = {
    ...DEFAULT_PIN_OPTIONS,
    ...inputOptions,
  };

  options.length = normalizePositiveInteger(options.length, 4, 32);

  let pin = "";

  for (let i = 0; i < options.length; i += 1) {
    let available: string = CHARACTER_SETS.digits;

    if (!options.allowRepeatedDigits) {
      available = removeCharacters(available, pin);
    }

    if (available.length === 0) {
      throw new Error(
        "PIN length is too long when repeated digits are disabled.",
      );
    }

    if (options.avoidSequential) {
      const filtered = Array.from(available)
        .filter((digit) => !violatesSequentialRule(pin, digit))
        .join("");

      if (filtered.length > 0) {
        available = filtered;
      }
    }

    pin += secureRandomCharacter(available);
  }

  const entropy = estimatePasswordEntropy(pin, CHARACTER_SETS.digits.length);

  return {
    value: pin,
    poolSize: CHARACTER_SETS.digits.length,
    entropy,
    strength: getStrengthLevel(entropy),
  };
}

export function estimatePasswordEntropy(
  password: string,
  poolSize: number,
): number {
  if (password.length === 0 || poolSize <= 1) {
    return 0;
  }

  return password.length * Math.log2(poolSize);
}

export function estimateEntropyFromOptions(options: PasswordOptions): number {
  const pool = buildCharacterPool(options);

  if (pool.length <= 1) {
    return 0;
  }

  return options.length * Math.log2(pool.length);
}

export function getStrengthLevel(entropy: number): StrengthLevel {
  if (entropy < 28) {
    return "Very Weak";
  }

  if (entropy < 36) {
    return "Weak";
  }

  if (entropy < 60) {
    return "Moderate";
  }

  if (entropy < 80) {
    return "Strong";
  }

  return "Very Strong";
}

export function getStrengthResult(entropy: number): StrengthResult {
  const level = getStrengthLevel(entropy);

  const percentage = Math.min(100, Math.max(0, Math.round(entropy)));

  return {
    level,
    entropy,
    percentage,
  };
}

export function formatEntropy(entropy: number): string {
  if (!Number.isFinite(entropy)) {
    return "0 bits";
  }

  if (entropy < 10) {
    return `${entropy.toFixed(1)} bits`;
  }

  return `${Math.round(entropy)} bits`;
}

export function getStrengthDescription(strength: StrengthLevel): string {
  switch (strength) {
    case "Very Weak":
      return "This password has a very small search space.";

    case "Weak":
      return "This password should not be used for important accounts.";

    case "Moderate":
      return "Reasonable for some low-risk uses, but a longer password is preferable.";

    case "Strong":
      return "A strong randomly generated password.";

    case "Very Strong":
      return "A long password with a large estimated search space.";

    default:
      return "";
  }
}

export interface PasswordValidation {
  valid: boolean;
  errors: string[];
}

export function validatePasswordOptions(
  inputOptions: Partial<PasswordOptions>,
): PasswordValidation {
  const options: PasswordOptions = {
    ...DEFAULT_PASSWORD_OPTIONS,
    ...inputOptions,
  };

  const errors: string[] = [];
  const pool = buildCharacterPool(options);

  if (pool.length === 0) {
    errors.push(
      "Select at least one character type or provide custom characters.",
    );
  }

  if (options.length < 4 || options.length > 128) {
    errors.push("Password length must be between 4 and 128 characters.");
  }

  const minimumRequired =
    options.minimumUppercase +
    options.minimumLowercase +
    options.minimumNumbers +
    options.minimumSymbols;

  if (minimumRequired > options.length) {
    errors.push("Minimum character requirements exceed the password length.");
  }

  if (!options.allowDuplicates && pool.length < options.length) {
    errors.push(
      "There are not enough unique characters for this password length.",
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getPasswordPreset(name: string): PasswordPreset | undefined {
  return PASSWORD_PRESETS.find((preset) => preset.name === name);
}

export function applyPasswordPreset(
  current: PasswordOptions,
  presetName: string,
): PasswordOptions {
  const preset = getPasswordPreset(presetName);

  if (!preset) {
    return { ...current };
  }

  return {
    ...current,
    ...preset.options,
  };
}

export function getCharacterStatistics(password: string): {
  length: number;
  uppercase: number;
  lowercase: number;
  numbers: number;
  symbols: number;
  unique: number;
} {
  const characters = Array.from(password);

  return {
    length: characters.length,
    uppercase: countClass(password, "uppercase"),
    lowercase: countClass(password, "lowercase"),
    numbers: countClass(password, "number"),
    symbols: countClass(password, "symbol"),
    unique: new Set(characters).size,
  };
}
