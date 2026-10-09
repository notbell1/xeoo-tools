import type { ToolLanguage } from "./psychologyI18n";

export type ConflictStyleKey =
  | "collaborative"
  | "compromise"
  | "accommodating"
  | "assertive";

export interface ConflictScenarioOption {
  id: string;
  style: ConflictStyleKey;
  text: {
    en: string;
    id: string;
  };
}

export interface ConflictScenarioQuestion {
  id: number;
  situation: {
    en: string;
    id: string;
  };
  options: ConflictScenarioOption[];
}

export interface ConflictStyleScore {
  key: ConflictStyleKey;
  name: string;
  percentage: number;
  description: string;
  strengths: string[];
  challenges: string[];
  reflectionPrompts: string[];
  actionSuggestions: string[];
}

export interface ConflictStyleResult {
  scores: Record<ConflictStyleKey, ConflictStyleScore>;
  primaryStyle: ConflictStyleScore;
  secondaryStyle: ConflictStyleScore;
  overallSummary: string;
}

export const CONFLICT_QUESTIONS: ConflictScenarioQuestion[] = [
  {
    id: 1,
    situation: {
      en: "You and a colleague strongly disagree on how to execute an important joint presentation. Deadline is tomorrow. What do you do?",
      id: "Anda dan rekan kerja sangat berbeda pendapat mengenai cara membawakan presentasi penting bersama. Tenggat waktunya besok. Apa tindakan Anda?",
    },
    options: [
      {
        id: "a",
        style: "collaborative",
        text: {
          en: "Sit down immediately to dig into both ideas and build an innovative synthesis combining both strengths.",
          id: "Duduk bersama mencari akar ide dan merancang sintesis baru yang menggabungkan keunggulan kedua opsi.",
        },
      },
      {
        id: "b",
        style: "compromise",
        text: {
          en: "Propose a 50/50 split: you handle the first half their way, and the second half your way.",
          id: "Mengusulkan pembagian adil: paruh pertama memakai cara mereka, paruh kedua memakai cara Anda.",
        },
      },
      {
        id: "c",
        style: "accommodating",
        text: {
          en: "Yield to their preferred approach to avoid team tension and focus on supporting their vision smoothly.",
          id: "Mengalah pada pendekatan mereka demi menjaga keharmonisan tim dan fokus mendukung eksekusinya.",
        },
      },
      {
        id: "d",
        style: "assertive",
        text: {
          en: "Firmly advocate why your structure is objectively more effective and push for its adoption.",
          id: "Menjelaskan dengan tegas mengapa struktur Anda lebih efektif secara objektif dan mendorong pemakaiannya.",
        },
      },
    ],
  },
  {
    id: 2,
    situation: {
      en: "A family member repeatedly makes unsolicited lifestyle remarks that bother you. How do you address it?",
      id: "Anggota keluarga berulang kali memberi komentar usil tentang gaya hidup Anda yang membuat Anda risih. Bagaimana Anda menyikapinya?",
    },
    options: [
      {
        id: "a",
        style: "collaborative",
        text: {
          en: "Have a heartfelt one-on-one conversation to understand their underlying worry while sharing your personal feelings.",
          id: "Mengajak bicara empat mata untuk memahami kekhawatiran mereka sambil menjelaskan perasaan Anda dengan hangat.",
        },
      },
      {
        id: "b",
        style: "compromise",
        text: {
          en: "Politely redirect the topic and agree to discuss safe mutual subjects like food or movies instead.",
          id: "Mengalihkan topik dengan santai dan menyepakati topik umum seperti kuliner atau film untuk menjaga obrolan.",
        },
      },
      {
        id: "c",
        style: "accommodating",
        text: {
          en: "Smile patiently, nod, and let the comment pass without making an issue out of it.",
          id: "Tersenyum sabar, mengangguk, dan membiarkan komentar itu berlalu tanpa memperpanjang masalah.",
        },
      },
    {
        id: "d",
        style: "assertive",
        text: {
          en: "Directly and clearly say: 'I appreciate your concern, but my personal choices are not up for discussion.'",
          id: "Menyampaikan secara lugas: 'Terima kasih perhatiannya, namun keputusan pribadi saya bukan untuk diperdebatkan.'",
        },
      },
    ],
  },
  {
    id: 3,
    situation: {
      en: "Your roommate or partner consistently forgets to do their agreed household chore. How do you respond?",
      id: "Teman serumah atau pasangan berulang kali lupa menyelesaikan tugas rumah yang sudah disepakati. Bagaimana respon Anda?",
    },
    options: [
      {
        id: "a",
        style: "collaborative",
        text: {
          en: "Investigate why the current chore system fails and design a new routine that naturally fits both schedules.",
          id: "Mencari tahu penyebab sistem tugas saat ini macet dan merancang jadwal baru yang lebih cocok dengan rutinitas bersama.",
        },
      },
      {
        id: "b",
        style: "compromise",
        text: {
          en: "Offer to swap chores or alternate weeks so neither feels unfairly burdened.",
          id: "Menawarkan barter tugas atau giliran mingguan agar tidak ada pihak yang merasa terlalu terbebani.",
        },
      },
      {
        id: "c",
        style: "accommodating",
        text: {
          en: "Quietly do the chore yourself to keep the living space peaceful and orderly without nagging.",
          id: "Mengerjakan tugas itu sendiri secara hening demi menjaga kebersihan dan kedamaian tanpa perlu menegur.",
        },
      },
      {
        id: "d",
        style: "assertive",
        text: {
          en: "Remind them immediately of the shared agreement and ask them to finish their chore today.",
          id: "Mengingatkan langsung komitmen yang sudah disepakati dan meminta mereka menyelesaikannya hari ini juga.",
        },
      },
    ],
  },
  {
    id: 4,
    situation: {
      en: "During a project meeting, a teammate takes sole credit for an idea you originally developed. How do you react?",
      id: "Dalam rapat proyek, rekan tim mengklaim sepihak ide yang sebenarnya Anda gagas. Bagaimana respon Anda?",
    },
    options: [
      {
        id: "a",
        style: "collaborative",
        text: {
          en: "Speak up during discussion: 'I'm excited to expand on the seed idea I proposed earlier with the details they just highlighted.'",
          id: "Menyela santun di rapat: 'Senang melihat ide awal yang saya sampaikan tadi dikembangkan lebih lanjut dengan poin barunya.'",
        },
      },
      {
        id: "b",
        style: "compromise",
        text: {
          en: "Catch them privately after the meeting and ask them to share co-credit in the meeting summary notes.",
          id: "Menemui mereka setelah rapat secara privat dan meminta dicantumkan sebagai kontributor bersama di notula.",
        },
      },
      {
        id: "c",
        style: "accommodating",
        text: {
          en: "Let it go; what matters most is the project succeeds, not who gets the limelight.",
          id: "Mengikhlaskannya; yang terpenting adalah proyek berhasil berjalan lancar, bukan siapa yang dipuji.",
        },
      },
      {
        id: "d",
        style: "assertive",
        text: {
          en: "Directly state in the room that this concept was created by you and produce documentation if needed.",
          id: "Secara langsung menyatakan di forum bahwa konsep tersebut adalah rancangan Anda beserta bukti awalnya.",
        },
      },
    ],
  },
  {
    id: 5,
    situation: {
      en: "Two close friends are in an argument and both try to pull you onto their side. What is your stance?",
      id: "Dua teman dekat Anda bertengkar dan keduanya mencoba menarik Anda untuk berpihak. Apa sikap Anda?",
    },
    options: [
      {
        id: "a",
        style: "collaborative",
        text: {
          en: "Facilitate a neutral coffee chat between both to help them actively listen to each other's grievances.",
          id: "Memfasilitasi sesi ngobrol santai bertiga untuk membantu mereka saling mendengar keluhan masing-masing.",
        },
      },
      {
        id: "b",
        style: "compromise",
        text: {
          en: "Acknowledge partial valid points on both sides and encourage them to meet halfway.",
          id: "Mengakui kebenaran sebagian dari masing-masing pihak dan menyarankan mereka mencari kompromi.",
        },
      },
      {
        id: "c",
        style: "accommodating",
        text: {
          en: "Listen empathetically to both without challenging either, validating their emotions to comfort them.",
          id: "Mendengarkan curhatan keduanya dengan hangat tanpa membantah agar kedua belah pihak merasa didukung.",
        },
      },
      {
        id: "d",
        style: "assertive",
        text: {
          en: "Set an unmistakable boundary: 'I care for both of you, but I will not take sides in this dispute.'",
          id: "Memasang batasan tegas: 'Saya peduli pada kalian berdua, namun saya menolak ditarik ke dalam kubu manapun.'",
        },
      },
    ],
  },
  {
    id: 6,
    situation: {
      en: "Your contractor or service provider delivers work that falls short of quality expectations. What is your recourse?",
      id: "Penyedia jasa atau kontraktor memberikan hasil kerja yang di bawah standar kesepakatan. Apa langkah Anda?",
    },
    options: [
      {
        id: "a",
        style: "collaborative",
        text: {
          en: "Walk through the deliverables together to uncover the gaps and brainstorm how to revise them effectively.",
          id: "Memeriksa hasil kerja bersama untuk melihat kekurangannya dan merumuskan solusi perbaikan secara efektif.",
        },
      },
      {
        id: "b",
        style: "compromise",
        text: {
          en: "Ask for a partial discount or have them fix only the most glaring defects to save time.",
          id: "Meminta potongan harga sebagian atau meminta mereka memperbaiki hanya bagian yang paling krusial.",
        },
      },
      {
        id: "c",
        style: "accommodating",
        text: {
          en: "Accept the work as is, pay the bill, and resolve privately never to hire them again.",
          id: "Menerima hasil apa adanya, membayar lunas, dan memutuskan dalam hati untuk tidak memakai jasanya lagi.",
        },
      },
      {
        id: "d",
        style: "assertive",
        text: {
          en: "Reference the contract terms strictly and insist on full revision before any final payment.",
          id: "Merujuk klausul kontrak dengan tegas dan menuntut perbaikan menyeluruh sebelum pembayaran dilunasi.",
        },
      },
    ],
  },
  {
    id: 7,
    situation: {
      en: "In a group vacation planning, everyone wants beach destinations while you strongly prefer mountain trekking. What do you do?",
      id: "Saat merencanakan liburan kelompok, semua orang ingin ke pantai sedangkan Anda sangat ingin mendaki gunung. Apa yang Anda lakukan?",
    },
    options: [
      {
        id: "a",
        style: "collaborative",
        text: {
          en: "Research a unique hybrid destination (e.g. coastal mountains or island with hiking trails) that satisfies everyone.",
          id: "Mencari destinasi hibrida (seperti bukit pesisir atau pulau dengan jalur trekking) yang memuaskan kedua selera.",
        },
      },
      {
        id: "b",
        style: "compromise",
        text: {
          en: "Go with the group to the beach for two days if they agree to take one day for a nature hike nearby.",
          id: "Ikut ke pantai selama 2 hari dengan syarat mereka meluangkan 1 hari untuk jalan-jalan ke alam bukit terdekat.",
        },
      },
      {
        id: "c",
        style: "accommodating",
        text: {
          en: "Happily go along with the group's beach consensus because spending time together matters most.",
          id: "Dengan senang hati mengikuti pilihan mayoritas ke pantai karena kebersamaan kelompok yang paling berharga.",
        },
      },
      {
        id: "d",
        style: "assertive",
        text: {
          en: "Politely opt out of this specific trip and plan your own mountain trip that genuinely excites you.",
          id: "Menolak ikut dengan sopan untuk perjalanan kali ini dan memilih merencanakan pendakian sendiri yang Anda minati.",
        },
      },
    ],
  },
  {
    id: 8,
    situation: {
      en: "You discover someone has unintentionally misrepresented your statements in an email thread. How do you resolve it?",
      id: "Anda mendapati seseorang tanpa sengaja keliru mengutip ucapan Anda dalam utas email kerja. Bagaimana Anda meluruskannya?",
    },
    options: [
      {
        id: "a",
        style: "collaborative",
        text: {
          en: "Reply constructively adding clarity and nuance, reinforcing common goals without embarrassing the sender.",
          id: "Membalas email dengan klarifikasi bernuansa positif, memperkuat visi bersama tanpa membuat pengirim malu.",
        },
      },
      {
        id: "b",
        style: "compromise",
        text: {
          en: "Send a quick side-message to the sender asking them to mention the clarification on the next update.",
          id: "Mengirim pesan pribadi ke rekan tersebut meminta agar poin klarifikasi disisipkan pada update berikutnya.",
        },
      },
      {
        id: "c",
        style: "accommodating",
        text: {
          en: "Decide the misstatement is minor enough not to stir the pot, letting it slide unless questions arise.",
          id: "Menilai salah paham tersebut cukup kecil dan memilih tidak memperpanjang kecuali ada pihak yang bertanya.",
        },
      },
      {
        id: "d",
        style: "assertive",
        text: {
          en: "Reply immediately to the thread with exact quotes to rectify the record publicly and definitively.",
          id: "Segera membalas langsung di utas tersebut dengan kutipan persis untuk memastikan catatan publik akurat.",
        },
      },
    ],
  },
  {
    id: 9,
    situation: {
      en: "Your team has limited budget and two initiatives compete for funding. How do you argue the outcome?",
      id: "Tim Anda memiliki anggaran terbatas dan dua inisiatif saling bersaing untuk mendapatkan pendanaan. Bagaimana sikap Anda?",
    },
    options: [
      {
        id: "a",
        style: "collaborative",
        text: {
          en: "Map out synergies to create a unified pilot project delivering wins for both initiatives.",
          id: "Memetakan sinergi untuk membuat pilot project terpadu yang memberikan manfaat bagi kedua inisiatif.",
        },
      },
      {
        id: "b",
        style: "compromise",
        text: {
          en: "Propose splitting the budget down the middle, scaling down both initiatives proportionally.",
          id: "Mengusulkan pembagian dana 50/50, dengan memangkas skala kedua inisiatif secara proporsional.",
        },
      },
      {
        id: "c",
        style: "accommodating",
        text: {
          en: "Step aside and let the other initiative take priority if they demonstrate strong passion for it.",
          id: "Mengalah dan memprioritaskan inisiatif lain jika rekan menunjukkan antusiasme dan urgensi yang besar.",
        },
      },
      {
        id: "d",
        style: "assertive",
        text: {
          en: "Present hard ROI metrics showing why your initiative delivers superior business value and must be funded first.",
          id: "Menyajikan data ROI objektif mengapa inisiatif Anda memberi dampak lebih besar dan harus didanai lebih dulu.",
        },
      },
    ],
  },
  {
    id: 10,
    situation: {
      en: "After an exhausting negotiation, you are close to a deal but one stubborn clause remains unsettled. How do you push forward?",
      id: "Setelah negosiasi panjang, kesepakatan hampir selesai namun tersisa satu klausul alot yang belum tuntas. Bagaimana Anda menyelesaikannya?",
    },
    options: [
      {
        id: "a",
        style: "collaborative",
        text: {
          en: "Explore the underlying interests beneath the clause to craft a creative alternative wording satisfactory to both.",
          id: "Mencari kepentingan mendasar di balik klausul tersebut guna merumuskan redaksi alternatif yang saling memuaskan.",
        },
      },
      {
        id: "b",
        style: "compromise",
        text: {
          en: "Offer a concession on this clause in exchange for a favorable term elsewhere in the contract.",
          id: "Memberi konsesi pada klausul ini dengan imbalan syarat yang lebih menguntungkan di klausul lain.",
        },
      },
      {
        id: "c",
        style: "accommodating",
        text: {
          en: "Yield on the clause to finalize the relationship and prevent the entire deal from collapsing.",
          id: "Mengalah pada klausul tersebut demi mengunci kesepakatan dan mencegah seluruh kerja sama gagal.",
        },
      },
      {
        id: "d",
        style: "assertive",
        text: {
          en: "Hold firm on your baseline position; if they cannot meet the requirement, you are prepared to walk away.",
          id: "Mempertahankan batas minimal Anda secara tegas; jika tidak disetujui, Anda siap membatalkan kesepakatan.",
        },
      },
    ],
  },
];

