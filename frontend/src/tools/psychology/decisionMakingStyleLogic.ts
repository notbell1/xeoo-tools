import type { ToolLanguage } from "./psychologyI18n";

export type DecisionStyleKey =
  | "analytical"
  | "intuitive"
  | "consultative"
  | "spontaneous";

export interface DecisionScenarioOption {
  id: string;
  style: DecisionStyleKey;
  text: {
    en: string;
    id: string;
  };
}

export interface DecisionScenarioQuestion {
  id: number;
  situation: {
    en: string;
    id: string;
  };
  options: DecisionScenarioOption[];
}

export interface DecisionStyleScore {
  key: DecisionStyleKey;
  name: string;
  percentage: number;
  description: string;
  strengths: string[];
  challenges: string[];
  reflectionPrompts: string[];
  actionSuggestions: string[];
}

export interface DecisionStyleResult {
  scores: Record<DecisionStyleKey, DecisionStyleScore>;
  primaryStyle: DecisionStyleScore;
  secondaryStyle: DecisionStyleScore;
  overallSummary: string;
}

export const DECISION_QUESTIONS: DecisionScenarioQuestion[] = [
  {
    id: 1,
    situation: {
      en: "You are considering a major career transition or new job offer. How do you approach the choice?",
      id: "Anda sedang mempertimbangkan perubahan karier besar atau tawaran pekerjaan baru. Bagaimana cara Anda menentukan pilihan?",
    },
    options: [
      {
        id: "a",
        style: "analytical",
        text: {
          en: "Create a detailed spreadsheet comparing compensation, career growth, commute, and risk metrics.",
          id: "Membuat tabel perbandingan terperinci yang memuat kompensasi, peluang karier, jarak tempuh, dan analisis risiko.",
        },
      },
      {
        id: "b",
        style: "intuitive",
        text: {
          en: "Sit quietly, tune into your gut reaction, and ask yourself which path feels naturally energizing.",
          id: "Duduk hening, merasakan firasat batin, dan bertanya pada diri sendiri jalan mana yang secara naluriah memberi semangat.",
        },
      },
      {
        id: "c",
        style: "consultative",
        text: {
          en: "Schedule coffee discussions with respected mentors, peers, and family to gather their perspectives.",
          id: "Menjadwalkan diskusi dengan mentor tepercaya, rekan, dan keluarga untuk mengumpulkan masukan mereka.",
        },
      },
      {
        id: "d",
        style: "spontaneous",
        text: {
          en: "Jump on the exciting new opportunity swiftly before hesitation or analysis paralysis sets in.",
          id: "Segera mengambil peluang baru yang menarik tersebut sebelum ragu atau terjebak terlalu banyak berpikir.",
        },
      },
    ],
  },
  {
    id: 2,
    situation: {
      en: "You need to purchase an expensive tech device or appliance. What is your buying process?",
      id: "Anda perlu membeli barang elektronik atau perlengkapan penting bernilai cukup mahal. Bagaimana proses Anda membelinya?",
    },
    options: [
      {
        id: "a",
        style: "analytical",
        text: {
          en: "Read benchmark tests, compare spec sheets, calculate cost-per-year value, and track price histories.",
          id: "Membaca uji performa, membandingkan lembar spesifikasi, menghitung nilai pakai jangka panjang, dan memantau riwayat diskon.",
        },
      },
      {
        id: "b",
        style: "intuitive",
        text: {
          en: "Choose the model that immediately looks and feels right the moment you inspect and hold it.",
          id: "Memilih varian yang seketika terasa pas dan nyaman saat pertama kali dilihat dan dicoba langsung.",
        },
      },
      {
        id: "c",
        style: "consultative",
        text: {
          en: "Ask friends who already own similar items or check verified community reviews for trusted endorsements.",
          id: "Bertanya kepada teman yang sudah memakainya atau melihat ulasan komunitas tepercaya sebagai referensi utama.",
        },
      },
      {
        id: "d",
        style: "spontaneous",
        text: {
          en: "Decide in the store within minutes based on what looks attractive and immediately available on the shelf.",
          id: "Memutuskan langsung dalam hitungan menit di toko berdasarkan apa yang menarik dan siap dibawa pulang.",
        },
      },
    ],
  },
  {
    id: 3,
    situation: {
      en: "An unexpected schedule opening gives you a free weekend. How do you decide what to do?",
      id: "Ada waktu luang tak terduga selama akhir pekan penuh. Bagaimana Anda memutuskan apa yang akan dilakukan?",
    },
    options: [
      {
        id: "a",
        style: "analytical",
        text: {
          en: "Review pending backlogs and optimize the hours between restful recovery and high-leverage chores.",
          id: "Mengevaluasi daftar agenda yang tertunda dan membagi waktu secara efisien antara istirahat dan tugas penting.",
        },
      },
      {
        id: "b",
        style: "intuitive",
        text: {
          en: "Wake up Saturday morning and let your inner mood dictate whatever sounds refreshing in that moment.",
          id: "Bangun di Sabtu pagi dan membiarkan suasana hati memandu apa pun aktivitas yang terasa menyegarkan saat itu.",
        },
      },
      {
        id: "c",
        style: "consultative",
        text: {
          en: "Message close friends or family to see what everyone is up to and join the group's best plan.",
          id: "Mengirim pesan ke teman atau keluarga untuk melihat rencana mereka dan bergabung dengan agenda bersama.",
        },
      },
      {
        id: "d",
        style: "spontaneous",
        text: {
          en: "Book a sudden road trip or walk out the door immediately to explore a brand new spot without a plan.",
          id: "Spontan memesan tiket perjalanan singkat atau langsung keluar rumah menjelajahi tempat baru tanpa rencana rumit.",
        },
      },
    ],
  },
  {
    id: 4,
    situation: {
      en: "At work, a sudden unexpected crisis demands an operational pivot today. How do you decide the course of action?",
      id: "Di tempat kerja, krisis mendadak menuntut perubahan operasional hari ini juga. Bagaimana Anda mengambil keputusan?",
    },
    options: [
      {
        id: "a",
        style: "analytical",
        text: {
          en: "Gather all error logs, assess statistical probabilities, and deduce the logical root cause first.",
          id: "Mengumpulkan data log kesalahan, menganalisis peluang kemungkinan, dan menyimpulkan akar masalah logisnya terlebih dahulu.",
        },
      },
      {
        id: "b",
        style: "intuitive",
        text: {
          en: "Trust your experienced situational hunch on where the bottleneck is and pivot immediately.",
          id: "Mempercayai intuisi dan pengalaman masa lalu tentang di mana titik hambatan berada lalu segera bertindak.",
        },
      },
      {
        id: "c",
        style: "consultative",
        text: {
          en: "Convene a rapid all-hands huddle to hear front-line inputs before choosing the direction.",
          id: "Mengumpulkan sesi singkat bersama tim untuk mendengar masukan dari lini depan sebelum menentukan arah.",
        },
      },
      {
        id: "d",
        style: "spontaneous",
        text: {
          en: "Make a decisive bold executive call right away and refine the adjustments dynamically as you execute.",
          id: "Mengambil keputusan tegas seketika dan menyesuaikan langkah secara dinamis sambil mengeksekusi.",
        },
      },
    ],
  },
  {
    id: 5,
    situation: {
      en: "You are looking to rent or purchase a new living space. What clinches your final decision?",
      id: "Anda sedang mencari tempat tinggal baru untuk disewa atau dibeli. Apa yang menjadi penentu akhir keputusan Anda?",
    },
    options: [
      {
        id: "a",
        style: "analytical",
        text: {
          en: "A calculated scorecard measuring price per square meter, proximity to essentials, and future asset value.",
          id: "Skor kalkulasi per meter persegi, jarak ke fasilitas publik penting, dan perkiraan nilai jangka panjang.",
        },
      },
      {
        id: "b",
        style: "intuitive",
        text: {
          en: "The emotional ambiance and vibe: feeling instantly 'at home' when crossing the front threshold.",
          id: "Suasana batin dan energinya: perasaan hangat seketika merasa 'di rumah' saat pertama kali melangkah masuk.",
        },
      },
      {
        id: "c",
        style: "consultative",
        text: {
          en: "Bringing trusted family members or friends along to get their validation on safety and livability.",
          id: "Mengajak orang tua, pasangan, atau teman tepercaya untuk meminta pendapat mereka mengenai kelayakan dan keamanan.",
        },
      },
      {
        id: "d",
        style: "spontaneous",
        text: {
          en: "Falling in love with a standout feature (like a bright sunny balcony) and making an immediate deposit.",
          id: "Terpikat pada satu fitur unik (seperti balkon yang sejuk) dan langsung menyetujui kesepakatan tanpa ragu.",
        },
      },
    ],
  },
  {
    id: 6,
    situation: {
      en: "You are faced with two equally attractive vacation packages. How do you break the tie?",
      id: "Anda dihadapkan pada dua paket liburan yang sama-sama menarik. Bagaimana Anda memecah kebuntuan pilihan?",
    },
    options: [
      {
        id: "a",
        style: "analytical",
        text: {
          en: "Review itemized itineraries, weather forecast probabilities, and total hidden fee breakdowns.",
          id: "Membandingkan susunan jadwal kegiatan, prakiraan cuaca, dan rincian potensi biaya tersembunyi.",
        },
      },
      {
        id: "b",
        style: "intuitive",
        text: {
          en: "Flip a coin; notice whether you feel relieved or disappointed by the result to reveal your true desire.",
          id: "Melempar koin; perhatikan apakah Anda merasa lega atau kecewa dengan hasilnya untuk menemukan suara hati sejati.",
        },
      },
      {
        id: "c",
        style: "consultative",
        text: {
          en: "Poll your travel companions or ask a friend who visited recently which one they'd repeat.",
          id: "Mengajak voting teman seperjalanan atau meminta saran teman yang pernah ke sana tentang mana yang lebih berkesan.",
        },
      },
      {
        id: "d",
        style: "spontaneous",
        text: {
          en: "Pick the one that offers the wildest and most unconventional adventure right off the bat.",
          id: "Langsung memilih paket yang menjanjikan petualangan paling unik tanpa berpikir panjang.",
        },
      },
    ],
  },
  {
    id: 7,
    situation: {
      en: "A long-time friendship has grown strained. How do you decide whether to distance yourself or invest deeper?",
      id: "Hubungan pertemanan lama mulai terasa renggang dan melelahkan. Bagaimana Anda memutuskan apakah menjaga jarak atau memperbaikinya?",
    },
    options: [
      {
        id: "a",
        style: "analytical",
        text: {
          en: "Objectively assess mutual effort, frequency of positive vs draining interactions, and behavioral patterns.",
          id: "Menilai secara objektif keseimbangan usaha kedua pihak, frekuensi momen positif vs melelahkan, dan pola perilakunya.",
        },
      },
      {
        id: "b",
        style: "intuitive",
        text: {
          en: "Notice how your energy feels after spending time with them: drained and constricted vs light and authentic.",
          id: "Merasakan bagaimana kondisi energi Anda setelah bersama mereka: apakah terkuras berat atau tetap nyaman dan tulus.",
        },
      },
      {
        id: "c",
        style: "consultative",
        text: {
          en: "Talk through the relationship dynamics with a wise neutral third party to gain an outside lens.",
          id: "Mendiskusikan dinamika hubungan tersebut dengan pihak ketiga yang bijak dan netral untuk mendapat perspektif luar.",
        },
      },
      {
        id: "d",
        style: "spontaneous",
        text: {
          en: "Reach out on a whim right now with a blunt, honest message and let whatever happens happen.",
          id: "Spontan mengirim pesan jujur dan apa adanya sekarang juga, lalu menerima apa pun hasilnya dengan lapang dada.",
        },
      },
    ],
  },
  {
    id: 8,
    situation: {
      en: "You have surplus funds to invest or save. What guides your allocation?",
      id: "Anda memiliki surplus dana untuk ditabung atau diinvestasikan. Apa yang memandu alokasi Anda?",
    },
    options: [
      {
        id: "a",
        style: "analytical",
        text: {
          en: "Follow a mathematically backtested asset allocation model with historical sharpe ratios and risk curves.",
          id: "Mengikuti model alokasi aset yang teruji secara matematis dengan rekam jejak historis dan diversifikasi terukur.",
        },
      },
      {
        id: "b",
        style: "intuitive",
        text: {
          en: "Back industries and founders whose vision and cultural ethos you deeply believe in internally.",
          id: "Mendukung sektor atau visi industri yang secara mendalam Anda yakini memiliki masa depan cerah.",
        },
      },
      {
        id: "c",
        style: "consultative",
        text: {
          en: "Consult a certified financial planner or align your portfolio with proven strategies from trusted advisors.",
          id: "Berkonsultasi dengan penasihat keuangan atau mengikuti portofolio yang direkomendasikan pakar tepercaya.",
        },
      },
      {
        id: "d",
        style: "spontaneous",
        text: {
          en: "Put a portion into an exciting emerging trend or venture you just heard about that sparks excitement.",
          id: "Menaruh sebagian pada tren baru yang menarik yang baru saja Anda temukan dan memicu antusiasme.",
        },
      },
    ],
  },
  {
    id: 9,
    situation: {
      en: "You want to adopt a healthier diet or fitness habit. How do you select your regimen?",
      id: "Anda ingin memulai pola makan atau olahraga yang lebih sehat. Bagaimana Anda memilih metodenya?",
    },
    options: [
      {
        id: "a",
        style: "analytical",
        text: {
          en: "Study nutritional science papers, track macro-nutrient ratios, and calculate daily caloric expenditures.",
          id: "Mempelajari literatur gizi, menghitung rasio makronutrisi, dan menyusun target kalori harian terukur.",
        },
      },
      {
        id: "b",
        style: "intuitive",
        text: {
          en: "Practice mindful intuitive eating, listening to what your body naturally craves for vitality.",
          id: "Menerapkan intuitive eating yang penuh kesadaran, mendengarkan sinyal alami tubuh untuk menjaga kesegaran.",
        },
      },
      {
        id: "c",
        style: "consultative",
        text: {
          en: "Join a workout community, hire a personal trainer, or follow meal plans shared by healthy peers.",
          id: "Bergabung dengan komunitas olahraga, meminta panduan pelatih, atau mengikuti pola makan rekan yang bugar.",
        },
      },
      {
        id: "d",
        style: "spontaneous",
        text: {
          en: "Start right this second by doing 30 pushups or cleaning out the pantry without waiting for next Monday.",
          id: "Mulai detik ini juga dengan olahraga spontan atau membersihkan kulkas tanpa menunggu hari Senin.",
        },
      },
    ],
  },
  {
    id: 10,
    situation: {
      en: "Looking back at your best past decisions, what characterized them most?",
      id: "Melihat kembali keputusan terbaik Anda di masa lalu, apa karakteristik paling menonjol dari keputusan tersebut?",
    },
    options: [
      {
        id: "a",
        style: "analytical",
        text: {
          en: "They were thoroughly researched, logically sound, and based on objective evidence.",
          id: "Keputusan itu diriset secara mendalam, masuk akal secara logis, dan berpijak pada fakta objektif.",
        },
      },
      {
        id: "b",
        style: "intuitive",
        text: {
          en: "They defied surface logic but felt deeply right in my gut from the very beginning.",
          id: "Keputusan itu tampak tidak lazim di mata orang lain, namun terasa sangat tepat di hati sejak awal.",
        },
      },
      {
        id: "c",
        style: "consultative",
        text: {
          en: "They were shaped by the collective wisdom and encouragement of people who cared about me.",
          id: "Keputusan itu diperkaya oleh kebijaksanaan kolektif dan dorongan dari orang-orang yang peduli pada saya.",
        },
      },
      {
        id: "d",
        style: "spontaneous",
        text: {
          en: "They were bold, swift leaps into the unknown that opened doors I never could have planned.",
          id: "Keputusan itu merupakan langkah berani yang cepat diambil dan membuka pintu baru yang tak terduga.",
        },
      },
    ],
  },
];

