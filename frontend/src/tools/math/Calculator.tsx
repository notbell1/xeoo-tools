import { ChevronDown, ChevronUp, Delete, Settings2 } from "lucide-react";
import type { ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import Footer from "../../components/Footer";
import Header from "../../components/Header";

import {
  evaluateCurrentExpression,
  formatNumber,
  INITIAL_CALCULATOR_STATE,
  memoryAdd,
  memoryClear,
  memoryStore,
  memorySubtract,
  setAngleMode,
  type CalculatorState,
} from "./calculatorLogic";

type KeyTone = "number" | "operator" | "utility" | "equal";

type CalculatorKeyProps = {
  label: ReactNode;
  tone?: KeyTone;
  onClick: () => void;
};

type ScientificItem = {
  label: string;
  value: string;
  cursor: number;
};

const SCIENTIFIC_GROUPS: {
  title: string;
  items: ScientificItem[];
}[] = [
  {
    title: "Trig",
    items: [
      {
        label: "sin",
        value: "sin()",
        cursor: 4,
      },
      {
        label: "cos",
        value: "cos()",
        cursor: 4,
      },
      {
        label: "tan",
        value: "tan()",
        cursor: 4,
      },
      {
        label: "asin",
        value: "asin()",
        cursor: 5,
      },
      {
        label: "acos",
        value: "acos()",
        cursor: 5,
      },
      {
        label: "atan",
        value: "atan()",
        cursor: 5,
      },
      {
        label: "sec",
        value: "sec()",
        cursor: 4,
      },
      {
        label: "csc",
        value: "csc()",
        cursor: 4,
      },
      {
        label: "cot",
        value: "cot()",
        cursor: 4,
      },
      {
        label: "atan2",
        value: "atan2(,)",
        cursor: 6,
      },
    ],
  },
  {
    title: "Math",
    items: [
      {
        label: "√",
        value: "sqrt()",
        cursor: 5,
      },
      {
        label: "∛",
        value: "cbrt()",
        cursor: 5,
      },
      {
        label: "x²",
        value: "^2",
        cursor: 2,
      },
      {
        label: "xʸ",
        value: "^",
        cursor: 1,
      },
      {
        label: "log",
        value: "log()",
        cursor: 4,
      },
      {
        label: "ln",
        value: "ln()",
        cursor: 3,
      },
      {
        label: "exp",
        value: "exp()",
        cursor: 4,
      },
      {
        label: "abs",
        value: "abs()",
        cursor: 4,
      },
      {
        label: "floor",
        value: "floor()",
        cursor: 6,
      },
      {
        label: "ceil",
        value: "ceil()",
        cursor: 5,
      },
      {
        label: "round",
        value: "round()",
        cursor: 6,
      },
      {
        label: "trunc",
        value: "trunc()",
        cursor: 6,
      },
      {
        label: "fact",
        value: "fact()",
        cursor: 5,
      },
    ],
  },
  {
    title: "More",
    items: [
      {
        label: "π",
        value: "π",
        cursor: 1,
      },
      {
        label: "e",
        value: "e",
        cursor: 1,
      },
      {
        label: "Ans",
        value: "ans",
        cursor: 3,
      },
      {
        label: "mod",
        value: "mod(,)",
        cursor: 4,
      },
      {
        label: "gcd",
        value: "gcd(,)",
        cursor: 4,
      },
      {
        label: "lcm",
        value: "lcm(,)",
        cursor: 4,
      },
      {
        label: "min",
        value: "min(,)",
        cursor: 4,
      },
      {
        label: "max",
        value: "max(,)",
        cursor: 4,
      },
      {
        label: "avg",
        value: "avg(,)",
        cursor: 4,
      },
      {
        label: "(",
        value: "(",
        cursor: 1,
      },
      {
        label: ")",
        value: ")",
        cursor: 1,
      },
      {
        label: "!",
        value: "!",
        cursor: 1,
      },
    ],
  },
];

function CalculatorKey({
  label,
  tone = "number",
  onClick,
}: CalculatorKeyProps) {
  const toneClasses: Record<KeyTone, string> = {
    number:
      "border-xeoo-border bg-xeoo-surface text-xeoo-text hover:bg-xeoo-surface-soft active:bg-xeoo-border",
    operator:
      "border-xeoo-border bg-xeoo-surface-soft text-xeoo-text font-bold hover:bg-xeoo-border active:bg-xeoo-surface",
    utility:
      "border-xeoo-border bg-xeoo-surface-soft/60 text-xeoo-text-soft hover:bg-xeoo-surface-soft hover:text-xeoo-text active:bg-xeoo-border",
    equal:
      "border-xeoo-primary bg-xeoo-primary text-white hover:bg-xeoo-primary-hover active:bg-xeoo-primary shadow-xs",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex h-8 min-w-0 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition-colors sm:h-9 lg:h-10 cursor-pointer",
        toneClasses[tone],
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export default function Calculator() {
  const inputRef = useRef<HTMLInputElement>(null);

  const pendingCursorRef = useRef<number | null>(null);

  const [state, setState] = useState<CalculatorState>(INITIAL_CALCULATOR_STATE);

  const [cursor, setCursor] = useState(0);

  const [showScientific, setShowScientific] = useState(false);

  const applyCursor = useCallback((position: number) => {
    const input = inputRef.current;

    if (!input) {
      return false;
    }

    const safePosition = Math.max(0, Math.min(position, input.value.length));

    input.focus();
    input.setSelectionRange(safePosition, safePosition);

    setCursor(safePosition);

    return true;
  }, []);

  useLayoutEffect(() => {
    const pending = pendingCursorRef.current;

    if (pending === null) {
      return;
    }

    const input = inputRef.current;

    if (!input) {
      return;
    }

    if (input.value.length < pending) {
      return;
    }

    pendingCursorRef.current = null;

    applyCursor(pending);
  }, [state.expression, applyCursor]);

  const setCursorPosition = useCallback(
    (position: number) => {
      pendingCursorRef.current = position;

      setCursor(position);

      requestAnimationFrame(() => {
        const input = inputRef.current;

        if (!input) {
          return;
        }

        if (input.value.length >= position) {
          pendingCursorRef.current = null;

          applyCursor(position);
        }
      });
    },
    [applyCursor],
  );

  const insertText = useCallback(
    (text: string, caretOffset = text.length, forceNew = false) => {
      setState((current) => {
        const shouldReplace = forceNew || current.justEvaluated;

        const source = shouldReplace ? "" : current.expression;

        const position = shouldReplace ? 0 : Math.min(cursor, source.length);

        const nextExpression =
          source.slice(0, position) + text + source.slice(position);

        const nextCursor = position + caretOffset;

        pendingCursorRef.current = nextCursor;

        setCursor(nextCursor);

        return {
          ...current,
          expression: nextExpression,
          display: nextExpression || "0",
          result: null,
          justEvaluated: false,
          error: null,
        };
      });
    },
    [cursor],
  );

  const updateExpression = useCallback(
    (expression: string, nextCursor: number) => {
      pendingCursorRef.current = nextCursor;

      setState((current) => ({
        ...current,
        expression,
        display: expression || "0",
        result: null,
        justEvaluated: false,
        error: null,
      }));

      setCursor(nextCursor);
    },
    [],
  );

  const handleEvaluate = useCallback(() => {
    const nextState = evaluateCurrentExpression(state);

    pendingCursorRef.current = nextState.expression.length;

    setState(nextState);

    setCursor(nextState.expression.length);

    requestAnimationFrame(() => {
      applyCursor(nextState.expression.length);
    });
  }, [state, applyCursor]);

  const handleClear = useCallback(() => {
    pendingCursorRef.current = 0;

    setState({
      ...INITIAL_CALCULATOR_STATE,
      history: state.history,
    });

    setCursor(0);

    requestAnimationFrame(() => {
      applyCursor(0);
    });
  }, [applyCursor, state.history]);

  const handleBackspace = () => {
    const expression = state.expression;

    if (state.error || state.justEvaluated) {
      handleClear();
      return;
    }

    if (cursor <= 0 || expression.length === 0) {
      return;
    }

    const before = expression.slice(0, cursor);

    const after = expression.slice(cursor);

    const functionMatch = before.match(/([a-zA-Z]+)\($/);

    if (functionMatch && after.startsWith(")")) {
      const functionName = functionMatch[1];

      const removeLength = functionName.length + 1;

      const nextExpression =
        before.slice(0, before.length - removeLength) + after.slice(1);

      updateExpression(nextExpression, Math.max(cursor - removeLength, 0));

      return;
    }

    const nextExpression =
      expression.slice(0, cursor - 1) + expression.slice(cursor);

    updateExpression(nextExpression, cursor - 1);
  };

  const handleCloseParen = () => {
    const expression = state.expression;

    if (expression[cursor] === ")") {
      setCursorPosition(cursor + 1);

      return;
    }

    insertText(")");
  };

  const handleInputChange = (value: string) => {
    pendingCursorRef.current = null;

    const input = inputRef.current;

    setState((current) => ({
      ...current,
      expression: value,
      display: value || "0",
      result: null,
      justEvaluated: false,
      error: null,
    }));

    requestAnimationFrame(() => {
      const nextCursor = input?.selectionStart ?? value.length;

      setCursor(nextCursor);
    });
  };

  const handleInputSelect = () => {
    pendingCursorRef.current = null;

    setCursor(inputRef.current?.selectionStart ?? 0);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const active = document.activeElement === inputRef.current;

      if (!active) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();

        handleEvaluate();

        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();

        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleEvaluate, handleClear]);

  const memoryButtons = [
    {
      label: "MC",
      action: () => setState(memoryClear(state)),
    },
    {
      label: "MR",
      action: () => {
        const value = formatNumber(state.memory);

        insertText(value, value.length);
      },
    },
    {
      label: "M+",
      action: () => setState(memoryAdd(state)),
    },
    {
      label: "M−",
      action: () => setState(memorySubtract(state)),
    },
    {
      label: "MS",
      action: () => setState(memoryStore(state)),
    },
  ];

  return (
    <div className="min-h-dvh bg-xeoo-bg text-xeoo-text lg:h-screen lg:max-h-screen lg:overflow-hidden">
      <div className="flex min-h-dvh flex-col lg:h-screen lg:max-h-screen">
        <Header />

        <main
          className={[
            "flex min-h-0 flex-1 px-2 py-2 sm:px-3 sm:py-3",
            "overflow-y-auto lg:overflow-hidden",
            showScientific ? "items-start" : "lg:items-center",
          ].join(" ")}
        >
          <div className="mx-auto flex w-full max-w-5xl flex-1 items-start lg:h-full lg:min-h-0">
            <div
              className={[
                "grid w-full items-start gap-2.5",
                "lg:min-h-0 lg:self-start",
                showScientific
                  ? "lg:grid-cols-[minmax(0,410px)_minmax(0,410px)] lg:justify-center"
                  : "lg:grid-cols-[410px] lg:justify-center",
              ].join(" ")}
            >
              <section className="self-start overflow-hidden rounded-2xl border border-xeoo-border bg-xeoo-surface shadow-xl">
                <div className="p-2.5 sm:p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-widest text-xeoo-muted">
                        Math Tool
                      </p>

                      <h1 className="text-base font-bold tracking-tight text-xeoo-text sm:text-lg">
                        Calculator
                      </h1>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowScientific((current) => !current)}
                      className={[
                        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors cursor-pointer",
                        showScientific
                          ? "border-xeoo-primary bg-xeoo-primary text-white"
                          : "border-xeoo-border bg-xeoo-surface-soft text-xeoo-text hover:bg-xeoo-border",
                      ].join(" ")}
                    >
                      <Settings2 className="size-3.5" />
                      Scientific
                      {showScientific ? (
                        <ChevronUp className="size-3.5" />
                      ) : (
                        <ChevronDown className="size-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft px-3 py-2">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-xeoo-muted">
                        Expression
                      </span>

                      {state.memory !== 0 && (
                        <span className="rounded-full border border-xeoo-primary/30 bg-xeoo-primary-soft px-2 py-0.5 text-xs font-bold text-xeoo-primary">
                          M
                        </span>
                      )}
                    </div>

                    <input
                      ref={inputRef}
                      type="text"
                      value={state.expression}
                      onChange={(event) =>
                        handleInputChange(event.target.value)
                      }
                      onSelect={handleInputSelect}
                      onClick={handleInputSelect}
                      onFocus={handleInputSelect}
                      spellCheck={false}
                      autoComplete="off"
                      inputMode="decimal"
                      placeholder="0"
                      aria-label="Calculator expression"
                      className="w-full bg-transparent text-right text-sm font-medium tracking-tight text-xeoo-text outline-none placeholder:text-xeoo-muted scrollbar-none [&::-webkit-scrollbar]:hidden"
                    />

                    <div className="mt-1 min-h-8 overflow-hidden text-right">
                      {state.error ? (
                        <p className="wrap-break-word text-xs leading-4 text-xeoo-danger">
                          {state.error}
                        </p>
                      ) : state.result !== null ? (
                        <p className="whitespace-nowrap text-2xl font-bold tracking-tight text-xeoo-text sm:text-3xl">
                          {formatNumber(state.result)}
                        </p>
                      ) : (
                        <p className="text-xs text-xeoo-muted">
                          Enter an expression
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="grid grid-cols-2 rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-0.5">
                      <button
                        type="button"
                        onClick={() => setState(setAngleMode(state, "DEG"))}
                        className={[
                          "rounded-md px-2 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                          state.angleMode === "DEG"
                            ? "bg-xeoo-surface text-xeoo-text shadow-xs"
                            : "text-xeoo-muted hover:text-xeoo-text",
                        ].join(" ")}
                      >
                        Degrees
                      </button>

                      <button
                        type="button"
                        onClick={() => setState(setAngleMode(state, "RAD"))}
                        className={[
                          "rounded-md px-2 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                          state.angleMode === "RAD"
                            ? "bg-xeoo-surface text-xeoo-text shadow-xs"
                            : "text-xeoo-muted hover:text-xeoo-text",
                        ].join(" ")}
                      >
                        Radians
                      </button>
                    </div>

                    <div className="flex items-center justify-end text-right text-xs text-xeoo-muted">
                      Trigonometry
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-xeoo-muted">
                      Memory
                    </span>

                    <div className="grid min-w-0 flex-1 grid-cols-5 gap-1">
                      {memoryButtons.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={item.action}
                          className="flex h-7 min-w-0 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface-soft px-1 text-xs font-semibold text-xeoo-text-soft hover:bg-xeoo-border hover:text-xeoo-text cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    <CalculatorKey
                      label="C"
                      tone="utility"
                      onClick={handleClear}
                    />

                    <CalculatorKey
                      label={<Delete className="size-3.5" />}
                      tone="utility"
                      onClick={handleBackspace}
                    />

                    <CalculatorKey
                      label="%"
                      tone="operator"
                      onClick={() => insertText("%")}
                    />

                    <CalculatorKey
                      label="÷"
                      tone="operator"
                      onClick={() => insertText("/")}
                    />

                    <CalculatorKey
                      label="7"
                      onClick={() => insertText("7", 1, state.justEvaluated)}
                    />

                    <CalculatorKey
                      label="8"
                      onClick={() => insertText("8", 1, state.justEvaluated)}
                    />

                    <CalculatorKey
                      label="9"
                      onClick={() => insertText("9", 1, state.justEvaluated)}
                    />

                    <CalculatorKey
                      label="×"
                      tone="operator"
                      onClick={() => insertText("*")}
                    />

                    <CalculatorKey
                      label="4"
                      onClick={() => insertText("4", 1, state.justEvaluated)}
                    />

                    <CalculatorKey
                      label="5"
                      onClick={() => insertText("5", 1, state.justEvaluated)}
                    />

                    <CalculatorKey
                      label="6"
                      onClick={() => insertText("6", 1, state.justEvaluated)}
                    />

                    <CalculatorKey
                      label="−"
                      tone="operator"
                      onClick={() => insertText("-")}
                    />

                    <CalculatorKey
                      label="1"
                      onClick={() => insertText("1", 1, state.justEvaluated)}
                    />

                    <CalculatorKey
                      label="2"
                      onClick={() => insertText("2", 1, state.justEvaluated)}
                    />

                    <CalculatorKey
                      label="3"
                      onClick={() => insertText("3", 1, state.justEvaluated)}
                    />

                    <CalculatorKey
                      label="+"
                      tone="operator"
                      onClick={() => insertText("+")}
                    />

                    <CalculatorKey
                      label="0"
                      onClick={() => insertText("0", 1, state.justEvaluated)}
                    />

                    <CalculatorKey
                      label="."
                      onClick={() => insertText(".", 1, state.justEvaluated)}
                    />

                    <CalculatorKey
                      label="("
                      tone="operator"
                      onClick={() => insertText("(")}
                    />

                    <CalculatorKey
                      label=")"
                      tone="operator"
                      onClick={handleCloseParen}
                    />

                    <button
                      type="button"
                      onClick={handleEvaluate}
                      className="col-span-4 flex h-8 items-center justify-center rounded-lg border border-xeoo-primary bg-xeoo-primary text-xs font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:bg-xeoo-primary sm:h-9 lg:h-10 cursor-pointer"
                    >
                      =
                    </button>
                  </div>
                </div>
              </section>

              {showScientific && (
                <aside className="min-w-0 self-start overflow-hidden rounded-2xl border border-xeoo-border bg-xeoo-surface shadow-xl">
                  <div className="flex flex-col p-3 lg:max-h-[calc(100vh-6rem)]">
                    <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-xeoo-text">
                          Scientific
                        </p>

                        <p className="text-xs text-xeoo-muted">
                          Functions insert brackets automatically.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowScientific(false)}
                        className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 py-2 text-xs font-semibold text-xeoo-text hover:bg-xeoo-border cursor-pointer"
                      >
                        Hide
                      </button>
                    </div>

                    <div className="min-h-0 space-y-3 overflow-y-auto pr-1">
                      {SCIENTIFIC_GROUPS.map((group) => (
                        <div key={group.title}>
                          <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.12em] text-xeoo-muted">
                            {group.title}
                          </p>

                          <div className="grid grid-cols-4 gap-1.5">
                            {group.items.map((item) => (
                              <button
                                key={`${group.title}-${item.label}`}
                                type="button"
                                onClick={() =>
                                  insertText(item.value, item.cursor)
                                }
                                className="flex h-8 min-w-0 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface-soft px-1 text-xs font-semibold text-xeoo-text transition-colors hover:bg-xeoo-border cursor-pointer sm:h-9"
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
