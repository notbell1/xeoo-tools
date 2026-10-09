import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Info,
  RotateCcw,
} from "lucide-react";

import Footer from "../../components/Footer";
import {
  COMM_QUESTIONS,
  calculateCommStyleScore,
  type CommStyleResult,
} from "./interpersonalCommunicationLogic";
import { PSYCH_COMMON, type ToolLanguage } from "./psychologyI18n";

type TestStep = "intro" | "questions" | "result";

export default function InterpersonalCommunicationAnalyzer() {
  const [lang, setLang] = useState<ToolLanguage>("en");
  const [step, setStep] = useState<TestStep>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<CommStyleResult | null>(null);

  const t = PSYCH_COMMON[lang];
  const totalQuestions = COMM_QUESTIONS.length;
  const currentQuestion = COMM_QUESTIONS[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectOption = (questionId: number, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const res = calculateCommStyleScore(answers, lang);
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
      setResult(calculateCommStyleScore(answers, newLang));
    }
  };

  const isCurrentAnswered =
    currentQuestion && answers[currentQuestion.id] !== undefined;
  const canFinish = answeredCount === totalQuestions;

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      <main className="mx-auto w-full max-w-3xl flex-1 px-3 py-3 sm:px-5 sm:py-5">
        {/* COMPACT TOOLBAR */}
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-xeoo-border pb-2.5">
          <h1 className="text-sm font-bold tracking-tight text-xeoo-text">
            {lang === "id"
              ? "Analisis Gaya Komunikasi Interpersonal"
              : "Interpersonal Communication Analyzer"}
          </h1>

          {/* LANGUAGE SWITCHER */}
          <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-xeoo-border bg-xeoo-surface p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => handleLanguageChange("en")}
              className={`rounded px-2 py-0.5 text-xs font-semibold transition ${
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
              className={`rounded px-2 py-0.5 text-xs font-semibold transition ${
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
                  ? "Empat Pola Komunikasi Interpersonal Utama"
                  : "The Four Interpersonal Communication Styles"}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-xeoo-muted">
                {lang === "id"
                  ? "Komunikasi yang efektif bukan hanya tentang kejelasan kata, melainkan cara Anda hadir bagi lawan bicara: mendengarkan dengan empati, menyampaikan fakta dengan lugas, memantik wawasan dengan pertanyaan reflektif, atau merawat harmoni lewat diplomasi santun."
                  : "Effective communication is not only about speaking clearly, but how you connect: empathic presence, unambiguous directness, curious inquiry, or diplomatic grace."}
              </p>

              <div className="mt-3.5 grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <span className="text-[11px] font-bold text-xeoo-primary uppercase">
                    1. {lang === "id" ? "Empatik & Validatif (Empathic-Attuned)" : "Empathic-Attuned"}
                  </span>
                  <p className="mt-0.5 text-[11px] text-xeoo-muted">
                    {lang === "id"
                      ? "Menomorsatukan koneksi emosional, ruang aman, dan mendengarkan aktif."
                      : "Prioritizes relational warmth, psychological safety, and active presence."}
                  </p>
                </div>

                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <span className="text-[11px] font-bold text-xeoo-info uppercase">
                    2. {lang === "id" ? "Lugas & Terarah (Direct-Action)" : "Direct-Action"}
                  </span>
                  <p className="mt-0.5 text-[11px] text-xeoo-muted">
                    {lang === "id"
                      ? "Menyampaikan pesan tanpa berbelit-belit, fokus ke sasaran dan solusi."
                      : "Clarity over ambiguity, concise bottom-line facts, and solution-driven."}
                  </p>
                </div>

                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <span className="text-[11px] font-bold text-xeoo-success uppercase">
                    3. {lang === "id" ? "Eksploratif & Dialogis (Inquiring-Collaborative)" : "Inquiring-Collaborative"}
                  </span>
                  <p className="mt-0.5 text-[11px] text-xeoo-muted">
                    {lang === "id"
                      ? "Memantik pemikiran baru lewat pertanyaan terbuka dan kolaborasi perspektif."
                      : "Sparks breakthrough perspectives through curious open questions."}
                  </p>
                </div>

                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <span className="text-[11px] font-bold text-xeoo-warning uppercase">
                    4. {lang === "id" ? "Diplomatis & Bijaksana (Diplomatic-Tactful)" : "Diplomatic-Tactful"}
                  </span>
                  <p className="mt-0.5 text-[11px] text-xeoo-muted">
                    {lang === "id"
                      ? "Menjaga keharmonisan dan memilih kata dengan bijak agar tidak menyinggung."
                      : "Preserves interpersonal harmony, softens tension, and protects trust."}
                  </p>
                </div>
              </div>

              {/* Guide */}
              <div className="mt-3.5 rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                <div className="flex items-start gap-2.5">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-xeoo-primary" />
                  <div className="space-y-0.5 text-[11px] text-xeoo-text">
                    <p className="font-semibold">
                      {lang === "id" ? "Panduan Pengerjaan:" : "Assessment Guide:"}
                    </p>
                    <p className="text-xeoo-muted">
                      {lang === "id"
                        ? "Terdiri dari 10 skenario percakapan sehari-hari. Pilih opsi yang paling mendekati cara Anda biasa berinteraksi (~3 menit)."
                        : "Consists of 10 realistic conversation scenarios. Select the option that best reflects your natural speaking and listening tendency (~3 mins)."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-t border-xeoo-border pt-3.5">
                <span className="text-[11px] text-xeoo-muted">
                  {lang === "id"
                    ? "10 pertanyaan • 4 gaya komunikasi • 100% privat"
                    : "10 questions • 4 communication styles • 100% private"}
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
        {step === "questions" && currentQuestion && (
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
              <span className="inline-block rounded bg-xeoo-primary-soft px-2 py-0.5 text-[11px] font-bold text-xeoo-primary uppercase">
                #{currentIndex + 1}
              </span>

              <h2 className="mt-3 text-base font-semibold leading-snug text-xeoo-text sm:text-lg">
                "{currentQuestion.situation[lang]}"
              </h2>

              <p className="mt-1 text-[11px] text-xeoo-muted">
                {lang === "id"
                  ? "Pilih opsi respon percakapan yang paling spontan dan alami bagi Anda:"
                  : "Select the conversational response that feels most natural to you:"}
              </p>

              {/* Options */}
              <div className="mt-4 space-y-2">
                {currentQuestion.options.map((option) => {
                  const isSelected = answers[currentQuestion.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                      className={`flex w-full items-start justify-between rounded-lg border px-3.5 py-2.5 text-left text-xs transition ${
                        isSelected
                          ? "border-xeoo-primary bg-xeoo-primary-soft font-semibold text-xeoo-text shadow-xs"
                          : "border-xeoo-border bg-xeoo-surface text-xeoo-text hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            isSelected
                              ? "bg-xeoo-primary text-white"
                              : "border border-xeoo-border text-xeoo-muted"
                          }`}
                        >
                          {option.id.toUpperCase()}
                        </span>
                        <span className="leading-relaxed">{option.text[lang]}</span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-xeoo-primary ml-2 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Prev / Next buttons */}
              <div className="mt-5 flex items-center justify-between border-t border-xeoo-border pt-3.5">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="inline-flex items-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-1.5 text-xs font-semibold text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  {t.previous}
                </button>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isCurrentAnswered}
                    className="inline-flex items-center gap-1 rounded-lg bg-xeoo-text px-4 py-1.5 text-xs font-semibold text-xeoo-surface transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t.next}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canFinish}
                    className="inline-flex items-center gap-1 rounded-lg bg-xeoo-primary px-5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t.finish}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Question Jumper */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                aria-label="Previous question"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft hover:text-xeoo-text disabled:cursor-not-allowed disabled:opacity-40 shadow-xs"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {COMM_QUESTIONS.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Question ${idx + 1}`}
                    className={`flex h-7 min-w-7 px-2 items-center justify-center rounded-lg text-xs font-semibold transition ${
                      isCurrent
                        ? "border border-xeoo-primary bg-xeoo-primary text-white shadow-xs"
                        : isAnswered
                          ? "border border-xeoo-border bg-xeoo-surface-soft text-xeoo-text"
                          : "border border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                disabled={currentIndex === totalQuestions - 1}
                aria-label="Next question"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft hover:text-xeoo-text disabled:cursor-not-allowed disabled:opacity-40 shadow-xs"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: RESULT */}
        {step === "result" && result && (
          <div className="space-y-4">
            {/* Dominant Pattern Card */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5 shadow-xs">
              <span className="text-[11px] font-bold text-xeoo-primary uppercase tracking-wider">
                {lang === "id" ? "Gaya Komunikasi Utama" : "Primary Communication Style"}
              </span>

              <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-xeoo-text sm:text-2xl">
                    {result.primaryStyle.name}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-xeoo-muted max-w-lg">
                    {result.primaryStyle.description}
                  </p>
                  <p className="mt-2 text-xs text-xeoo-muted">
                    {lang === "id" ? "Gaya Pendukung: " : "Secondary Style: "}
                    <span className="font-semibold text-xeoo-text">
                      {result.secondaryStyle.name} ({result.secondaryStyle.percentage}%)
                    </span>
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-6 py-3 text-center">
                  <span className="text-[11px] uppercase font-bold text-xeoo-muted">
                    {lang === "id" ? "Kesesuaian" : "Match"}
                  </span>
                  <span className="text-2xl font-extrabold text-xeoo-text sm:text-3xl mt-0.5">
                    {result.primaryStyle.percentage}%
                  </span>
                  <span className="text-[11px] text-xeoo-muted">
                    {lang === "id" ? "dominan" : "alignment"}
                  </span>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                <span className="text-[11px] font-bold text-xeoo-primary uppercase">
                  {lang === "id" ? "Ringkasan Hasil Evaluasi:" : "Overall Assessment Summary:"}
                </span>
                <p className="mt-0.5 text-xs leading-relaxed text-xeoo-text">
                  {result.overallSummary}
                </p>
              </div>
            </div>

            {/* Score Comparison Across All Styles */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5 shadow-xs">
              <h3 className="text-sm font-bold text-xeoo-text">
                {t.scoreBreakdown}
              </h3>

              <div className="mt-4 space-y-3.5">
                {Object.values(result.scores).map((score) => (
                  <div key={score.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-xeoo-text">
                        {score.name}
                      </span>
                      <span className="font-mono font-bold text-xeoo-text">
                        {score.percentage}%
                      </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-xeoo-surface-soft border border-xeoo-border">
                      <div
                        className="h-full bg-xeoo-primary transition-all duration-500"
                        style={{ width: `${score.percentage}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-xeoo-muted">{score.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Growth Areas */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 shadow-xs">
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-xeoo-success uppercase tracking-wider">
                  <CheckCircle2 className="h-4 w-4" />
                  {t.strengths}
                </h4>
                <ul className="mt-2.5 space-y-2">
                  {result.primaryStyle.strengths.map((str, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs leading-relaxed text-xeoo-text"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-xeoo-success" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 shadow-xs">
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-xeoo-warning uppercase tracking-wider">
                  <HelpCircle className="h-4 w-4" />
                  {t.potentialChallenges}
                </h4>
                <ul className="mt-2.5 space-y-2">
                  {result.primaryStyle.challenges.map((chl, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs leading-relaxed text-xeoo-text"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-xeoo-warning" />
                      <span>{chl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Reflection Prompts & Action Steps */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 shadow-xs">
                <h4 className="text-xs font-bold text-xeoo-primary uppercase tracking-wider">
                  {t.reflectionPrompts}
                </h4>
                <ul className="mt-2.5 space-y-2">
                  {result.primaryStyle.reflectionPrompts.map((prompt, idx) => (
                    <li
                      key={idx}
                      className="text-xs italic leading-relaxed text-xeoo-muted"
                    >
                      "{prompt}"
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 shadow-xs">
                <h4 className="text-xs font-bold text-xeoo-info uppercase tracking-wider">
                  {t.actionableInsights}
                </h4>
                <ul className="mt-2.5 space-y-2">
                  {result.primaryStyle.actionSuggestions.map((act, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs leading-relaxed text-xeoo-text"
                    >
                      <span className="font-bold text-xeoo-info">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Retake & Disclaimer */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-xeoo-border bg-xeoo-surface p-4 shadow-xs">
              <div className="text-[11px] text-xeoo-muted leading-relaxed sm:max-w-md">
                <span className="font-semibold text-xeoo-text">
                  {t.disclaimerTitle}:{" "}
                </span>
                {t.disclaimerBody}
              </div>

              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-4 py-2 text-xs font-semibold text-xeoo-text transition hover:border-xeoo-border-dark hover:bg-xeoo-surface"
              >
                <RotateCcw className="h-3.5 w-3.5 text-xeoo-muted" />
                {t.retakeTest}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
