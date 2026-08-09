export const SUBMISSION_AI_VERSION = "2026-08-09.1";

export type SubmissionType = "event" | "academy" | "teacher" | "spot";
export type ReviewPriority = "normal" | "recommended" | "required";
export type MentionEntityType = "professional" | "academy" | "organizer" | "spot" | "festival";

export type SubmissionMention = {
  entityType: MentionEntityType;
  displayName: string;
  roles: string[];
  affiliation: string;
  originCity: string;
  originCountryCode: string;
  evidence: string;
};

export type ReviewSignals = {
  reasons: string[];
  mentions: SubmissionMention[];
  eventKind?: string;
  festivalName?: string;
  festivalEditionLabel?: string;
  ambiguousFields?: string[];
};

const ENTITY_TYPES = new Set<MentionEntityType>([
  "professional",
  "academy",
  "organizer",
  "spot",
  "festival"
]);

function cleanString(value: unknown, maxLength = 500) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function cleanStringArray(value: unknown, maxEntries = 20) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((entry) => cleanString(entry, 80)).filter(Boolean))]
    .slice(0, maxEntries);
}

function normalizeEntityType(value: unknown): MentionEntityType | null {
  const normalized = cleanString(value, 30).toLowerCase() as MentionEntityType;
  if (ENTITY_TYPES.has(normalized)) return normalized;

  if (["artist", "teacher", "dancer", "dj", "judge", "person", "couple", "team"].includes(normalized)) {
    return "professional";
  }
  if (["venue", "location", "place"].includes(normalized)) return "spot";
  if (["school", "studio"].includes(normalized)) return "academy";
  if (["congress"].includes(normalized)) return "festival";
  return null;
}

function normalizeMention(value: unknown): SubmissionMention | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const entityType = normalizeEntityType(raw.entityType ?? raw.entity_type ?? raw.type);
  const displayName = cleanString(raw.displayName ?? raw.display_name ?? raw.name, 160);
  if (!entityType || !displayName) return null;

  return {
    entityType,
    displayName,
    roles: cleanStringArray(raw.roles, 12),
    affiliation: cleanString(raw.affiliation, 200),
    originCity: cleanString(raw.originCity ?? raw.origin_city, 120),
    originCountryCode: cleanString(raw.originCountryCode ?? raw.origin_country_code, 2).toUpperCase(),
    evidence: cleanString(raw.evidence, 500)
  };
}

function mentionKey(mention: SubmissionMention) {
  return `${mention.entityType}:${mention.displayName.toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")}`;
}

export function normalizeReviewSignals(rawValue: unknown, parsedData?: Record<string, unknown>): ReviewSignals {
  const raw = rawValue && typeof rawValue === "object"
    ? rawValue as Record<string, unknown>
    : {};
  const mentions = Array.isArray(raw.mentions)
    ? raw.mentions.map(normalizeMention).filter((item): item is SubmissionMention => Boolean(item))
    : [];

  // Preserve compatibility with the richer event parser that already returns people.
  if (Array.isArray(parsedData?.people)) {
    for (const person of parsedData.people) {
      if (!person || typeof person !== "object") continue;
      const personRecord = person as Record<string, unknown>;
      const mention = normalizeMention({
        ...personRecord,
        entityType: "professional",
        displayName: personRecord.name
      });
      if (mention) mentions.push(mention);
    }
  }

  const dedupedMentions = [...new Map(mentions.map((mention) => [mentionKey(mention), mention])).values()]
    .slice(0, 30);
  const reasons = new Set(cleanStringArray(raw.reasons, 20));

  if (dedupedMentions.some((mention) => mention.entityType === "professional")) reasons.add("people_detected");
  if (dedupedMentions.some((mention) => mention.entityType === "academy")) reasons.add("academy_detected");
  if (dedupedMentions.some((mention) => mention.entityType === "organizer")) reasons.add("organizer_detected");
  if (dedupedMentions.some((mention) => mention.entityType === "festival")) reasons.add("festival_detected");

  const festivalName = cleanString(raw.festivalName ?? parsedData?.festivalName, 160);
  const eventKind = cleanString(raw.eventKind ?? parsedData?.eventKind, 40);
  if (festivalName) reasons.add("festival_detected");

  const ambiguousFields = cleanStringArray(raw.ambiguousFields, 20);
  if (ambiguousFields.length > 0) reasons.add("ambiguous_fields");

  return {
    reasons: [...reasons],
    mentions: dedupedMentions,
    eventKind: eventKind || undefined,
    festivalName: festivalName || undefined,
    festivalEditionLabel: cleanString(
      raw.festivalEditionLabel ?? parsedData?.festivalEditionLabel,
      80
    ) || undefined,
    ambiguousFields
  };
}

export function getReviewPriority(signals: ReviewSignals): ReviewPriority {
  if (signals.reasons.includes("possible_duplicate") || signals.reasons.includes("ambiguous_fields")) {
    return "required";
  }
  if (signals.mentions.length > 0 || signals.reasons.length > 0) return "recommended";
  return "normal";
}

export function normalizeSourceText(value: unknown) {
  const text = cleanString(value, 20_000);
  return text || null;
}

export function normalizeIdempotencyKey(value: unknown) {
  const key = cleanString(value, 100);
  return /^[A-Za-z0-9:_-]{8,100}$/.test(key) ? key : null;
}

export function normalizeMentionName(value: string) {
  return value
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
