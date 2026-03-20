import { getAcademies } from "@/lib/queries/academies";
import { getEvents } from "@/lib/queries/events";
import { getSpots } from "@/lib/queries/spots";
import { getTeachers } from "@/lib/queries/teachers";
import { formatEventDate, formatEventDateRange } from "@/lib/utils/formatters";
import type { Locale } from "@/types/locale";

export type SearchResultType = "event" | "spot" | "academy" | "teacher";

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  href: string;
  subtitle: string;
  description: string;
  imageUrl: string | null;
  badges: string[];
  meta: string | null;
  score: number;
};

export type SearchResults = {
  query: string;
  total: number;
  events: SearchResult[];
  spots: SearchResult[];
  academies: SearchResult[];
  teachers: SearchResult[];
};

const MAX_RESULTS_PER_GROUP = 6;

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_./-]+/g, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeQuery(query: string) {
  return normalizeSearchText(query)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

function localizedHref(locale: Locale, type: SearchResultType, slug: string) {
  const prefix = locale === "es" ? "" : "/en";

  switch (type) {
    case "event":
      return `${prefix}${locale === "es" ? "/eventos" : "/events"}/${slug}`;
    case "spot":
      return `${prefix}${locale === "es" ? "/lugares" : "/spots"}/${slug}`;
    case "academy":
      return `${prefix}${locale === "es" ? "/academias" : "/academies"}/${slug}`;
    case "teacher":
      return `${prefix}${locale === "es" ? "/maestros" : "/teachers"}/${slug}`;
  }
}

function scoreCandidate(
  tokens: string[],
  query: string,
  primaryFields: string[],
  secondaryFields: string[]
) {
  const primary = normalizeSearchText(primaryFields.join(" "));
  const secondary = normalizeSearchText(secondaryFields.join(" "));
  const combined = `${primary} ${secondary}`.trim();

  if (!combined) return null;

  let score = 0;

  for (const token of tokens) {
    if (primary.includes(token)) {
      score += primary.startsWith(token) ? 28 : 18;
      continue;
    }

    if (secondary.includes(token)) {
      score += 10;
      continue;
    }

    if (combined.includes(token)) {
      score += 5;
      continue;
    }

    return null;
  }

  if (primary === query) score += 40;
  else if (primary.startsWith(query)) score += 26;
  else if (primary.includes(query)) score += 18;

  return score;
}

function sortResults(results: Array<SearchResult | null>) {
  return results
    .filter((item): item is SearchResult => Boolean(item))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, MAX_RESULTS_PER_GROUP);
}

export async function searchSite(locale: Locale, rawQuery: string): Promise<SearchResults> {
  const query = rawQuery.trim();
  const normalizedQuery = normalizeSearchText(query);
  const tokens = tokenizeQuery(query);

  if (!normalizedQuery || tokens.length === 0) {
    return {
      query,
      total: 0,
      events: [],
      spots: [],
      academies: [],
      teachers: []
    };
  }

  const [events, spots, academies, teachers] = await Promise.all([
    getEvents(locale),
    getSpots(locale),
    getAcademies(locale),
    getTeachers(locale)
  ]);

  const eventResults = sortResults(
    events
      .map((event) => {
        const score = scoreCandidate(
          tokens,
          normalizedQuery,
          [event.title, event.venueName, event.city],
          [event.description, event.area ?? "", event.address ?? "", event.organizerName, event.danceStyle]
        );

        if (score === null) return null;

        const isRange =
          !!event.endsAt &&
          new Date(event.endsAt).toDateString() !== new Date(event.startsAt).toDateString();

        return {
          id: event.id,
          type: "event" as const,
          title: event.title,
          href: localizedHref(locale, "event", event.slug),
          subtitle: `${event.venueName} · ${event.city}`,
          description: event.description,
          imageUrl: event.coverImageUrl,
          badges: [event.danceStyle],
          meta: isRange
            ? formatEventDateRange(event.startsAt, event.endsAt!, locale)
            : formatEventDate(event.startsAt, locale),
          score
        };
      })
  );

  const spotResults = sortResults(
    spots
      .map((spot) => {
        const score = scoreCandidate(
          tokens,
          normalizedQuery,
          [spot.name, spot.city],
          [spot.description, spot.area ?? "", spot.address ?? "", spot.schedule]
        );

        if (score === null) return null;

        return {
          id: spot.id,
          type: "spot" as const,
          title: spot.name,
          href: localizedHref(locale, "spot", spot.slug),
          subtitle: spot.city,
          description: spot.description,
          imageUrl: spot.coverImageUrl,
          badges: [],
          meta: spot.schedule || null,
          score
        };
      })
  );

  const academyResults = sortResults(
    academies
      .map((academy) => {
        const score = scoreCandidate(
          tokens,
          normalizedQuery,
          [academy.name, academy.city],
          [
            academy.description,
            academy.area ?? "",
            academy.address ?? "",
            academy.levels ?? "",
            academy.stylesTaught.join(" "),
            academy.styleTags?.join(" ") ?? "",
            academy.scheduleText ?? ""
          ]
        );

        if (score === null) return null;

        return {
          id: academy.id,
          type: "academy" as const,
          title: academy.name,
          href: localizedHref(locale, "academy", academy.slug),
          subtitle: academy.city,
          description: academy.description,
          imageUrl: academy.coverImageUrl,
          badges: academy.styleTags && academy.styleTags.length > 0
            ? academy.styleTags.slice(0, 4)
            : academy.stylesTaught,
          meta: academy.scheduleText || academy.levels || null,
          score
        };
      })
  );

  const teacherResults = sortResults(
    teachers
      .map((teacher) => {
        const score = scoreCandidate(
          tokens,
          normalizedQuery,
          [teacher.name, teacher.city],
          [
            teacher.bio,
            teacher.area ?? "",
            teacher.address ?? "",
            teacher.levels ?? "",
            teacher.stylesTaught.join(" "),
            teacher.styleTags?.join(" ") ?? "",
            teacher.classFormats?.join(" ") ?? "",
            teacher.teachingVenues?.join(" ") ?? "",
            teacher.teachingZones?.join(" ") ?? "",
            teacher.scheduleText ?? ""
          ]
        );

        if (score === null) return null;

        const meta =
          teacher.classFormats?.slice(0, 2).join(" · ") ||
          teacher.levels ||
          null;

        return {
          id: teacher.id,
          type: "teacher" as const,
          title: teacher.name,
          href: localizedHref(locale, "teacher", teacher.slug),
          subtitle: teacher.city,
          description: teacher.bio,
          imageUrl: teacher.profileImageUrl ?? null,
          badges: teacher.styleTags && teacher.styleTags.length > 0
            ? teacher.styleTags.slice(0, 4)
            : teacher.stylesTaught,
          meta,
          score
        };
      })
  );

  return {
    query,
    total:
      eventResults.length +
      spotResults.length +
      academyResults.length +
      teacherResults.length,
    events: eventResults,
    spots: spotResults,
    academies: academyResults,
    teachers: teacherResults
  };
}
