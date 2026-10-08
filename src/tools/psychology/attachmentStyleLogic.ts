import type { ToolLanguage } from "./psychologyI18n";

export type AttachmentStyleKey =
  | "secure"
  | "anxious"
  | "avoidant"
  | "fearfulAvoidant";

export interface AttachmentQuestion {
  id: number;
  text: {
    en: string;
    id: string;
  };
  style: AttachmentStyleKey;
}

export interface AttachmentStyleScore {
  key: AttachmentStyleKey;
  name: string;
  percentage: number;
  description: string;
  coreBelief: string;
  relationalStrengths: string[];
  growthOpportunities: string[];
}

export interface AttachmentResult {
  scores: Record<AttachmentStyleKey, AttachmentStyleScore>;
  dominantStyle: AttachmentStyleScore;
  overallSummary: string;
}

export const ATTACHMENT_QUESTIONS: AttachmentQuestion[] = [
  // 1-6: Secure Attachment
  {
    id: 1,
    text: {
      en: "I feel comfortable depending on close partners and having them depend on me.",
      id: "Saya merasa nyaman mengandalkan pasangan/orang terdekat dan membiarkan mereka mengandalkan saya.",
    },
    style: "secure",
  },
  {
    id: 2,
    text: {
      en: "I find it relatively easy to share my honest feelings and vulnerabilities with people I trust.",
      id: "Saya merasa relatif mudah untuk membagikan perasaan jujur dan sisi rentan saya kepada orang yang saya percayai.",
    },
    style: "secure",
  },
  {
    id: 3,
    text: {
      en: "I can comfortably balance intimacy in relationships with my own personal autonomy.",
      id: "Saya dapat dengan nyaman menyeimbangkan kedekatan hubungan emosional dengan kebebasan/kemandirian pribadi saya.",
    },
    style: "secure",
  },
  {
    id: 4,
    text: {
      en: "When conflicts arise, I feel confident discussing them constructively rather than withdrawing or lashing out.",
      id: "Saat terjadi konflik, saya percaya diri untuk mendiskusikannya secara konstruktif daripada menghindar atau meluapkan amarah.",
    },
    style: "secure",
  },
  {
    id: 5,
    text: {
      en: "I believe I am worthy of love and that people close to me genuinely care about my wellbeing.",
      id: "Saya meyakini bahwa diri saya berharga untuk dicintai dan orang terdekat tulus peduli pada kebahagiaan saya.",
    },
    style: "secure",
  },
  {
    id: 6,
    text: {
      en: "I feel comfortable offering warmth and emotional support when loved ones go through difficult times.",
      id: "Saya merasa nyaman memberikan kehangatan dan dukungan emosional saat orang terkasih melewati masa sulit.",
    },
    style: "secure",
  },

  // 7-12: Anxious / Preoccupied Attachment
  {
    id: 7,
    text: {
      en: "I often worry that people I care deeply about will lose interest in me or leave.",
      id: "Saya sering merasa cemas bahwa orang yang sangat saya sayangi akan kehilangan ketertarikan pada saya atau pergi.",
    },
    style: "anxious",
  },
  {
    id: 8,
    text: {
      en: "I frequently seek reassurance that my partner or friends still value our connection.",
      id: "Saya sering membutuhkan penegasan atau kepastian bahwa pasangan/teman masih menghargai hubungan kami.",
    },
    style: "anxious",
  },
  {
    id: 9,
    text: {
      en: "When a close person is slow to reply, I tend to overthink and assume something is wrong.",
      id: "Ketika orang terdekat lama membalas pesan, saya cenderung overthinking dan menduga ada sesuatu yang salah.",
    },
    style: "anxious",
  },
  {
    id: 10,
    text: {
      en: "I often want to be closer to others than they seem comfortable being with me.",
      id: "Saya sering mendambakan kedekatan yang lebih intens daripada tingkat kedekatan yang membuat orang lain nyaman.",
    },
    style: "anxious",
  },
  {
    id: 11,
    text: {
      en: "My mood is heavily influenced by how available and attentive my close connections are.",
      id: "Suasana hati saya sangat dipengaruhi oleh seberapa perhatian dan tersedianya orang terdekat bagi saya.",
    },
    style: "anxious",
  },
  {
    id: 12,
    text: {
      en: "I find myself sacrificing my personal boundaries to prevent conflict or emotional distance.",
      id: "Saya mendapati diri saya kerap mengorbankan batasan pribadi demi mencegah konflik atau jarak emosional.",
    },
    style: "anxious",
  },

  // 13-18: Avoidant / Dismissive Attachment
  {
    id: 13,
    text: {
      en: "I feel uncomfortable when someone tries to get too emotionally close to me.",
      id: "Saya merasa risih atau tidak nyaman saat seseorang berusaha terlalu dekat secara emosional dengan saya.",
    },
    style: "avoidant",
  },
  {
    id: 14,
    text: {
      en: "I strongly prefer dealing with emotional stress entirely on my own rather than asking for support.",
      id: "Saya sangat memilih menghadapi tekanan emosional sendirian daripada meminta bantuan atau dukungan orang lain.",
    },
    style: "avoidant",
  },
  {
    id: 15,
    text: {
      en: "I value my independence and self-reliance above emotional closeness in relationships.",
      id: "Saya menempatkan kemandirian dan kebebasan diri di atas kedekatan emosional dalam hubungan.",
    },
    style: "avoidant",
  },
  {
    id: 16,
    text: {
      en: "When someone demands emotional intimacy, my instinct is to pull away or create distance.",
      id: "Ketika seseorang menuntut keintiman emosional, naluri pertama saya adalah mundur dan menjaga jarak.",
    },
    style: "avoidant",
  },
  {
    id: 17,
    text: {
      en: "I find it difficult to fully trust people or let my guard down around partners.",
      id: "Saya merasa sulit untuk mempercayai orang lain sepenuhnya atau menurunkan benteng pertahanan diri saya.",
    },
    style: "avoidant",
  },
  {
    id: 18,
    text: {
      en: "I tend to downplay emotional problems and focus on logical or practical solutions instead.",
      id: "Saya cenderung meremehkan masalah emosional dan lebih memilih fokus pada solusi logis atau praktis saja.",
    },
    style: "avoidant",
  },

  // 19-24: Fearful-Avoidant / Disorganized Attachment
  {
    id: 19,
    text: {
      en: "I crave deep emotional closeness, but simultaneously feel frightened and unsafe when it occurs.",
      id: "Saya sangat menginginkan kedekatan emosional mendalam, namun bersamaan dengan itu merasa takut dan tidak aman saat itu terjadi.",
    },
    style: "fearfulAvoidant",
  },
  {
    id: 20,
    text: {
      en: "I worry that if I let someone get truly close, they will inevitably hurt or betray me.",
      id: "Saya khawatir jika membiarkan seseorang benar-benar dekat, mereka pada akhirnya pasti akan menyakiti atau mengecewakan saya.",
    },
    style: "fearfulAvoidant",
  },
  {
    id: 21,
    text: {
      en: "I experience an internal push-and-pull between wanting connection and wanting to flee.",
      id: "Saya merasakan pergolakan batin antara keinginan untuk terhubung dan dorongan kuat untuk melarikan diri.",
    },
    style: "fearfulAvoidant",
  },
  {
    id: 22,
    text: {
      en: "I struggle to feel settled in relationships, swinging between intense passion and emotional retreat.",
      id: "Saya sulit merasa tenang dalam hubungan, sering terombang-ambing antara keterikatan intens dan penarikan diri mendadak.",
    },
    style: "fearfulAvoidant",
  },
  {
    id: 23,
    text: {
      en: "When feeling vulnerable, I sometimes push people away even when I secretly want comfort.",
      id: "Saat merasa rapuh, terkadang saya justru mendorong orang lain menjauh meskipun dalam hati sangat menginginkan rasa nyaman.",
    },
    style: "fearfulAvoidant",
  },
  {
    id: 24,
    text: {
      en: "I find it challenging to trust my own judgment about whether a relationship is safe.",
      id: "Saya merasa sulit mempercayai penilaian diri sendiri mengenai apakah suatu hubungan benar-benar aman bagi saya.",
    },
    style: "fearfulAvoidant",
  },
];

