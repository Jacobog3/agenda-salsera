export type AiUpdateEntity = "academy" | "teacher";

type FieldKind = "string" | "boolean" | "string_array";

type FieldSpec = {
  key: string;
  label: string;
  kind: FieldKind;
  allowedValues?: string[];
};

const ENTITY_FIELDS: Record<AiUpdateEntity, FieldSpec[]> = {
  academy: [
    { key: "city", label: "Ciudad", kind: "string" },
    { key: "address", label: "Direccion", kind: "string" },
    { key: "styles_taught", label: "Estilos que ensena", kind: "string_array" },
    { key: "schedule_text", label: "Horarios", kind: "string" },
    { key: "levels", label: "Niveles", kind: "string" },
    {
      key: "modality",
      label: "Modalidad",
      kind: "string",
      allowedValues: ["presencial", "online", "mixto"]
    },
    { key: "trial_class", label: "Clase de prueba gratis", kind: "boolean" },
    { key: "whatsapp_url", label: "WhatsApp", kind: "string" },
    { key: "instagram_url", label: "Instagram", kind: "string" },
    { key: "facebook_url", label: "Facebook", kind: "string" },
    { key: "website_url", label: "Sitio web", kind: "string" }
  ],
  teacher: [
    { key: "city", label: "Ciudad", kind: "string" },
    { key: "area", label: "Zona o area", kind: "string" },
    { key: "address", label: "Direccion", kind: "string" },
    {
      key: "styles_taught",
      label: "Estilos que ensena",
      kind: "string_array",
      allowedValues: ["salsa", "bachata", "salsa_bachata", "other"]
    },
    { key: "levels", label: "Niveles", kind: "string" },
    {
      key: "modality",
      label: "Modalidad",
      kind: "string",
      allowedValues: ["presencial", "online", "mixto"]
    },
    { key: "class_formats", label: "Formatos de clase", kind: "string_array" },
    { key: "teaching_venues", label: "Lugares donde da clases", kind: "string_array" },
    { key: "teaching_zones", label: "Zonas donde da clases", kind: "string_array" },
    { key: "schedule_text", label: "Horarios", kind: "string" },
    { key: "trial_class", label: "Clase de prueba gratis", kind: "boolean" },
    { key: "price_text", label: "Precio", kind: "string" },
    { key: "booking_url", label: "Link para agendar", kind: "string" },
    { key: "whatsapp_url", label: "WhatsApp", kind: "string" },
    { key: "instagram_url", label: "Instagram", kind: "string" },
    { key: "facebook_url", label: "Facebook", kind: "string" },
    { key: "website_url", label: "Sitio web", kind: "string" }
  ]
};

function parseStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry ?? "").trim())
      .filter(Boolean);
  }

  const text = String(value ?? "").trim();
  if (!text) return [];

  return text
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeString(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeStringArray(value: unknown) {
  return [...new Set(parseStringArray(value))];
}

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  const text = String(value ?? "").trim().toLowerCase();
  if (["true", "1", "si", "sí", "yes"].includes(text)) return true;
  if (["false", "0", "no"].includes(text)) return false;
  return null;
}

function formatPromptValue(kind: FieldKind, value: unknown) {
  if (kind === "string_array") {
    return normalizeStringArray(value);
  }

  if (kind === "boolean") {
    return normalizeBoolean(value);
  }

  return normalizeString(value);
}

function buildFieldInstructions(entity: AiUpdateEntity) {
  return ENTITY_FIELDS[entity]
    .map((field) => {
      if (field.kind === "string_array") {
        if (field.allowedValues?.length) {
          return `- ${field.key}: array de strings. Solo usa estos valores cuando aplique: ${field.allowedValues.join(", ")}`;
        }
        return `- ${field.key}: array de strings`;
      }

      if (field.kind === "boolean") {
        return `- ${field.key}: boolean. Solo incluyelo si el nuevo material lo confirma de forma explicita.`;
      }

      if (field.allowedValues?.length) {
        return `- ${field.key}: string. Solo usa uno de estos valores: ${field.allowedValues.join(", ")}`;
      }

      return `- ${field.key}: string`;
    })
    .join("\n");
}

export function getAiUpdatePrompt(entity: AiUpdateEntity, currentData: Record<string, unknown>) {
  const entityLabel = entity === "academy" ? "dance academy" : "dance teacher";
  const currentSnapshot = Object.fromEntries(
    ENTITY_FIELDS[entity].map((field) => [field.key, formatPromptValue(field.kind, currentData[field.key])])
  );

  return `You are helping an admin update an existing ${entityLabel} profile in Guatemala.

This is an UPDATE workflow, not a CREATE workflow.
Your job is to preserve the current record and only suggest targeted improvements supported by the new material.

Rules:
- Return ONLY a valid JSON object.
- Be conservative. If the new material does not clearly support a change, omit that field.
- Do not rewrite the profile from scratch.
- Do not include fields that should stay as they are.
- Prefer improving operational details such as schedules, levels, venues, links, and contact info.
- Never invent missing information.
- Do not replace a specific current value with a more generic one.
- If the new material only shows schedules, then focus on schedules and leave unrelated fields untouched.
- For booleans like trial_class, only include the field when the new material explicitly confirms it.
- If nothing should change, return {}.

Allowed output keys for this update:
${buildFieldInstructions(entity)}

Current record JSON:
${JSON.stringify(currentSnapshot, null, 2)}

You will receive new material from the admin after this prompt. Use it only to suggest safe improvements to the current record.`;
}

export function normalizeAiUpdateSuggestion(
  entity: AiUpdateEntity,
  raw: Record<string, unknown>
) {
  const next: Record<string, unknown> = {};

  for (const field of ENTITY_FIELDS[entity]) {
    if (!(field.key in raw)) continue;

    if (field.kind === "string") {
      const value = normalizeString(raw[field.key]);
      if (!value) continue;
      if (field.allowedValues && !field.allowedValues.includes(value)) continue;
      next[field.key] = value;
      continue;
    }

    if (field.kind === "string_array") {
      let values = normalizeStringArray(raw[field.key]);
      if (field.allowedValues) {
        values = values.filter((value) => field.allowedValues?.includes(value));
      }
      if (values.length === 0) continue;
      next[field.key] = values;
      continue;
    }

    const value = normalizeBoolean(raw[field.key]);
    if (value !== true) continue;
    next[field.key] = true;
  }

  return next;
}

function comparableValue(kind: FieldKind, value: unknown) {
  if (kind === "string_array") {
    return normalizeStringArray(value)
      .map((entry) => entry.toLowerCase())
      .sort()
      .join("|");
  }

  if (kind === "boolean") {
    return normalizeBoolean(value) ? "true" : "false";
  }

  return normalizeString(value).toLowerCase();
}

export function filterMeaningfulAiChanges(
  entity: AiUpdateEntity,
  currentData: Record<string, unknown>,
  suggestion: Record<string, unknown>
) {
  const next: Record<string, unknown> = {};

  for (const field of ENTITY_FIELDS[entity]) {
    if (!(field.key in suggestion)) continue;

    const currentComparable = comparableValue(field.kind, currentData[field.key]);
    const suggestedComparable = comparableValue(field.kind, suggestion[field.key]);

    if (!suggestedComparable || currentComparable === suggestedComparable) {
      continue;
    }

    next[field.key] = suggestion[field.key];
  }

  return next;
}
