import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/shared/container";
import { getEventBySlug } from "@/lib/queries/events";
import { buildEventMetadata } from "@/lib/metadata/build-metadata";
import { formatCurrency, formatEventDateTime } from "@/lib/utils/formatters";
import { Calendar, MapPin, User, Banknote } from "lucide-react";
import { env } from "@/lib/utils/env";
import type { Locale } from "@/types/locale";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const event = await getEventBySlug(locale as Locale, slug);
  if (!event) return {};
  return buildEventMetadata(event, locale as Locale);
}

function EventJsonLd({ event, siteUrl, locale }: {
  event: {
    title: string;
    description: string;
    coverImageUrl: string;
    slug: string;
    venueName: string;
    address?: string | null;
    city: string;
    startsAt: string;
    priceAmount?: number | null;
    currency: string;
    organizerName: string;
  };
  siteUrl: string;
  locale: Locale;
}) {
  const eventUrl = locale === "es"
    ? `${siteUrl}/eventos/${event.slug}`
    : `${siteUrl}/en/events/${event.slug}`;

  const ogImage = event.coverImageUrl.startsWith("http")
    ? event.coverImageUrl
    : `${siteUrl}${event.coverImageUrl}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    url: eventUrl,
    image: ogImage,
    startDate: event.startsAt,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venueName,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.address ?? event.venueName,
        addressLocality: event.city,
        addressCountry: "GT"
      }
    },
    organizer: {
      "@type": "Organization",
      name: event.organizerName
    },
    ...(event.priceAmount != null && {
      offers: {
        "@type": "Offer",
        price: event.priceAmount,
        priceCurrency: event.currency,
        availability: "https://schema.org/InStock",
        url: eventUrl
      }
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function EventDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const currentLocale = locale as Locale;
  const t = await getTranslations({ locale: currentLocale, namespace: "events" });
  const common = await getTranslations({ locale: currentLocale, namespace: "common" });
  const event = await getEventBySlug(currentLocale, slug);

  if (!event) {
    notFound();
  }

  return (
    <>
      <EventJsonLd event={event} siteUrl={env.siteUrl} locale={currentLocale} />

      <section className="page-section pb-24 md:pb-16">
        <Container>
          <div className="overflow-hidden rounded-2xl md:rounded-3xl">
            <div className="relative aspect-[2/1] md:aspect-[21/9]">
              <Image
                src={event.coverImageUrl}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="mt-4 grid gap-5 md:mt-8 md:grid-cols-[1.2fr_0.8fr] md:gap-10">
            <div className="space-y-3 md:space-y-4">
              <Badge>{common(`danceStyles.${event.danceStyle}`)}</Badge>
              <h1 className="font-display text-2xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                {event.title}
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-lg md:leading-8">
                {event.description}
              </p>
            </div>

            <aside className="rounded-2xl bg-surface-soft p-4 md:rounded-3xl md:p-6">
              <div className="grid gap-3 md:gap-4">
                <InfoRow icon={Calendar} label={common("date")}>
                  {formatEventDateTime(event.startsAt, currentLocale)}
                </InfoRow>
                <InfoRow icon={MapPin} label={common("location")}>
                  <span>{event.venueName}</span>
                  {event.address ? (
                    <span className="block text-muted-foreground">{event.address}</span>
                  ) : null}
                  <span className="block text-muted-foreground">{event.city}</span>
                </InfoRow>
                <InfoRow icon={Banknote} label={common("price")}>
                  {formatCurrency(event.priceAmount, event.currency, currentLocale)}
                </InfoRow>
                <InfoRow icon={User} label={common("organizer")}>
                  {event.organizerName}
                </InfoRow>
              </div>
              <Button asChild size="lg" className="mt-5 w-full md:mt-6">
                <a href={event.contactUrl} target="_blank" rel="noreferrer">
                  {t("detailCta")}
                </a>
              </Button>
            </aside>
          </div>
        </Container>
      </section>

      <div className="fixed inset-x-0 bottom-[76px] z-30 border-t border-black/[0.06] bg-white/95 p-3 backdrop-blur-xl md:hidden">
        <Button asChild size="lg" className="w-full">
          <a href={event.contactUrl} target="_blank" rel="noreferrer">
            {t("detailCta")}
          </a>
        </Button>
      </div>
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children
}: {
  icon: typeof Calendar;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 md:h-9 md:w-9 md:rounded-xl">
        <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
      </div>
      <div className="text-xs md:text-sm">
        <p className="font-semibold text-foreground">{label}</p>
        <div className="mt-0.5 text-foreground/70">{children}</div>
      </div>
    </div>
  );
}