export const ATTACHMENT_SCALE_OPTIONS_I18N = {
  en: [
    { value: 1, label: "Strongly Disagree" },
    { value: 2, label: "Disagree" },
    { value: 3, label: "Neutral" },
    { value: 4, label: "Agree" },
    { value: 5, label: "Strongly Agree" },
  ],
  id: [
    { value: 1, label: "Sangat Tidak Sesuai" },
    { value: 2, label: "Tidak Sesuai" },
    { value: 3, label: "Netral / Ragu" },
    { value: 4, label: "Sesuai" },
    { value: 5, label: "Sangat Sesuai" },
  ],
};

export const STYLE_INFO_I18N: Record<
  ToolLanguage,
  Record<
    AttachmentStyleKey,
    {
      name: string;
      description: string;
      coreBelief: string;
      relationalStrengths: string[];
      growthOpportunities: string[];
    }
  >
> = {
  en: {
    secure: {
      name: "Secure Attachment",
      description:
        "Characterized by comfort with emotional intimacy, constructive communication, and healthy boundaries. Secure patterns support mutual trust and emotional availability.",
      coreBelief:
        "I am worthy of love, and others are generally dependable and trustworthy.",
      relationalStrengths: [
        "Direct, non-defensive communication during conflict",
        "Comfortable giving and receiving emotional support",
        "Maintains personal identity while nurturing closeness",
      ],
      growthOpportunities: [
        "Continue offering patience to partners with different attachment adaptations",
        "Practice deepening emotional nuance across varied life stages",
      ],
    },
    anxious: {
      name: "Anxious (Preoccupied) Attachment",
      description:
        "Characterized by a strong desire for close intimacy alongside heightened sensitivity to perceived distance, rejection, or changes in emotional availability.",
      coreBelief:
        "I deeply want connection, but I worry that others will not stay or value me as much as I value them.",
      relationalStrengths: [
        "High emotional investment and dedication to relationships",
        "Attuned to relational subtleties and emotional atmospheres",
        "Generous with affection, empathy, and devotion",
      ],
      growthOpportunities: [
        "Cultivate self-soothing practices before reacting to delayed responses",
        "Build a rich personal foundation outside the relationship",
        "Communicate needs clearly rather than testing for reassurance",
      ],
    },
    avoidant: {
      name: "Avoidant (Dismissive) Attachment",
      description:
        "Characterized by high self-reliance, emotional privacy, and a preference for maintaining independence over deep vulnerability.",
      coreBelief:
        "I am safest when I depend on myself and keep emotional expectations minimal.",
      relationalStrengths: [
        "Strong self-sufficiency, stability, and crisis resilience",
        "Calm, rational problem-solving during emotional turmoil",
        "Respects individual autonomy and personal space",
      ],
      growthOpportunities: [
        "Practice naming internal emotional states in safe increments",
        "Recognize that mutual inter-dependence is a strength, not a weakness",
        "Communicate when needing space rather than abruptly disengaging",
      ],
    },
    fearfulAvoidant: {
      name: "Fearful-Avoidant (Disorganized) Attachment",
      description:
        "Characterized by a conflicted orientation toward connection: deeply craving intimacy while simultaneously anticipating emotional hurt or betrayal.",
      coreBelief:
        "I want closeness, but getting too close feels dangerous and unpredictable.",
      relationalStrengths: [
        "Deep capacity for empathy and emotional understanding",
        "Intuitive awareness of relational complexities",
        "Resilience developed through navigating complex inner emotions",
      ],
      growthOpportunities: [
        "Develop somatic grounding to manage fight-or-flight triggers in intimacy",
        "Pace relationship milestones gradually to build earned trust",
        "Practice self-compassion during push-pull emotional waves",
      ],
    },
  },
  id: {
    secure: {
      name: "Kelekatan Aman (Secure Attachment)",
      description:
        "Ditandai dengan kenyamanan terhadap keintiman emosional, komunikasi yang terbuka dan konstruktif, serta batasan diri yang sehat. Mendukung rasa saling percaya dan keterbukaan emosional.",
      coreBelief:
        "Saya berharga untuk dicintai, dan orang lain pada umumnya dapat dipercaya dan diandalkan.",
      relationalStrengths: [
        "Komunikasi lugas dan tidak defensif saat menyelesaikan konflik",
        "Nyaman memberi dan menerima dukungan emosional",
        "Mampu menjaga identitas pribadi sembari merawat kehangatan hubungan",
      ],
      growthOpportunities: [
        "Pertahankan kesabaran saat berhadapan dengan pasangan yang memiliki gaya kelekatan berbeda",
        "Terus kembangkan pemahaman emosi mendalam di berbagai fase kehidupan",
      ],
    },
    anxious: {
      name: "Kelekatan Cemas (Anxious Attachment)",
      description:
        "Ditandai dengan keinginan kuat akan kedekatan intens yang disertai rasa cemas berlebih terhadap jarak emosional, penolakan, atau keterlambatan respons pasangan.",
      coreBelief:
        "Saya sangat menginginkan keintiman, namun khawatir orang lain tidak akan bertahan atau tidak memedulikan saya sebesar saya memedulikan mereka.",
      relationalStrengths: [
        "Investasi emosional yang tinggi dan kesetiaan mendalam pada hubungan",
        "Peka terhadap perubahan suasana hati dan dinamika relasi",
        "Penuh kehangatan, empati, dan kepedulian tulus",
      ],
      growthOpportunities: [
        "Latih teknik menenangkan diri sendiri (self-soothing) sebelum bereaksi terhadap keterlambatan balasan pesan",
        "Bangun fondasi hobi dan kehidupan mandiri yang kaya di luar hubungan",
        "Ungkapkan kebutuhan secara lugas dan tenang tanpa perlu menguji pasangan",
      ],
    },
    avoidant: {
      name: "Kelekatan Menghindar (Avoidant Attachment)",
      description:
        "Ditandai dengan kemandirian tinggi, privasi emosi yang ketat, dan kecenderungan menjaga jarak aman daripada membuka kerentanan emosional.",
      coreBelief:
        "Saya paling aman ketika hanya bergantung pada diri sendiri dan membatasi ekspektasi emosi pada orang lain.",
      relationalStrengths: [
        "Kemandirian yang tangguh, ketenangan diri, dan resiliensi saat krisis",
        "Penyelesaian masalah yang logis, objektif, dan terstruktur",
        "Sangat menghargai ruang pribadi dan otonomi masing-masing",
      ],
      growthOpportunities: [
        "Latih mengenali dan mengungkapkan perasaan secara bertahap dalam suasana yang aman",
        "Pahami bahwa saling bergantung secara sehat (interdependensi) adalah kekuatan, bukan kelemahan",
        "Komunikasikan saat membutuhkan ruang sendiri daripada menghilang secara tiba-tiba",
      ],
    },
    fearfulAvoidant: {
      name: "Kelekatan Menghindar-Takut (Fearful-Avoidant)",
      description:
        "Ditandai dengan dinamika batin yang tarik-ulur: sangat mendambakan cinta dan keintiman, namun bersamaan dengan itu sangat takut disakiti, dikhianati, atau ditinggalkan.",
      coreBelief:
        "Saya ingin dekat, tetapi membiarkan seseorang terlalu dekat terasa berbahaya dan tidak dapat diprediksi.",
      relationalStrengths: [
        "Kapasitas empati yang sangat mendalam dan peka rasa",
        "Kesadaran intuitif yang tajam terhadap kompleksitas relasi",
        "Resiliensi batin yang terbentuk dari pengalaman menavigasi emosi yang kompleks",
      ],
      growthOpportunities: [
        "Kembangkan teknik grounding tubuh untuk mengelola rasa panik atau dorongan kabur saat mendekat",
        "Atur ritme perkembangan hubungan secara bertahap untuk membangun rasa percaya yang kokoh",
        "Terapkan welas asih pada diri sendiri (self-compassion) saat mengalami gejolak tarik-ulur emosi",
      ],
    },
  },
};

