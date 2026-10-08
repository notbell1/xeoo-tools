import type { ToolLanguage } from "./psychologyI18n";

export type StressSubscale =
  | "mentalLoad"
  | "emotionalPressure"
  | "recoveryDifficulty";

export interface StressQuestion {
  id: number;
  text: {
    en: string;
    id: string;
  };
  subscale: StressSubscale;
}

export type StressLevelCategory =
  | "Low Stress"
  | "Mild Stress"
  | "Moderate Stress"
  | "High Stress"
  | "Very High Stress"
  | "Stres Rendah"
  | "Stres Ringan"
  | "Stres Sedang"
  | "Stres Tinggi"
  | "Stres Sangat Tinggi";

export interface StressSubscaleScore {
  key: StressSubscale;
  label: string;
  percentage: number;
  description: string;
}

export interface StressResult {
  overallScore: number; // 0–100
  category: StressLevelCategory;
  categorySummary: string;
  subscales: Record<StressSubscale, StressSubscaleScore>;
  suggestions: string[];
}

export const STRESS_QUESTIONS: StressQuestion[] = [
  // Mental Load (1-5)
  {
    id: 1,
    text: {
      en: "I feel overwhelmed by the volume of tasks and responsibilities I need to handle.",
      id: "Saya merasa kewalahan dengan banyaknya tumpukan tugas dan tanggung jawab yang harus diselesaikan.",
    },
    subscale: "mentalLoad",
  },
  {
    id: 2,
    text: {
      en: "I find it difficult to concentrate or remember details when working under pressure.",
      id: "Saya merasa sulit berkonsentrasi atau mengingat detail saat bekerja di bawah tekanan.",
    },
    subscale: "mentalLoad",
  },
  {
    id: 3,
    text: {
      en: "My mind feels continuously occupied with impending deadlines or problems.",
      id: "Pikiran saya terus-menerus dipenuhi kekhawatiran tentang tenggat waktu atau masalah yang belum tuntas.",
    },
    subscale: "mentalLoad",
  },
  {
    id: 4,
    text: {
      en: "I feel like I have too many competing demands and too little time to resolve them.",
      id: "Saya merasa memiliki terlalu banyak tuntutan yang saling berebut dan terlalu sedikit waktu untuk mengatasinya.",
    },
    subscale: "mentalLoad",
  },
  {
    id: 5,
    text: {
      en: "Simple daily decisions feel exhausting or take more mental effort than usual.",
      id: "Keputusan harian yang sederhana terasa melelahkan atau membutuhkan usaha mental lebih berat dari biasanya.",
    },
    subscale: "mentalLoad",
  },

  // Emotional Pressure (6-10)
  {
    id: 6,
    text: {
      en: "I notice myself feeling impatient, irritable, or easily annoyed by small disruptions.",
      id: "Saya mendapati diri saya merasa tidak sabar, mudah tersinggung, atau kesal oleh gangguan-gangguan kecil.",
    },
    subscale: "emotionalPressure",
  },
  {
    id: 7,
    text: {
      en: "I experience physical tension, such as a tight jaw, neck stiffness, or clenched shoulders.",
      id: "Saya merasakan ketegangan fisik, seperti rahang kaku, leher tegang, atau pundak yang pegal dan tertekan.",
    },
    subscale: "emotionalPressure",
  },
  {
    id: 8,
    text: {
      en: "I feel a lingering sense of apprehension or worry that things might go wrong.",
      id: "Saya merasakan kekhawatiran yang mengganjal atau rasa cemas berlebih bahwa sesuatu yang buruk akan terjadi.",
    },
    subscale: "emotionalPressure",
  },
  {
    id: 9,
    text: {
      en: "I feel emotionally drained or stretched thin by interpersonal interactions.",
      id: "Saya merasa lelah secara emosional dan terkuras energinya oleh interaksi dengan orang lain.",
    },
    subscale: "emotionalPressure",
  },
  {
    id: 10,
    text: {
      en: "I find myself sighing frequently or feeling like I cannot take a deep breath.",
      id: "Saya sering menghela napas panjang atau merasa napas saya pendek dan tidak lega.",
    },
    subscale: "emotionalPressure",
  },

  // Recovery Difficulty (11-15)
  {
    id: 11,
    text: {
      en: "I have difficulty switching off from work or study during my supposed downtime.",
      id: "Saya sulit melepaskan pikiran dari pekerjaan atau pelajaran di saat waktu istirahat.",
    },
    subscale: "recoveryDifficulty",
  },
  {
    id: 12,
    text: {
      en: "I experience restless sleep or wake up in the morning feeling unrefreshed.",
      id: "Tidur saya terasa tidak nyenyak atau saya bangun di pagi hari dalam kondisi tubuh yang masih lelah.",
    },
    subscale: "recoveryDifficulty",
  },
  {
    id: 13,
    text: {
      en: "I find it hard to truly relax even when doing leisure activities I normally enjoy.",
      id: "Saya sulit merasa rileks sepenuhnya bahkan saat melakukan kegiatan santai atau hobi yang biasa saya sukai.",
    },
    subscale: "recoveryDifficulty",
  },
  {
    id: 14,
    text: {
      en: "I skip restorative habits like regular meals, hydration, or gentle physical movement.",
      id: "Saya mengabaikan kebiasaan pemulihan diri seperti makan teratur, minum air cukup, atau bergerak fisik ringan.",
    },
    subscale: "recoveryDifficulty",
  },
  {
    id: 15,
    text: {
      en: "Even on weekends or days off, I feel a constant urge to check messages or stay vigilant.",
      id: "Bahkan di akhir pekan atau hari libur, saya merasa dorongan konstan untuk selalu memeriksa pesan pekerjaan.",
    },
    subscale: "recoveryDifficulty",
  },
];

