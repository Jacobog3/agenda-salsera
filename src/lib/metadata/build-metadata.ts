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
  | "submitEventDescription"
  | "submitAcademyTitle"
  | "submitAcademyDescription"
  | "submitSpotTitle"
  | "submitSpotDescription";

const DEFAULT_OG_IMAGE = "/images/exploraguate-logo.png";

// Mirrors routing.pathnames but as a plain object to avoid importing next-intl/routing
// in server utilities (causes RSC module-manifest issues).
const PAGE_PATHS: Record<string, { es: string; en: string } | string> = {
  "/": "/",
  "/events": { es: "/eventos", en: "/events" },
  "/spots": { es: "/lugares", en: "/spots" },
  "/academies": { es: "/academias", en: "/academies" },
  "/search": { es: "/buscar", en: "/search" },
  "/submit-event": { es: "/enviar-evento", en: "/submit-event" },
  "/submit-academy": { es: "/enviar-academia", en: "/submit-academy" },
  "/submit-spot": { es: "/enviar-lugar", en: "/submit-spot" },
  "/legal/terms": { es: "/legal/terminos", en: "/legal/terms" },
  "/legal/privacy": { es: "/legal/privacidad", en: "/legal/privacy" }
};

function getLocalizedUrl(pathname: string, locale: Locale, siteUrl: string): string {
  const entry = PAGE_PATHS[pathname];
  let localizedPath: string;
  if (!entry) {
    localizedPath = pathname;
  } else if (typeof entry === "string") {
    localizedPath = entry;
  } else {
    localizedPath = entry[locale];
  }
  const cleanPath = localizedPath === "/" ? "" : localizedPath;
  const prefix = locale === "es" ? "" : "/en";
  return `${siteUrl}${prefix}${cleanPath}`;
}

export async function buildMetadata(
  locale: Locale,
  titleKey: MetadataKey,
  descriptionKey: MetadataKey,
  overrides?: {
    title?: string;
    description?: string;
    image?: string;
    type?: "website" | "article";
    pathname?: string;
  }
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = overrides?.title ?? t(titleKey);
  const description = overrides?.description ?? t(descriptionKey);
  const siteUrl = env.siteUrl;
  const image = overrides?.image ?? DEFAULT_OG_IMAGE;
  const ogImage = image.startsWith("http") ? image : `${siteUrl}${image}`;

  const canonicalUrl = overrides?.pathname
    ? getLocalizedUrl(overrides.pathname, locale, siteUrl)
    : locale === "es"
      ? siteUrl
      : `${siteUrl}/en`;

  const esUrl = overrides?.pathname
    ? getLocalizedUrl(overrides.pathname, "es", siteUrl)
    : siteUrl;

  const enUrl = overrides?.pathname
    ? getLocalizedUrl(overrides.pathname, "en", siteUrl)
    : `${siteUrl}/en`;

  return {
    title: {
      default: title,
      template: `%s | ExploraGuate`
    },
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        es: esUrl,
        en: enUrl
      }
    },
    openGraph: {
      title,
      description,
      siteName: t("siteName"),
      locale,
      type: overrides?.type ?? "website",
      url: canonicalUrl,
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

export function buildDetailMetadata(options: {
  locale: Locale;
  title: string;
  description: string;
  image: string;
  esPath: string;
  enPath: string;
  type?: "website" | "article";
}): Metadata {
  const siteUrl = env.siteUrl;
  const canonical = options.locale === "es"
    ? `${siteUrl}${options.esPath}`
    : `${siteUrl}${options.enPath}`;

  const ogImage = options.image.startsWith("http")
    ? options.image
    : `${siteUrl}${options.image}`;

  const description = options.description.slice(0, 155);

  return {
    title: `${options.title} | ExploraGuate`,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical,
      languages: {
        es: `${siteUrl}${options.esPath}`,
        en: `${siteUrl}${options.enPath}`
      }
    },
    openGraph: {
      title: options.title,
      description,
      siteName: "ExploraGuate",
      locale: options.locale,
      type: options.type ?? "article",
      url: canonical,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: options.title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
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
  return buildDetailMetadata({
    locale,
    title: event.title,
    description: event.description,
    image: event.coverImageUrl,
    esPath: `/eventos/${event.slug}`,
    enPath: `/en/events/${event.slug}`,
    type: "article"
  });
}
