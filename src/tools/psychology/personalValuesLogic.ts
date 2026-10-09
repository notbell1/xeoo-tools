import type { ToolLanguage } from "./psychologyI18n";

export type ValueClusterKey =
  | "growth"
  | "connection"
  | "security"
  | "impact";

export interface ValueScenarioOption {
  id: string;
  cluster: ValueClusterKey;
  text: {
    en: string;
    id: string;
  };
}

export interface ValueScenarioQuestion {
  id: number;
  situation: {
    en: string;
    id: string;
  };
  options: ValueScenarioOption[];
}

export interface ValueClusterScore {
  key: ValueClusterKey;
  name: string;
  percentage: number;
  description: string;
  strengths: string[];
  challenges: string[];
  reflectionPrompts: string[];
  actionSuggestions: string[];
}

export interface PersonalValuesResult {
  scores: Record<ValueClusterKey, ValueClusterScore>;
  primaryValue: ValueClusterScore;
  secondaryValue: ValueClusterScore;
  overallSummary: string;
}

export const VALUES_QUESTIONS: ValueScenarioQuestion[] = [
  {
    id: 1,
    situation: {
      en: "You are offered two job opportunities. In a direct trade-off, which trade-off matters most to you?",
      id: "Anda ditawari dua peluang karier. Dalam trade-off langsung, mana yang paling bernilai bagi Anda?",
    },
    options: [
      {
        id: "a",
        cluster: "growth",
        text: {
          en: "Total creative freedom, autonomous hours, and learning frontier skills with an uncharted ceiling.",
          id: "Kebebasan berkreasi penuh, jam kerja mandiri, dan kesempatan belajar keahlian baru tanpa batas kaku.",
        },
      },
      {
        id: "b",
        cluster: "connection",
        text: {
          en: "A deeply warm, loyal, and supportive team where colleagues feel like genuine lifelong friends.",
          id: "Tim kerja yang hangat, loyal, dan suportif di mana rekan kerja terasa seperti sahabat sejati seumur hidup.",
        },
      },
      {
        id: "c",
        cluster: "security",
        text: {
          en: "Rock-solid stability, comprehensive benefits, predictable retirement security, and zero volatility.",
          id: "Stabilitas finansial kokoh, tunjangan lengkap, kepastian jangka panjang, dan bebas dari gejolak risiko.",
        },
      },
      {
        id: "d",
        cluster: "impact",
        text: {
          en: "A high-visibility platform where your leadership drives tangible industry influence and notable legacy.",
          id: "Panggung bergengsi di mana kepemimpinan Anda memberi dampak industri yang nyata dan warisan karya berharga.",
        },
      },
    ],
  },
  {
    id: 2,
    situation: {
      en: "You unexpectedly receive a substantial lump sum of discretionary money. How would you allocate it?",
      id: "Anda mendadak mendapatkan sejumlah dana ekstra yang bebas digunakan. Bagaimana Anda memanfaatkannya?",
    },
    options: [
      {
        id: "a",
        cluster: "growth",
        text: {
          en: "Fund a sabbatical for independent creative experimentation, intellectual courses, and worldly exploration.",
          id: "Mendanai masa jeda untuk riset kreatif mandiri, kursus mendalam, dan eksplorasi wawasan baru.",
        },
      },
      {
        id: "b",
        cluster: "connection",
        text: {
          en: "Treat family and closest loved ones to a memorable shared experience or relieve a struggling friend's debt.",
          id: "Mengajak keluarga dan orang terkasih liburan bersama yang berkesan atau meringankan beban teman dekat.",
        },
      },
      {
        id: "c",
        cluster: "security",
        text: {
          en: "Lock it away in secure, low-risk long-term investments and a robust multi-year emergency cushion.",
          id: "Menguncinya dalam instrumen investasi aman berisiko rendah dan tabungan dana darurat multi-tahun.",
        },
      },
      {
        id: "d",
        cluster: "impact",
        text: {
          en: "Invest in building an ambitious new enterprise, product, or community initiative that solves a major problem.",
          id: "Menginvestasikannya untuk mendanai usaha baru, produk inovatif, atau inisiatif sosial yang memecahkan masalah besar.",
        },
      },
    ],
  },
  {
    id: 3,
    situation: {
      en: "When you imagine your ideal home environment, what is its defining essence?",
      id: "Saat Anda membayangkan lingkungan rumah impian, apa esensi paling utama dari tempat tersebut?",
    },
    options: [
      {
        id: "a",
        cluster: "growth",
        text: {
          en: "A dynamic studio and sanctuary filled with books, art, tools, and total freedom to follow inspiration.",
          id: "Studio inspiratif yang dipenuhi buku, karya seni, peralatan hobi, dan kebebasan total mengejar inspirasi.",
        },
      },
      {
        id: "b",
        cluster: "connection",
        text: {
          en: "A warm, hospitable haven with a large dining table where loved ones gather, laugh, and share stories.",
          id: "Hunian yang hangat dan ramah dengan meja makan luas tempat keluarga dan sahabat berkumpul tertawa bersama.",
        },
      },
      {
        id: "c",
        cluster: "security",
        text: {
          en: "A safe, tranquil, well-fortified haven in a peaceful, resilient neighborhood with predictable surroundings.",
          id: "Tempat berteduh yang tenteram, aman, dan kokoh di lingkungan yang damai dengan suasana yang menenangkan.",
        },
      },
      {
        id: "d",
        cluster: "impact",
        text: {
          en: "An inspiring base near centers of action, prestige, and culture where big ideas and influential work happen.",
          id: "Pusat aktivitas yang strategis dekat pusat kemajuan dan peradaban tempat gagasan besar dan karya berbobot dirancang.",
        },
      },
    ],
  },
  {
    id: 4,
    situation: {
      en: "Which outcome would feel most heartbreaking or unacceptable to you at the end of your life?",
      id: "Hasil akhir mana yang akan terasa paling mengecewakan atau tidak bisa Anda terima di pengujung usia?",
    },
    options: [
      {
        id: "a",
        cluster: "growth",
        text: {
          en: "Realizing you lived in safe conformity and never explored your true authentic curiosities and potential.",
          id: "Menyadari bahwa Anda hidup hanya dalam kepatuhan zona nyaman dan tak pernah menjelajahi potensi rasa ingin tahu sejati.",
        },
      },
      {
        id: "b",
        cluster: "connection",
        text: {
          en: "Realizing you were successful but ended up emotionally isolated, estranged from genuine loved ones.",
          id: "Menyadari bahwa Anda sukses namun berakhir kesepian secara batin, terasing dari orang-orang yang tulus mencintai.",
        },
      },
      {
        id: "c",
        cluster: "security",
        text: {
          en: "Experiencing sudden ruin that left your family vulnerable, unprotected, and exposed to preventable hardship.",
          id: "Mengalami kebangkrutan mendadak yang membuat keluarga terlantar, rapuh, dan terancam kesulitan hidup.",
        },
      },
      {
        id: "d",
        cluster: "impact",
        text: {
          en: "Realizing you lived comfortably but left no lasting mark, meaningful contribution, or dent on the world.",
          id: "Menyadari bahwa Anda hidup nyaman namun tidak meninggalkan jejak karya, kontribusi nyata, atau pengaruh berharga.",
        },
      },
    ],
  },
  {
    id: 5,
    situation: {
      en: "In a personal crisis, which principle serves as your ultimate North Star?",
      id: "Saat menghadapi krisis hidup yang pelik, prinsip mana yang menjadi kompas penunjuk arah utama Anda?",
    },
    options: [
      {
        id: "a",
        cluster: "growth",
        text: {
          en: "Authenticity: staying true to your personal evolution, self-sovereignty, and expanding knowledge.",
          id: "Otentisitas: setia pada pertumbuhan jiwa, kedaulatan nurani pribadi, dan perluasan wawasan diri.",
        },
      },
      {
        id: "b",
        cluster: "connection",
        text: {
          en: "Compassion: protecting relational bonds, loyalty, and standing shoulder-to-shoulder with those you love.",
          id: "Welas Asih: menjaga ikatan tali kasih, kesetiaan pada keluarga, dan saling merangkul bersama orang tercinta.",
        },
      },
      {
        id: "c",
        cluster: "security",
        text: {
          en: "Prudence: safeguarding core essentials, financial safety, physical protection, and foundational order.",
          id: "Kehati-hatian: melindungi kebutuhan primer, keamanan finansial, keselamatan fisik, dan keteraturan dasar.",
        },
      },
      {
        id: "d",
        cluster: "impact",
        text: {
          en: "Excellence: rising above difficulties with courage, delivering results, and creating enduring value.",
          id: "Keunggulan: bangkit melampaui kesulitan dengan keberanian, membuktikan prestasi, dan mencetak nilai nyata.",
        },
      },
    ],
  },
  {
    id: 6,
    situation: {
      en: "How do you evaluate whether a year was truly successful and deeply satisfying?",
      id: "Bagaimana Anda menilai apakah satu tahun yang Anda lewati benar-benar sukses dan bermakna mendalam?",
    },
    options: [
      {
        id: "a",
        cluster: "growth",
        text: {
          en: "I mastered new paradigms, expanded my inner horizon, and evolved into a more conscious version of myself.",
          id: "Saya menguasai paradigma baru, memperluas wawasan batin, dan bertumbuh menjadi versi diri yang lebih bijak.",
        },
      },
      {
        id: "b",
        cluster: "connection",
        text: {
          en: "My core relationships deepened, trust was nourished, and memories of love and laughter were created.",
          id: "Hubungan dengan orang terdekat semakin erat, rasa saling percaya terawat, dan tercipta momen tulus penuh cinta.",
        },
      },
      {
        id: "c",
        cluster: "security",
        text: {
          en: "My foundation grew stronger, debts were paid down, health remained steady, and risks were managed safely.",
          id: "Fondasi hidup semakin kokoh, utang berkurang, kesehatan terjaga stabil, dan risiko terkelola dengan aman.",
        },
      },
      {
        id: "d",
        cluster: "impact",
        text: {
          en: "I shipped significant projects, achieved tangible milestones, and unlocked visible progress in my mission.",
          id: "Saya berhasil meluncurkan karya penting, meraih target terukur, dan membuka kemajuan nyata dalam misi hidup.",
        },
      },
    ],
  },
  {
    id: 7,
    situation: {
      en: "If you had to mentor a young person, what core wisdom would you emphasize above all else?",
      id: "Jika Anda diminta membimbing seorang anak muda, kebijaksanaan inti mana yang paling Anda tekankan di atas segalanya?",
    },
    options: [
      {
        id: "a",
        cluster: "growth",
        text: {
          en: "'Never stop questioning dogma; trust your unique path and cultivate relentless intellectual curiosity.'",
          id: "'Jangan pernah berhenti berpikir kritis; percayai jalan unikmu dan peliharalah rasa ingin tahu tanpa henti.'",
        },
      },
      {
        id: "b",
        cluster: "connection",
        text: {
          en: "'Treat people with genuine warmth; at the end of the day, relationships and kindness are all that endure.'",
          id: "'Perlakukan orang lain dengan kebaikan tulus; pada akhirnya, relasi penuh kasih dan kebaikan hati yang paling abadi.'",
        },
      },
      {
        id: "c",
        cluster: "security",
        text: {
          en: "'Build your foundation on solid rock; live below your means, protect your health, and respect caution.'",
          id: "'Bangun fondasimu di atas batu karang; hiduplah bersahaja, jaga kesehatan fisik, dan utamakan kehati-hatian.'",
        },
      },
      {
        id: "d",
        cluster: "impact",
        text: {
          en: "'Hold yourself to world-class standards; build things that matter and leave the world better than you found it.'",
          id: "'Pegang standar kualitas unggul; ciptakan karya berbobot dan buatlah dunia lebih baik daripada saat kamu memulainya.'",
        },
      },
    ],
  },
  {
    id: 8,
    situation: {
      en: "A sudden opportunity demands you take a 50% pay cut for 2 years. Which purpose would justify that sacrifice?",
      id: "Peluang baru menuntut Anda menerima pemotongan penghasilan 50% selama 2 tahun. Tujuan mana yang membuat pengorbanan itu layak?",
    },
    options: [
      {
        id: "a",
        cluster: "growth",
        text: {
          en: "Studying under a visionary master in a completely new domain that revolutionizes your perspective.",
          id: "Belajar langsung dari pakar visioner di bidang baru yang merevolusi cara pandang dan keahlian hidup Anda.",
        },
      },
      {
        id: "b",
        cluster: "connection",
        text: {
          en: "Relocating to be physically present for a sick parent or to raise your young children during critical formative years.",
          id: "Pindah tempat tinggal demi merawat orang tua tercinta atau mendampingi tumbuh kembang anak di usia emasnya.",
        },
      },
      {
        id: "c",
        cluster: "security",
        text: {
          en: "Virtually nothing; taking a 50% pay cut compromises fundamental safety and long-term security unreasonably.",
          id: "Hampir tidak ada; pemotongan penghasilan 50% mengorbankan stabilitas dasar dan keamanan masa depan secara tidak masuk akal.",
        },
      },
      {
        id: "d",
        cluster: "impact",
        text: {
          en: "Leading a mission-critical breakthrough initiative that addresses a systemic societal crisis.",
          id: "Memimpin inisiatif terobosan berskala besar yang menyelesaikan krisis sosial penting bagi masyarakat luas.",
        },
      },
    ],
  },
  {
    id: 9,
    situation: {
      en: "When you feel most depleted and need to recharge your spirit, where do you naturally turn?",
      id: "Saat energi batin Anda terkuras habis dan butuh pengisian ulang semangat, ke mana Anda biasanya berpaling?",
    },
    options: [
      {
        id: "a",
        cluster: "growth",
        text: {
          en: "Solitary immersion in deep learning, artistic creation, philosophy, or quiet contemplation in nature.",
          id: "Menyendiri dalam pembelajaran mendalam, kreasi seni, membaca filsafat, atau merenung tenang di alam.",
        },
      },
      {
        id: "b",
        cluster: "connection",
        text: {
          en: "Heart-to-heart conversations, warm hugs, shared laughter, and restorative time with trusted loved ones.",
          id: "Obrolan santai dari hati ke hati, pelukan hangat, tawa bersama, dan waktu berkualitas bersama orang tersayang.",
        },
      },
      {
        id: "c",
        cluster: "security",
        text: {
          en: "Organizing your personal finances, cleaning and ordering your home sanctuary, and predictable rest routines.",
          id: "Merapikan catatan keuangan, menata keteraturan rumah tempat berteduh, dan rutinitas istirahat yang teratur.",
        },
      },
      {
        id: "d",
        cluster: "impact",
        text: {
          en: "Re-focusing on your big vision, reviewing tangible past victories, and plotting the next breakthrough milestone.",
          id: "Menatap kembali visi besar Anda, melihat jejak kemenangan masa lalu, dan merancang target terobosan berikutnya.",
        },
      },
    ],
  },
  {
    id: 10,
    situation: {
      en: "In the final accounting of what gives human existence its deepest sacred dignity, what stands supreme?",
      id: "Dalam perenungan terdalam mengenai apa yang memberi martabat dan keluhuran pada eksistensi manusia, hal apa yang utama?",
    },
    options: [
      {
        id: "a",
        cluster: "growth",
        text: {
          en: "The continuous expansion of consciousness, freedom of spirit, and the unquenchable quest for truth.",
          id: "Perluasan kesadaran batin, kemerdekaan jiwa, dan pencarian tanpa henti akan kebenaran sejati.",
        },
      },
      {
        id: "b",
        cluster: "connection",
        text: {
          en: "The capacity to love and be loved, to shelter each other's vulnerabilities, and foster tender compassion.",
          id: "Kapasitas untuk mencintai dan dicintai, memeluk kerapuhan sesama, dan menumbuhkan welas asih yang tulus.",
        },
      },
      {
        id: "c",
        cluster: "security",
        text: {
          en: "The creation of enduring safety, peace, protection for the vulnerable, and order in an uncertain universe.",
          id: "Penciptaan rasa aman, perdamaian, perlindungan bagi yang lemah, dan keteraturan di tengah ketidakpastian dunia.",
        },
      },
      {
        id: "d",
        cluster: "impact",
        text: {
          en: "The courage to leave the world measurably better, overcoming limits to build enduring monuments of human excellence.",
          id: "Keberanian mengubah dunia menjadi lebih baik, menaklukkan keterbatasan untuk membangun karya keunggulan abadi.",
        },
      },
    ],
  },
];

