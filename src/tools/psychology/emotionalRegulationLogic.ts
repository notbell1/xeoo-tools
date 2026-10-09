import type { ToolLanguage } from "./psychologyI18n";

export type RegStyleKey =
  | "reappraisal"
  | "grounding"
  | "expression"
  | "containment";

export interface RegScenarioOption {
  id: string;
  style: RegStyleKey;
  text: {
    en: string;
    id: string;
  };
}

export interface RegScenarioQuestion {
  id: number;
  situation: {
    en: string;
    id: string;
  };
  options: RegScenarioOption[];
}

export interface RegStyleScore {
  key: RegStyleKey;
  name: string;
  percentage: number;
  description: string;
  strengths: string[];
  challenges: string[];
  reflectionPrompts: string[];
  actionSuggestions: string[];
}

export interface RegStyleResult {
  scores: Record<RegStyleKey, RegStyleScore>;
  primaryStyle: RegStyleScore;
  secondaryStyle: RegStyleScore;
  overallSummary: string;
}

export const REGULATION_QUESTIONS: RegScenarioQuestion[] = [
  {
    id: 1,
    situation: {
      en: "You receive abrupt and unfair criticism on a project you worked hard on. What is your immediate impulse?",
      id: "Anda menerima kritik mendadak dan terasa tidak adil atas pekerjaan yang sudah Anda selesaikan dengan susah payah. Apa respon spontan Anda?",
    },
    options: [
      {
        id: "a",
        style: "reappraisal",
        text: {
          en: "Step back and reframe it: look for whether there is useful grain of feedback hidden beneath the tone.",
          id: "Mengambil langkah mundur dan membingkai ulang: mencari apakah ada masukan berguna di balik nada bicaranya.",
        },
      },
      {
        id: "b",
        style: "grounding",
        text: {
          en: "Take a deep conscious breath and wait until physical agitation subsides before replying.",
          id: "Menarik napas panjang secara sadar dan menunggu debaran tubuh tenang sebelum membalas.",
        },
      },
      {
        id: "c",
        style: "expression",
        text: {
          en: "State clearly and calmly how the comment landed and explain your perspective directly.",
          id: "Menyatakan dengan jelas dan tegas bagaimana komentar itu dirasakan dan menjelaskan sudut pandang Anda.",
        },
      },
      {
        id: "d",
        style: "containment",
        text: {
          en: "Swallow the immediate frustration, nod politely, and process the hurt privately later.",
          id: "Menelan rasa kesal seketika, mengangguk sopan, dan menyimpan perasaan tersebut untuk diolah nanti sendirian.",
        },
      },
    ],
  },
  {
    id: 2,
    situation: {
      en: "Unexpected delays cause you to miss an important scheduled appointment. How do you handle the surge of irritation?",
      id: "Keterlambatan tak terduga membuat Anda melewatkan janji temu penting. Bagaimana Anda menangani lonjakan rasa kesal?",
    },
    options: [
      {
        id: "a",
        style: "reappraisal",
        text: {
          en: "Remind myself that unexpected events happen and focus on what can be adjusted right now.",
          id: "Mengingatkan diri bahwa hal tak terduga wajar terjadi dan fokus pada apa yang masih bisa diatur sekarang.",
        },
      },
      {
        id: "b",
        style: "grounding",
        text: {
          en: "Focus on sensory grounding—feeling feet on the floor and breathing slowly to keep cortisol down.",
          id: "Fokus pada sensasi tubuh—menjejakkan kaki dan bernapas teratur untuk meredakan ketegangan fisik.",
        },
      },
      {
        id: "c",
        style: "expression",
        text: {
          en: "Immediately inform the other party with honest transparency about the frustration and reschedule.",
          id: "Segera menghubungi pihak terkait dengan jujur menyampaikan situasi dan meminta penjadwalan ulang.",
        },
      },
      {
        id: "d",
        style: "containment",
        text: {
          en: "Keep a stoic face and force myself to keep moving without letting anyone notice I am upset.",
          id: "Memasang wajah tenang dan memaksakan diri tetap beraktivitas tanpa memperlihatkan kekesalan kepada siapapun.",
        },
      },
    ],
  },
  {
    id: 3,
    situation: {
      en: "During a heated group discussion, someone interrupts you repeatedly. What is your go-to emotional reaction?",
      id: "Saat diskusi kelompok yang hangat, seseorang berulang kali memotong omongan Anda. Apa reaksi emosional Anda?",
    },
    options: [
      {
        id: "a",
        style: "reappraisal",
        text: {
          en: "Interpret their interruptions as eagerness or poor conversational habit rather than personal disrespect.",
          id: "Menafsirkan selaan tersebut sebagai antusiasme berlebih atau kebiasaan buruknya, bukan penghinaan personal.",
        },
      },
      {
        id: "b",
        style: "grounding",
        text: {
          en: "Pause for three seconds, sip some water, and center myself before speaking again.",
          id: "Berhenti sejenak selama tiga detik, minum air, dan menstabilkan diri sebelum kembali bicara.",
        },
      },
      {
        id: "c",
        style: "expression",
        text: {
          en: "Firmly and politely request: 'Please allow me to finish this thought first before we proceed.'",
          id: "Meminta dengan tegas dan sopan: 'Tolong izinkan saya menyelesaikan poin ini dulu sebelum ditanggapi.'",
        },
      },
      {
        id: "d",
        style: "containment",
        text: {
          en: "Hold my tongue, yield the floor quietly, and let the irritation build beneath the surface.",
          id: "Menahan diri, mengalah tanpa banyak bicara, dan membiarkan kejengkelan tersimpan di dalam hati.",
        },
      },
    ],
  },
  {
    id: 4,
    situation: {
      en: "You make a noticeable mistake in front of peers or colleagues. How do you soothe the feeling of embarrassment?",
      id: "Anda melakukan kesalahan yang disadari banyak rekan kerja. Bagaimana Anda menenangkan rasa malu tersebut?",
    },
    options: [
      {
        id: "a",
        style: "reappraisal",
        text: {
          en: "Tell myself: 'Mistakes are normal human learning experiences, no one remembers this forever.'",
          id: "Mengatakan pada diri: 'Kesalahan adalah bagian wajar dari belajar, tidak ada yang akan mengingat ini selamanya.'",
        },
      },
      {
        id: "b",
        style: "grounding",
        text: {
          en: "Notice the heat in my face, exhale slowly, and release physical tension from my shoulders.",
          id: "Menyadari rasa hangat di wajah, menghembuskan napas pelan, dan melemaskan ketegangan di bahu.",
        },
      },
      {
        id: "c",
        style: "expression",
        text: {
          en: "Lightly acknowledge the mistake with self-deprecating warmth or quick transparency and move on.",
          id: "Secara terbuka mengakui kesalahan dengan santai dan transparan lalu segera memperbaikinya.",
        },
      },
      {
        id: "d",
        style: "containment",
        text: {
          en: "Act completely unfazed on the outside while internally feeling intensely self-critical.",
          id: "Bersikap seperti tidak terjadi apa-apa dari luar, meski di dalam diri mengkritik diri secara intens.",
        },
      },
    ],
  },
  {
    id: 5,
    situation: {
      en: "You are overwhelmed by multiple conflicting deadlines at once. How do you steady yourself?",
      id: "Anda kewalahan dengan tumpukan tenggat waktu yang saling bertubrukan. Bagaimana Anda menstabilkan diri?",
    },
    options: [
      {
        id: "a",
        style: "reappraisal",
        text: {
          en: "Break the crisis down into manageable parts and remind myself I can only do one task at a time.",
          id: "Memecah krisis menjadi bagian-bagian kecil dan mengingatkan diri hanya bisa mengerjakan satu hal per waktu.",
        },
      },
      {
        id: "b",
        style: "grounding",
        text: {
          en: "Step away from the screen for five minutes, walk around, and reset nervous system arousal.",
          id: "Menjauh dari layar 5 menit, berjalan sedikit, dan mengatur ritme napas untuk meredakan kepanikan saraf.",
        },
      },
      {
        id: "c",
        style: "expression",
        text: {
          en: "Communicate directly with teammates or leaders about capacity bottlenecks and renegotiate timelines.",
          id: "Berkomunikasi terus terang dengan tim atau atasan mengenai batas kapasitas dan meminta penyesuaian jadwal.",
        },
      },
      {
        id: "d",
        style: "containment",
        text: {
          en: "Suppress the anxiety, work continuously without breaks, and push through through pure willpower.",
          id: "Menekan rasa cemas, terus bekerja tanpa istirahat, dan mengandalkan tekad keras untuk menahan lelah.",
        },
      },
    ],
  },
  {
    id: 6,
    situation: {
      en: "Someone close to you shares painful news that makes you feel deeply sad or anxious. What is your reaction?",
      id: "Seseorang yang dekat dengan Anda membagikan kabar sedih yang membuat Anda merasa cemas dan terpukul. Apa reaksi Anda?",
    },
    options: [
      {
        id: "a",
        style: "reappraisal",
        text: {
          en: "Search for meaning and supportive ways this difficult experience might help them grow stronger.",
          id: "Mencari makna dan cara suportif bagaimana pengalaman sulit ini bisa membantu mereka bertumbuh.",
        },
      },
      {
        id: "b",
        style: "grounding",
        text: {
          en: "Hold physical stillness, anchor my attention on listening attentively without getting overwhelmed.",
          id: "Menjaga ketenangan tubuh, memusatkan perhatian untuk mendengarkan tanpa larut dalam kepanikan emosional.",
        },
      },
      {
        id: "c",
        style: "expression",
        text: {
          en: "Share genuine empathy openly, tear up or express verbal heartfelt solidarity without holding back.",
          id: "Mengekspresikan empati secara tulus dan terbuka, menyampaikan rasa haru dan solidaritas tanpa ditahan.",
        },
      },
      {
        id: "d",
        style: "containment",
        text: {
          en: "Mask my sorrow to appear as an unflinching pillar of strength for them.",
          id: "Menyembunyikan kesedihan diri agar terlihat sebagai pilar yang tegar dan tak tergoyahkan bagi mereka.",
        },
      },
    ],
  },
  {
    id: 7,
    situation: {
      en: "You feel sudden anger flare up in a customer service or everyday friction situation. How do you govern it?",
      id: "Rasa marah tiba-tiba memuncak dalam situasi pelayanan atau gesekan sehari-hari. Bagaimana Anda mengendalikannya?",
    },
    options: [
      {
        id: "a",
        style: "reappraisal",
        text: {
          en: "Remind myself the representative is likely overworked and following strict corporate protocols.",
          id: "Mengingatkan diri bahwa petugas tersebut kemungkinan kelelahan dan hanya mengikuti SOP perusahaan.",
        },
      },
      {
        id: "b",
        style: "grounding",
        text: {
          en: "Count to ten slowly, soften my jaw muscles, and relax my clenched fists.",
          id: "Menghitung sampai sepuluh perlahan, melemaskan otot rahang, dan mengendurkan kepalan tangan.",
        },
      },
      {
        id: "c",
        style: "expression",
        text: {
          en: "Articulate my dissatisfaction clearly and assertively without resorting to insults or yelling.",
          id: "Menyampaikan ketidakpuasan dengan tegas, jelas, dan santun tanpa merendahkan atau membentak.",
        },
      },
      {
        id: "d",
        style: "containment",
        text: {
          en: "Bottle up the anger completely, say nothing, and vent through passive resistance later.",
          id: "Memendam amarah sepenuhnya, diam, namun memendam rasa dongkol yang membekas lama.",
        },
      },
    ],
  },
  {
    id: 8,
    situation: {
      en: "You receive unexpected recognition or high praise that triggers imposter syndrome or uneasiness. What happens?",
      id: "Anda menerima pujian tinggi yang tak terduga namun memicu rasa canggung atau keraguan diri. Apa yang terjadi?",
    },
    options: [
      {
        id: "a",
        style: "reappraisal",
        text: {
          en: "Reflect that others see real value in my contribution even when my internal critic is overly harsh.",
          id: "Merenungkan bahwa orang lain melihat nilai nyata dari kontribusi saya, meskipun kritik batin saya terlalu keras.",
        },
      },
      {
        id: "b",
        style: "grounding",
        text: {
          en: "Take a quiet moment to feel the sensation of warmth in my chest and accept the moment gently.",
          id: "Mengambil momen hening untuk merasakan kehangatan di dada dan menerima momen tersebut dengan tenang.",
        },
      },
      {
        id: "c",
        style: "expression",
        text: {
          en: "Smile, thank them genuinely, and verbally share credit with everyone who helped.",
          id: "Tersenyum, mengucapkan terima kasih dengan tulus, dan berbagi apresiasi dengan rekan yang membantu.",
        },
      },
      {
        id: "d",
        style: "containment",
        text: {
          en: "Quickly deflect attention away from myself and minimize the accomplishment as sheer luck.",
          id: "Segera mengalihkan perhatian dan mengecilkan pencapaian tersebut seolah hanya faktor keberuntungan.",
        },
      },
    ],
  },
  {
    id: 9,
    situation: {
      en: "After an exhausting argument, you are left alone with lingering bitterness. How do you recover equilibrium?",
      id: "Setelah perdebatan yang melelahkan, Anda sendirian dengan sisa rasa pahit dan kesal. Bagaimana Anda memulihkan keseimbangan?",
    },
    options: [
      {
        id: "a",
        style: "reappraisal",
        text: {
          en: "Examine the disagreement objectively: what was my blind spot and what was their legitimate hurt?",
          id: "Menelaah perselisihan secara objektif: apa titik buta saya dan apa kekecewaan mereka yang valid?",
        },
      },
      {
        id: "b",
        style: "grounding",
        text: {
          en: "Engage in physical movement, a shower, or a nature walk to let the adrenaline dissipate naturally.",
          id: "Melakukan aktivitas fisik, mandi air hangat, atau berjalan di luar ruangan agar adrenalin mereda alami.",
        },
      },
      {
        id: "c",
        style: "expression",
        text: {
          en: "Write out raw thoughts in a journal or voice-note them to process the emotions honestly.",
          id: "Menuliskan unek-unek secara jujur dalam jurnal pribadi atau pesan suara untuk mengurai emosi.",
        },
      },
      {
        id: "d",
        style: "containment",
        text: {
          en: "Distract myself immediately with busywork or screens so I don't have to dwell on the bad feeling.",
          id: "Segera mengalihkan diri dengan kesibukan atau gawai agar tidak perlu merasakan perasaan tidak nyaman itu.",
        },
      },
    ],
  },
  {
    id: 10,
    situation: {
      en: "Facing an intimidating upcoming challenge (e.g. public speech, major interview), how do you manage anticipation anxiety?",
      id: "Menghadapi tantangan besar yang mendebarkan (misal: pidato umum, wawancara penting), bagaimana Anda mengatur kecemasan antisipatif?",
    },
    options: [
      {
        id: "a",
        style: "reappraisal",
        text: {
          en: "Reframe nervous jitters as excited physiological readiness rather than impending catastrophe.",
          id: "Membingkai debaran gugup sebagai kesiapan energi tubuh untuk beraksi, bukan tanda bencana.",
        },
      },
      {
        id: "b",
        style: "grounding",
        text: {
          en: "Practice slow box-breathing and progressive muscle relaxation to down-regulate the nervous system.",
          id: "Melatih pernapasan teratur dan relaksasi otot progresif untuk menenangkan sistem saraf.",
        },
      },
      {
        id: "c",
        style: "expression",
        text: {
          en: "Talk through the anticipation openly with a trusted peer or mentor to normalize the vulnerability.",
          id: "Membicarakan rasa gugup secara terbuka dengan teman tepercaya atau mentor untuk melepaskan beban.",
        },
      },
      {
        id: "d",
        style: "containment",
        text: {
          en: "Try hard to push anxious thoughts out of my mind and pretend total confidence.",
          id: "Berusaha keras membuang pikiran cemas dari kepala dan berpura-pura sangat percaya diri.",
        },
      },
    ],
  },
];

