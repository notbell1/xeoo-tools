import type { ToolLanguage } from "./psychologyI18n";

export type AwarenessDimKey =
  | "granular"
  | "somatic"
  | "trigger_tracing"
  | "reflective";

export interface AwarenessScenarioOption {
  id: string;
  dimension: AwarenessDimKey;
  text: {
    en: string;
    id: string;
  };
}

export interface AwarenessScenarioQuestion {
  id: number;
  situation: {
    en: string;
    id: string;
  };
  options: AwarenessScenarioOption[];
}

export interface AwarenessScore {
  key: AwarenessDimKey;
  name: string;
  percentage: number;
  description: string;
  strengths: string[];
  challenges: string[];
  reflectionPrompts: string[];
  actionSuggestions: string[];
}

export interface AwarenessResult {
  scores: Record<AwarenessDimKey, AwarenessScore>;
  primaryDimension: AwarenessScore;
  secondaryDimension: AwarenessScore;
  overallSummary: string;
}

export const AWARENESS_QUESTIONS: AwarenessScenarioQuestion[] = [
  {
    id: 1,
    situation: {
      en: "You wake up on a Tuesday morning feeling an unspecified heavy mood. How do you identify what you are feeling?",
      id: "Anda terbangun di suatu pagi dengan perasaan murung atau berat yang samar. Bagaimana Anda mengenali apa yang sedang Anda rasakan?",
    },
    options: [
      {
        id: "a",
        dimension: "granular",
        text: {
          en: "Pinpoint the exact nuanced emotional blend: not just 'bad', but a mix of lethargy, mild melancholy, and apprehension.",
          id: "Membedah nuansa emosinya secara spesifik: bukan sekadar 'buruk', melainkan campuran rasa lesu, sedikit melankolis, dan gamang.",
        },
      },
      {
        id: "b",
        dimension: "somatic",
        text: {
          en: "Scan your body: notice tightness in the chest, shallow breathing, or heaviness behind your eyes.",
          id: "Memindai tubuh: menyadari sesak di dada, napas yang dangkal, atau rasa berat di belakang mata.",
        },
      },
      {
        id: "c",
        dimension: "trigger_tracing",
        text: {
          en: "Trace yesterday's events: which unfinished conversation or impending deadline triggered this lingering residue?",
          id: "Menelusuri peristiwa kemarin: percakapan apa yang belum tuntas atau tenggat apa yang memicu sisa rasa ini?",
        },
      },
      {
        id: "d",
        dimension: "reflective",
        text: {
          en: "Observe the mood like passing weather: acknowledging that feelings ebb and flow without defining your day.",
          id: "Mengamati suasana hati seperti cuaca yang lewat: menyadari perasaan datang dan pergi tanpa mendikte keseluruhan hari.",
        },
      },
    ],
  },
  {
    id: 2,
    situation: {
      en: "A colleague or acquaintance announces a major success on social media, and you feel an uncomfortable ping. What do you notice?",
      id: "Seorang rekan atau kenalan mengumumkan kesuksesan besar di media sosial, dan Anda merasakan getaran tidak nyaman. Apa yang Anda sadari?",
    },
    options: [
      {
        id: "a",
        dimension: "granular",
        text: {
          en: "Differentiate between envy, self-doubt, and genuine admiration: 'I feel envious of their timing, yet inspired by their tenacity.'",
          id: "Membedakan antara rasa iri, keraguan diri, dan kekaguman tulus: 'Aku iri dengan momentumnya, namun terinspirasi oleh kegigihannya.'",
        },
      },
      {
        id: "b",
        dimension: "somatic",
        text: {
          en: "Notice the visceral physical reaction: a sudden drop in your stomach and constriction around your throat.",
          id: "Menyadari reaksi fisik: sensasi berdesir di perut dan ketegangan di area tenggorokan.",
        },
      },
      {
        id: "c",
        dimension: "trigger_tracing",
        text: {
          en: "Unpack what this triggers: recognizing that their milestone touched your own unmet desire to be seen and validated.",
          id: "Membongkar pemicunya: menyadari pencapaian mereka menyentuh keinginan terdalam Anda sendiri untuk diakui dan diapresiasi.",
        },
      },
      {
        id: "d",
        dimension: "reflective",
        text: {
          en: "Remind yourself that comparative feelings are natural human signals, not an indicator of malice or moral inadequacy.",
          id: "Mengingatkan diri bahwa rasa membandingkan adalah sinyal alami manusiawi, bukan tanda kebencian atau cacat moral.",
        },
      },
    ],
  },
  {
    id: 3,
    situation: {
      en: "In the middle of a busy workday, you suddenly realize you are speaking curtly to those around you. How do you assess your state?",
      id: "Di tengah jam kerja yang sibuk, Anda menyadari bicara Anda menjadi ketus kepada orang di sekitar. Bagaimana Anda menilai keadaan diri?",
    },
    options: [
      {
        id: "a",
        dimension: "granular",
        text: {
          en: "Clarify the precise emotional texture: distinguishing irritation from sensory overstimulation and hunger.",
          id: "Memperjelas nuansa emosinya: membedakan rasa jengkel dari kelebihan stimulasi sensorik (overstimulation) dan rasa lapar.",
        },
      },
      {
        id: "b",
        dimension: "somatic",
        text: {
          en: "Feel the clenched jaw, elevated shoulders, and rapid shallow pulse driving your clipped tone.",
          id: "Merasakan rahang yang mengunci, bahu terangkat tegang, dan denyut nadi cepat yang memicu nada bicara ketus.",
        },
      },
      {
        id: "c",
        dimension: "trigger_tracing",
        text: {
          en: "Identify the root cause: you committed to three overlapping requests without setting boundaries.",
          id: "Mengidentifikasi akar penyebabnya: Anda mengiyakan tiga tugas bertubrukan tanpa menetapkan batas yang jelas.",
        },
      },
      {
        id: "d",
        dimension: "reflective",
        text: {
          en: "Step back to hold non-judgmental awareness: recognizing that snapping was an involuntary signal of system overload.",
          id: "Mengambil langkah mundur dengan penuh penerimaan: menyadari bahwa keketus an itu adalah alarm kelebihan beban sistem saraf.",
        },
      },
    ],
  },
  {
    id: 4,
    situation: {
      en: "Someone pays you a very sincere and intimate compliment. What is your inner awareness process?",
      id: "Seseorang memberikan pujian yang sangat tulus dan mendalam kepada Anda. Bagaimana proses kesadaran batin Anda?",
    },
    options: [
      {
        id: "a",
        dimension: "granular",
        text: {
          en: "Distinguish the layers: feeling touched, slightly bashful, and profoundly respected all at once.",
          id: "Membedah lapisannya: merasa tersentuh, sedikit tersipu malu, sekaligus sangat dihormati dalam waktu yang sama.",
        },
      },
      {
        id: "b",
        dimension: "somatic",
        text: {
          en: "Notice the flush of warmth spread across your chest and face, and an instinctive urge to look away.",
          id: "Merasakan aliran kehangatan menjalar di dada dan wajah, serta dorongan alami untuk mengalihkan pandangan.",
        },
      },
      {
        id: "c",
        dimension: "trigger_tracing",
        text: {
          en: "Reflect on why receiving praise feels vulnerable: connecting it to childhood conditioning around modesty or visibility.",
          id: "Merenungkan mengapa menerima pujian terasa canggung: menghubungkannya dengan pola masa kecil seputar kerendahan hati.",
        },
      },
      {
        id: "d",
        dimension: "reflective",
        text: {
          en: "Allow yourself to stay present with the sensation of being appreciated without deflecting or joking it away.",
          id: "Mengizinkan diri hadir seutuhnya merasakan sensasi dihargai tanpa buru-buru mengalihkan atau menjadikannya lelucon.",
        },
      },
    ],
  },
  {
    id: 5,
    situation: {
      en: "You are watching a moving film or listening to a haunting piece of music. What stands out to your awareness?",
      id: "Anda sedang menonton film yang mengharukan atau mendengarkan lagu yang menyentuh kalbu. Apa yang disadari batin Anda?",
    },
    options: [
      {
        id: "a",
        dimension: "granular",
        text: {
          en: "The rich palette of bittersweet awe, nostalgic yearning, and reverent catharsis that the melody evokes.",
          id: "Kaya akan palet rasa getir-manis (bittersweet), kerinduan nostalgia, dan kelegaan jiwa yang dibangkitkan melodi.",
        },
      },
      {
        id: "b",
        dimension: "somatic",
        text: {
          en: "The physical goosebumps on your arms, the lump in your throat, and the sudden release of tears.",
          id: "Bulu kuduk yang meremang di lengan, sensasi tercekat di tenggorokan, dan aliran air mata yang menetes spontan.",
        },
      },
      {
        id: "c",
        dimension: "trigger_tracing",
        text: {
          en: "The specific memory or dormant grief that the film's theme gently unlocked from your past.",
          id: "Kenangan spesifik atau kerinduan lama yang secara lembut terbuka kembali oleh tema film tersebut.",
        },
      },
      {
        id: "d",
        dimension: "reflective",
        text: {
          en: "The universal human condition: feeling deeply united with the shared joy and suffering of all living beings.",
          id: "Kondisi universal kemanusiaan: merasa terhubung mendalam dengan sukacita dan derita bersama seluruh umat manusia.",
        },
      },
    ],
  },
  {
    id: 6,
    situation: {
      en: "You are about to enter a difficult conversation with a loved one. How do you prepare emotionally?",
      id: "Anda bersiap memasuki percakapan penting yang sulit dengan orang terkasih. Bagaimana Anda mempersiapkan diri secara emosional?",
    },
    options: [
      {
        id: "a",
        dimension: "granular",
        text: {
          en: "Label your distinct emotional needs: clarifying that beneath the frustration lies tenderness and fear of disconnection.",
          id: "Melabeli kebutuhan emosional secara jelas: menyadari bahwa di balik rasa kesal terdapat kelembutan dan takut kehilangan.",
        },
      },
      {
        id: "b",
        dimension: "somatic",
        text: {
          en: "Place a hand over your heart or stomach, taking steady breaths to anchor physiological safety first.",
          id: "Meletakkan tangan di dada atau perut, bernapas teratur untuk memastikan rasa aman fisiologis terlebih dahulu.",
        },
      },
      {
        id: "c",
        dimension: "trigger_tracing",
        text: {
          en: "Map out the triggers: knowing exactly which words make you defensive and which values are non-negotiable.",
          id: "Memetakan kata-kata pemicu: mengetahui kalimat apa yang bisa memicu sikap defensif dan batasan nilai mana yang prinsipil.",
        },
      },
      {
        id: "d",
        dimension: "reflective",
        text: {
          en: "Remind yourself: 'I can feel afraid and still be loving and clear; my feelings don't have to control my actions.'",
          id: "Mengingatkan diri: 'Aku boleh merasa cemas namun tetap bersikap ramah dan lugas; emosiku tak harus mendikte tindakanku.'",
        },
      },
    ],
  },
  {
    id: 7,
    situation: {
      en: "You receive unexpected bad news while standing in a crowded grocery store. How does your awareness operate?",
      id: "Anda menerima kabar buruk tak terduga saat sedang berdiri di antrean toko yang ramai. Bagaimana kesadaran Anda bekerja?",
    },
    options: [
      {
        id: "a",
        dimension: "granular",
        text: {
          en: "Accurately name the onset of shock, disbelief, and surging dismay without generic panic labels.",
          id: "Menamai dengan tepat awal mula rasa syok, ketidakpercayaan, dan kekhawatiran tanpa mencapnya sebagai panik buta.",
        },
      },
      {
        id: "b",
        dimension: "somatic",
        text: {
          en: "Track the sudden visceral drop: cold hands, tunnel vision, and a spike in heart rate.",
          id: "Memantau perubahan fisik seketika: telapak tangan mendingin, pandangan menyempit, dan detak jantung memacu.",
        },
      },
      {
        id: "c",
        dimension: "trigger_tracing",
        text: {
          en: "Instantly distinguish the news itself from the catastrophic future scenarios racing ahead in your thoughts.",
          id: "Seketika membedakan fakta kabar itu sendiri dari skenario katastrofik masa depan yang melintas di pikiran.",
        },
      },
      {
        id: "d",
        dimension: "reflective",
        text: {
          en: "Give yourself permission to pause: finish purchasing your items calmly and defer reaction until you reach your car.",
          id: "Memberi diri izin mengambil jeda: menyelesaikan pembayaran dengan tenang dan menunda luapan respon sampai berada di mobil.",
        },
      },
    ],
  },
  {
    id: 8,
    situation: {
      en: "After successfully completing a grueling multi-month project, you sit in silence. What do you notice inside?",
      id: "Setelah berhasil menyelesaikan proyek melelahkan selama berbulan-bulan, Anda duduk dalam hening. Apa yang Anda sadari di dalam diri?",
    },
    options: [
      {
        id: "a",
        dimension: "granular",
        text: {
          en: "A complex mosaic of profound relief, subtle emptiness, physical tiredness, and quiet self-respect.",
          id: "Mozaik rasa yang kaya: kelegaan mendalam, kekosongan halus seusai target, letih fisik, dan rasa bangga yang tenang.",
        },
      },
      {
        id: "b",
        dimension: "somatic",
        text: {
          en: "The slow dropping of tension from your neck and spine, as if a physical weighted vest was unbuckled.",
          id: "Pelepasan ketegangan perlahan dari leher dan tulang belakang, bagaikan rompi beban berat yang baru saja dilepas.",
        },
      },
      {
        id: "c",
        dimension: "trigger_tracing",
        text: {
          en: "Recognize that the mild emptiness stems from losing a daily organizing structure and adrenaline purpose.",
          id: "Menyadari bahwa rasa kosong itu berasal dari hilangnya rutinitas harian yang padat dan hilangnya suntikan adrenalin.",
        },
      },
      {
        id: "d",
        dimension: "reflective",
        text: {
          en: "Appreciate this stillness as a necessary fallow period between creative cycles, without rushing to start something new.",
          id: "Menghargai keheningan ini sebagai masa jeda yang sehat antarsiklus karya, tanpa terburu-buru memulai kesibukan baru.",
        },
      },
    ],
  },
  {
    id: 9,
    situation: {
      en: "You notice an irrational burst of frustration at an inanimate object (e.g. dropped keys or slow computer). What occurs to you?",
      id: "Anda mendadak merasa sangat jengkel pada benda mati (misal kunci yang terjatuh atau komputer yang lambat). Apa yang terlintas di benak Anda?",
    },
    options: [
      {
        id: "a",
        dimension: "granular",
        text: {
          en: "Realize this isn't anger at the object, but depleted patience, sensory fatigue, and unmet need for a break.",
          id: "Menyadari ini bukan amarah pada benda tersebut, melainkan menipisnya kesabaran, kejenuhan indra, dan butuh istirahat.",
        },
      },
      {
        id: "b",
        dimension: "somatic",
        text: {
          en: "Catch the sudden clenching of fists and heat behind your temples before you say or do anything impulsive.",
          id: "Menangkap kepalan tangan yang mengeras dan rasa panas di pelipis sebelum sempat bertindak atau berkata kasar.",
        },
      },
      {
        id: "c",
        dimension: "trigger_tracing",
        text: {
          en: "Trace the spark to an unresolved dispute earlier in the morning that left you on an emotional hair-trigger.",
          id: "Menelusuri pemicunya ke perselisihan pagi tadi yang belum tuntas sehingga membuat emosi gampang tersulut.",
        },
      },
      {
        id: "d",
        dimension: "reflective",
        text: {
          en: "Laugh softly at the absurdity of yelling at keys, using the funny realization to dissolve the spike.",
          id: "Tersenyum geli pada kekonyolan mengomeli kunci jatuh, memakai humor ringan tersebut untuk melarutkan kekesalan.",
        },
      },
    ],
  },
  {
    id: 10,
    situation: {
      en: "How would you describe your overall relationship with your emotions in daily life?",
      id: "Bagaimana Anda menggambarkan hubungan Anda secara umum dengan emosi-emosi Anda dalam kehidupan sehari-hari?",
    },
    options: [
      {
        id: "a",
        dimension: "granular",
        text: {
          en: "A rich, nuanced vocabulary: I can articulate subtle emotional shades and distinctions with high clarity.",
          id: "Kosakata rasa yang kaya: saya mampu mengartikulasikan nuansa dan perbedaan emosi halus dengan kejelasan tinggi.",
        },
      },
      {
        id: "b",
        dimension: "somatic",
        text: {
          en: "An embodied dialogue: my physical body is my most reliable barometer for telling me how I truly feel.",
          id: "Dialog berbasis tubuh: sensasi fisik raga adalah barometer paling akurat yang memberitahu kondisi rasa sejati saya.",
        },
      },
      {
        id: "c",
        dimension: "trigger_tracing",
        text: {
          en: "An investigative lens: I am quick to unpack why feelings arise, what values they touch, and what needs they signal.",
          id: "Lensa investigasi: saya cepat mengurai mengapa perasaan muncul, nilai apa yang tersentuh, dan kebutuhan apa yang diminta.",
        },
      },
      {
        id: "d",
        dimension: "reflective",
        text: {
          en: "A mindful witness: I can experience deep feelings while maintaining perspective that emotions are temporary waves.",
          id: "Pengamat yang sadar: saya bisa menyelami perasaan mendalam sembari tetap eling bahwa emosi adalah gelombang sementara.",
        },
      },
    ],
  },
];

