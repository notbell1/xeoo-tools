import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  Award,
  Check,
  ChevronDown,
  Filter,
  Clock3,
  Crown,
  Medal,
  Play,
  RotateCcw,
  Search,
  Star,
  Target,
  Trophy,
  UserRound,
  X,
  MousePointer2,
} from "lucide-react";

import type {
  TypingDifficulty,
  TypingLanguage,
  TypingMetrics,
  TypingMode,
  TypingSettings,
} from "./typingTestLogic";

import {
  DIFFICULTY_OPTIONS,
  LANGUAGE_OPTIONS,
  MODE_OPTIONS,
  TIME_OPTIONS,
  WORD_OPTIONS,
  formatDuration,
  formatNumber,
  getModeDescription,
} from "./typingTestLogic";

interface LeaderboardItem {
  rank: number;
  name?: string;
  display_name?: string;
  username?: string;
  region: string | null;
  correct_wpm: number;
  raw_wpm: number;
  accuracy: number;
  consistency: number;
  score: number;
}

/*
|--------------------------------------------------------------------------
| Country data
|--------------------------------------------------------------------------
*/

const COUNTRY_CODES = `
AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ
BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ
CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ
DE DJ DK DM DO DZ
EC EE EG EH ER ES ET
FI FJ FK FM FO FR
GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY
HK HM HN HR HT HU
ID IE IL IM IN IO IQ IR IS IT JE JM JO JP
KE KG KH KI KM KN KP KR KW KY KZ
LA LB LC LI LK LR LS LT LU LV LY
MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ
NA NC NE NF NG NI NL NO NP NR NU NZ
OM
PA PE PF PG PH PK PL PM PN PR PS PT PW PY
QA
RE RO RS RU RW
SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ
TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ
UA UG UM US UY UZ
VA VC VE VG VI VN VU
WF WS YE YT
ZA ZM ZW
`
  .trim()
  .split(/\s+/);

const countryNames = new Intl.DisplayNames(["en"], {
  type: "region",
});

interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

function getFlagEmoji(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(code)) {
    return "🌐";
  }

  return code.replace(/[A-Z]/g, (character) =>
    String.fromCodePoint(127397 + character.charCodeAt(0)),
  );
}

const COUNTRY_OPTIONS: CountryOption[] = COUNTRY_CODES.map((code) => ({
  code,
  name: countryNames.of(code) ?? code,
  flag: getFlagEmoji(code),
})).sort((a, b) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
);

const COUNTRY_BY_CODE = new Map(
  COUNTRY_OPTIONS.map((country) => [country.code.toLowerCase(), country]),
);

const COUNTRY_BY_NAME = new Map(
  COUNTRY_OPTIONS.map((country) => [country.name.toLowerCase(), country]),
);

function getCountryInfo(
  value: string | null | undefined,
): CountryOption | null {
  if (!value?.trim()) return null;
  const normalized = value.trim().toLowerCase();
  return (
    COUNTRY_BY_CODE.get(normalized) ?? COUNTRY_BY_NAME.get(normalized) ?? null
  );
}

/*
|--------------------------------------------------------------------------
| Reusable styling
|--------------------------------------------------------------------------
*/

const inputClass =
  "h-9 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-3 text-[12px] text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20";

const dropdownTriggerClass =
  "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-xeoo-border bg-xeoo-bg px-3 text-left text-[11px] font-medium text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20 disabled:cursor-not-allowed disabled:opacity-60";

const buttonClass =
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md bg-xeoo-primary px-3 text-[12px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

const outlineButtonClass =
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md border border-xeoo-border bg-transparent px-3 text-[12px] font-medium text-xeoo-text transition hover:bg-xeoo-bg hover:text-xeoo-text disabled:cursor-not-allowed disabled:opacity-60";

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-xeoo-muted">
      {children}
    </div>
  );
}

