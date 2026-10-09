import type { ToolLanguage } from "./psychologyI18n";

export type CopingStyleKey =
  | "problem_focused"
  | "emotion_processing"
  | "social_support"
  | "meaning_acceptance";

export interface CopingScenarioOption {
  id: string;
  style: CopingStyleKey;
  text: {
    en: string;
    id: string;
  };
}

export interface CopingScenarioQuestion {
  id: number;
  situation: {
    en: string;
    id: string;
  };
  options: CopingScenarioOption[];
}

export interface CopingStyleScore {
  key: CopingStyleKey;
  name: string;
  percentage: number;
  description: string;
  strengths: string[];
  challenges: string[];
  reflectionPrompts: string[];
  actionSuggestions: string[];
}

export interface CopingStyleResult {
  scores: Record<CopingStyleKey, CopingStyleScore>;
  primaryStyle: CopingStyleScore;
  secondaryStyle: CopingStyleScore;
  overallSummary: string;
}

export const COPING_QUESTIONS: CopingScenarioQuestion[] = [
  {
    id: 1,
    situation: {
      en: "You suddenly lose a primary source of income or a lucrative client contract. What is your primary coping mechanism?",
      id: "Anda mendadak kehilangan sumber penghasilan utama atau kontrak klien penting. Apa mekanisme koping utama Anda?",
    },
    options: [
      {
        id: "a",
        style: "problem_focused",
        text: {
          en: "Immediately draft a recovery roadmap, cut non-essential expenses, and send 10 new outreach emails today.",
          id: "Segera menyusun peta rencana pemulihan, memangkas pengeluaran sekunder, dan mengirim 10 penawaran baru hari ini.",
        },
      },
      {
        id: "b",
        style: "emotion_processing",
        text: {
          en: "Give yourself space to mourn the loss, write in your journal, and feel the shock without numbing it.",
          id: "Memberi ruang untuk merasakan kesedihan, menulis dalam jurnal, dan menghayati keterkejutan tanpa menutupinya.",
        },
      },
      {
        id: "c",
        style: "social_support",
        text: {
          en: "Call a trusted mentor or close friend to talk through your fears and brainstorm opportunities together.",
          id: "Menghubungi mentor atau sahabat tepercaya untuk mencurahkan kekhawatiran dan berdiskusi mencari peluang baru.",
        },
      },
      {
        id: "d",
        style: "meaning_acceptance",
        text: {
          en: "Accept that market fluctuations happen; reflect on how this forced closure might redirect you toward better alignment.",
          id: "Menerima bahwa pasang surut wajar terjadi; merenungkan bagaimana penutupan pintu ini bisa mengarahkan ke hal yang lebih baik.",
        },
      },
    ],
  },
  {
    id: 2,
    situation: {
      en: "A medical diagnosis or prolonged physical fatigue interrupts your daily routine. How do you adapt?",
      id: "Kondisi fisik yang menurun atau kelelahan berkepanjangan mengganggu rutinitas harian Anda. Bagaimana Anda beradaptasi?",
    },
    options: [
      {
        id: "a",
        style: "problem_focused",
        text: {
          en: "Research evidence-based nutritional protocols, optimize sleep schedules, and track physical symptoms systematically.",
          id: "Meriset panduan nutrisi berbasis bukti, mengoptimalkan jam tidur, dan memantau gejala fisik secara sistematis.",
        },
      },
      {
        id: "b",
        style: "emotion_processing",
        text: {
          en: "Sit with the vulnerability and frustration of having physical limitations, practicing somatic compassion.",
          id: "Menyelami kerapuhan dan rasa frustrasi akibat keterbatasan fisik, melatih welas asih pada tubuh.",
        },
      },
      {
        id: "c",
        style: "social_support",
        text: {
          en: "Ask family or community members for practical assistance with meals, errands, and emotional comfort.",
          id: "Meminta bantuan praktis kepada keluarga atau komunitas untuk keperluan makan, tugas harian, dan dukungan moril.",
        },
      },
      {
        id: "d",
        style: "meaning_acceptance",
        text: {
          en: "Radically accept that life includes physical vulnerability, using the slower pace to re-evaluate what truly matters.",
          id: "Menerima kenyataan kerapuhan raga, memanfaatkan tempo hidup yang melambat untuk mengevaluasi hal terpenting dalam hidup.",
        },
      },
    ],
  },
  {
    id: 3,
    situation: {
      en: "You fail an exam, license certification, or pitch contest that you spent months studying for. How do you cope?",
      id: "Anda gagal dalam ujian lisensi atau kompetisi penting yang telah Anda persiapkan selama berbulan-bulan. Bagaimana Anda mengatasinya?",
    },
    options: [
      {
        id: "a",
        style: "problem_focused",
        text: {
          en: "Analyze the score breakdown, identify curriculum weaknesses, and build a revised 60-day study sprint.",
          id: "Menganalisis rincian nilai, mengidentifikasi kelemahan materi, dan merancang jadwal belajar 60 hari yang baru.",
        },
      },
      {
        id: "b",
        style: "emotion_processing",
        text: {
          en: "Allow yourself to cry, express the heartbreak honestly, and rest deeply before touching any textbooks.",
          id: "Mengizinkan diri menangis, mengekspresikan rasa patah hati dengan jujur, dan beristirahat total sebelum belajar lagi.",
        },
      },
      {
        id: "c",
        style: "social_support",
        text: {
          en: "Reach out to study partners or peers who have walked this road to receive encouragement and solidarity.",
          id: "Menghubungi rekan seperjuangan atau senior yang pernah gagal untuk mendapatkan semangat dan solidaritas.",
        },
      },
      {
        id: "d",
        style: "meaning_acceptance",
        text: {
          en: "Remind yourself that exam scores do not define your intelligence or destiny; this setback builds character depth.",
          id: "Mengingatkan diri bahwa skor ujian tidak mendefinisikan kecerdasan atau masa depan; kegagalan ini membentuk kedewasaan.",
        },
      },
    ],
  },
  {
    id: 4,
    situation: {
      en: "A long-planned international trip is abruptly canceled due to external travel disruptions. How do you process it?",
      id: "Rencana liburan panjang impian dibatalkan mendadak karena kendala eksternal di luar kendali. Bagaimana Anda mengelolanya?",
    },
    options: [
      {
        id: "a",
        style: "problem_focused",
        text: {
          en: "Immediately file insurance claims, request refunds, and rebook an alternative local getaway for the same dates.",
          id: "Segera mengurus klaim asuransi tiket, meminta refund, dan memesan destinasi liburan lokal alternatif.",
        },
      },
      {
        id: "b",
        style: "emotion_processing",
        text: {
          en: "Acknowledge the stinging disappointment and vent the frustration in a creative outlet or personal audio log.",
          id: "Mengakui rasa kecewa mendalam dan menyalurkan kekesalan melalui karya kreatif atau catatan suara pribadi.",
        },
      },
      {
        id: "c",
        style: "social_support",
        text: {
          en: "Organize a dinner or game night with your travel companions to laugh through the disappointment together.",
          id: "Mengajak teman seperjalanan makan malam atau kumpul santai untuk menertawakan kekacauan tersebut bersama.",
        },
      },
      {
        id: "d",
        style: "meaning_acceptance",
        text: {
          en: "Trust the timing: perhaps avoiding that journey spared you unseen difficulties; focus on gratitude for safety.",
          id: "Mempercayai takdir baik: mungkin pembatalan ini menghindarkan dari musibah tak terduga; bersyukur atas keselamatan saat ini.",
        },
      },
    ],
  },
  {
    id: 5,
    situation: {
      en: "Your neighborhood or workplace experiences persistent high-stress chaos for weeks. How do you steady yourself?",
      id: "Lingkungan tempat tinggal atau kantor mengalami kekacauan dan stres tinggi berminggu-minggu. Bagaimana Anda bertahan?",
    },
    options: [
      {
        id: "a",
        style: "problem_focused",
        text: {
          en: "Create strict organizational silos, install noise-canceling routines, and optimize micro-workflows.",
          id: "Membuat sekat kerja yang rapi, memakai peredam bising, dan mengoptimalkan efisiensi alur kerja harian.",
        },
      },
      {
        id: "b",
        style: "emotion_processing",
        text: {
          en: "Practice evening mindfulness, breathwork, and emotional journaling to release toxic energy daily.",
          id: "Melakukan latihan hening, pernapasan sadar, dan menulis jurnal di malam hari untuk membuang energi negatif.",
        },
      },
      {
        id: "c",
        style: "social_support",
        text: {
          en: "Band together with neighbors or colleagues, holding regular check-in huddles to keep mutual morale high.",
          id: "Bergandengan tangan dengan rekan atau tetangga, saling menyapa dan memberi semangat agar moral bersama tetap terjaga.",
        },
      },
      {
        id: "d",
        style: "meaning_acceptance",
        text: {
          en: "Recognize that external storms are temporary phases; anchor your inner serenity independently of outer turmoil.",
          id: "Menyadari bahwa badai luar hanyalah fase sementara; menambatkan ketenangan batin tanpa bergantung pada suasana luar.",
        },
      },
    ],
  },
  {
    id: 6,
    situation: {
      en: "You undergo a painful romantic breakup or end of a close friendship. What anchors your recovery?",
      id: "Anda mengalami perpisahan asmara yang menyakitkan atau retaknya persahabatan akrab. Apa yang menopang pemulihan Anda?",
    },
    options: [
      {
        id: "a",
        style: "problem_focused",
        text: {
          en: "Re-organize living spaces, return shared belongings cleanly, and establish a constructive new daily schedule.",
          id: "Menata ulang ruangan, merapikan barang-barang bersama, dan membangun jadwal harian baru yang produktif.",
        },
      },
      {
        id: "b",
        style: "emotion_processing",
        text: {
          en: "Allow all waves of sadness, anger, and nostalgia to wash through you naturally without rushing recovery.",
          id: "Membiarkan gelombang kesedihan, kemarahan, dan kenangan mengalir alami tanpa memaksa diri cepat-cepat pulih.",
        },
      },
      {
        id: "c",
        style: "social_support",
        text: {
          en: "Lean heavily on trusted friends and family, letting them surround you with companionship and empathy.",
          id: "Bersandar pada sahabat dan keluarga tepercaya, membiarkan mereka menemani dan mendengarkan dengan penuh kasih.",
        },
      },
      {
        id: "d",
        style: "meaning_acceptance",
        text: {
          en: "Appreciate the lessons the relationship brought into your life while gracefully accepting that seasons change.",
          id: "Mensyukuri pelajaran hidup yang dihadirkan hubungan tersebut seraya menerima dengan lapang bahwa setiap babak ada akhirnya.",
        },
      },
    ],
  },
  {
    id: 7,
    situation: {
      en: "An unexpected major expense wipes out your emergency savings. How do you confront the setback?",
      id: "Pengeluaran darurat tak terduga menghabiskan tabungan darurat yang sudah dikumpulkan susah payah. Bagaimana Anda menghadapinya?",
    },
    options: [
      {
        id: "a",
        style: "problem_focused",
        text: {
          en: "Re-calculate monthly cash flow immediately and take up a freelance side-gig to rebuild the balance rapidly.",
          id: "Menghitung ulang arus kas bulanan seketika dan mengambil proyek sampingan untuk membangun kembali tabungan secepatnya.",
        },
      },
      {
        id: "b",
        style: "emotion_processing",
        text: {
          en: "Process the gut-punch feeling of financial vulnerability before jumping into frantic calculations.",
          id: "Mencerna rasa sesak dan cemas akibat guncangan finansial terlebih dahulu sebelum panik menghitung angka.",
        },
      },
      {
        id: "c",
        style: "social_support",
        text: {
          en: "Talk transparently with your spouse, family, or financial buddy to ensure you carry the challenge as a united team.",
          id: "Berbicara terbuka dengan pasangan, keluarga, atau teman finansial agar beban tersebut dipikul bersama sebagai tim.",
        },
      },
      {
        id: "d",
        style: "meaning_acceptance",
        text: {
          en: "Be grateful that the funds were there to resolve the emergency, acknowledging that money is a renewable resource.",
          id: "Bersyukur dana tersebut ada saat musibah terjadi, meyakini bahwa rezeki adalah hal yang bisa dicari kembali.",
        },
      },
    ],
  },
  {
    id: 8,
    situation: {
      en: "You are stuck in an unfair situation where you were blamed for someone else's mistake. How do you cope?",
      id: "Anda terjebak dalam situasi tidak adil di mana Anda disalahkan atas kesalahan yang diperbuat orang lain. Bagaimana Anda bertahan?",
    },
    options: [
      {
        id: "a",
        style: "problem_focused",
        text: {
          en: "Compile documented email trails, chronological timelines, and factual records to clear your name professionally.",
          id: "Mengumpulkan bukti email, linimasa kronologis, dan data faktual untuk membersihkan nama secara profesional.",
        },
      },
      {
        id: "b",
        style: "emotion_processing",
        text: {
          en: "Allow yourself to feel the righteous indignation safely through physical exercise or private expression.",
          id: "Mengalirkan rasa amarah dan ketidakadilan secara sehat melalui olahraga fisik atau tulisan privat.",
        },
      },
      {
        id: "c",
        style: "social_support",
        text: {
          en: "Confide in an ally or ombudsman within the organization to seek advice on navigating the political situation.",
          id: "Berkonsultasi dengan rekan tepercaya atau pihak penengah untuk mencari saran menavigasi dinamika politik tersebut.",
        },
      },
      {
        id: "d",
        style: "meaning_acceptance",
        text: {
          en: "Maintain inner integrity: knowing you acted honorably matters more than the temporary flawed verdict of others.",
          id: "Menjaga integritas batin: menyadari kebersihan nurani sendiri jauh lebih berharga daripada penilaian keliru orang lain.",
        },
      },
    ],
  },
  {
    id: 9,
    situation: {
      en: "A sudden power outage or computer crash destroys hours of unsaved creative work. What is your reaction?",
      id: "Mati lampu mendadak atau komputer mati merusak file karya kreatif berjam-jam yang belum tersimpan. Apa reaksi Anda?",
    },
    options: [
      {
        id: "a",
        style: "problem_focused",
        text: {
          en: "Check autosave cache recovery tools immediately; if gone, outline the structure and recreate it faster with lessons learned.",
          id: "Segera mengecek recovery cache; jika hilang, buat kerangka baru dan tulis ulang lebih cepat berbekal ingatan.",
        },
      },
      {
        id: "b",
        style: "emotion_processing",
        text: {
          en: "Let out a loud sigh, step away from the desk, and give yourself a 20-minute break to decompress the fury.",
          id: "Menghela napas panjang, menjauh dari meja, dan memberi jeda 20 menit untuk meredakan kekesalan sebelum mulai lagi.",
        },
      },
      {
        id: "c",
        style: "social_support",
        text: {
          en: "Message a fellow creator who understands the exact pain to share a wry laugh and mutual commiseration.",
          id: "Mengirim pesan ke sesama rekan kreatif yang memahami rasa perih tersebut untuk tertawa getir dan saling menguatkan.",
        },
      },
      {
        id: "d",
        style: "meaning_acceptance",
        text: {
          en: "Shrug with philosophical calm: the second version of creative work is almost always sharper and cleaner than the first.",
          id: "Menerima dengan tenang: draf kedua dari karya kreatif hampir selalu lebih matang dan rapi daripada versi pertama.",
        },
      },
    ],
  },
  {
    id: 10,
    situation: {
      en: "Looking back across your life's hardest storms, what fundamentally brought you through to the other side?",
      id: "Melihat kembali badai hidup paling berat yang pernah Anda lalui, apa yang secara fundamental mengantarkan Anda keluar selamat?",
    },
    options: [
      {
        id: "a",
        style: "problem_focused",
        text: {
          en: "Practical persistence, grit, tactical adjustments, and relentlessly solving problems step by step.",
          id: "Ketekunan praktis, kegigihan aksi, penyesuaian strategi, dan memecahkan masalah setahap demi setahap.",
        },
      },
      {
        id: "b",
        style: "emotion_processing",
        text: {
          en: "Deep emotional authenticity, honoring my feelings honestly, and allowing grief to metabolize naturally.",
          id: "Kejujuran emosional yang mendalam, menghargai perasaan apa adanya, dan membiarkan duka terurai secara alami.",
        },
      },
      {
        id: "c",
        style: "social_support",
        text: {
          en: "The love, loyalty, and companionship of people who stood beside me and refused to let me fall alone.",
          id: "Cinta, kesetiaan, dan kebersamaan orang-orang terdekat yang berdiri di sampingku dan tidak membiarkanku jatuh sendiri.",
        },
      },
      {
        id: "d",
        style: "meaning_acceptance",
        text: {
          en: "Spiritual trust, radical acceptance, finding higher meaning in suffering, and surrendering control.",
          id: "Keyakinan spiritual, penerimaan ikhlas (acceptance), menemukan hikmah di balik ujian, dan melepaskan kendali.",
        },
      },
    ],
  },
];

