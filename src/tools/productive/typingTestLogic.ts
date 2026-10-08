export type TypingLanguage = "english" | "indonesian";

export type TypingMode = "time" | "words" | "custom";

export type TypingDifficulty =
  | "common"
  | "advanced"
  | "technical"
  | "punctuation";

export type TypingDuration = 15 | 30 | 60 | 120;

export type TypingWordCount = 10 | 25 | 50 | 100 | 200;

export type TypingKeystrokeAction = "insert" | "delete";

export interface TypingSettings {
  language: TypingLanguage;
  mode: TypingMode;
  difficulty: TypingDifficulty;
  duration: TypingDuration;
  wordCount: TypingWordCount;
  customText: string;
}

export interface TypingMetrics {
  typedCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
  rawWpm: number;
  correctWpm: number;
  accuracy: number;
  consistency: number;
  completion: number;
  score: number;
  elapsedSeconds: number;
}

export interface TypingSegment {
  startTime: number;
  endTime: number;
  characters: number;
  correctCharacters: number;
  wpm: number;
}

export interface TypingKeystroke {
  timestamp: number;
  character: string;
  action: TypingKeystrokeAction;
}

export const TIME_OPTIONS: TypingDuration[] = [15, 30, 60, 120];

export const WORD_OPTIONS: TypingWordCount[] = [10, 25, 50, 100, 200];

export const DIFFICULTY_OPTIONS: Array<{
  value: TypingDifficulty;
  label: string;
}> = [
  {
    value: "common",
    label: "Common",
  },
  {
    value: "advanced",
    label: "Advanced",
  },
  {
    value: "technical",
    label: "Technical",
  },
  {
    value: "punctuation",
    label: "Punctuation",
  },
];

export const LANGUAGE_OPTIONS: Array<{
  value: TypingLanguage;
  label: string;
}> = [
  {
    value: "english",
    label: "English",
  },
  {
    value: "indonesian",
    label: "Indonesian",
  },
];

export const MODE_OPTIONS: Array<{
  value: TypingMode;
  label: string;
}> = [
  {
    value: "time",
    label: "Time",
  },
  {
    value: "words",
    label: "Words",
  },
  {
    value: "custom",
    label: "Custom Text",
  },
];

const TIME_TARGET_WORDS: Record<TypingDuration, number> = {
  15: 60,
  30: 120,
  60: 240,
  120: 480,
};

const WORD_COUNT_SET = new Set<number>(WORD_OPTIONS);

const DURATION_SET = new Set<number>(TIME_OPTIONS);