function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex w-full gap-1 rounded-md border border-xeoo-border bg-xeoo-bg p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex flex-1 min-w-0 items-center justify-center whitespace-nowrap rounded h-7 px-1.5 text-[10px] font-semibold leading-none transition-all duration-150 sm:h-8 sm:text-[11px] ${
              active
                ? "bg-xeoo-primary text-white shadow-sm"
                : "text-xeoo-text-soft hover:bg-xeoo-surface hover:text-xeoo-text"
            }`}
          >
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-md border border-xeoo-border bg-xeoo-bg p-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-xeoo-muted">
        {label}
      </div>
      <div
        className={`mt-1 text-base font-bold tracking-tight ${accent ? "text-xeoo-primary" : "text-xeoo-text"}`}
      >
        {value}
      </div>
    </div>
  );
}

function safeNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}
function safeFormatNumber(value: unknown): string {
  return formatNumber(safeNumber(value));
}
function getPlayerName(item: LeaderboardItem): string {
  return (
    item.display_name?.trim() ||
    item.username?.trim() ||
    item.name?.trim() ||
    "Anonymous"
  );
}

/*
|--------------------------------------------------------------------------
| Country Flag & Select
|--------------------------------------------------------------------------
*/

function CountryFlag({
  code,
  name,
  size = "sm",
}: {
  code: string | null | undefined;
  name?: string;
  size?: "xs" | "sm";
}) {
  const country = code?.trim().toLowerCase();
  const flagUrl =
    country && /^[a-z]{2}$/.test(country)
      ? `https://flagcdn.com/w40/${country}.png`
      : null;

  if (!flagUrl) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-[2px] border border-xeoo-border bg-xeoo-bg font-bold text-xeoo-muted ${size === "xs" ? "h-3.5 w-5 text-[7px]" : "h-4 w-6 text-[8px]"} shrink-0`}
      >
        ?
      </span>
    );
  }

  return (
    <img
      src={flagUrl}
      alt={name ? `${name} flag` : "Country flag"}
      title={name}
      loading="lazy"
      referrerPolicy="no-referrer"
      className={`shrink-0 rounded-[2px] border border-black/5 object-cover ${size === "xs" ? "h-3.5 w-5" : "h-4 w-6"}`}
    />
  );
}

function CountrySelect({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectedCountry = useMemo(() => getCountryInfo(value), [value]);

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return COUNTRY_OPTIONS;
    return COUNTRY_OPTIONS.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query),
    );
  }, [search]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    const frameId = window.requestAnimationFrame(() =>
      searchInputRef.current?.focus(),
    );
    return () => {
      window.cancelAnimationFrame(frameId);
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`${dropdownTriggerClass} ${open ? "border-xeoo-primary/60" : ""}`}
      >
        <div className="flex min-w-0 items-center gap-2">
          {selectedCountry ? (
            <CountryFlag
              code={selectedCountry.code}
              name={selectedCountry.name}
              size="xs"
            />
          ) : (
            <span className="flex h-4 w-5 items-center justify-center rounded border border-xeoo-border bg-xeoo-surface text-[9px] text-xeoo-muted">
              ◎
            </span>
          )}
          <span className="truncate">
            {selectedCountry?.name ?? "Select your country"}
          </span>
        </div>
        <ChevronDown
          size={12}
          className={`shrink-0 text-xeoo-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-1 w-full overflow-hidden rounded-md border border-xeoo-border bg-xeoo-surface p-1 shadow-xl">
          <div className="mb-1 px-1">
            <div className="relative">
              <Search
                size={11}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xeoo-muted"
              />
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country"
                className="h-7 w-full rounded-md border border-xeoo-border bg-xeoo-bg pl-7 pr-2 text-[10px] font-semibold text-xeoo-text outline-none focus:border-xeoo-primary"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="max-h-[220px] overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="px-2.5 py-4 text-center text-[10px] text-xeoo-muted">
                No country found
              </div>
            ) : (
              filteredCountries.map((country) => {
                const selected = selectedCountry?.code === country.code;
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      onChange(country.name);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex h-7 w-full items-center gap-2 rounded px-2 text-left text-[10px] font-semibold transition ${selected ? "bg-xeoo-primary text-white" : "text-xeoo-text hover:bg-xeoo-bg"}`}
                  >
                    <CountryFlag
                      code={country.code}
                      name={country.name}
                      size="xs"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {country.name}
                    </span>
                    {selected && <Check size={11} className="shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DifficultySelect({
  value,
  onChange,
}: {
  value: TypingDifficulty;
  onChange: (value: TypingDifficulty) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = useMemo(
    () => DIFFICULTY_OPTIONS.find((option) => option.value === value),
    [value],
  );

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`${dropdownTriggerClass} ${open ? "border-xeoo-primary/60" : ""}`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Target size={13} className="shrink-0 text-xeoo-muted" />
          <span className="truncate">
            {selectedOption?.label ?? "Select difficulty"}
          </span>
        </div>
        <ChevronDown
          size={12}
          className={`shrink-0 text-xeoo-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 z-30 mt-1 w-full overflow-hidden rounded-md border border-xeoo-border bg-xeoo-surface p-1 shadow-xl">
          {DIFFICULTY_OPTIONS.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex h-7 w-full items-center justify-between gap-2 rounded px-2 text-left text-[10px] font-semibold transition ${selected ? "bg-xeoo-primary text-white" : "text-xeoo-text hover:bg-xeoo-bg"}`}
              >
                <span className="truncate">{option.label}</span>
                {selected && <Check size={11} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Setup Panel
|--------------------------------------------------------------------------
*/

export function TypingSetupPanel({
  config,
  onChange,
  onStart,
  leaderboard,
  leaderboardLoading,
  leaderboardError,
}: {
  config: TypingSettings;
  onChange: <K extends keyof TypingSettings>(
    key: K,
    value: TypingSettings[K],
  ) => void;
  onStart: () => void;
  leaderboard: LeaderboardItem[];
  leaderboardLoading: boolean;
  leaderboardError: string;
}) {
  return (
    <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-12 lg:h-full">
      <Panel className="flex flex-col h-full lg:col-span-7">
        <div className="mb-2.5">
          <SectionLabel>Test Settings</SectionLabel>
          <div className="mt-0.5 text-[10px] leading-4 text-xeoo-text-soft">
            Pick a mode and start typing.
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-xeoo-text">
              Language
            </label>
            <SegmentedControl
              value={config.language}
              options={LANGUAGE_OPTIONS}
              onChange={(value) => onChange("language", value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-xeoo-text">
              Mode
            </label>
            <SegmentedControl
              value={config.mode}
              options={MODE_OPTIONS}
              onChange={(value) => onChange("mode", value)}
            />
            <p className="mt-1.5 text-[10px] leading-4 text-xeoo-muted">
              {getModeDescription(config.mode)}
            </p>
          </div>

          {config.mode !== "custom" && (
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-xeoo-text">
                  Difficulty
                </label>
                <DifficultySelect
                  value={config.difficulty}
                  onChange={(value) => onChange("difficulty", value)}
                />
              </div>

              {config.mode === "time" ? (
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-xeoo-text">
                    Duration
                  </label>
                  <SegmentedControl
                    value={config.duration}
                    options={TIME_OPTIONS.map((value) => ({
                      value,
                      label: `${value}s`,
                    }))}
                    onChange={(value) => onChange("duration", value)}
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-xeoo-text">
                    Words
                  </label>
                  <SegmentedControl
                    value={config.wordCount}
                    options={WORD_OPTIONS.map((value) => ({
                      value,
                      label: String(value),
                    }))}
                    onChange={(value) => onChange("wordCount", value)}
                  />
                </div>
              )}
            </div>
          )}

          {config.mode === "custom" && (
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-xeoo-text">
                Custom text
              </label>
              <textarea
                value={config.customText}
                onChange={(event) => onChange("customText", event.target.value)}
                rows={4}
                placeholder="Paste or type your practice text here..."
                className="w-full resize-none rounded-md border border-xeoo-border bg-xeoo-bg px-3 py-2 text-[11px] leading-5 text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
              />
            </div>
          )}
        </div>

        {/* Start button is pushed to the bottom cleanly */}
        <div className="mt-auto border-t border-xeoo-border pt-4">
          <button
            type="button"
            onClick={onStart}
            className={`w-full ${buttonClass} h-10`}
          >
            <Play size={14} fill="currentColor" />
            Start Test
          </button>
        </div>
      </Panel>

      <div className="min-h-0 lg:col-span-5 lg:flex lg:flex-col lg:overflow-hidden h-full">
        <TypingLeaderboardPanel
          language={config.language}
          mode={config.mode}
          difficulty={config.difficulty}
          duration={config.duration}
          wordCount={config.wordCount}
          items={leaderboard}
          loading={leaderboardLoading}
          error={leaderboardError}
        />
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Typing test
|--------------------------------------------------------------------------
*/

export function TypingTestPanel({
  settings,
  targetText,
  typedText,
  elapsedSeconds,
  remainingSeconds,
  metrics,
  targetCharacters,
  onChange,
  onFinish,
  busy,
}: {
  settings: TypingSettings;
  targetText: string;
  typedText: string;
  elapsedSeconds: number;
  remainingSeconds: number;
  metrics: TypingMetrics | null;
  targetCharacters: number;
  onChange: (value: string) => void;
  onFinish: () => void;
  busy: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(true);

  const typedCharacters = useMemo(() => Array.from(typedText), [typedText]);
  const targetCharactersArray = useMemo(
    () => Array.from(targetText),
    [targetText],
  );
  const progress =
    targetCharacters > 0
      ? Math.min((typedCharacters.length / targetCharacters) * 100, 100)
      : 0;

  // Smart Tokenization: Memecah teks ke dalam kata dan spasi.
  // Berguna agar justify teks berfungsi dan tidak terpotong (break word) di akhir baris.
  const tokens = useMemo(() => {
    const result = [];
    let currentWord: { char: string; index: number }[] = [];

    for (let i = 0; i < targetCharactersArray.length; i++) {
      const char = targetCharactersArray[i];
      if (char === " ") {
        if (currentWord.length > 0) {
          result.push({ type: "word", chars: currentWord });
          currentWord = [];
        }
        result.push({ type: "space", chars: [{ char, index: i }] });
      } else {
        currentWord.push({ char, index: i });
      }
    }
    if (currentWord.length > 0) {
      result.push({ type: "word", chars: currentWord });
    }
    return result;
  }, [targetCharactersArray]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const renderChar = (c: { char: string; index: number }) => {
    const { char, index } = c;
    const typedCharacter = typedCharacters[index];
    const isTyped = typedCharacter !== undefined;
    const isCorrect = isTyped && typedCharacter === char;
    const isIncorrect = isTyped && typedCharacter !== char;
    const isCurrent = index === typedCharacters.length;
    const isSpace = char === " ";

    // Styling Validasi Huruf yang Jelas dan Elegan
    let charStyle = "text-xeoo-text-soft border-transparent"; // Belum diketik

    if (isCorrect) {
      charStyle = isSpace
        ? "text-transparent"
        : "text-emerald-500 font-bold drop-shadow-[0_0_2px_rgba(16,185,129,0.3)] border-transparent"; // Hijau menyala
    } else if (isIncorrect) {
      charStyle =
        "text-red-500 bg-red-500/20 rounded-[2px] font-bold underline decoration-red-500 decoration-2 underline-offset-2"; // Blok merah
    } else if (isCurrent) {
      charStyle =
        "text-xeoo-text bg-xeoo-surface shadow-[0_0_8px_rgba(255,255,255,0.2)] ring-1 ring-xeoo-primary/40 border-transparent"; // Posisi kursor
    }

    // Caret aktif berkedip (cursor indicator)
    const caretStyle = isCurrent
      ? "relative before:absolute before:-left-[1.5px] before:top-[10%] before:h-[80%] before:w-[2px] before:rounded-full before:bg-xeoo-primary before:animate-pulse"
      : "";

    let displayChar = char;
    if (char === " " && isIncorrect) {
      displayChar = typedCharacter; // Jika spasi salah ketik, tampilkan huruf yang terketik
    }

    return (
      <span
        key={`${index}-${char}`}
        className={`px-[1px] rounded-[3px] border transition-all duration-100 ${charStyle} ${caretStyle}`}
      >
        {displayChar === " " ? "\u00A0" : displayChar}
      </span>
    );
  };

  return (
    <Panel className="flex h-full min-h-0 flex-col p-2.5 sm:p-3">
      <div className="flex items-center justify-between gap-2 border-b border-xeoo-border pb-2.5">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-[11px] font-bold uppercase tracking-wide text-xeoo-muted">
              {settings.language}
            </span>
            <span className="text-[10px] text-xeoo-muted">·</span>
            <span className="truncate text-[11px] font-semibold text-xeoo-text">
              {settings.mode === "custom" ? "Custom" : settings.difficulty}
            </span>
          </div>
          <div className="mt-0.5 truncate text-[12px] font-semibold text-xeoo-text">
            {settings.mode === "time"
              ? `${settings.duration} second test`
              : settings.mode === "words"
                ? `${settings.wordCount} word test`
                : "Custom text"}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div className="rounded-md border border-xeoo-border bg-xeoo-bg px-2 py-1 text-right">
            <div className="flex items-center justify-end gap-1 text-[8px] font-bold uppercase tracking-wide text-xeoo-muted">
              <Clock3 size={9} />
              {settings.mode === "time" ? "Remaining" : "Time"}
            </div>
            <div className="mt-0.5 font-mono text-[13px] font-bold tabular-nums text-xeoo-text">
              {formatDuration(
                settings.mode === "time" ? remainingSeconds : elapsedSeconds,
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onFinish}
            disabled={busy}
            className={outlineButtonClass}
            title="Finish test"
          >
            <Target size={13} />
            <span className="hidden sm:inline">Finish</span>
          </button>
        </div>
      </div>

      <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-xeoo-bg">
        <div
          className="h-full rounded-full bg-xeoo-primary transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        className={`relative mt-2.5 min-h-0 flex-1 cursor-text overflow-hidden rounded-md border border-xeoo-border bg-xeoo-bg p-4 transition-all duration-200 ${isFocused ? "ring-1 ring-xeoo-primary/20" : ""}`}
        onClick={() => textareaRef.current?.focus()}
      >
        <textarea
          ref={textareaRef}
          value={typedText}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          className="absolute left-0 top-0 h-px w-px resize-none opacity-0"
        />

        {/* Focus Blur Overlay */}
        <div
          className={`absolute inset-0 z-10 flex items-center justify-center bg-xeoo-bg/50 backdrop-blur-[2px] transition-all duration-200 ${isFocused ? "pointer-events-none opacity-0" : "opacity-100"}`}
        >
          <div className="flex items-center gap-2 rounded-full border border-xeoo-border bg-xeoo-surface px-4 py-2 text-[11px] font-bold text-xeoo-text shadow-lg">
            <MousePointer2
              size={14}
              className="text-xeoo-primary animate-bounce"
            />
            Click to focus
          </div>
        </div>

        <div
          aria-hidden="true"
          className={`h-full w-full overflow-y-auto font-mono text-[18px] sm:text-[20px] font-medium leading-[2.2] tracking-wide text-justify [text-align-last:left] select-none transition-all duration-200 ${!isFocused ? "blur-[2px] opacity-40" : "opacity-100"}`}
        >
          {tokens.map((token, tIdx) => {
            if (token.type === "word") {
              return (
                <span
                  key={`word-${tIdx}`}
                  className="inline-block whitespace-nowrap"
                >
                  {token.chars.map((c) => renderChar(c))}
                </span>
              );
            } else {
              return token.chars.map((c) => renderChar(c));
            }
          })}

          {/* Kursor di baris paling terakhir ketika text komplit semua */}
          {typedCharacters.length === targetCharactersArray.length && (
            <span className="relative before:absolute before:-left-[1.5px] before:top-[15%] before:h-[70%] before:w-[2px] before:rounded-full before:bg-xeoo-primary before:animate-pulse"></span>
          )}
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Metric
          label="Raw WPM"
          value={safeFormatNumber(metrics?.rawWpm)}
          accent
        />
        <Metric
          label="Correct WPM"
          value={safeFormatNumber(metrics?.correctWpm)}
          accent
        />
        <Metric
          label="Accuracy"
          value={`${safeFormatNumber(metrics?.accuracy)}%`}
        />
        <Metric
          label="Errors"
          value={safeFormatNumber(metrics?.incorrectCharacters)}
        />
      </div>
    </Panel>
  );
}

/*
|--------------------------------------------------------------------------
| Result
|--------------------------------------------------------------------------
*/

export function TypingResultPanel({
  metrics,
  settings,
  leaderboardEligible,
  canSave,
  error,
  busy,
  onSave,
  onNotNow,
  onNewTest,
}: {
  metrics: TypingMetrics;
  settings: TypingSettings;
  leaderboardEligible: boolean;
  canSave: boolean;
  error: string;
  busy: boolean;
  onSave: () => void;
  onNotNow: () => void;
  onNewTest: () => void;
}) {
  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center">
      <Panel className="w-full p-3 sm:p-4">
        <div className="flex flex-col items-center border-b border-xeoo-border pb-4 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-xeoo-border bg-xeoo-bg px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-xeoo-muted">
            <Trophy size={11} />
            Test Complete
          </div>
          <div className="mt-2.5 flex items-baseline justify-center gap-2">
            <span className="text-5xl font-black tabular-nums tracking-tight text-xeoo-text sm:text-6xl">
              {safeFormatNumber(metrics.correctWpm)}
            </span>
            <span className="text-xs font-bold uppercase text-xeoo-muted">
              WPM
            </span>
          </div>
          <div className="mt-1 text-[10px] text-xeoo-muted">
            {settings.language} ·{" "}
            {settings.mode === "custom" ? "Custom" : settings.mode}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          <Metric
            label="Correct WPM"
            value={safeFormatNumber(metrics.correctWpm)}
            accent
          />
          <Metric label="Raw WPM" value={safeFormatNumber(metrics.rawWpm)} />
          <Metric
            label="Accuracy"
            value={`${safeFormatNumber(metrics.accuracy)}%`}
          />
          <Metric
            label="Consistency"
            value={`${safeFormatNumber(metrics.consistency)}%`}
          />
          <Metric
            label="Errors"
            value={safeFormatNumber(metrics.incorrectCharacters)}
          />
          <Metric
            label="Completion"
            value={`${safeFormatNumber(metrics.completion)}%`}
          />
          <Metric
            label="Score"
            value={safeFormatNumber(metrics.score)}
            accent
          />
          <Metric label="Time" value={formatDuration(metrics.elapsedSeconds)} />
        </div>

        {error && (
          <div className="mt-3 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-[11px] text-red-500">
            {error}
          </div>
        )}

        <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
          {canSave && leaderboardEligible && (
            <button
              type="button"
              onClick={onSave}
              disabled={busy}
              className={buttonClass}
            >
              <Trophy size={13} />
              Save to Leaderboard
            </button>
          )}
          {canSave && (
            <button
              type="button"
              onClick={onNotNow}
              disabled={busy}
              className={outlineButtonClass}
            >
              Not Now
            </button>
          )}
          <button
            type="button"
            onClick={onNewTest}
            disabled={busy}
            className={outlineButtonClass}
          >
            <RotateCcw size={13} />
            New Test
          </button>
        </div>
      </Panel>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Save
|--------------------------------------------------------------------------
*/

export function TypingSavePanel({
  metrics,
  error,
  busy,
  onCancel,
  onSave,
}: {
  metrics: TypingMetrics;
  error: string;
  busy: boolean;
  onCancel: () => void;
  onSave: (
    username: string,
    region: string,
    countryCode: string | null,
  ) => void;
}) {
  const [username, setUsername] = useState("");
  const [region, setRegion] = useState("");

  const selectedCountry = getCountryInfo(region);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanUsername = username.trim();
    const cleanRegion = region.trim();
    if (!cleanUsername || !cleanRegion) return;

    const code = selectedCountry ? selectedCountry.code : null;
    onSave(cleanUsername, cleanRegion, code);
  };

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-2 md:grid-cols-2">
      <Panel className="p-3 sm:p-4">
        <div className="mb-3 flex items-start gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-xeoo-primary/20 text-xeoo-primary">
            <Trophy size={14} />
          </div>
          <div className="min-w-0">
            <SectionLabel>Save Result</SectionLabel>
            <div className="mt-0.5 text-[10px] leading-4 text-xeoo-muted">
              Pick a name and country for the leaderboard.
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-xeoo-muted">
              Username
            </label>
            <div className="relative">
              <UserRound
                size={13}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xeoo-muted"
              />
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                maxLength={32}
                required
                placeholder="Your display name"
                className={`${inputClass} pl-8`}
                autoComplete="nickname"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-xeoo-muted">
              Country
            </label>
            <CountrySelect
              value={region}
              onChange={setRegion}
              disabled={busy}
            />
          </div>

          {selectedCountry && (
            <div className="flex items-center gap-2 rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-2">
              <CountryFlag
                code={selectedCountry.code}
                name={selectedCountry.name}
                size="xs"
              />
              <div className="min-w-0">
                <div className="truncate text-[10px] font-semibold text-xeoo-text">
                  {selectedCountry.name}
                </div>
                <div className="text-[8px] font-bold uppercase tracking-wide text-xeoo-muted">
                  {selectedCountry.code}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-[11px] text-red-500">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              type="submit"
              disabled={busy || !username.trim() || !region}
              className={buttonClass}
            >
              <Trophy size={13} />
              {busy ? "Saving..." : "Save Result"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className={outlineButtonClass}
            >
              Cancel
            </button>
          </div>
        </form>
      </Panel>

      <Panel className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <SectionLabel>Your Result</SectionLabel>
          <div className="rounded-md border border-xeoo-border bg-xeoo-bg px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-xeoo-muted">
            Score Preview
          </div>
        </div>
        <div className="mt-2 flex items-end gap-2">
          <div className="font-mono text-4xl font-black tabular-nums tracking-tight text-xeoo-text">
            {safeFormatNumber(metrics.correctWpm)}
          </div>
          <div className="pb-1 text-[10px] font-bold uppercase text-xeoo-muted">
            WPM
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <Metric
            label="Accuracy"
            value={`${safeFormatNumber(metrics.accuracy)}%`}
          />
          <Metric
            label="Consistency"
            value={`${safeFormatNumber(metrics.consistency)}%`}
          />
          <Metric
            label="Score"
            value={safeFormatNumber(metrics.score)}
            accent
          />
        </div>
      </Panel>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Leaderboard Filter Component
|--------------------------------------------------------------------------
*/

function LeaderboardCountryFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = useMemo(() => {
    if (value === "all") return null;
    return COUNTRY_OPTIONS.find(
      (c) => c.code.toLowerCase() === value.toLowerCase(),
    );
  }, [value]);

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return COUNTRY_OPTIONS;
    return COUNTRY_OPTIONS.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query),
    );
  }, [search]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    const frameId = window.requestAnimationFrame(() =>
      searchInputRef.current?.focus(),
    );
    return () => {
      window.cancelAnimationFrame(frameId);
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative min-w-0 flex-1 sm:w-48 sm:flex-none"
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`${dropdownTriggerClass} ${open ? "border-xeoo-primary/60" : ""}`}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <Filter size={11} className="shrink-0 text-xeoo-muted" />
          <span className="truncate">
            {selectedCountry ? selectedCountry.name : "All countries"}
          </span>
        </div>
        <ChevronDown
          size={12}
          className={`shrink-0 text-xeoo-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-30 mt-1 sm:right-auto sm:w-48 overflow-hidden rounded-md border border-xeoo-border bg-xeoo-surface p-1 shadow-xl">
          <div className="mb-1 px-1">
            <input
              ref={searchInputRef}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search..."
              className="h-7 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-2 text-[10px] font-medium text-xeoo-text outline-none focus:border-xeoo-primary"
              autoComplete="off"
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange("all");
                setOpen(false);
              }}
              className={`flex h-7 w-full items-center px-2 text-left text-[10px] font-medium transition ${value === "all" ? "bg-xeoo-primary text-white" : "text-xeoo-text hover:bg-xeoo-bg"}`}
            >
              All countries
            </button>
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  onChange(country.code);
                  setOpen(false);
                }}
                className={`flex h-7 w-full items-center gap-1.5 px-2 text-left text-[10px] font-medium transition ${value.toLowerCase() === country.code.toLowerCase() ? "bg-xeoo-primary text-white" : "text-xeoo-text hover:bg-xeoo-bg"}`}
              >
                <CountryFlag
                  code={country.code}
                  name={country.name}
                  size="xs"
                />
                <span className="truncate">{country.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Leaderboard Core
|--------------------------------------------------------------------------
*/

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1)
    return <Crown size={15} strokeWidth={2.25} fill="currentColor" />;
  if (rank === 2) return <Trophy size={15} strokeWidth={2.25} />;
  if (rank === 3) return <Medal size={15} strokeWidth={2.25} />;
  if (rank === 4) return <Award size={15} strokeWidth={2.25} />;
  if (rank === 5)
    return <Star size={15} strokeWidth={2.25} fill="currentColor" />;
  return <span className="text-[10px] font-black text-xeoo-muted">{rank}</span>;
}

