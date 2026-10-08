import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

import {
  buildSegments,
  buildTypingText,
  calculateTypingMetrics,
  createDefaultTypingSettings,
  getTestCompletionStatus,
  type TypingKeystroke,
  type TypingMetrics,
  type TypingSettings,
} from "./typingTestLogic";

import {
  TypingResultPanel,
  TypingSavePanel,
  TypingSetupPanel,
  TypingTestPanel,
} from "./TypingTestPanels";

const API_URL = "/php/api/typing-test.php";

interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
}

interface StartData {
  session_id: string;
}

interface FinishData {
  result?: unknown;
  can_save?: boolean;
  leaderboard_eligible?: boolean;
}

interface SaveData {
  player?: {
    id: number;
    display_name: string;
    region: string | null;
  };
  result?: unknown;
}

interface LeaderboardItem {
  rank: number;
  name?: string;
  display_name?: string;
  region: string | null;
  correct_wpm: number;
  raw_wpm: number;
  accuracy: number;
  consistency: number;
  score: number;
}

interface LeaderboardData {
  items: LeaderboardItem[];
  total: number;
  eligible?: boolean;
}

type TestPhase = "setup" | "testing" | "result" | "save";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

async function requestApi<T>(
  action: string,
  options: {
    method?: "GET" | "POST";
    body?: Record<string, unknown>;
    query?: Record<string, string | number | undefined>;
  } = {},
): Promise<ApiResponse<T>> {
  const method = options.method ?? "POST";

  const url = new URL(API_URL, window.location.origin);
  url.searchParams.set("action", action);

  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    method,
    headers:
      method === "POST"
        ? {
            "Content-Type": "application/json",
          }
        : undefined,
    body: method === "POST" ? JSON.stringify(options.body ?? {}) : undefined,
    cache: "no-store",
  });

  let payload: ApiResponse<T>;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new Error(`Server returned HTTP ${response.status}.`);
  }

  if (!response.ok || payload.success === false) {
    throw new Error(
      payload.message || `Request failed with HTTP ${response.status}.`,
    );
  }

  return payload;
}

function getElapsedSeconds(startTime: number, now = Date.now()): number {
  if (!Number.isFinite(startTime) || startTime <= 0) {
    return 0;
  }

  return Math.max((now - startTime) / 1000, 0);
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function normalizeTypingMetrics(value: unknown): TypingMetrics | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as Record<string, unknown>;

  const typedCharacters = toFiniteNumber(
    source.typedCharacters ?? source.typed_characters,
  );

  const correctCharacters = toFiniteNumber(
    source.correctCharacters ?? source.correct_characters,
  );

  const incorrectCharacters = toFiniteNumber(
    source.incorrectCharacters ?? source.incorrect_characters,
    Math.max(typedCharacters - correctCharacters, 0),
  );

  const rawWpm = toFiniteNumber(source.rawWpm ?? source.raw_wpm);

  const correctWpm = toFiniteNumber(source.correctWpm ?? source.correct_wpm);

  const accuracy = toFiniteNumber(source.accuracy);

  const consistency = toFiniteNumber(source.consistency);

  const completion = toFiniteNumber(source.completion);

  const score = toFiniteNumber(source.score);

  const elapsedSeconds = toFiniteNumber(
    source.elapsedSeconds ??
      source.elapsed_seconds ??
      source.durationSeconds ??
      source.duration_seconds,
  );

  return {
    typedCharacters,
    correctCharacters,
    incorrectCharacters,
    rawWpm,
    correctWpm,
    accuracy,
    consistency,
    completion,
    score,
    elapsedSeconds,
  };
}

