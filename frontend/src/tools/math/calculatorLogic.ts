export type AngleMode = "DEG" | "RAD";

export type HistoryItem = {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
};

export type CalculatorState = {
  expression: string;
  display: string;
  result: number | null;
  memory: number;
  angleMode: AngleMode;
  history: HistoryItem[];
  justEvaluated: boolean;
  error: string | null;
};

type Token =
  | {
      type: "number";
      value: number;
      raw: string;
    }
  | {
      type: "identifier";
      value: string;
    }
  | {
      type: "operator";
      value: "+" | "-" | "*" | "/" | "^" | "%" | "!";
    }
  | {
      type: "paren";
      value: "(" | ")";
    }
  | {
      type: "comma";
      value: ",";
    };

const MAX_HISTORY = 50;

const FUNCTIONS = new Set([
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "atan2",
  "sec",
  "csc",
  "cot",
  "sqrt",
  "cbrt",
  "abs",
  "floor",
  "ceil",
  "round",
  "trunc",
  "log",
  "ln",
  "exp",
  "pow",
  "min",
  "max",
  "avg",
  "mod",
  "gcd",
  "lcm",
  "fact",
]);

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  tau: Math.PI * 2,
};

export const INITIAL_CALCULATOR_STATE: CalculatorState = {
  expression: "",
  display: "0",
  result: null,
  memory: 0,
  angleMode: "DEG",
  history: [],
  justEvaluated: false,
  error: null,
};

function makeId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function cleanNumber(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("Result is not a finite number.");
  }

  if (Object.is(value, -0)) {
    return 0;
  }

  if (Math.abs(value) < 1e-14) {
    return 0;
  }

  return Number.parseFloat(value.toPrecision(14));
}

function getDecimalPlaces(value: number): number {
  const normalized = Math.abs(
    cleanNumber(value),
  );

  const text = String(normalized);

  if (
    text.includes("e") ||
    text.includes("E")
  ) {
    const [coefficient, exponentText] =
      text.toLowerCase().split("e");

    const coefficientDecimals =
      coefficient.split(".")[1]?.length ?? 0;

    const exponent =
      Number(exponentText);

    return Math.max(
      0,
      coefficientDecimals - exponent,
    );
  }

  return text.split(".")[1]?.length ?? 0;
}

export function formatNumber(
  value: number,
): string {
  const clean = cleanNumber(value);

  if (Number.isInteger(clean)) {
    return new Intl.NumberFormat("id-ID", {
      useGrouping: true,
      maximumFractionDigits: 0,
    }).format(clean);
  }

  const absolute = Math.abs(clean);

  if (
    absolute >= 1e12 ||
    (absolute > 0 && absolute < 1e-10)
  ) {
    return clean
      .toExponential(10)
      .replace(".", ",")
      .replace(/,?0+e/, "e");
  }

  const decimalPlaces =
    Math.min(
      getDecimalPlaces(clean),
      14,
    );

  return new Intl.NumberFormat("id-ID", {
    useGrouping: true,
    maximumFractionDigits: decimalPlaces,
  }).format(clean);
}

export function formatExpressionNumber(
  value: number,
): string {
  return String(cleanNumber(value));
}

function formatDisplayNumber(
  value: number,
): string {
  return formatNumber(value);
}