const COPING_META: Record<
  CopingStyleKey,
  {
    name: { en: string; id: string };
    desc: { en: string; id: string };
    strengths: { en: string[]; id: string[] };
    challenges: { en: string[]; id: string[] };
    reflectionPrompts: { en: string[]; id: string[] };
    actionSuggestions: { en: string[]; id: string[] };
  }
> = {
  problem_focused: {
    name: {
      en: "Problem-Focused & Action-Oriented",
      id: "Fokus Masalah & Aksi Taktis (Problem-Focused)",
    },
    desc: {
      en: "You cope by taking direct charge of what can be modified. You dissect root causes, build roadmaps, and deploy practical steps to restore control.",
      id: "Anda mengatasi krisis dengan mengambil kendali langsung atas hal yang bisa diubah. Anda mengurai akar masalah, merancang peta tindakan, dan mengeksekusi langkah perbaikan.",
    },
    strengths: {
      en: [
        "High personal agency, grit, and practical resourcefulness",
        "Rapid recovery of tangible momentum after disruption",
        "Prevents passive helplessness through structured action",
      ],
      id: [
        "Rasa kendali diri yang tinggi, kegigihan, dan banyak akal praktis",
        "Cepat mengembalikan momentum nyata setelah terjadi disrupsi",
        "Mencegah rasa putus asa pasif melalui tindakan terstruktur",
      ],
    },
    challenges: {
      en: [
        "Frustration when confronted with unchangeable tragedies or losses",
        "May suppress emotional grief in a rush to 'fix' everything",
        "Risk of burnout from over-functioning during crises",
      ],
      id: [
        "Mudah frustrasi saat menghadapi situasi yang mutlak di luar kendali manusia",
        "Cenderung menekan rasa duka demi terburu-buru 'memperbaiki' situasi",
        "Risiko kelelahan fisik akibat memaksakan diri bekerja ekstra keras di tengah krisis",
      ],
    },
    reflectionPrompts: {
      en: [
        "When a situation cannot be fixed, do I know how to simply rest and be?",
        "Am I taking action because it truly helps, or just to escape feeling helpless?",
      ],
      id: [
        "Ketika situasi memang tidak bisa diperbaiki, apakah saya tahu cara untuk sekadar tenang dan menerima?",
        "Apakah saya bertindak karena benar-benar berguna, atau sekadar lari dari rasa tidak berdaya?",
      ],
    },
    actionSuggestions: {
      en: [
        "Use the Serenity Formula: separate aspects into 'Within Control' vs 'Beyond Control' before planning.",
        "Allocate scheduled rest blocks during crisis recovery periods.",
      ],
      id: [
        "Gunakan Formula Ketenangan: pisahkan aspek 'Bisa Dikendalikan' vs 'Di Luar Kendali' sebelum bertindak.",
        "Alokasikan jadwal istirahat wajib di sela-sela fase pemulihan krisis.",
      ],
    },
  },
  emotion_processing: {
    name: {
      en: "Emotion-Focused & Affective Processing",
      id: "Pengolahan Emosi & Kepekaan Afektif (Emotion-Processing)",
    },
    desc: {
      en: "You cope by honoring and metabolizing the emotional impact of events. You allow yourself to feel, mourn, journal, and release tension organically.",
      id: "Anda mengatasi kesulitan dengan menghargai dan mengurai dampak emosional dari peristiwa tersebut. Anda memberi ruang untuk merasakan, berduka, menulis, dan melepaskan beban secara organik.",
    },
    strengths: {
      en: [
        "Deep emotional authenticity, self-attunement, and somatic release",
        "Avoids toxic positivity or destructive emotional repressions",
        "High capacity for creative and psychological renewal",
      ],
      id: [
        "Kejujuran batin yang mendalam, kepekaan rasa, dan pelepasan beban fisik",
        "Terhindar dari jebakan kepositifan palsu (toxic positivity) atau represi emosi",
        "Kapasitas tinggi dalam melahirkan inspirasi dan pembaharuan jiwa",
      ],
    },
    challenges: {
      en: [
        "Risk of prolonged rumination or getting stuck in emotional heaviness",
        "May delay necessary logistical or practical adjustments",
        "Can feel completely drained by the intensity of one's own feelings",
      ],
      id: [
        "Risiko terjebak dalam perenungan berulang (ruminasi) atau kesedihan berlarut",
        "Bisa menunda tindakan logistik atau penyesuaian praktis yang mendesak",
        "Dapat merasa terkuras habis oleh intensitas emosi diri sendiri",
      ],
    },
    reflectionPrompts: {
      en: [
        "How do I recognize when healthy grieving turns into unproductive brooding?",
        "What small practical action would anchor my emotional recovery in reality?",
      ],
      id: [
        "Bagaimana saya mengenali saat duka yang sehat mulai berubah menjadi kesedihan berlarut yang buntu?",
        "Tindakan kecil nyata apa yang bisa menopang pemulihan emosi saya di dunia nyata?",
      ],
    },
    actionSuggestions: {
      en: [
        "Pair deep journaling with physical movement (a walk in nature or light stretching) to move energy.",
        "Set a boundary on processing time before transitioning to one small practical daily chore.",
      ],
      id: [
        "Padukan refleksi jurnal dengan aktivitas fisik (jalan di alam atau peregangan ringan) untuk menyalurkan energi.",
        "Beri batas waktu perenungan sebelum beralih menyelesaikan satu tugas kecil harian.",
      ],
    },
  },
  social_support: {
    name: {
      en: "Relational & Social Support Seeking",
      id: "Dukungan Sosial & Koneksi Relasional (Social Support)",
    },
    desc: {
      en: "You cope through connection, solidarity, and shared presence. You find solace in speaking with loved ones, seeking counsel, and walking through storms together.",
      id: "Anda menghadapi cobaan melalui koneksi kebersamaan, solidaritas, dan kehadiran orang lain. Anda menemukan ketenangan dengan berbicara pada orang terkasih, meminta nasihat, dan melangkah bersama.",
    },
    strengths: {
      en: [
        "Resilient social web and mutual emotional safety",
        "Reduced isolation and loneliness during traumatic events",
        "Draws from the collective wisdom and encouragement of a community",
      ],
      id: [
        "Jejaring sosial yang suportif dan rasa aman emosional bersama",
        "Terhindar dari keterasingan dan kesepian saat masa-masa traumatis",
        "Mendapat energi dari kebijaksanaan kolektif dan dorongan sahabat",
      ],
    },
    challenges: {
      en: [
        "Vulnerable if social circles are unavailable, distant, or unsupportive",
        "Risk of trauma-dumping or burning out close listeners",
        "May struggle to find inner grounding when in solitude",
      ],
      id: [
        "Rentan merasa terpuruk jika lingkaran pertemanan sedang berhalangan atau kurang suportif",
        "Risiko melimpahkan beban emosi berlebih (trauma-dumping) pada pendengar terdekat",
        "Terkadang kesulitan menemukan ketenangan batin saat sedang benar-benar sendirian",
      ],
    },
    reflectionPrompts: {
      en: [
        "Do I possess internal comforting practices when no one is available to talk?",
        "Am I checking in on whether my friends have the emotional capacity to listen today?",
      ],
      id: [
        "Apakah saya memiliki cara menenangkan diri sendiri saat tidak ada orang yang bisa diajak bicara?",
        "Apakah saya memastikan terlebih dahulu apakah teman saya memiliki kapasitas mental untuk mendengarkan hari ini?",
      ],
    },
    actionSuggestions: {
      en: [
        "Ask permission before heavy sharing: 'Do you have bandwidth for a 15-minute vent?'",
        "Cultivate solitary self-soothing rituals (e.g. music, tea, gentle walks) to complement relational support.",
      ],
      id: [
        "Tanyakan kesediaan sebelum curhat: 'Apakah kamu punya ruang dan waktu untuk mendengar curhatku sebentar?'",
        "Kembangkan ritual penenang pribadi (musik santai, teh hangat, jalan santai) untuk melengkapi dukungan rekan.",
      ],
    },
  },
  meaning_acceptance: {
    name: {
      en: "Meaning-Making & Radical Acceptance",
      id: "Penerimaan Radikal & Pencarian Hikmah (Meaning & Acceptance)",
    },
    desc: {
      en: "You cope by framing adversity within a broader philosophical or spiritual perspective. You embrace radical acceptance of reality and seek wisdom in hardship.",
      id: "Anda menghadapi kesulitan dengan membingkai cobaan dalam perspektif filosofis atau spiritual yang lebih luas. Anda menerapkan penerimaan ikhlas atas kenyataan dan mencari hikmah di balik peristiwa.",
    },
    strengths: {
      en: [
        "Deep existential peace that remains stable even during uncontrollable crises",
        "High tolerance for ambiguity, loss, and the unpredictable nature of life",
        "Transforms personal pain into wisdom and compassion for others",
      ],
      id: [
        "Kedamaian eksistensial mendalam yang tetap kokoh di tengah krisis yang tak bisa diubah",
        "Ketahanan tinggi menghadapi ketidakpastian, kehilangan, dan misteri kehidupan",
        "Mampu mengubah rasa sakit menjadi kebijaksanaan dan empati bagi sesama",
      ],
    },
    challenges: {
      en: [
        "Risk of spiritual bypassing: rushing to 'everything happens for a reason' prematurely",
        "May appear detached or fatalistic to peers who desire assertive action",
        "Can become passive in situations where active resistance or change is warranted",
      ],
      id: [
        "Risiko spiritual bypassing: terburu-buru mencari hikmah sebelum merasakan kepedihan secara jujur",
        "Dapat terkesan pasrah atau pasif di mata orang yang menginginkan tindakan tegas",
        "Bisa menjadi kurang berinisiatif pada situasi yang sebenarnya menuntut perlawanan atau perubahan nyata",
      ],
    },
    reflectionPrompts: {
      en: [
        "Am I accepting reality as it is, or resigning into passive helplessness?",
        "Have I allowed myself to fully grieve before jumping into finding a higher purpose?",
      ],
      id: [
        "Apakah saya benar-benar menerima realitas secara ikhlas, atau sekadar pasrah tanpa daya?",
        "Apakah saya sudah mengizinkan diri merasakan duka sebelum terburu-buru merumuskan hikmahnya?",
      ],
    },
    actionSuggestions: {
      en: [
        "Remember that radical acceptance is the starting point for constructive action, not an excuse for passivity.",
        "Allow genuine grief and philosophical transcendence to co-exist without forcing one over the other.",
      ],
      id: [
        "Ingat bahwa penerimaan ikhlas adalah titik tolak tindakan bijak, bukan alasan untuk bersikap apatis.",
        "Biarkan rasa sedih yang jujur dan pemaknaan spiritual berjalan beriringan tanpa perlu dipertentangkan.",
      ],
    },
  },
};