const AWARENESS_META: Record<
  AwarenessDimKey,
  {
    name: { en: string; id: string };
    desc: { en: string; id: string };
    strengths: { en: string[]; id: string[] };
    challenges: { en: string[]; id: string[] };
    reflectionPrompts: { en: string[]; id: string[] };
    actionSuggestions: { en: string[]; id: string[] };
  }
> = {
  granular: {
    name: {
      en: "Emotional Granularity & Nuance Labeling",
      id: "Granularitas Emosional & Pelabelan Nuansa",
    },
    desc: {
      en: "You possess a rich affective vocabulary. You distinguish subtle distinctions between frustration, grief, envy, and fatigue rather than using generic labels.",
      id: "Anda memiliki perbendaharaan rasa yang kaya dan presisi. Anda membedakan nuansa halus antara jengkel, duka, iri, dan letih daripada sekadar memakai label umum 'sedang bad mood'.",
    },
    strengths: {
      en: [
        "High emotional clarity prevents inappropriate or confused reactions",
        "Able to express complex inner states accurately to partners and therapists",
        "Reduces psychological distress by precisely pinpointing what is felt",
      ],
      id: [
        "Kejelasan emosi yang tinggi mencegah reaksi keliru atau kebingungan bertindak",
        "Mampu mengungkapkan perasaan kompleks secara akurat kepada pasangan atau rekan",
        "Meredakan tekanan batin karena mampu menamai apa yang dirasakan dengan tepat",
      ],
    },
    challenges: {
      en: [
        "Risk of over-analyzing feelings into endless intellectual categories",
        "Others may feel intimidated if they lack equal emotional vocabulary",
        "May spend more time categorizing feelings than actually feeling them",
      ],
      id: [
        "Risiko terlalu banyak menganalisis emosi ke dalam kategori intelektual",
        "Orang sekitar bisa merasa canggung jika mereka belum memiliki kepekaan rasa setara",
        "Bisa menghabiskan lebih banyak waktu melabeli rasa daripada menyelaminya",
      ],
    },
    reflectionPrompts: {
      en: [
        "Do I allow myself to simply experience an emotion without immediately giving it a label?",
        "How can I share my emotional nuances without overwhelming conversational partners?",
      ],
      id: [
        "Apakah saya mengizinkan diri merasakan emosi tanpa harus langsung memberi label nama?",
        "Bagaimana cara membagikan nuansa perasaan tanpa membuat lawan bicara kewalahan?",
      ],
    },
    actionSuggestions: {
      en: [
        "Use your granular vocabulary to identify unmet underlying human needs.",
        "Practice holding silent space for simple sensations before naming them.",
      ],
      id: [
        "Manfaatkan kepekaan kosakata ini untuk mengenali kebutuhan dasar yang belum terpenuhi.",
        "Latih diri untuk menikmati keheningan merasakan sensasi sebelum buru-buru menamainya.",
      ],
    },
  },
  somatic: {
    name: {
      en: "Somatic Interoception & Bodily Attunement",
      id: "Interosepsi Somatik & Kepekaan Tubuh",
    },
    desc: {
      en: "You read emotions through bodily barometers—heart rate, muscle tension, gut sensations, and breathing patterns—catching emotional shifts at the physiological level.",
      id: "Anda membaca emosi melalui sinyal fisik tubuh—denyut jantung, ketegangan otot, getaran di perut, dan ritme napas—menangkap pergeseran rasa di tingkat fisiologis.",
    },
    strengths: {
      en: [
        "Early warning detection before emotional outbursts occur",
        "Deep mind-body connection and somatic wisdom",
        "Immune to mental rationalization when the body signals distress",
      ],
      id: [
        "Deteksi dini tanda bahaya sebelum emosi sempat meledak",
        "Koneksi pikiran-tubuh yang kuat dan kebijaksanaan raga yang mendalam",
        "Kebal dari rasionalisasi palsu pikiran karena tubuh jujur menunjukkan ketidaknyamanan",
      ],
    },
    challenges: {
      en: [
        "Physical symptoms of stress can be misinterpreted as medical emergencies",
        "Somatic fatigue if bodily agitation remains high without cognitive release",
        "May struggle to articulate the emotional meaning behind bodily sensations",
      ],
      id: [
        "Sensasi fisik stres kadang salah dikira sebagai gangguan medis mendesak",
        "Kelelahan raga jika ketegangan tubuh tidak dibarengi pelepasan mental",
        "Terkadang kesulitan menerjemahkan sensasi fisik ke dalam kata-kata yang dipahami orang lain",
      ],
    },
    reflectionPrompts: {
      en: [
        "Where in my body do I hold tension when I feel unheard or anxious?",
        "How does my posture shift when I move from defensiveness to openness?",
      ],
      id: [
        "Di bagian tubuh mana saya biasanya menimbun rasa tegang saat cemas?",
        "Bagaimana postur tubuh saya berubah saat berpindah dari defensif ke sikap terbuka?",
      ],
    },
    actionSuggestions: {
      en: [
        "Practice a 3-minute somatic body scan at midday to release clenched muscles.",
        "Translate bodily cues into emotional words: 'Tight shoulders means I need to say no to more tasks.'",
      ],
      id: [
        "Lakukan body scan 3 menit di siang hari untuk merelaksasi otot-otot yang tegang.",
        "Terjemahkan sinyal tubuh ke kalimat emosi: 'Bahu yang kaku ini berarti saya harus menolak tugas tambahan.'",
      ],
    },
  },
  trigger_tracing: {
    name: {
      en: "Trigger Tracing & Root Analysis",
      id: "Penelusuran Pemicu & Analisis Akar Sebab",
    },
    desc: {
      en: "You instinctively trace emotional surges back to their origins—uncovering underlying expectations, past conditioning, and environmental triggers.",
      id: "Anda secara alami menelusuri lonjakan emosi kembali ke titik awalnya—mengurai ekspektasi yang belum terwujud, pola pengasuhan masa lalu, dan pemicu lingkungan.",
    },
    strengths: {
      en: [
        "High insight into causal mechanisms behind mood swings",
        "Addresses core root issues rather than merely surface symptoms",
        "Helps friends and teams identify underlying systematic bottlenecks",
      ],
      id: [
        "Pemahaman tajam mengenai sebab-akibat di balik perubahan suasana hati",
        "Menyelesaikan akar masalah mendasar dan bukan cuma merawat gejala di permukaan",
        "Membantu rekan atau tim mengidentifikasi titik sumbat sistemik yang memicu gesekan",
      ],
    },
    challenges: {
      en: [
        "Can lead to endless intellectual psychoanalyzing rather than immediate presence",
        "Risk of blaming triggers or past events for current emotional state",
        "May delay simple self-soothing while searching for 'the deep origin'",
      ],
      id: [
        "Bisa berputar-putar menganalisis psikologis tanpa merasakan momen saat ini",
        "Risiko menyalahkan pemicu atau masa lalu atas suasana hati hari ini",
        "Bisa menunda tindakan menenangkan diri karena terlalu sibuk mencari 'akar filosofisnya'",
      ],
    },
    reflectionPrompts: {
      en: [
        "Once I know why I feel upset, am I taking action to soothe the feeling?",
        "What recurring life situations trigger my defensive reactions most reliably?",
      ],
      id: [
        "Setelah tahu mengapa saya kesal, apakah saya segera mengambil langkah menenangkan diri?",
        "Situasi berulang apa yang paling sering menyulut reaksi defensif saya?",
      ],
    },
    actionSuggestions: {
      en: [
        "Maintain a brief trigger log for 7 days to identify recurring patterns.",
        "Pair root analysis with immediate comfort: discover the why, then give yourself the care.",
      ],
      id: [
        "Buat catatan pemicu singkat selama 7 hari untuk memetakan pola yang berulang.",
        "Padukan analisis akar masalah dengan perawatan diri: temukan sebabnya, lalu berikan kenyamanan.",
      ],
    },
  },
  reflective: {
    name: {
      en: "Reflective Mindfulness & Decentered Perspective",
      id: "Kesadaran Penuh & Pengamatan Bijak (Mindful Perspective)",
    },
    desc: {
      en: "You view emotions with decentered mindfulness. You hold perspective that feelings are transient informative weather patterns rather than permanent identity states.",
      id: "Anda memandang emosi dengan kesadaran penuh (mindfulness). Anda menempatkan perasaan sebagai fenomena cuaca batin yang dinamis dan sementara, bukan identitas mutlak diri Anda.",
    },
    strengths: {
      en: [
        "Exceptional emotional equanimity and composure under stress",
        "Low reactivity; rarely overwhelmed by sudden mood turbulence",
        "Broad philosophical perspective on the universal human condition",
      ],
      id: [
        "Ketenangan batin yang luar biasa di bawah tekanan situasi berat",
        "Reaktivitas rendah; jarang terseret atau panik oleh gejolak rasa sesaat",
        "Perspektif filosofis yang luas mengenai fitrah kehidupan manusia",
      ],
    },
    challenges: {
      en: [
        "Can slip into emotional detachment or aloof disengagement from real passion",
        "Loved ones might feel you are too stoic or unbothered by important issues",
        "May dismiss urgent emotions that genuinely require immediate outer confrontation",
      ],
      id: [
        "Bisa tergelincir ke sikap acuh atau menjaga jarak berlebih dari antusiasme hidup",
        "Orang terdekat mungkin mengira Anda terlalu dingin atau tidak peduli pada hal krusial",
        "Bisa meremehkan emosi mendesak yang sejatinya menuntut tindakan nyata saat itu juga",
      ],
    },
    reflectionPrompts: {
      en: [
        "Am I mindfully observing my emotions, or emotionally detaching to avoid feeling pain?",
        "How can I stay centered while also leaning into passionate engagement?",
      ],
      id: [
        "Apakah saya mengamati emosi dengan sadar, atau menjaga jarak untuk menghindari rasa sakit?",
        "Bagaimana saya bisa tetap tenang seraya tetap terlibat penuh dalam antusiasme hidup?",
      ],
    },
    actionSuggestions: {
      en: [
        "Pair mindful observation with heartfelt warmth and connection.",
        "Remember that equanimity is meant to guide decisive action, not perpetuate inaction.",
      ],
      id: [
        "Padukan ketenangan pengamatan batin dengan kehangatan relasi dan empati.",
        "Ingat bahwa ketenangan bertujuan memandu tindakan tegas, bukan membenarkan sikap pasif.",
      ],
    },
  },
};