const COMMON_ENGLISH = [
  "the",
  "and",
  "that",
  "have",
  "this",
  "with",
  "from",
  "they",
  "will",
  "your",
  "would",
  "there",
  "their",
  "what",
  "about",
  "which",
  "when",
  "make",
  "time",
  "could",
  "people",
  "some",
  "other",
  "into",
  "more",
  "than",
  "first",
  "water",
  "been",
  "call",
  "who",
  "its",
  "now",
  "find",
  "long",
  "down",
  "day",
  "did",
  "get",
  "come",
  "made",
  "may",
  "part",
  "over",
  "new",
  "sound",
  "take",
  "only",
  "little",
  "work",
  "know",
  "place",
  "year",
  "live",
  "back",
  "give",
  "most",
  "very",
  "after",
  "thing",
  "our",
  "just",
  "name",
  "good",
  "sentence",
  "great",
  "think",
  "say",
  "help",
  "through",
  "much",
  "before",
  "line",
  "right",
  "too",
  "mean",
  "old",
  "any",
  "same",
  "tell",
  "boy",
  "follow",
  "came",
  "want",
  "show",
  "also",
  "around",
  "form",
  "three",
  "small",
  "set",
  "put",
  "end",
  "does",
  "another",
  "well",
  "large",
  "must",
  "big",
  "even",
  "such",
  "because",
  "turn",
  "here",
  "why",
  "ask",
  "went",
  "men",
  "read",
  "need",
  "land",
  "different",
  "home",
  "move",
  "try",
  "kind",
  "hand",
  "picture",
  "again",
  "change",
  "off",
  "play",
  "spell",
  "air",
  "away",
  "animal",
  "house",
  "point",
  "page",
  "letter",
  "mother",
  "answer",
  "found",
  "study",
  "still",
  "learn",
  "should",
  "world",
  "high",
  "every",
  "near",
  "add",
  "food",
  "between",
  "own",
  "below",
  "country",
  "plant",
  "last",
  "school",
  "father",
  "keep",
  "tree",
  "never",
  "start",
  "city",
  "earth",
  "eye",
  "light",
  "thought",
  "head",
  "under",
  "story",
  "saw",
  "left",
  "don’t",
  "few",
  "while",
  "along",
  "might",
  "close",
  "something",
  "seem",
  "next",
  "hard",
  "open",
  "example",
  "begin",
  "life",
  "always",
  "those",
  "both",
  "paper",
  "together",
  "got",
  "group",
  "often",
  "run",
  "important",
  "until",
  "children",
  "side",
  "feet",
  "car",
  "mile",
  "night",
  "walk",
  "white",
  "sea",
  "began",
  "grow",
  "took",
  "river",
  "four",
  "carry",
  "state",
  "once",
  "book",
  "hear",
  "stop",
  "without",
  "second",
  "late",
  "miss",
  "idea",
  "enough",
  "eat",
  "face",
  "watch",
  "far",
  "Indian",
  "really",
  "almost",
  "let",
  "above",
  "girl",
  "sometimes",
  "mountain",
  "cut",
  "young",
  "talk",
  "soon",
  "list",
  "song",
  "being",
  "leave",
  "family",
  "body",
  "music",
  "color",
  "stand",
  "sun",
  "question",
  "fish",
  "area",
  "mark",
  "dog",
  "horse",
  "birds",
  "problem",
  "complete",
  "room",
  "knew",
  "since",
  "ever",
  "piece",
  "told",
  "usually",
  "didn’t",
  "friends",
  "easy",
  "heard",
  "order",
  "red",
  "door",
  "sure",
  "become",
  "top",
  "ship",
  "across",
  "today",
  "during",
  "short",
  "better",
  "best",
  "however",
  "low",
  "hours",
  "black",
  "products",
  "happened",
  "whole",
  "measure",
  "remember",
  "early",
  "waves",
  "reached",
  "listen",
  "wind",
  "rock",
  "space",
  "covered",
  "fast",
  "several",
  "hold",
  "himself",
  "toward",
  "five",
  "step",
  "morning",
  "passed",
  "vowel",
  "true",
  "hundred",
  "against",
  "pattern",
  "numeral",
  "table",
  "north",
  "slowly",
  "money",
  "map",
  "farm",
  "pulled",
  "draw",
  "voice",
  "seen",
  "cold",
  "cried",
  "plan",
  "notice",
  "south",
  "sing",
  "war",
  "ground",
  "fall",
  "king",
  "town",
  "I’ll",
  "unit",
  "figure",
  "certain",
  "field",
  "travel",
  "wood",
  "fire",
  "upon",
  "done",
  "English",
  "road",
  "half",
  "ten",
  "fly",
  "gave",
  "box",
  "finally",
  "wait",
  "correct",
  "oh",
  "quick",
  "person",
  "became",
  "shown",
  "minutes",
  "strong",
  "verb",
  "stars",
  "front",
  "feel",
  "fact",
  "inches",
  "street",
  "decided",
  "contain",
  "course",
  "surface",
  "produce",
  "building",
  "ocean",
  "class",
  "base",
  "week",
  "deep",
  "moon",
  "island",
  "foot",
  "system",
  "busy",
  "test",
  "record",
  "boat",
  "common",
  "gold",
  "possible",
  "plane",
  "age",
  "dry",
  "wonder",
  "laugh",
  "thousand",
  "ago",
  "ran",
  "check",
  "game",
  "shape",
  "yes",
  "hot",
  "missed",
  "brought",
  "heat",
  "snow",
  "tired",
  "bring",
  "yes",
  "yet",
  "central",
  "pair",
  "within",
  "hours",
  "busy",
  "clear",
  "green",
  "inside",
  "nothing",
  "course",
  "leave",
  "outside",
  "deep",
  "quite",
  "perhaps",
  "almost",
  "together",
  "answer",
  "simple",
  "reason",
  "already",
  "office",
  "market",
  "service",
  "system",
  "number",
  "public",
  "future",
  "power",
  "digital",
  "modern",
  "process",
  "project",
  "result",
  "quality",
  "different",
  "information",
  "computer",
  "internet",
  "language",
  "development",
  "technology",
  "security",
  "network",
  "database",
  "software",
  "application",
  "website",
  "browser",
  "keyboard",
  "performance",
  "accuracy",
  "practice",
  "typing",
  "challenge",
  "progress",
  "consistent",
  "improve",
  "learning",
  "professional",
  "experience",
  "communication",
  "important",
  "efficient",
  "creative",
  "technical",
  "advanced",
  "environment",
  "available",
  "solution",
  "development",
  "information",
  "connection",
  "response",
  "complete",
  "successful",
];

