import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/shared/container";
import { AcademySchedule } from "@/components/academies/academy-schedule";
import { ContactIconLinks } from "@/components/shared/contact-icon-links";
import { EventCard } from "@/components/events/event-card";
import { ReportForm } from "@/components/shared/report-form";
import { buildDetailMetadata } from "@/lib/metadata/build-metadata";
import { env } from "@/lib/utils/env";
import { getAcademyBySlug } from "@/lib/queries/academies";
import { getFeaturedEvents } from "@/lib/queries/events";
import {
  MapPin,
  Music,
  CheckCircle2,
  GraduationCap,
  MessageCircle
} from "lucide-react";
import type { Locale } from "@/types/locale";

const MODALITY_MAP: Record<string, "inPerson" | "online" | "hybrid"> = {
  presencial: "inPerson",
  online: "online",
  mixto: "hybrid"
};

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const academy = await getAcademyBySlug(locale as Locale, slug);

  if (!academy) return {};

  const title = locale === "es"
    ? `${academy.name} | Academia de baile en ${academy.city}`
    : `${academy.name} | Dance academy in ${academy.city}`;

  return buildDetailMetadata({
    locale: locale as Locale,
    title,
    description: academy.description,
    image: academy.coverImageUrl,
    esPath: `/academias/${academy.slug}`,
    enPath: `/en/academies/${academy.slug}`,
    type: "article"
  });
}

