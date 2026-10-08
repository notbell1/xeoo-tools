import React, { useMemo, useState } from "react";
import { Check, Clipboard, Eye, EyeOff, RefreshCw } from "lucide-react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

import {
  DEFAULT_PASSWORD_OPTIONS,
  DEFAULT_PASSPHRASE_OPTIONS,
  DEFAULT_PIN_OPTIONS,
  buildCharacterPool,
  estimatePasswordEntropy,
  formatEntropy,
  generatePassword,
  generatePassphrase,
  generatePin,
  getStrengthDescription,
  getStrengthLevel,
  type PasswordMode,
  type PasswordOptions,
  type PasswordResult,
  type PassphraseOptions,
  type PinOptions,
  type StrengthLevel,
} from "./passwordGeneratorLogic";

type StrengthMeta = {
  label: string;
  textClass: string;
  barClass: string;
};

const STRENGTH_META: Record<StrengthLevel, StrengthMeta> = {
  "Very Weak": {
    label: "Very Weak",
    textClass: "text-red-600",
    barClass: "bg-red-500",
  },
  Weak: {
    label: "Weak",
    textClass: "text-orange-600",
    barClass: "bg-orange-500",
  },
  Moderate: {
    label: "Moderate",
    textClass: "text-yellow-700",
    barClass: "bg-yellow-500",
  },
  Strong: {
    label: "Strong",
    textClass: "text-green-600",
    barClass: "bg-green-500",
  },
  "Very Strong": {
    label: "Very Strong",
    textClass: "text-emerald-700",
    barClass: "bg-emerald-600",
  },
};

const inputClass =
  "h-9 w-full rounded-md border border-xeoo-border bg-xeoo-surface px-3 text-[12px] text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20";

const smallInputClass =
  "h-7 rounded-md border border-xeoo-border bg-xeoo-surface px-2 text-[12px] text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20";

function secureRandomInt(max: number): number {
  if (max <= 0) return 0;

  const cryptoObject = globalThis.crypto;

  if (!cryptoObject?.getRandomValues) {
    throw new Error("Secure random number generation is not available.");
  }

  const maxUint32 = 0xffffffff;
  const limit = Math.floor((maxUint32 + 1) / max) * max;

  const buffer = new Uint32Array(1);

  do {
    cryptoObject.getRandomValues(buffer);
  } while (buffer[0] >= limit);

  return buffer[0] % max;
}

function randomFrom<T>(items: T[]): T {
  return items[secureRandomInt(items.length)];
}

function randomizePrefixCase(value: string): string {
  return Array.from(value)
    .map((character) => {
      if (!/[a-z]/i.test(character)) {
        return character;
      }

      return secureRandomInt(2) === 0
        ? character.toLowerCase()
        : character.toUpperCase();
    })
    .join("");
}

function hasSequentialCharacters(value: string): boolean {
  if (value.length < 3) return false;

  for (let index = 0; index <= value.length - 3; index += 1) {
    const first = value.charCodeAt(index);
    const second = value.charCodeAt(index + 1);
    const third = value.charCodeAt(index + 2);

    if (second === first + 1 && third === second + 1) {
      return true;
    }

    if (second === first - 1 && third === second - 1) {
      return true;
    }
  }

  return false;
}

function buildSuggestion(
  prefix: string,
  length: number,
  options: PasswordOptions,
): string | null {
  if (!prefix || prefix.length > length) {
    return null;
  }

  const pool = buildCharacterPool(options);

  if (!pool) {
    return null;
  }

  const remainingLength = length - prefix.length;

  if (remainingLength === 0) {
    return randomizePrefixCase(prefix);
  }

  const characters = pool.split("");

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const suffix: string[] = [];

    for (let index = 0; index < remainingLength; index += 1) {
      suffix.push(randomFrom(characters));
    }

    const candidate = `${randomizePrefixCase(prefix)}${suffix.join("")}`;

    if (options.avoidSequential && hasSequentialCharacters(candidate)) {
      continue;
    }

    if (
      !options.allowDuplicates &&
      new Set(candidate).size !== candidate.length
    ) {
      continue;
    }

    return candidate;
  }

  let fallback = randomizePrefixCase(prefix);

  for (let index = 0; index < remainingLength; index += 1) {
    fallback += characters[secureRandomInt(characters.length)];
  }

  return fallback.slice(0, length);
}