const STYLE_META: Record<
  DecisionStyleKey,
  {
    name: { en: string; id: string };
    desc: { en: string; id: string };
    strengths: { en: string[]; id: string[] };
    challenges: { en: string[]; id: string[] };
    reflectionPrompts: { en: string[]; id: string[] };
    actionSuggestions: { en: string[]; id: string[] };
  }
> = {
  analytical: {
    name: {
      en: "Analytical & Rational",
      id: "Analitis & Rasional",
    },
    desc: {
      en: "You rely on systematic evidence, structured comparison, and logical risk assessment to arrive at defensible decisions.",
      id: "Anda mengandalkan data sistematis, perbandingan terstruktur, dan penilaian risiko yang logis untuk menghasilkan keputusan yang solid.",
    },
    strengths: {
      en: [
        "High clarity and minimized risk of avoidable oversights",
        "Clear documented rationale that is easily explained to others",
        "Calm and objective during emotionally charged situations",
      ],
      id: [
        "Kejelasan tinggi dan meminimalkan kesalahan akibat kelalaian",
        "Alasan keputusan terstruktur dan mudah dipertanggungjawabkan ke pihak lain",
        "Tenang dan objektif saat situasi diwarnai gejolak emosi",
      ],
    },
    challenges: {
      en: [
        "Vulnerable to analysis paralysis and delayed action",
        "May dismiss qualitative human factors or gut warnings",
        "High mental energy required even for simple choices",
      ],
      id: [
        "Rentan terjebak analisis berlebih (analysis paralysis) dan lambat bergerak",
        "Cenderung mengabaikan faktor intuisi atau perasaan manusiawi",
        "Menguras energi mental bahkan untuk pilihan-pilihan yang sebenarnya sederhana",
      ],
    },
    reflectionPrompts: {
      en: [
        "At what point does collecting 5% more data yield diminishing returns?",
        "What is the real cost of delaying this decision vs deciding with 80% information?",
      ],
      id: [
        "Pada titik mana mengumpulkan data tambahan tidak lagi mengubah keputusan inti?",
        "Berapa harga yang harus dibayar karena menunda keputusan dibandingkan memutuskan dengan informasi 80%?",
      ],
    },
    actionSuggestions: {
      en: [
        "Implement a strict deadline rule: when the clock strikes X, make the best call with current data.",
        "Categorize decisions as Type 1 (irreversible) vs Type 2 (reversible); decide Type 2 decisions rapidly.",
      ],
      id: [
        "Terapkan aturan batas waktu ketat: saat waktu tiba, ambil keputusan terbaik dengan data yang ada.",
        "Bedakan keputusan Tipe 1 (sulit diubah) vs Tipe 2 (mudah diperbaiki); buat keputusan Tipe 2 dengan cepat.",
      ],
    },
  },
  intuitive: {
    name: {
      en: "Intuitive & Pattern-Attuned",
      id: "Intuitif & Selaras Firasat",
    },
    desc: {
      en: "You process sub-conscious patterns and internal visceral signals rapidly, choosing paths that resonate with your inner values and energy.",
      id: "Anda memproses pola bawah sadar dan sinyal batiniah secara cepat, memilih jalan yang selaras dengan nilai-nilai dan energi diri.",
    },
    strengths: {
      en: [
        "Rapid decision-making speed in complex, unstructured environments",
        "Strong attunement to authentic personal values and fulfillment",
        "Able to detect subtle nuances and red flags that spreadsheets miss",
      ],
      id: [
        "Kecepatan memutuskan yang tinggi dalam kondisi yang kompleks dan tidak terstruktur",
        "Sangat selaras dengan nilai pribadi dan keaslian batin",
        "Mampu menangkap kejanggalan atau peluang halus yang terlewat oleh tabel data",
      ],
    },
    challenges: {
      en: [
        "Harder to explain or justify choices to skeptical peers or bosses",
        "Risk of confusing momentary mood swings or anxiety with genuine intuition",
        "Can overlook critical logistical or contractual fine print",
      ],
      id: [
        "Lebih sulit menjelaskan dasar pertimbangan kepada orang lain yang butuh data numerik",
        "Rentan tertukar antara dorongan emosi sesaat/rasa cemas dengan intuisi sejati",
        "Bisa mengabaikan detail logistik atau syarat kontrak penting",
      ],
    },
    reflectionPrompts: {
      en: [
        "Is this feeling genuine intuitive wisdom, or fear masking as intuition?",
        "What objective facts would prove my gut feeling wrong?",
      ],
      id: [
        "Apakah rasa ini intuisi murni, atau sekadar rasa cemas yang menyamar?",
        "Fakta objektif apa yang berpotensi membuktikan firasat saya keliru?",
      ],
    },
    actionSuggestions: {
      en: [
        "Pair gut calls with a quick sanity checklist: budget, time, and worst-case scenario.",
        "Sleep on major intuitive insights for 24 hours before signing irreversible commitments.",
      ],
      id: [
        "Padukan intuisi dengan daftar periksa dasar: anggaran, waktu, dan skenario terburuk.",
        "Beri jeda 24 jam sebelum menandatangani komitmen besar yang didasari firasat batin.",
      ],
    },
  },
  consultative: {
    name: {
      en: "Consultative & Consensus-Oriented",
      id: "Konsultatif & Berorientasi Konsensus",
    },
    desc: {
      en: "You value collective wisdom and social validation, seeking trusted perspectives to stress-test ideas and build shared alignment.",
      id: "Anda menghargai kebijaksanaan kolektif dan dukungan sosial, mencari pandangan orang tepercaya untuk menguji ide dan menjaga keselarasan bersama.",
    },
    strengths: {
      en: [
        "High stakeholder buy-in and collaborative support during execution",
        "Broad perspective that captures diverse viewpoints and blind spots",
        "Strong relational safety and reduced individual isolation in crisis",
      ],
      id: [
        "Dukungan dan komitmen tim yang tinggi saat tahap eksekusi",
        "Sudut pandang luas yang mampu menangkap titik buta dari berbagai arah",
        "Rasa aman dalam hubungan dan tidak merasa sendirian menghadapi krisis",
      ],
    },
    challenges: {
      en: [
        "Risk of diffusing personal responsibility or getting swayed by loudest voices",
        "Slow decision timelines when waiting for everyone's input",
        "May dilute bold original visions into bland compromises",
      ],
      id: [
        "Risiko memudarnya tanggung jawab pribadi atau mudah terombang-ambing opini luar",
        "Waktu pengambilan keputusan melambat karena menunggu semua orang bersuara",
        "Bisa melemahkan ide orisinal yang berani menjadi kompromi yang biasa-biasa saja",
      ],
    },
    reflectionPrompts: {
      en: [
        "If no one else could give advice on this, what would my own conscience choose?",
        "Whose opinion am I seeking out of wisdom, and whose out of fear of judgment?",
      ],
      id: [
        "Jika tidak ada orang lain yang bisa dimintai pendapat, apa yang nurani saya sendiri pilih?",
        "Pendapat siapa yang saya cari karena kebijaksanaan, dan siapa yang dicari karena takut dinilai buruk?",
      ],
    },
    actionSuggestions: {
      en: [
        "Formulate your tentative position first in writing before asking for outside input.",
        "Limit counsel to 2-3 genuinely qualified individuals rather than broad public polls.",
      ],
      id: [
        "Tuliskan posisi atau pilihan awal Anda sendiri terlebih dahulu sebelum meminta pendapat luar.",
        "Batasi konsultasi hanya pada 2-3 orang yang benar-benar berkompeten di bidangnya.",
      ],
    },
  },
  spontaneous: {
    name: {
      en: "Spontaneous & Action-Biased",
      id: "Spontan & Berorientasi Aksi Cepat",
    },
    desc: {
      en: "You prioritize momentum, courage, and immediate real-world testing, believing that action creates clarity faster than endless contemplation.",
      id: "Anda memprioritaskan momentum, keberanian, dan uji coba nyata, meyakini bahwa tindakan nyata menghasilkan kejelasan lebih cepat dibanding perenungan panjang.",
    },
    strengths: {
      en: [
        "Exceptional speed and agility in seizing fleeting opportunities",
        "Immune to analysis paralysis; high energy and momentum",
        "Learns rapidly through direct real-world feedback loops",
      ],
      id: [
        "Kecepatan luar biasa dalam menangkap peluang emas yang bergerak cepat",
        "Kebal dari kebuntuan berpikir (analysis paralysis); energi dan dorongan tinggi",
        "Belajar dengan cepat melalui umpan balik pengalaman nyata",
      ],
    },
    challenges: {
      en: [
        "Higher risk of buyer's remorse or regret from impulsive moves",
        "May overlook critical safety, financial, or long-term consequences",
        "Can leave teammates scrambling to keep up with sudden pivots",
      ],
      id: [
        "Risiko penyesalan (buyer's remorse) lebih tinggi dari tindakan terburu-buru",
        "Bisa mengabaikan faktor keamanan, finansial, atau dampak jangka panjang",
        "Dapat membuat rekan kerja kewalahan mengejar perubahan haluan mendadak",
      ],
    },
    reflectionPrompts: {
      en: [
        "Am I rushing into this action because of genuine enthusiasm or impatience with stillness?",
        "What is the irreversible downside if this spontaneous leap fails?",
      ],
      id: [
        "Apakah saya terburu-buru karena antusiasme sejati, atau karena tidak sabar menghadapi ketenangan?",
        "Apa dampak yang tidak bisa diperbaiki jika langkah spontan ini meleset?",
      ],
    },
    actionSuggestions: {
      en: [
        "Implement a mandatory 48-hour cooling-off rule for financial commitments over a set threshold.",
        "Establish an accountability partner who checks your blind spots before major leaps.",
      ],
      id: [
        "Terapkan jeda wajib 48 jam untuk keputusan pengeluaran di atas batas nominal tertentu.",
        "Miliki rekan akuntabilitas untuk memeriksa titik buta sebelum mengambil lompatan besar.",
      ],
    },
  },
};