const COMMON_INDONESIAN = [
  "yang",
  "dan",
  "di",
  "dari",
  "ini",
  "itu",
  "untuk",
  "dengan",
  "tidak",
  "akan",
  "pada",
  "juga",
  "saya",
  "kamu",
  "dia",
  "kami",
  "kita",
  "mereka",
  "ada",
  "bisa",
  "lebih",
  "sudah",
  "atau",
  "karena",
  "seperti",
  "dalam",
  "oleh",
  "saat",
  "dapat",
  "menjadi",
  "sebagai",
  "tentang",
  "setelah",
  "sebelum",
  "ketika",
  "hanya",
  "sangat",
  "masih",
  "harus",
  "jika",
  "maka",
  "setiap",
  "semua",
  "orang",
  "waktu",
  "hari",
  "tahun",
  "rumah",
  "jalan",
  "kota",
  "negara",
  "dunia",
  "hidup",
  "kerja",
  "anak",
  "sekolah",
  "buku",
  "kata",
  "kalimat",
  "pertama",
  "kedua",
  "bagian",
  "tempat",
  "masalah",
  "jawaban",
  "pertanyaan",
  "hal",
  "cara",
  "nama",
  "baik",
  "besar",
  "kecil",
  "baru",
  "lama",
  "benar",
  "salah",
  "mudah",
  "sulit",
  "cepat",
  "lambat",
  "cukup",
  "banyak",
  "sedikit",
  "mungkin",
  "penting",
  "sekarang",
  "kemudian",
  "lagi",
  "selalu",
  "sering",
  "kadang",
  "tanpa",
  "dengan",
  "sampai",
  "antara",
  "dapat",
  "membuat",
  "melihat",
  "menulis",
  "membaca",
  "belajar",
  "menggunakan",
  "mengetahui",
  "memberikan",
  "mengambil",
  "datang",
  "pergi",
  "tinggal",
  "mencari",
  "menemukan",
  "berjalan",
  "berbicara",
  "mendengar",
  "melakukan",
  "membantu",
  "membawa",
  "membuka",
  "menutup",
  "mulai",
  "berakhir",
  "terjadi",
  "terlihat",
  "berbeda",
  "bersama",
  "sendiri",
  "diri",
  "kelompok",
  "keluarga",
  "teman",
  "masyarakat",
  "pemerintah",
  "sistem",
  "data",
  "informasi",
  "teknologi",
  "komputer",
  "internet",
  "jaringan",
  "perangkat",
  "aplikasi",
  "website",
  "peramban",
  "keyboard",
  "keamanan",
  "pengguna",
  "layanan",
  "proses",
  "hasil",
  "kualitas",
  "kecepatan",
  "akurasi",
  "latihan",
  "kemampuan",
  "pengalaman",
  "pekerjaan",
  "lingkungan",
  "perubahan",
  "perkembangan",
  "kondisi",
  "sumber",
  "informasi",
  "kebutuhan",
  "tujuan",
  "rencana",
  "contoh",
  "pilihan",
  "tingkat",
  "dasar",
  "lanjutan",
  "teknis",
  "modern",
  "efisien",
  "profesional",
  "komunikasi",
  "konsisten",
  "meningkatkan",
  "kemajuan",
  "tantangan",
  "solusi",
  "proyek",
  "hasil",
];

