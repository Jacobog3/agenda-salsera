import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/shared/container";
import { ReportForm } from "@/components/shared/report-form";
import { EventImageGallery } from "@/components/events/event-image-gallery";
import { getEventBySlug } from "@/lib/queries/events";
import { buildEventMetadata } from "@/lib/metadata/build-metadata";
import { formatCurrency, formatEventDateTime, formatEventDateRange } from "@/lib/utils/formatters";
import { Calendar, MapPin, User, Banknote, Globe, ExternalLink } from "lucide-react";
import { env } from "@/lib/utils/env";
import type { Locale } from "@/types/locale";

function EventDescription({ text }: { text: string }) {
  const blocks = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4 text-justify text-sm leading-relaxed text-muted-foreground md:text-lg md:leading-8">
      {blocks.map((block, blockIndex) => {
        const lines = block
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        if (lines.length === 0) return null;

        const bulletLines = lines.filter((line) => /^[-*•]\s+/.test(line));
        const isPureList = bulletLines.length === lines.length;

        if (isPureList) {
          return (
            <ul key={blockIndex} className="space-y-1.5 pl-5 marker:text-brand-500">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{line.replace(/^[-*•]\s+/, "")}</li>
              ))}
            </ul>
          );
        }

        if (bulletLines.length > 0 && !/^[-*•]\s+/.test(lines[0])) {
          const intro = lines.findIndex((line) => /^[-*•]\s+/.test(line));
          const introLines = lines.slice(0, intro);
          const listLines = lines.slice(intro);

          return (
            <div key={blockIndex} className="space-y-2">
              <p>{introLines.join(" ")}</p>
              <ul className="space-y-1.5 pl-5 marker:text-brand-500">
                {listLines.map((line, lineIndex) => (
                  <li key={lineIndex}>{line.replace(/^[-*•]\s+/, "")}</li>
                ))}
              </ul>
            </div>
          );
        }

        return <p key={blockIndex}>{lines.join(" ")}</p>;
      })}
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function getContactInfo(url: string) {
  if (!url) return null;
  if (url.includes("wa.me") || url.includes("whatsapp")) {
    return { icon: <WhatsAppIcon className="h-4 w-4" />, label: "WhatsApp" };
  }
  if (url.includes("instagram.com")) {
    return { icon: <InstagramIcon className="h-4 w-4" />, label: "Instagram" };
  }
  if (url.includes("ticket") || url.includes("entradas")) {
    return { icon: <ExternalLink className="h-4 w-4" />, label: "Tickets" };
  }
  return { icon: <Globe className="h-4 w-4" />, label: "Web" };
}

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

  const isLongEvent =
    !!event.endsAt &&
    new Date(event.endsAt).toDateString() !== new Date(event.startsAt).toDateString();

  return (
    <>
      <EventJsonLd event={event} siteUrl={env.siteUrl} locale={currentLocale} />

      <section className="page-section pb-24 md:pb-16">
        <Container>
          <EventImageGallery
            coverImageUrl={event.coverImageUrl}
            galleryUrls={event.galleryUrls}
            alt={event.title}
          />

          <div className="mt-4 grid gap-5 md:mt-8 md:grid-cols-[1.2fr_0.8fr] md:gap-10">
            <div className="space-y-3 md:space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>{common(`danceStyles.${event.danceStyle}`)}</Badge>
                {isLongEvent ? <Badge>{common("longEvent")}</Badge> : null}
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                {event.title}
              </h1>
              <EventDescription text={event.description} />
            </div>

            <aside className="rounded-2xl bg-surface-soft p-4 md:rounded-3xl md:p-6">
              <div className="grid gap-3 md:gap-4">
                <InfoRow icon={Calendar} label={common("date")}>
                  {isLongEvent
                    ? formatEventDateRange(event.startsAt, event.endsAt!, currentLocale)
                    : formatEventDateTime(event.startsAt, currentLocale)}
                </InfoRow>
                {isLongEvent ? (
                  <InfoRow icon={Calendar} label={common("duration")}>
                    <span className="block">
                      <strong>{common("starts")}:</strong> {formatEventDateTime(event.startsAt, currentLocale)}
                    </span>
                    <span className="mt-1 block">
                      <strong>{common("ends")}:</strong> {formatEventDateTime(event.endsAt!, currentLocale)}
                    </span>
                  </InfoRow>
                ) : null}
                <InfoRow icon={MapPin} label={common("location")}>
                  <span>{event.venueName}</span>
                  {event.address ? (
                    <span className="block text-muted-foreground">{event.address}</span>
                  ) : null}
                  <span className="block text-muted-foreground">{event.city}</span>
                </InfoRow>
                <InfoRow icon={Banknote} label={common("price")}>
                  {(() => {
                    const text = event.priceText;
                    if (!text) return formatCurrency(event.priceAmount, event.currency, currentLocale);
                    const parts = text.split(/[·\-|]/).map((s) => s.trim()).filter(Boolean);
                    if (parts.length <= 1) return text;
                    return (
                      <div className="space-y-1">
                        {parts.map((segment, i) => (
                          <p key={i} className="flex items-baseline gap-1.5">
                            <span className="inline-block h-1 w-1 shrink-0 translate-y-[-1px] rounded-full bg-brand-400" />
                            {segment}
                          </p>
                        ))}
                      </div>
                    );
                  })()}
                </InfoRow>
                <InfoRow icon={User} label={common("organizer")}>
                  {event.organizerName}
                </InfoRow>
              </div>
              {event.contactUrl && (() => {
                const info = getContactInfo(event.contactUrl);
                if (!info) return null;
                return (
                  <a
                    href={event.contactUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex items-center gap-2 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 md:mt-5"
                  >
                    {info.icon}
                    {info.label}
                  </a>
                );
              })()}
            </aside>
          </div>

          <div className="mt-8 flex justify-center border-t border-gray-100 pt-4 md:mt-10">
            <ReportForm entityType="event" entityId={event.id} />
          </div>
        </Container>
      </section>
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
