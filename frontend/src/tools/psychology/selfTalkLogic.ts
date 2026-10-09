import type { ToolLanguage } from "./psychologyI18n";

export type SelfTalkKey =
  | "compassionate"
  | "critical"
  | "solution"
  | "anxious";

export interface SelfTalkOption {
  id: string;
  voice: SelfTalkKey;
  text: {
    en: string;
    id: string;
  };
}

export interface SelfTalkQuestion {
  id: number;
  situation: {
    en: string;
    id: string;
  };
  options: SelfTalkOption[];
}

export interface SelfTalkScore {
  key: SelfTalkKey;
  name: string;
  percentage: number;
  description: string;
  strengths: string[];
  challenges: string[];
  reflectionPrompts: string[];
  actionSuggestions: string[];
}

export interface SelfTalkResult {
  scores: Record<SelfTalkKey, SelfTalkScore>;
  primaryVoice: SelfTalkScore;
  secondaryVoice: SelfTalkScore;
  overallSummary: string;
}

export const SELF_TALK_QUESTIONS: SelfTalkQuestion[] = [
  {
    id: 1,
    situation: {
      en: "You accidentally send an email with an embarrassing typo to your entire team. What is the immediate voice in your head?",
      id: "Anda tidak sengaja mengirim email dengan salah ketik yang memalukan ke seluruh tim. Apa suara batin yang pertama kali muncul?",
    },
    options: [
      {
        id: "a",
        voice: "compassionate",
        text: {
          en: "'It's okay, everyone makes silly typos sometimes. Nobody is judging your entire worth on one email.'",
          id: "'Tidak apa-apa, semua orang pernah salah ketik. Tidak ada yang menilai harga dirimu hanya dari satu email.'",
        },
      },
      {
        id: "b",
        voice: "critical",
        text: {
          en: "'How could you be so careless and sloppy? You never double-check, it's so humiliating!'",
          id: "'Bagaimana bisa kamu seceroboh dan seceroboh ini? Kamu tidak pernah teliti, memalukan sekali!'",
        },
      },
      {
        id: "c",
        voice: "solution",
        text: {
          en: "'Acknowledge it neutrally: send a 5-word correction note or clarify the key point right now.'",
          id: "'Sikap tenang: kirim pesan ralat singkat atau klarifikasi poin intinya sekarang juga.'",
        },
      },
      {
        id: "d",
        voice: "anxious",
        text: {
          en: "'Everyone is probably laughing and thinking I'm totally incompetent; my reputation is permanently ruined!'",
          id: "'Semua orang pasti menertawakan dan mengira aku tidak kompeten; reputasiku hancur selamanya!'",
        },
      },
    ],
  },
  {
    id: 2,
    situation: {
      en: "You oversleep and miss your planned morning workout or study block. What does your internal dialogue say?",
      id: "Anda bangun kesiangan dan melewatkan jadwal olahraga atau sesi belajar pagi yang direncanakan. Apa yang dikatakan suara hati Anda?",
    },
    options: [
      {
        id: "a",
        voice: "compassionate",
        text: {
          en: "'My body clearly needed the restorative sleep. I'll listen to its need and catch up with gentle movement later.'",
          id: "'Tubuhku jelas butuh tidur pemulihan. Aku menghargai kebutuhan fisik ini dan bisa menggantinya nanti dengan santai.'",
        },
      },
      {
        id: "b",
        voice: "critical",
        text: {
          en: "'You have zero discipline. You are lazy and you will never achieve your goals if you keep slacking off.'",
          id: "'Kamu sama sekali tidak punya disiplin. Kamu pemalas dan tidak akan pernah mencapai target jika terus bermalas-malasan.'",
        },
      },
      {
        id: "c",
        voice: "solution",
        text: {
          en: "'Adjust the day's schedule: shave 15 minutes from lunch to fit a brisk walk and resume the routine tonight.'",
          id: "'Sesuaikan jadwal hari ini: luangkan 15 menit saat istirahat untuk jalan cepat dan lanjutkan rutinitas malam ini.'",
        },
      },
      {
        id: "d",
        voice: "anxious",
        text: {
          en: "'The entire day is already ruined now. Everything is spiraling out of control!'",
          id: "'Hari ini sudah terlanjur hancur total. Semuanya lepas kendali dan kacau balau!'",
        },
      },
    ],
  },
  {
    id: 3,
    situation: {
      en: "A prospective client or promising romantic prospect sends a polite rejection. What tone does your mind take?",
      id: "Klien prospektif atau gebetan idaman mengirimkan penolakan santun. Nada suara batin apa yang terdengar?",
    },
    options: [
      {
        id: "a",
        voice: "compassionate",
        text: {
          en: "'Rejection hurts, but this doesn't diminish my inherent value. The right match will align naturally.'",
          id: "'Penolakan memang menyakitkan, tapi ini tidak mengurangi nilai diriku. Pintu yang tepat akan terbuka selaras pada waktunya.'",
        },
      },
      {
        id: "b",
        voice: "critical",
        text: {
          en: "'Of course they rejected you. You weren't smart enough, attractive enough, or impressive enough.'",
          id: "'Tentu saja mereka menolakmu. Kamu kurang pintar, kurang menarik, dan tidak cukup mengesankan.'",
        },
      },
      {
        id: "c",
        voice: "solution",
        text: {
          en: "'Analyze the proposal: what feedback can be extracted, and who is the next qualified prospect to reach out to?'",
          id: "'Analisis proposalnya: apa yang bisa diperbaiki, dan siapa prospek berikutnya yang bisa dihubungi?'",
        },
      },
      {
        id: "d",
        voice: "anxious",
        text: {
          en: "'I will never find success or connection; I am destined to be rejected in everything I pursue.'",
          id: "'Aku tidak akan pernah berhasil atau dicintai; aku ditakdirkan untuk selalu ditolak dalam apa pun yang kucoba.'",
        },
      },
    ],
  },
  {
    id: 4,
    situation: {
      en: "You look in the mirror after a stressful week and notice dark circles or tired skin. What do you tell yourself?",
      id: "Anda bercermin setelah seminggu penuh beban kerja dan melihat kantung mata lelah. Apa yang Anda katakan dalam hati?",
    },
    options: [
      {
        id: "a",
        voice: "compassionate",
        text: {
          en: "'My body has worked hard carrying me through a tough week. Let me give myself some gentle hydration and care.'",
          id: "'Tubuhku sudah berjuang keras membawaku melewati minggu yang berat. Mari beri diri sendiri air, istirahat, dan perawatan lembut.'",
        },
      },
      {
        id: "b",
        voice: "critical",
        text: {
          en: "'You look terrible and unkempt. Look at how aged and haggard you are letting yourself get!'",
          id: "'Kamu terlihat berantakan dan buruk sekali. Lihat betapa kuyu dan tidak terawatnya dirimu!'",
        },
      },
      {
        id: "c",
        voice: "solution",
        text: {
          en: "'Plan an early bedtime at 9:30 PM, drink 2 liters of water, and apply moisturizer.'",
          id: "'Jadwalkan tidur lebih awal jam 21:30, minum 2 liter air, dan pakai pelembap sebelum istirahat.'",
        },
      },
      {
        id: "d",
        voice: "anxious",
        text: {
          en: "'I'm losing my health and vitality; what if this chronic exhaustion turns into an incurable illness?'",
          id: "'Kesehatanku menurun drastis; bagaimana kalau kelelahan ini tanda penyakit kronis yang tidak bisa sembuh?'",
        },
      },
    ],
  },
  {
    id: 5,
    situation: {
      en: "During a presentation, you stumble on your words and pause for an awkward five seconds. What is your self-talk?",
      id: "Saat sedang presentasi, Anda tersendat kata-kata dan terdiam canggung selama lima detik. Bagaimana percakapan batin Anda?",
    },
    options: [
      {
        id: "a",
        voice: "compassionate",
        text: {
          en: "'Take a breath, it's completely human to lose your train of thought. Smile and pick back up.'",
          id: "'Tarik napas, wajar sekali manusia lupa alur sejenak. Tersenyum dan lanjutkan kembali dengan tenang.'",
        },
      },
      {
        id: "b",
        voice: "critical",
        text: {
          en: "'You ruined it! You always freeze when it matters most, you are a terrible presenter!'",
          id: "'Kamu merusak semuanya! Kamu selalu kaku di momen penting, kamu benar-benar pembicara yang buruk!'",
        },
      },
      {
        id: "c",
        voice: "solution",
        text: {
          en: "'Check the next bullet point on slide 4, deliver the key metric, and keep the agenda rolling.'",
          id: "'Lirik poin berikutnya di slide 4, sampaikan data kuncinya, dan lanjutkan agenda presentasi.'",
        },
      },
      {
        id: "d",
        voice: "anxious",
        text: {
          en: "'Everyone can see my hands shaking; they think I'm a fraud and they will talk about this behind my back.'",
          id: "'Semua orang bisa melihat tanganku gemetar; mereka mengira aku penipu dan akan membicarakanku di belakang.'",
        },
      },
    ],
  },
  {
    id: 6,
    situation: {
      en: "You fail to achieve a personal target you promised yourself for the month. How do you debrief inwardly?",
      id: "Anda gagal mencapai target pribadi yang Anda janjikan pada diri sendiri bulan ini. Bagaimana Anda mengevaluasi diri?",
    },
    options: [
      {
        id: "a",
        voice: "compassionate",
        text: {
          en: "'Progress isn't a straight line. I made genuine effort under tough circumstances and I'm proud of trying.'",
          id: "'Perkembangan tidak selalu garis lurus. Aku sudah berupaya sungguh-sungguh di tengah situasi sulit dan aku bangga sudah mencoba.'",
        },
      },
      {
        id: "b",
        voice: "critical",
        text: {
          en: "'Another failed promise. You never follow through on anything. You make big plans and deliver nothing.'",
          id: "'Satu janji lagi gagal. Kamu tidak pernah konsisten menuntaskan apa pun. Rencanamu besar tapi hasilnya nol.'",
        },
      },
      {
        id: "c",
        voice: "solution",
        text: {
          en: "'Audit the bottleneck: was the target realistic? Re-calibrate milestones to a weekly cadence starting Monday.'",
          id: "'Cari titik sumbatnya: apakah targetnya terlalu muluk? Sesuaikan kembali target mingguan mulai Senin depan.'",
        },
      },
      {
        id: "d",
        voice: "anxious",
        text: {
          en: "'If I can't even hit this monthly goal, what hope do I have for my future? I'm falling hopeless behind everyone.'",
          id: "'Jika target bulanan ini saja tidak tercapai, bagaimana dengan masa depanku? Aku tertinggal jauh di belakang orang lain.'",
        },
      },
    ],
  },
  {
    id: 7,
    situation: {
      en: "Someone you respect gives you constructive critique on your work. What does your inner narrator focus on?",
      id: "Seseorang yang Anda hormati memberikan kritik membangun terhadap hasil karya Anda. Narator batin Anda fokus pada apa?",
    },
    options: [
      {
        id: "a",
        voice: "compassionate",
        text: {
          en: "'They took the time to give thoughtful feedback because they believe in my potential. I can receive this safely.'",
          id: "'Mereka meluangkan waktu memberi masukan karena percaya pada potensiku. Aku bisa menerima ini dengan lapang dada.'",
        },
      },
      {
        id: "b",
        voice: "critical",
        text: {
          en: "'They think your work is weak. You should have anticipated those flaws; how blind could you be?'",
          id: "'Mereka menganggap karyamu lemah. Harusnya kamu tahu kekurangan itu dari awal; betapa cerobohnya dirimu!'",
        },
      },
      {
        id: "c",
        voice: "solution",
        text: {
          en: "'List the 3 actionable edits, schedule 45 minutes to execute them, and send an updated draft.'",
          id: "'Catat 3 poin revisi konkretnya, jadwalkan 45 menit untuk mengerjakannya, dan kirimkan draf perbaikan.'",
        },
      },
      {
        id: "d",
        voice: "anxious",
        text: {
          en: "'Does this mean they regret working with me? What if this critique leads to them replacing me entirely?'",
          id: "'Apakah ini artinya mereka menyesal bekerja sama denganku? Bagaimana jika mereka mencari penggantiku?'",
        },
      },
    ],
  },
  {
    id: 8,
    situation: {
      en: "You are alone on a quiet evening with no tasks scheduled. What does your mind whisper?",
      id: "Anda sendirian di malam hari yang hening tanpa ada tugas atau agenda. Apa bisikan batin Anda?",
    },
    options: [
      {
        id: "a",
        voice: "compassionate",
        text: {
          en: "'Enjoy this peaceful stillness. Being comfortable in my own company is a precious gift of contentment.'",
          id: "'Nikmati ketenangan yang damai ini. Nyaman bersama diri sendiri adalah anugerah rasa syukur yang berharga.'",
        },
      },
      {
        id: "b",
        voice: "critical",
        text: {
          en: "'Why are you just sitting here doing nothing? You should be working, studying, or networking!'",
          id: "'Mengapa kamu cuma duduk diam tidak menghasilkan apa-apa? Harusnya kamu bekerja, belajar, atau menambah relasi!'",
        },
      },
      {
        id: "c",
        voice: "solution",
        text: {
          en: "'Read 20 pages of a good book, prepare clothes for tomorrow, and enjoy an intentional quiet rest.'",
          id: "'Membaca 20 halaman buku bagus, menyiapkan pakaian untuk besok, dan menikmati istirahat terencana.'",
        },
      },
      {
        id: "d",
        voice: "anxious",
        text: {
          en: "'Why is no one messaging me? Does nobody care about me? I am going to end up completely alone.'",
          id: "'Kenapa tidak ada yang mengirim pesan? Apakah tidak ada yang peduli padaku? Aku akan berakhir kesepian selamanya.'",
        },
      },
    ],
  },
  {
    id: 9,
    situation: {
      en: "You make an awkward social faux pas at a gathering (e.g. spilled a drink or told an unappreciated joke). What thoughts replay?",
      id: "Anda melakukan kekeliruan canggung di pesta (misal menumpahkan minuman atau melontarkan lelucon garing). Pikiran apa yang berputar?",
    },
    options: [
      {
        id: "a",
        voice: "compassionate",
        text: {
          en: "'A funny, clumsy human moment. In 5 minutes everyone will move on, so let yourself breathe easily.'",
          id: "'Momen kikuk manusiawi yang lucu. Dalam 5 menit semua orang sudah lupa dan beralih topik, jadi tenanglah.'",
        },
      },
      {
        id: "b",
        voice: "critical",
        text: {
          en: "'Why did you open your mouth? You always make a fool of yourself in public, you have zero social grace.'",
          id: "'Kenapa tadi kamu sok bicara? Kamu selalu mempermalukan diri di depan umum, kamu payah dalam pergaulan.'",
        },
      },
      {
        id: "c",
        voice: "solution",
        text: {
          en: "'Grab a napkin, clean the spill with a pleasant smile, and ask the person next to you an engaging question.'",
          id: "'Ambil serbet, bersihkan tumpahan dengan senyum ramah, dan ajak orang di sebelah mengobrol topik menarik.'",
        },
      },
      {
        id: "d",
        voice: "anxious",
        text: {
          en: "'They will never invite me back. I want the ground to swallow me whole right now!'",
          id: "'Mereka tidak akan pernah mengundangku lagi. Aku ingin menghilang ditelan bumi sekarang juga!'",
        },
      },
    ],
  },
  {
    id: 10,
    situation: {
      en: "Looking at your overall internal monologue when facing difficulties, which description captures it best?",
      id: "Melihat keseluruhan monolog batin Anda saat menghadapi kesulitan hidup, deskripsi mana yang paling akurat?",
    },
    options: [
      {
        id: "a",
        voice: "compassionate",
        text: {
          en: "A warm, encouraging friend who validates my pain and reminds me of my innate dignity and resilience.",
          id: "Sahabat hangat yang memvalidasi rasa lelah dan mengingatkanku akan ketangguhan serta harga diri yang utuh.",
        },
      },
      {
        id: "b",
        voice: "critical",
        text: {
          en: "A strict, demanding drill sergeant who uses shame and harsh pressure to force high performance.",
          id: "Pelatih militer galak yang memakai rasa bersalah dan tekanan keras untuk memaksakan kinerja tinggi.",
        },
      },
      {
        id: "c",
        voice: "solution",
        text: {
          en: "A pragmatic project manager who strips out emotional drama and focuses on next practical tactical steps.",
          id: "Manajer proyek pragmatis yang menyingkirkan drama emosi dan fokus pada langkah teknis berikutnya.",
        },
      },
      {
        id: "d",
        voice: "anxious",
        text: {
          en: "A hyper-vigilant alarm bell that constantly scans for worst-case catastrophes and impending disasters.",
          id: "Alarm bahaya yang terus berdengung mencari potensi bencana terburuk dan ancaman yang akan datang.",
        },
      },
    ],
  },
];

