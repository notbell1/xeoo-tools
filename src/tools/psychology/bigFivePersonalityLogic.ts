import type { ToolLanguage } from "./psychologyI18n";

export type TraitKey =
  | "openness"
  | "conscientiousness"
  | "extraversion"
  | "agreeableness"
  | "neuroticism";

export interface BigFiveQuestion {
  id: number;
  text: {
    en: string;
    id: string;
  };
  trait: TraitKey;
  isReversed: boolean;
}

export interface TraitScore {
  key: TraitKey;
  label: string;
  percentage: number;
  level: "Low" | "Moderate" | "High" | "Rendah" | "Sedang" | "Tinggi";
  description: string;
  summary: string;
  facets: string[];
}

export interface BigFiveResult {
  scores: Record<TraitKey, TraitScore>;
  strongestTrait: TraitScore;
  lowestTrait: TraitScore;
  overallSummary: string;
}

export const BIG_FIVE_QUESTIONS: BigFiveQuestion[] = [
  // 1-5: Openness to Experience
  {
    id: 1,
    text: {
      en: "I am deeply curious about abstract concepts, philosophy, and art.",
      id: "Saya sangat tertarik dan penasaran dengan konsep abstrak, filosofi, dan karya seni.",
    },
    trait: "openness",
    isReversed: false,
  },
  {
    id: 2,
    text: {
      en: "I prefer familiar, conventional routines over trying new and unfamiliar experiences.",
      id: "Saya lebih menyukai rutinitas yang sudah biasa dan pasti daripada mencoba hal baru yang belum dikenal.",
    },
    trait: "openness",
    isReversed: true,
  },
  {
    id: 3,
    text: {
      en: "I have a vivid imagination and often daydream or explore creative ideas.",
      id: "Saya memiliki imajinasi yang hidup dan sering mengeksplorasi ide-ide kreatif.",
    },
    trait: "openness",
    isReversed: false,
  },
  {
    id: 4,
    text: {
      en: "I find little interest in poetry, theoretical discussions, or complex artworks.",
      id: "Saya kurang tertarik pada puisi, diskusi teori yang rumit, atau seni yang kompleks.",
    },
    trait: "openness",
    isReversed: true,
  },
  {
    id: 5,
    text: {
      en: "I enjoy exploring novel perspectives that challenge my existing viewpoints.",
      id: "Saya senang mempelajari sudut pandang baru yang menantang pandangan saya saat ini.",
    },
    trait: "openness",
    isReversed: false,
  },

  // 6-10: Conscientiousness
  {
    id: 6,
    text: {
      en: "I keep my workspace organized and approach my duties in an orderly manner.",
      id: "Saya menjaga ruang kerja tetap teratur dan mengerjakan tugas secara terencana dan terstruktur.",
    },
    trait: "conscientiousness",
    isReversed: false,
  },
  {
    id: 7,
    text: {
      en: "I frequently postpone chores and find it hard to stick to deadlines.",
      id: "Saya sering menunda pekerjaan rumah/tugas dan sulit mematuhi tenggat waktu.",
    },
    trait: "conscientiousness",
    isReversed: true,
  },
  {
    id: 8,
    text: {
      en: "I am thorough, dependable, and persistent until a task is completely finished.",
      id: "Saya teliti, dapat diandalkan, dan tekun hingga pekerjaan selesai dengan tuntas.",
    },
    trait: "conscientiousness",
    isReversed: false,
  },
  {
    id: 9,
    text: {
      en: "I act on impulse without thoroughly considering the long-term consequences.",
      id: "Saya bertindak spontan mengikuti dorongan sesaat tanpa memikirkan dampak jangka panjangnya.",
    },
    trait: "conscientiousness",
    isReversed: true,
  },
  {
    id: 10,
    text: {
      en: "I set clear personal goals and work systematically toward achieving them.",
      id: "Saya menetapkan tujuan pribadi yang jelas dan berusaha mencapainya secara sistematis.",
    },
    trait: "conscientiousness",
    isReversed: false,
  },

  // 11-15: Extraversion
  {
    id: 11,
    text: {
      en: "I feel energized and enthusiastic when interacting in large social gatherings.",
      id: "Saya merasa berenergi dan antusias saat berinteraksi dalam perkumpulan sosial atau acara yang ramai.",
    },
    trait: "extraversion",
    isReversed: false,
  },
  {
    id: 12,
    text: {
      en: "I prefer solitary activities and feel drained after prolonged social interaction.",
      id: "Saya lebih menikmati aktivitas sendiri dan merasa lelah setelah interaksi sosial yang terlalu lama.",
    },
    trait: "extraversion",
    isReversed: true,
  },
  {
    id: 13,
    text: {
      en: "I readily take the initiative in group settings and speak up with confidence.",
      id: "Saya mudah mengambil inisiatif dalam kelompok dan berani mengutarakan pendapat dengan percaya diri.",
    },
    trait: "extraversion",
    isReversed: false,
  },
  {
    id: 14,
    text: {
      en: "I usually keep my thoughts to myself and tend to be quiet around unfamiliar people.",
      id: "Saya biasanya menyimpan pikiran sendiri dan cenderung pendiam saat berada di dekat orang yang baru dikenal.",
    },
    trait: "extraversion",
    isReversed: true,
  },
  {
    id: 15,
    text: {
      en: "I enjoy a fast-paced lifestyle filled with exciting social opportunities.",
      id: "Saya menyukai ritme hidup yang aktif dan dipenuhi banyak kesempatan sosial yang menyenangkan.",
    },
    trait: "extraversion",
    isReversed: false,
  },

  // 16-20: Agreeableness
  {
    id: 16,
    text: {
      en: "I genuinely care about how others feel and try to offer support when they struggle.",
      id: "Saya tulus peduli dengan perasaan orang lain dan berusaha memberikan dukungan saat mereka kesulitan.",
    },
    trait: "agreeableness",
    isReversed: false,
  },
  {
    id: 17,
    text: {
      en: "I can be skeptical of other people's motives and rarely trust others easily.",
      id: "Saya cenderung skeptis terhadap motif orang lain dan tidak mudah menaruh rasa percaya.",
    },
    trait: "agreeableness",
    isReversed: true,
  },
  {
    id: 18,
    text: {
      en: "I strive to cooperate and find compromise rather than argue over differences.",
      id: "Saya berusaha bekerja sama dan mencari titik temu daripada berdebat berkepanjangan.",
    },
    trait: "agreeableness",
    isReversed: false,
  },
  {
    id: 19,
    text: {
      en: "I can be blunt or critical when people make mistakes or disagree with me.",
      id: "Saya bisa bersikap ceplas-ceplos atau terlalu kritis ketika orang lain berbuat salah atau berbeda pendapat.",
    },
    trait: "agreeableness",
    isReversed: true,
  },
  {
    id: 20,
    text: {
      en: "I believe most people have good intentions and deserve kindness.",
      id: "Saya meyakini bahwa kebanyakan orang memiliki niat baik dan pantas diperlakukan dengan ramah.",
    },
    trait: "agreeableness",
    isReversed: false,
  },

  // 21-25: Neuroticism / Emotional Sensitivity
  {
    id: 21,
    text: {
      en: "I often find myself worrying about potential problems that might occur.",
      id: "Saya sering merasa cemas atau khawatir memikirkan kemungkinan masalah yang belum tentu terjadi.",
    },
    trait: "neuroticism",
    isReversed: false,
  },
  {
    id: 22,
    text: {
      en: "I remain calm, steady, and composed even in high-pressure circumstances.",
      id: "Saya tetap tenang, terkendali, dan berkepala dingin bahkan dalam situasi dengan tekanan tinggi.",
    },
    trait: "neuroticism",
    isReversed: true,
  },
  {
    id: 23,
    text: {
      en: "My mood can shift noticeably when unexpected setbacks occur.",
      id: "Suasana hati saya dapat berubah drastis saat menghadapi kendala atau rintangan yang tak terduga.",
    },
    trait: "neuroticism",
    isReversed: false,
  },
  {
    id: 24,
    text: {
      en: "I bounce back quickly after experiencing stressful or disappointing events.",
      id: "Saya cepat bangkit dan pulih kembali setelah mengalami peristiwa yang mengecewakan atau penuh stres.",
    },
    trait: "neuroticism",
    isReversed: true,
  },
  {
    id: 25,
    text: {
      en: "I frequently experience self-doubt or emotional tension during uncertain times.",
      id: "Saya sering meragukan diri sendiri atau merasakan ketegangan emosional saat situasi serba tidak pasti.",
    },
    trait: "neuroticism",
    isReversed: false,
  },
];

