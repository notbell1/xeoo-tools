import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Globe,
  HelpCircle,
  Info,
  RotateCcw,
  Target,
} from "lucide-react";

import Footer from "../../components/Footer";
import {
  PROCRASTINATION_QUESTIONS,
  PROCRASTINATION_SCALE_OPTIONS_I18N,
  calculateProcrastinationScore,
  type ProcrastinationResult,
} from "./procrastinationLogic";
import { PSYCH_COMMON, type ToolLanguage } from "./psychologyI18n";

type TestStep = "intro" | "questions" | "result";

export default function ProcrastinationTest() {
  const [lang, setLang] = useState<ToolLanguage>("en");
  const [step, setStep] = useState<TestStep>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<ProcrastinationResult | null>(null);

  const t = PSYCH_COMMON[lang];
  const totalQuestions = PROCRASTINATION_QUESTIONS.length;
  const currentQuestion = PROCRASTINATION_QUESTIONS[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const res = calculateProcrastinationScore(answers, lang);
      setResult(res);
      setStep("result");
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleStart = () => {
    setStep("questions");
    setCurrentIndex(0);
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
    setCurrentIndex(0);
    setStep("intro");
  };

  const handleLanguageChange = (newLang: ToolLanguage) => {
    setLang(newLang);
    if (result) {
      setResult(calculateProcrastinationScore(answers, newLang));
    }
  };

  const isCurrentAnswered =
    currentQuestion && answers[currentQuestion.id] !== undefined;
  const canFinish = answeredCount === totalQuestions;

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      <main className="mx-auto w-full max-w-3xl flex-1 px-3 py-4 sm:px-5 sm:py-6">
        {/* COMPACT TOOL HEADER WITH LANGUAGE TOGGLE */}
        <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xeoo-primary">
              <Clock className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {t.selfAssessmentBadge}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-xeoo-text sm:text-2xl">
              {lang === "id"
                ? "Tes Kecenderungan Prokrastinasi"
                : "Procrastination Tendency Test"}
            </h1>
            <p className="text-xs text-xeoo-muted leading-relaxed">
              {lang === "id"
                ? "Identifikasi kebiasaan menunda tugas dan faktor pendorong perilaku seperti perfeksionisme dan kejelasan tugas."
                : "Identify your task postponement habits and uncover the underlying behavioral drivers."}
            </p>
          </div>

          {/* LANGUAGE SWITCHER */}
          <div className="flex shrink-0 items-center gap-1 self-start rounded-lg border border-xeoo-border bg-xeoo-surface p-1 shadow-xs">
            <div className="flex items-center gap-1 pl-1.5 pr-1 text-xeoo-muted">
              <Globe className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase">Lang</span>
            </div>
            <button
              type="button"
              onClick={() => handleLanguageChange("en")}
              className={`rounded px-2.5 py-1 text-[11px] font-bold transition ${
                lang === "en"
                  ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                  : "text-xeoo-muted hover:text-xeoo-text"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange("id")}
              className={`rounded px-2.5 py-1 text-[11px] font-bold transition ${
                lang === "id"
                  ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                  : "text-xeoo-muted hover:text-xeoo-text"
              }`}
            >
              ID
            </button>
          </div>
        </div>

        {/* STEP 1: INTRO */}
        {step === "intro" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5 shadow-xs">
              <h2 className="text-sm font-bold text-xeoo-text">
                {lang === "id"
                  ? "Dinamika Perilaku Penundaan Tugas"
                  : "Behavioral Postponement Dynamics"}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-xeoo-muted">
                {lang === "id"
                  ? "Prokrastinasi seringkali merupakan bentuk regulasi emosi saat menghadapi ketidakjelasan tugas atau rasa cemas. Asesmen ini mengevaluasi 5 pendorong utama:"
                  : "Procrastination is often an emotional regulation response when facing task friction or ambiguity. This test identifies 5 key behavioral drivers:"}
              </p>

              <div className="mt-3.5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <span className="text-[11px] font-bold text-xeoo-primary uppercase">
                    1. {lang === "id" ? "Penghindaran Tugas" : "Task Avoidance"}
                  </span>
                  <p className="mt-0.5 text-[11px] text-xeoo-muted">
                    {lang === "id"
                      ? "Menunda karena bosan atau menunggu datangnya motivasi."
                      : "Postponing tasks due to boredom or waiting for motivation."}
                  </p>
                </div>
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <span className="text-[11px] font-bold text-xeoo-primary uppercase">
                    2. {lang === "id" ? "Ketergantungan Deadline" : "Deadline Dependence"}
                  </span>
                  <p className="mt-0.5 text-[11px] text-xeoo-muted">
                    {lang === "id"
                      ? "Mengandalkan kepanikan menit akhir untuk memicu fokus."
                      : "Relying on eleventh-hour panic to generate focus."}
                  </p>
                </div>
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <span className="text-[11px] font-bold text-xeoo-primary uppercase">
                    3. {lang === "id" ? "Distraksi Lingkungan" : "Distraction"}
                  </span>
                  <p className="mt-0.5 text-[11px] text-xeoo-muted">
                    {lang === "id"
                      ? "Beralih ke tugas-tugas kecil yang mudah dibanding prioritas inti."
                      : "Switching to low-value easy tasks instead of vital goals."}
                  </p>
                </div>
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <span className="text-[11px] font-bold text-xeoo-primary uppercase">
                    4. {lang === "id" ? "Perfeksionisme" : "Perfectionism"}
                  </span>
                  <p className="mt-0.5 text-[11px] text-xeoo-muted">
                    {lang === "id"
                      ? "Takut berbuat salah atau standar kesempurnaan berlebih."
                      : "Fear of making errors or unrealistic flawless standards."}
                  </p>
                </div>
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 sm:col-span-2 lg:col-span-2">
                  <span className="text-[11px] font-bold text-xeoo-primary uppercase">
                    5. {lang === "id" ? "Ketidakjelasan Tugas" : "Low Task Clarity"}
                  </span>
                  <p className="mt-0.5 text-[11px] text-xeoo-muted">
                    {lang === "id"
                      ? "Macet karena cakupan proyek belum jelas langkah awalnya."
                      : "Stalling because project scopes lack obvious starting steps."}
                  </p>
                </div>
              </div>

              {/* Guide */}
              <div className="mt-3.5 rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                <div className="flex items-start gap-2.5">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-xeoo-primary" />
                  <div className="space-y-0.5 text-[11px] text-xeoo-text">
                    <p className="font-semibold">
                      {lang === "id" ? "Panduan Pengisian:" : "Self-Reflection Guide:"}
                    </p>
                    <p className="text-xeoo-muted">
                      {lang === "id"
                        ? "Terdiri dari 20 pertanyaan. Jawablah berdasarkan kebiasaan belajar atau kerja Anda sehari-hari (~3 menit)."
                        : "Contains 20 statements. Answer based on everyday study/work habits (~3 minutes)."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-t border-xeoo-border pt-3.5">
                <span className="text-[11px] text-xeoo-muted">
                  {lang === "id"
                    ? "20 pertanyaan • Rincian pendorong • 100% privat"
                    : "20 questions • Driver breakdown • 100% private"}
                </span>
                <button
                  type="button"
                  onClick={handleStart}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-xeoo-text px-5 py-2 text-xs font-semibold text-xeoo-surface transition hover:opacity-90 active:scale-[0.99]"
                >
                  {t.start}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="rounded-lg border border-xeoo-border bg-xeoo-surface p-3 text-[11px] text-xeoo-muted">
              <span className="font-semibold text-xeoo-text">
                {t.disclaimerTitle}:{" "}
              </span>
              {t.disclaimerBody}
            </div>
          </div>
        )}

        {/* STEP 2: QUESTIONS */}
        {step === "questions" && (
          <div className="space-y-4">
            {/* Progress Header */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3.5 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
                <span className="font-semibold text-xeoo-text">
                  {t.question} {currentIndex + 1} {t.of} {totalQuestions}
                </span>
                <span className="text-xeoo-muted">
                  {answeredCount} {t.of} {totalQuestions} {t.answered} ({progressPercent}%)
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-xeoo-surface-soft border border-xeoo-border">
                <div
                  className="h-full bg-xeoo-primary transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5 shadow-xs">
              <span className="inline-block rounded bg-xeoo-primary-soft px-2 py-0.5 text-[10px] font-bold text-xeoo-primary uppercase">
                #{currentIndex + 1}
              </span>

              <h2 className="mt-3 text-base font-semibold leading-snug text-xeoo-text sm:text-lg">
                "{currentQuestion.text[lang]}"
              </h2>

              <p className="mt-1 text-[11px] text-xeoo-muted">
                {lang === "id"
                  ? "Seberapa sering hal ini menggambarkan kebiasaan Anda?"
                  : "How frequently does this reflect your behavior?"}
              </p>

              {/* Options */}
              <div className="mt-4 space-y-2">
                {PROCRASTINATION_SCALE_OPTIONS_I18N[lang].map((option) => {
                  const isSelected =
                    answers[currentQuestion.id] === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        handleSelectAnswer(currentQuestion.id, option.value)
                      }
                      className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-xs transition ${
                        isSelected
                          ? "border-xeoo-primary bg-xeoo-primary-soft font-semibold text-xeoo-primary ring-1 ring-xeoo-primary/30"
                          : "border-xeoo-border bg-xeoo-surface text-xeoo-text hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft"
                      }`}
                    >
                      <span>{option.label}</span>
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] ${
                          isSelected
                            ? "border-xeoo-primary bg-xeoo-primary text-white"
                            : "border-xeoo-border text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation controls */}
              <div className="mt-5 flex items-center justify-between border-t border-xeoo-border pt-3">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="inline-flex items-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-1.5 text-xs font-medium text-xeoo-text transition hover:bg-xeoo-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t.previous}
                </button>

                <div className="flex items-center gap-2">
                  {currentIndex < totalQuestions - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!isCurrentAnswered}
                      className="inline-flex items-center gap-1 rounded-lg bg-xeoo-text px-4 py-1.5 text-xs font-semibold text-xeoo-surface transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {t.next}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!canFinish}
                      className="inline-flex items-center gap-1 rounded-lg bg-xeoo-text px-4 py-1.5 text-xs font-semibold text-xeoo-surface transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {t.viewResults}
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Jump pills */}
            <div className="flex flex-wrap items-center justify-center gap-1">
              {PROCRASTINATION_QUESTIONS.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Question ${idx + 1}`}
                    className={`flex h-6 w-6 items-center justify-center rounded text-[11px] font-semibold transition ${
                      isCurrent
                        ? "border border-xeoo-primary bg-xeoo-primary text-white"
                        : isAnswered
                          ? "border border-xeoo-border bg-xeoo-surface-soft text-xeoo-text"
                          : "border border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:border-xeoo-border-dark"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: RESULT */}
        {step === "result" && result && (
          <div className="space-y-4">
            {/* Top Score Card */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5 shadow-xs">
              <span className="text-[10px] font-bold text-xeoo-primary uppercase tracking-wider">
                {lang === "id" ? "Hasil Pengukuran" : "Assessment Outcome"}
              </span>

              <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-xeoo-text sm:text-2xl">
                    {result.level}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-xeoo-muted max-w-lg">
                    {result.levelSummary}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-6 py-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-xeoo-muted">
                    {lang === "id" ? "Indeks Prokrastinasi" : "Procrastination Score"}
                  </span>
                  <span className="text-2xl font-extrabold text-xeoo-text sm:text-3xl mt-0.5">
                    {result.overallScore}
                  </span>
                  <span className="text-[10px] text-xeoo-muted">/ 100</span>
                </div>
              </div>
            </div>

            {/* Primary Driver Focus Card */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-xeoo-primary uppercase">
                <Target className="h-3.5 w-3.5" />
                <span>
                  {lang === "id"
                    ? "Pendorong Utama Penundaan"
                    : "Primary Behavioral Driver"}
                </span>
              </div>

              <h3 className="mt-1.5 text-base font-bold text-xeoo-text">
                {result.strongestPattern.label} ({result.strongestPattern.percentage}%)
              </h3>

              <p className="mt-1 text-xs text-xeoo-muted leading-relaxed">
                {result.strongestPattern.description}
              </p>

              <div className="mt-3 rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                <span className="text-[11px] font-bold text-xeoo-primary uppercase">
                  {lang === "id" ? "Tips Aksi Praktis:" : "Actionable Strategy:"}
                </span>
                <p className="mt-0.5 text-xs text-xeoo-text leading-relaxed">
                  {result.strongestPattern.actionTip}
                </p>
              </div>
            </div>

            {/* Pattern Breakdown */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5 shadow-xs">
              <h3 className="text-sm font-bold text-xeoo-text">
                {t.scoreBreakdown}
              </h3>

              <div className="mt-4 space-y-3.5">
                {Object.values(result.patterns).map((pat) => (
                  <div key={pat.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-xeoo-text">
                        {pat.label}
                      </span>
                      <span className="font-mono font-bold text-xeoo-text">
                        {pat.percentage}%
                      </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-xeoo-surface-soft border border-xeoo-border">
                      <div
                        className="h-full bg-xeoo-primary transition-all duration-500"
                        style={{ width: `${pat.percentage}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-xeoo-muted">{pat.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategies */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-xeoo-primary uppercase">
                <Compass className="h-3.5 w-3.5" />
                <span>{t.recommendedFocus}</span>
              </div>

              <ul className="mt-3 space-y-2">
                {result.strategies.map((str, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2.5 text-xs text-xeoo-text leading-relaxed"
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-xeoo-primary-soft text-[10px] font-bold text-xeoo-primary">
                      {idx + 1}
                    </span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer & Retake */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5 shadow-xs">
              <div className="flex items-start gap-2.5">
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-xeoo-muted" />
                <div className="space-y-0.5 text-[11px] text-xeoo-muted">
                  <p className="font-semibold text-xeoo-text">
                    {t.disclaimerTitle}
                  </p>
                  <p>{t.disclaimerBody}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end border-t border-xeoo-border pt-3">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-4 py-2 text-xs font-semibold text-xeoo-text transition hover:bg-xeoo-surface-soft"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t.retake}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
