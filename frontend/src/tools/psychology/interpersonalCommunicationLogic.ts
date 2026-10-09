import type { ToolLanguage } from "./psychologyI18n";

export type CommStyleKey =
  | "empathic"
  | "direct"
  | "inquiring"
  | "diplomatic";

export interface CommScenarioOption {
  id: string;
  style: CommStyleKey;
  text: {
    en: string;
    id: string;
  };
}

export interface CommScenarioQuestion {
  id: number;
  situation: {
    en: string;
    id: string;
  };
  options: CommScenarioOption[];
}

export interface CommStyleScore {
  key: CommStyleKey;
  name: string;
  percentage: number;
  description: string;
  strengths: string[];
  challenges: string[];
  reflectionPrompts: string[];
  actionSuggestions: string[];
}

export interface CommStyleResult {
  scores: Record<CommStyleKey, CommStyleScore>;
  primaryStyle: CommStyleScore;
  secondaryStyle: CommStyleScore;
  overallSummary: string;
}

export const COMM_QUESTIONS: CommScenarioQuestion[] = [
  {
    id: 1,
    situation: {
      en: "A coworker comes to your desk looking noticeably stressed and sighs heavily. How do you open the conversation?",
      id: "Rekan kerja mendatangi meja Anda dengan wajah lelah dan menghela napas panjang. Bagaimana Anda membuka percakapan?",
    },
    options: [
      {
        id: "a",
        style: "empathic",
        text: {
          en: "'You look carrying a heavy load right now; I'm here if you just want to sit or let it out.'",
          id: "'Kelihatan banyak beban yang kamu bawa hari ini; aku siap mendengarkan kalau kamu ingin curhat atau rehat sebentar.'",
        },
      },
      {
        id: "b",
        style: "direct",
        text: {
          en: "'What's the specific blocker on your plate, and what do you need from me to unblock it?'",
          id: "'Apa kendala spesifik yang sedang macet di tokomu, dan bantuan apa yang kamu butuhkan dariku untuk menyelesaikannya?'",
        },
      },
      {
        id: "c",
        style: "inquiring",
        text: {
          en: "'How has the project review unfolded this morning? What surprised you the most about their feedback?'",
          id: "'Bagaimana jalannya evaluasi proyek pagi tadi? Apa yang paling di luar dugaan dari masukan mereka?'",
        },
      },
      {
        id: "d",
        style: "diplomatic",
        text: {
          en: "'I hope the afternoon treats you more gently. Let's grab some coffee and take a breath together.'",
          id: "'Semoga siang ini suasananya lebih ramah untukmu. Yuk kita ambil minum dulu dan istirahat sejenak.'",
        },
      },
    ],
  },
  {
    id: 2,
    situation: {
      en: "You need to explain a complex technical concept or new workflow to non-technical teammates. What is your method?",
      id: "Anda perlu menjelaskan konsep teknis yang rumit atau alur kerja baru kepada rekan tim non-teknis. Apa metode Anda?",
    },
    options: [
      {
        id: "a",
        style: "empathic",
        text: {
          en: "Check in with their comfort level first, reassuring them that jargon is intimidating and keeping the vibe relaxed.",
          id: "Mengecek kenyamanan mereka terlebih dahulu, menenangkan bahwa istilah teknis memang wajar terasa asing, dan menjaga suasana santai.",
        },
      },
      {
        id: "b",
        style: "direct",
        text: {
          en: "Deliver a high-level summary upfront: 3 clear steps, bullet points, and exact actionable takeaways.",
          id: "Menyampaikan ringkasan inti di awal: 3 langkah konkret, poin-poin jelas, dan tenggat tugas spesifik.",
        },
      },
      {
        id: "c",
        style: "inquiring",
        text: {
          en: "Start with an open question: 'What is your current biggest pain point with the existing workflow?' and build around that.",
          id: "Memulai dengan pertanyaan terbuka: 'Apa kendala paling merepotkan dari alur lama saat ini?' lalu membangun penjelasan dari sana.",
        },
      },
      {
        id: "d",
        style: "diplomatic",
        text: {
          en: "Use gentle relatable analogies, praising the team's past contributions before suggesting process upgrades.",
          id: "Menggunakan analogi sederhana yang ramah, memuji pencapaian tim sebelumnya sebelum menyarankan pembaruan alur.",
        },
      },
    ],
  },
  {
    id: 3,
    situation: {
      en: "In a meeting, two participants start talking over each other and raising their voices. How do you intervene?",
      id: "Dalam rapat, dua peserta mulai saling memotong pembicaraan dengan nada suara meninggi. Bagaimana Anda menengahi?",
    },
    options: [
      {
        id: "a",
        style: "empathic",
        text: {
          en: "'I can feel how deeply both of you care about this initiative; let's pause so each point can be fully heard.'",
          id: "'Saya bisa merasakan betapa kalian berdua sangat peduli pada inisiatif ini; mari kita jeda agar setiap pendapat bisa didengar utuh.'",
        },
      },
      {
        id: "b",
        style: "direct",
        text: {
          en: "'Hold on, one voice at a time. Speaker A has 2 minutes, then Speaker B will respond.'",
          id: "'Tunggu sebentar, bicara bergantian. Pembicara A silakan 2 menit, setelah itu Pembicara B menanggapi.'",
        },
      },
      {
        id: "c",
        style: "inquiring",
        text: {
          en: "'What is the underlying assumption where both proposals actually diverge? Let's clarify the key question.'",
          id: "'Asumsi dasar apa yang sebenarnya menjadi titik perbedaan kedua usulan? Mari kita rumuskan pertanyaannya.'",
        },
      },
      {
        id: "d",
        style: "diplomatic",
        text: {
          en: "'Both views bring great perspectives to the table. Let's take a quick stretch and come back with fresh minds.'",
          id: "'Kedua sudut pandang memberi masukan berharga bagi forum. Mari kita renggangkan badan sejenak lalu diskusikan kembali.'",
        },
      },
    ],
  },
  {
    id: 4,
    situation: {
      en: "Someone is sharing a personal story and you have a related personal experience. What do you do?",
      id: "Seseorang sedang menceritakan pengalaman pribadinya dan Anda pernah mengalami hal yang sangat mirip. Apa yang Anda lakukan?",
    },
    options: [
      {
        id: "a",
        style: "empathic",
        text: {
          en: "Hold your story back completely; keep total focus on their emotion and validate their unique feelings.",
          id: "Menahan cerita sendiri sepenuhnya; memusatkan fokus penuh pada emosi mereka dan memvalidasi keunikan rasanya.",
        },
      },
      {
        id: "b",
        style: "direct",
        text: {
          en: "Briefly mention: 'I navigated that exact problem last year; here is the most effective solution I found.'",
          id: "Menyampaikan ringkas: 'Saya pernah mengalami hal persis tahun lalu; ini solusi paling efektif yang saya temukan.'",
        },
      },
      {
        id: "c",
        style: "inquiring",
        text: {
          en: "Ask deeper follow-ups about their experience: 'How did that moment shift your outlook on the situation?'",
          id: "Mengajukan pertanyaan lanjutan tentang pengalaman mereka: 'Bagaimana peristiwa itu mengubah cara pandangmu?'",
        },
      },
      {
        id: "d",
        style: "diplomatic",
        text: {
          en: "Warmly affirm how relatable that is, sharing solidarity gently without stealing the conversational spotlight.",
          id: "Menyatakan betapa relatenya hal tersebut, memberi sinyal solidaritas tanpa merebut sorotan percakapan.",
        },
      },
    ],
  },
  {
    id: 5,
    situation: {
      en: "You have to deliver critical constructive feedback on someone's subpar presentation. What is your conversational style?",
      id: "Anda harus menyampaikan kritik membangun atas presentasi seseorang yang kurang memuaskan. Bagaimana gaya bicara Anda?",
    },
    options: [
      {
        id: "a",
        style: "empathic",
        text: {
          en: "Start by acknowledging how stressful presenting is, creating psychological safety before highlighting areas to grow.",
          id: "Mengawali dengan memahami betapa mendebarkannya presentasi di depan umum, menciptakan rasa aman sebelum memberi masukan.",
        },
      },
      {
        id: "b",
        style: "direct",
        text: {
          en: "Get straight to the point: 'The narrative lacked clarity on slide 3 and 7; here are the 2 fixes needed.'",
          id: "Langsung ke inti: 'Alur ceritanya kurang jelas pada slide 3 dan 7; ini 2 perbaikan spesifik yang perlu diubah.'",
        },
      },
      {
        id: "c",
        style: "inquiring",
        text: {
          en: "Coach with questions: 'How did you feel the delivery landed? What would you do differently if you re-ran it?'",
          id: "Membimbing dengan pertanyaan: 'Bagaimana menurutmu kesan audiens tadi? Apa yang ingin kamu ubah jika diulang?'",
        },
      },
      {
        id: "d",
        style: "diplomatic",
        text: {
          en: "Use the classic sandwich approach: highlight genuine strengths, soften the critiques gently, and end with encouragement.",
          id: "Memakai pendekatan bertahap: mengapresiasi kelebihannya, menyampaikan kritik secara halus, dan menutup dengan semangat.",
        },
      },
    ],
  },
  {
    id: 6,
    situation: {
      en: "During a dinner party or networking event, there is an uncomfortable silence at the table. How do you bridge it?",
      id: "Saat makan malam atau acara jejaring, terjadi keheningan canggung di meja obrolan. Bagaimana Anda menjembataninya?",
    },
    options: [
      {
        id: "a",
        style: "empathic",
        text: {
          en: "Smile warmly at someone who looks nervous, making friendly eye contact to ease their tension.",
          id: "Tersenyum ramah pada seseorang yang tampak canggung, melakukan kontak mata bersahabat untuk mencairkan suasana.",
        },
      },
      {
        id: "b",
        style: "direct",
        text: {
          en: "Introduce a clear, compelling topic or current event: 'Has anyone seen the recent launch in our industry?'",
          id: "Melempar topik yang jelas dan menarik: 'Ada yang sudah dengar tentang peluncuran inovasi terbaru di industri kita?'",
        },
      },
      {
        id: "c",
        style: "inquiring",
        text: {
          en: "Ask an engaging open-ended question: 'What is a personal project or passion keeping everyone excited lately?'",
          id: "Mengajukan pertanyaan terbuka yang memikat: 'Aktivitas atau hobi apa yang sedang bikin teman-teman bersemangat akhir-akhir ini?'",
        },
      },
      {
        id: "d",
        style: "diplomatic",
        text: {
          en: "Compliment the food or host's hospitality, seamlessly rolling that into a safe, agreeable conversation.",
          id: "Memuji hidangan atau keramahan tuan rumah, lalu menyambungnya ke obrolan santai yang menyenangkan semua orang.",
        },
      },
    ],
  },
  {
    id: 7,
    situation: {
      en: "Someone expresses an opinion on a controversial topic that you strongly disagree with. How do you respond?",
      id: "Seseorang menyampaikan opini tentang topik kontroversial yang bertolak belakang dengan pandangan Anda. Bagaimana Anda merespon?",
    },
    options: [
      {
        id: "a",
        style: "empathic",
        text: {
          en: "Seek to understand the emotional values and personal experiences that shaped their perspective.",
          id: "Berusaha memahami nilai emosional dan pengalaman hidup personal yang membentuk cara pandang mereka.",
        },
      },
      {
        id: "b",
        style: "direct",
        text: {
          en: "State your counterpoint clearly and factually: 'I view that differently based on these concrete facts.'",
          id: "Menyampaikan pandangan sebaliknya secara jelas dan berbasis fakta: 'Saya melihatnya berbeda berdasarkan fakta-fakta ini.'",
        },
      },
      {
        id: "c",
        style: "inquiring",
        text: {
          en: "Probe their rationale with curious inquiry: 'What led you to that conclusion? How do you view the counter-argument?'",
          id: "Menggali logika mereka dengan rasa ingin tahu: 'Apa yang mengantarkanmu ke kesimpulan itu? Bagaimana kamu melihat argumen sebaliknya?'",
        },
      },
      {
        id: "d",
        style: "diplomatic",
        text: {
          en: "Find common ground first: 'I can see where you're coming from on that aspect,' framing differences respectfully.",
          id: "Mencari titik temu terlebih dahulu: 'Saya paham dari sudut pandang mana poin itu berasal,' membingkai perbedaan secara santun.",
        },
      },
    ],
  },
  {
    id: 8,
    situation: {
      en: "A friend repeatedly complains about a recurring problem in their life without taking action. How do you engage?",
      id: "Seorang teman berulang kali mengeluhkan masalah hidup yang sama tanpa pernah mengambil tindakan nyata. Bagaimana Anda menanggapinya?",
    },
    options: [
      {
        id: "a",
        style: "empathic",
        text: {
          en: "Keep offering warm patient listening, realizing they might not be ready for solutions yet and just need an ear.",
          id: "Tetap mendengarkan dengan sabar dan hangat, menyadari mungkin mereka belum siap untuk solusi dan hanya butuh didengar.",
        },
      },
      {
        id: "b",
        style: "direct",
        text: {
          en: "Lovingly cut through the loop: 'You've mentioned this for 3 months. Do you want to brainstorm solutions or just vent?'",
          id: "Memutus lingkaran keluhan dengan jujur: 'Kamu sudah mengeluhkan ini 3 bulan. Mau kita cari solusinya bersama atau sekadar curhat?'",
        },
      },
      {
        id: "c",
        style: "inquiring",
        text: {
          en: "Ask clarifying questions: 'What do you think is stopping you from taking the first step to change that situation?'",
          id: "Mengajukan pertanyaan reflektif: 'Kira-kira apa yang paling menahanmu untuk mengambil langkah pertama mengubah hal itu?'",
        },
      },
      {
        id: "d",
        style: "diplomatic",
        text: {
          en: "Validate how exhausting the situation must be, gently sharing inspiring stories of others who navigated similar changes.",
          id: "Memvalidasi betapa melelahkannya situasi itu, lalu dengan halus menceritakan kisah orang lain yang berhasil keluar.",
        },
      },
    ],
  },
  {
    id: 9,
    situation: {
      en: "You are speaking to a group and you notice several listeners checking their phones. What is your reaction?",
      id: "Anda sedang berbicara di depan kelompok dan melihat beberapa orang mulai mengecek ponsel mereka. Apa reaksi Anda?",
    },
    options: [
      {
        id: "a",
        style: "empathic",
        text: {
          en: "Attune to their energy level, acknowledging that everyone is tired and picking up the vocal warmth.",
          id: "Menyelaraskan dengan energi audiens, menyadari mereka mungkin lelah, dan memperhangat nada bicara.",
        },
      },
      {
        id: "b",
        style: "direct",
        text: {
          en: "Sharpen your delivery: pause firmly, deliver the most critical takeaway, and wrap up ahead of schedule.",
          id: "Menajamkan penyampaian: jeda sejenak, sampaikan poin paling krusial, dan tuntaskan lebih cepat dari jadwal.",
        },
      },
      {
        id: "c",
        style: "inquiring",
        text: {
          en: "Switch to interactive dialogue: 'Let me pause here—who in the room has run into this challenge recently?'",
          id: "Beralih ke dialog interaktif: 'Saya jeda di sini sebentar—siapa yang pernah mengalami tantangan serupa baru-baru ini?'",
        },
      },
      {
        id: "d",
        style: "diplomatic",
        text: {
          en: "Inject a light self-effacing joke or brief interactive poll to re-engage the room without shaming anyone.",
          id: "Menyisipkan humor ringan atau tanya jawab santai untuk menarik kembali perhatian tanpa membuat siapa pun merasa disindir.",
        },
      },
    ],
  },
  {
    id: 10,
    situation: {
      en: "When people walk away from a meaningful one-on-one conversation with you, what do they feel most?",
      id: "Ketika seseorang selesai mengobrol mendalam berdua dengan Anda, apa yang paling mereka rasakan?",
    },
    options: [
      {
        id: "a",
        style: "empathic",
        text: {
          en: "Deeply seen, heard, emotionally validated, and relieved of heavy burdens.",
          id: "Benar-benar dipahami, didengarkan, divalidasi perasaannya, dan lepas dari beban berat.",
        },
      },
      {
        id: "b",
        style: "direct",
        text: {
          en: "Crystal clear on where things stand, actionable direction, and zero ambiguity.",
          id: "Sangat jelas arah tujuannya, tahu langkah konkret yang harus diambil, dan bebas dari keraguan.",
        },
      },
      {
        id: "c",
        style: "inquiring",
        text: {
          en: "Thoughtfully provoked to think in fresh ways and inspired by great introspective questions.",
          id: "Tersadar untuk berpikir dengan sudut pandang baru dan terinspirasi oleh pertanyaan-pertanyaan reflektif.",
        },
      },
      {
        id: "d",
        style: "diplomatic",
        text: {
          en: "Respected, tactfully guided, comfortable, and appreciated without feeling judged.",
          id: "Dihargai, diarahkan dengan santun, merasa nyaman, dan diterima tanpa merasa dihakimi.",
        },
      },
    ],
  },
];