export const STRESS_SCALE_OPTIONS_I18N = {
  en: [
    { value: 0, label: "Never / Rarely" },
    { value: 1, label: "Occasionally" },
    { value: 2, label: "Sometimes" },
    { value: 3, label: "Often" },
    { value: 4, label: "Very Often" },
  ],
  id: [
    { value: 0, label: "Hampir Tidak Pernah" },
    { value: 1, label: "Jarang" },
    { value: 2, label: "Kadang-kadang" },
    { value: 3, label: "Sering" },
    { value: 4, label: "Sangat Sering" },
  ],
};

export const SUBSCALE_INFO_I18N: Record<
  ToolLanguage,
  Record<StressSubscale, { label: string; description: string }>
> = {
  en: {
    mentalLoad: {
      label: "Cognitive & Mental Load",
      description:
        "Measures cognitive fatigue, decision strain, and feelings of being overwhelmed by volume of obligations.",
    },
    emotionalPressure: {
      label: "Emotional Strain & Tension",
      description:
        "Measures internal tension, irritability, worry, and somatic stress sensations.",
    },
    recoveryDifficulty: {
      label: "Recovery & Disengagement Difficulty",
      description:
        "Measures difficulty switching off from demands, sleep disruptions, and challenges relaxing.",
    },
  },
  id: {
    mentalLoad: {
      label: "Beban Kognitif & Mental",
      description:
        "Mengukur kelelahan pikiran, beban pengambilan keputusan, dan rasa kewalahan terhadap tumpukan kewajiban.",
    },
    emotionalPressure: {
      label: "Ketegangan Emosional & Fisik",
      description:
        "Mengukur ketegangan internal, sensitivitas rasa kesal, kekhawatiran, serta sensasi fisik stres.",
    },
    recoveryDifficulty: {
      label: "Hambatan Relaksasi & Pemulihan",
      description:
        "Mengukur kesulitan melepaskan pikiran dari pekerjaan, gangguan tidur, dan tantangan untuk beristirahat.",
    },
  },
};

