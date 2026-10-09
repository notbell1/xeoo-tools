export interface EvaluationCriterion {
  id: string;
  name: string;
  weight: number; // 1 - 5
  type: "required_words" | "forbidden_words" | "min_length" | "max_length" | "contains_code" | "contains_list" | "valid_json";
  param?: string; // e.g. "React, Vite" or "50"
}

export interface CriterionResult {
  id: string;
  name: string;
  weight: number;
  passed: boolean;
  score: number; // 0 - 100
  details: string;
}

export interface EvaluationReport {
  overallScore: number; // 0 - 100
  passedChecksCount: number;
  totalChecksCount: number;
  criteriaResults: CriterionResult[];
  suggestions: string[];
}

export function evaluateAiOutput(
  _prompt: string,
  output: string,
  criteria: EvaluationCriterion[]
): EvaluationReport {
  const cleanOutput = output.trim();
  const lowerOutput = cleanOutput.toLowerCase();
  const words = cleanOutput ? cleanOutput.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  if (!cleanOutput || criteria.length === 0) {
    return {
      overallScore: 0,
      passedChecksCount: 0,
      totalChecksCount: criteria.length,
      criteriaResults: [],
      suggestions: ["Provide an AI response to evaluate."],
    };
  }

  let totalWeight = 0;
  let weightedScoreSum = 0;
  let passedCount = 0;
  const suggestions: string[] = [];
  const results: CriterionResult[] = [];

  for (const c of criteria) {
    const weight = Math.max(1, c.weight);
    totalWeight += weight;

    let passed = false;
    let details = "";

    switch (c.type) {
      case "required_words": {
        const requiredList = (c.param || "")
          .split(",")
          .map((w) => w.trim().toLowerCase())
          .filter(Boolean);
        if (requiredList.length === 0) {
          passed = true;
          details = "No required keywords specified.";
        } else {
          const missing = requiredList.filter((w) => !lowerOutput.includes(w));
          if (missing.length === 0) {
            passed = true;
            details = `All required terms found (${requiredList.join(", ")}).`;
          } else {
            passed = false;
            details = `Missing terms: ${missing.join(", ")}`;
            suggestions.push(`Include required keyword(s): ${missing.join(", ")}.`);
          }
        }
        break;
      }

      case "forbidden_words": {
        const forbiddenList = (c.param || "")
          .split(",")
          .map((w) => w.trim().toLowerCase())
          .filter(Boolean);
        if (forbiddenList.length === 0) {
          passed = true;
          details = "No forbidden terms specified.";
        } else {
          const found = forbiddenList.filter((w) => lowerOutput.includes(w));
          if (found.length === 0) {
            passed = true;
            details = `No forbidden terms detected.`;
          } else {
            passed = false;
            details = `Forbidden terms found: ${found.join(", ")}`;
            suggestions.push(`Remove forbidden term(s): ${found.join(", ")}.`);
          }
        }
        break;
      }

      case "min_length": {
        const minWords = parseInt(c.param || "50", 10) || 50;
        if (wordCount >= minWords) {
          passed = true;
          details = `Word count (${wordCount}) meets minimum requirement (${minWords}).`;
        } else {
          passed = false;
          details = `Word count (${wordCount}) is below minimum (${minWords}).`;
          suggestions.push(`Expand response length to at least ${minWords} words.`);
        }
        break;
      }

      case "max_length": {
        const maxWords = parseInt(c.param || "500", 10) || 500;
        if (wordCount <= maxWords) {
          passed = true;
          details = `Word count (${wordCount}) is within maximum ceiling (${maxWords}).`;
        } else {
          passed = false;
          details = `Word count (${wordCount}) exceeds maximum ceiling (${maxWords}).`;
          suggestions.push(`Condense output to be under ${maxWords} words.`);
        }
        break;
      }

      case "contains_code": {
        const hasCodeBlock = cleanOutput.includes("```");
        if (hasCodeBlock) {
          passed = true;
          details = "Code block detected with syntax markers.";
        } else {
          passed = false;
          details = "No markdown code blocks (```) found in output.";
          suggestions.push("Ensure code solutions are formatted in fenced code blocks.");
        }
        break;
      }

      case "contains_list": {
        const hasList =
          /^\s*[-*•]\s+/m.test(cleanOutput) ||
          /^\s*\d+\.\s+/m.test(cleanOutput);
        if (hasList) {
          passed = true;
          details = "Structured list elements (bullet or numbered) detected.";
        } else {
          passed = false;
          details = "No sequential or bullet lists detected.";
          suggestions.push("Format key takeaways or steps in bulleted or numbered lists.");
        }
        break;
      }

      case "valid_json": {
        try {
          // Look for json inside code block or entire output
          let candidate = cleanOutput;
          const jsonBlockMatch = cleanOutput.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonBlockMatch) {
            candidate = jsonBlockMatch[1];
          }
          JSON.parse(candidate.trim());
          passed = true;
          details = "Output contains valid, parseable JSON.";
        } catch {
          passed = false;
          details = "Output could not be parsed as valid JSON.";
          suggestions.push("Ensure JSON response has matching braces, quotes, and valid syntax.");
        }
        break;
      }
    }

    const itemScore = passed ? 100 : 0;
    if (passed) passedCount++;
    weightedScoreSum += itemScore * weight;

    results.push({
      id: c.id,
      name: c.name,
      weight,
      passed,
      score: itemScore,
      details,
    });
  }

  const overallScore = totalWeight > 0 ? Math.round(weightedScoreSum / totalWeight) : 0;

  return {
    overallScore,
    passedChecksCount: passedCount,
    totalChecksCount: criteria.length,
    criteriaResults: results,
    suggestions: suggestions.length > 0 ? suggestions : ["All defined criteria checks successfully passed."],
  };
}