const COMM_META: Record<
  CommStyleKey,
  {
    name: { en: string; id: string };
    desc: { en: string; id: string };
    strengths: { en: string[]; id: string[] };
    challenges: { en: string[]; id: string[] };
    reflectionPrompts: { en: string[]; id: string[] };
    actionSuggestions: { en: string[]; id: string[] };
  }
> = {
  empathic: {
    name: {
      en: "Empathic & Attuned Listening",
      id: "Mendengarkan Penuh Empati (Empathic Listening)",
    },
    desc: {
      en: "You lead with deep presence, validation, and emotional attunement. People feel exceptionally safe and understood in your conversational space.",
      id: "Anda memimpin percakapan dengan kehadiran utuh, validasi perasaan, dan kepekaan emosional. Orang merasa sangat aman dan dipahami saat berbicara dengan Anda.",
    },
    strengths: {
      en: [
        "Creates profound psychological safety and interpersonal trust",
        "Exceptional ability to de-escalate tension and comfort distressed peers",
        "Listens to understand rather than simply waiting to reply",
      ],
      id: [
        "Menciptakan rasa aman psikologis dan kepercayaan relasional yang mendalam",
        "Kemampuan luar biasa meredakan ketegangan dan menenangkan rekan yang tertekan",
        "Mendengarkan untuk memahami, bukan sekadar menunggu giliran membalas",
      ],
    },
    challenges: {
      en: [
        "Risk of absorbing other people's emotional baggage",
        "May hesitate to be blunt when direct clarity or corrective feedback is needed",
        "Conversations can take longer than necessary during time-crunched moments",
      ],
      id: [
        "Rentan menyerap beban emosi negatif lawan bicara ke dalam diri sendiri",
        "Kadang ragu berbicara lugas saat dibutuhkan arahan cepat atau koreksi tegas",
        "Durasi percakapan bisa berlarut-larut saat waktu sangat terbatas",
      ],
    },
    reflectionPrompts: {
      en: [
        "Am I holding space for them while keeping my own energetic boundaries clear?",
        "When does being too gentle prevent delivering necessary truth?",
      ],
      id: [
        "Apakah saya mendengarkan mereka seraya tetap menjaga batasan energi diri?",
        "Kapan kelembutan yang berlebih justru menghambat penyampaian kebenaran yang penting?",
      ],
    },
    actionSuggestions: {
      en: [
        "Clarify expectations early: 'Are we in a venting zone or a problem-solving zone today?'",
        "Practice delivering direct constructive feedback with kindness and concise words.",
      ],
      id: [
        "Klarifikasi harapan di awal: 'Hari ini apakah kamu butuh didengarkan curhatnya atau ingin cari solusi bersama?'",
        "Latih menyampaikan kritik konstruktif secara ringkas, jelas, dan tetap ramah.",
      ],
    },
  },
  direct: {
    name: {
      en: "Direct & Clarity-Driven",
      id: "Lugas & Berorientasi Kejelasan (Direct & Clear)",
    },
    desc: {
      en: "You value efficiency, precision, and unvarnished truth. You cut through fluff, provide clear actionable direction, and respect people's time.",
      id: "Anda mengutamakan efisiensi, ketepatan fakta, dan kejujuran tanpa basa-basi. Anda menyingkirkan kerumitan, memberikan arahan yang konkret, dan menghargai waktu.",
    },
    strengths: {
      en: [
        "High efficiency and zero ambiguity in instructions or feedback",
        "Keeps projects and meetings sharply focused on goals",
        "Dependable transparency; people always know where they stand with you",
      ],
      id: [
        "Efisiensi tinggi dan bebas dari ketidakjelasan dalam instruksi atau masukan",
        "Menjaga fokus rapat dan proyek tetap pada sasaran utama",
        "Transparansi yang dapat diandalkan; orang selalu tahu posisi pasti mereka di mata Anda",
      ],
    },
    challenges: {
      en: [
        "Can come across as blunt, impatient, or insensitive to emotional nuances",
        "May dismiss important relational preambles that build trust",
        "Others may become defensive or feel criticized prematurely",
      ],
      id: [
        "Bisa terkesan terlalu ketus, tidak sabaran, atau kurang peka perasaan",
        "Cenderung mengabaikan basa-basi ramah yang sebenarnya penting membangun keakraban",
        "Orang lain bisa merasa terintimidasi atau tersinggung sebelum memahami maksud baik Anda",
      ],
    },
    reflectionPrompts: {
      en: [
        "How can I deliver the same clear truth with more conversational warmth?",
        "Did I pause to consider the emotional state of the receiver before delivering this message?",
      ],
      id: [
        "Bagaimana saya bisa menyampaikan fakta yang sama dengan kehangatan penyampaian yang lebih baik?",
        "Apakah saya sudah memperhatikan kondisi emosi lawan bicara sebelum bicara to-the-point?",
      ],
    },
    actionSuggestions: {
      en: [
        "Add a 5-second empathy buffer: validate their effort before delivering the correction.",
        "Check listener body language to ensure message received matches message intended.",
      ],
      id: [
        "Beri bantalan empati 5 detik: apresiasi usaha mereka sebelum menyampaikan evaluasi.",
        "Perhatikan bahasa tubuh lawan bicara untuk memastikan pesan diterima sesuai maksud baik Anda.",
      ],
    },
  },
  inquiring: {
    name: {
      en: "Inquiring & Curiosity-Focused",
      id: "Menggali & Berorientasi Tanya (Inquiring)",
    },
    desc: {
      en: "You communicate through questions, curiosity, and intellectual exploration. You provoke fresh thinking, help others discover their own insights, and dig into root assumptions.",
      id: "Anda berkomunikasi melalui rasa ingin tahu, pertanyaan terbuka, dan eksplorasi ide. Anda memantik cara pandang baru, membantu orang menemukan solusinya sendiri, dan menguji asumsi dasar.",
    },
    strengths: {
      en: [
        "Empowers conversational partners through powerful coaching questions",
        "Uncovers hidden assumptions and innovative creative perspectives",
        "Reduces defensiveness by exploring ideas collaboratively rather than lecturing",
      ],
      id: [
        "Memberdayakan lawan bicara melalui pertanyaan pembinaan yang mencerahkan",
        "Membongkar asumsi tersembunyi dan melahirkan sudut pandang kreatif",
        "Mengurangi sikap defensif karena mengajak berpikir bersama daripada menggurui",
      ],
    },
    challenges: {
      en: [
        "Can make people feel interrogated if questions feel relentless",
        "May avoid taking a definitive personal stand by constantly asking questions",
        "Can delay decision-making when a simple direct answer is all that is required",
      ],
      id: [
        "Bisa membuat orang merasa seperti sedang diinterogasi jika pertanyaan terlalu beruntun",
        "Terkadang menghindari menyatakan sikap tegas sendiri dengan terus balik bertanya",
        "Dapat memperlambat eksekusi ketika yang dibutuhkan sebenarnya adalah jawaban langsung",
      ],
    },
    reflectionPrompts: {
      en: [
        "Am I asking out of genuine curiosity, or leading them toward a preconceived answer?",
        "When is it time to stop questioning and state my own clear recommendation?",
      ],
      id: [
        "Apakah saya bertanya murni karena ingin tahu, atau menggiring ke kesimpulan tertentu?",
        "Kapan saatnya berhenti bertanya dan menyatakan rekomendasi tegas saya sendiri?",
      ],
    },
    actionSuggestions: {
      en: [
        "Balance questions with self-disclosure: share your perspective alongside your inquiries.",
        "Preface deep questions with context so partners don't feel put on the spot.",
      ],
      id: [
        "Seimbangkan pertanyaan dengan pernyataan diri: bagikan pandangan Anda bersamaan dengan bertanya.",
        "Beri pengantar ramah sebelum mengajukan pertanyaan mendalam agar lawan bicara tidak kaget.",
      ],
    },
  },
  diplomatic: {
    name: {
      en: "Diplomatic & Harmony-Buffering",
      id: "Diplomatis & Penjaga Keharmonisan (Diplomatic)",
    },
    desc: {
      en: "You are tactful, respectful, and considerate. You frame messages to preserve interpersonal goodwill, smooth over rough edges, and maintain pleasant social relations.",
      id: "Anda penuh tata krama, bijaksana, dan menghargai perasaan orang lain. Anda merangkai kata dengan santun untuk menjaga keharmonisan, menghaluskan gesekan, dan memelihara hubungan baik.",
    },
    strengths: {
      en: [
        "Smooths interpersonal friction in tense or diverse social settings",
        "High cultural tact and social etiquette across diverse groups",
        "Leaves conversational partners feeling respected and comfortable",
      ],
      id: [
        "Mampu meredakan gesekan interpersonal di lingkungan yang beragam atau sensitif",
        "Tata krama dan etika sosial yang tinggi di berbagai kalangan",
        "Membuat lawan bicara merasa dihormati, nyaman, dan tidak disudutkan",
      ],
    },
    challenges: {
      en: [
        "Risk of diluting critical messages so much that the urgency is lost",
        "May be perceived as overly indirect or non-committal by direct communicators",
        "High internal cognitive effort managing conversational buffers constantly",
      ],
      id: [
        "Risiko memperhalus pesan hingga poin penting atau urgensinya terlewatkan",
        "Dapat dianggap berbelit-belit atau kurang tegas oleh orang yang suka to-the-point",
        "Menguras energi mental karena terus-menerus memfilter dan menghaluskan kata",
      ],
    },
    reflectionPrompts: {
      en: [
        "Is my diplomatic framing helping them understand, or obscuring the core issue?",
        "What hard truth needs to be spoken plainly without excessive sugar-coating?",
      ],
      id: [
        "Apakah gaya diplomatis saya membantu pemahaman, atau justru mengaburkan inti masalah?",
        "Kebenaran penting apa yang saat ini perlu disampaikan secara lugas tanpa pemanis berlebih?",
      ],
    },
    actionSuggestions: {
      en: [
        "Ensure the bottom-line request or critique is stated plainly in one unambiguous sentence.",
        "Practice being comfortable with brief constructive discomfort in service of long-term clarity.",
      ],
      id: [
        "Pastikan inti permintaan atau evaluasi terangkum jelas dalam satu kalimat tegas.",
        "Latih keberanian menerima sedikit ketidaknyamanan sesaat demi kejelasan jangka panjang.",
      ],
    },
  },
};

