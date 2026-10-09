import type { ToolLanguage } from "./psychologyI18n";

export type BoundaryStyleKey =
  | "healthy"
  | "porous"
  | "rigid"
  | "selective";

export interface BoundaryScenarioOption {
  id: string;
  style: BoundaryStyleKey;
  text: {
    en: string;
    id: string;
  };
}

export interface BoundaryScenarioQuestion {
  id: number;
  situation: {
    en: string;
    id: string;
  };
  options: BoundaryScenarioOption[];
}

export interface BoundaryStyleScore {
  key: BoundaryStyleKey;
  name: string;
  percentage: number;
  description: string;
  strengths: string[];
  challenges: string[];
  reflectionPrompts: string[];
  actionSuggestions: string[];
}

export interface BoundaryStyleResult {
  scores: Record<BoundaryStyleKey, BoundaryStyleScore>;
  primaryStyle: BoundaryStyleScore;
  secondaryStyle: BoundaryStyleScore;
  overallSummary: string;
}

export const BOUNDARY_QUESTIONS: BoundaryScenarioQuestion[] = [
  {
    id: 1,
    situation: {
      en: "A coworker asks you to take over a complex urgent task at 5:00 PM on Friday. You already have weekend personal plans. How do you respond?",
      id: "Rekan kerja meminta Anda mengambil alih tugas rumit mendadak pada Jumat sore jam 17:00. Anda sudah memiliki rencana pribadi di akhir pekan. Bagaimana Anda merespon?",
    },
    options: [
      {
        id: "a",
        style: "healthy",
        text: {
          en: "Warmly decline: 'I can't take this on tonight as my schedule is committed, but I can look at it first thing Monday morning.'",
          id: "Menolak dengan hangat: 'Saya tidak bisa mengerjakannya malam ini karena ada agenda pribadi, namun saya bisa bantu cek pertama kali di Senin pagi.'",
        },
      },
      {
        id: "b",
        style: "porous",
        text: {
          en: "Reluctantly say yes and cancel your weekend plans, feeling guilty about letting them down.",
          id: "Terpaksa mengiyakan dan membatalkan rencana akhir pekan, merasa bersalah jika harus menolak.",
        },
      },
      {
        id: "c",
        style: "rigid",
        text: {
          en: "Shut down the conversation abruptly without explanation, ignoring any further messages until Monday.",
          id: "Memutus pembicaraan secara dingin tanpa penjelasan dan mengabaikan semua pesan sampai hari Senin.",
        },
      },
      {
        id: "d",
        style: "selective",
        text: {
          en: "Evaluate whether you owe them a favor; accept only if it strategically benefits your relationship.",
          id: "Menimbang apakah Anda berutang budi padanya; menerima hanya jika itu secara strategis menguntungkan relasi.",
        },
      },
    ],
  },
  {
    id: 2,
    situation: {
      en: "An acquaintance asks intrusive personal questions about your finances, salary, or romantic life. What do you do?",
      id: "Seorang kenalan melontarkan pertanyaan yang sangat mencampuri urusan pribadi Anda tentang keuangan atau hubungan asmara. Apa yang Anda lakukan?",
    },
    options: [
      {
        id: "a",
        style: "healthy",
        text: {
          en: "Smile calmly and redirect: 'I prefer to keep my private details off the table, but I'd love to hear how your latest project is going.'",
          id: "Tersenyum tenang lalu mengalihkan: 'Saya lebih nyaman menjaga detail itu tetap privat, tapi bagaimana kabar proyek terbaru Anda?'",
        },
      },
      {
        id: "b",
        style: "porous",
        text: {
          en: "Answer uncomfortably with real details because staying silent feels too awkward or impolite.",
          id: "Menjawab dengan canggung dan memberikan detail nyata karena merasa tidak enak atau takut dicap tidak sopan.",
        },
      },
      {
        id: "c",
        style: "rigid",
        text: {
          en: "Glare sharply, give a curt cold one-word reply, and physically walk away immediately.",
          id: "Memandang sinis, menjawab ketus dengan satu kata, lalu langsung beranjak pergi meninggalkan tempat.",
        },
      },
      {
        id: "d",
        style: "selective",
        text: {
          en: "Give a vague half-truth or sarcastic deflection depending on how close you feel to them.",
          id: "Memberikan jawaban mengambang atau sarkasme ringan tergantung seberapa akrab Anda dengan mereka.",
        },
      },
    ],
  },
  {
    id: 3,
    situation: {
      en: "A family member or friend is in a perpetual state of emotional crisis and expects you to be on-call 24/7. How do you handle this?",
      id: "Seorang kerabat atau teman terus-menerus berada dalam krisis emosional dan mengharapkan Anda selalu siaga 24/7 mendengarkan curhatnya. Bagaimana Anda menyikapinya?",
    },
    options: [
      {
        id: "a",
        style: "healthy",
        text: {
          en: "Offer dedicated listening times: 'I love you and want to support you, so let's set aside 30 minutes tonight to chat with full presence.'",
          id: "Menyediakan waktu khusus terstruktur: 'Aku peduli padamu, mari kita luangkan waktu 30 menit malam ini agar aku bisa mendengarkan dengan penuh fokus.'",
        },
      },
      {
        id: "b",
        style: "porous",
        text: {
          en: "Pick up every call immediately, draining your own mental bandwidth until you feel burnt out and resentful.",
          id: "Mengangkat setiap panggilan kapan pun, menguras energi batin Anda sendiri hingga kelelahan dan mendongkol.",
        },
      },
      {
        id: "c",
        style: "rigid",
        text: {
          en: "Block or mute them entirely for weeks because dealing with other people's problems is too exhausting.",
          id: "Memblokir atau mematikan notifikasi mereka selama berminggu-minggu karena enggan berurusan dengan masalah orang.",
        },
      },
      {
        id: "d",
        style: "selective",
        text: {
          en: "Respond only when your own mood is pristine; otherwise ignore them without setting any explicit expectations.",
          id: "Hanya merespon saat suasana hati Anda sedang sangat luang; di luar itu menghilang tanpa penjelasan aturan main.",
        },
      },
    ],
  },
  {
    id: 4,
    situation: {
      en: "Someone borrows a valuable belonging or money from you and fails to return it by the agreed date. What is your recourse?",
      id: "Seseorang meminjam barang berharga atau uang dari Anda dan tidak mengembalikannya pada tanggal yang disepakati. Apa tindakan Anda?",
    },
    options: [
      {
        id: "a",
        style: "healthy",
        text: {
          en: "Send a polite, direct reminder: 'Hi, our agreed date was yesterday. When can I expect that returned?'",
          id: "Mengirim pengingat santun dan lugas: 'Hai, tenggat yang kita sepakati kemarin. Kapan barang/dana tersebut bisa dikembalikan?'",
        },
      },
      {
        id: "b",
        style: "porous",
        text: {
          en: "Say nothing and hope they remember on their own, fearing that bringing it up will make you look stingy.",
          id: "Berdiam diri berharap mereka ingat sendiri, karena takut dianggap pelit atau merusak hubungan jika menagih.",
        },
      },
      {
        id: "c",
        style: "rigid",
        text: {
          en: "Cut ties with them forever and consider the loss the price of cutting a toxic person from your life.",
          id: "Memutus pertemanan selamanya dan menganggap kerugian itu sebagai biaya mengeliminasi orang tersebut dari hidup.",
        },
      },
      {
        id: "d",
        style: "selective",
        text: {
          en: "Drop passive-aggressive hints around other mutual acquaintances until the pressure compels them to return it.",
          id: "Menyindir secara halus di depan teman bersama hingga mereka merasa tertekan untuk mengembalikannya.",
        },
      },
    ],
  },
  {
    id: 5,
    situation: {
      en: "You are physically exhausted after a demanding week. Friends invite you out for an energetic party. What do you do?",
      id: "Tubuh Anda sangat lelah setelah seminggu penuh bekerja. Teman-teman mengajak Anda ke pesta yang ramai. Apa keputusan Anda?",
    },
    options: [
      {
        id: "a",
        style: "healthy",
        text: {
          en: "Thank them warmly, state that your battery is empty, and commit to meeting up for a quiet lunch next week.",
          id: "Berterima kasih atas undangannya, menyatakan bahwa energi Anda habis, dan menjanjikan makan siang santai minggu depan.",
        },
      },
      {
        id: "b",
        style: "porous",
        text: {
          en: "Force yourself to go despite exhaustion to avoid FOMO or feeling like a party pooper.",
          id: "Memaksakan diri pergi meski badan letih demi menghindari rasa tertinggal atau takut dicap tidak asyik.",
        },
      },
      {
        id: "c",
        style: "rigid",
        text: {
          en: "Send a dry 'No' without pleasantries and wonder why people constantly bother you on weekends.",
          id: "Menolak singkat dengan kata 'Tidak' tanpa basa-basi dan heran mengapa orang sering mengganggu waktu luang Anda.",
        },
      },
      {
        id: "d",
        style: "selective",
        text: {
          en: "Show up for 20 minutes just to be seen, then slip out the back without saying goodbye to anyone.",
          id: "Datang sebentar selama 20 menit hanya agar terlihat hadir, lalu menyelinap pulang diam-diam tanpa pamit.",
        },
      },
    ],
  },
  {
    id: 6,
    situation: {
      en: "Someone in your social circle makes a sarcastic joke at your expense in front of a group. How do you respond?",
      id: "Seseorang di lingkaran pertemanan melontarkan lelucon sarkastik yang merendahkan Anda di depan umum. Bagaimana Anda merespon?",
    },
    options: [
      {
        id: "a",
        style: "healthy",
        text: {
          en: "Look them in the eye and say with composed clarity: 'I don't find that funny, please don't joke like that.'",
          id: "Menatap matanya dan berkata tenang namun tegas: 'Bagi saya itu tidak lucu, tolong jangan bercanda seperti itu lagi.'",
        },
      },
      {
        id: "b",
        style: "porous",
        text: {
          en: "Laugh along nervously to ease the room's tension while dying inside with embarrassment.",
          id: "Ikut tertawa canggung agar suasana tidak canggung, meski di dalam hati merasa sangat malu dan terluka.",
        },
      },
      {
        id: "c",
        style: "rigid",
        text: {
          en: "Erupt with an aggressive personal counterattack or storm out of the gathering immediately.",
          id: "Membalas dengan serangan balik yang agresif dan tajam atau langsung membanting pintu keluar ruangan.",
        },
      },
      {
        id: "d",
        style: "selective",
        text: {
          en: "Hold a silent grudge and calculate how to embarrass them equally in a future social situation.",
          id: "Menyimpan dendam diam-diam dan merencanakan cara mempermalukan mereka balik di kesempatan berikutnya.",
        },
      },
    ],
  },
  {
    id: 7,
    situation: {
      en: "A parent or elder demands you follow a traditional life milestone that contradicts your genuine values. What is your stance?",
      id: "Orang tua atau tokoh keluarga menuntut Anda mengikuti jalur hidup konvensional yang bertentangan dengan prinsip diri Anda. Apa sikap Anda?",
    },
    options: [
      {
        id: "a",
        style: "healthy",
        text: {
          en: "Honor their loving intention while standing firm on your own life direction with calm respect.",
          id: "Menghargai niat baik mereka namun tetap teguh pada arah hidup pilihan Anda dengan rasa hormat yang tenang.",
        },
      },
      {
        id: "b",
        style: "porous",
        text: {
          en: "Subjugate your dreams to their wishes because disappointing them feels unbearable.",
          id: "Mengorbankan impian Anda dan menuruti kemauan mereka karena tidak sanggup melihat mereka kecewa.",
        },
      },
      {
        id: "c",
        style: "rigid",
        text: {
          en: "Sever communication completely and denounce their worldview as backward and toxic.",
          id: "Memutus kontak sepenuhnya dan mengecam pandangan hidup mereka sebagai hal yang kaku dan usang.",
        },
      },
      {
        id: "d",
        style: "selective",
        text: {
          en: "Pretend to agree superficially to keep the peace while living a double life in secret.",
          id: "Berpura-pura menyetujui di depan mereka demi kedamaian, namun diam-diam menjalani hidup secara sembunyi-sembunyi.",
        },
      },
    ],
  },
  {
    id: 8,
    situation: {
      en: "You are invited into a group chat that is constantly pinging with drama and notifications all night. What do you do?",
      id: "Anda dimasukkan ke dalam grup obrolan yang terus berisik dengan gosip dan notifikasi sepanjang malam. Apa yang Anda lakukan?",
    },
    options: [
      {
        id: "a",
        style: "healthy",
        text: {
          en: "Mute notifications permanently or exit politely with a brief note that you are minimizing screen time.",
          id: "Mematikan notifikasi selamanya atau pamit keluar dengan sopan menyatakan sedang mengurangi waktu layar.",
        },
      },
      {
        id: "b",
        style: "porous",
        text: {
          en: "Keep checking every single message late into the night because leaving might offend someone.",
          id: "Terus memantau setiap pesan hingga larut malam karena takut menyinggung perasaan jika keluar grup.",
        },
      },
      {
        id: "c",
        style: "rigid",
        text: {
          en: "Leave the group instantly without a word, blocking several members who post frequently.",
          id: "Langsung keluar grup seketika tanpa pesan apa pun, dan memblokir nomor beberapa anggota yang cerewet.",
        },
      },
      {
        id: "d",
        style: "selective",
        text: {
          en: "Stay in the group as a silent lurker, reading everything without contributing or participating.",
          id: "Tetap bertahan sebagai penyimak pasif (silent reader), membaca gosip tanpa ikut berkomentar.",
        },
      },
    ],
  },
  {
    id: 9,
    situation: {
      en: "Someone offers unsolicited advice telling you how you 'should' raise your kids, manage your money, or run your life. How do you respond?",
      id: "Seseorang memberi nasihat tanpa diminta tentang bagaimana Anda 'seharusnya' mengatur keuangan, pola asuh, atau hidup Anda. Bagaimana respon Anda?",
    },
    options: [
      {
        id: "a",
        style: "healthy",
        text: {
          en: "Listen calmly, say 'Thank you for sharing your perspective, I have a method that works for me,' and move on.",
          id: "Mendengarkan tenang, berucap 'Terima kasih sudut pandangnya, saat ini saya memiliki metode yang cocok untuk saya,' lalu beralih.",
        },
      },
      {
        id: "b",
        style: "porous",
        text: {
          en: "Internalize their advice immediately, questioning your own competence and feeling inferior.",
          id: "Langsung menelan nasihat itu ke dalam hati, meragukan kompetensi diri sendiri dan merasa rendah diri.",
        },
      },
      {
        id: "c",
        style: "rigid",
        text: {
          en: "Snap back sharply: 'Did I ask for your opinion? Mind your own business.'",
          id: "Menyahut pedas: 'Apakah saya meminta pendapat Anda? Urus saja urusan Anda sendiri.'",
        },
      },
      {
        id: "d",
        style: "selective",
        text: {
          en: "Smile superficially while mentally writing them off as an arrogant person you won't respect.",
          id: "Tersenyum basa-basi di luar sembari mencap orang tersebut sombong dalam hati.",
        },
      },
    ],
  },
  {
    id: 10,
    situation: {
      en: "When you successfully say 'No' to a request that crosses your boundaries, what is your internal experience?",
      id: "Ketika Anda berhasil berkata 'Tidak' pada permintaan yang melewati batas diri Anda, apa perasaan batin yang muncul?",
    },
    options: [
      {
        id: "a",
        style: "healthy",
        text: {
          en: "A sense of calm, grounded relief and self-respect, knowing that saying no to them is saying yes to your wellbeing.",
          id: "Rasa tenang dan harga diri yang utuh, menyadari bahwa berkata tidak pada hal itu berarti menjaga kesehatan mental sendiri.",
        },
      },
      {
        id: "b",
        style: "porous",
        text: {
          en: "Debilitating guilt and anxiety, ruminating for hours whether they hate you now.",
          id: "Rasa bersalah dan cemas yang mendalam, terus memikirkan selama berjam-jam apakah mereka sekarang membenci Anda.",
        },
      },
      {
        id: "c",
        style: "rigid",
        text: {
          en: "Tense defensiveness and high armor, ready to fight if they dare challenge your refusal.",
          id: "Sikap tegang dan kewaspadaan tinggi, siap bertengkar jika mereka berani mempertanyakan penolakan Anda.",
        },
      },
      {
        id: "d",
        style: "selective",
        text: {
          en: "Smug satisfaction or calculated relief that you successfully dodged an inconvenient burden.",
          id: "Kepuasan pragmatis bahwa Anda berhasil menghindar dari beban yang merepotkan.",
        },
      },
    ],
  },
];