function tokenLabel(token: Token): string {
  if (token.type === "number") {
    return token.raw;
  }

  return token.value;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < input.length) {
    const char = input[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (
      /\d/.test(char) ||
      (char === "." &&
        index + 1 < input.length &&
        /\d/.test(input[index + 1]))
    ) {
      const start = index;
      let hasDot = false;

      if (input[index] === ".") {
        hasDot = true;
        index += 1;
      }

      while (
        index < input.length &&
        /\d/.test(input[index])
      ) {
        index += 1;
      }

      if (
        !hasDot &&
        input[index] === "." &&
        /\d/.test(input[index + 1] ?? "")
      ) {
        hasDot = true;
        index += 1;

        while (
          index < input.length &&
          /\d/.test(input[index])
        ) {
          index += 1;
        }
      }

      if (
        input[index] === "e" ||
        input[index] === "E"
      ) {
        const exponentStart = index;

        index += 1;

        if (
          input[index] === "+" ||
          input[index] === "-"
        ) {
          index += 1;
        }

        const exponentDigitsStart = index;

        while (
          index < input.length &&
          /\d/.test(input[index])
        ) {
          index += 1;
        }

        if (
          exponentDigitsStart === index
        ) {
          index = exponentStart;
        }
      }

      const raw = input.slice(
        start,
        index,
      );

      const value = Number(raw);

      if (!Number.isFinite(value)) {
        throw new Error(
          `Invalid number: ${raw}`,
        );
      }

      tokens.push({
        type: "number",
        value,
        raw,
      });

      continue;
    }

    if (/[a-zA-Z]/.test(char)) {
      const start = index;

      index += 1;

      while (
        index < input.length &&
        /[a-zA-Z]/.test(input[index])
      ) {
        index += 1;
      }

      tokens.push({
        type: "identifier",
        value: input
          .slice(start, index)
          .toLowerCase(),
      });

      continue;
    }

    if (char === "π") {
      tokens.push({
        type: "identifier",
        value: "pi",
      });

      index += 1;
      continue;
    }

    if (
      char === "+" ||
      char === "-" ||
      char === "*" ||
      char === "/" ||
      char === "^" ||
      char === "%" ||
      char === "!"
    ) {
      tokens.push({
        type: "operator",
        value: char,
      });

      index += 1;
      continue;
    }

    if (
      char === "(" ||
      char === ")"
    ) {
      tokens.push({
        type: "paren",
        value: char,
      });

      index += 1;
      continue;
    }

    if (char === ",") {
      tokens.push({
        type: "comma",
        value: char,
      });

      index += 1;
      continue;
    }

    throw new Error(
      `Unexpected character: "${char}"`,
    );
  }

  return tokens;
}

function toRadians(
  value: number,
  angleMode: AngleMode,
): number {
  if (angleMode === "RAD") {
    return value;
  }

  return (value * Math.PI) / 180;
}

function fromRadians(
  value: number,
  angleMode: AngleMode,
): number {
  if (angleMode === "RAD") {
    return value;
  }

  return (value * 180) / Math.PI;
}

function factorial(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error(
      "Factorial requires a finite number.",
    );
  }

  if (value < 0) {
    throw new Error(
      "Factorial is not defined for negative numbers.",
    );
  }

  if (!Number.isInteger(value)) {
    throw new Error(
      "Factorial requires a whole number.",
    );
  }

  if (value > 170) {
    throw new Error(
      "Factorial is too large for this calculator.",
    );
  }

  let result = 1;

  for (
    let index = 2;
    index <= value;
    index += 1
  ) {
    result *= index;
  }

  return cleanNumber(result);
}

function gcd(
  a: number,
  b: number,
): number {
  if (
    !Number.isInteger(a) ||
    !Number.isInteger(b)
  ) {
    throw new Error(
      "GCD requires whole numbers.",
    );
  }

  let left = Math.abs(a);
  let right = Math.abs(b);

  while (right !== 0) {
    const remainder = left % right;

    left = right;
    right = remainder;
  }

  return cleanNumber(left);
}

function lcm(
  a: number,
  b: number,
): number {
  if (
    !Number.isInteger(a) ||
    !Number.isInteger(b)
  ) {
    throw new Error(
      "LCM requires whole numbers.",
    );
  }

  if (a === 0 || b === 0) {
    return 0;
  }

  return cleanNumber(
    Math.abs((a * b) / gcd(a, b)),
  );
}

function ensureArgumentCount(
  name: string,
  args: number[],
  expected: number,
) {
  if (args.length !== expected) {
    throw new Error(
      `${name} requires ${expected} argument${
        expected === 1 ? "" : "s"
      }.`,
    );
  }
}