function AcademyJsonLd({
  academy,
  locale
}: {
  academy: {
    name: string;
    description: string;
    coverImageUrl: string;
    slug: string;
    city: string;
    address?: string | null;
    stylesTaught: string[];
    websiteUrl?: string | null;
    instagramUrl?: string | null;
    whatsappUrl?: string | null;
  };
  locale: Locale;
}) {
  const siteUrl = env.siteUrl;
  const pageUrl = locale === "es"
    ? `${siteUrl}/academias/${academy.slug}`
    : `${siteUrl}/en/academies/${academy.slug}`;

  const imageUrl = academy.coverImageUrl.startsWith("http")
    ? academy.coverImageUrl
    : `${siteUrl}${academy.coverImageUrl}`;

  const sameAs = [academy.websiteUrl, academy.instagramUrl, academy.whatsappUrl].filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: academy.name,
    description: academy.description,
    url: pageUrl,
    image: imageUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: academy.address ?? academy.city,
      addressLocality: academy.city,
      addressCountry: "GT"
    },
    areaServed: "Guatemala",
    knowsAbout: academy.stylesTaught,
    ...(sameAs.length > 0 ? { sameAs } : {})
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function AcademyDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const currentLocale = locale as Locale;
  const t = await getTranslations({ locale: currentLocale, namespace: "academies" });
  const common = await getTranslations({ locale: currentLocale, namespace: "common" });
  const academy = await getAcademyBySlug(currentLocale, slug);
  const relatedEvents = await getFeaturedEvents(currentLocale);

  if (!academy) notFound();

  const hasBanner = !!academy.bannerImageUrl;
  const socialLinks = [
    academy.whatsappUrl ? { href: academy.whatsappUrl, label: common("whatsapp"), type: "whatsapp" as const } : null,
    academy.instagramUrl ? { href: academy.instagramUrl, label: common("instagram"), type: "instagram" as const } : null,
    academy.websiteUrl ? { href: academy.websiteUrl, label: common("website"), type: "website" as const } : null
  ].filter(Boolean) as { href: string; label: string; type: "whatsapp" | "instagram" | "website" }[];

  return (
    <>
      <AcademyJsonLd academy={academy} locale={currentLocale} />

      <section className="page-section">
        <Container>

          {/* ── Facebook-style header ── */}
          <div className="overflow-hidden rounded-2xl border border-border bg-white md:rounded-3xl">
            {/* Banner */}
            <div className={`relative w-full bg-gradient-to-r from-brand-600 to-brand-800 ${hasBanner ? "aspect-[2.5/1] md:aspect-[3.5/1]" : "h-28 md:h-36"}`}>
              {hasBanner && (
                <Image
                  src={academy.bannerImageUrl!}
                  alt={`${academy.name} banner`}
                  fill
                  className="object-cover"
                  priority
                />
              )}
            </div>

            {/* Profile row */}
            <div className="relative px-4 pb-4 pt-0 md:px-6 md:pb-5">
              {/* Logo */}
              <div className="-mt-10 mb-3 md:-mt-12">
                <div className="inline-block h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md md:h-24 md:w-24 md:rounded-3xl">
                  <Image
                    src={academy.coverImageUrl}
                    alt={academy.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              {/* Name + meta */}
              <h1 className="font-display text-xl font-bold tracking-tight md:text-3xl">
                {academy.name}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {academy.city}
                </span>
                <span className="flex items-center gap-1">
                  <Music className="h-3.5 w-3.5" />
                  {academy.stylesTaught.map((s) => common(`danceStyles.${s}`)).join(", ")}
                </span>
              </div>

              {/* Badges + social links */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {academy.stylesTaught.map((style) => (
                  <Badge key={style} variant="accent" className="text-[10px] md:text-xs">
                    {common(`danceStyles.${style}`)}
                  </Badge>
                ))}
                {academy.trialClass && (
                  <Badge variant="outline" className="gap-1 border-green-200 bg-green-50 text-[10px] text-green-700 md:text-xs">
                    <CheckCircle2 className="h-3 w-3" />
                    {t("trialClassLabel")}
                  </Badge>
                )}
              </div>

            </div>
          </div>

          {/* ── Content grid ── */}
          <div className="mt-6 grid gap-6 md:mt-8 md:grid-cols-[1fr_320px] md:gap-8">

            {/* Main column */}
            <div className="space-y-8">

              {/* Description */}
              <div className="space-y-2">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight md:text-xl">
                  <GraduationCap className="h-5 w-5 text-brand-600" />
                  {t("descriptionTitle")}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground md:text-base md:leading-7">
                  {academy.description}
                </p>
              </div>

              {/* Schedule */}
              {academy.scheduleData && academy.scheduleData.length > 0 && (
                <AcademySchedule
                  schedule={academy.scheduleData}
                  title={t("scheduleTitle")}
                />
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-4 md:space-y-5">

              {/* Details card */}
              <div className="rounded-2xl border border-border bg-white p-4 md:p-5">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {t("detailsTitle")}
                </h3>
                <dl className="space-y-3 text-sm">
                  {academy.levels && (
                    <div>
                      <dt className="font-semibold text-foreground">{t("levelsLabel")}</dt>
                      <dd className="mt-0.5 text-muted-foreground">{academy.levels}</dd>
                    </div>
                  )}
                  {academy.modality && (
                    <div>
                      <dt className="font-semibold text-foreground">{t("modalityLabel")}</dt>
                      <dd className="mt-0.5 text-muted-foreground">
                        {t(MODALITY_MAP[academy.modality] ?? "inPerson")}
                      </dd>
                    </div>
                  )}
                  {academy.scheduleText && (
                    <div>
                      <dt className="font-semibold text-foreground">{t("scheduleTitle")}</dt>
                      <dd className="mt-1.5 space-y-1 text-muted-foreground">
                        {academy.scheduleText.split("·").map((segment, i) => (
                          <p key={i} className="flex items-baseline gap-1.5 text-xs leading-relaxed md:text-sm">
                            <span className="inline-block h-1 w-1 shrink-0 translate-y-[-1px] rounded-full bg-brand-400" />
                            {segment.trim()}
                          </p>
                        ))}
                      </dd>
                    </div>
                  )}
                  {academy.trialClass && (
                    <div className="flex items-center gap-1.5 text-green-700">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{t("trialClassYes")}</span>
                    </div>
                  )}
                </dl>
              </div>

              {/* Location card */}
              <div className="rounded-2xl border border-border bg-white p-4 md:p-5">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {t("locationTitle")}
                </h3>
                <div className="text-sm text-foreground">
                  {academy.address && <p>{academy.address}</p>}
                  <p className="text-muted-foreground">{academy.city}</p>
                </div>
              </div>

              {/* Contact card */}
              {socialLinks.length > 0 && (
                <div className="rounded-2xl border border-border bg-white p-4 md:p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {t("contactTitle")}
                  </h3>
                  <ContactIconLinks links={socialLinks} />
                </div>
              )}

            </aside>
          </div>

          {/* Related events */}
          {relatedEvents.length > 0 && (
            <div className="mt-10 md:mt-14">
              <h2 className="section-title mb-4 md:mb-5">
                {common("relatedEvents")}
              </h2>
              <div className="grid gap-3 md:grid-cols-3 md:gap-6">
                {relatedEvents.slice(0, 3).map((event) => (
                  <EventCard key={event.id} event={event} locale={currentLocale} />
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-center border-t border-gray-100 pt-4 md:mt-10">
            <ReportForm entityType="academy" entityId={academy.id} />
          </div>
        </Container>
      </section>

    </>
  );
}
