import type { ToolLanguage } from "./psychologyI18n";

export type ProcrastinationPattern =
  | "taskAvoidance"
  | "deadlineDependence"
  | "distraction"
  | "taskDiscomfort"
  | "lowTaskClarity";

export interface ProcrastinationQuestion {
  id: number;
  text: {
    en: string;
    id: string;
  };
  pattern: ProcrastinationPattern;
}

export type ProcrastinationLevel =
  | "Low Tendency"
  | "Moderate Tendency"
  | "High Tendency"
  | "Very High Tendency"
  | "Kecenderungan Rendah"
  | "Kecenderungan Sedang"
  | "Kecenderungan Tinggi"
  | "Kecenderungan Sangat Tinggi";

export interface PatternScore {
  key: ProcrastinationPattern;
  label: string;
  percentage: number;
  description: string;
  actionTip: string;
}

export interface ProcrastinationResult {
  overallScore: number; // 0–100
  level: ProcrastinationLevel;
  levelSummary: string;
  strongestPattern: PatternScore;
  patterns: Record<ProcrastinationPattern, PatternScore>;
  strategies: string[];
}

export const PROCRASTINATION_QUESTIONS: ProcrastinationQuestion[] = [
  // 1-4: Task Avoidance
  {
    id: 1,
    text: {
      en: "I delay starting tasks even when I recognize their importance and deadlines.",
      id: "Saya menunda memulai tugas meskipun saya menyadari betapa pentingnya tugas tersebut dan batas waktunya.",
    },
    pattern: "taskAvoidance",
  },
  {
    id: 2,
    text: {
      en: "I put off unpleasant or tedious obligations in favor of doing nothing in particular.",
      id: "Saya menunda kewajiban yang membosankan atau melelahkan dan memilih menghabiskan waktu tanpa tujuan yang jelas.",
    },
    pattern: "taskAvoidance",
  },
  {
    id: 3,
    text: {
      en: "I tell myself 'I will feel more motivated tomorrow' and postpone the work.",
      id: "Saya sering meyakinkan diri sendiri bahwa 'besok saya akan lebih bersemangat/termotivasi' lalu menunda pekerjaan tersebut.",
    },
    pattern: "taskAvoidance",
  },
  {
    id: 4,
    text: {
      en: "I find excuses to delay initiating projects that require sustained focus.",
      id: "Saya sering mencari alasan untuk menunda memulai proyek yang menuntut fokus dan konsentrasi panjang.",
    },
    pattern: "taskAvoidance",
  },

  // 5-8: Deadline Dependence
  {
    id: 5,
    text: {
      en: "I rely on the urgency of impending deadlines to generate enough adrenaline to begin.",
      id: "Saya mengandalkan desakan batas waktu yang mepet agar memicu adrenalin untuk mulai bekerja.",
    },
    pattern: "deadlineDependence",
  },
  {
    id: 6,
    text: {
      en: "I work on important assignments during the final hours before they are due.",
      id: "Saya biasanya baru mengerjakan tugas-tugas penting di jam-jam terakhir menjelang batas pengumpulan.",
    },
    pattern: "deadlineDependence",
  },
  {
    id: 7,
    text: {
      en: "I underestimate the amount of time required to finish complex tasks.",
      id: "Saya kerap meremehkan perkiraan waktu yang sebenarnya dibutuhkan untuk menyelesaikan tugas yang kompleks.",
    },
    pattern: "deadlineDependence",
  },
  {
    id: 8,
    text: {
      en: "I feel that I only produce my best work when forced by extreme time pressure.",
      id: "Saya merasa hanya bisa menghasilkan karya terbaik ketika terdesak oleh tekanan waktu yang sangat sempit.",
    },
    pattern: "deadlineDependence",
  },

  // 9-12: Distraction
  {
    id: 9,
    text: {
      en: "I easily get sidetracked by social media, browsing, or messages while trying to work.",
      id: "Perhatian saya mudah teralihkan oleh media sosial, browsing internet, atau notifikasi pesan saat mencoba bekerja.",
    },
    pattern: "distraction",
  },
  {
    id: 10,
    text: {
      en: "I switch between multiple minor tasks rather than sticking to the primary priority.",
      id: "Saya berpindah-pindah mengerjakan banyak tugas kecil daripada menuntaskan satu prioritas utama.",
    },
    pattern: "distraction",
  },
  {
    id: 11,
    text: {
      en: "I suddenly find household chores or small errands appealing when an important task looms.",
      id: "Saya tiba-tiba merasa ingin membereskan rumah atau melakukan hal sepele lainnya ketika ada tugas penting menanti.",
    },
    pattern: "distraction",
  },
  {
    id: 12,
    text: {
      en: "I struggle to maintain attention on a single task for more than 15–20 minutes.",
      id: "Saya merasa kesulitan menjaga fokus pada satu tugas tunggal selama lebih dari 15–20 menit.",
    },
    pattern: "distraction",
  },

  // 13-16: Task Discomfort & Perfectionism
  {
    id: 13,
    text: {
      en: "I hesitate to start because I worry the outcome will not meet my high standards.",
      id: "Saya ragu untuk memulai karena khawatir hasil akhirnya tidak sesuai dengan standar kesempurnaan saya.",
    },
    pattern: "taskDiscomfort",
  },
  {
    id: 14,
    text: {
      en: "I spend excessive time researching or planning to avoid making actual progress.",
      id: "Saya menghabiskan waktu terlalu lama untuk riset atau menyusun rencana demi menghindari pengerjaan nyata.",
    },
    pattern: "taskDiscomfort",
  },
  {
    id: 15,
    text: {
      en: "The thought of receiving criticism on my work makes me reluctant to begin or submit.",
      id: "Bayangan akan menerima kritik atau evaluasi membuat saya enggan memulai atau menyerahkan hasil pekerjaan.",
    },
    pattern: "taskDiscomfort",
  },
  {
    id: 16,
    text: {
      en: "I feel paralyzed when a task seems ambiguous or when I might make an error.",
      id: "Saya merasa macet ketika instruksi tugas terasa ambigu atau ketika ada kemungkinan saya berbuat kesalahan.",
    },
    pattern: "taskDiscomfort",
  },

  // 17-20: Low Task Clarity
  {
    id: 17,
    text: {
      en: "I delay tasks because I am unsure where to begin or what the first concrete step is.",
      id: "Saya menunda tugas karena bingung harus mulai dari mana atau apa langkah nyata pertama yang harus dilakukan.",
    },
    pattern: "lowTaskClarity",
  },
  {
    id: 18,
    text: {
      en: "Large, vaguely defined projects overwhelm me until I break them down.",
      id: "Proyek besar yang gambarannya masih samar membuat saya kewalahan sampai saya memecahnya menjadi bagian kecil.",
    },
    pattern: "lowTaskClarity",
  },
  {
    id: 19,
    text: {
      en: "I wait around for clearer instructions or external direction instead of initiating.",
      id: "Saya cenderung menunggu arahan yang lebih jelas dari orang lain daripada berinisiatif memulai sendiri.",
    },
    pattern: "lowTaskClarity",
  },
  {
    id: 20,
    text: {
      en: "I feel stuck when a task lacks a structured, step-by-step roadmap.",
      id: "Saya merasa terjebak ketika suatu pekerjaan tidak memiliki panduan atau langkah bertahap yang runtut.",
    },
    pattern: "lowTaskClarity",
  },
];

