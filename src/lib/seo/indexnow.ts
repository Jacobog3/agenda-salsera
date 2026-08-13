import { env } from "@/lib/utils/env";
import { publicUrlPath } from "@/lib/site-countries";

const INDEXNOW_KEY = "81d6ddf222834d9bbb881b65f9dfd8f0";
const INDEXNOW_KEY_FILE = `${INDEXNOW_KEY}.txt`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

type EntityType = "event" | "academy" | "teacher" | "spot";

function getSiteHost() {
  return new URL(env.siteUrl).host;
}

function getKeyLocation() {
  return `${env.siteUrl}/${INDEXNOW_KEY_FILE}`;
}

function buildEntityUrls(type: EntityType, slug: string): string[] {
  switch (type) {
    case "event":
      return [
        `${env.siteUrl}${publicUrlPath(`/eventos/${slug}`)}`,
        `${env.siteUrl}${publicUrlPath(`/en/events/${slug}`)}`,
        `${env.siteUrl}${publicUrlPath("/eventos")}`,
        `${env.siteUrl}${publicUrlPath("/en/events")}`
      ];
    case "academy":
      return [
        `${env.siteUrl}${publicUrlPath(`/academias/${slug}`)}`,
        `${env.siteUrl}${publicUrlPath(`/en/academies/${slug}`)}`,
        `${env.siteUrl}${publicUrlPath("/academias")}`,
        `${env.siteUrl}${publicUrlPath("/en/academies")}`
      ];
    case "teacher":
      return [
        `${env.siteUrl}${publicUrlPath(`/artistas/${slug}`)}`,
        `${env.siteUrl}${publicUrlPath(`/en/artists/${slug}`)}`,
        `${env.siteUrl}${publicUrlPath("/artistas")}`,
        `${env.siteUrl}${publicUrlPath("/en/artists")}`
      ];
    case "spot":
      return [
        `${env.siteUrl}${publicUrlPath(`/lugares/${slug}`)}`,
        `${env.siteUrl}${publicUrlPath(`/en/spots/${slug}`)}`,
        `${env.siteUrl}${publicUrlPath("/lugares")}`,
        `${env.siteUrl}${publicUrlPath("/en/spots")}`
      ];
  }
}

export async function submitIndexNowUrls(rawUrls: (string | null | undefined)[]) {
  const urls = Array.from(new Set(rawUrls.filter(Boolean).map((url) => String(url))));

  if (urls.length === 0) return;

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        host: getSiteHost(),
        key: INDEXNOW_KEY,
        keyLocation: getKeyLocation(),
        urlList: urls
      })
    });

    if (!response.ok) {
      console.error("[indexnow] Failed:", response.status, await response.text());
    }
  } catch (error) {
    console.error("[indexnow] Request error:", error);
  }
}

export async function submitIndexNowEntity(options: {
  type: EntityType;
  slug?: string | null;
  previousSlug?: string | null;
}) {
  const urls = [
    ...(options.slug ? buildEntityUrls(options.type, options.slug) : []),
    ...(options.previousSlug && options.previousSlug !== options.slug
      ? buildEntityUrls(options.type, options.previousSlug)
      : [])
  ];

  await submitIndexNowUrls(urls);
}