function invokeFunction(
  name: string,
  args: number[],
  angleMode: AngleMode,
): number {
  if (!FUNCTIONS.has(name)) {
    throw new Error(
      `Unknown function: ${name}`,
    );
  }

  switch (name) {
    case "sin":
      ensureArgumentCount(
        name,
        args,
        1,
      );

      return cleanNumber(
        Math.sin(
          toRadians(
            args[0],
            angleMode,
          ),
        ),
      );

    case "cos":
      ensureArgumentCount(
        name,
        args,
        1,
      );

      return cleanNumber(
        Math.cos(
          toRadians(
            args[0],
            angleMode,
          ),
        ),
      );

    case "tan": {
      ensureArgumentCount(
        name,
        args,
        1,
      );

      const radians = toRadians(
        args[0],
        angleMode,
      );

      const cosine = Math.cos(
        radians,
      );

      if (Math.abs(cosine) < 1e-12) {
        throw new Error(
          "Tangent is undefined at this angle.",
        );
      }

      return cleanNumber(
        Math.tan(radians),
      );
    }

    case "asin":
      ensureArgumentCount(
        name,
        args,
        1,
      );

      if (
        args[0] < -1 ||
        args[0] > 1
      ) {
        throw new Error(
          "asin domain is from -1 to 1.",
        );
      }

      return cleanNumber(
        fromRadians(
          Math.asin(args[0]),
          angleMode,
        ),
      );

    case "acos":
      ensureArgumentCount(
        name,
        args,
        1,
      );

      if (
        args[0] < -1 ||
        args[0] > 1
      ) {
        throw new Error(
          "acos domain is from -1 to 1.",
        );
      }

      return cleanNumber(
        fromRadians(
          Math.acos(args[0]),
          angleMode,
        ),
      );

    case "atan":
      ensureArgumentCount(
        name,
        args,
        1,
      );

      return cleanNumber(
        fromRadians(
          Math.atan(args[0]),
          angleMode,
        ),
      );

    case "atan2":
      ensureArgumentCount(
        name,
        args,
        2,
      );

      return cleanNumber(
        fromRadians(
          Math.atan2(
            args[0],
            args[1],
          ),
          angleMode,
        ),
      );

    case "sec": {
      ensureArgumentCount(
        name,
        args,
        1,
      );

      const cosine = Math.cos(
        toRadians(
          args[0],
          angleMode,
        ),
      );

      if (
        Math.abs(cosine) < 1e-12
      ) {
        throw new Error(
          "Secant is undefined at this angle.",
        );
      }

      return cleanNumber(
        1 / cosine,
      );
    }

    case "csc": {
      ensureArgumentCount(
        name,
        args,
        1,
      );

      const sine = Math.sin(
        toRadians(
          args[0],
          angleMode,
        ),
      );

      if (Math.abs(sine) < 1e-12) {
        throw new Error(
          "Cosecant is undefined at this angle.",
        );
      }

      return cleanNumber(
        1 / sine,
      );
    }

    case "cot": {
      ensureArgumentCount(
        name,
        args,
        1,
      );

      const radians = toRadians(
        args[0],
        angleMode,
      );

      const sine = Math.sin(
        radians,
      );

      if (Math.abs(sine) < 1e-12) {
        throw new Error(
          "Cotangent is undefined at this angle.",
        );
      }

      return cleanNumber(
        1 / Math.tan(radians),
      );
    }

    case "sqrt":
      ensureArgumentCount(
        name,
        args,
        1,
      );

      if (args[0] < 0) {
        throw new Error(
          "Square root requires a non-negative value.",
        );
      }

      return cleanNumber(
        Math.sqrt(args[0]),
      );

    case "cbrt":
      ensureArgumentCount(
        name,
        args,
        1,
      );

      return cleanNumber(
        Math.cbrt(args[0]),
      );

    case "abs":
      ensureArgumentCount(
        name,
        args,
        1,
      );

      return cleanNumber(
        Math.abs(args[0]),
      );

    case "floor":
      ensureArgumentCount(
        name,
        args,
        1,
      );

      return cleanNumber(
        Math.floor(args[0]),
      );

    case "ceil":
      ensureArgumentCount(
        name,
        args,
        1,
      );

      return cleanNumber(
        Math.ceil(args[0]),
      );

    case "round":
      ensureArgumentCount(
        name,
        args,
        1,
      );

      return cleanNumber(
        Math.round(args[0]),
      );

    case "trunc":
      ensureArgumentCount(
        name,
        args,
        1,
      );

      return cleanNumber(
        Math.trunc(args[0]),
      );

    case "log":
      ensureArgumentCount(
        name,
        args,
        1,
      );

      if (args[0] <= 0) {
        throw new Error(
          "log requires a value greater than zero.",
        );
      }

      return cleanNumber(
        Math.log10(args[0]),
      );

    case "ln":
      ensureArgumentCount(
        name,
        args,
        1,
      );

      if (args[0] <= 0) {
        throw new Error(
          "ln requires a value greater than zero.",
        );
      }

      return cleanNumber(
        Math.log(args[0]),
      );

    case "exp":
      ensureArgumentCount(
        name,
        args,
        1,
      );

      return cleanNumber(
        Math.exp(args[0]),
      );

    case "pow":
      ensureArgumentCount(
        name,
        args,
        2,
      );

      return cleanNumber(
        Math.pow(
          args[0],
          args[1],
        ),
      );

    case "min":
      if (args.length === 0) {
        throw new Error(
          "min requires at least one argument.",
        );
      }

      return cleanNumber(
        Math.min(...args),
      );

    case "max":
      if (args.length === 0) {
        throw new Error(
          "max requires at least one argument.",
        );
      }

      return cleanNumber(
        Math.max(...args),
      );

    case "avg":
      if (args.length === 0) {
        throw new Error(
          "avg requires at least one argument.",
        );
      }

      return cleanNumber(
        args.reduce(
          (sum, value) =>
            sum + value,
          0,
        ) / args.length,
      );

    case "mod":
      ensureArgumentCount(
        name,
        args,
        2,
      );

      if (args[1] === 0) {
        throw new Error(
          "Modulo divisor cannot be zero.",
        );
      }

      return cleanNumber(
        args[0] % args[1],
      );

    case "gcd":
      ensureArgumentCount(
        name,
        args,
        2,
      );

      return gcd(
        args[0],
        args[1],
      );

    case "lcm":
      ensureArgumentCount(
        name,
        args,
        2,
      );

      return lcm(
        args[0],
        args[1],
      );

    case "fact":
      ensureArgumentCount(
        name,
        args,
        1,
      );

      return factorial(args[0]);

    default:
      throw new Error(
        `Unsupported function: ${name}`,
      );
  }
}

