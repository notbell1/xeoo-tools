import type { ToolLanguage } from "./psychologyI18n";

export type RelPatternKey =
  | "collaborative"
  | "autonomous"
  | "harmony"
  | "reflective";

export interface RelScenarioOption {
  id: string;
  pattern: RelPatternKey;
  text: {
    en: string;
    id: string;
  };
}

export interface RelScenarioQuestion {
  id: number;
  situation: {
    en: string;
    id: string;
  };
  options: RelScenarioOption[];
}

export interface RelPatternScore {
  key: RelPatternKey;
  name: string;
  percentage: number;
  description: string;
  strengths: string[];
  challenges: string[];
  reflectionPrompts: string[];
  actionSuggestions: string[];
}

export interface RelPatternResult {
  scores: Record<RelPatternKey, RelPatternScore>;
  primaryPattern: RelPatternScore;
  secondaryPattern: RelPatternScore;
  overallSummary: string;
}

export const REL_QUESTIONS: RelScenarioQuestion[] = [
  {
    id: 1,
    situation: {
      en: "Your partner or close friend seems unusually distant throughout the day. What is your typical response?",
      id: "Pasangan atau teman dekat Anda tampak lebih dingin atau berjarak sepanjang hari. Apa respon paling alami Anda?",
    },
    options: [
      {
        id: "a",
        pattern: "collaborative",
        text: {
          en: "Gently ask if everything is alright and suggest a calm talk whenever they are ready.",
          id: "Menanyakan dengan santun apakah semua baik-baik saja dan mengajak mengobrol saat mereka siap.",
        },
      },
      {
        id: "b",
        pattern: "autonomous",
        text: {
          en: "Assume they need personal space and continue focusing on your own daily priorities without worry.",
          id: "Menganggap mereka butuh ruang pribadi dan tetap fokus menyelesaikan urusan harian saya tanpa cemas.",
        },
      },
      {
        id: "c",
        pattern: "harmony",
        text: {
          en: "Try extra hard to be warm and attentive to restore a harmonious atmosphere quickly.",
          id: "Berusaha lebih ramah dan perhatian demi memulihkan suasana hangat secepat mungkin.",
        },
      },
      {
        id: "d",
        pattern: "reflective",
        text: {
          en: "Silently observe their patterns for a while to understand the underlying cause before saying anything.",
          id: "Mengamati dinamika dan pola situasi secara tenang sebelum memutuskan untuk berbicara.",
        },
      },
    ],
  },
  {
    id: 2,
    situation: {
      en: "A minor disagreement arises about how to spend the weekend together. How do you approach this?",
      id: "Terjadi ketidaksepakatan kecil tentang bagaimana menghabiskan akhir pekan bersama. Bagaimana Anda menyikapinya?",
    },
    options: [
      {
        id: "a",
        pattern: "collaborative",
        text: {
          en: "Put forward options and look for a creative middle ground where both feel valued.",
          id: "Mengajukan berbagai opsi dan mencari kompromi kreatif agar kedua pihak merasa senang.",
        },
      },
      {
        id: "b",
        pattern: "autonomous",
        text: {
          en: "Suggest doing separate activities if preferences differ, seeing no problem in taking personal time.",
          id: "Menyarankan aktivitas terpisah jika selera berbeda, tanpa merasa hal itu mengurangi keintiman.",
        },
      },
      {
        id: "c",
        pattern: "harmony",
        text: {
          en: "Prioritize their preference to keep the mood pleasant and avoid unnecessary tension.",
          id: "Cenderung mengalah pada keinginan mereka agar suasana tetap menyenangkan tanpa friksi.",
        },
      },
      {
        id: "d",
        pattern: "reflective",
        text: {
          en: "Take a step back to reflect on why this plan matters to each person before discussing it further.",
          id: "Berhenti sejenak untuk menimbang apa makna rencana tersebut bagi masing-masing orang.",
        },
      },
    ],
  },
  {
    id: 3,
    situation: {
      en: "You are going through a particularly stressful week at work or study. How do you communicate this to your close companion?",
      id: "Anda sedang menghadapi minggu yang sangat berat dalam urusan kerja atau studi. Bagaimana Anda menyampaikannya?",
    },
    options: [
      {
        id: "a",
        pattern: "collaborative",
        text: {
          en: "Openly share that you are overwhelmed and clearly explain what kind of support would help.",
          id: "Menceritakan secara terbuka beban yang dihadapi dan menjelaskan bentuk dukungan yang dibutuhkan.",
        },
      },
      {
        id: "b",
        pattern: "autonomous",
        text: {
          en: "Handle most of the burden on your own first, sharing updates only after the storm passes.",
          id: "Menyelesaikan sebagian besar beban secara mandiri terlebih dahulu baru menceritakannya.",
        },
      },
      {
        id: "c",
        pattern: "harmony",
        text: {
          en: "Try not to burden them too much, ensuring their needs are still met despite your stress.",
          id: "Berusaha tidak terlalu membebani mereka dan tetap memastikan kebutuhan mereka terpenuhi.",
        },
      },
      {
        id: "d",
        pattern: "reflective",
        text: {
          en: "Filter your thoughts through journaling or introspection before expressing the key points.",
          id: "Mencerna dan memilah perasaan sendiri terlebih dahulu sebelum menyampaikan poin-poin intinya.",
        },
      },
    ],
  },
  {
    id: 4,
    situation: {
      en: "Your friend or partner expresses constructive feedback about something you did. What is your initial internal reaction?",
      id: "Sahabat atau pasangan menyampaikan masukan konstruktif tentang sikap Anda. Apa reaksi internal pertama Anda?",
    },
    options: [
      {
        id: "a",
        pattern: "collaborative",
        text: {
          en: "Welcome the honesty, ask clarifying questions, and discuss how to adjust together.",
          id: "Menyambut kejujuran tersebut, mengajukan klarifikasi, dan mendiskusikan langkah penyesuaian bersama.",
        },
      },
      {
        id: "b",
        pattern: "autonomous",
        text: {
          en: "Assess the validity rationally and independently decide whether any personal change is warranted.",
          id: "Menilai validitas kritik secara rasional dan mandiri memutuskan apakah ada hal yang perlu diubah.",
        },
      },
      {
        id: "c",
        pattern: "harmony",
        text: {
          en: "Feel immediate concern about hurting the bond and reassure them that you will fix it.",
          id: "Merasa khawatir telah mencederai relasi dan segera meyakinkan mereka bahwa Anda akan memperbaikinya.",
        },
      },
      {
        id: "d",
        pattern: "reflective",
        text: {
          en: "Internalize the comment deeply, looking for the underlying context before reacting.",
          id: "Meresapi masukan tersebut secara mendalam untuk memahami konteks sebelum memberi respon.",
        },
      },
    ],
  },
  {
    id: 5,
    situation: {
      en: "When receiving unexpected praise or deep affection, what feels most natural to you?",
      id: "Saat menerima pujian mendalam atau ungkapan kasih sayang yang hangat, respon apa yang paling alami bagi Anda?",
    },
    options: [
      {
        id: "a",
        pattern: "collaborative",
        text: {
          en: "Warmly reciprocate and express mutual appreciation for the bond you share.",
          id: "Membalas dengan hangat dan saling mengapresiasi hubungan yang telah dibangun bersama.",
        },
      },
      {
        id: "b",
        pattern: "autonomous",
        text: {
          en: "Appreciate it quietly, but feel slightly protective of maintaining your inner self-sufficiency.",
          id: "Menghargainya secara tenang, namun tetap merasa nyaman menjaga ruang kemandirian batin.",
        },
      },
      {
        id: "c",
        pattern: "harmony",
        text: {
          en: "Feel deeply relieved and happy that the connection feels solid and affectionate.",
          id: "Merasa sangat lega dan bahagia bahwa ikatan relasi terasa kokoh dan penuh kehangatan.",
        },
      },
      {
        id: "d",
        pattern: "reflective",
        text: {
          en: "Ponder the sincerity and depth behind the words, savoring the emotional significance.",
          id: "Merenungkan ketulusan dan makna di balik kata-kata tersebut sembari menikmatinya.",
        },
      },
    ],
  },
  {
    id: 6,
    situation: {
      en: "You notice that your close companion hasn't followed through on a promised commitment. How do you address it?",
      id: "Anda melihat teman atau pasangan belum menepati janji yang dibuat bersama. Bagaimana Anda membicarakannya?",
    },
    options: [
      {
        id: "a",
        pattern: "collaborative",
        text: {
          en: "Bring it up directly but without blame, exploring what obstacles got in the way.",
          id: "Mengangkatnya secara lugas tanpa menyalahkan, mencari tahu kendala apa yang terjadi.",
        },
      },
      {
        id: "b",
        pattern: "autonomous",
        text: {
          en: "Take care of the task yourself if necessary, then later remind them calmly about expectations.",
          id: "Menyelesaikan sendiri hal tersebut bila mendesak, lalu mengingatkan kembali ekspektasi bersama.",
        },
      },
      {
        id: "c",
        pattern: "harmony",
        text: {
          en: "Wait for a comfortable moment so you don't create awkwardness or pressure them.",
          id: "Menunggu waktu yang tepat dan santai agar tidak menimbulkan kecanggungan atau tekanan.",
        },
      },
      {
        id: "d",
        pattern: "reflective",
        text: {
          en: "Consider whether their workload or emotional state contributed to the delay before asking.",
          id: "Menimbang apakah beban kerja atau kondisi mental mereka memengaruhi keterlambatan tersebut.",
        },
      },
    ],
  },
  {
    id: 7,
    situation: {
      en: "Your social circle invites you to an event, but you are physically drained. What do you do?",
      id: "Lingkaran pertemanan mengajak berkumpul, namun fisik Anda sedang sangat lelah. Apa yang Anda lakukan?",
    },
    options: [
      {
        id: "a",
        pattern: "collaborative",
        text: {
          en: "Honestly decline with warmth and immediately propose another date to catch up.",
          id: "Menolak dengan jujur dan hangat, lalu menawarkan jadwal lain untuk bertemu.",
        },
      },
      {
        id: "b",
        pattern: "autonomous",
        text: {
          en: "Decisively decline to recharge alone, confident that true bonds understand rest.",
          id: "Menolak dengan tegas untuk memulihkan energi sendiri, yakin bahwa relasi yang baik akan memahaminya.",
        },
      },
      {
        id: "c",
        pattern: "harmony",
        text: {
          en: "Feel torn between your fatigue and the fear of letting them down, possibly forcing yourself to show up.",
          id: "Bimbang antara kelelahan dan rasa sungkan, kadang memaksakan diri hadir demi menjaga perasaan mereka.",
        },
      },
      {
        id: "d",
        pattern: "reflective",
        text: {
          en: "Gauge your energy boundaries and send a thoughtful message explaining your need for solitude.",
          id: "Mengevaluasi kapasitas energi diri dan mengirim pesan penuh pengertian tentang kebutuhan istirahat.",
        },
      },
    ],
  },
  {
    id: 8,
    situation: {
      en: "During an emotional conversation, the other person becomes tearful or upset. What is your instinctive focus?",
      id: "Dalam percakapan emosional, lawan bicara mulai menangis atau tampak terluka. Di mana fokus naluriah Anda?",
    },
    options: [
      {
        id: "a",
        pattern: "collaborative",
        text: {
          en: "Sit beside them, listen attentively, and ask what they need right now: presence or advice.",
          id: "Mendampingi mereka, mendengarkan penuh perhatian, dan menanyakan apakah mereka butuh kehadiran atau solusi.",
        },
      },
      {
        id: "b",
        pattern: "autonomous",
        text: {
          en: "Offer respectful presence while maintaining emotional boundaries so you don't absorb their distress.",
          id: "Memberi ruang dengan hormat sembari menjaga batas emosional agar tidak larut dalam beban mereka.",
        },
      },
      {
        id: "c",
        pattern: "harmony",
        text: {
          en: "Instinctively rush to soothe them, feeling deep urgency to restore their emotional comfort.",
          id: "Naluri saya segera menenangkan mereka, merasa perlu memastikan mereka kembali nyaman secepatnya.",
        },
      },
      {
        id: "d",
        pattern: "reflective",
        text: {
          en: "Hold a calm, non-judgmental space, silently processing the emotional weight of what was shared.",
          id: "Menyediakan ruang hening tanpa penghakiman sembari meresapi bobot emosi yang diungkapkan.",
        },
      },
    ],
  },
  {
    id: 9,
    situation: {
      en: "How do you usually handle sharing personal boundaries (e.g. privacy, time, money) with those close to you?",
      id: "Bagaimana Anda biasanya mengomunikasikan batasan pribadi (waktu, privasi, finansial) pada orang terdekat?",
    },
    options: [
      {
        id: "a",
        pattern: "collaborative",
        text: {
          en: "State them early and clearly as a mutual practice that helps both of us thrive.",
          id: "Menyatakannya sejak awal sebagai kesepakatan bersama yang membuat hubungan sehat.",
        },
      },
      {
        id: "b",
        pattern: "autonomous",
        text: {
          en: "Maintain strong independent boundaries naturally, expecting mutual respect for autonomy.",
          id: "Menjaga batas kemandirian secara alami dan mengharapkan penghormatan timbal balik.",
        },
      },
      {
        id: "c",
        pattern: "harmony",
        text: {
          en: "Find it slightly uncomfortable to draw hard lines, preferring flexible accommodations.",
          id: "Merasa sedikit sungkan menetapkan batas tegas, lebih memilih fleksibilitas untuk kenyamanan bersama.",
        },
      },
      {
        id: "d",
        pattern: "reflective",
        text: {
          en: "Examine carefully why each boundary exists and convey it with thoughtful consideration.",
          id: "Menimbang dengan cermat alasan di balik batasan tersebut sebelum menyampaikannya secara santun.",
        },
      },
    ],
  },
  {
    id: 10,
    situation: {
      en: "When a relational conflict has officially settled, how do you feel in the following days?",
      id: "Ketika suatu konflik relasi telah diselesaikan secara damai, bagaimana perasaan Anda pada hari-hari berikutnya?",
    },
    options: [
      {
        id: "a",
        pattern: "collaborative",
        text: {
          en: "Feel refreshed and check in periodically to ensure the resolution remains on track.",
          id: "Merasa lega dan melakukan check-in berkala untuk memastikan solusi tetap berjalan baik.",
        },
      },
      {
        id: "b",
        pattern: "autonomous",
        text: {
          en: "Move on quickly without dwelling, returning smoothly to your personal rhythm.",
          id: "Cepat melangkah maju tanpa mengungkit kembali, kembali ke ritme rutinitas pribadi.",
        },
      },
      {
        id: "c",
        pattern: "harmony",
        text: {
          en: "Seek subtle confirmation that no lingering negative sentiment remains between you.",
          id: "Mencari konfirmasi halus bahwa tidak ada sisa rasa kesal yang tertinggal di antara kami.",
        },
      },
      {
        id: "d",
        pattern: "reflective",
        text: {
          en: "Reflect on what lessons the disagreement taught both of you about your relational dynamics.",
          id: "Merenungkan pelajaran apa yang didapat dari perbedaan tersebut mengenai dinamika hubungan.",
        },
      },
    ],
  },
];