export const PROCRASTINATION_SCALE_OPTIONS_I18N = {
  en: [
    { value: 1, label: "Never / Rarely" },
    { value: 2, label: "Occasionally" },
    { value: 3, label: "Sometimes" },
    { value: 4, label: "Frequently" },
    { value: 5, label: "Almost Always" },
  ],
  id: [
    { value: 1, label: "Jarang / Tidak Pernah" },
    { value: 2, label: "Sesekali" },
    { value: 3, label: "Kadang-kadang" },
    { value: 4, label: "Sering" },
    { value: 5, label: "Sangat Sering / Selalu" },
  ],
};

export const PATTERN_INFO_I18N: Record<
  ToolLanguage,
  Record<
    ProcrastinationPattern,
    { label: string; description: string; actionTip: string }
  >
> = {
  en: {
    taskAvoidance: {
      label: "Task Avoidance & Friction",
      description:
        "A tendency to postpone duties due to perceived boredom, emotional resistance, or waiting for elusive inspiration.",
      actionTip:
        "Apply the 2-Minute Starter Rule: Commit to working on the task for just two minutes. Lowering the initial barrier creates momentum without relying on motivation.",
    },
    deadlineDependence: {
      label: "Deadline Dependence & Adrenaline",
      description:
        "Relying on eleventh-hour panic and high-pressure urgency to generate engagement.",
      actionTip:
        "Set artificial intermediate milestones with accountability (e.g., sharing a draft with a peer 48 hours early) to smooth out workflow momentum.",
    },
    distraction: {
      label: "Environmental Distraction & Task Switching",
      description:
        "Vulnerability to digital notifications, browsing, and productive procrastination (doing easier chores instead of core priorities).",
      actionTip:
        "Create friction for distractions: keep phones away, use website blockers, and establish 25-minute Pomodoro focus blocks.",
    },
    taskDiscomfort: {
      label: "Perfectionism & Fear of Evaluation",
      description:
        "Hesitation rooted in fear of mistakes, self-judgment, or unrealistic standards of flawless execution.",
      actionTip:
        "Adopt a 'Rough Draft First' mindset: give yourself explicit permission to produce an imperfect preliminary version before polishing.",
    },
    lowTaskClarity: {
      label: "Low Task Clarity & Overwhelm",
      description:
        "Stalling because the project scope is vague, complex, or lacking an obvious immediate first action.",
      actionTip:
        "Deconstruct ambiguous projects into micro-actions: write down the single physical next step (e.g., 'Open blank document and write title') to eliminate ambiguity.",
    },
  },
  id: {
    taskAvoidance: {
      label: "Penghindaran Tugas & Friksi Emosi",
      description:
        "Kecenderungan menunda akibat rasa bosan, resistensi emosi, atau menunggu munculnya 'mood/motivasi'.",
      actionTip:
        "Gunakan 'Aturan 2 Menit': Berkomitmenlah mengerjakan tugas hanya selama dua menit. Menurunkan batas awal mempermudah terciptanya momentum kerja tanpa harus menunggu motivasi.",
    },
    deadlineDependence: {
      label: "Ketergantungan Batas Waktu (SKS)",
      description:
        "Mengandalkan kepanikan detik-detik terakhir dan tekanan mepet untuk memicu dorongan kerja.",
      actionTip:
        "Buat batas waktu bertahap (mini-milestone) dan bagikan draf awal kepada rekan 48 jam lebih awal agar beban kerja terdistribusi dengan tenang.",
    },
    distraction: {
      label: "Distraksi Lingkungan & Pergantian Tugas",
      description:
        "Kerentanan terhadap notifikasi gawai, browsing internet, dan penundaan terselubung (mengerjakan hal sepele dibanding prioritas inti).",
      actionTip:
        "Tingkatkan hambatan distraksi: jauhkan smartphone, gunakan pemblokir situs, dan terapkan teknik Pomodoro fokus 25 menit.",
    },
    taskDiscomfort: {
      label: "Perfeksionisme & Takut Gagal",
      description:
        "Keraguan yang bersumber dari kekhawatiran berbuat salah, kritik orang lain, atau standar kesempurnaan yang terlalu kaku.",
      actionTip:
        "Terapkan prinsip 'Draf Kasar Lebih Dulu': beri izin pada diri sendiri untuk membuat versi awal yang belum sempurna sebelum kemudian disempurnakan.",
    },
    lowTaskClarity: {
      label: "Ketidakjelasan Tugas & Overwhelm",
      description:
        "Menunda karena cakupan pekerjaan terlalu luas, rumit, atau belum jelas langkah konkrit pertamanya.",
      actionTip:
        "Uraikan proyek rumit menjadi tindakan mikro: tuliskan 1 langkah fisik pertama yang paling mudah (misal: 'Buka dokumen dan ketik judul') untuk menghilangkan keraguan.",
    },
  },
};

