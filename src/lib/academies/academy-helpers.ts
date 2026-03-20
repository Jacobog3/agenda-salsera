import type { ScheduleDay } from "@/types/academy";
import type { DanceStyle } from "@/types/event";

const PRIMARY_STYLES: DanceStyle[] = ["salsa", "bachata", "salsa_bachata", "other"];

const STYLE_TAG_LABELS: Record<string, string> = {
  salsa: "Salsa",
  "salsa on1": "Salsa On1",
  "salsa on 1": "Salsa On1",
  "salsa on2": "Salsa On2",
  "salsa on 2": "Salsa On2",
  bachata: "Bachata",
  mambo: "Mambo",
  chachacha: "Chachachá",
  "cha cha cha": "Chachachá",
  "cha-cha-cha": "Chachachá",
  "lady style": "Lady Style",
  shines: "Shines",
  shine: "Shines",
  bellydance: "Belly Dance",
  "belly dance": "Belly Dance",
  "hip hop": "Hip-Hop",
  "hip-hop": "Hip-Hop",
  reggaeton: "Reggaetón",
  "reggaetón": "Reggaetón",
  "folklore cubano": "Folclore Cubano",
  "folclore cubano": "Folclore Cubano",
  "open class": "Open Class"
};

function parseStringList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry ?? "").trim())
      .filter(Boolean);
  }

  const text = String(value ?? "").trim();
  if (!text) return [];

  return text
    .split(/\n|,|•|\u2022/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function titleCase(raw: string) {
  return raw
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeStyleTagLabel(value: string) {
  const compact = value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/_/g, " ")
    .replace(/\s*\/\s*/g, " / ");
  const key = compact
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return STYLE_TAG_LABELS[key] ?? titleCase(compact.toLowerCase());
}

function styleTagKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isPrimaryDanceStyle(value: string): value is DanceStyle {
  return PRIMARY_STYLES.includes(value as DanceStyle);
}

export function normalizeAcademyStyleTags(value: unknown) {
  const next = parseStringList(value).map(normalizeStyleTagLabel);
  const seen = new Set<string>();

  return next.filter((tag) => {
    const key = styleTagKey(tag);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function inferAcademyPrimaryStyles(styleTags: string[], explicit?: unknown) {
  const result = new Set<DanceStyle>();
  const explicitValues = parseStringList(explicit).filter(isPrimaryDanceStyle);

  for (const style of explicitValues) {
    result.add(style);
  }

  for (const tag of styleTags) {
    const key = styleTagKey(tag);

    if (key.includes("salsa") || key.includes("mambo") || key.includes("chachacha") || key.includes("cha cha cha") || key.includes("lady style") || key.includes("shine")) {
      result.add("salsa");
      continue;
    }

    if (key.includes("bachata")) {
      result.add("bachata");
      continue;
    }

    result.add("other");
  }

  if (result.size === 0 && styleTags.length > 0) {
    result.add("other");
  }

  return PRIMARY_STYLES.filter((style) => result.has(style));
}

function normalizeClassEntry(value: unknown) {
  if (!value || typeof value !== "object") return null;

  const source = value as Record<string, unknown>;
  const time = String(source.time ?? "").trim();
  const name = String(source.name ?? "").trim();
  const level = String(source.level ?? "").trim();

  if (!time || !name) return null;

  return {
    time,
    name,
    ...(level ? { level } : {})
  };
}

function isScheduleClass(
  value: ReturnType<typeof normalizeClassEntry>
): value is NonNullable<ReturnType<typeof normalizeClassEntry>> {
  return Boolean(value);
}

export function normalizeAcademyScheduleData(value: unknown): ScheduleDay[] | null {
  if (!Array.isArray(value)) return null;

  const days = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const source = entry as Record<string, unknown>;
      const day = String(source.day ?? "").trim();
      const classes = Array.isArray(source.classes)
        ? source.classes.map(normalizeClassEntry).filter(isScheduleClass)
        : [];

      if (!day || classes.length === 0) return null;

      return {
        day,
        classes
      } satisfies ScheduleDay;
    })
    .filter((entry): entry is ScheduleDay => Boolean(entry));

  return days.length > 0 ? days : null;
}

function extractTimePoints(time: string) {
  return time.match(/\d{1,2}(?::\d{2})?\s*(?:am|pm)?/gi) ?? [];
}

function buildDaySummary(day: ScheduleDay) {
  const points = day.classes.flatMap((cls) => extractTimePoints(cls.time));

  if (points.length >= 2) {
    return `${day.day}: ${points[0]}-${points[points.length - 1]}`;
  }

  return `${day.day}: ${day.classes.map((cls) => cls.time).join(", ")}`;
}

export function buildAcademyScheduleText(scheduleData: ScheduleDay[] | null | undefined) {
  if (!scheduleData || scheduleData.length === 0) return null;
  return scheduleData.map(buildDaySummary).join(" · ");
}

export function formatAcademySchedulePreview(value: unknown) {
  const scheduleData = normalizeAcademyScheduleData(value);
  if (!scheduleData) return "Vacío";

  return scheduleData
    .map((day) =>
      `${day.day}: ${day.classes.map((cls) => `${cls.time} ${cls.name}${cls.level ? ` (${cls.level})` : ""}`).join("; ")}`
    )
    .join("\n");
}