const PATTERN_META: Record<
  RelPatternKey,
  {
    name: { en: string; id: string };
    description: { en: string; id: string };
    strengths: { en: string[]; id: string[] };
    challenges: { en: string[]; id: string[] };
    reflectionPrompts: { en: string[]; id: string[] };
    actionSuggestions: { en: string[]; id: string[] };
  }
> = {
  collaborative: {
    name: {
      en: "Collaborative & Expressive",
      id: "Kolaboratif & Ekspresif",
    },
    description: {
      en: "You approach interpersonal relationships with clear communication, mutual problem-solving, and a focus on building shared solutions.",
      id: "Anda menjalani hubungan interpersonal dengan komunikasi terbuka, penyelesaian masalah bersama, dan fokus pada kesepakatan yang saling menguntungkan.",
    },
    strengths: {
      en: [
        "Direct and proactive communication",
        "Willingness to seek mutual win-win compromises",
        "Transparent about needs and mutual expectations",
      ],
      id: [
        "Komunikasi yang lugas dan proaktif",
        "Kesiapan mencari kompromi yang menguntungkan kedua pihak",
        "Transparan mengenai kebutuhan dan ekspektasi bersama",
      ],
    },
    challenges: {
      en: [
        "May become frustrated when others avoid talking things through immediately",
        "Risk of over-analyzing disagreements when other people simply need time",
      ],
      id: [
        "Bisa merasa frustrasi jika lawan bicara memilih menunda pembicaraan",
        "Risiko terlalu mendalami analisis masalah saat orang lain hanya butuh waktu jeda",
      ],
    },
    reflectionPrompts: {
      en: [
        "How do you feel when someone asks for emotional space before solving a dispute?",
        "Are there moments where listening quietly is more powerful than immediate discussion?",
      ],
      id: [
        "Bagaimana perasaan Anda ketika seseorang meminta jeda sebelum menyelesaikan konflik?",
        "Apakah ada momen di mana sekadar mendengarkan lebih dibutuhkan dibanding langsung berdiskusi?",
      ],
    },
    actionSuggestions: {
      en: [
        "Practice honoring the other person's processing time before initiating follow-up talks.",
        "Acknowledge that not all relational moments require a formal resolution.",
      ],
      id: [
        "Latih menghargai waktu jeda orang lain sebelum memulai percakapan tindak lanjut.",
        "Ingat bahwa tidak semua dinamika relasi memerlukan kesepakatan formal seketika.",
      ],
    },
  },
  autonomous: {
    name: {
      en: "Autonomous & Grounded",
      id: "Mandiri & Berakar Kuat",
    },
    description: {
      en: "You value healthy personal independence, emotional self-sufficiency, and clear individual boundaries within close connections.",
      id: "Anda sangat menghargai kemandirian pribadi, kecukupan diri secara emosional, dan batasan individual yang jelas dalam hubungan dekat.",
    },
    strengths: {
      en: [
        "Strong emotional resilience and self-reliance",
        "Comfortable providing and taking healthy space",
        "Low likelihood of creating codependent entanglements",
      ],
      id: [
        "Ketahanan emosional dan kemandirian batin yang kokoh",
        "Nyaman memberikan dan mengambil ruang pribadi",
        "Kecil kemungkinan terjebak dalam ketergantungan relasi yang berlebihan",
      ],
    },
    challenges: {
      en: [
        "May appear emotionally detached or unreadable during vulnerability moments",
        "Can default to solitary problem-solving even when mutual support is available",
      ],
      id: [
        "Dapat tampak kurang ekspresif pada momen kerentanan emosi",
        "Cenderung menyelesaikan masalah sendiri padahal orang terdekat siap mendukung",
      ],
    },
    reflectionPrompts: {
      en: [
        "What does asking for emotional help represent to your sense of strength?",
        "How might sharing minor struggles deepen trust with your companions?",
      ],
      id: [
        "Apa arti meminta bantuan emosional bagi rasa kemandirian Anda?",
        "Bagaimana membagikan beban kecil dapat memperdalam kepercayaan dengan orang terdekat?",
      ],
    },
    actionSuggestions: {
      en: [
        "Experiment with sharing a small current challenge before completely resolving it alone.",
        "Explicitly verbalize care so independence is not mistaken for disinterest.",
      ],
      id: [
        "Cobalah membagikan tantangan kecil kepada orang terdekat sebelum tuntas diselesaikan sendiri.",
        "Sampaikan apresiasi secara verbal agar kemandirian tidak disalahartikan sebagai ketidakpedulian.",
      ],
    },
  },
  harmony: {
    name: {
      en: "Harmony & Connection-Attuned",
      id: "Penyelaras & Peka Hubungan",
    },
    description: {
      en: "You place deep value on relational warmth, mutual comfort, and preserving peace and understanding between people.",
      id: "Anda sangat menjunjung kehangatan hubungan, kenyamanan emosional bersama, dan menjaga kedamaian serta pengertian antar manusia.",
    },
    strengths: {
      en: [
        "Deep empathy and genuine attentiveness to others' feelings",
        "Skillful at de-escalating tension and creating warmth",
        "High loyalty and investment in relationship wellbeing",
      ],
      id: [
        "Empati mendalam dan kepedulian tulus pada perasaan orang lain",
        "Keterampilan meredakan ketegangan dan menciptakan suasana ramah",
        "Kesetiaan dan komitmen tinggi terhadap keharmonisan relasi",
      ],
    },
    challenges: {
      en: [
        "Tendency to suppress personal boundaries or opinions to avoid friction",
        "Can feel disproportionate anxiety when emotional tone feels temporarily cool",
      ],
      id: [
        "Kecenderungan menahan opini atau batasan diri demi menghindari friksi",
        "Mudah merasa cemas saat suasana hubungan terasa agak dingin sementara waktu",
      ],
    },
    reflectionPrompts: {
      en: [
        "When you avoid speaking up to keep peace, what does that cost your inner comfort?",
        "Can healthy relationships withstand honest, gentle disagreements?",
      ],
      id: [
        "Saat Anda menahan suara demi kedamaian, apa dampaknya terhadap kenyamanan batin Anda?",
        "Dapatkah hubungan yang sehat justru bertumbuh lewat perbedaan pendapat yang santun?",
      ],
    },
    actionSuggestions: {
      en: [
        "Practice expressing one personal preference comfortably even when it differs from others.",
        "Remind yourself that temporary coolness in tone does not mean a bond is broken.",
      ],
      id: [
        "Latih menyatakan satu preferensi pribadi dengan tenang meski berbeda dari orang lain.",
        "Ingatkan diri bahwa perubahan suasana sesaat bukan berarti ikatan hubungan sedang retak.",
      ],
    },
  },
  reflective: {
    name: {
      en: "Reflective & Observant",
      id: "Reflektif & Mengamati",
    },
    description: {
      en: "You process relational dynamics through careful observation, deep empathy, and deliberate consideration before speaking or acting.",
      id: "Anda memproses dinamika relasi melalui pengamatan cermat, kehati-hatian, dan pertimbangan mendalam sebelum berucap atau bertindak.",
    },
    strengths: {
      en: [
        "Thoughtful, measured responses that prevent rash escalation",
        "Nuanced understanding of human motivations and context",
        "Patient, non-reactive presence in high-stress situations",
      ],
      id: [
        "Respon yang matang dan terukur sehingga mencegah eskalasi emosi",
        "Pemahaman bernuansa terhadap motif dan konteks orang lain",
        "Kehadiran yang tenang dan tidak reaktif dalam situasi menegangkan",
      ],
    },
    challenges: {
      en: [
        "May spend too long in internal contemplation, delaying necessary boundary talks",
        "Others might misinterpret calm introspection as emotional hesitation",
      ],
      id: [
        "Bisa terlalu lama merenungkan masalah sehingga menunda klarifikasi yang dibutuhkan",
        "Orang lain mungkin salah mengira ketenangan Anda sebagai keraguan emosional",
      ],
    },
    reflectionPrompts: {
      en: [
        "At what point does healthy reflection turn into overthinking and delay?",
        "How can you let companions know you are thinking through things without leaving them in suspense?",
      ],
      id: [
        "Pada titik mana perenungan yang sehat berubah menjadi overthinking yang menunda tindakan?",
        "Bagaimana memberi tahu orang terdekat bahwa Anda sedang berpikir tanpa membuat mereka menunggu?",
      ],
    },
    actionSuggestions: {
      en: [
        "State your thinking process aloud: 'I care about this and need a few hours to process my thoughts.'",
        "Set a personal timeframe after which you will initiate the conversation regardless of perfection.",
      ],
      id: [
        "Ucapkan proses Anda secara verbal: 'Saya peduli dengan hal ini dan butuh waktu sebentar untuk mencernanya.'",
        "Tentukan batas waktu pribadi untuk mulai berbicara tanpa menunggu pikiran 100% sempurna.",
      ],
    },
  },
};