const STYLE_META: Record<
  ConflictStyleKey,
  {
    name: { en: string; id: string };
    desc: { en: string; id: string };
    strengths: { en: string[]; id: string[] };
    challenges: { en: string[]; id: string[] };
    reflectionPrompts: { en: string[]; id: string[] };
    actionSuggestions: { en: string[]; id: string[] };
  }
> = {
  collaborative: {
    name: {
      en: "Collaborative (Win-Win Problem Solver)",
      id: "Kolaboratif (Pemecah Masalah Win-Win)",
    },
    desc: {
      en: "You treat conflict as an opportunity to discover integrative solutions, investing energy to satisfy the underlying needs of all stakeholders.",
      id: "Anda memandang perbedaan pendapat sebagai peluang untuk menciptakan solusi terpadu, mendedikasikan energi untuk memuaskan kebutuhan mendasar semua pihak.",
    },
    strengths: {
      en: [
        "Builds lasting trust and high-commitment agreements",
        "Discovers innovative synergy that neither party envisioned initially",
        "Preserves relational warmth without sacrificing quality",
      ],
      id: [
        "Membangun rasa saling percaya jangka panjang dan komitmen kuat",
        "Menemukan sinergi inovatif yang tidak terpikirkan oleh masing-masing pihak sebelumnya",
        "Menjaga kehangatan hubungan tanpa mengorbankan kualitas hasil",
      ],
    },
    challenges: {
      en: [
        "Can be time and energy consuming when decisions are minor or urgent",
        "Vulnerable if the counterpart acts purely opportunistically",
        "May cause decision paralysis trying to please everyone perfectly",
      ],
      id: [
        "Membutuhkan banyak waktu dan energi saat keputusan bersifat sepele atau mendesak",
        "Rentan dimanfaatkan jika lawan negosiasi beritikad sepihak",
        "Bisa memicu kelambatan keputusan karena berusaha memuaskan semua orang secara sempurna",
      ],
    },
    reflectionPrompts: {
      en: [
        "When is an issue minor enough that a simple compromise or quick concession is wiser than deep collaboration?",
        "Am I spending too much cognitive effort mediating low-stakes disagreements?",
      ],
      id: [
        "Kapan suatu masalah cukup sederhana sehingga kompromi cepat lebih bijak daripada kolaborasi mendalam?",
        "Apakah saya menghabiskan terlalu banyak energi menengahi perselisihan kecil?",
      ],
    },
    actionSuggestions: {
      en: [
        "Reserve collaborative deep dives for high-stakes core relationships and critical projects.",
        "Set strict timeboxes for discovery conversations to avoid endless deliberation.",
      ],
      id: [
        "Fokuskan kolaborasi mendalam untuk relasi inti jangka panjang dan proyek bernilai tinggi.",
        "Tentukan batasan waktu yang jelas dalam berdiskusi agar tidak berlarut-larut.",
      ],
    },
  },
  compromise: {
    name: {
      en: "Compromising (Pragmatic Deal Maker)",
      id: "Kompromis (Negosiator Pragmatis)",
    },
    desc: {
      en: "You aim for pragmatic middle ground where everyone gets part of what they want, valuing speed, fairness, and workable momentum.",
      id: "Anda mengutamakan titik temu pragmatis di mana setiap pihak mendapatkan sebagian keinginannya, mengutamakan kecepatan, keadilan, dan kelancaran.",
    },
    strengths: {
      en: [
        "Quickly unblocks deadlocks and restores momentum",
        "Maintains a balanced sense of reciprocal fairness",
        "Practical and realistic when resources and time are finite",
      ],
      id: [
        "Cepat mengurai kebuntuan dan mengembalikan kelancaran aktivitas",
        "Menjaga rasa keadilan yang seimbang bagi kedua belah pihak",
        "Praktis dan realistis di tengah keterbatasan waktu serta sumber daya",
      ],
    },
    challenges: {
      en: [
        "May settle for suboptimal half-solutions rather than exploring breakthrough ideas",
        "Neither party feels fully excited about a diluted outcome",
        "Can overlook deeper core root causes beneath the surface",
      ],
      id: [
        "Bisa puas dengan solusi setengah matang daripada mencari terobosan yang lebih baik",
        "Kedua belah pihak mungkin tidak sepenuhnya puas karena masing-masing harus mengalah",
        "Dapat mengabaikan akar masalah mendasar yang belum tuntas",
      ],
    },
    reflectionPrompts: {
      en: [
        "Did we split the difference because it was truly fair, or just to avoid uncomfortable tension?",
        "What essential values are non-negotiable and shouldn't be compromised away?",
      ],
      id: [
        "Apakah kami membagi dua karena adil, atau sekadar ingin cepat menyudahi ketegangan?",
        "Nilai inti apa yang sejatinya tidak boleh dikompromikan?",
      ],
    },
    actionSuggestions: {
      en: [
        "Before proposing a 50/50 split, ask: 'Is there a creative solution where neither of us has to sacrifice our primary goal?'",
        "Document follow-up reviews to ensure compromise terms remain healthy over time.",
      ],
      id: [
        "Sebelum mengusulkan bagi dua, tanyakan: 'Adakah opsi kreatif di mana kita tidak perlu mengorbankan tujuan utama?'",
        "Buat evaluasi berkala untuk memastikan hasil kompromi tetap berjalan adil.",
      ],
    },
  },
  accommodating: {
    name: {
      en: "Accommodating (Harmony Preserver)",
      id: "Akomodatif (Penjaga Keharmonisan)",
    },
    desc: {
      en: "You prioritize social harmony and peace, readily conceding ground or putting others' preferences first to preserve relational goodwill.",
      id: "Anda mengutamakan keharmonisan sosial dan ketenteraman, bersedia mengalah dan mendahulukan kenyamanan orang lain demi menjaga hubungan baik.",
    },
    strengths: {
      en: [
        "Warm, patient, and exceptionally easy to collaborate with",
        "Protects interpersonal peace in high-emotion situations",
        "Builds strong social goodwill when conceding on low-stakes issues",
      ],
      id: [
        "Hangat, sabar, dan sangat menyenangkan untuk diajak bekerja sama",
        "Melindungi suasana damai dalam situasi yang sarat emosi",
        "Menumpuk rasa simpati dan apresiasi sosial dari orang di sekitar",
      ],
    },
    challenges: {
      en: [
        "Can foster resentment if you continually suppress your own needs",
        "Others may unintentionally take your flexibility for granted",
        "Important perspectives get lost when you stay silent to avoid friction",
      ],
      id: [
        "Dapat menumpuk kejengkelan batin jika terus-menerus mengorbankan kebutuhan sendiri",
        "Kebaikan dan fleksibilitas Anda bisa disalahpahami atau dimanfaatkan pihak lain",
        "Sudut pandang penting tidak tersampaikan karena takut memicu gesekan",
      ],
    },
    reflectionPrompts: {
      en: [
        "Am I choosing peace with others at the expense of inner peace with myself?",
        "When was the last time I stood ground on an issue that mattered to my core values?",
      ],
      id: [
        "Apakah saya mendamaikan suasana luar dengan mengorbankan ketenangan batin sendiri?",
        "Kapan terakhir kali saya berani mempertahankan hal yang sangat prinsipil bagi saya?",
      ],
    },
    actionSuggestions: {
      en: [
        "Practice expressing preferences in low-risk scenarios (e.g. food choices, movie selections).",
        "Before conceding, take a deliberate breath and evaluate: 'Will yielding here cause me resentment tomorrow?'",
      ],
      id: [
        "Latih menyuarakan preferensi pada situasi sederhana (pilihan makanan, rencana santai).",
        "Sebelum mengalah, ambil jeda dan tanyakan: 'Apakah mengalah di sini akan membuat saya mendongkol besok?'",
      ],
    },
  },
  assertive: {
    name: {
      en: "Assertive (Principled Boundary Defender)",
      id: "Asertif & Lugas (Penjaga Batasan Prinsipil)",
    },
    desc: {
      en: "You stand firm on principles, clarity, and accountability, defending essential standards directly and making decisive calls when necessary.",
      id: "Anda teguh pada prinsip, kejelasan, dan akuntabilitas, membela standar penting secara langsung dan berani mengambil keputusan tegas.",
    },
    strengths: {
      en: [
        "Clear expectations and strong boundary defense against exploitation",
        "Decisive and courageous in critical emergencies or high-stakes crises",
        "High efficiency; cuts through ambiguity and passive avoidance",
      ],
      id: [
        "Ekspektasi transparan dan perlindungan kuat terhadap batasan pribadi",
        "Tegas dan berani dalam kondisi kritis atau situasi darurat",
        "Efisien; menghilangkan ketidakjelasan dan basa-basi yang berputar-putar",
      ],
    },
    challenges: {
      en: [
        "Can be perceived as intimidating or unyielding by sensitive peers",
        "May trigger defensive reactions in counterparts, closing off dialogue",
        "Risk of winning the debate while damaging interpersonal rapport",
      ],
      id: [
        "Dapat dipersepsikan terlalu kaku atau mengintimidasi oleh orang yang sensitif",
        "Dapat memicu sikap defensif lawan bicara sehingga dialog tertutup",
        "Risiko memenangkan perdebatan namun merenggangkan hubungan pertemanan",
      ],
    },
    reflectionPrompts: {
      en: [
        "Is winning this specific point worth the emotional strain it places on the relationship?",
        "How can I pair firmness of truth with warmth of delivery?",
      ],
      id: [
        "Apakah memenangkan poin ini sebanding dengan ketegangan hubungan yang timbul?",
        "Bagaimana saya bisa memadukan ketegasan isi pesan dengan kehangatan penyampaian?",
      ],
    },
    actionSuggestions: {
      en: [
        "Use empathy buffers: validate the other party's intent before asserting your bottom line.",
        "Differentiate clearly between must-haves (core boundaries) and nice-to-haves (negotiable details).",
      ],
      id: [
        "Gunakan bantalan empati: hargai niat baik lawan bicara sebelum menyatakan batasan tegas Anda.",
        "Bedakan secara jernih antara hal prinsipil mutlak dan detail yang sebenarnya fleksibel.",
      ],
    },
  },
};