function rankMeta(rank: number) {
  switch (rank) {
    case 1:
      return {
        label: "CHAMPION",
        icon: "text-amber-500",
        badge: "border-amber-400 bg-white text-amber-600",
        box: "border-amber-400 bg-white",
      };
    case 2:
      return {
        label: "RUNNER-UP",
        icon: "text-slate-500",
        badge: "border-slate-300 bg-white text-slate-600",
        box: "border-slate-300 bg-white",
      };
    case 3:
      return {
        label: "THIRD",
        icon: "text-orange-500",
        badge: "border-orange-400 bg-white text-orange-600",
        box: "border-orange-400 bg-white",
      };
    case 4:
      return {
        label: "FOURTH",
        icon: "text-blue-500",
        badge: "border-blue-400 bg-white text-blue-600",
        box: "border-blue-400 bg-white",
      };
    case 5:
      return {
        label: "FIFTH",
        icon: "text-purple-500",
        badge: "border-purple-300 bg-white text-purple-600",
        box: "border-purple-300 bg-white",
      };
    default:
      return {
        label: `#${rank}`,
        icon: "text-xeoo-muted",
        badge: "border-xeoo-border bg-white text-xeoo-muted",
        box: "border-xeoo-border bg-white",
      };
  }
}

function LeaderboardIdentity({
  item,
  compact = false,
}: {
  item: LeaderboardItem;
  compact?: boolean;
}) {
  const country = getCountryInfo(item.region);
  const name = getPlayerName(item);
  const meta = rankMeta(item.rank);

  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-3">
        <span
          className={`shrink-0 truncate font-bold text-xeoo-text w-[90px] sm:w-[130px] ${compact ? "text-[10px]" : "text-[11px]"}`}
        >
          {name}
        </span>

        <div className="flex shrink-0 items-center gap-1.5 w-[75px] sm:w-[100px]">
          {country ? (
            <>
              <CountryFlag code={country.code} name={country.name} size="xs" />
              <span className="truncate text-[9px] font-medium text-xeoo-muted sm:inline hidden">
                {country.name}
              </span>
            </>
          ) : item.region?.trim() ? (
            <span className="truncate text-[9px] font-medium text-xeoo-muted sm:inline hidden">
              {item.region.trim()}
            </span>
          ) : (
            <span className="text-[9px] text-xeoo-muted sm:inline hidden">
              —
            </span>
          )}
        </div>

        {!compact && item.rank <= 5 && (
          <span
            className={`shrink-0 rounded w-[64px] text-center px-1 py-[2px] text-[8px] font-bold uppercase tracking-wider border ${meta.badge}`}
          >
            {meta.label}
          </span>
        )}
      </div>

      <div
        className={`mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xeoo-muted ${compact ? "text-[8px]" : "text-[9px]"}`}
      >
        <span className="w-16">
          RAW{" "}
          <strong className="font-semibold text-xeoo-text">
            {safeFormatNumber(item.raw_wpm)}
          </strong>
        </span>
        <span className="w-16">
          ACC{" "}
          <strong className="font-semibold text-xeoo-text">
            {safeFormatNumber(item.accuracy)}%
          </strong>
        </span>
        <span className="w-16">
          CONS{" "}
          <strong className="font-semibold text-xeoo-text">
            {safeFormatNumber(item.consistency)}%
          </strong>
        </span>
        <span className="w-16">
          SCORE{" "}
          <strong className="font-semibold text-xeoo-text">
            {safeFormatNumber(item.score)}
          </strong>
        </span>
      </div>
    </div>
  );
}