export function calculateRelationshipPattern(
  answers: Record<number, string>,
  lang: ToolLanguage,
): RelPatternResult {
  const counts: Record<RelPatternKey, number> = {
    collaborative: 0,
    autonomous: 0,
    harmony: 0,
    reflective: 0,
  };

  REL_QUESTIONS.forEach((q) => {
    const selectedOptionId = answers[q.id];
    if (selectedOptionId) {
      const opt = q.options.find((o) => o.id === selectedOptionId);
      if (opt) {
        counts[opt.pattern] += 1;
      }
    }
  });

  const total = REL_QUESTIONS.length;
  const sortedKeys = (Object.keys(counts) as RelPatternKey[]).sort(
    (a, b) => counts[b] - counts[a],
  );

  const scores: Record<RelPatternKey, RelPatternScore> = {
    collaborative: createScoreObj("collaborative", counts.collaborative, total, lang),
    autonomous: createScoreObj("autonomous", counts.autonomous, total, lang),
    harmony: createScoreObj("harmony", counts.harmony, total, lang),
    reflective: createScoreObj("reflective", counts.reflective, total, lang),
  };

  const primaryKey = sortedKeys[0];
  const secondaryKey = sortedKeys[1];

  const overallSummary =
    lang === "id"
      ? `Gaya interaksi relasional utama Anda menunjukkan kecenderungan ${scores[primaryKey].name} (${scores[primaryKey].percentage}%), didukung oleh pola sekunder ${scores[secondaryKey].name} (${scores[secondaryKey].percentage}%). Pola ini mencerminkan cara Anda mengelola komunikasi, kedekatan, dan resolusi masalah dalam hubungan sehari-hari.`
      : `Your primary relational interaction pattern indicates a strong orientation toward ${scores[primaryKey].name} (${scores[primaryKey].percentage}%), accompanied by secondary traits of ${scores[secondaryKey].name} (${scores[secondaryKey].percentage}%). This reflects your natural approaches to communication, emotional proximity, and conflict resolution in everyday connections.`;

  return {
    scores,
    primaryPattern: scores[primaryKey],
    secondaryPattern: scores[secondaryKey],
    overallSummary,
  };
}

export const calculateRelPatternScore = calculateRelationshipPattern;

function createScoreObj(
  key: RelPatternKey,
  count: number,
  total: number,
  lang: ToolLanguage,
): RelPatternScore {
  const meta = PATTERN_META[key];
  const percentage = Math.round((count / total) * 100);

  return {
    key,
    name: meta.name[lang],
    percentage,
    description: meta.description[lang],
    strengths: meta.strengths[lang],
    challenges: meta.challenges[lang],
    reflectionPrompts: meta.reflectionPrompts[lang],
    actionSuggestions: meta.actionSuggestions[lang],
  };
}