const ADVANCED_ENGLISH = [
  "although",
  "therefore",
  "however",
  "consequently",
  "significant",
  "particularly",
  "approximately",
  "responsibility",
  "implementation",
  "environmental",
  "organization",
  "communication",
  "relationship",
  "development",
  "opportunity",
  "performance",
  "experience",
  "requirement",
  "professional",
  "independent",
  "consideration",
  "additional",
  "available",
  "effective",
  "necessary",
  "successful",
  "appropriate",
  "individual",
  "application",
  "information",
  "understanding",
  "technology",
  "management",
  "analysis",
  "important",
  "different",
  "possible",
  "specific",
  "reasonable",
  "regularly",
  "carefully",
  "especially",
  "immediately",
  "frequently",
  "accurately",
  "efficiently",
];

const ADVANCED_INDONESIAN = [
  "meskipun",
  "sehingga",
  "sedangkan",
  "sementara",
  "berdasarkan",
  "terutama",
  "pengembangan",
  "implementasi",
  "pengalaman",
  "tanggungjawab",
  "kemampuan",
  "lingkungan",
  "organisasi",
  "komunikasi",
  "hubungan",
  "kesempatan",
  "kinerja",
  "persyaratan",
  "profesional",
  "pertimbangan",
  "tambahan",
  "tersedia",
  "efektif",
  "diperlukan",
  "berhasil",
  "sesuai",
  "individu",
  "penerapan",
  "informasi",
  "pemahaman",
  "teknologi",
  "manajemen",
  "analisis",
  "tertentu",
  "kemungkinan",
  "secara",
  "khusus",
  "penting",
  "berbeda",
  "secara",
  "berkala",
  "dengan",
  "akurat",
  "efisien",
];

const TECHNICAL_ENGLISH = [
  "algorithm",
  "database",
  "server",
  "request",
  "response",
  "endpoint",
  "frontend",
  "backend",
  "typescript",
  "javascript",
  "function",
  "variable",
  "interface",
  "component",
  "framework",
  "runtime",
  "browser",
  "network",
  "protocol",
  "security",
  "authentication",
  "authorization",
  "encryption",
  "session",
  "cookie",
  "storage",
  "cache",
  "query",
  "index",
  "schema",
  "table",
  "column",
  "transaction",
  "connection",
  "validation",
  "configuration",
  "deployment",
  "application",
  "software",
  "hardware",
  "performance",
  "latency",
  "bandwidth",
  "resource",
  "repository",
  "version",
  "commit",
  "branch",
];

const TECHNICAL_INDONESIAN = [
  "algoritma",
  "database",
  "server",
  "permintaan",
  "respons",
  "endpoint",
  "frontend",
  "backend",
  "typescript",
  "javascript",
  "fungsi",
  "variabel",
  "antarmuka",
  "komponen",
  "framework",
  "runtime",
  "peramban",
  "jaringan",
  "protokol",
  "keamanan",
  "autentikasi",
  "otorisasi",
  "enkripsi",
  "sesi",
  "cookie",
  "penyimpanan",
  "cache",
  "kueri",
  "indeks",
  "skema",
  "tabel",
  "kolom",
  "transaksi",
  "koneksi",
  "validasi",
  "konfigurasi",
  "deployment",
  "aplikasi",
  "perangkat",
  "kinerja",
  "latensi",
  "bandwidth",
  "sumber",
  "repositori",
  "versi",
  "commit",
  "cabang",
];