export function calculateCopingStyleScore(
  answers: Record<number, string>,
  lang: ToolLanguage
): CopingStyleResult {
  const counts: Record<CopingStyleKey, number> = {
    problem_focused: 0,
    emotion_processing: 0,
    social_support: 0,
    meaning_acceptance: 0,
  };

  COPING_QUESTIONS.forEach((q) => {
    const selectedOptionId = answers[q.id];
    if (selectedOptionId) {
      const option = q.options.find((opt) => opt.id === selectedOptionId);
      if (option) {
        counts[option.style] += 1;
      }
    }
  });

  const totalAnswered = Object.keys(answers).length || 1;

  const entries = (Object.keys(counts) as CopingStyleKey[]).map((key) => {
    const count = counts[key];
    const percentage = Math.round((count / totalAnswered) * 100);
    const meta = COPING_META[key];
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
    {} as Record<CopingStyleKey, CopingStyleScore>
  );

  const primaryStyle = entries[0].score;
  const secondaryStyle = entries[1].score;

  let overallSummary = "";
  if (lang === "id") {
    overallSummary = `Strategi koping utama Anda adalah ${primaryStyle.name} (${primaryStyle.percentage}%), dengan mekanisme pendukung berupa ${secondaryStyle.name} (${secondaryStyle.percentage}%). Kombinasi ini menunjukkan bagaimana Anda menyeimbangkan aksi nyata, pencernaan emosi, dukungan komunitas, dan penerimaan hikmah saat menghadapi badai kehidupan.`;
  } else {
    overallSummary = `Your primary coping strategy is ${primaryStyle.name} (${primaryStyle.percentage}%), supported by ${secondaryStyle.name} (${secondaryStyle.percentage}%). This profile reveals how you naturally coordinate practical problem-solving, emotional metabolization, social connection, and philosophical acceptance during major life challenges.`;
  }

  return {
    scores: scoresRecord,
    primaryStyle,
    secondaryStyle,
    overallSummary,
  };
}