class ExpressionParser {
  private readonly tokens: Token[];

  private position = 0;

  private readonly angleMode: AngleMode;

  private readonly ans: number;

  constructor(
    input: string,
    angleMode: AngleMode,
    ans: number,
  ) {
    this.tokens = tokenize(input);
    this.angleMode = angleMode;
    this.ans = ans;
  }

  parse(): number {
    if (this.tokens.length === 0) {
      throw new Error(
        "Enter an expression first.",
      );
    }

    const result =
      this.parseAdditive();

    if (
      this.position <
      this.tokens.length
    ) {
      const token =
        this.tokens[this.position];

      throw new Error(
        `Unexpected token: ${tokenLabel(token)}`,
      );
    }

    return cleanNumber(result);
  }

  private parseAdditive(): number {
    let left =
      this.parseMultiplicative();

    while (true) {
      const token = this.peek();

      if (
        token?.type ===
          "operator" &&
        (token.value === "+" ||
          token.value === "-")
      ) {
        this.position += 1;

        const right =
          this.parseMultiplicative();

        left =
          token.value === "+"
            ? cleanNumber(
                left + right,
              )
            : cleanNumber(
                left - right,
              );

        continue;
      }

      break;
    }

    return left;
  }

  private parseMultiplicative(): number {
    let left =
      this.parseUnary();

    while (true) {
      const token = this.peek();

      if (
        token?.type ===
          "operator" &&
        (token.value === "*" ||
          token.value === "/")
      ) {
        this.position += 1;

        const right =
          this.parseUnary();

        if (
          token.value === "*"
        ) {
          left = cleanNumber(
            left * right,
          );
        } else {
          if (right === 0) {
            throw new Error(
              "Cannot divide by zero.",
            );
          }

          left = cleanNumber(
            left / right,
          );
        }

        continue;
      }

      if (
        this.startsImplicitMultiplication(
          token,
        )
      ) {
        const right =
          this.parseUnary();

        left = cleanNumber(
          left * right,
        );

        continue;
      }

      break;
    }

    return left;
  }

  private parseUnary(): number {
    const token = this.peek();

    if (
      token?.type ===
        "operator" &&
      (token.value === "+" ||
        token.value === "-")
    ) {
      this.position += 1;

      const value =
        this.parseUnary();

      return token.value === "-"
        ? cleanNumber(-value)
        : value;
    }

    return this.parsePower();
  }