export function calculateAttachmentScore(
  answers: Record<number, number>,
  lang: ToolLanguage = "en",
): AttachmentResult {
  const sums: Record<AttachmentStyleKey, number> = {
    secure: 0,
    anxious: 0,
    avoidant: 0,
    fearfulAvoidant: 0,
  };

  const counts: Record<AttachmentStyleKey, number> = {
    secure: 0,
    anxious: 0,
    avoidant: 0,
    fearfulAvoidant: 0,
  };

  ATTACHMENT_QUESTIONS.forEach((q) => {
    const val = answers[q.id] ?? 3;
    sums[q.style] += val;
    counts[q.style] += 1;
  });

  const scores = {} as Record<AttachmentStyleKey, AttachmentStyleScore>;
  const infoMap = STYLE_INFO_I18N[lang];

  (Object.keys(sums) as AttachmentStyleKey[]).forEach((style) => {
    const count = counts[style] || 6;
    const minPossible = count * 1;
    const maxPossible = count * 5;
    const sum = sums[style];

    const percentage = Math.round(
      ((sum - minPossible) / (maxPossible - minPossible)) * 100,
    );

    scores[style] = {
      key: style,
      name: infoMap[style].name,
      percentage,
      description: infoMap[style].description,
      coreBelief: infoMap[style].coreBelief,
      relationalStrengths: infoMap[style].relationalStrengths,
      growthOpportunities: infoMap[style].growthOpportunities,
    };
  });

  const sorted = Object.values(scores).sort(
    (a, b) => b.percentage - a.percentage,
  );
  const dominantStyle = sorted[0];

  const overallSummary =
    lang === "id"
      ? `Respons Anda menunjukkan bahwa orientasi relasi utama Anda saat ini paling dominan mengarah pada ${dominantStyle.name} (${dominantStyle.percentage}%). Gaya kelekatan bersifat adaptif dan dapat berkembang menuju kelekatan yang lebih aman (earned security) melalui kesadaran diri dan pengalaman hubungan yang sehat.`
      : `Your responses suggest that your primary relational orientation currently aligns most strongly with ${dominantStyle.name} (${dominantStyle.percentage}%). Attachment styles are dynamic strategies rather than rigid identities, often evolving toward earned security through self-awareness and healthy relational experiences.`;

  return {
    scores,
    dominantStyle,
    overallSummary,
  };
}