export function calculateConflictStyleScore(
  answers: Record<number, string>,
  lang: ToolLanguage
): ConflictStyleResult {
  const counts: Record<ConflictStyleKey, number> = {
    collaborative: 0,
    compromise: 0,
    accommodating: 0,
    assertive: 0,
  };

  CONFLICT_QUESTIONS.forEach((q) => {
    const selectedOptionId = answers[q.id];
    if (selectedOptionId) {
      const option = q.options.find((opt) => opt.id === selectedOptionId);
      if (option) {
        counts[option.style] += 1;
      }
    }
  });

  const totalAnswered = Object.keys(answers).length || 1;

  const entries = (Object.keys(counts) as ConflictStyleKey[]).map((key) => {
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
    {} as Record<ConflictStyleKey, ConflictStyleScore>
  );

  const primaryStyle = entries[0].score;
  const secondaryStyle = entries[1].score;

  let overallSummary = "";
  if (lang === "id") {
    overallSummary = `Gaya penyelesaian konflik utama Anda adalah ${primaryStyle.name} (${primaryStyle.percentage}%), dengan kecenderungan pendukung berupa ${secondaryStyle.name} (${secondaryStyle.percentage}%). Pola ini mencerminkan keseimbangan khas Anda antara memperjuangkan tujuan pribadi dan memelihara hubungan sosial saat timbul perbedaan kepentingan.`;
  } else {
    overallSummary = `Your dominant conflict navigation style is ${primaryStyle.name} (${primaryStyle.percentage}%), complemented by ${secondaryStyle.name} (${secondaryStyle.percentage}%). This reveals how you naturally balance assertive advocacy with relational warmth when handling inevitable friction.`;
  }

  return {
    scores: scoresRecord,
    primaryStyle,
    secondaryStyle,
    overallSummary,
  };
}