function LeaderboardCard({ item }: { item: LeaderboardItem }) {
  const meta = rankMeta(item.rank);
  return (
    <div className="flex items-center gap-3 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 py-2 transition hover:border-xeoo-primary/40">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${meta.box}`}
        title={meta.label}
      >
        <span className={meta.icon}>
          <RankIcon rank={item.rank} />
        </span>
      </div>
      <LeaderboardIdentity item={item} />
      <div className="shrink-0 text-right pl-2">
        <div className="font-mono text-[16px] font-bold leading-none tabular-nums text-xeoo-text">
          {safeFormatNumber(item.correct_wpm)}
        </div>
        <div className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-xeoo-muted">
          WPM
        </div>
      </div>
    </div>
  );
}

function LeaderboardCompactRow({ item }: { item: LeaderboardItem }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-xeoo-border bg-xeoo-bg px-2.5 py-1.5 transition hover:border-xeoo-primary/35">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-xeoo-border bg-white text-[9px] font-bold text-xeoo-muted">
        {item.rank}
      </div>
      <LeaderboardIdentity item={item} compact />
      <div className="shrink-0 text-right pl-2">
        <div className="font-mono text-[13px] font-bold leading-none tabular-nums text-xeoo-text">
          {safeFormatNumber(item.correct_wpm)}
        </div>
        <div className="mt-0.5 text-[7px] font-bold uppercase tracking-wider text-xeoo-muted">
          WPM
        </div>
      </div>
    </div>
  );
}

export function TypingLeaderboardPanel({
  language,
  mode,
  difficulty,
  duration,
  wordCount,
  items,
  loading,
  error,
}: {
  language: TypingLanguage;
  mode: TypingMode;
  difficulty: TypingDifficulty;
  duration: number;
  wordCount: number;
  items: LeaderboardItem[];
  loading: boolean;
  error: string;
}) {
  const title =
    mode === "time"
      ? `${duration}s Leaderboard`
      : `${wordCount} Words Leaderboard`;
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.rank - b.rank),
    [items],
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return sortedItems.filter((item) => {
      const name = getPlayerName(item).toLowerCase();
      const region = item.region?.trim().toLowerCase() ?? "";
      const country = getCountryInfo(item.region);
      const countryMatches =
        countryFilter === "all" ||
        country?.code.toLowerCase() === countryFilter.toLowerCase();
      const searchMatches =
        !query ||
        name.includes(query) ||
        region.includes(query) ||
        country?.name.toLowerCase().includes(query) ||
        country?.code.toLowerCase().includes(query);
      return countryMatches && searchMatches;
    });
  }, [sortedItems, searchQuery, countryFilter]);

  const topFive = filteredItems.filter((item) => item.rank <= 5);
  const remaining = filteredItems.filter((item) => item.rank > 5);
  const bestWpm = filteredItems.length
    ? Math.max(...filteredItems.map((item) => safeNumber(item.correct_wpm)))
    : 0;
  const isFiltered = Boolean(searchQuery.trim()) || countryFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setCountryFilter("all");
  };

  return (
    <Panel className="flex h-full min-h-0 flex-col overflow-hidden p-2.5">
      <div className="flex items-center justify-between gap-2 border-b border-xeoo-border pb-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-primary">
            <Trophy size={13} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[11px] font-bold uppercase tracking-wide text-xeoo-text">
              {title}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[9px] font-medium text-xeoo-muted">
              <span>{language}</span>
              <span>·</span>
              <span>{mode === "custom" ? "Custom" : difficulty}</span>
            </div>
          </div>
        </div>
        {mode !== "custom" && (
          <div className="shrink-0 rounded border border-xeoo-border bg-xeoo-bg px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-xeoo-muted">
            TOP 10
          </div>
        )}
      </div>

      {mode === "custom" ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-4 text-center">
          <div>
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full border border-xeoo-border bg-xeoo-surface text-xeoo-muted">
              <Target size={14} />
            </div>
            <div className="mt-2 text-[11px] font-bold text-xeoo-text">
              Custom tests are not ranked.
            </div>
            <div className="mt-1 text-[10px] text-xeoo-muted">
              Use a timed or word-based test to enter the leaderboard.
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="mt-2.5 min-h-0 flex-1 space-y-1.5 overflow-hidden">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="h-10 animate-pulse rounded-md bg-xeoo-surface"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-4 text-center">
          <div className="max-w-xs">
            <div className="text-[11px] font-bold text-red-500">
              Leaderboard unavailable
            </div>
            <div className="mt-1 text-[10px] text-xeoo-muted">{error}</div>
          </div>
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-4 text-center">
          <div>
            <Trophy size={18} className="mx-auto text-xeoo-muted" />
            <div className="mt-2 text-[11px] font-bold text-xeoo-text">
              No saved scores yet.
            </div>
            <div className="mt-1 text-[10px] text-xeoo-muted">
              Be the first player on the board.
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto pr-1 mt-2">
          <div className="rounded-md border border-xeoo-border bg-xeoo-bg p-1.5">
            <div className="flex flex-col gap-1.5 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={12}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xeoo-muted"
                />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search player..."
                  className="h-8 w-full rounded-md border border-xeoo-border bg-xeoo-surface pl-8 pr-8 text-[10px] font-medium text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-xeoo-muted transition hover:bg-xeoo-bg hover:text-xeoo-text"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
              <LeaderboardCountryFilter
                value={countryFilter}
                onChange={setCountryFilter}
              />
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2 px-1 mb-2">
            <div className="flex min-w-0 items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-xeoo-muted">
              <span>
                {isFiltered ? `${filteredItems.length} MATCHES` : "TOP SCORES"}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 text-[9px] font-medium text-xeoo-muted">
              <span>Best WPM</span>
              <span className="font-mono font-bold text-xeoo-text">
                {filteredItems.length ? safeFormatNumber(bestWpm) : "—"}
              </span>
              {isFiltered && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-1 rounded border border-xeoo-border bg-xeoo-surface px-1.5 py-0.5 text-[8px] font-bold text-xeoo-text transition hover:bg-xeoo-border"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="mt-2 flex items-center justify-center rounded-md border border-dashed border-xeoo-border bg-xeoo-surface px-4 py-8 text-center">
              <div>
                <Search size={16} className="mx-auto text-xeoo-muted" />
                <div className="mt-2 text-[11px] font-bold text-xeoo-text">
                  No players found
                </div>
                <div className="mt-1 text-[10px] text-xeoo-muted">
                  Try another name or country.
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                {topFive.map((item) => (
                  <LeaderboardCard
                    key={`${item.rank}-${item.username ?? item.name}`}
                    item={item}
                  />
                ))}
              </div>
              {remaining.length > 0 && (
                <>
                  <div className="my-3 flex items-center gap-2 px-1">
                    <div className="h-px flex-1 bg-xeoo-border" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Other ranks
                    </span>
                    <div className="h-px flex-1 bg-xeoo-border" />
                  </div>
                  <div className="space-y-1.5 pb-2">
                    {remaining.map((item) => (
                      <LeaderboardCompactRow
                        key={`${item.rank}-${item.username ?? item.name}`}
                        item={item}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </Panel>
  );
}
