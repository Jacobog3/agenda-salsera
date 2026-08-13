import { getAcademies } from "@/lib/queries/academies";
import { getEvents } from "@/lib/queries/events";
import { getSpots } from "@/lib/queries/spots";
import { getTeachers } from "@/lib/queries/teachers";
import { getResources } from "@/lib/queries/resources";
import { formatEventDate, formatEventDateRange, formatEventDateStatusLabel } from "@/lib/utils/formatters";
import { formatLocation, getCountryName } from "@/lib/locations";
import type { Locale } from "@/types/locale";
import { publicUrlPath } from "@/lib/site-countries";
import type { SiteCountrySlug } from "@/lib/site-countries";
import { getCurrentSiteCountry } from "@/lib/site-country-server";

export type SearchResultType = "event" | "spot" | "academy" | "teacher" | "resource";

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
  resources: SearchResult[];
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

function localizedHref(locale: Locale, type: SearchResultType, slug: string, country: SiteCountrySlug) {
  const prefix = locale === "es" ? "" : "/en";

  switch (type) {
    case "event":
      return publicUrlPath(`${prefix}${locale === "es" ? "/eventos" : "/events"}/${slug}`, country);
    case "spot":
      return publicUrlPath(`${prefix}${locale === "es" ? "/lugares" : "/spots"}/${slug}`, country);
    case "academy":
      return publicUrlPath(`${prefix}${locale === "es" ? "/academias" : "/academies"}/${slug}`, country);
    case "teacher":
      return publicUrlPath(`${prefix}${locale === "es" ? "/artistas" : "/artists"}/${slug}`, country);
    case "resource":
      return `${publicUrlPath(`${prefix}${locale === "es" ? "/recursos" : "/resources"}`, country)}#${slug}`;
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
  const country = await getCurrentSiteCountry();

  if (!normalizedQuery || tokens.length === 0) {
    return {
      query,
      total: 0,
      events: [],
      spots: [],
      academies: [],
      teachers: [],
      resources: []
    };
  }

  const [events, spots, academies, teachers, resources] = await Promise.all([
    getEvents(locale),
    getSpots(locale),
    getAcademies(locale),
    getTeachers(locale),
    getResources(locale)
  ]);

  const eventResults = sortResults(
    events
      .map((event) => {
        const score = scoreCandidate(
          tokens,
          normalizedQuery,
          [event.title, event.venueName, event.city, getCountryName(event.countryCode, locale)],
          [event.description, event.area ?? "", event.address ?? "", event.organizerName, event.danceStyle]
        );

        if (score === null) return null;

        const isRange =
          !!event.startsAt &&
          !!event.endsAt &&
          new Date(event.endsAt).toDateString() !== new Date(event.startsAt).toDateString();
        const meta = event.startsAt
          ? isRange
            ? formatEventDateRange(event.startsAt, event.endsAt!, locale, event.timeZone)
            : formatEventDate(event.startsAt, locale, event.timeZone)
          : formatEventDateStatusLabel(event.dateLabel, locale);

        return {
          id: event.id,
          type: "event" as const,
          title: event.title,
          href: localizedHref(locale, "event", event.slug, country.slug),
          subtitle: `${event.venueName} · ${formatLocation(event.city, event.countryCode, locale)}`,
          description: event.description,
          imageUrl: event.coverImageUrl,
          badges: [event.danceStyle],
          meta,
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
          [spot.name, spot.city, getCountryName(spot.countryCode, locale)],
          [spot.description, spot.area ?? "", spot.address ?? "", spot.schedule]
        );

        if (score === null) return null;

        return {
          id: spot.id,
          type: "spot" as const,
          title: spot.name,
          href: localizedHref(locale, "spot", spot.slug, country.slug),
          subtitle: formatLocation(spot.city, spot.countryCode, locale),
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
          [academy.name, academy.city, getCountryName(academy.countryCode, locale)],
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
          href: localizedHref(locale, "academy", academy.slug, country.slug),
          subtitle: formatLocation(academy.city, academy.countryCode, locale),
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
          [teacher.name, teacher.city, getCountryName(teacher.countryCode, locale)],
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
          href: localizedHref(locale, "teacher", teacher.slug, country.slug),
          subtitle: formatLocation(teacher.city, teacher.countryCode, locale),
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

  const resourceResults = sortResults(
    resources.map((resource) => {
      const score = scoreCandidate(
        tokens,
        normalizedQuery,
        [resource.name, resource.city ?? "", getCountryName(resource.countryCode ?? "", locale)],
        [resource.description, resource.categories.join(" "), resource.resourceKind]
      );

      if (score === null) return null;

      return {
        id: resource.id,
        type: "resource" as const,
        title: resource.name,
        href: localizedHref(locale, "resource", resource.slug, country.slug),
        subtitle: resource.city || resource.countryCode
          ? formatLocation(resource.city ?? "", resource.countryCode ?? "", locale)
          : resource.instagramUrl?.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "") ?? "",
        description: resource.description,
        imageUrl: resource.imageUrl ?? resource.teacherImageUrl ?? null,
        badges: resource.categories,
        meta: null,
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
      teacherResults.length +
      resourceResults.length,
    events: eventResults,
    spots: spotResults,
    academies: academyResults,
    teachers: teacherResults,
    resources: resourceResults
  };
}