export const SCALE_OPTIONS_I18N = {
  en: [
    { value: 1, label: "Strongly Disagree" },
    { value: 2, label: "Disagree" },
    { value: 3, label: "Neutral" },
    { value: 4, label: "Agree" },
    { value: 5, label: "Strongly Agree" },
  ],
  id: [
    { value: 1, label: "Sangat Tidak Setuju" },
    { value: 2, label: "Tidak Setuju" },
    { value: 3, label: "Netral / Ragu" },
    { value: 4, label: "Setuju" },
    { value: 5, label: "Sangat Setuju" },
  ],
};

export const TRAIT_INFO_I18N: Record<
  ToolLanguage,
  Record<
    TraitKey,
    {
      label: string;
      description: string;
      facets: string[];
      lowInterpretation: string;
      moderateInterpretation: string;
      highInterpretation: string;
    }
  >
> = {
  en: {
    openness: {
      label: "Openness to Experience",
      description:
        "Reflects curiosity, intellectual exploration, appreciation of art, and willingness to consider novel perspectives.",
      facets: [
        "Intellectual Curiosity",
        "Creativity",
        "Aesthetic Appreciation",
        "Adaptability",
      ],
      lowInterpretation:
        "Your responses suggest a practical, conventional approach. You likely appreciate proven routines, clear facts, and tangible solutions over speculative theories.",
      moderateInterpretation:
        "Your responses suggest a balanced mix between pragmatic grounding and creative openness, enjoying novelty when useful while respecting established methods.",
      highInterpretation:
        "Your responses suggest high curiosity, imagination, and receptivity to new ideas, unconventional insights, and creative endeavors.",
    },
    conscientiousness: {
      label: "Conscientiousness",
      description:
        "Reflects self-discipline, organization, goal-directed perseverance, and dependability.",
      facets: [
        "Organization",
        "Reliability",
        "Perseverance",
        "Goal Focus",
      ],
      lowInterpretation:
        "Your responses suggest a spontaneous, flexible style that prefers adapting in the moment rather than adhering strictly to rigid schedules.",
      moderateInterpretation:
        "Your responses suggest moderate organization. You are capable of dependable structure when required, while remaining flexible under changing conditions.",
      highInterpretation:
        "Your responses suggest a highly organized, diligent, and methodical approach with strong task discipline and goal commitment.",
    },
    extraversion: {
      label: "Extraversion",
      description:
        "Reflects sociability, assertiveness, enthusiasm, and orientation toward external engagement.",
      facets: [
        "Sociability",
        "Assertiveness",
        "Energy Level",
        "Social Initiative",
      ],
      lowInterpretation:
        "Your responses suggest a more introverted orientation, drawing energy from calm solitude, deep focus, and close, small-circle connections.",
      moderateInterpretation:
        "Your responses suggest ambiversion—comfortable in social interaction when desired, yet valuing quiet personal time to recharge.",
      highInterpretation:
        "Your responses suggest an outgoing, energetic approach that thrives in collaborative, active, and communicative environments.",
    },
    agreeableness: {
      label: "Agreeableness",
      description:
        "Reflects empathy, cooperativeness, interpersonal warmth, and trust in others.",
      facets: ["Compassion", "Trust", "Cooperation", "Empathy"],
      lowInterpretation:
        "Your responses suggest a competitive, analytical, or skeptical stance, prioritizing objective scrutiny and self-reliance in negotiations.",
      moderateInterpretation:
        "Your responses suggest a pragmatic interpersonal style, balancing cooperative warmth with healthy boundaries and critical thinking.",
      highInterpretation:
        "Your responses suggest high empathy, warmth, and a strong preference for harmony, mutual respect, and collaborative support.",
    },
    neuroticism: {
      label: "Emotional Sensitivity (Neuroticism)",
      description:
        "Reflects the degree of emotional reactivity to stressors, uncertainty, and perceived threats.",
      facets: [
        "Stress Reactivity",
        "Vulnerability",
        "Worry Tendency",
        "Emotional Recovery",
      ],
      lowInterpretation:
        "Your responses suggest high emotional stability and resilience, staying grounded and composed in the face of pressure or disruption.",
      moderateInterpretation:
        "Your responses suggest typical emotional variability, experiencing normal stress during significant demands while regaining balance reasonably.",
      highInterpretation:
        "Your responses suggest heightened emotional sensitivity and responsiveness to environmental demands or potential uncertainties.",
    },
  },
  id: {
    openness: {
      label: "Keterbukaan terhadap Pengalaman (Openness)",
      description:
        "Mencerminkan rasa ingin tahu, eksplorasi intelektual, apresiasi seni, dan kesediaan menerima ide serta perspektif baru.",
      facets: [
        "Keingintahuan Intelektual",
        "Kreativitas",
        "Apresiasi Estetika",
        "Adaptabilitas",
      ],
      lowInterpretation:
        "Respons Anda menunjukkan pendekatan yang praktis dan konvensional. Anda cenderung menyukai rutinitas terbukti, fakta konkret, dan solusi nyata daripada teori abstrak.",
      moderateInterpretation:
        "Respons Anda menunjukkan keseimbangan antara kepraktisan realistis dan keterbukaan kreatif, menyukai hal baru saat dibutuhkan sekaligus menghargai metode mapan.",
      highInterpretation:
        "Respons Anda menunjukkan imajinasi tinggi, rasa penasaran yang mendalam, dan keterbukaan besar terhadap ide-ide kreatif serta eksplorasi konsep baru.",
    },
    conscientiousness: {
      label: "Ketelitian & Keteraturan (Conscientiousness)",
      description:
        "Mencerminkan kedisiplinan diri, keteraturan tugas, ketekunan mencapai target, dan tanggung jawab kerja.",
      facets: [
        "Keteraturan",
        "Keandalan / Tanggung Jawab",
        "Ketekunan",
        "Fokus Sasaran",
      ],
      lowInterpretation:
        "Respons Anda menunjukkan gaya kerja spontan dan fleksibel yang lebih menyukai improvisasi daripada terikat jadwal ketat.",
      moderateInterpretation:
        "Respons Anda menunjukkan keteraturan yang seimbang. Anda mampu disiplin saat diperlukan, namun tetap fleksibel ketika situasi berubah.",
      highInterpretation:
        "Respons Anda menunjukkan tingkat disiplin, ketelitian, dan persistensi tinggi dalam menyelesaikan rencana dan tanggung jawab secara tuntas.",
    },
    extraversion: {
      label: "Ekstraversi (Extraversion)",
      description:
        "Mencerminkan orientasi energi sosial, keramahan, inisiatif berbicara di depan umum, dan antusiasme dalam kelompok.",
      facets: [
        "Interaksi Sosial",
        "Keberanian Mengemukakan Pendapat",
        "Tingkat Energi",
        "Inisiatif Kelompok",
      ],
      lowInterpretation:
        "Respons Anda menunjukkan kecenderungan introversi, mengisi energi melalui ketenangan, perenungan mendalam, dan lingkaran pertemanan yang selektif.",
      moderateInterpretation:
        "Respons Anda menunjukkan sifat ambivert—nyaman berinteraksi sosial saat dibutuhkan, namun tetap sangat menghargai waktu sendiri untuk memulihkan energi.",
      highInterpretation:
        "Respons Anda menunjukkan kepribadian ekstrovert yang ekspresif, berenergi tinggi, dan bersemangat dalam suasana kolaboratif yang dinamis.",
    },
    agreeableness: {
      label: "Keramahan & Kerjasama (Agreeableness)",
      description:
        "Mencerminkan empati, kehangatan hubungan, kemampuan bekerja sama, dan prasangka baik terhadap orang lain.",
      facets: ["Kepedulian", "Kepercayaan", "Kerjasama", "Empati"],
      lowInterpretation:
        "Respons Anda menunjukkan gaya analitis dan skeptis, lebih memprioritaskan objektivitas, argumen kritis, dan kemandirian dibanding sekadar menyenangkan orang lain.",
      moderateInterpretation:
        "Respons Anda menunjukkan gaya interpersonal yang proporsional—menjaga kehangatan hubungan sembari mempertahankan batasan diri yang sehat.",
      highInterpretation:
        "Respons Anda menunjukkan empati yang kuat, kepedulian tulus, serta keinginan tinggi untuk membangun keharmonisan dan mendukung sesama.",
    },
    neuroticism: {
      label: "Sensitivitas Emosional (Emotional Sensitivity)",
      description:
        "Mencerminkan tingkat reaktivitas emosi terhadap tekanan situasi, rasa cemas, dan ketidakpastian.",
      facets: [
        "Reaktivitas Tekanan",
        "Kerentanan Cemas",
        "Kecenderungan Khawatir",
        "Pemulihan Suasana Hati",
      ],
      lowInterpretation:
        "Respons Anda menunjukkan stabilitas emosi yang tinggi dan ketenangan prima saat menghadapi tekanan atau peristiwa mengejutkan.",
      moderateInterpretation:
        "Respons Anda menunjukkan variabilitas emosi yang wajar—merasakan ketegangan saat beban meningkat namun dapat kembali stabil secara bertahap.",
      highInterpretation:
        "Respons Anda menunjukkan sensitivitas emosional yang responsif terhadap dinamika lingkungan atau situasi yang belum pasti.",
    },
  },
};