export function calculateStressScore(
  answers: Record<number, number>,
  lang: ToolLanguage = "en",
): StressResult {
  let totalRaw = 0;
  const subscaleSums: Record<StressSubscale, number> = {
    mentalLoad: 0,
    emotionalPressure: 0,
    recoveryDifficulty: 0,
  };
  const subscaleCounts: Record<StressSubscale, number> = {
    mentalLoad: 0,
    emotionalPressure: 0,
    recoveryDifficulty: 0,
  };

  STRESS_QUESTIONS.forEach((q) => {
    const val = answers[q.id] ?? 0;
    totalRaw += val;
    subscaleSums[q.subscale] += val;
    subscaleCounts[q.subscale] += 1;
  });

  const maxTotalRaw = STRESS_QUESTIONS.length * 4; // 15 * 4 = 60
  const overallScore = Math.min(100, Math.round((totalRaw / maxTotalRaw) * 100));

  let categoryEn: StressLevelCategory = "Low Stress";
  let categoryId: StressLevelCategory = "Stres Rendah";
  let summaryEn = "";
  let summaryId = "";

  if (overallScore <= 20) {
    categoryEn = "Low Stress";
    categoryId = "Stres Rendah";
    summaryEn =
      "Your responses suggest a low level of perceived stress. You appear to be managing daily demands with manageable cognitive load and effective recovery.";
    summaryId =
      "Respons Anda menunjukkan tingkat stres yang terkelola dengan sangat baik. Anda mampu mengatasi tuntutan harian dengan kapasitas kognitif yang terjaga dan pemulihan efektif.";
  } else if (overallScore <= 40) {
    categoryEn = "Mild Stress";
    categoryId = "Stres Ringan";
    summaryEn =
      "Your responses suggest mild stress. You may experience occasional pressure or fatigue, but generally maintain adaptive coping mechanisms.";
    summaryId =
      "Respons Anda menunjukkan stres ringan. Anda mungkin merasakan tekanan situasional sesekali, namun secara umum masih memiliki mekanisme koping yang adaptif.";
  } else if (overallScore <= 60) {
    categoryEn = "Moderate Stress";
    categoryId = "Stres Sedang";
    summaryEn =
      "Your responses suggest moderate stress. Current demands may be taxing your cognitive or emotional bandwidth, making intentional downtime and pacing beneficial.";
    summaryId =
      "Respons Anda menunjukkan tingkat stres sedang. Tuntutan saat ini mulai menguras energi kognitif dan emosional Anda, sehingga jeda istirahat terencana sangat dianjurkan.";
  } else if (overallScore <= 80) {
    categoryEn = "High Stress";
    categoryId = "Stres Tinggi";
    summaryEn =
      "Your responses suggest high perceived stress. Multiple areas appear burdened by sustained pressure, signaling an important opportunity to reduce non-essential commitments and prioritize restorative habits.";
    summaryId =
      "Respons Anda menunjukkan tingkat stres yang cukup tinggi. Beberapa area tampak terbebani tekanan berkelanjutan, menandakan perlunya mengurangi komitmen non-esensial dan memprioritaskan pemulihan tubuh.";
  } else {
    categoryEn = "Very High Stress";
    categoryId = "Stres Sangat Tinggi";
    summaryEn =
      "Your responses indicate very high stress levels across multiple domains. Prolonged strain can impact wellbeing, making it advisable to adjust workload expectations and consult trusted support.";
    summaryId =
      "Respons Anda menunjukkan stres yang sangat tinggi di berbagai dimensi. Tekanan berkepanjangan dapat memengaruhi kesehatan Anda, sehingga penting untuk menyederhanakan beban dan berkonsultasi dengan profesional jika diperlukan.";
  }

  const subscales = {} as Record<StressSubscale, StressSubscaleScore>;
  const infoMap = SUBSCALE_INFO_I18N[lang];

  (Object.keys(subscaleSums) as StressSubscale[]).forEach((key) => {
    const sum = subscaleSums[key];
    const count = subscaleCounts[key] || 5;
    const maxSubscale = count * 4;
    const percentage = Math.round((sum / maxSubscale) * 100);

    subscales[key] = {
      key,
      label: infoMap[key].label,
      percentage,
      description: infoMap[key].description,
    };
  });

  const suggestionsEn: string[] = [];
  const suggestionsId: string[] = [];

  if (overallScore <= 40) {
    suggestionsEn.push(
      "Maintain your current balanced routine, including regular sleep cycles and healthy boundaries.",
      "Keep practicing preventive self-care before major busy periods arise.",
      "Acknowledge the positive habits that are currently protecting your peace of mind.",
    );
    suggestionsId.push(
      "Pertahankan ritme harian yang seimbang, termasuk jadwal tidur teratur dan batasan kerja yang jelas.",
      "Lanjutkan perawatan diri preventif sebelum memasuki periode kesibukan yang padat.",
      "Apresiasi kebiasaan-kebiasaan positif yang saat ini melindungi ketenangan pikiran Anda.",
    );
  } else if (overallScore <= 60) {
    suggestionsEn.push(
      "Review your current task commitments and identify 1–2 items that can be delegated, simplified, or delayed.",
      "Incorporate structured micro-breaks (e.g., 5-minute screen-free walks) between intense focus blocks.",
      "Establish a firm digital cutoff time in the evening to allow mental de-escalation before sleep.",
      "Talk through current pressures with a trusted colleague, friend, or partner.",
    );
    suggestionsId.push(
      "Evaluasi daftar tugas saat ini dan tentukan 1–2 hal yang dapat didelegasikan, disederhanakan, atau ditunda.",
      "Sisipkan jeda mikro terstruktur (misal: jalan santai 5 menit tanpa layar gadget) di sela-sela jam kerja.",
      "Tetapkan batasan waktu digital di malam hari agar pikiran dapat rileks sebelum tidur.",
      "Diskusikan beban pikiran Anda dengan rekan, sahabat, atau pasangan tepercaya.",
    );
  } else {
    suggestionsEn.push(
      "Pace your daily schedule strictly by focusing only on top-priority essentials and temporarily pausing non-critical obligations.",
      "Prioritize basic biological restoration: consistent sleep schedules, regular hydration, and balanced nutrition.",
      "Practice brief somatic down-regulation techniques (such as extended exhale breathing or progressive muscle relaxation).",
      "If these feelings feel persistent, overwhelming, or interfere with daily life, consider speaking with a licensed healthcare or counseling professional for tailored guidance.",
    );
    suggestionsId.push(
      "Atur ritme harian secara ketat dengan hanya fokus pada prioritas paling utama dan menunda kewajiban yang tidak mendesak.",
      "Prioritaskan pemulihan biologis dasar: tidur konsisten, hidrasi cukup, dan asupan nutrisi teratur.",
      "Lakukan latihan relaksasi somatik sederhana (seperti pernapasan dengan hembusan napas panjang atau relaksasi otot bertahap).",
      "Jika rasa terbebani ini menetap dan mengganggu rutinitas harian, pertimbangkan berkonsultasi dengan profesional konseling atau psikolog untuk penanganan yang tepat.",
    );
  }

  return {
    overallScore,
    category: lang === "id" ? categoryId : categoryEn,
    categorySummary: lang === "id" ? summaryId : summaryEn,
    subscales,
    suggestions: lang === "id" ? suggestionsId : suggestionsEn,
  };
}