const CLUSTER_META: Record<
  ValueClusterKey,
  {
    name: { en: string; id: string };
    desc: { en: string; id: string };
    strengths: { en: string[]; id: string[] };
    challenges: { en: string[]; id: string[] };
    reflectionPrompts: { en: string[]; id: string[] };
    actionSuggestions: { en: string[]; id: string[] };
  }
> = {
  growth: {
    name: {
      en: "Self-Direction & Continuous Growth",
      id: "Kemandirian & Pertumbuhan Diri (Growth & Self-Direction)",
    },
    desc: {
      en: "Your core compass is guided by autonomy, intellectual curiosity, creativity, and the relentless evolution of your consciousness.",
      id: "Kompas hidup Anda dipandu oleh kemandirian berpikir, rasa ingin tahu intelektual, kreativitas orisinal, dan evolusi kesadaran diri secara berkelanjutan.",
    },
    strengths: {
      en: [
        "High intellectual adaptability and lifelong learning passion",
        "Original creative thinking unconstrained by conventional dogma",
        "Deep personal authenticity and courage to walk unconventional paths",
      ],
      id: [
        "Kemampuan adaptasi intelektual tinggi dan antusiasme belajar seumur hidup",
        "Kreativitas orisinal yang tidak terkungkung dogma atau kepatuhan buta",
        "Otentisitas pribadi dan keberanian menempuh jalan hidup yang unik",
      ],
    },
    challenges: {
      en: [
        "Can become restless when routines or commitments require prolonged stability",
        "May struggle to collaborate with rigid traditional hierarchical organizations",
        "Risk of intellectual isolation if peers don't share similar hunger for growth",
      ],
      id: [
        "Mudah merasa gelisah saat rutinitas atau komitmen menuntut kestabilan yang monoton",
        "Terkadang kesulitan menyesuaikan diri dalam struktur hierarki yang kaku",
        "Risiko merasa terasing jika lingkungan pertemanan enggan diajak bertumbuh",
      ],
    },
    reflectionPrompts: {
      en: [
        "Does my pursuit of personal growth hold space for deep relational rootedness?",
        "How do I balance the joy of exploring new horizons with finishing existing commitments?",
      ],
      id: [
        "Apakah pencarian pertumbuhan diri saya tetap memberi ruang bagi komitmen relasi yang mengakar?",
        "Bagaimana menyeimbangkan antusiasme menjelajah wawasan baru dengan menuntaskan komitmen yang ada?",
      ],
    },
    actionSuggestions: {
      en: [
        "Dedicate intentional weekly blocks (e.g. 5 hours) to self-directed passion research.",
        "Ensure your career path rewards autonomy and innovative problem-solving.",
      ],
      id: [
        "Alokasikan jadwal mingguan khusus (5 jam) untuk riset atau karya kreatif mandiri.",
        "Pastikan jalur karier Anda memberi keleluasaan berinovasi dan otonomi berpikir.",
      ],
    },
  },
  connection: {
    name: {
      en: "Benevolence & Relational Connection",
      id: "Kasih Sayang & Koneksi Relasional (Benevolence & Connection)",
    },
    desc: {
      en: "Your core compass is guided by love, loyalty, warmth, and nurturing deep bonds. True richness for you is measured in the quality of relationships you foster.",
      id: "Kompas hidup Anda dipandu oleh cinta kasih, kesetiaan, kehangatan, dan merawat hubungan mendalam. Kekayaan sejati bagi Anda diukur dari kedalaman kasih dan kebersamaan dengan sesama.",
    },
    strengths: {
      en: [
        "Exceptional empathy, warmth, and capacity for enduring loyalty",
        "Builds tight-knit communities and nurturing familial bonds",
        "Brings psychological healing and comforting presence to others",
      ],
      id: [
        "Empati mendalam, kehangatan tulus, dan kapasitas kesetiaan seumur hidup",
        "Mampu membangun komunitas yang erat dan ikatan keluarga yang harmonis",
        "Menghadirkan rasa damai, kenyamanan batin, dan pemulihan bagi orang sekitar",
      ],
    },
    challenges: {
      en: [
        "Vulnerable to intense heartbreak when loved ones betray or disappoint",
        "May sacrifice personal ambitions or self-care to accommodate others",
        "Can struggle to make tough objective business decisions that hurt feelings",
      ],
      id: [
        "Rentan mengalami luka batin mendalam jika orang yang disayangi mengecewakan",
        "Cenderung mengorbankan impian atau kesehatan pribadi demi mendahulukan orang lain",
        "Terkadang kesulitan mengambil keputusan bisnis objektif yang berisiko menyinggung perasaan",
      ],
    },
    reflectionPrompts: {
      en: [
        "Am I loving others from a place of personal fullness or self-sacrificing depletion?",
        "How do I maintain my independent identity alongside my deep bonds?",
      ],
      id: [
        "Apakah saya mengasihi orang lain dari kelimpahan batin atau dari pengorbanan yang menguras diri?",
        "Bagaimana saya menjaga identitas diri yang mandiri di tengah kelekatan hubungan?",
      ],
    },
    actionSuggestions: {
      en: [
        "Schedule non-negotiable quality time rituals with core loved ones every week.",
        "Remember that healthy boundaries are essential to sustain long-term loving relationships.",
      ],
      id: [
        "Jadwalkan momen berkualitas tanpa gawai bersama orang tersayang setiap minggu.",
        "Ingat bahwa batasan diri yang sehat justru memperkuat keharmonisan relasi cinta jangka panjang.",
      ],
    },
  },
  security: {
    name: {
      en: "Security, Order & Stability",
      id: "Keamanan, Keteraturan & Stabilitas (Security & Stability)",
    },
    desc: {
      en: "Your core compass is guided by protection, financial health, family safety, and predictable order. You value peace of mind and building resilient foundations against chaos.",
      id: "Kompas hidup Anda dipandu oleh rasa aman, kesehatan finansial, perlindungan keluarga, dan keteraturan yang terencana. Anda menjunjung ketenangan batin dan membangun fondasi kokoh terhadap krisis.",
    },
    strengths: {
      en: [
        "Prudent financial stewardship and exceptional crisis preparation",
        "Reliable, steady rock for family and community during turbulent storms",
        "Minimizes unnecessary risk and protects hard-earned generational assets",
      ],
      id: [
        "Pengelolaan finansial yang bijaksana dan kesiapsiagaan krisis yang luar biasa",
        "Menjadi pilar kokoh yang dapat diandalkan keluarga saat badai melanda",
        "Meminimalkan risiko gegabah dan melindungi aset hasil kerja keras",
      ],
    },
    challenges: {
      en: [
        "May miss transformative growth opportunities due to excessive risk aversion",
        "Anxiety can spike during unavoidable macro uncertainty or sudden disruptions",
        "Others may perceive caution as excessive rigidity or reluctance to innovate",
      ],
      id: [
        "Bisa melewatkan peluang emas bertumbuh karena terlalu berhati-hati menghindari risiko",
        "Tingkat kecemasan mudah melonjak saat terjadi ketidakpastian makro di luar kendali",
        "Orang sekitar bisa menganggap sikap waspada sebagai kekakuan atau keengganan berinovasi",
      ],
    },
    reflectionPrompts: {
      en: [
        "Where does prudent caution end and paralyzing fear of change begin?",
        "What calculated risk could unlock enormous long-term fulfillment?",
      ],
      id: [
        "Di mana batas antara kehati-hatian yang bijak dan ketakutan berlebih terhadap perubahan?",
        "Risiko terukur apa yang jika diambil berpotensi membuka kebahagiaan jangka panjang?",
      ],
    },
    actionSuggestions: {
      en: [
        "Build a tangible 'Sleep-at-Night' safety buffer (emergency fund + insurance).",
        "Allocate a small, bounded sandbox (e.g. 5% of resources) for creative risk-taking.",
      ],
      id: [
        "Pastikan fondasi dana darurat dan proteksi kesehatan terpenuhi agar tidur nyenyak.",
        "Sediakan ruang kecil terukur (5% dari sumber daya) untuk mencoba peluang baru tanpa rasa takut.",
      ],
    },
  },
  impact: {
    name: {
      en: "Achievement, Influence & Enduring Impact",
      id: "Prestasi, Pengaruh & Warisan Karya (Impact & Achievement)",
    },
    desc: {
      en: "Your core compass is guided by excellence, high contribution, competence, and building a meaningful legacy that elevates the world around you.",
      id: "Kompas hidup Anda dipandu oleh keunggulan karya, kontribusi nyata, kompetensi tinggi, dan membangun warisan kebermanfaatan yang memajukan kehidupan sesama.",
    },
    strengths: {
      en: [
        "Courageous ambition, vision, and drive to solve high-stakes challenges",
        "High personal standards that inspire colleagues and teams to elevate their game",
        "Leaves tangible lasting artifacts, businesses, or societal improvements",
      ],
      id: [
        "Ambisi berani, visi jauh ke depan, dan tekad memecahkan masalah bernilai tinggi",
        "Standar kualitas tinggi yang menginspirasi tim di sekitar untuk ikut berprestasi",
        "Meninggalkan warisan karya nyata, organisasi kokoh, dan perbaikan nyata di masyarakat",
      ],
    },
    challenges: {
      en: [
        "Risk of tying self-worth purely to external metrics, trophies, or milestones",
        "Can become impatient with slower colleagues or bureaucratic processes",
        "Vulnerable to workaholism and neglecting quiet restful presence",
      ],
      id: [
        "Risiko mengaitkan harga diri hanya pada angka pencapaian atau pengakuan luar",
        "Bisa tidak sabaran menghadapi proses yang lambat atau birokrasi berbelit",
        "Rentan terjebak gila kerja (workaholism) dan mengabaikan istirahat hening",
      ],
    },
    reflectionPrompts: {
      en: [
        "Who am I when I am not producing, achieving, or solving problems?",
        "Is my drive fueled by inspiration to serve, or fear of insignificance?",
      ],
      id: [
        "Siapakah diri saya ketika sedang tidak berkarya, berprestasi, atau memecahkan masalah?",
        "Apakah dorongan berkarya saya bersumber dari inspirasi melayani atau rasa takut tidak dianggap?",
      ],
    },
    actionSuggestions: {
      en: [
        "Focus effort on 'Highest Leverage Legacy' projects rather than busywork prestige.",
        "Practice regular sabbaths where accomplishment is intentionally set aside.",
      ],
      id: [
        "Fokuskan tenaga pada karya yang memberi dampak kebermanfaatan terbesar jangka panjang.",
        "Luangkan waktu istirahat teratur di mana target kerja diletakkan sejenak.",
      ],
    },
  },
};