function TypingTest() {
  const [settings, setSettings] = useState<TypingSettings>(
    createDefaultTypingSettings(),
  );

  const [phase, setPhase] = useState<TestPhase>("setup");

  const [targetText, setTargetText] = useState("");
  const [typedText, setTypedText] = useState("");

  const [sessionId, setSessionId] = useState<string | null>(null);

  const [startTime, setStartTime] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    settings.duration,
  );

  const [keystrokes, setKeystrokes] = useState<TypingKeystroke[]>([]);

  // Custom metrics tracking untuk akurasi yang valid
  const [cumulativeErrors, setCumulativeErrors] = useState(0);
  const [totalKeystrokesCount, setTotalKeystrokesCount] = useState(0);

  const [metrics, setMetrics] = useState<TypingMetrics | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [canSave, setCanSave] = useState(false);
  const [leaderboardEligible, setLeaderboardEligible] = useState(false);

  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState("");

  const finishingRef = useRef(false);
  const finishRequestedRef = useRef(false);

  const updateSetting = useCallback(
    <K extends keyof TypingSettings>(key: K, value: TypingSettings[K]) => {
      setSettings((current) => ({
        ...current,
        [key]: value,
      }));
    },
    [],
  );

  const targetCharacters = useMemo(
    () => Array.from(targetText).length,
    [targetText],
  );

  const rawMetrics = useMemo(() => {
    if (!targetText) {
      return null;
    }

    const segments = buildSegments(
      typedText,
      targetText,
      keystrokes,
      startTime,
    );

    return calculateTypingMetrics(
      typedText,
      targetText,
      elapsedSeconds,
      segments,
    );
  }, [typedText, targetText, keystrokes, startTime, elapsedSeconds]);

  // Inject valid accuracy ke dalam metrics yang dikonsumsi UI
  const currentMetrics = useMemo(() => {
    if (!rawMetrics) return null;

    const total = Math.max(1, totalKeystrokesCount);
    const correct = Math.max(0, total - cumulativeErrors);
    const accuracy = (correct / total) * 100;

    return {
      ...rawMetrics,
      typedCharacters: totalKeystrokesCount,
      incorrectCharacters: cumulativeErrors,
      correctCharacters: correct,
      accuracy: accuracy,
    };
  }, [rawMetrics, totalKeystrokesCount, cumulativeErrors]);

  const finishTest = useCallback(async () => {
    if (finishingRef.current || !sessionId || !targetText || !startTime) {
      return;
    }

    finishingRef.current = true;

    const actualElapsed = getElapsedSeconds(startTime);

    const finalElapsed =
      settings.mode === "time"
        ? Math.min(actualElapsed, settings.duration)
        : actualElapsed;

    const finalSegments = buildSegments(
      typedText,
      targetText,
      keystrokes,
      startTime,
    );

    const baseFinalMetrics = calculateTypingMetrics(
      typedText,
      targetText,
      finalElapsed,
      finalSegments,
    );

    // Override final metrics menggunakan error asli yang terekam
    const finalTotal = totalKeystrokesCount;
    const finalErrors = cumulativeErrors;
    const finalCorrect = Math.max(0, finalTotal - finalErrors);
    const finalAcc = finalTotal > 0 ? (finalCorrect / finalTotal) * 100 : 0;

    const finalMetrics = {
      ...baseFinalMetrics,
      typedCharacters: finalTotal,
      incorrectCharacters: finalErrors,
      correctCharacters: finalCorrect,
      accuracy: finalAcc,
    };

    setElapsedSeconds(finalElapsed);
    setMetrics(finalMetrics);

    setBusy(true);
    setError("");

    try {
      const response = await requestApi<FinishData>("finish", {
        body: {
          session_id: sessionId,
          typed_characters: finalTotal,
          correct_characters: finalCorrect,
          incorrect_characters: finalErrors,
          consistency: finalMetrics.consistency,
          elapsed_seconds: finalMetrics.elapsedSeconds,
        },
      });

      const serverMetrics = normalizeTypingMetrics(response.data?.result);

      if (serverMetrics) {
        setMetrics(serverMetrics);
        setElapsedSeconds(serverMetrics.elapsedSeconds);
      }

      setCanSave(response.data?.can_save !== false);

      setLeaderboardEligible(response.data?.leaderboard_eligible === true);

      setPhase("result");
    } catch (requestError) {
      setMetrics(finalMetrics);
      setElapsedSeconds(finalMetrics.elapsedSeconds);
      setCanSave(false);
      setLeaderboardEligible(false);
      setError(getErrorMessage(requestError));
      setPhase("result");
    } finally {
      setBusy(false);
      finishingRef.current = false;
    }
  }, [
    sessionId,
    targetText,
    startTime,
    settings.mode,
    settings.duration,
    typedText,
    keystrokes,
    totalKeystrokesCount,
    cumulativeErrors,
  ]);

  const startTest = useCallback(async () => {
    setError("");
    setBusy(true);

    finishRequestedRef.current = false;
    finishingRef.current = false;

    try {
      const generatedText = buildTypingText(
        settings.language,
        settings.difficulty,
        settings.mode,
        settings.duration,
        settings.wordCount,
        settings.customText,
      );

      if (!generatedText) {
        throw new Error("Unable to create the typing text.");
      }

      const response = await requestApi<StartData>("start", {
        body: {
          language: settings.language,
          mode: settings.mode,
          difficulty: settings.difficulty,
          duration_seconds: settings.mode === "time" ? settings.duration : 0,
          target_words: settings.mode === "words" ? settings.wordCount : 0,
          target_characters: Array.from(generatedText).length,
        },
      });

      const newSessionId = response.data?.session_id;

      if (!newSessionId) {
        throw new Error("The server did not return a session ID.");
      }

      const now = Date.now();

      setTargetText(generatedText);
      setTypedText("");
      setSessionId(newSessionId);

      setStartTime(now);
      setElapsedSeconds(0);

      setRemainingSeconds(settings.duration);

      setKeystrokes([]);
      setMetrics(null);
      setCumulativeErrors(0);
      setTotalKeystrokesCount(0);

      setCanSave(false);
      setLeaderboardEligible(false);

      setPhase("testing");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }, [settings]);

  const handleTypingChange = useCallback(
    (value: string) => {
      if (phase !== "testing" || finishRequestedRef.current) {
        return;
      }

      const previousLength = Array.from(typedText).length;
      const nextCharacters = Array.from(value);
      const nextLength = nextCharacters.length;

      const now = Date.now();

      if (nextLength > previousLength) {
        const insertedCharacters = nextCharacters.slice(previousLength);

        // Update true errors and total keypresses
        const addedCount = nextLength - previousLength;
        setTotalKeystrokesCount((prev) => prev + addedCount);

        let newErrors = 0;
        const targetArray = Array.from(targetText);
        for (let i = previousLength; i < nextLength; i++) {
          if (nextCharacters[i] !== targetArray[i]) {
            newErrors++;
          }
        }
        if (newErrors > 0) {
          setCumulativeErrors((prev) => prev + newErrors);
        }

        setKeystrokes((current) => [
          ...current,
          ...insertedCharacters.map((character) => ({
            timestamp: now,
            character,
            action: "insert" as const,
          })),
        ]);
      } else if (nextLength < previousLength) {
        const removedCount = previousLength - nextLength;

        setKeystrokes((current) => [
          ...current,
          ...Array.from({ length: removedCount }, () => ({
            timestamp: now,
            character: "",
            action: "delete" as const,
          })),
        ]);
      }

      setTypedText(value);

      if (
        settings.mode !== "time" &&
        getTestCompletionStatus(
          settings.mode,
          value,
          targetText,
          remainingSeconds,
        )
      ) {
        finishRequestedRef.current = true;
      }
    },
    [phase, typedText, settings.mode, targetText, remainingSeconds],
  );

  useEffect(() => {
    if (phase !== "testing" || !startTime) {
      return;
    }

    const interval = window.setInterval(() => {
      const elapsed = getElapsedSeconds(startTime);

      const boundedElapsed =
        settings.mode === "time"
          ? Math.min(elapsed, settings.duration)
          : elapsed;

      setElapsedSeconds(boundedElapsed);

      if (settings.mode === "time") {
        const remaining = Math.max(settings.duration - elapsed, 0);

        setRemainingSeconds(remaining);

        if (remaining <= 0) {
          finishRequestedRef.current = true;
        }
      } else if (
        getTestCompletionStatus(
          settings.mode,
          typedText,
          targetText,
          remainingSeconds,
        )
      ) {
        finishRequestedRef.current = true;
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [
    phase,
    startTime,
    settings.mode,
    settings.duration,
    typedText,
    targetText,
    remainingSeconds,
  ]);

  useEffect(() => {
    if (phase !== "testing" || !finishRequestedRef.current) {
      return;
    }

    void finishTest();
  }, [phase, finishTest, typedText]);

  useEffect(() => {
    if (
      phase !== "testing" ||
      settings.mode !== "time" ||
      remainingSeconds > 0 ||
      finishingRef.current
    ) {
      return;
    }

    finishRequestedRef.current = true;

    void finishTest();
  }, [phase, settings.mode, remainingSeconds, finishTest]);

  useEffect(() => {
    if (phase !== "testing" || !currentMetrics) {
      return;
    }

    setMetrics(currentMetrics);
  }, [phase, currentMetrics]);

  const loadLeaderboard = useCallback(async () => {
    if (settings.mode === "custom") {
      setLeaderboard([]);
      setLeaderboardError("");
      return;
    }

    setLeaderboardLoading(true);
    setLeaderboardError("");

    try {
      const response = await requestApi<LeaderboardData>("leaderboard", {
        method: "GET",
        query: {
          language: settings.language,
          mode: settings.mode,
          difficulty: settings.difficulty,
          limit: 10,
          duration_seconds:
            settings.mode === "time" ? settings.duration : undefined,
          target_words:
            settings.mode === "words" ? settings.wordCount : undefined,
        },
      });

      setLeaderboard(response.data?.items ?? []);
    } catch (requestError) {
      setLeaderboard([]);
      setLeaderboardError(getErrorMessage(requestError));
    } finally {
      setLeaderboardLoading(false);
    }
  }, [
    settings.language,
    settings.mode,
    settings.difficulty,
    settings.duration,
    settings.wordCount,
  ]);

  useEffect(() => {
    if (phase === "setup") {
      void loadLeaderboard();
    }
  }, [phase, loadLeaderboard]);

  const handleSave = useCallback(
    async (username: string, region: string, countryCode: string | null) => {
      if (!sessionId) {
        return;
      }

      setBusy(true);
      setError("");

      try {
        const response = await requestApi<SaveData>("save_progress", {
          body: {
            session_id: sessionId,
            username: username,
            display_name: username,
            name: username,
            region: region,
            country_code: countryCode, // Kolom country_code dikirim
          },
        });

        const savedMetrics = normalizeTypingMetrics(response.data?.result);

        if (savedMetrics) {
          setMetrics(savedMetrics);
          setElapsedSeconds(savedMetrics.elapsedSeconds);
        }

        setCanSave(false);

        await loadLeaderboard();

        setPhase("result");
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setBusy(false);
      }
    },
    [sessionId, loadLeaderboard],
  );

  const handleDiscard = useCallback(async () => {
    if (!sessionId) {
      setPhase("setup");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await requestApi("discard_result", {
        body: {
          session_id: sessionId,
        },
      });

      setCanSave(false);
      setPhase("setup");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }, [sessionId]);

  const resetToSetup = useCallback(() => {
    setPhase("setup");

    setTargetText("");
    setTypedText("");

    setSessionId(null);

    setStartTime(0);
    setElapsedSeconds(0);

    setRemainingSeconds(settings.duration);

    setKeystrokes([]);
    setMetrics(null);
    setCumulativeErrors(0);
    setTotalKeystrokesCount(0);

    setError("");

    setCanSave(false);
    setLeaderboardEligible(false);

    finishRequestedRef.current = false;
    finishingRef.current = false;
  }, [settings.duration]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-xeoo-bg text-xeoo-text lg:h-screen lg:max-h-screen lg:overflow-hidden">
      <Header />

      <main className="min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3 lg:overflow-hidden lg:px-4 lg:py-2">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-2">
          {phase === "setup" && (
            <TypingSetupPanel
              config={settings}
              onChange={updateSetting}
              onStart={startTest}
              leaderboard={leaderboard}
              leaderboardLoading={leaderboardLoading}
              leaderboardError={leaderboardError}
            />
          )}

          {phase === "testing" && (
            <TypingTestPanel
              settings={settings}
              targetText={targetText}
              typedText={typedText}
              elapsedSeconds={elapsedSeconds}
              remainingSeconds={remainingSeconds}
              metrics={metrics}
              targetCharacters={targetCharacters}
              onChange={handleTypingChange}
              onFinish={() => {
                finishRequestedRef.current = true;
                void finishTest();
              }}
              busy={busy}
            />
          )}

          {phase === "result" && metrics && (
            <TypingResultPanel
              metrics={metrics}
              settings={settings}
              leaderboardEligible={leaderboardEligible}
              canSave={canSave}
              error={error}
              busy={busy}
              onSave={() => {
                setError("");
                setPhase("save");
              }}
              onNotNow={handleDiscard}
              onNewTest={resetToSetup}
            />
          )}

          {phase === "save" && metrics && (
            <TypingSavePanel
              metrics={metrics}
              error={error}
              busy={busy}
              onCancel={() => {
                setError("");
                setPhase("result");
              }}
              onSave={handleSave}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default TypingTest;