const STYLE_META: Record<
  RegStyleKey,
  {
    name: { en: string; id: string };
    desc: { en: string; id: string };
    strengths: { en: string[]; id: string[] };
    challenges: { en: string[]; id: string[] };
    reflectionPrompts: { en: string[]; id: string[] };
    actionSuggestions: { en: string[]; id: string[] };
  }
> = {
  reappraisal: {
    name: {
      en: "Cognitive Reappraisal",
      id: "Pembingkaian Ulang Kognitif (Reappraisal)",
    },
    desc: {
      en: "You instinctively adjust how you interpret situations, finding constructive perspectives and cognitive flexibility before reacting.",
      id: "Anda secara alami menata ulang cara Anda menafsirkan situasi, mencari sudut pandang konstruktif dan fleksibilitas kognitif sebelum merespons.",
    },
    strengths: {
      en: [
        "High mental flexibility and resilience during stressful crises",
        "Less prone to catastrophic thinking or impulsive outbursts",
        "Able to understand multiple viewpoints during complex disputes",
      ],
      id: [
        "Fleksibilitas mental dan ketahanan tinggi di tengah tekanan krisis",
        "Jarang terjebak pikiran katastrofik atau ledakan impulsif",
        "Mampu melihat ragam sudut pandang dalam konflik yang kompleks",
      ],
    },
    challenges: {
      en: [
        "Risk of over-intellectualizing genuine grief or painful emotions",
        "May rationalize situations where healthy boundaries or anger are justified",
        "Can feel mentally exhausting if you constantly police your thoughts",
      ],
      id: [
        "Risiko merasionalisasi rasa sedih mendalam sehingga emosi kurang terproses utuh",
        "Bisa menolerir situasi yang sebenarnya memerlukan batasan tegas atau amarah yang sehat",
        "Cepat lelah secara mental bila terus-menerus memaksakan analisis positif",
      ],
    },
    reflectionPrompts: {
      en: [
        "Do I allow myself to simply feel sadness or anger before rushing to find a bright side?",
        "When does reframing serve as self-care, and when does it turn into emotional avoidance?",
      ],
      id: [
        "Apakah saya mengizinkan diri merasakan kesedihan atau kemarahan sebelum terburu-buru mencari hikmahnya?",
        "Kapan membingkai ulang menjadi perawatan diri, dan kapan berubah menjadi pengabaian emosi?",
      ],
    },
    actionSuggestions: {
      en: [
        "Pair cognitive reframing with a 60-second somatic pause to acknowledge bodily emotions first.",
        "Remember that not every hardship requires immediate optimism; validation comes first.",
      ],
      id: [
        "Padukan analisis positif dengan jeda 60 detik untuk mengenali sensasi fisik emosi terlebih dahulu.",
        "Ingat bahwa tidak semua kesulitan harus langsung dicari sisi positifnya; validasi perasaan diri terlebih dahulu.",
      ],
    },
  },
  grounding: {
    name: {
      en: "Somatic Grounding & Pausing",
      id: "Jeda Sadar & Penyelarasan Fisik (Grounding)",
    },
    desc: {
      en: "You regulate emotions through bodily awareness, conscious breathing, and intentional physical pauses to soothe the nervous system.",
      id: "Anda mengelola emosi melalui kesadaran tubuh, ritme napas sadar, dan jeda fisik terencana untuk menstabilkan sistem saraf.",
    },
    strengths: {
      en: [
        "Excellent at mitigating impulsive physiological fight-or-flight reactions",
        "Maintains physical calmness and composure under high pressure",
        "High body awareness and attunement to bodily stress signals",
      ],
      id: [
        "Sangat baik dalam meredam reaksi impulsif fight-or-flight tubuh",
        "Menjaga ketenangan fisik dan postur di bawah tekanan tinggi",
        "Memiliki kepekaan tinggi terhadap sinyal kelelahan atau ketegangan fisik",
      ],
    },
    challenges: {
      en: [
        "May retreat into physical relaxation without addressing the underlying cognitive root",
        "Can be difficult to deploy in chaotic environments where immediate verbal action is required",
        "Risk of freezing or delaying necessary confrontations",
      ],
      id: [
        "Bisa berhenti pada relaksasi fisik tanpa menyelesaikan akar masalah di pikiran",
        "Terkadang sulit dilakukan saat berada di lingkungan bising yang butuh respon verbal cepat",
        "Kecenderungan menunda konfrontasi yang sebenarnya perlu segera diselesaikan",
      ],
    },
    reflectionPrompts: {
      en: [
        "After calming my body, do I return to resolve the situation assertively?",
        "What physical clues does my body give me before an emotion becomes intense?",
      ],
      id: [
        "Setelah tubuh saya tenang, apakah saya kembali untuk menuntaskan masalah secara asertif?",
        "Tanda fisik apa yang biasanya diberikan tubuh sebelum emosi terasa memuncak?",
      ],
    },
    actionSuggestions: {
      en: [
        "Use 4-7-8 breathing or box breathing as your foundational 60-second reset tool.",
        "After physiological recovery, schedule a structured time to formulate your verbal response.",
      ],
      id: [
        "Gunakan teknik pernapasan 4-7-8 atau box-breathing sebagai alat reset 60 detik.",
        "Setelah tubuh kembali rileks, jadwalkan waktu terstruktur untuk menyusun tindakan atau jawaban verbal.",
      ],
    },
  },
  expression: {
    name: {
      en: "Constructive Expression",
      id: "Ekspresi Konstruktif & Transparansi",
    },
    desc: {
      en: "You process emotions by articulating them outward—talking, journaling, and clarifying needs through direct, authentic communication.",
      id: "Anda mengolah emosi dengan menyuarakannya ke luar—berbicara, mencatat, dan mengklarifikasi kebutuhan melalui komunikasi yang jujur dan langsung.",
    },
    strengths: {
      en: [
        "Transparent communication prevents unresolved resentments from festering",
        "Healthy authenticity builds trust and psychological safety with others",
        "Quick emotional discharge allows faster return to cognitive baseline",
      ],
      id: [
        "Komunikasi transparan mencegah dendam terpendam yang membusuk",
        "Kejujuran yang sehat menumbuhkan rasa saling percaya dalam hubungan",
        "Penyaluran emosi yang langsung mempercepat pemulihan energi batin",
      ],
    },
    challenges: {
      en: [
        "Risk of reacting too quickly before having full contextual information",
        "Can place emotional weight onto conversational partners prematurely",
        "Vulnerability may sometimes be exploited by unsupportive individuals",
      ],
      id: [
        "Risiko berbicara terlalu cepat sebelum memiliki seluruh fakta atau konteks utuh",
        "Bisa membebani lawan bicara bila disampaikan saat emosi masih terlalu panas",
        "Keterbukaan terkadang bisa disalahgunakan oleh pihak yang kurang suportif",
      ],
    },
    reflectionPrompts: {
      en: [
        "Do I pause enough between feeling an intense urge and expressing it verbally?",
        "How do I distinguish between healthy expression and raw venting?",
      ],
      id: [
        "Apakah saya cukup memberi jeda antara merasakan dorongan emosi dan mengungkapkannya secara verbal?",
        "Bagaimana saya membedakan ekspresi yang sehat dengan pelampiasan tanpa saring?",
      ],
    },
    actionSuggestions: {
      en: [
        "Apply the 'XYZ formula': 'When X happened, I felt Y, and what I need moving forward is Z.'",
        "For intense emotional states, write an unsent draft before speaking aloud.",
      ],
      id: [
        "Gunakan formula 'XYZ': 'Ketika situasi X terjadi, saya merasakan Y, dan yang saya butuhkan adalah Z.'",
        "Untuk emosi yang sangat kuat, tuliskan draf tanpa dikirim terlebih dahulu sebelum berbicara langsung.",
      ],
    },
  },
  containment: {
    name: {
      en: "Containment & Self-Shielding",
      id: "Kontainmen & Perlindungan Diri",
    },
    desc: {
      en: "You maintain self-control by holding emotions internally in the moment, prioritizing situational stability and discretion over immediate display.",
      id: "Anda menjaga kendali diri dengan menahan emosi di dalam saat situasi berlangsung, mengutamakan stabilitas suasana dan privasi daripada luapan spontan.",
    },
    strengths: {
      en: [
        "High composure during volatile public or professional moments",
        "Prevents unnecessary escalation or social drama in tense environments",
        "Self-contained and capable of functioning even when under distress",
      ],
      id: [
        "Ketenangan tinggi saat menghadapi situasi profesional atau publik yang sensitif",
        "Mencegah eskalasi konflik yang tidak perlu di lingkungan umum",
        "Mampu tetap berfungsi dan menyelesaikan kewajiban saat berada di bawah tekanan",
      ],
    },
    challenges: {
      en: [
        "Unexpressed feelings can accumulate into chronic internal stress or fatigue",
        "Others may misinterpret stoicism as indifference or coldness",
        "Risk of passive-aggressive leaks when the reservoir fills up",
      ],
      id: [
        "Emosi yang terus dipendam dapat menumpuk menjadi kelelahan kronis atau stres fisik",
        "Orang lain mungkin salah mengira sikap tenang sebagai ketidakpedulian",
        "Risiko meluap dalam bentuk sindiran atau ketegangan pasif saat kapasitas penuh",
      ],
    },
    reflectionPrompts: {
      en: [
        "Where do my suppressed emotions go after the tense situation ends?",
        "Who is a safe person in my life with whom I don't have to keep my guard up?",
      ],
      id: [
        "Ke mana perginya emosi yang saya pendam setelah situasi yang tegang mereda?",
        "Siapakah orang aman dalam hidup saya tempat saya tidak perlu selalu memasang topeng tegar?",
      ],
    },
    actionSuggestions: {
      en: [
        "Create intentional safe decompression rituals (e.g. journaling, solitary exercise) after high-stress days.",
        "Practice small acts of vulnerability with trusted loved ones to build tolerance for emotional openness.",
      ],
      id: [
        "Buat ritual pelepasan emosi yang aman (menulis jurnal, olahraga pribadi) setelah hari yang penuh tekanan.",
        "Latih keterbukaan emosional bertahap dengan orang tepercaya agar emosi tidak tersimpan terlalu lama.",
      ],
    },
  },
};

