import type { MetadataRoute } from "next";
import { env } from "@/lib/utils/env";
import { getEvents, getIndexableHistoricalEvents } from "@/lib/queries/events";
import { getSpots } from "@/lib/queries/spots";
import { getAcademies } from "@/lib/queries/academies";
import { getTeachers } from "@/lib/queries/teachers";
import { getFestivals } from "@/lib/queries/festivals";
import { getResources } from "@/lib/queries/resources";
import { publicUrlPath } from "@/lib/site-countries";

const BASE = env.siteUrl;

type DatedEntity = {
  createdAt?: string;
  updatedAt?: string;
};

function entityLastModified(entity: DatedEntity): Date | undefined {
  const value = entity.updatedAt ?? entity.createdAt;
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function latestLastModified(entities: DatedEntity[]): Date | undefined {
  return entities.reduce<Date | undefined>((latest, entity) => {
    const date = entityLastModified(entity);
    if (!date || (latest && latest >= date)) return latest;
    return date;
  }, undefined);
}

function url(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly",
  lastModified?: Date
): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE}${publicUrlPath(path)}`,
    changeFrequency,
    priority,
    ...(lastModified ? { lastModified } : {})
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, historicalEvents, spots, academies, teachers, festivals, resources] = await Promise.allSettled([
    getEvents("es"),
    getIndexableHistoricalEvents("es"),
    getSpots("es"),
    getAcademies("es"),
    getTeachers("es"),
    getFestivals("es"),
    getResources("es")
  ]);

  const publishedEvents = events.status === "fulfilled" ? events.value : [];
  const publishedHistoricalEvents = historicalEvents.status === "fulfilled" ? historicalEvents.value : [];
  const publishedSpots = spots.status === "fulfilled" ? spots.value : [];
  const publishedAcademies = academies.status === "fulfilled" ? academies.value : [];
  const publishedTeachers = teachers.status === "fulfilled" ? teachers.value : [];
  const publishedFestivals = festivals.status === "fulfilled" ? festivals.value : [];
  const publishedResources = resources.status === "fulfilled" ? resources.value : [];

  const eventEntries = publishedEvents
    .filter((event) => event.eventKind !== "festival" && event.eventKind !== "congress")
    .flatMap((event) => {
      const lastModified = entityLastModified(event);
      return [
        url(`/eventos/${event.slug}`, 0.8, "weekly", lastModified),
        url(`/en/events/${event.slug}`, 0.6, "weekly", lastModified)
      ];
    });

  const historicalEventEntries = publishedHistoricalEvents
    .filter((event) => event.eventKind !== "festival" && event.eventKind !== "congress")
    .flatMap((event) => {
      const lastModified = entityLastModified(event);
      return [
        url(`/eventos/${event.slug}`, 0.5, "monthly", lastModified),
        url(`/en/events/${event.slug}`, 0.4, "monthly", lastModified)
      ];
    });

  const spotEntries = publishedSpots.flatMap((spot) => {
    const lastModified = entityLastModified(spot);
    return [
      url(`/lugares/${spot.slug}`, 0.7, "monthly", lastModified),
      url(`/en/spots/${spot.slug}`, 0.5, "monthly", lastModified)
    ];
  });

  const academyEntries = publishedAcademies.flatMap((academy) => {
    const lastModified = entityLastModified(academy);
    return [
      url(`/academias/${academy.slug}`, 0.7, "monthly", lastModified),
      url(`/en/academies/${academy.slug}`, 0.5, "monthly", lastModified)
    ];
  });

  const teacherEntries = publishedTeachers.flatMap((teacher) => {
    const lastModified = entityLastModified(teacher);
    return [
      url(`/artistas/${teacher.slug}`, 0.6, "monthly", lastModified),
      url(`/en/artists/${teacher.slug}`, 0.5, "monthly", lastModified)
    ];
  });

  const festivalEntries = publishedFestivals.flatMap((festival) => {
    const lastModified = entityLastModified(festival);
    return [
      url(`/festivales/${festival.slug}`, 0.8, "weekly", lastModified),
      url(`/en/festivals/${festival.slug}`, 0.7, "weekly", lastModified)
    ];
  });

  const eventsLastModified = latestLastModified([...publishedEvents, ...publishedHistoricalEvents]);
  const festivalsLastModified = latestLastModified(publishedFestivals);
  const spotsLastModified = latestLastModified(publishedSpots);
  const academiesLastModified = latestLastModified(publishedAcademies);
  const teachersLastModified = latestLastModified(publishedTeachers);
  const resourcesLastModified = latestLastModified(publishedResources);
  const homeLastModified = latestLastModified([
    ...publishedEvents,
    ...publishedFestivals,
    ...publishedSpots,
    ...publishedAcademies,
    ...publishedTeachers,
    ...publishedResources
  ]);

  return [
    url("/", 1.0, "daily", homeLastModified),
    url("/en", 0.9, "daily", homeLastModified),
    url("/eventos", 0.9, "daily", eventsLastModified),
    url("/festivales", 0.8, "weekly", festivalsLastModified),
    url("/lugares", 0.8, "weekly", spotsLastModified),
    url("/academias", 0.8, "weekly", academiesLastModified),
    url("/artistas", 0.7, "weekly", teachersLastModified),
    url("/recursos", 0.7, "weekly", resourcesLastModified),
    url("/acerca-de", 0.5, "yearly"),
    url("/legal/terminos", 0.3, "yearly"),
    url("/legal/privacidad", 0.3, "yearly"),
    url("/en/events", 0.7, "daily", eventsLastModified),
    url("/en/festivals", 0.7, "weekly", festivalsLastModified),
    url("/en/spots", 0.6, "weekly", spotsLastModified),
    url("/en/academies", 0.6, "weekly", academiesLastModified),
    url("/en/artists", 0.6, "weekly", teachersLastModified),
    url("/en/resources", 0.6, "weekly", resourcesLastModified),
    url("/en/about", 0.4, "yearly"),
    url("/en/legal/terms", 0.3, "yearly"),
    url("/en/legal/privacy", 0.3, "yearly"),
    ...eventEntries,
    ...historicalEventEntries,
    ...spotEntries,
    ...academyEntries,
    ...teacherEntries,
    ...festivalEntries
  ];
}