const PUNCTUATION_ENGLISH = [
  "Hello, world!",
  "How are you today?",
  "Practice makes progress.",
  "Accuracy matters more than speed.",
  "Can you type this correctly?",
  "The quick, brown fox jumps over the lazy dog.",
  "Good typing requires focus, rhythm, and control.",
  "What happens when speed increases?",
  "Keep your hands relaxed; avoid unnecessary tension.",
  "Read carefully: then type exactly what you see.",
  "Version 2.0 is ready; the test begins now.",
  "Time, accuracy, and consistency all matter.",
];

const PUNCTUATION_INDONESIAN = [
  "Halo, apa kabar?",
  "Latihan membuat kemampuan meningkat.",
  "Akurasi lebih penting daripada kecepatan.",
  "Bisakah kamu mengetik kalimat ini dengan benar?",
  "Fokus, tenang, dan jaga ritme.",
  "Kecepatan bukan satu-satunya ukuran kemampuan.",
  "Baca dengan teliti: lalu ketik persis seperti teks.",
  "Versi 2.0 sudah siap; tes dimulai sekarang.",
  "Waktu, akurasi, dan konsistensi sangat penting.",
  "Apakah kamu dapat mempertahankan ritme yang stabil?",
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function round(value: number, decimals = 2): number {
  const multiplier = 10 ** decimals;

  return Math.round(value * multiplier) / multiplier;
}

function randomIndex(max: number): number {
  if (max <= 0) {
    return 0;
  }

  return Math.floor(Math.random() * max);
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const random = randomIndex(index + 1);

    [result[index], result[random]] = [result[random], result[index]];
  }

  return result;
}

function buildPunctuationWordPool(language: TypingLanguage): string[] {
  const source =
    language === "english" ? PUNCTUATION_ENGLISH : PUNCTUATION_INDONESIAN;

  return source.flatMap((sentence) =>
    sentence
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean),
  );
}

function selectWordPool(
  language: TypingLanguage,
  difficulty: TypingDifficulty,
): string[] {
  switch (difficulty) {
    case "advanced":
      return language === "english" ? ADVANCED_ENGLISH : ADVANCED_INDONESIAN;

    case "technical":
      return language === "english" ? TECHNICAL_ENGLISH : TECHNICAL_INDONESIAN;

    case "punctuation":
      return buildPunctuationWordPool(language);

    case "common":
    default:
      return language === "english" ? COMMON_ENGLISH : COMMON_INDONESIAN;
  }
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeTextForComparison(value: string): string {
  return value.normalize("NFC");
}

export function sanitizeCustomText(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n+/g, " ")
    .trim();
}

export function getTimeTestTargetWords(duration: TypingDuration): number {
  return TIME_TARGET_WORDS[duration];
}

export function getTargetWords(settings: TypingSettings): number {
  if (settings.mode === "time") {
    return getTimeTestTargetWords(settings.duration);
  }

  if (settings.mode === "words") {
    return settings.wordCount;
  }

  return countWords(settings.customText);
}

export function countWords(value: string): number {
  const normalized = normalizeWhitespace(value);

  if (!normalized) {
    return 0;
  }

  return normalized.split(" ").length;
}

export function countCharacters(value: string): number {
  return Array.from(value).length;
}

export function buildTypingText(
  language: TypingLanguage,
  difficulty: TypingDifficulty,
  mode: TypingMode,
  duration: TypingDuration,
  wordCount: TypingWordCount,
  customText = "",
): string {
  if (mode === "custom") {
    return sanitizeCustomText(customText);
  }

  const targetWords =
    mode === "time" ? getTimeTestTargetWords(duration) : wordCount;

  if (targetWords <= 0) {
    return "";
  }

  const pool = selectWordPool(language, difficulty);

  if (!pool.length) {
    return "";
  }

  const words: string[] = [];

  let shuffledPool = shuffle(pool);

  let poolIndex = 0;

  while (words.length < targetWords) {
    if (poolIndex >= shuffledPool.length) {
      shuffledPool = shuffle(pool);

      poolIndex = 0;
    }

    words.push(shuffledPool[poolIndex]);

    poolIndex += 1;
  }

  return words.join(" ");
}