  private parsePower(): number {
    const left =
      this.parsePostfix();

    const token = this.peek();

    if (
      token?.type ===
        "operator" &&
      token.value === "^"
    ) {
      this.position += 1;

      const right =
        this.parseUnary();

      return cleanNumber(
        Math.pow(left, right),
      );
    }

    return left;
  }

  private parsePostfix(): number {
    let value =
      this.parsePrimary();

    while (true) {
      const token = this.peek();

      if (
        token?.type ===
          "operator" &&
        token.value === "!"
      ) {
        this.position += 1;

        value = factorial(value);

        continue;
      }

      if (
        token?.type ===
          "operator" &&
        token.value === "%"
      ) {
        this.position += 1;

        value = cleanNumber(
          value / 100,
        );

        continue;
      }

      break;
    }

    return value;
  }

  private parsePrimary(): number {
    const token = this.peek();

    if (!token) {
      throw new Error(
        "Unexpected end of expression.",
      );
    }

    if (
      token.type === "number"
    ) {
      this.position += 1;

      return token.value;
    }

    if (
      token.type ===
      "identifier"
    ) {
      this.position += 1;

      const name =
        token.value;

      if (
        this.peekIsParen("(")
      ) {
        this.position += 1;

        if (
          !FUNCTIONS.has(name)
        ) {
          throw new Error(
            `"${name}" is not a recognized function.`,
          );
        }

        const args: number[] = [];

        if (
          !this.peekIsParen(")")
        ) {
          while (true) {
            args.push(
              this.parseAdditive(),
            );

            const separator =
              this.peek();

            if (
              separator?.type ===
              "comma"
            ) {
              this.position += 1;

              continue;
            }

            break;
          }
        }

        if (
          !this.peekIsParen(")")
        ) {
          throw new Error(
            `Missing ")" after ${name}().`,
          );
        }

        this.position += 1;

        return invokeFunction(
          name,
          args,
          this.angleMode,
        );
      }

      if (name === "ans") {
        return this.ans;
      }

      if (
        name in CONSTANTS
      ) {
        return CONSTANTS[name];
      }

      throw new Error(
        `Unknown identifier: ${name}`,
      );
    }

    if (
      token.type ===
        "paren" &&
      token.value === "("
    ) {
      this.position += 1;

      const value =
        this.parseAdditive();

      if (
        !this.peekIsParen(")")
      ) {
        throw new Error(
          'Missing closing ")".',
        );
      }

      this.position += 1;

      return value;
    }

    throw new Error(
      "Invalid expression.",
    );
  }

  private startsImplicitMultiplication(
    token: Token | undefined,
  ): boolean {
    if (!token) {
      return false;
    }

    if (token.type === "number") {
      return true;
    }

    if (
      token.type === "identifier"
    ) {
      return true;
    }

    return (
      token.type === "paren" &&
      token.value === "("
    );
  }

  private peek():
    | Token
    | undefined {
    return this.tokens[
      this.position
    ];
  }

  private peekIsParen(
    value: "(" | ")",
  ): boolean {
    const token = this.peek();

    return (
      token?.type ===
        "paren" &&
      token.value === value
    );
  }
}

export function evaluateExpression(
  expression: string,
  angleMode: AngleMode,
  ans: number,
): number {
  const parser =
    new ExpressionParser(
      expression,
      angleMode,
      ans,
    );

  return parser.parse();
}

export function createHistoryItem(
  expression: string,
  result: number,
): HistoryItem {
  return {
    id: makeId(),
    expression,
    result: formatNumber(result),
    timestamp: Date.now(),
  };
}

