import { useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  RotateCcw,
} from "lucide-react";

import Footer from "../../components/Footer";
import { PSYCH_COMMON, type ToolLanguage } from "./psychologyI18n";
import {
  STRESS_QUESTIONS,
  STRESS_SCALE_OPTIONS_I18N,
  calculateStressScore,
  type StressResult,
} from "./stressLevelLogic";

type TestStep = "intro" | "questions" | "result";

export default function StressLevelTest() {
  const [lang, setLang] = useState<ToolLanguage>("en");
  const [step, setStep] = useState<TestStep>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<StressResult | null>(null);

  const t = PSYCH_COMMON[lang];
  const totalQuestions = STRESS_QUESTIONS.length;
  const currentQuestion = STRESS_QUESTIONS[currentIndex];
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
      const res = calculateStressScore(answers, lang);
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
      setResult(calculateStressScore(answers, newLang));
    }
  };

  const isCurrentAnswered =
    currentQuestion && answers[currentQuestion.id] !== undefined;
  const canFinish = answeredCount === totalQuestions;

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      <main className="mx-auto w-full max-w-3xl flex-1 px-3 py-4 sm:px-5 sm:py-6">
        {/* COMPACT TOOLBAR */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-sm font-bold text-xeoo-text">
            {lang === "id" ? "Tes Tingkat Stres" : "Stress Level Test"}
          </h1>

          {/* LANGUAGE SWITCHER */}
          <div className="flex shrink-0 items-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface p-1 shadow-xs">
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
                  ? "Memahami Tingkat Stres yang Dirasakan"
                  : "Understanding Perceived Stress"}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-xeoo-muted">
                {lang === "id"
                  ? "Asesmen ini mengukur beban psikologis Anda di tiga domain utama:"
                  : "This screening evaluates your stress levels across three key dimensions:"}
              </p>

              <div className="mt-3.5 grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <span className="text-[11px] font-bold text-xeoo-primary uppercase">
                    {lang === "id" ? "Beban Kognitif" : "Mental Load"}
                  </span>
                  <p className="mt-0.5 text-[11px] text-xeoo-muted">
                    {lang === "id"
                      ? "Kelelahan pikiran dan rasa kewalahan menghadapi tugas."
                      : "Cognitive fatigue and overwhelm from daily obligations."}
                  </p>
                </div>
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <span className="text-[11px] font-bold text-xeoo-primary uppercase">
                    {lang === "id" ? "Tekanan Emosional" : "Emotional Pressure"}
                  </span>
                  <p className="mt-0.5 text-[11px] text-xeoo-muted">
                    {lang === "id"
                      ? "Ketegangan internal, sensitivitas kesal, dan sensasi fisik."
                      : "Internal tension, irritability, and somatic stress sensations."}
                  </p>
                </div>
                <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <span className="text-[11px] font-bold text-xeoo-primary uppercase">
                    {lang === "id" ? "Pemulihan Tubuh" : "Recovery Difficulty"}
                  </span>
                  <p className="mt-0.5 text-[11px] text-xeoo-muted">
                    {lang === "id"
                      ? "Kualitas tidur dan kemampuan melepaskan beban pikiran."
                      : "Sleep disruption and challenges unwinding during downtime."}
                  </p>
                </div>
              </div>

              {/* Guide */}
              <div className="mt-3.5 rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                <div className="flex items-start gap-2.5">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-xeoo-primary" />
                  <div className="space-y-0.5 text-[11px] text-xeoo-text">
                    <p className="font-semibold">
                      {lang === "id" ? "Petunjuk Pengisian:" : "Guidelines:"}
                    </p>
                    <p className="text-xeoo-muted">
                      {lang === "id"
                        ? "Refleksikan pengalaman Anda selama 2-4 minggu terakhir. Terdiri dari 15 pertanyaan (~2 menit)."
                        : "Reflect on your experiences over the past 2–4 weeks. 15 questions (~2 minutes)."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-t border-xeoo-border pt-3.5">
                <span className="text-[11px] text-xeoo-muted">
                  {lang === "id"
                    ? "15 pertanyaan • Rincian skor instan • 100% privat"
                    : "15 questions • Instant score breakdown • 100% private"}
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
              <span className="inline-block rounded bg-xeoo-primary-soft px-2 py-0.5 text-[11px] font-bold text-xeoo-primary uppercase">
                #{currentIndex + 1}
              </span>

              <h2 className="mt-3 text-base font-semibold leading-snug text-xeoo-text sm:text-lg">
                "{currentQuestion.text[lang]}"
              </h2>

              <p className="mt-1 text-[11px] text-xeoo-muted">
                {lang === "id"
                  ? "Seberapa sering Anda mengalami hal ini akhir-akhir ini?"
                  : "How frequently have you experienced this recently?"}
              </p>

              {/* Options */}
              <div className="mt-4 space-y-2">
                {STRESS_SCALE_OPTIONS_I18N[lang].map((option) => {
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
                        className={`flex h-4 w-4 items-center justify-center rounded-full border text-[11px] ${
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

            {/* Sliding 5-Question Pagination Controls */}
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

              {(() => {
                const total = totalQuestions;
                const windowSize = 5;
                let start = Math.max(0, currentIndex - Math.floor(windowSize / 2));
                let end = start + windowSize;
                if (end > total) {
                  end = total;
                  start = Math.max(0, end - windowSize);
                }
                const visibleIndices = Array.from({ length: end - start }, (_, i) => start + i);

                return visibleIndices.map((idx) => {
                  const q = STRESS_QUESTIONS[idx];
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
                });
              })()}

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
            {/* Top Score Card */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5 shadow-xs">
              <span className="text-[11px] font-bold text-xeoo-primary uppercase tracking-wider">
                {lang === "id" ? "Hasil Pengukuran" : "Assessment Outcome"}
              </span>

              <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-xeoo-text sm:text-2xl">
                    {result.category}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-xeoo-muted max-w-lg">
                    {result.categorySummary}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-6 py-3 text-center">
                  <span className="text-[11px] uppercase font-bold text-xeoo-muted">
                    {lang === "id" ? "Skor Stres" : "Stress Score"}
                  </span>
                  <span className="text-2xl font-extrabold text-xeoo-text sm:text-3xl mt-0.5">
                    {result.overallScore}
                  </span>
                  <span className="text-[11px] text-xeoo-muted">/ 100</span>
                </div>
              </div>
            </div>

            {/* Subscale Breakdown */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5 shadow-xs">
              <h3 className="text-sm font-bold text-xeoo-text">
                {t.scoreBreakdown}
              </h3>

              <div className="mt-4 space-y-3.5">
                {Object.values(result.subscales).map((sub) => (
                  <div key={sub.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-xeoo-text">
                        {sub.label}
                      </span>
                      <span className="font-mono font-bold text-xeoo-text">
                        {sub.percentage}%
                      </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-xeoo-surface-soft border border-xeoo-border">
                      <div
                        className="h-full bg-xeoo-primary transition-all duration-500"
                        style={{ width: `${sub.percentage}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-xeoo-muted">{sub.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-xeoo-primary uppercase">
                <Activity className="h-3.5 w-3.5" />
                <span>{t.recommendedFocus}</span>
              </div>

              <ul className="mt-3 space-y-2">
                {result.suggestions.map((sug, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-2.5 text-xs text-xeoo-text leading-relaxed"
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-xeoo-primary-soft text-[11px] font-bold text-xeoo-primary">
                      {idx + 1}
                    </span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer & Retake */}
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5 shadow-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-xeoo-muted" />
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
