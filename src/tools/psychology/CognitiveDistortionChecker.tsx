import { useState } from "react";
import {
  HelpCircle,
  Lightbulb,
  MessageSquareQuote,
  RotateCcw,
  Search,
} from "lucide-react";

import Footer from "../../components/Footer";
import {
  SAMPLE_THOUGHTS_I18N,
  analyzeCognitiveThought,
  type AnalysisResult,
} from "./cognitiveDistortionLogic";
import { PSYCH_COMMON, type ToolLanguage } from "./psychologyI18n";

export default function CognitiveDistortionChecker() {
  const [lang, setLang] = useState<ToolLanguage>("en");
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const t = PSYCH_COMMON[lang];

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    const res = analyzeCognitiveThought(inputText, lang);
    setResult(res);
    setIsAnalyzed(true);
  };

  const handleSelectSample = (sampleText: string) => {
    setInputText(sampleText);
    const res = analyzeCognitiveThought(sampleText, lang);
    setResult(res);
    setIsAnalyzed(true);
  };

  const handleReset = () => {
    setInputText("");
    setResult(null);
    setIsAnalyzed(false);
  };

  const handleLanguageChange = (newLang: ToolLanguage) => {
    setLang(newLang);
    if (isAnalyzed && inputText.trim()) {
      setResult(analyzeCognitiveThought(inputText, newLang));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleAnalyze();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      <main className="mx-auto w-full max-w-3xl flex-1 px-3 py-3 sm:px-5 sm:py-5">
        {/* COMPACT TOOLBAR */}
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-xeoo-border pb-2.5">
          <h1 className="text-sm font-bold tracking-tight text-xeoo-text">
            {lang === "id"
              ? "Pemeriksa Distorsi Kognitif"
              : "Cognitive Distortion Checker"}
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

        <div className="space-y-4">
          {/* Input Card */}
          <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5 shadow-xs">
            <label
              htmlFor="thought-input"
              className="block text-xs font-bold text-xeoo-text"
            >
              {lang === "id"
                ? "Masukkan Pikiran atau Keyakinan Otomatis:"
                : "Enter an Automatic Thought or Belief:"}
            </label>
            <p className="mt-0.5 text-[11px] text-xeoo-muted">
              {lang === "id"
                ? "Ketikkan apa yang terlintas di benak Anda saat merasa cemas, tertekan, atau frustrasi."
                : "Type what is running through your mind during an anxious, stressful, or frustrated moment."}
            </p>

            <div className="mt-3">
              <textarea
                id="thought-input"
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  lang === "id"
                    ? 'Contoh: "Kalau sampai saya gagal di ujian ini, masa depan saya hancur total dan saya adalah orang gagal."'
                    : 'Example: "If I fail this exam, my future is completely ruined and I am a total failure."'
                }
                className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-2.5 text-xs text-xeoo-text placeholder-xeoo-muted outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/30"
              />
            </div>

            {/* Quick Sample Thought Pills */}
            <div className="mt-3 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                {lang === "id" ? "Coba Contoh Cepat:" : "Try a Quick Example:"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_THOUGHTS_I18N[lang].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample.text)}
                    className="inline-flex items-center rounded-full border border-xeoo-border bg-xeoo-surface-soft px-2.5 py-0.5 text-[11px] font-medium text-xeoo-text transition hover:border-xeoo-border-dark hover:bg-xeoo-surface"
                  >
                    <span>{sample.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-xeoo-border pt-3">
              <span className="text-[11px] text-xeoo-muted">
                {lang === "id"
                  ? "Tekan Ctrl+Enter untuk menganalisis • 100% Heuristik privat di klien"
                  : "Press Ctrl+Enter to analyze • Client-side heuristics • 100% private"}
              </span>
              <div className="flex items-center gap-2">
                {isAnalyzed && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-1.5 text-xs font-semibold text-xeoo-text transition hover:bg-xeoo-surface-soft"
                  >
                    <RotateCcw className="h-3 w-3" />
                    {t.clear}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!inputText.trim()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-xeoo-text px-4 py-1.5 text-xs font-semibold text-xeoo-surface transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Search className="h-3.5 w-3.5" />
                  {t.analyze}
                </button>
              </div>
            </div>
          </div>

          {/* Result Section */}
          {isAnalyzed && result && result.primaryPattern && (
            <div className="space-y-4">
              {/* Primary Pattern Card */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5 shadow-xs">
                <div className="flex flex-wrap items-baseline justify-between gap-1.5">
                  <h2 className="text-base font-bold text-xeoo-text sm:text-lg">
                    {result.primaryPattern.name}
                  </h2>
                  <span className="rounded bg-xeoo-primary-soft border border-xeoo-primary/20 px-2 py-0.5 text-[11px] font-bold text-xeoo-primary">
                    Match: {result.primaryPattern.score}%
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-xeoo-muted">
                  {result.primaryPattern.explanation}
                </p>

                {result.primaryPattern.matchedKeywords.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-xeoo-text">
                      {lang === "id" ? "Kata Kunci Pemicu:" : "Trigger Keywords:"}
                    </span>
                    {result.primaryPattern.matchedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="rounded border border-xeoo-border bg-xeoo-surface-soft px-1.5 py-0.5 text-[11px] font-mono text-xeoo-primary"
                      >
                        "{kw}"
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* All Detected Patterns */}
              {result.detectedPatterns.length > 1 && (
                <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-xeoo-text">
                    {lang === "id"
                      ? "Pola Pikiran Teridentifikasi Lainnya"
                      : "Co-occurring Thought Patterns"}
                  </h3>

                  <div className="mt-3.5 space-y-3">
                    {result.detectedPatterns.map((pat) => (
                      <div key={pat.key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-xeoo-text">
                            {pat.name}
                          </span>
                          <span className="font-mono font-bold text-xeoo-text">
                            {pat.score}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-xeoo-surface-soft border border-xeoo-border">
                          <div
                            className="h-full bg-xeoo-primary transition-all duration-500"
                            style={{ width: `${pat.score}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-xeoo-muted">{pat.shortDesc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Constructive Reframing Card */}
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-xeoo-success uppercase">
                  <Lightbulb className="h-3.5 w-3.5" />
                  <span>
                    {lang === "id"
                      ? "Alternatif Pemikiran Konstruktif (Reframing)"
                      : "Constructive Reframing Alternative"}
                  </span>
                </div>

                <div className="mt-3 rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3">
                  <div className="flex items-start gap-2">
                    <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-xeoo-success" />
                    <p className="text-xs italic leading-relaxed text-xeoo-text font-medium">
                      "{result.suggestedReframe}"
                    </p>
                  </div>
                </div>

                <div className="mt-3.5">
                  <span className="text-[11px] font-bold text-xeoo-text">
                    {lang === "id"
                      ? "Langkah-Langkah Reframing Kognitif:"
                      : "Cognitive Reframing Steps:"}
                  </span>
                  <ul className="mt-2 space-y-1.5">
                    {result.reframingSteps.map((step, idx) => (
                      <li
                        key={idx}
                        className="rounded border border-xeoo-border bg-xeoo-surface-soft p-2 text-[11px] text-xeoo-muted"
                      >
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Disclaimer */}
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
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