export function calculateCharacterAccuracy(
  typedText: string,
  targetText: string,
): {
  typedCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
} {
  const typed = normalizeTextForComparison(typedText);

  const target = normalizeTextForComparison(targetText);

  let correctCharacters = 0;

  for (let index = 0; index < typed.length; index += 1) {
    if (index < target.length && typed[index] === target[index]) {
      correctCharacters += 1;
    }
  }

  const typedCharacters = typed.length;

  const incorrectCharacters = Math.max(typedCharacters - correctCharacters, 0);

  return {
    typedCharacters,
    correctCharacters,
    incorrectCharacters,
  };
}

export function calculateWpm(
  characters: number,
  elapsedSeconds: number,
): number {
  if (characters <= 0 || elapsedSeconds <= 0) {
    return 0;
  }

  const minutes = elapsedSeconds / 60;

  if (minutes <= 0) {
    return 0;
  }

  return round(characters / 5 / minutes);
}

export function calculateAccuracy(
  correctCharacters: number,
  typedCharacters: number,
): number {
  if (typedCharacters <= 0) {
    return 0;
  }

  return round(clamp((correctCharacters / typedCharacters) * 100, 0, 100));
}

export function calculateCompletion(
  typedCharacters: number,
  targetCharacters: number,
): number {
  if (targetCharacters <= 0) {
    return 0;
  }

  return round(clamp((typedCharacters / targetCharacters) * 100, 0, 100));
}

export function buildSegments(
  typedText: string,
  targetText: string,
  keystrokes: TypingKeystroke[],
  startTime: number,
): TypingSegment[] {
  if (!typedText.length || !keystrokes.length || startTime <= 0) {
    return [];
  }

  const SEGMENT_SECONDS = 5;

  interface SegmentData {
    startTime: number;
    endTime: number;
    characters: number;
    correctCharacters: number;
  }

  const segments = new Map<number, SegmentData>();

  let characterIndex = 0;

  for (const keystroke of keystrokes) {
    if (keystroke.action !== "insert") {
      continue;
    }

    if (!Number.isFinite(keystroke.timestamp)) {
      continue;
    }

    if (keystroke.timestamp < startTime) {
      continue;
    }

    const elapsedSeconds = Math.max(keystroke.timestamp - startTime, 0) / 1000;

    const bucket =
      Math.floor(elapsedSeconds / SEGMENT_SECONDS) * SEGMENT_SECONDS;

    const current = segments.get(bucket) ?? {
      startTime: bucket,
      endTime: bucket + SEGMENT_SECONDS,
      characters: 0,
      correctCharacters: 0,
    };

    current.characters += 1;

    const typedCharacter = typedText[characterIndex];

    const targetCharacter = targetText[characterIndex];

    if (
      typedCharacter !== undefined &&
      targetCharacter !== undefined &&
      typedCharacter === targetCharacter
    ) {
      current.correctCharacters += 1;
    }

    segments.set(bucket, current);

    characterIndex += 1;
  }

  return Array.from(segments.values())
    .sort((a, b) => a.startTime - b.startTime)
    .map((segment) => {
      const duration = Math.max(segment.endTime - segment.startTime, 1);

      const wpm = calculateWpm(segment.correctCharacters, duration);

      return {
        startTime: segment.startTime,

        endTime: segment.endTime,

        characters: segment.characters,

        correctCharacters: segment.correctCharacters,

        wpm,
      };
    });
}