const VOICE_META: Record<
  SelfTalkKey,
  {
    name: { en: string; id: string };
    desc: { en: string; id: string };
    strengths: { en: string[]; id: string[] };
    challenges: { en: string[]; id: string[] };
    reflectionPrompts: { en: string[]; id: string[] };
    actionSuggestions: { en: string[]; id: string[] };
  }
> = {
  compassionate: {
    name: {
      en: "Self-Compassionate & Nurturing",
      id: "Welas Asih & Pengasuhan Diri (Self-Compassionate)",
    },
    desc: {
      en: "Your internal dialogue treats you with the kindness of a wise, caring friend. You recognize human imperfection, offer soothing comfort during setbacks, and foster emotional resilience.",
      id: "Monolog batin Anda memperlakukan diri dengan kehangatan seorang sahabat bijak. Anda menerima ketidaksempurnaan manusiawi, menenangkan diri saat gagal, dan menumbuhkan ketahanan emosional yang sehat.",
    },
    strengths: {
      en: [
        "Rapid psychological recovery after failures and mistakes",
        "High self-worth that doesn't collapse under external criticism",
        "Less susceptible to chronic burnout and toxic perfectionism",
      ],
      id: [
        "Pemulihan psikologis yang cepat setelah mengalami kegagalan",
        "Harga diri yang stabil dan tidak runtuh oleh celaan pihak luar",
        "Kebal dari sindrom burnout kronis dan perfeksionisme beracun",
      ],
    },
    challenges: {
      en: [
        "Risk of confusing self-compassion with complacency if not paired with accountability",
        "May hesitate to push through uncomfortable resistance when high rigor is required",
        "Can be misunderstood by peers who associate harsh self-criticism with drive",
      ],
      id: [
        "Bisa tertukar dengan rasa puas berlebih jika tidak diimbangi disiplin perbaikan",
        "Terkadang ragu memaksakan batas kemampuan saat dituntut ketelitian ekstra tinggi",
        "Bisa disalahpahami oleh orang yang terbiasa mengaitkan disiplin dengan cambuk keras",
      ],
    },
    reflectionPrompts: {
      en: [
        "Does my self-compassion hold space for fierce, courageous self-discipline?",
        "How can I pair gentle kindness with rigorous dedication to my potential?",
      ],
      id: [
        "Apakah kebaikan batin saya tetap memberi ruang untuk disiplin diri yang berani?",
        "Bagaimana memadukan kelembutan hati dengan komitmen kuat pada potensi terbaik?",
      ],
    },
    actionSuggestions: {
      en: [
        "Practice 'Fierce Self-Compassion': protect your values and boundaries assertively.",
        "Share your compassionate framing techniques with loved ones who suffer from harsh inner critics.",
      ],
      id: [
        "Latih 'Welas Asih Tegas': lindungi nilai-nilai dan tujuan hidup Anda secara konsisten.",
        "Bagikan cara pandang lembut ini kepada teman yang kerap menyiksa diri dengan kritik tajam.",
      ],
    },
  },
  critical: {
    name: {
      en: "High-Pressure & Self-Critical",
      id: "Kritikus Batin & Tuntutan Tinggi (Self-Critical)",
    },
    desc: {
      en: "Your internal dialogue uses sharp standards, scrutiny, and pressure to drive results. While meant to prevent complacency, it often breeds chronic shame and exhaustion.",
      id: "Monolog batin Anda menggunakan standar tinggi, pengawasan ketat, dan celaan keras untuk mendorong hasil. Meski bermaksud mencegah rasa malas, pola ini seringkali melahirkan rasa bersalah dan kelelahan mental.",
    },
    strengths: {
      en: [
        "Relentless pursuit of quality and intolerance for mediocrity",
        "High attention to detail and sharp alertness for errors",
        "Strong work ethic and determination to prove oneself",
      ],
      id: [
        "Standar kualitas yang tinggi dan enggan puas dengan hasil pas-pasan",
        "Ketelitian tajam terhadap detail dan kewaspadaan terhadap kekeliruan",
        "Etos kerja keras dan determinasi kuat untuk membuktikan kemampuan",
      ],
    },
    challenges: {
      en: [
        "High risk of imposter syndrome, anxiety, and depression",
        "Victories bring only brief relief rather than genuine joy",
        "Can project critical harshness outward onto family or teammates",
      ],
      id: [
        "Risiko tinggi mengalami imposter syndrome, kecemasan, dan kelelahan batin",
        "Kemenangan hanya menghasilkan kelegaan sesaat, bukan kebahagiaan sejati",
        "Bisa tanpa sadar memproyeksikan kritik pedas tersebut kepada rekan atau pasangan",
      ],
    },
    reflectionPrompts: {
      en: [
        "Would I ever speak to a loved child or friend using the exact words I use on myself?",
        "If harsh criticism worked, wouldn't I already be fully happy and complete?",
      ],
      id: [
        "Maukah saya berbicara kepada sahabat atau anak kecil dengan kata-kata kasar yang saya ucapkan ke diri sendiri?",
        "Jika cambuk celaan terbukti membuat sukses bahagia, mengapa saya belum merasa cukup dan tenang?",
      ],
    },
    actionSuggestions: {
      en: [
        "Use thought defusion: preface thoughts with 'I notice my inner critic is saying...'",
        "Replace punitive thoughts ('You're an idiot') with supportive coaching ('That didn't work; what's the adjustment?').",
      ],
      id: [
        "Gunakan teknik defusi: awali pikiran dengan 'Saya menyadari suara kritik batin saya sedang berkata...'",
        "Ganti celaan menyakitkan ('Kamu bodoh') dengan nada pembinaan ('Cara itu keliru; apa penyesuaian yang perlu dibuat?').",
      ],
    },
  },
  solution: {
    name: {
      en: "Pragmatic & Solution-Focused",
      id: "Pragmatis & Berorientasi Solusi (Solution-Focused)",
    },
    desc: {
      en: "Your internal dialogue strips out emotional drama and immediately pivots to problem-solving, operational adjustments, and tactical next steps.",
      id: "Monolog batin Anda meminimalkan drama emosional dan seketika bergeser ke pemecahan masalah, penyesuaian teknis, dan langkah perbaikan konkret berikutnya.",
    },
    strengths: {
      en: [
        "Exceptional practical efficiency during emergencies and crises",
        "Low tendency to wallow in unproductive pity or endless blame",
        "Maintains forward momentum and operational focus under pressure",
      ],
      id: [
        "Efisiensi praktis yang tinggi saat menghadapi masalah darurat",
        "Tidak membuang waktu larut dalam rasa kasihan pada diri sendiri atau saling menyalahkan",
        "Menjaga laju momentum tindakan dan fokus teknis di tengah tekanan",
      ],
    },
    challenges: {
      en: [
        "May bypass genuine emotional processing, suppressing grief or sadness",
        "Others may feel unheard if you offer immediate 'fixes' instead of empathy",
        "Can treat life like a mechanical checklist rather than an emotional journey",
      ],
      id: [
        "Bisa melompati proses pencernaan emosi sehingga rasa sedih tertimbun di bawah sadar",
        "Orang sekitar merasa kurang dipahami jika Anda langsung memberi solusi teknis tanpa empati",
        "Cenderung memperlakukan hidup seperti daftar periksa mesin daripada pengalaman batiniah",
      ],
    },
    reflectionPrompts: {
      en: [
        "Do I allow myself 5 minutes to feel the disappointment before rushing into fix-it mode?",
        "What emotions am I dodging by staying continuously busy with tasks?",
      ],
      id: [
        "Apakah saya memberi waktu 5 menit untuk merasakan kekecewaan sebelum terburu-buru memperbaikinya?",
        "Emosi apa yang sedang saya hindari dengan terus menyibukkan diri pada daftar tugas?",
      ],
    },
    actionSuggestions: {
      en: [
        "Institute an 'Empathy First, Tactics Second' rule for both yourself and your relationships.",
        "Take intentional non-productive breaks where you don't optimize anything.",
      ],
      id: [
        "Terapkan aturan 'Empati dulu, Solusi kemudian' baik untuk diri sendiri maupun rekan.",
        "Luangkan waktu istirahat yang sengaja tidak dioptimasi untuk sekadar menikmati momen santai.",
      ],
    },
  },
  anxious: {
    name: {
      en: "Catastrophizing & Anxious",
      id: "Pencemas & Katastrofik (Anxious / Catastrophizing)",
    },
    desc: {
      en: "Your internal dialogue tends to anticipate the worst-case scenario, magnifying risks, ruminating on uncertainty, and questioning your security.",
      id: "Monolog batin Anda cenderung mengantisipasi skenario terburuk, memperbesar potensi bahaya, merenungi ketidakpastian secara berulang, dan meragukan rasa aman diri.",
    },
    strengths: {
      en: [
        "Exceptional radar for detecting safety vulnerabilities and risks",
        "Deep imagination and desire to protect loved ones and security",
        "Conscientious preparation against potential pitfalls",
      ],
      id: [
        "Radar yang sangat peka dalam mendeteksi titik risiko dan celah bahaya",
        "Imajinasi mendalam dan keinginan besar melindungi rasa aman orang terdekat",
        "Kesiapsiagaan penuh kehati-hatian menghadapi kemungkinan buruk",
      ],
    },
    challenges: {
      en: [
        "High chronic stress, fatigue, and physical muscular tension",
        "Paralyzing fear that prevents taking calculated risks or enjoying peace",
        "Confusion between what is merely possible and what is realistically probable",
      ],
      id: [
        "Stres fisik kronis, kelelahan saraf, dan ketegangan otot tubuh",
        "Ketakutan yang menghambat pengambilan peluang baik atau menikmati ketenteraman",
        "Sering menyamakan antara hal yang sekadar mungkin terjadi dengan hal yang benar-benar berpeluang terjadi",
      ],
    },
    reflectionPrompts: {
      en: [
        "Is this catastrophic scenario based on present facts or catastrophic projection?",
        "If the absolute worst happened, what resilience resources do I have to survive it?",
      ],
      id: [
        "Apakah bayangan buruk ini berpijak pada fakta saat ini atau sekadar proyeksi ketakutan?",
        "Jika skenario terburuk benar-benar terjadi, kekuatan dan bantuan apa yang saya miliki untuk melaluinya?",
      ],
    },
    actionSuggestions: {
      en: [
        "Ask the grounding question: 'What is true, certain, and safe right here in this room right now?'",
        "Limit catastrophic ruminations by scheduling a bounded 10-minute 'Worry Time' each afternoon.",
      ],
      id: [
        "Ajukan pertanyaan penenang: 'Apa hal nyata, aman, dan pasti yang ada di ruangan ini sekarang?'",
        "Batasi pusaran cemas dengan mengalokasikan 10 menit 'Waktu Khusus Cemas' di sore hari lalu sudahi.",
      ],
    },
  },
};

