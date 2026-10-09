export type JsonFieldType = "string" | "number" | "boolean" | "array" | "object";

export interface SchemaField {
  id: string;
  name: string;
  type: JsonFieldType;
  description: string;
  required: boolean;
  enumValues?: string; // comma-separated
  itemType?: "string" | "number" | "object"; // for arrays
}

export interface JsonSchemaBuilderConfig {
  title: string;
  description: string;
  strictMode: boolean;
  fields: SchemaField[];
}

export interface GeneratedSchemaResult {
  jsonSchemaText: string;
  promptText: string;
  sampleJsonText: string;
}

export function generateJsonSchemaAndPrompt(config: JsonSchemaBuilderConfig): GeneratedSchemaResult {
  const schemaTitle = config.title.trim() || "GeneratedSchema";
  const schemaDescription = config.description.trim() || "Structured output schema";

  const properties: Record<string, unknown> = {};
  const requiredList: string[] = [];
  const sampleObj: Record<string, unknown> = {};

  config.fields.forEach((f) => {
    const key = f.name.trim();
    if (!key) return;

    if (f.required) {
      requiredList.push(key);
    }

    const propDef: Record<string, unknown> = {
      type: f.type,
      description: f.description.trim() || `The ${key} value.`,
    };

    if (f.enumValues && f.enumValues.trim()) {
      const enums = f.enumValues.split(",").map((s) => s.trim()).filter(Boolean);
      if (enums.length > 0) {
        propDef.enum = enums;
      }
    }

    if (f.type === "array") {
      propDef.items = {
        type: f.itemType || "string",
      };
    }

    properties[key] = propDef;

    // Generate sample value
    switch (f.type) {
      case "string":
        if (f.enumValues && f.enumValues.trim()) {
          sampleObj[key] = f.enumValues.split(",")[0].trim();
        } else {
          sampleObj[key] = `sample_${key}`;
        }
        break;
      case "number":
        sampleObj[key] = 42;
        break;
      case "boolean":
        sampleObj[key] = true;
        break;
      case "array":
        sampleObj[key] = f.itemType === "number" ? [1, 2, 3] : [`item_1`, `item_2`];
        break;
      case "object":
        sampleObj[key] = { detail: "example" };
        break;
    }
  });

  const fullSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: schemaTitle,
    description: schemaDescription,
    type: "object",
    properties,
    required: requiredList,
    additionalProperties: !config.strictMode,
  };

  const jsonSchemaText = JSON.stringify(fullSchema, null, 2);
  const sampleJsonText = JSON.stringify(sampleObj, null, 2);

  // Construct prompt instruction
  const promptLines: string[] = [
    `You must respond ONLY with a strictly valid JSON object adhering to the following schema specification.`,
    `Do not include any conversational preamble, markdown code blocks (\`\`\`json), or trailing explanations. Output pure JSON.`,
    "",
    `### Target JSON Schema:`,
    jsonSchemaText,
    "",
    `### Example Valid Response:`,
    sampleJsonText,
  ];

  return {
    jsonSchemaText,
    promptText: promptLines.join("\n"),
    sampleJsonText,
  };
}