export function calculateProcrastinationScore(
  answers: Record<number, number>,
  lang: ToolLanguage = "en",
): ProcrastinationResult {
  let totalSum = 0;
  const patternSums: Record<ProcrastinationPattern, number> = {
    taskAvoidance: 0,
    deadlineDependence: 0,
    distraction: 0,
    taskDiscomfort: 0,
    lowTaskClarity: 0,
  };
  const patternCounts: Record<ProcrastinationPattern, number> = {
    taskAvoidance: 0,
    deadlineDependence: 0,
    distraction: 0,
    taskDiscomfort: 0,
    lowTaskClarity: 0,
  };

  PROCRASTINATION_QUESTIONS.forEach((q) => {
    const val = answers[q.id] ?? 3;
    totalSum += val;
    patternSums[q.pattern] += val;
    patternCounts[q.pattern] += 1;
  });

  const minTotal = PROCRASTINATION_QUESTIONS.length * 1; // 20
  const maxTotal = PROCRASTINATION_QUESTIONS.length * 5; // 100

  const overallScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(((totalSum - minTotal) / (maxTotal - minTotal)) * 100),
    ),
  );

  let levelEn: ProcrastinationLevel = "Low Tendency";
  let levelId: ProcrastinationLevel = "Kecenderungan Rendah";
  let summaryEn = "";
  let summaryId = "";

  if (overallScore <= 30) {
    levelEn = "Low Tendency";
    levelId = "Kecenderungan Rendah";
    summaryEn =
      "Your responses suggest a proactive execution habit. You generally initiate obligations without severe delays and maintain manageable momentum.";
    summaryId =
      "Respons Anda menunjukkan kebiasaan eksekusi yang proaktif. Anda terbiasa memulai pekerjaan tanpa penundaan berlebih dan menjaga alur kerja dengan konsisten.";
  } else if (overallScore <= 60) {
    levelEn = "Moderate Tendency";
    levelId = "Kecenderungan Sedang";
    summaryEn =
      "Your responses suggest occasional procrastination. You tend to delay certain types of tasks (such as ambiguous or tedious ones) while executing routine responsibilities effectively.";
    summaryId =
      "Respons Anda menunjukkan prokrastinasi situasional. Anda cenderung menunda jenis tugas tertentu (seperti tugas yang membosankan atau kurang jelas) sembari menyelesaikan tugas rutin dengan baik.";
  } else if (overallScore <= 80) {
    levelEn = "High Tendency";
    levelId = "Kecenderungan Tinggi";
    summaryEn =
      "Your responses indicate a frequent pattern of task postponement. Behavioral friction, perfectionism, or distraction may regularly hinder timely execution.";
    summaryId =
      "Respons Anda menunjukkan pola penundaan tugas yang sering terjadi. Hambatan emosional, perfeksionisme, atau distraksi lingkungan kerap memperlambat penyelesaian tugas tepat waktu.";
  } else {
    levelEn = "Very High Tendency";
    levelId = "Kecenderungan Sangat Tinggi";
    summaryEn =
      "Your responses reflect a pronounced delay pattern across multiple areas. Structured behavioral friction reduction and micro-commitments can provide immediate relief.";
    summaryId =
      "Respons Anda mencerminkan pola penundaan yang intens di berbagai bidang. Penyederhanaan langkah awal dan komitmen mikro dapat membantu mengembalikan kendali waktu Anda.";
  }

  const patterns = {} as Record<ProcrastinationPattern, PatternScore>;
  const infoMap = PATTERN_INFO_I18N[lang];

  (Object.keys(patternSums) as ProcrastinationPattern[]).forEach((key) => {
    const count = patternCounts[key] || 4;
    const minPattern = count * 1;
    const maxPattern = count * 5;
    const sum = patternSums[key];
    const percentage = Math.round(
      ((sum - minPattern) / (maxPattern - minPattern)) * 100,
    );

    patterns[key] = {
      key,
      label: infoMap[key].label,
      percentage,
      description: infoMap[key].description,
      actionTip: infoMap[key].actionTip,
    };
  });

  const sortedPatterns = Object.values(patterns).sort(
    (a, b) => b.percentage - a.percentage,
  );
  const strongestPattern = sortedPatterns[0];

  const strategiesEn: string[] = [
    strongestPattern.actionTip,
    "Timebox high-friction tasks into 20-minute non-negotiable focus windows.",
    "Eliminate initial resistance by defining the single easiest physical next step before ending your workday.",
    "Decouple self-worth from productivity—procrastination is an emotional regulation challenge, not a character flaw.",
  ];

  const strategiesId: string[] = [
    strongestPattern.actionTip,
    "Batasi sesi tugas yang berat dalam blok fokus 20 menit tanpa kompromi.",
    "Hilangkan hambatan awal dengan menuliskan satu langkah fisik termudah untuk esok hari sebelum mengakhiri kerja hari ini.",
    "Pisahkan harga diri dari produktivitas—prokrastinasi adalah tantangan regulasi emosi, bukan cerminan kegagalan karakter.",
  ];

  return {
    overallScore,
    level: lang === "id" ? levelId : levelEn,
    levelSummary: lang === "id" ? summaryId : summaryEn,
    strongestPattern,
    patterns,
    strategies: lang === "id" ? strategiesId : strategiesEn,
  };
}
