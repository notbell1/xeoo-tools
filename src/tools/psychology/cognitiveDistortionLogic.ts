import type { ToolLanguage } from "./psychologyI18n";

export type DistortionKey =
  | "allOrNothing"
  | "catastrophizing"
  | "overgeneralization"
  | "mindReading"
  | "fortuneTelling"
  | "emotionalReasoning"
  | "shouldStatements"
  | "personalization"
  | "discountingThePositive";

export interface DistortionDefinition {
  key: DistortionKey;
  name: string;
  shortDesc: string;
  explanation: string;
  reframingGuidance: string;
  keywords: RegExp[];
  exampleReframes: { inputPattern: string; suggestedReframe: string }[];
}

export interface DetectedDistortion {
  key: DistortionKey;
  name: string;
  score: number; // 0–100
  shortDesc: string;
  explanation: string;
  reframingGuidance: string;
  sampleReframe: string;
  matchedKeywords: string[];
}

export interface AnalysisResult {
  thoughtText: string;
  primaryPattern: DetectedDistortion | null;
  detectedPatterns: DetectedDistortion[];
  suggestedReframe: string;
  reframingSteps: string[];
}

export const DISTORTION_DEFINITIONS_I18N: Record<
  ToolLanguage,
  Record<DistortionKey, DistortionDefinition>