export function calculateCommStyleScore(
  answers: Record<number, string>,
  lang: ToolLanguage
): CommStyleResult {
  const counts: Record<CommStyleKey, number> = {
    empathic: 0,
    direct: 0,
    inquiring: 0,
    diplomatic: 0,
  };

  COMM_QUESTIONS.forEach((q) => {
    const selectedOptionId = answers[q.id];
    if (selectedOptionId) {
      const option = q.options.find((opt) => opt.id === selectedOptionId);
      if (option) {
        counts[option.style] += 1;
      }
    }
  });

  const totalAnswered = Object.keys(answers).length || 1;

  const entries = (Object.keys(counts) as CommStyleKey[]).map((key) => {
    const count = counts[key];
    const percentage = Math.round((count / totalAnswered) * 100);
    const meta = COMM_META[key];
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
    {} as Record<CommStyleKey, CommStyleScore>
  );

  const primaryStyle = entries[0].score;
  const secondaryStyle = entries[1].score;

  let overallSummary = "";
  if (lang === "id") {
    overallSummary = `Gaya komunikasi interpersonal dominan Anda adalah ${primaryStyle.name} (${primaryStyle.percentage}%), dengan kecenderungan pendukung berupa ${secondaryStyle.name} (${secondaryStyle.percentage}%). Kombinasi ini memperlihatkan bagaimana Anda menyeimbangkan empati mendalam, kejelasan fakta, rasa ingin tahu, dan diplomasi saat bertukar pesan dengan orang lain.`;
  } else {
    overallSummary = `Your dominant interpersonal communication style is ${primaryStyle.name} (${primaryStyle.percentage}%), complemented by ${secondaryStyle.name} (${secondaryStyle.percentage}%). This reveals how you balance empathic listening, crisp clarity, inquisitive dialogue, and diplomatic tact during interpersonal interactions.`;
  }

  return {
    scores: scoresRecord,
    primaryStyle,
    secondaryStyle,
    overallSummary,
  };
}