export function calculateEmotionalAwarenessScore(
  answers: Record<number, string>,
  lang: ToolLanguage
): AwarenessResult {
  const counts: Record<AwarenessDimKey, number> = {
    granular: 0,
    somatic: 0,
    trigger_tracing: 0,
    reflective: 0,
  };

  AWARENESS_QUESTIONS.forEach((q) => {
    const selectedOptionId = answers[q.id];
    if (selectedOptionId) {
      const option = q.options.find((opt) => opt.id === selectedOptionId);
      if (option) {
        counts[option.dimension] += 1;
      }
    }
  });

  const totalAnswered = Object.keys(answers).length || 1;

  const entries = (Object.keys(counts) as AwarenessDimKey[]).map((key) => {
    const count = counts[key];
    const percentage = Math.round((count / totalAnswered) * 100);
    const meta = AWARENESS_META[key];
    return {
      key,
      score: {
        key,
        name: meta.name[lang],
        percentage,
        description: meta.desc[lang],
        strengths: meta.strengths[lang],
        challenges: meta.challenges[lang],
        reflectionPrompts: meta.reflectionPrompts[lang],
        actionSuggestions: meta.actionSuggestions[lang],
      },
    };
  });

  entries.sort((a, b) => b.score.percentage - a.score.percentage);

  const scoresRecord = entries.reduce(
    (acc, curr) => {
      acc[curr.key] = curr.score;
      return acc;
    },
    {} as Record<AwarenessDimKey, AwarenessScore>
  );

  const primaryDimension = entries[0].score;
  const secondaryDimension = entries[1].score;

  let overallSummary = "";
  if (lang === "id") {
    overallSummary = `Dimensi kesadaran emosional dominan Anda adalah ${primaryDimension.name} (${primaryDimension.percentage}%), diperkuat oleh ${secondaryDimension.name} (${secondaryDimension.percentage}%). Profil ini menunjukkan bagaimana kesadaran batin Anda mengenali, memproses, dan memahami bahasa emosi dalam keseharian.`;
  } else {
    overallSummary = `Your primary emotional awareness dimension is ${primaryDimension.name} (${primaryDimension.percentage}%), complemented by ${secondaryDimension.name} (${secondaryDimension.percentage}%). This profile reflects how you detect, process, and decode affective signals across internal bodily, cognitive, and environmental contexts.`;
  }

  return {
    scores: scoresRecord,
    primaryDimension,
    secondaryDimension,
    overallSummary,
  };
}