export function calculatePersonalValuesScore(
  answers: Record<number, string>,
  lang: ToolLanguage
): PersonalValuesResult {
  const counts: Record<ValueClusterKey, number> = {
    growth: 0,
    connection: 0,
    security: 0,
    impact: 0,
  };

  VALUES_QUESTIONS.forEach((q) => {
    const selectedOptionId = answers[q.id];
    if (selectedOptionId) {
      const option = q.options.find((opt) => opt.id === selectedOptionId);
      if (option) {
        counts[option.cluster] += 1;
      }
    }
  });

  const totalAnswered = Object.keys(answers).length || 1;

  const entries = (Object.keys(counts) as ValueClusterKey[]).map((key) => {
    const count = counts[key];
    const percentage = Math.round((count / totalAnswered) * 100);
    const meta = CLUSTER_META[key];
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
    {} as Record<ValueClusterKey, ValueClusterScore>
  );

  const primaryValue = entries[0].score;
  const secondaryValue = entries[1].score;

  let overallSummary = "";
  if (lang === "id") {
    overallSummary = `Nilai penuntun hidup utama Anda berpusat pada ${primaryValue.name} (${primaryValue.percentage}%), didukung oleh ${secondaryValue.name} (${secondaryValue.percentage}%). Penyelarasan hidup dengan kedua nilai inti ini akan memberikan rasa kepuasan batin terdalam, kejernihan arah keputusan, dan integritas hidup yang kokoh.`;
  } else {
    overallSummary = `Your primary guiding life value is ${primaryValue.name} (${primaryValue.percentage}%), anchored by ${secondaryValue.name} (${secondaryValue.percentage}%). Aligning your daily schedule, career pursuits, and major commitments with these core values fosters deep existential fulfillment and unwavering inner integrity.`;
  }

  return {
    scores: scoresRecord,
    primaryValue,
    secondaryValue,
    overallSummary,
  };
}

