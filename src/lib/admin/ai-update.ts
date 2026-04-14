import {
  buildAcademyScheduleText,
  normalizeAcademyScheduleData,
  normalizeAcademyStyleTags
} from "@/lib/academies/academy-helpers";

export type AiUpdateEntity = "academy" | "teacher";
export type AiWorkflowMode = "create" | "update";

type FieldKind = "string" | "boolean" | "string_array" | "schedule_data";

type FieldSpec = {
  key: string;
  label: string;
  kind: FieldKind;
  allowedValues?: string[];
};

const ENTITY_FIELDS: Record<AiUpdateEntity, FieldSpec[]> = {
  academy: [
    { key: "name", label: "Nombre", kind: "string" },
    { key: "city", label: "Ciudad", kind: "string" },
    { key: "address", label: "Direccion", kind: "string" },
    { key: "description_es", label: "Descripcion", kind: "string" },
    { key: "style_tags", label: "Estilos y subestilos visibles", kind: "string_array" },
    { key: "schedule_text", label: "Horarios", kind: "string" },
    { key: "schedule_data", label: "Horario estructurado", kind: "schedule_data" },
    { key: "levels", label: "Niveles", kind: "string" },
    { key: "price_text", label: "Precios", kind: "string" },
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
    { key: "name", label: "Nombre", kind: "string" },
    { key: "city", label: "Ciudad", kind: "string" },
    { key: "area", label: "Zona o area", kind: "string" },
    { key: "address", label: "Direccion", kind: "string" },
    { key: "bio_es", label: "Bio", kind: "string" },
    {
      key: "style_tags",
      label: "Estilos y subestilos visibles",
      kind: "string_array"
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
    { key: "schedule_data", label: "Horario estructurado", kind: "schedule_data" },
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

function formatPromptValue(field: FieldSpec, value: unknown) {
  if (field.kind === "schedule_data") {
    return normalizeAcademyScheduleData(value);
  }

  if (field.kind === "string_array") {
    return field.key === "style_tags"
      ? normalizeAcademyStyleTags(value)
      : normalizeStringArray(value);
  }

  if (field.kind === "boolean") {
    return normalizeBoolean(value);
  }

  return normalizeString(value);
}

function comparableValue(field: FieldSpec, value: unknown) {
  if (field.kind === "schedule_data") {
    const scheduleData = normalizeAcademyScheduleData(value);
    return scheduleData ? JSON.stringify(scheduleData) : "";
  }

  if (field.kind === "string_array") {
    const values = field.key === "style_tags"
      ? normalizeAcademyStyleTags(value)
      : normalizeStringArray(value);

    return values
      .map((entry) => entry.toLowerCase())
      .sort()
      .join("|");
  }

  if (field.kind === "boolean") {
    return normalizeBoolean(value) ? "true" : "false";
  }

  return normalizeString(value).toLowerCase();
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

      if (field.kind === "schedule_data") {
        return `- ${field.key}: array de objetos con este formato exacto: [{ "day": "Lunes", "classes": [{ "time": "18:00 - 19:00", "name": "Salsa", "level": "Todos los niveles" }] }]`;
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

export function getAiUpdatePrompt(
  entity: AiUpdateEntity,
  currentData: Record<string, unknown>,
  mode: AiWorkflowMode
) {
  const entityLabel = entity === "academy" ? "dance academy" : "dance teacher";
  const currentSnapshot = Object.fromEntries(
    ENTITY_FIELDS[entity].map((field) => [field.key, formatPromptValue(field, currentData[field.key])])
  );

  const multiImageNote = `
IMPORTANT — multiple images or posts may be provided. Each image may contain partial information (one post with Monday schedule, another with Friday schedule, another with prices, etc.). Your job is to MERGE and UNIFY all information found across all images into a single coherent result. Do not discard information from any image. If two images show different days, include all days in schedule_data.`;

  if (mode === "create") {
    return `You are helping an admin create a new ${entityLabel} profile in Guatemala.

This is a CREATE workflow.
Your job is to draft only the fields that are clearly supported by the new material.
${multiImageNote}

Rules:
- Return ONLY a valid JSON object.
- Be conservative. If the new material does not clearly support a field, omit it.
- Prefer operational details such as schedules, prices, levels, venues, links, and contact info.
- Include name and summary text only when the material makes them clear.
- Never invent missing information.
- If the material shows schedules across multiple images, merge all days into a single schedule_data array.
- If the material is a weekly schedule poster, prioritize \`schedule_data\` first, then \`schedule_text\`, then any explicit levels, styles, prices, or trial class mentions.
- Preserve visible substyles as \`style_tags\` when they appear in the material, for example Mambo, Chachacha, Lady Style, Shines, Belly Dance, Hip-Hop, or Reggaeton.
- \`schedule_text\` should be a concise weekly summary, while \`schedule_data\` should contain the detailed classes needed to render a full schedule.
- For \`price_text\`: capture all price options in a compact readable string, e.g. "Q200/mes · Q50 clase suelta · Q30 clase de prueba".
- For booleans like trial_class, only include the field when the new material explicitly confirms it.
- If nothing useful can be drafted, return {}.

Allowed output keys for this draft:
${buildFieldInstructions(entity)}

Current partial draft JSON:
${JSON.stringify(currentSnapshot, null, 2)}

You will receive new material from the admin after this prompt. Use it only to draft safe fields for the new record.`;
  }

  return `You are helping an admin update an existing ${entityLabel} profile in Guatemala.

This is an UPDATE workflow, not a CREATE workflow.
Your job is to preserve the current record and only suggest targeted improvements supported by the new material.
${multiImageNote}

Rules:
- Return ONLY a valid JSON object.
- Be conservative. If the new material does not clearly support a change, omit that field.
- Do not rewrite the profile from scratch.
- Do not include fields that should stay as they are.
- Prefer improving operational details such as schedules, prices, levels, venues, links, and contact info.
- Never invent missing information.
- Do not replace a specific current value with a more generic one.
- If the material shows schedules across multiple images, merge ALL days found into a single schedule_data — do not drop days that already exist in the current record unless the new material explicitly replaces them.
- If the material is a weekly schedule poster, prioritize \`schedule_data\` first, then \`schedule_text\`, then any explicit levels, styles, prices, or trial class mentions.
- Preserve visible substyles as \`style_tags\` when they appear in the material, for example Mambo, Chachacha, Lady Style, Shines, Belly Dance, Hip-Hop, or Reggaeton.
- \`schedule_text\` should be a concise weekly summary, while \`schedule_data\` should contain the detailed classes needed to render a full schedule.
- For \`price_text\`: capture all price options in a compact readable string, e.g. "Q200/mes · Q50 clase suelta".
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

    if (field.kind === "schedule_data") {
      const scheduleData = normalizeAcademyScheduleData(raw[field.key]);
      if (!scheduleData) continue;
      next[field.key] = scheduleData;
      if (!("schedule_text" in raw)) {
        const summary = buildAcademyScheduleText(scheduleData);
        if (summary) {
          next.schedule_text = summary;
        }
      }
      continue;
    }

    if (field.kind === "string_array") {
      let values = field.key === "style_tags"
        ? normalizeAcademyStyleTags(raw[field.key])
        : normalizeStringArray(raw[field.key]);
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

export function filterMeaningfulAiChanges(
  entity: AiUpdateEntity,
  currentData: Record<string, unknown>,
  suggestion: Record<string, unknown>
) {
  const next: Record<string, unknown> = {};

  for (const field of ENTITY_FIELDS[entity]) {
    if (!(field.key in suggestion)) continue;

    const currentComparable = comparableValue(field, currentData[field.key]);
    const suggestedComparable = comparableValue(field, suggestion[field.key]);

    if (!suggestedComparable || currentComparable === suggestedComparable) {
      continue;
    }

    next[field.key] = suggestion[field.key];
  }

  return next;
}