function createSuggestions(
  prefix: string,
  length: number,
  options: PasswordOptions,
): string[] {
  if (!prefix || prefix.length > length) {
    return [];
  }

  const suggestions: string[] = [];
  const seen = new Set<string>();

  for (let attempt = 0; attempt < 150 && suggestions.length < 5; attempt += 1) {
    const suggestion = buildSuggestion(prefix, length, options);

    if (!suggestion || seen.has(suggestion)) {
      continue;
    }

    seen.add(suggestion);
    suggestions.push(suggestion);
  }

  return suggestions;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-xeoo-muted">
      {label}
    </div>
  );
}

function SmallToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex h-8 cursor-pointer items-center justify-between gap-2 rounded-md border border-xeoo-border px-2.5 text-[12px]">
      <span className="truncate text-xeoo-text">{label}</span>

      <button
        type="button"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-4 w-8 shrink-0 rounded-full transition ${
          checked ? "bg-xeoo-primary" : "bg-xeoo-border"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition ${
            checked ? "left-4.5" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}

function SmallNumber({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  React.useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const parsed = Number(draft);

    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }

    const next = Math.min(max, Math.max(min, Math.trunc(parsed)));

    setDraft(String(next));
    onChange(next);
  };

  return (
    <input
      type="number"
      min={min}
      max={max}
      inputMode="numeric"
      value={draft}
      onChange={(event) => {
        const next = event.target.value;

        if (next === "" || /^\d+$/.test(next)) {
          setDraft(next);

          if (next !== "") {
            const parsed = Number(next);

            if (Number.isFinite(parsed) && parsed <= max) {
              onChange(Math.max(min, Math.trunc(parsed)));
            }
          }
        }
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
      className={`${smallInputClass} w-14 text-center`}
    />
  );
}

function NumberField({
  value,
  min,
  max,
  onChange,
  className = inputClass,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
}) {
  const [draft, setDraft] = useState(String(value));

  React.useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const parsed = Number(draft);

    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }

    const next = Math.min(max, Math.max(min, Math.trunc(parsed)));

    setDraft(String(next));
    onChange(next);
  };

  return (
    <input
      type="number"
      min={min}
      max={max}
      inputMode="numeric"
      value={draft}
      onChange={(event) => {
        const next = event.target.value;

        if (next === "" || /^\d+$/.test(next)) {
          setDraft(next);

          if (next !== "") {
            const parsed = Number(next);

            if (Number.isFinite(parsed) && parsed <= max) {
              onChange(Math.max(min, Math.trunc(parsed)));
            }
          }
        }
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
      className={className}
    />
  );
}

export default function PasswordGenerator() {
  const [mode, setMode] = useState<PasswordMode>("password");

  const [passwordOptions, setPasswordOptions] = useState<PasswordOptions>(
    DEFAULT_PASSWORD_OPTIONS,
  );

  const [passphraseOptions, setPassphraseOptions] = useState<PassphraseOptions>(
    DEFAULT_PASSPHRASE_OPTIONS,
  );

  const [pinOptions, setPinOptions] = useState<PinOptions>(DEFAULT_PIN_OPTIONS);

  const [manualPassword, setManualPassword] = useState("");

  const [generatedResult, setGeneratedResult] = useState<PasswordResult | null>(
    null,
  );

  const [multipleValues, setMultipleValues] = useState<string[]>([]);

  const [quantity, setQuantity] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const activeValue =
    mode === "password"
      ? manualPassword || generatedResult?.value || ""
      : generatedResult?.value || "";

  const passwordPool = useMemo(
    () => buildCharacterPool(passwordOptions),
    [passwordOptions],
  );

  const activeEntropy = useMemo(() => {
    if (!activeValue) return 0;

    if (mode === "password") {
      return estimatePasswordEntropy(
        activeValue,
        Math.max(1, passwordPool.length),
      );
    }

    return generatedResult?.entropy ?? 0;
  }, [activeValue, generatedResult, mode, passwordPool.length]);

  const activeStrength = useMemo<StrengthLevel>(() => {
    if (!activeValue) {
      return "Very Weak";
    }

    return getStrengthLevel(activeEntropy);
  }, [activeEntropy, activeValue]);

  const activeStrengthMeta = STRENGTH_META[activeStrength];

  const suggestions = useMemo(() => {
    if (
      mode !== "password" ||
      !manualPassword ||
      !["Very Weak", "Weak", "Moderate"].includes(activeStrength)
    ) {
      return [];
    }

    return createSuggestions(
      manualPassword,
      passwordOptions.length,
      passwordOptions,
    );
  }, [activeStrength, manualPassword, mode, passwordOptions]);

  const generate = () => {
    setGenerating(true);

    window.setTimeout(() => {
      const results: PasswordResult[] = Array.from({ length: quantity }, () => {
        if (mode === "password") {
          return generatePassword(passwordOptions);
        }

        if (mode === "passphrase") {
          return generatePassphrase(passphraseOptions);
        }

        return generatePin(pinOptions);
      });

      setGeneratedResult(results[0] ?? null);

      setMultipleValues(results.map((result) => result.value));

      setManualPassword("");
      setCopied(false);
      setGenerating(false);
    }, 0);
  };

  const switchMode = (nextMode: PasswordMode) => {
    setMode(nextMode);
    setManualPassword("");
    setGeneratedResult(null);
    setMultipleValues([]);
    setCopied(false);
  };

  const copyValue = async (value: string) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1400);
    } catch {
      setCopied(false);
    }
  };

  const applySuggestion = (value: string) => {
    setManualPassword(value);
    setGeneratedResult(null);
    setMultipleValues([]);
    setCopied(false);
  };

  const updatePasswordOption = <K extends keyof PasswordOptions>(
    key: K,
    value: PasswordOptions[K],
  ) => {
    setPasswordOptions((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updatePasswordLength = (value: number) => {
    const length = Math.min(128, Math.max(4, Math.trunc(value)));

    setPasswordOptions((current) => ({
      ...current,
      length,
      minimumUppercase: Math.min(current.minimumUppercase, length),
      minimumLowercase: Math.min(current.minimumLowercase, length),
      minimumNumbers: Math.min(current.minimumNumbers, length),
      minimumSymbols: Math.min(current.minimumSymbols, length),
    }));
  };

  const updateQuantity = (value: number) => {
    setQuantity(Math.min(20, Math.max(1, Math.trunc(value))));
  };

  const updatePassphraseWords = (value: number) => {
    setPassphraseOptions((current) => ({
      ...current,
      words: Math.min(12, Math.max(3, Math.trunc(value))),
    }));
  };

  const updatePinLength = (value: number) => {
    setPinOptions((current) => ({
      ...current,
      length: Math.min(32, Math.max(4, Math.trunc(value))),
    }));
  };

  const strengthPercentage = Math.min(
    100,
    Math.max(0, Math.round((activeEntropy / 100) * 100)),
  );

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-xeoo-bg text-xeoo-text lg:h-screen lg:max-h-screen lg:overflow-hidden">
      <Header />

      <main className="min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3 lg:overflow-hidden lg:px-4 lg:py-2">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-2">
          <div className="flex w-full shrink-0 rounded-lg border border-xeoo-border bg-xeoo-surface p-1">
            {(
              [
                ["password", "Password"],
                ["passphrase", "Passphrase"],
                ["pin", "PIN"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => switchMode(value)}
                className={`min-h-8 flex-1 rounded-md px-3 text-[12px] font-medium transition sm:flex-none ${
                  mode === value
                    ? "bg-xeoo-primary text-white"
                    : "text-xeoo-muted hover:bg-xeoo-bg hover:text-xeoo-text"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-12">
            <section className="min-w-0 rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 lg:col-span-7 lg:overflow-hidden">
              {mode === "password" && (
                <div className="grid gap-2 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <SectionLabel label="Password" />

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={manualPassword}
                        onChange={(event) => {
                          setManualPassword(event.target.value);
                          setGeneratedResult(null);
                          setMultipleValues([]);
                          setCopied(false);
                        }}
                        placeholder="Type a password to check strength"
                        className={`${inputClass} pr-10`}
                        autoComplete="off"
                        spellCheck={false}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-xeoo-muted hover:text-xeoo-text"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[12px] font-medium">
                      Length
                    </label>

                    <NumberField
                      value={passwordOptions.length}
                      min={4}
                      max={128}
                      onChange={updatePasswordLength}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[12px] font-medium">
                      Quantity
                    </label>

                    <NumberField
                      value={quantity}
                      min={1}
                      max={20}
                      onChange={updateQuantity}
                    />
                  </div>

                  <div>
                    <SectionLabel label="Character sets" />

                    <div className="grid gap-1.5">
                      <SmallToggle
                        label="Uppercase"
                        checked={passwordOptions.uppercase}
                        onChange={(value) =>
                          updatePasswordOption("uppercase", value)
                        }
                      />

                      <SmallToggle
                        label="Lowercase"
                        checked={passwordOptions.lowercase}
                        onChange={(value) =>
                          updatePasswordOption("lowercase", value)
                        }
                      />

                      <SmallToggle
                        label="Numbers"
                        checked={passwordOptions.numbers}
                        onChange={(value) =>
                          updatePasswordOption("numbers", value)
                        }
                      />

                      <SmallToggle
                        label="Symbols"
                        checked={passwordOptions.symbols}
                        onChange={(value) =>
                          updatePasswordOption("symbols", value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <SectionLabel label="Security options" />

                    <div className="grid gap-1.5">
                      <SmallToggle
                        label="Exclude similar"
                        checked={passwordOptions.excludeSimilar}
                        onChange={(value) =>
                          updatePasswordOption("excludeSimilar", value)
                        }
                      />

                      <SmallToggle
                        label="Exclude ambiguous"
                        checked={passwordOptions.excludeAmbiguous}
                        onChange={(value) =>
                          updatePasswordOption("excludeAmbiguous", value)
                        }
                      />

                      <SmallToggle
                        label="Allow duplicates"
                        checked={passwordOptions.allowDuplicates}
                        onChange={(value) =>
                          updatePasswordOption("allowDuplicates", value)
                        }
                      />

                      <SmallToggle
                        label="Avoid sequential"
                        checked={passwordOptions.avoidSequential}
                        onChange={(value) =>
                          updatePasswordOption("avoidSequential", value)
                        }
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <SectionLabel label="Minimum requirements" />

                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                      <label className="flex h-8 items-center justify-between gap-1.5 rounded-md border border-xeoo-border px-2 text-[12px]">
                        <span>Upper</span>

                        <SmallNumber
                          value={passwordOptions.minimumUppercase}
                          min={0}
                          max={passwordOptions.length}
                          onChange={(value) =>
                            updatePasswordOption("minimumUppercase", value)
                          }
                        />
                      </label>

                      <label className="flex h-8 items-center justify-between gap-1.5 rounded-md border border-xeoo-border px-2 text-[12px]">
                        <span>Lower</span>

                        <SmallNumber
                          value={passwordOptions.minimumLowercase}
                          min={0}
                          max={passwordOptions.length}
                          onChange={(value) =>
                            updatePasswordOption("minimumLowercase", value)
                          }
                        />
                      </label>

                      <label className="flex h-8 items-center justify-between gap-1.5 rounded-md border border-xeoo-border px-2 text-[12px]">
                        <span>Numbers</span>

                        <SmallNumber
                          value={passwordOptions.minimumNumbers}
                          min={0}
                          max={passwordOptions.length}
                          onChange={(value) =>
                            updatePasswordOption("minimumNumbers", value)
                          }
                        />
                      </label>

                      <label className="flex h-8 items-center justify-between gap-1.5 rounded-md border border-xeoo-border px-2 text-[12px]">
                        <span>Symbols</span>

                        <SmallNumber
                          value={passwordOptions.minimumSymbols}
                          min={0}
                          max={passwordOptions.length}
                          onChange={(value) =>
                            updatePasswordOption("minimumSymbols", value)
                          }
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[12px] font-medium">
                      Custom characters
                    </label>

                    <input
                      type="text"
                      value={passwordOptions.customCharacters}
                      onChange={(event) =>
                        updatePasswordOption(
                          "customCharacters",
                          event.target.value,
                        )
                      }
                      className={inputClass}
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[12px] font-medium">
                      Exclude characters
                    </label>

                    <input
                      type="text"
                      value={passwordOptions.excludeCharacters}
                      onChange={(event) =>
                        updatePasswordOption(
                          "excludeCharacters",
                          event.target.value,
                        )
                      }
                      className={inputClass}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              )}

              {mode === "passphrase" && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <SectionLabel label="Passphrase settings" />
                  </div>

                  <div>
                    <label className="mb-1 block text-[12px] font-medium">
                      Words
                    </label>

                    <NumberField
                      value={passphraseOptions.words}
                      min={3}
                      max={12}
                      onChange={updatePassphraseWords}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[12px] font-medium">
                      Separator
                    </label>

                    <select
                      value={passphraseOptions.separator}
                      onChange={(event) =>
                        setPassphraseOptions((current) => ({
                          ...current,
                          separator: event.target
                            .value as PassphraseOptions["separator"],
                        }))
                      }
                      className={inputClass}
                    >
                      <option value="-">Hyphen (-)</option>
                      <option value="_">Underscore (_)</option>
                      <option value=".">Dot (.)</option>
                      <option value=" ">Space</option>
                    </select>
                  </div>

                  <div className="grid gap-1.5 sm:col-span-2 sm:grid-cols-3">
                    <SmallToggle
                      label="Capitalize words"
                      checked={passphraseOptions.capitalizeWords}
                      onChange={(value) =>
                        setPassphraseOptions((current) => ({
                          ...current,
                          capitalizeWords: value,
                        }))
                      }
                    />

                    <SmallToggle
                      label="Add number"
                      checked={passphraseOptions.addNumber}
                      onChange={(value) =>
                        setPassphraseOptions((current) => ({
                          ...current,
                          addNumber: value,
                        }))
                      }
                    />

                    <SmallToggle
                      label="Add symbol"
                      checked={passphraseOptions.addSymbol}
                      onChange={(value) =>
                        setPassphraseOptions((current) => ({
                          ...current,
                          addSymbol: value,
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {mode === "pin" && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <SectionLabel label="PIN settings" />
                  </div>

                  <div>
                    <label className="mb-1 block text-[12px] font-medium">
                      Length
                    </label>

                    <NumberField
                      value={pinOptions.length}
                      min={4}
                      max={32}
                      onChange={updatePinLength}
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <SmallToggle
                      label="Allow repeated digits"
                      checked={pinOptions.allowRepeatedDigits}
                      onChange={(value) =>
                        setPinOptions((current) => ({
                          ...current,
                          allowRepeatedDigits: value,
                        }))
                      }
                    />

                    <SmallToggle
                      label="Avoid sequential"
                      checked={pinOptions.avoidSequential}
                      onChange={(value) =>
                        setPinOptions((current) => ({
                          ...current,
                          avoidSequential: value,
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </section>

            <section className="min-w-0 rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 lg:col-span-5 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden">
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold uppercase tracking-wide text-xeoo-muted">
                      Generated result
                    </div>

                    {activeValue && (
                      <div
                        className={`mt-0.5 text-[12px] font-medium ${activeStrengthMeta.textClass}`}
                      >
                        {activeStrengthMeta.label}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={generate}
                    disabled={generating}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-xeoo-primary px-3 text-[12px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw
                      size={13}
                      className={generating ? "animate-spin" : ""}
                    />
                    Generate
                  </button>
                </div>

                <div className="mt-2 min-w-0">
                  <div className="relative min-w-0">
                    <input
                      type={
                        mode === "password" && !showPassword
                          ? "password"
                          : "text"
                      }
                      value={activeValue}
                      readOnly
                      placeholder="Generated password"
                      className={`${inputClass} min-h-9 pr-10 font-mono`}
                      aria-label="Generated password"
                    />

                    {activeValue && (
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-xeoo-muted hover:text-xeoo-text"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[12px] text-xeoo-muted">
                    <span>
                      {activeValue
                        ? `${formatEntropy(activeEntropy)} entropy`
                        : "No password generated"}
                    </span>

                    {activeValue && (
                      <button
                        type="button"
                        onClick={() => copyValue(activeValue)}
                        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-xeoo-border px-2 text-[12px] text-xeoo-muted transition hover:text-xeoo-text"
                      >
                        {copied ? <Check size={13} /> : <Clipboard size={13} />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    )}
                  </div>
                </div>

                {activeValue && (
                  <div className="mt-2">
                    <div className="mb-1 flex items-center justify-between text-[12px]">
                      <span className="text-xeoo-muted">Strength</span>

                      <span
                        className={`font-medium ${activeStrengthMeta.textClass}`}
                      >
                        {activeStrengthMeta.label}
                      </span>
                    </div>

                    <div className="h-1 overflow-hidden rounded-full bg-xeoo-border">
                      <div
                        className={`h-full rounded-full transition-all ${activeStrengthMeta.barClass}`}
                        style={{
                          width: `${Math.max(5, strengthPercentage)}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-[12px] leading-4 text-xeoo-muted">
                      {getStrengthDescription(activeStrength)}
                    </p>
                  </div>
                )}

                {multipleValues.length > 1 && (
                  <div className="mt-2 grid min-w-0 grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {multipleValues.slice(0, 6).map((value, index) => (
                      <button
                        key={`${value}-${index}`}
                        type="button"
                        onClick={() => copyValue(value)}
                        className="min-w-0 rounded-md border border-xeoo-border bg-xeoo-bg px-2 py-1.5 text-left font-mono text-[12px] text-xeoo-text transition hover:border-xeoo-primary"
                      >
                        <span className="block break-all leading-4">
                          {value}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-2 min-h-37.5 flex-1 rounded-lg border border-xeoo-border bg-xeoo-bg p-2.5 lg:min-h-0">
                <div className="mb-1.5">
                  <div className="text-[12px] font-semibold text-xeoo-text">
                    Suggested alternatives
                  </div>

                  <div className="mt-0.5 text-[12px] leading-4 text-xeoo-muted">
                    {suggestions.length > 0
                      ? `Based on "${manualPassword}" and Length ${passwordOptions.length}.`
                      : "Suggestions appear when the password strength is Moderate or below."}
                  </div>
                </div>

                <div className="grid min-h-26.25 grid-cols-1 content-start gap-1.5 sm:grid-cols-2">
                  {suggestions.length > 0 ? (
                    suggestions.slice(0, 5).map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => applySuggestion(suggestion)}
                        className="min-w-0 rounded-md border border-xeoo-border bg-xeoo-surface px-2 py-1.5 text-left transition hover:border-xeoo-primary"
                        title="Use this suggestion"
                      >
                        <span className="block break-all font-mono text-[12px] leading-4 text-xeoo-text">
                          {suggestion}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-full flex min-h-26.25 items-center justify-center rounded-md border border-dashed border-xeoo-border px-3 text-center text-[12px] leading-4 text-xeoo-muted">
                      {mode !== "password"
                        ? "Suggested alternatives are available for manual password checking."
                        : manualPassword.length > passwordOptions.length
                          ? `The typed password is longer than Length ${passwordOptions.length}.`
                          : activeValue &&
                              !["Very Weak", "Weak", "Moderate"].includes(
                                activeStrength,
                              )
                            ? "Your password is already Strong or Very Strong."
                            : "Type a password to see suggested alternatives."}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