export function calculateConsistency(segments: TypingSegment[]): number {
  const validSegments = segments.filter(
    (segment) => segment.wpm > 0 && Number.isFinite(segment.wpm),
  );

  if (validSegments.length === 0) {
    return 0;
  }

  if (validSegments.length === 1) {
    return 100;
  }

  const values = validSegments.map((segment) => segment.wpm);

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

  if (mean <= 0 || !Number.isFinite(mean)) {
    return 0;
  }

  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;

  const standardDeviation = Math.sqrt(variance);

  const coefficientOfVariation = standardDeviation / mean;

  const consistency = 100 - coefficientOfVariation * 100;

  return round(clamp(consistency, 0, 100));
}

export function calculateScore(
  correctWpm: number,
  accuracy: number,
  consistency: number,
): number {
  if (correctWpm <= 0 || accuracy <= 0 || consistency <= 0) {
    return 0;
  }

  const accuracyFactor = clamp(accuracy, 0, 100) / 100;

  const consistencyFactor = clamp(consistency, 0, 100) / 100;

  const score =
    correctWpm * accuracyFactor ** 1.5 * consistencyFactor ** 0.5 * 10;

  return round(Math.max(score, 0));
}

export function calculateTypingMetrics(
  typedText: string,
  targetText: string,
  elapsedSeconds: number,
  segments: TypingSegment[] = [],
): TypingMetrics {
  const safeElapsedSeconds = Math.max(elapsedSeconds, 0);

  const characterStats = calculateCharacterAccuracy(typedText, targetText);

  const rawWpm = calculateWpm(
    characterStats.typedCharacters,
    safeElapsedSeconds,
  );

  const correctWpm = calculateWpm(
    characterStats.correctCharacters,
    safeElapsedSeconds,
  );

  const accuracy = calculateAccuracy(
    characterStats.correctCharacters,
    characterStats.typedCharacters,
  );

  const completion = calculateCompletion(
    characterStats.typedCharacters,
    targetText.length,
  );

  const consistency = calculateConsistency(segments);

  const score = calculateScore(correctWpm, accuracy, consistency);

  return {
    typedCharacters: characterStats.typedCharacters,

    correctCharacters: characterStats.correctCharacters,

    incorrectCharacters: characterStats.incorrectCharacters,

    rawWpm,

    correctWpm,

    accuracy,

    consistency,

    completion,

    score,

    elapsedSeconds: round(safeElapsedSeconds),
  };
}

export function getTestCompletionStatus(
  mode: TypingMode,
  typedText: string,
  targetText: string,
  remainingSeconds: number,
): boolean {
  if (mode === "time") {
    return remainingSeconds <= 0;
  }

  const typed = normalizeTextForComparison(typedText);

  const target = normalizeTextForComparison(targetText);

  return typed.length === target.length && typed === target;
}

export function getProgressLabel(
  mode: TypingMode,
  typedText: string,
  targetText: string,
): string {
  if (mode === "custom") {
    const typedCharacters = Math.min(
      countCharacters(typedText),
      countCharacters(targetText),
    );

    return `${typedCharacters}/${countCharacters(targetText)} characters`;
  }

  const typedWords = countWords(typedText);

  const targetWords = countWords(targetText);

  const safeTypedWords = Math.min(typedWords, targetWords);

  return `${safeTypedWords}/${targetWords} words`;
}

export function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(Math.floor(seconds), 0);

  const minutes = Math.floor(safeSeconds / 60);

  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function isTimeDuration(value: number): value is TypingDuration {
  return DURATION_SET.has(value);
}

export function isWordCount(value: number): value is TypingWordCount {
  return WORD_COUNT_SET.has(value);
}

export function getModeDescription(mode: TypingMode): string {
  switch (mode) {
    case "time":
      return "Type as much as possible before the timer ends.";

    case "words":
      return "Complete the selected number of words as accurately as possible.";

    case "custom":
      return "Practice with your own text. Custom tests are not ranked globally.";
  }
}

export function createDefaultTypingSettings(): TypingSettings {
  return {
    language: "english",
    mode: "time",
    difficulty: "common",
    duration: 60,
    wordCount: 50,
    customText: "",
  };
}