export function evaluateCurrentExpression(
  state: CalculatorState,
): CalculatorState {
  if (!state.expression.trim()) {
    return state;
  }

  try {
    const result =
      evaluateExpression(
        state.expression,
        state.angleMode,
        state.result ?? 0,
      );

    const historyItem =
      createHistoryItem(
        state.expression,
        result,
      );

    return {
      ...state,
      display:
        formatDisplayNumber(result),
      result,
      history: [
        historyItem,
        ...state.history,
      ].slice(0, MAX_HISTORY),
      justEvaluated: true,
      error: null,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Invalid expression.";

    return {
      ...state,
      display: "Error",
      result: null,
      justEvaluated: false,
      error: message,
    };
  }
}

export function appendExpression(
  state: CalculatorState,
  value: string,
): CalculatorState {
  const startsNewExpression =
    state.justEvaluated &&
    (/^\d/.test(value) ||
      value === "." ||
      value === "(" ||
      /^[a-zA-Zπ]/.test(
        value,
      ));

  if (
    state.error ||
    startsNewExpression
  ) {
    return {
      ...state,
      expression: value,
      display: value,
      result: null,
      justEvaluated: false,
      error: null,
    };
  }

  const expression =
    `${state.expression}${value}`;

  return {
    ...state,
    expression,
    display:
      expression || "0",
    result: null,
    justEvaluated: false,
    error: null,
  };
}

export function clearCalculator(
  state: CalculatorState,
): CalculatorState {
  return {
    ...state,
    expression: "",
    display: "0",
    result: null,
    justEvaluated: false,
    error: null,
  };
}

export function deleteLastCharacter(
  state: CalculatorState,
): CalculatorState {
  if (
    state.justEvaluated ||
    state.error
  ) {
    return clearCalculator(
      state,
    );
  }

  if (!state.expression) {
    return state;
  }

  const expression =
    state.expression.slice(
      0,
      -1,
    );

  return {
    ...state,
    expression,
    display:
      expression || "0",
    result: null,
    error: null,
  };
}

export function setAngleMode(
  state: CalculatorState,
  angleMode: AngleMode,
): CalculatorState {
  return {
    ...state,
    angleMode,
  };
}

export function memoryClear(
  state: CalculatorState,
): CalculatorState {
  return {
    ...state,
    memory: 0,
  };
}

export function memoryRecall(
  state: CalculatorState,
): CalculatorState {
  return appendExpression(
    state,
    formatExpressionNumber(
      state.memory,
    ),
  );
}

export function memoryStore(
  state: CalculatorState,
): CalculatorState {
  try {
    const value =
      state.result !== null
        ? state.result
        : state.expression.trim()
          ? evaluateExpression(
              state.expression,
              state.angleMode,
              state.result ?? 0,
            )
          : 0;

    return {
      ...state,
      memory: value,
    };
  } catch {
    return state;
  }
}

export function memoryAdd(
  state: CalculatorState,
): CalculatorState {
  try {
    const value =
      state.result !== null
        ? state.result
        : state.expression.trim()
          ? evaluateExpression(
              state.expression,
              state.angleMode,
              state.result ?? 0,
            )
          : 0;

    return {
      ...state,
      memory: cleanNumber(
        state.memory + value,
      ),
    };
  } catch {
    return state;
  }
}

export function memorySubtract(
  state: CalculatorState,
): CalculatorState {
  try {
    const value =
      state.result !== null
        ? state.result
        : state.expression.trim()
          ? evaluateExpression(
              state.expression,
              state.angleMode,
              state.result ?? 0,
            )
          : 0;

    return {
      ...state,
      memory: cleanNumber(
        state.memory - value,
      ),
    };
  } catch {
    return state;
  }
}

export function restoreHistoryItem(
  state: CalculatorState,
  item: HistoryItem,
): CalculatorState {
  return {
    ...state,
    expression: item.expression,
    display: item.expression,
    result: null,
    justEvaluated: false,
    error: null,
  };
}

export function deleteHistoryItem(
  state: CalculatorState,
  id: string,
): CalculatorState {
  return {
    ...state,
    history: state.history.filter(
      (item) =>
        item.id !== id,
    ),
  };
}

export function clearHistory(
  state: CalculatorState,
): CalculatorState {
  return {
    ...state,
    history: [],
  };
}

export function handleCalculatorKey(
  state: CalculatorState,
  key: string,
): CalculatorState {
  if (
    /^\d$/.test(key) ||
    key === "." ||
    key === "(" ||
    key === ")" ||
    key === "," ||
    key === "+" ||
    key === "-" ||
    key === "*" ||
    key === "/" ||
    key === "^" ||
    key === "%" ||
    key === "!"
  ) {
    return appendExpression(
      state,
      key,
    );
  }

  if (
    key === "Enter" ||
    key === "="
  ) {
    return evaluateCurrentExpression(
      state,
    );
  }

  if (
    key === "Backspace"
  ) {
    return deleteLastCharacter(
      state,
    );
  }

  if (
    key === "Escape" ||
    key.toLowerCase() === "c"
  ) {
    return clearCalculator(
      state,
    );
  }

  return state;
}