export function calculateDecisionStyleScore(
  answers: Record<number, string>,
  lang: ToolLanguage
): DecisionStyleResult {
  const counts: Record<DecisionStyleKey, number> = {
    analytical: 0,
    intuitive: 0,
    consultative: 0,
    spontaneous: 0,
  };

  DECISION_QUESTIONS.forEach((q) => {
    const selectedOptionId = answers[q.id];
    if (selectedOptionId) {
      const option = q.options.find((opt) => opt.id === selectedOptionId);
      if (option) {
        counts[option.style] += 1;
      }
    }
  });

  const totalAnswered = Object.keys(answers).length || 1;

  const entries = (Object.keys(counts) as DecisionStyleKey[]).map((key) => {
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
    {} as Record<DecisionStyleKey, DecisionStyleScore>
  );

  const primaryStyle = entries[0].score;
  const secondaryStyle = entries[1].score;

  let overallSummary = "";
  if (lang === "id") {
    overallSummary = `Gaya pengambilan keputusan dominan Anda adalah ${primaryStyle.name} (${primaryStyle.percentage}%), didukung oleh pendekatan ${secondaryStyle.name} (${secondaryStyle.percentage}%). Pola ini memperlihatkan bagaimana Anda menyeimbangkan data, kecepatan respon, intuisi batin, dan konsultasi saat menghadapi pilihan-pilihan krusial.`;
  } else {
    overallSummary = `Your primary decision-making style is ${primaryStyle.name} (${primaryStyle.percentage}%), supported by ${secondaryStyle.name} (${secondaryStyle.percentage}%). This reflects how your mind balances logical scrutiny, gut intuition, collaborative counsel, and bias towards action when choosing life directions.`;
  }

  return {
    scores: scoresRecord,
    primaryStyle,
    secondaryStyle,
    overallSummary,
  };
}

