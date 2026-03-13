import type { MetadataRoute } from "next";
import { env } from "@/lib/utils/env";
import { getEvents } from "@/lib/queries/events";
import { getSpots } from "@/lib/queries/spots";
import { getAcademies } from "@/lib/queries/academies";

const BASE = env.siteUrl;

function url(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly"
): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, spots, academies] = await Promise.allSettled([
    getEvents("es"),
    getSpots("es"),
    getAcademies("es")
  ]);

  const eventEntries =
    events.status === "fulfilled"
      ? events.value.flatMap((e) => [
          url(`/eventos/${e.slug}`, 0.8, "weekly"),
          url(`/en/events/${e.slug}`, 0.6, "weekly")
        ])
      : [];

  const spotEntries =
    spots.status === "fulfilled"
      ? spots.value.flatMap((s) => [
          url(`/lugares/${s.slug}`, 0.7, "monthly"),
          url(`/en/spots/${s.slug}`, 0.5, "monthly")
        ])
      : [];

  const academyEntries =
    academies.status === "fulfilled"
      ? academies.value.flatMap((a) => [
          url(`/academias/${a.slug}`, 0.7, "monthly"),
          url(`/en/academies/${a.slug}`, 0.5, "monthly")
        ])
      : [];

  return [
    url("/", 1.0, "daily"),
    url("/eventos", 0.9, "daily"),
    url("/lugares", 0.8, "weekly"),
    url("/academias", 0.8, "weekly"),
    url("/enviar-evento", 0.5, "monthly"),
    url("/legal/terminos", 0.3, "yearly"),
    url("/legal/privacidad", 0.3, "yearly"),
    url("/en/events", 0.7, "daily"),
    url("/en/spots", 0.6, "weekly"),
    url("/en/academies", 0.6, "weekly"),
    ...eventEntries,
    ...spotEntries,
    ...academyEntries
  ];
}
