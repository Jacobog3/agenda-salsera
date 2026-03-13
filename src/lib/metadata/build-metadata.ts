import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { env } from "@/lib/utils/env";
import type { Locale } from "@/types/locale";

type MetadataKey =
  | "homeTitle"
  | "homeDescription"
  | "eventsTitle"
  | "eventsDescription"
  | "spotsTitle"
  | "spotsDescription"
  | "academiesTitle"
  | "academiesDescription"
  | "submitEventTitle"
  | "submitEventDescription";

const DEFAULT_OG_IMAGE = "/images/exploraguate-logo.png";

export async function buildMetadata(
  locale: Locale,
  titleKey: MetadataKey,
  descriptionKey: MetadataKey,
  overrides?: {
    title?: string;
    description?: string;
    image?: string;
    type?: "website" | "article";
    canonical?: string;
  }
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = overrides?.title ?? t(titleKey);
  const description = overrides?.description ?? t(descriptionKey);
  const siteUrl = env.siteUrl;
  const image = overrides?.image ?? DEFAULT_OG_IMAGE;
  const ogImage = image.startsWith("http") ? image : `${siteUrl}${image}`;

  return {
    title: {
      default: title,
      template: `%s | ExploraGuate`
    },
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: overrides?.canonical,
      languages: {
        es: `${siteUrl}`,
        en: `${siteUrl}/en`
      }
    },
    openGraph: {
      title,
      description,
      siteName: t("siteName"),
      locale,
      type: overrides?.type ?? "website",
      url: overrides?.canonical ?? siteUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage]
    }
  };
}

export function buildEventMetadata(event: {
  title: string;
  description: string;
  coverImageUrl: string;
  slug: string;
  venueName: string;
  city: string;
  startsAt: string;
  priceAmount?: number | null;
  currency: string;
  organizerName: string;
}, locale: Locale): Metadata {
  const siteUrl = env.siteUrl;
  const canonical = locale === "es"
    ? `${siteUrl}/eventos/${event.slug}`
    : `${siteUrl}/en/events/${event.slug}`;

  const ogImage = event.coverImageUrl.startsWith("http")
    ? event.coverImageUrl
    : `${siteUrl}${event.coverImageUrl}`;

  return {
    title: `${event.title} | ExploraGuate`,
    description: event.description.slice(0, 155),
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical,
      languages: {
        es: `${siteUrl}/eventos/${event.slug}`,
        en: `${siteUrl}/en/events/${event.slug}`
      }
    },
    openGraph: {
      title: event.title,
      description: event.description.slice(0, 155),
      siteName: "ExploraGuate",
      locale,
      type: "article",
      url: canonical,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: event.title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description.slice(0, 155),
      images: [ogImage]
    }
  };
}