const STYLE_META: Record<
  BoundaryStyleKey,
  {
    name: { en: string; id: string };
    desc: { en: string; id: string };
    strengths: { en: string[]; id: string[] };
    challenges: { en: string[]; id: string[] };
    reflectionPrompts: { en: string[]; id: string[] };
    actionSuggestions: { en: string[]; id: string[] };
  }
> = {
  healthy: {
    name: {
      en: "Balanced & Grounded Boundaries",
      id: "Batasan Seimbang & Selaras (Balanced & Grounded)",
    },
    desc: {
      en: "You maintain clear, compassionate limits. You can decline requests without guilt, communicate needs transparently, and protect your energy while maintaining warm connections.",
      id: "Anda memiliki batasan diri yang jernih dan berlandaskan welas asih. Anda mampu menolak tanpa rasa bersalah berlebih, mengomunikasikan kebutuhan dengan santun, serta melindungi energi diri tanpa memutus kehangatan.",
    },
    strengths: {
      en: [
        "High emotional stamina and resilience against burnout",
        "Clear, trustworthy relationships built on authentic consent",
        "Able to say 'no' to demands while saying 'yes' to connection",
      ],
      id: [
        "Ketahanan emosional yang baik dan terlindung dari kejenuhan mental",
        "Hubungan yang saling percaya karena berlandaskan kesukarelaan sejati",
        "Mampu berkata 'tidak' pada tuntutan tanpa harus memusuhi orangnya",
      ],
    },
    challenges: {
      en: [
        "May still face resistance from people used to unchecked access",
        "Requires consistent mindfulness to maintain in high-pressure seasons",
        "Can be tested when power dynamics (e.g. employers, elders) are unequal",
      ],
      id: [
        "Terkadang mendapat perlawanan dari pihak yang terbiasa menuntut tanpa batas",
        "Membutuhkan kesadaran diri konsisten saat berada di bawah tekanan tinggi",
        "Bisa diuji saat menghadapi relasi kuasa (atasan, senior, atau tokoh keluarga)",
      ],
    },
    reflectionPrompts: {
      en: [
        "In which specific relationship is it still hardest for me to maintain my grounded boundaries?",
        "How do I support peers who struggle to set boundaries with me?",
      ],
      id: [
        "Dalam relasi spesifik mana saya masih merasa paling tertantang menjaga batasan diri?",
        "Bagaimana saya bisa membantu teman yang kesulitan menetapkan batasan terhadap saya?",
      ],
    },
    actionSuggestions: {
      en: [
        "Continue using the 'No with alternative' formula: 'I can't do X, but I can do Y.'",
        "Mentor others gently by modeling transparent communication of personal capacity.",
      ],
      id: [
        "Terus gunakan formula 'Penolakan berbobot': 'Saya tidak bisa membantu X, namun saya bersedia untuk Y.'",
        "Jadilah teladan yang sehat dalam mengomunikasikan batas kapasitas secara jujur.",
      ],
    },
  },
  porous: {
    name: {
      en: "Porous & Over-Accommodating",
      id: "Batasan Longgar & Mudah Berkorban (Porous)",
    },
    desc: {
      en: "You have difficulty saying 'no' and tend to prioritize others' comfort above your own basic needs, often leading to overwhelm and lingering resentment.",
      id: "Anda kerap kesulitan menolak permintaan dan cenderung mendahulukan kenyamanan orang lain di atas kebutuhan dasar Anda sendiri, yang seringkali berujung pada rasa lelah dan kejengkelan terpendam.",
    },
    strengths: {
      en: [
        "Deeply generous, caring, and attuned to other people's distress",
        "Willing to go the extra mile for friends and community",
        "High empathy and capacity for supportive caretaking",
      ],
      id: [
        "Sangat murah hati, penuh perhatian, dan peka terhadap kesulitan sesama",
        "Rela berkorban untuk mendukung kelancaran keluarga dan rekan",
        "Memiliki kapasitas empati yang mendalam dalam merawat hubungan",
      ],
    },
    challenges: {
      en: [
        "High risk of chronic emotional exhaustion and physical burnout",
        "Resentment festers when silent sacrifices are not reciprocated",
        "Loss of connection to your own desires, preferences, and identity",
      ],
      id: [
        "Risiko tinggi mengalami kelelahan mental kronis dan burnout fisik",
        "Tumbuh rasa dongkol saat pengorbanan Anda tidak dihargai sepadan",
        "Bisa kehilangan kontak dengan keinginan dan jati diri pribadi",
      ],
    },
    reflectionPrompts: {
      en: [
        "What am I afraid will happen if I say 'No' to someone I care about?",
        "Whose feelings am I managing that are actually their own responsibility?",
      ],
      id: [
        "Apa ketakutan terbesar saya jika saya berkata 'Tidak' pada orang yang saya sayangi?",
        "Perasaan siapa yang selama ini saya tanggung padahal itu sebenarnya tanggung jawab mereka?",
      ],
    },
    actionSuggestions: {
      en: [
        "Practice a 10-minute pause before committing: 'Let me check my calendar and get back to you.'",
        "Remind yourself daily: 'Saying no to an unreasonable demand is an act of honesty, not selfishness.'",
      ],
      id: [
        "Terapkan jeda 10 menit sebelum mengiyakan: 'Beri saya waktu mengecek jadwal saya terlebih dahulu.'",
        "Ingatkan diri setiap hari: 'Menolak tuntutan berlebih adalah bentuk kejujuran, bukan keegoisan.'",
      ],
    },
  },
  rigid: {
    name: {
      en: "Rigid & Heavily Shielded",
      id: "Batasan Kaku & Benteng Pertahanan (Rigid)",
    },
    desc: {
      en: "You protect yourself with high walls, keeping people at a distance to avoid being hurt, controlled, or overwhelmed, which can lead to interpersonal isolation.",
      id: "Anda melindungi diri dengan tembok pertahanan tinggi, menjaga jarak aman agar tidak terluka, dimanfaatkan, atau dikendalikan orang lain, yang terkadang memicu rasa kesepian atau keterasingan.",
    },
    strengths: {
      en: [
        "Strong self-reliance; rare vulnerability to exploitation or manipulation",
        "Exceptional clarity on what you will not tolerate",
        "Fiercely protective of personal peace and independence",
      ],
      id: [
        "Kemandirian tinggi; sangat sulit dimanfaatkan atau dimanipulasi",
        "Kejelasan mutlak mengenai apa yang tidak bisa Anda toleransi",
        "Perlindungan ketat terhadap ketenangan dan ruang privasi pribadi",
      ],
    },
    challenges: {
      en: [
        "Missed opportunities for deep, warm, and intimate relationships",
        "Others may perceive you as unapproachable, cold, or defensive",
        "Relational friction when minor boundaries are enforced with excessive force",
      ],
      id: [
        "Kehilangan kesempatan menjalin hubungan mendalam yang hangat dan bermakna",
        "Orang lain mungkin memandang Anda sebagai sosok yang dingin atau sulit didekati",
        "Gesekan interpersonal ketika pelanggaran kecil ditanggapi dengan reaksi berlebihan",
      ],
    },
    reflectionPrompts: {
      en: [
        "Is my wall protecting me from real danger, or keeping away healthy warmth and care?",
        "Who is one person with whom I could safely lower my guard by 10%?",
      ],
      id: [
        "Apakah benteng ini melindungi saya dari bahaya nyata, atau justru menghalangi kehangatan yang tulus?",
        "Siapakah satu orang yang cukup aman bagi saya untuk menurunkan pertahanan 10%?",
      ],
    },
    actionSuggestions: {
      en: [
        "Practice communicating limits with warmth: replace blunt shut-downs with gentle, respectful explanations.",
        "Differentiate between safe, trustworthy individuals and past figures who violated your boundaries.",
      ],
      id: [
        "Latih menyampaikan batasan dengan nada ramah: ganti reaksi ketus dengan penjelasan santun.",
        "Bedakan secara objektif antara orang tepercaya saat ini dan figur masa lalu yang pernah mengecewakan Anda.",
      ],
    },
  },
  selective: {
    name: {
      en: "Selective & Context-Dependent",
      id: "Batasan Selektif & Kontekstual (Selective)",
    },
    desc: {
      en: "Your boundaries vary widely depending on context, status, or mood—sometimes firm, sometimes evasive, adapting dynamically based on social calculations.",
      id: "Batasan diri Anda sangat bervariasi bergantung situasi, status sosial, atau suasana hati—terkadang tegas, terkadang menghindar, beradaptasi secara kalkulatif sesuai konteks.",
    },
    strengths: {
      en: [
        "High social adaptability and diplomatic situational awareness",
        "Able to read power dynamics and navigate politics smoothly",
        "Protects interests without drawing unnecessary open conflicts",
      ],
      id: [
        "Kemampuan adaptasi sosial dan kepekaan situasi yang cerdas",
        "Mampu membaca peta relasi dan dinamika sosial dengan cermat",
        "Melindungi kepentingan diri tanpa memicu konfrontasi terbuka yang berisiko",
      ],
    },
    challenges: {
      en: [
        "Others may find your boundaries unpredictable or confusing",
        "Risk of relying on passive-aggressive evasion rather than direct clarity",
        "Can feel internally fragmented if your rules constantly shift",
      ],
      id: [
        "Orang sekitar bisa bingung karena aturan batasan Anda yang sering berubah-ubah",
        "Kecenderungan memakai sindiran halus atau menghindar ketimbang bicara terbuka",
        "Bisa merasa lelah secara batin jika standar perlakuan diri terus berganti-ganti",
      ],
    },
    reflectionPrompts: {
      en: [
        "Am I communicating my true expectations directly, or hoping others guess them from subtle hints?",
        "What baseline boundaries should apply across all areas of my life without exception?",
      ],
      id: [
        "Apakah saya mengomunikasikan batasan secara jujur, atau berharap orang menebak kode halus saya?",
        "Standar dasar apa yang seharusnya berlaku di semua aspek hidup saya tanpa kecuali?",
      ],
    },
    actionSuggestions: {
      en: [
        "Define 3 non-negotiable personal principles that stay constant regardless of social company.",
        "Replace passive hinting with direct, polite requests whenever expectations matter.",
      ],
      id: [
        "Rumuskan 3 prinsip dasar yang tetap konsisten di mana pun Anda berada tanpa terpengaruh gengsi.",
        "Ganti sindiran atau kode halus dengan permintaan langsung yang ramah dan lugas.",
      ],
    },
  },
};