export function calculateSelfTalkScore(
  answers: Record<number, string>,
  lang: ToolLanguage
): SelfTalkResult {
  const counts: Record<SelfTalkKey, number> = {
    compassionate: 0,
    critical: 0,
    solution: 0,
    anxious: 0,
  };

  SELF_TALK_QUESTIONS.forEach((q) => {
    const selectedOptionId = answers[q.id];
    if (selectedOptionId) {
      const option = q.options.find((opt) => opt.id === selectedOptionId);
      if (option) {
        counts[option.voice] += 1;
      }
    }
  });

  const totalAnswered = Object.keys(answers).length || 1;

  const entries = (Object.keys(counts) as SelfTalkKey[]).map((key) => {
    const count = counts[key];
    const percentage = Math.round((count / totalAnswered) * 100);
    const meta = VOICE_META[key];
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
    {} as Record<SelfTalkKey, SelfTalkScore>
  );

  const primaryVoice = entries[0].score;
  const secondaryVoice = entries[1].score;

  let overallSummary = "";
  if (lang === "id") {
    overallSummary = `Suara monolog batin utama Anda didominasi oleh ${primaryVoice.name} (${primaryVoice.percentage}%), dengan nada pendukung berupa ${secondaryVoice.name} (${secondaryVoice.percentage}%). Pola percakapan internal ini membentuk bagaimana Anda merespon kesalahan, menghadapi ketidakpastian, dan memperlakukan diri sendiri setiap hari.`;
  } else {
    overallSummary = `Your dominant inner monologue is led by ${primaryVoice.name} (${primaryVoice.percentage}%), accompanied by ${secondaryVoice.name} (${secondaryVoice.percentage}%). This internal voice dictates how you soothe mistakes, navigate uncertainty, and treat yourself during moments of vulnerability.`;
  }

  return {
    scores: scoresRecord,
    primaryVoice,
    secondaryVoice,
    overallSummary,
  };
}