> = {
  en: {
    allOrNothing: {
      key: "allOrNothing",
      name: "All-or-Nothing Thinking",
      shortDesc: "Viewing situations in black-and-white absolutes without gray area.",
      explanation:
        "This thought appears to evaluate outcomes in absolute extremes (e.g., total perfection vs. total ruin), ignoring intermediate possibilities, progress, or nuanced realities.",
      reframingGuidance:
        "Look for the nuance between 0% and 100%. Replace rigid absolutes like 'completely' or 'never' with balanced descriptors like 'in this specific instance' or 'partially'.",
      keywords: [
        /\b(always|never|completely|total|totally|ruined|worthless|perfect|either|failure|useless|flawless|disaster)\b/i,
        /\b(everything|nothing|everyone|nobody)\b/i,
      ],
      exampleReframes: [
        {
          inputPattern: "ruined",
          suggestedReframe:
            "While this situation did not go as planned, it represents a single setback rather than a total loss. I can adjust my approach moving forward.",
        },
      ],
    },
    catastrophizing: {
      key: "catastrophizing",
      name: "Catastrophizing",
      shortDesc: "Assuming the worst-case scenario is inevitable and unmanageable.",
      explanation:
        "This thought jumps to an extreme negative catastrophe, magnifying potential consequences far beyond the immediate facts.",
      reframingGuidance:
        "Ask: 'What is the most likely realistic outcome?' and 'If the worst did happen, what practical steps could I take to navigate it?'",
      keywords: [
        /\b(catastrophe|end of (the|my) world|ruined?|destroy(ed)?|unbearable|can't survive|worst possible|nightmare|devastated)\b/i,
        /\b(life is over|future is (gone|ruined|bleak))\b/i,
      ],
      exampleReframes: [
        {
          inputPattern: "catastrophe",
          suggestedReframe:
            "This is uncomfortable and stressful, but it is not a life-ending catastrophe. I have handled challenging moments before and have options available.",
        },
      ],
    },
    overgeneralization: {
      key: "overgeneralization",
      name: "Overgeneralization",
      shortDesc: "Drawing broad universal rules from a single negative occurrence.",
      explanation:
        "This thought takes a single isolated event or disappointment and views it as part of an unalterable, endless cycle of defeat.",
      reframingGuidance:
        "Confine the evaluation strictly to this specific moment. Avoid extrapolating one incident into an inevitable life pattern.",
      keywords: [
        /\b(every single time|always happens to me|nothing ever works|i always mess up|pattern)\b/i,
        /\b(i'm always|people always|things never)\b/i,
      ],
      exampleReframes: [
        {
          inputPattern: "always",
          suggestedReframe:
            "This particular attempt did not succeed, but that does not mean future attempts will meet the same outcome. Each instance is independent.",
        },
      ],
    },
    mindReading: {
      key: "mindReading",
      name: "Mind Reading",
      shortDesc: "Assuming you know what others are thinking without objective evidence.",
      explanation:
        "This thought presumes that others are judging, disapproving, or looking down on you without verified communication or direct feedback.",
      reframingGuidance:
        "Separate observable evidence from internal assumptions. What concrete proof do you have of their internal thoughts?",
      keywords: [
        /\b(they (all )?(think|know|hate|judge|laugh|despise)|everyone thinks|she thinks|he thinks)\b/i,
        /\b(they must be thinking|they probably think|they see me as)\b/i,
      ],
      exampleReframes: [
        {
          inputPattern: "think",
          suggestedReframe:
            "I cannot read others' minds. Unless someone tells me directly, assuming they hold negative thoughts is just my own anxiety projecting.",
        },
      ],
    },
    fortuneTelling: {
      key: "fortuneTelling",
      name: "Fortune Telling",
      shortDesc: "Predicting negative future outcomes as established certainties.",
      explanation:
        "This thought treats an anticipated anxious prediction as a predetermined fact before the event has even taken place.",
      reframingGuidance:
        "Remind yourself that thoughts are forecasts, not facts. Consider multiple possible outcomes, including neutral and positive ones.",
      keywords: [
        /\b(i know (i will|i'm going to|it will)|it's bound to|will definitely fail|going to mess up|won't work out|doomed)\b/i,
        /\b(there is no way (i can|it will))\b/i,
      ],
      exampleReframes: [
        {
          inputPattern: "know",
          suggestedReframe:
            "I am feeling anxious about the outcome, but the future has not happened yet. I can prepare well and focus on what is within my control.",
        },
      ],
    },
    emotionalReasoning: {
      key: "emotionalReasoning",
      name: "Emotional Reasoning",
      shortDesc: "Believing that because you feel something strongly, it must be true.",
      explanation:
        "This thought takes an internal emotional state (such as feeling inadequate or guilty) and uses it as definitive proof of external reality.",
      reframingGuidance:
        "Acknowledge the feeling without letting it define the facts: 'I feel anxious right now, but my feelings are valid responses, not objective proof of danger.'",
      keywords: [
        /\b(i feel (like a failure|stupid|worthless|hopeless|pathetic|incapable))\b/i,
        /\b(because i feel|feeling this way means)\b/i,
      ],
      exampleReframes: [
        {
          inputPattern: "feel",
          suggestedReframe:
            "Feeling overwhelmed does not make me inadequate. Feelings reflect my current stress level, not my objective competence or worth.",
        },
      ],
    },
    shouldStatements: {
      key: "shouldStatements",
      name: "Should & Must Statements",
      shortDesc: "Imposing rigid demands on yourself or others, generating guilt or anger.",
      explanation:
        "This thought uses inflexible rules ('should', 'must', 'ought to') which create unrealistic pressure or resentment when reality diverges.",
      reframingGuidance:
        "Replace rigid 'shoulds' with flexible preferences: 'I would prefer to have done this faster, but doing it steadily at my pace is acceptable.'",
      keywords: [
        /\b(i should have|i must|i ought to|i have to be|shouldn't have|they should|people ought to)\b/i,
        /\b(i'm supposed to|i have no right to)\b/i,
      ],
      exampleReframes: [
        {
          inputPattern: "should",
          suggestedReframe:
            "It is understandable that I would have preferred a different outcome, but holding rigid expectations only amplifies stress. I can accept where things are now.",
        },
      ],
    },
    personalization: {
      key: "personalization",
      name: "Personalization",
      shortDesc: "Assuming personal responsibility for external events outside your control.",
      explanation:
        "This thought blames yourself entirely for negative events or other people's behaviors when multiple external factors were involved.",
      reframingGuidance:
        "Map out all contributing factors. What parts were genuinely yours, and what parts belonged to circumstances or other people's choices?",
      keywords: [
        /\b(it's (all )?my fault|i caused this|i'm to blame|because of me they|i ruined it for everyone)\b/i,
        /\b(if only i had|i'm the reason)\b/i,
      ],
      exampleReframes: [
        {
          inputPattern: "fault",
          suggestedReframe:
            "While I played a role, many external factors and other people also influenced this outcome. Taking 100% of the blame is unrealistic.",
        },
      ],
    },
    discountingThePositive: {
      key: "discountingThePositive",
      name: "Discounting the Positive",
      shortDesc: "Dismissing positive experiences, compliments, or accomplishments as trivial.",
      explanation:
        "This thought rejects genuine successes or positive feedback by explaining them away as 'just luck', 'fluke', or 'not counting'.",
      reframingGuidance:
        "Allow yourself to acknowledge your efforts. Accept positive evidence with the same validity you give to constructive feedback.",
      keywords: [
        /\b(just luck|only because|doesn't count|anyone could have|fluke|they're just being nice|not a big deal)\b/i,
        /\b(it doesn't mean anything)\b/i,
      ],
      exampleReframes: [
        {
          inputPattern: "luck",
          suggestedReframe:
            "While timing or support played a role, my hard work, preparation, and consistency were also essential to making this success happen.",
        },
      ],
    },
  },
  id: {
    allOrNothing: {
      key: "allOrNothing",
      name: "Pikiran Hitam-Putih (All-or-Nothing)",
      shortDesc: "Melihat situasi dalam dua kutub ekstrem mutlak tanpa ruang abu-abu.",
      explanation:
        "Pikiran ini mengevaluasi hasil secara absolut (misal: harus sempurna 100% atau dianggap gagal total), mengabaikan proses, kemajuan bertahap, dan nuansa realitas.",
      reframingGuidance:
        "Carilah area abu-abu di antara 0% dan 100%. Ganti kata mutlak seperti 'selalu gagal' atau 'hancur total' dengan istilah realistis seperti 'pada momen ini' atau 'sebagian berhasil'.",
      keywords: [
        /\b(selalu|tidak pernah|sama sekali|hancur|gagal total|sempurna|sia-sia|rusak semuanya|pasti gagal)\b/i,
        /\b(semuanya|tidak ada yang|tiada arti)\b/i,
      ],
      exampleReframes: [
        {
          inputPattern: "hancur",
          suggestedReframe:
            "Meskipun hasil kali ini belum sesuai harapan, ini hanyalah kendala sementara, bukan kegagalan mutlak. Saya bisa memperbaiki langkah ke depan.",
        },
      ],
    },
    catastrophizing: {
      key: "catastrophizing",
      name: "Katastrofisasi (Catastrophizing)",
      shortDesc: "Membayangkan skenario terburuk sebagai hal yang pasti terjadi dan tak tertahankan.",
      explanation:
        "Pikiran ini langsung melompat ke skenario kiamat kecil atau bencana hidup yang sangat membesar-besarkan dampak dari fakta sebenarnya.",
      reframingGuidance:
        "Tanyakan: 'Apa kemungkinan hasil yang paling realistis?' dan 'Jika hal buruk terjadi, apa langkah nyata yang bisa saya ambil untuk mengatasinya?'",
      keywords: [
        /\b(kiamat|tamat sudah|hidupku hancur|bencana|tidak sanggup hidup|hancur lebur|mimpi buruk|masa depan suram)\b/i,
        /\b(habislah sudah|tidak ada harapan lagi)\b/i,
      ],
      exampleReframes: [
        {
          inputPattern: "bencana",
          suggestedReframe:
            "Situasi ini memang tidak nyaman dan membuat stres, tetapi ini bukan akhir dari segalanya. Saya pernah melewati masa sulit sebelumnya dan punya pilihan solusi.",
        },
      ],
    },
    overgeneralization: {
      key: "overgeneralization",
      name: "Generalisasi Berlebihan (Overgeneralization)",
      shortDesc: "Menarik kesimpulan umum yang kaku hanya dari satu peristiwa negatif.",
      explanation:
        "Pikiran ini menganggap satu kekecewaan atau kesalahan tunggal sebagai pola kekalahan abadi yang akan terus berulang tanpa henti.",
      reframingGuidance:
        "Batasi evaluasi Anda hanya pada kejadian spesifik saat ini. Hindari menganggap satu kejadian sebagai pola hidup selamanya.",
      keywords: [
        /\b(setiap kali|selalu saja begini|tidak pernah ada yang berhasil|saya selalu mengacau|pasti terulang)\b/i,
        /\b(semua orang selalu|nasib saya selalu)\b/i,
      ],
      exampleReframes: [
        {
          inputPattern: "selalu",
          suggestedReframe:
            "Percobaan kali ini belum berhasil, tetapi bukan berarti percobaan berikutnya akan sama. Setiap kesempatan adalah momen yang berdiri sendiri.",
        },
      ],
    },
    mindReading: {
      key: "mindReading",
      name: "Membaca Pikiran (Mind Reading)",
      shortDesc: "Mengasumsikan pikiran negatif orang lain tanpa bukti nyata.",
      explanation:
        "Pikiran ini meyakini bahwa orang lain sedang menghakimi, meremehkan, atau membenci Anda tanpa adanya konfirmasi langsung.",
      reframingGuidance:
        "Pisahkan antara asumsi pribadi dan bukti nyata. Apakah Anda memiliki bukti langsung bahwa mereka benar-benar berpikir demikian?",
      keywords: [
        /\b(mereka semua (pikir|tahu|membenci|menertawakan|menilai)|semua orang menganggap|dia pasti mengira)\b/i,
        /\b(mereka pasti berpikir|mereka menganggapku bodoh)\b/i,
      ],
      exampleReframes: [
        {
          inputPattern: "mengira",
          suggestedReframe:
            "Saya tidak bisa membaca pikiran orang lain. Menganggap mereka berpikiran buruk hanyalah proyeksi rasa cemas saya sendiri sampai ada bukti nyata.",
        },
      ],
    },
    fortuneTelling: {
      key: "fortuneTelling",
      name: "Meramal Masa Depan Negatif (Fortune Telling)",
      shortDesc: "Memprediksi hal buruk sebagai kepastian mutlak sebelum terjadi.",
      explanation:
        "Pikiran ini memperlakukan kekhawatiran masa depan seolah-olah sudah pasti terjadi, menciptakan rasa putus asa lebih awal.",
      reframingGuidance:
        "Ingatkan diri bahwa pikiran adalah prediksi, bukan fakta pasti. Pertimbangkan berbagai kemungkinan lain, termasuk skenario netral dan positif.",
      keywords: [
        /\b(saya tahu (pasti gagal|bakal kacau)|pasti tidak akan berhasil|tidak ada gunanya mencoba|sudah ditakdirkan gagal)\b/i,
        /\b(pasti ditolak|pasti hancur)\b/i,
      ],
      exampleReframes: [
        {
          inputPattern: "pasti",
          suggestedReframe:
            "Saya merasa cemas tentang hasilnya, namun masa depan belum terjadi. Saya bisa mempersiapkan diri sebaik mungkin dan fokus pada hal yang bisa saya kontrol.",
        },
      ],
    },
    emotionalReasoning: {
      key: "emotionalReasoning",
      name: "Penalaran Emosional (Emotional Reasoning)",
      shortDesc: "Meyakini sesuatu pasti benar hanya karena kita merasakannya dengan kuat.",
      explanation:
        "Pikiran ini menggunakan perasaan internal (seperti rasa tidak mampu, bersalah, atau takut) sebagai bukti kebenaran situasi faktual.",
      reframingGuidance:
        "Akui emosi Anda tanpa menjadikannya tolak ukur fakta: 'Saya merasa cemas, tapi perasaan ini adalah respons stres, bukan bukti nyata adanya bahaya.'",
      keywords: [
        /\b(saya merasa (bodoh|gagal|tidak berguna|putus asa|pecundang|tidak mampu))\b/i,
        /\b(karena saya merasa|perasaan ini membuktikan)\b/i,
      ],
      exampleReframes: [
        {
          inputPattern: "merasa",
          suggestedReframe:
            "Merasa kewalahan bukan berarti saya tidak kompeten. Perasaan ini mencerminkan tingkat kelelahan saya saat ini, bukan kapasitas diri yang sesungguhnya.",
        },
      ],
    },
    shouldStatements: {
      key: "shouldStatements",
      name: "Pernyataan 'Harus' (Should Statements)",
      shortDesc: "Memaksakan tuntutan kaku pada diri sendiri atau orang lain.",
      explanation:
        "Pikiran ini dipenuhi kata 'seharusnya', 'harus', atau 'wajib' yang menciptakan rasa bersalah, tekanan tidak realistis, atau kemarahan saat kenyataan berbeda.",
      reframingGuidance:
        "Ganti kata 'harus' yang kaku dengan preferensi fleksibel: 'Saya ingin menyelesaikan ini lebih cepat, tetapi mengerjakannya secara bertahap juga sudah baik.'",
      keywords: [
        /\b(seharusnya saya|saya harus|saya wajib|tidak boleh salah|mereka seharusnya|orang lain harus)\b/i,
        /\b(pantang bagi saya|tidak ada alasan untuk)\b/i,
      ],
      exampleReframes: [
        {
          inputPattern: "seharusnya",
          suggestedReframe:
            "Wajar jika saya menginginkan hasil yang lebih ideal, namun memaksakan standar kaku hanya menambah stres. Saya menerima kondisi saat ini dan melangkah dari sini.",
        },
      ],
    },
    personalization: {
      key: "personalization",
      name: "Personalisasi (Personalization)",
      shortDesc: "Menyalahkan diri sendiri sepenuhnya atas peristiwa di luar kendali.",
      explanation:
        "Pikiran ini memikul semua tanggung jawab atas kejadian negatif atau sikap orang lain, padahal banyak faktor luar yang ikut berperan.",
      reframingGuidance:
        "Petakan semua faktor penyebab. Bagian mana yang benar-benar kendali Anda, dan bagian mana yang merupakan pengaruh keadaan atau keputusan orang lain?",
      keywords: [
        /\b(ini (semua )?salah saya|karena saya mereka|saya merusak semuanya|saya penyebab masalah ini)\b/i,
        /\b(seandainya saya tidak|saya yang membuat mereka)\b/i,
      ],
      exampleReframes: [
        {
          inputPattern: "salah",
          suggestedReframe:
            "Meskipun saya memiliki andil, banyak faktor eksternal dan keputusan pihak lain yang turut memengaruhi hasil ini. Menyalahkan diri 100% tidaklah adil.",
        },
      ],
    },
    discountingThePositive: {
      key: "discountingThePositive",
      name: "Mendiskon Hal Positif (Discounting Positive)",
      shortDesc: "Menolak keberhasilan atau pujian dengan menganggapnya sekadar kebetulan sepele.",
      explanation:
        "Pikiran ini menolak pencapaian nyata dengan dalih 'cuma hoki', 'kebetulan belaka', atau 'mereka cuma basa-basi'.",
      reframingGuidance:
        "Berikan penghargaan pada usaha Anda sendiri. Terimalah bukti positif dengan bobot yang sama adilnya seperti Anda menerima kritik.",
      keywords: [
        /\b(cuma hoki|kebetulan saja|tidak berarti apa-apa|semua orang juga bisa|cuma basa-basi|tidak ada artinya)\b/i,
        /\b(bukan karena saya pintar|kebetulan beruntung)\b/i,
      ],
      exampleReframes: [
        {
          inputPattern: "hoki",
          suggestedReframe:
            "Meskipun faktor keberuntungan turut membantu, kerja keras, persiapan, dan ketekunan saya juga berperan penting dalam keberhasilan ini.",
        },
      ],
    },
  },
};

export const SAMPLE_THOUGHTS_I18N: Record<
  ToolLanguage,
  { label: string; text: string }[]
> = {
  en: [
    {
      label: "Exam Fear",
      text: "If I fail this exam, my entire future is completely ruined and I'm a total failure.",
    },
    {
      label: "Work Meeting",
      text: "Everyone in the room thinks I sounded stupid and they all know I have no idea what I'm doing.",
    },
    {
      label: "Project Delay",
      text: "I should have finished this yesterday. It's all my fault that the team is behind schedule.",
    },
    {
      label: "Compliment Doubt",
      text: "They praised my presentation, but they're just being nice. It was just pure luck and doesn't count.",
    },
    {
      label: "Social Rejection",
      text: "They haven't replied in 2 hours, so they definitely hate me and want nothing to do with me.",
    },
  ],
  id: [
    {
      label: "Kekhawatiran Ujian",
      text: "Kalau sampai saya gagal di ujian ini, masa depan saya hancur total dan saya adalah orang yang gagal.",
    },
    {
      label: "Pertemuan Kerja",
      text: "Semua orang di ruangan pasti berpikir saya bodoh dan mereka semua menganggap saya tidak tahu apa-apa.",
    },
    {
      label: "Keterlambatan Proyek",
      text: "Seharusnya saya menyelesaikannya kemarin. Ini semua salah saya tim jadi terlambat dari jadwal.",
    },
    {
      label: "Meragukan Pujian",
      text: "Mereka memuji hasil kerja saya, tapi itu cuma basa-basi. Itu cuma hoki belaka dan tidak berarti apa-apa.",
    },
    {
      label: "Kekhawatiran Relasi",
      text: "Mereka belum membalas chat saya selama 2 jam, mereka pasti membenci saya dan menjauhi saya.",
    },
  ],
};

export function analyzeCognitiveThought(
  rawText: string,
  lang: ToolLanguage = "en",
): AnalysisResult {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      thoughtText: "",
      primaryPattern: null,
      detectedPatterns: [],
      suggestedReframe: "",
      reframingSteps: [],
    };
  }

  const scoredPatterns: DetectedDistortion[] = [];
  const defMap = DISTORTION_DEFINITIONS_I18N[lang];

  (Object.keys(defMap) as DistortionKey[]).forEach((key) => {
    const def = defMap[key];
    let matchCount = 0;
    const matchedKeywords: string[] = [];

    def.keywords.forEach((regex) => {
      const match = trimmed.match(regex);
      if (match) {
        matchCount += 1;
        matchedKeywords.push(match[0]);
      }
    });

    if (matchCount > 0) {
      const score = Math.min(95, Math.max(45, matchCount * 35 + 20));

      scoredPatterns.push({
        key,
        name: def.name,
        score,
        shortDesc: def.shortDesc,
        explanation: def.explanation,
        reframingGuidance: def.reframingGuidance,
        sampleReframe: def.exampleReframes[0]?.suggestedReframe || "",
        matchedKeywords: Array.from(new Set(matchedKeywords)),
      });
    }
  });

  scoredPatterns.sort((a, b) => b.score - a.score);

  let primaryPattern: DetectedDistortion | null = null;
  let suggestedReframe = "";

  if (scoredPatterns.length > 0) {
    primaryPattern = scoredPatterns[0];
    if (primaryPattern.sampleReframe) {
      suggestedReframe = primaryPattern.sampleReframe;
    } else {
      suggestedReframe =
        lang === "id"
          ? `Meskipun pikiran otomatis "${trimmed.slice(0, 50)}..." muncul, saya memilih melihat bukti nyata secara berimbang.`
          : `While I notice myself thinking "${trimmed.slice(0, 50)}...", I can choose to evaluate the balanced evidence.`;
    }
  } else {
    primaryPattern = {
      key: "allOrNothing",
      name:
        lang === "id"
          ? "Pola Pikiran Kaku / Emosional"
          : "Possible Rigid Thinking Pattern",
      score: 50,
      shortDesc:
        lang === "id"
          ? "Terdeteksi pola pikiran otomatis dengan muatan emosional."
          : "Automatic negative thought pattern detected.",
      explanation:
        lang === "id"
          ? "Pikiran ini mengungkapkan kekhawatiran emosional. Menguji asumsi tersebut dengan bukti nyata akan membantu memberikan sudut pandang yang jernih."
          : "This thought expresses an emotional concern. Evaluating the underlying assumptions against concrete evidence can provide balanced clarity.",
      reframingGuidance:
        lang === "id"
          ? "Pertimbangkan apa saran yang akan diberikan oleh sahabat bijak kepada Anda dalam situasi ini, dan periksa apakah kesimpulan Anda didasarkan pada fakta objektif atau perasaan sesaat."
          : "Consider what advice a compassionate friend would give you in this situation, and examine whether your conclusion is based on objective facts or temporary feelings.",
      sampleReframe:
        lang === "id"
          ? "Saya mengakui perasaan sulit ini sembari memahami bahwa situasi jarang sekali bersifat hitam-putih mutlak. Saya bisa mengambil satu langkah konstruktif."
          : "I can acknowledge this difficult feeling while recognizing that situations are rarely completely black-and-white. I can take one constructive step forward.",
      matchedKeywords: [],
    };
    suggestedReframe =
      lang === "id"
        ? "Saya menyadari situasi ini menantang, tetapi pikiran otomatis saya bukan satu-satunya gambaran utuh. Sudut pandang berimbang apa yang bisa saya ambil?"
        : "I acknowledge that this situation is challenging, but my automatic thought does not define the full picture. What is one balanced perspective I can hold instead?";
  }

  const reframingSteps =
    lang === "id"
      ? [
          "Langkah 1: Sadari dan beri nama pola pikiran otomatis tersebut tanpa menghakimi diri.",
          "Langkah 2: Uji bukti konkret yang mendukung dan yang membantah keyakinan tersebut.",
          "Langkah 3: Tanyakan pada diri sendiri: 'Apa alternatif sudut pandang yang lebih realistis dan berempati?'",
          "Langkah 4: Fokus pada tindakan nyata terdekat yang berada di dalam kendali Anda saat ini.",
        ]
      : [
          "Step 1: Notice and name the automatic thought without self-judgment.",
          "Step 2: Examine the concrete evidence for and against this belief.",
          "Step 3: Ask yourself: 'What is a more realistic and compassionate alternative?'",
          "Step 4: Focus on the immediate controllable action you can take right now.",
        ];

  return {
    thoughtText: trimmed,
    primaryPattern,
    detectedPatterns: scoredPatterns,
    suggestedReframe,
    reframingSteps,
  };
}