export function calculateBoundaryScore(
  answers: Record<number, string>,
  lang: ToolLanguage
): BoundaryStyleResult {
  const counts: Record<BoundaryStyleKey, number> = {
    healthy: 0,
    porous: 0,
    rigid: 0,
    selective: 0,
  };

  BOUNDARY_QUESTIONS.forEach((q) => {
    const selectedOptionId = answers[q.id];
    if (selectedOptionId) {
      const option = q.options.find((opt) => opt.id === selectedOptionId);
      if (option) {
        counts[option.style] += 1;
      }
    }
  });

  const totalAnswered = Object.keys(answers).length || 1;

  const entries = (Object.keys(counts) as BoundaryStyleKey[]).map((key) => {
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

  entries.sort((a, b) => b.score.percentage - a.score.percentage);

  const scoresRecord = entries.reduce(
    (acc, curr) => {
      acc[curr.key] = curr.score;
      return acc;
    },
    {} as Record<BoundaryStyleKey, BoundaryStyleScore>
  );

  const primaryStyle = entries[0].score;
  const secondaryStyle = entries[1].score;

  let overallSummary = "";
  if (lang === "id") {
    overallSummary = `Pola batasan personal utama Anda adalah ${primaryStyle.name} (${primaryStyle.percentage}%), dengan kecenderungan sekunder berupa ${secondaryStyle.name} (${secondaryStyle.percentage}%). Pola ini menggambarkan bagaimana Anda mengelola kapasitas waktu, ruang privasi, dan perlindungan energi saat berinteraksi dengan lingkungan sosial.`;
  } else {
    overallSummary = `Your primary boundary style is ${primaryStyle.name} (${primaryStyle.percentage}%), with a secondary tendency toward ${secondaryStyle.name} (${secondaryStyle.percentage}%). This profile illustrates how you protect your time, emotional space, and personal autonomy across daily social exchanges.`;
  }

  return {
    scores: scoresRecord,
    primaryStyle,
    secondaryStyle,
    overallSummary,
  };
}