export function calculateBigFiveScore(
  answers: Record<number, number>,
  lang: ToolLanguage = "en",
): BigFiveResult {
  const traitSums: Record<TraitKey, number> = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  };

  const traitCounts: Record<TraitKey, number> = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  };

  BIG_FIVE_QUESTIONS.forEach((q) => {
    const rawAnswer = answers[q.id] ?? 3;
    const scoredValue = q.isReversed ? 6 - rawAnswer : rawAnswer;
    traitSums[q.trait] += scoredValue;
    traitCounts[q.trait] += 1;
  });

  const scores = {} as Record<TraitKey, TraitScore>;
  const infoMap = TRAIT_INFO_I18N[lang];

  (Object.keys(traitSums) as TraitKey[]).forEach((trait) => {
    const count = traitCounts[trait] || 5;
    const minPossible = count * 1;
    const maxPossible = count * 5;
    const sum = traitSums[trait];

    const percentage = Math.round(
      ((sum - minPossible) / (maxPossible - minPossible)) * 100,
    );

    let levelEn: "Low" | "Moderate" | "High" = "Moderate";
    let levelId: "Rendah" | "Sedang" | "Tinggi" = "Sedang";
    let summary = infoMap[trait].moderateInterpretation;

    if (percentage < 40) {
      levelEn = "Low";
      levelId = "Rendah";
      summary = infoMap[trait].lowInterpretation;
    } else if (percentage > 60) {
      levelEn = "High";
      levelId = "Tinggi";
      summary = infoMap[trait].highInterpretation;
    }

    scores[trait] = {
      key: trait,
      label: infoMap[trait].label,
      percentage,
      level: lang === "id" ? levelId : levelEn,
      description: infoMap[trait].description,
      summary,
      facets: infoMap[trait].facets,
    };
  });

  const traitList = Object.values(scores);
  const sorted = [...traitList].sort((a, b) => b.percentage - a.percentage);

  const strongestTrait = sorted[0];
  const lowestTrait = sorted[sorted.length - 1];

  const overallSummary =
    lang === "id"
      ? `Respons Anda menunjukkan keselarasan tertinggi pada dimensi ${strongestTrait.label} (${strongestTrait.percentage}%), yang mencerminkan kecenderungan utama pada ${strongestTrait.facets.slice(0, 2).join(" dan ").toLowerCase()}. Sementara itu, dimensi ${lowestTrait.label} merupakan dimensi dengan skor relatif terendah (${lowestTrait.percentage}%).`
      : `Your responses indicate highest alignment with ${strongestTrait.label} (${strongestTrait.percentage}%), suggesting that your primary orientation is characterized by ${strongestTrait.facets.slice(0, 2).join(" and ").toLowerCase()}. In contrast, ${lowestTrait.label} reflects your lowest relative scoring (${lowestTrait.percentage}%).`;

  return {
    scores,
    strongestTrait,
    lowestTrait,
    overallSummary,
  };
}
