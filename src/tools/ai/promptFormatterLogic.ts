export interface FormatterOptions {
  normalizeWhitespace: boolean;
  normalizeNewlines: boolean;
  standardizeLists: boolean;
  normalizeHeadings: boolean;
  xmlTagStyle: boolean;
}

export interface FormattingStats {
  charsBefore: number;
  charsAfter: number;
  wordsBefore: number;
  wordsAfter: number;
  linesBefore: number;
  linesAfter: number;
}

export interface FormattedPromptResult {
  formattedText: string;
  stats: FormattingStats;
}

export function formatPrompt(raw: string, options: FormatterOptions): FormattedPromptResult {
  const charsBefore = raw.length;
  const wordsBefore = raw.trim() ? raw.trim().split(/\s+/).filter(Boolean).length : 0;
  const linesBefore = raw ? raw.split("\n").length : 0;

  if (!raw.trim()) {
    return {
      formattedText: "",
      stats: {
        charsBefore: 0,
        charsAfter: 0,
        wordsBefore: 0,
        wordsAfter: 0,
        linesBefore: 0,
        linesAfter: 0,
      },
    };
  }

  let text = raw;

  // 1. Normalize line endings (\r\n -> \n)
  text = text.replace(/\r\n/g, "\n");

  // 2. Normalize whitespace per line (trim trailing spaces, collapse multiple inline spaces)
  if (options.normalizeWhitespace) {
    text = text
      .split("\n")
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      .join("\n");
  }

  // 3. Normalize multiple consecutive newlines (collapse 3+ to 2)
  if (options.normalizeNewlines) {
    text = text.replace(/\n{3,}/g, "\n\n");
  }

  // 4. Standardize lists (e.g. '*', '•' -> '-')
  if (options.standardizeLists) {
    text = text
      .split("\n")
      .map((line) => {
        const trimmed = line.trimStart();
        if (trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
          return line.replace(/^([ \t]*)[*•] /, "$1- ");
        }
        return line;
      })
      .join("\n");
  }

  // 5. Normalize Headings (e.g. "Role:", "Task:", "Context:" -> "### Role", etc. or uppercase bracket)
  if (options.normalizeHeadings) {
    text = text.replace(
      /^(Role|Persona|Task|Objective|Context|Background|Instructions|Guidelines|Requirements|Constraints|Output Format|Examples):/gim,
      "### $1"
    );
  }

  // 6. Optional XML Tag Style
  if (options.xmlTagStyle) {
    // Wrap detected sections in clean xml tags if not already wrapped
    if (!text.includes("<instructions>") && !text.includes("<prompt>")) {
      text = `<instructions>\n${text.trim()}\n</instructions>`;
    }
  }

  text = text.trim();

  const charsAfter = text.length;
  const wordsAfter = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const linesAfter = text ? text.split("\n").length : 0;

  return {
    formattedText: text,
    stats: {
      charsBefore,
      charsAfter,
      wordsBefore,
      wordsAfter,
      linesBefore,
      linesAfter,
    },
  };
}