export function calculateEmotionalRegulationScore(
  answers: Record<number, string>,
  lang: ToolLanguage
): RegStyleResult {
  const counts: Record<RegStyleKey, number> = {
    reappraisal: 0,
    grounding: 0,
    expression: 0,
    containment: 0,
  };

  REGULATION_QUESTIONS.forEach((q) => {
    const selectedOptionId = answers[q.id];
    if (selectedOptionId) {
      const option = q.options.find((opt) => opt.id === selectedOptionId);
      if (option) {
        counts[option.style] += 1;
      }
    }
  });

  const totalAnswered = Object.keys(answers).length || 1;

  const entries = (Object.keys(counts) as RegStyleKey[]).map((key) => {
    const count = counts[key];
    const percentage = Math.round((count / totalAnswered) * 100);
    const meta = STYLE_META[key];
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

  // Sort descending by percentage
  entries.sort((a, b) => b.score.percentage - a.score.percentage);

  const scoresRecord = entries.reduce(
    (acc, curr) => {
      acc[curr.key] = curr.score;
      return acc;
    },
    {} as Record<RegStyleKey, RegStyleScore>
  );

  const primaryStyle = entries[0].score;
  const secondaryStyle = entries[1].score;

  let overallSummary = "";
  if (lang === "id") {
    overallSummary = `Strategi regulasi emosi utama Anda adalah ${primaryStyle.name} (${primaryStyle.percentage}%), dengan kecenderungan pendukung berupa ${secondaryStyle.name} (${secondaryStyle.percentage}%). Pola ini menunjukkan cara alami Anda menyeimbangkan respon saraf, pikiran kognitif, dan komunikasi saat mengalami turbulensi emosional.`;
  } else {
    overallSummary = `Your primary emotional regulation style is ${primaryStyle.name} (${primaryStyle.percentage}%), supported by ${secondaryStyle.name} (${secondaryStyle.percentage}%). This profile reflects how your mind and body naturally coordinate cognitive framing, physical grounding, and verbal expression during moments of stress.`;
  }

  return {
    scores: scoresRecord,
    primaryStyle,
    secondaryStyle,
    overallSummary,
  };
}

