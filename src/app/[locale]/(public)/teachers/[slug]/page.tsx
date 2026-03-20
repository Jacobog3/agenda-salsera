import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  MapPin,
  MessageCircle,
  Music,
  Phone
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/shared/container";
import { ContactIconLinks } from "@/components/shared/contact-icon-links";
import { ReportForm } from "@/components/shared/report-form";
import { AcademyCard } from "@/components/academies/academy-card";
import { AcademySchedule } from "@/components/academies/academy-schedule";
import { EventCard } from "@/components/events/event-card";
import { buildDetailMetadata } from "@/lib/metadata/build-metadata";
import { isPrimaryDanceStyle } from "@/lib/academies/academy-helpers";
import {
  getAcademiesForTeacher,
  getEventsForTeacher
} from "@/lib/queries/relations";
import { getTeacherBySlug } from "@/lib/queries/teachers";
import { env } from "@/lib/utils/env";
import type { Locale } from "@/types/locale";

const MODALITY_MAP: Record<string, "inPerson" | "online" | "hybrid"> = {
  presencial: "inPerson",
  online: "online",
  mixto: "hybrid"
};

function buildTeacherDescription({
  teacher,
  locale,
  styleLabels
}: {
  teacher: NonNullable<Awaited<ReturnType<typeof getTeacherBySlug>>>;
  locale: Locale;
  styleLabels: string[];
}): string {
  if (teacher.bio && teacher.bio.trim().length >= 80) {
    return teacher.bio.trim();
  }

  const styles = styleLabels.join(locale === "es" ? " y " : " and ");
  const formats = teacher.classFormats?.join(locale === "es" ? " y " : " and ");
  const levels = teacher.levels?.trim();

  if (locale === "es") {
    const parts = [
      styles ? `Clases de ${styles}` : "Clases de baile",
      teacher.city ? `en ${teacher.city}` : null,
      formats ? `con formato de ${formats}` : null,
      levels ? `para nivel ${levels}` : null
    ].filter(Boolean);

    return `${parts.join(" ")}.`.replace(/\s+\./g, ".");
  }

  const parts = [
    styles ? `${styles} classes` : "Dance classes",
    teacher.city ? `in ${teacher.city}` : null,
    formats ? `with ${formats} formats` : null,
    levels ? `for ${levels} level students` : null
  ].filter(Boolean);

  return `${parts.join(" ")}.`.replace(/\s+\./g, ".");
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const currentLocale = locale as Locale;
  const teacher = await getTeacherBySlug(currentLocale, slug);

  if (!teacher) return {};

  const common = await getTranslations({ locale: currentLocale, namespace: "common" });
  const styleLabels = teacher.styleTags && teacher.styleTags.length > 0
    ? teacher.styleTags
    : teacher.stylesTaught.map((style) => common(`danceStyles.${style}`));
  const description = buildTeacherDescription({
    teacher,
    locale: currentLocale,
    styleLabels
  });

  const title = locale === "es"
    ? `${teacher.name} | Maestro de baile en ${teacher.city}`
    : `${teacher.name} | Dance teacher in ${teacher.city}`;

  return buildDetailMetadata({
    locale: currentLocale,
    title,
    description,
    image: teacher.profileImageUrl || teacher.bannerImageUrl || "/images/exploraguate-logo.png",
    esPath: `/maestros/${teacher.slug}`,
    enPath: `/en/teachers/${teacher.slug}`,
    type: "article"
  });
}

function TeacherJsonLd({
  teacher,
  locale,
  description
}: {
  teacher: Awaited<ReturnType<typeof getTeacherBySlug>>;
  locale: Locale;
  description: string;
}) {
  if (!teacher) return null;

  const siteUrl = env.siteUrl;
  const pageUrl = locale === "es"
    ? `${siteUrl}/maestros/${teacher.slug}`
    : `${siteUrl}/en/teachers/${teacher.slug}`;
  const image = teacher.profileImageUrl || teacher.bannerImageUrl || "/images/exploraguate-logo.png";
  const imageUrl = image.startsWith("http") ? image : `${siteUrl}${image}`;
  const sameAs = [
    teacher.instagramUrl,
    teacher.facebookUrl,
    teacher.websiteUrl,
    teacher.whatsappUrl
  ].filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: teacher.name,
    description,
    url: pageUrl,
    image: imageUrl,
    address: teacher.address
      ? {
          "@type": "PostalAddress",
          streetAddress: teacher.address,
          addressLocality: teacher.city,
          addressCountry: "GT"
        }
      : undefined,
    homeLocation: teacher.city,
    knowsAbout: teacher.styleTags && teacher.styleTags.length > 0
      ? teacher.styleTags
      : teacher.stylesTaught,
    jobTitle: locale === "es" ? "Maestro de baile" : "Dance teacher",
    ...(sameAs.length > 0 ? { sameAs } : {})
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function TeacherDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const currentLocale = locale as Locale;
  const t = await getTranslations({ locale: currentLocale, namespace: "teachers" });
  const common = await getTranslations({ locale: currentLocale, namespace: "common" });
  const teacher = await getTeacherBySlug(currentLocale, slug);

  if (!teacher) notFound();

  const teacherDescription = buildTeacherDescription({
    teacher,
    locale: currentLocale,
    styleLabels: teacher.styleTags && teacher.styleTags.length > 0
      ? teacher.styleTags
      : teacher.stylesTaught.map((style) => common(`danceStyles.${style}`))
  });

  const [relatedEvents, relatedAcademies] = await Promise.all([
    getEventsForTeacher(currentLocale, teacher.id),
    getAcademiesForTeacher(currentLocale, teacher.id)
  ]);

  const socialLinks = [
    teacher.whatsappUrl ? { href: teacher.whatsappUrl, label: common("whatsapp"), type: "whatsapp" as const } : null,
    teacher.instagramUrl ? { href: teacher.instagramUrl, label: common("instagram"), type: "instagram" as const } : null,
    teacher.facebookUrl ? { href: teacher.facebookUrl, label: common("facebook"), type: "facebook" as const } : null,
    teacher.websiteUrl ? { href: teacher.websiteUrl, label: common("website"), type: "website" as const } : null
  ].filter(Boolean) as { href: string; label: string; type: "whatsapp" | "instagram" | "facebook" | "website" }[];
  const styleLabels = teacher.styleTags && teacher.styleTags.length > 0
    ? teacher.styleTags
    : teacher.stylesTaught.map((style) => common(`danceStyles.${style}`));

  const heroImage = teacher.profileImageUrl || teacher.bannerImageUrl || "/images/exploraguate-logo.png";
  const useUnoptimizedImage = heroImage.startsWith("/local-images/");

  return (
    <>
      <TeacherJsonLd
        teacher={teacher}
        locale={currentLocale}
        description={teacherDescription}
      />

      <section className="page-section">
        <Container>
          <div className="overflow-hidden rounded-2xl border border-border bg-white md:rounded-3xl">
            <div className={`relative w-full bg-gradient-to-r from-brand-600 to-brand-800 ${teacher.bannerImageUrl ? "aspect-[2.5/1] md:aspect-[3.5/1]" : "h-28 md:h-36"}`}>
              {teacher.bannerImageUrl ? (
                <Image
                  src={teacher.bannerImageUrl}
                  alt={`${teacher.name} banner`}
                  fill
                  unoptimized={teacher.bannerImageUrl.startsWith("/local-images/")}
                  className="object-cover"
                  priority
                />
              ) : null}
            </div>

            <div className="relative px-4 pb-4 pt-0 md:px-6 md:pb-5">
              <div className="-mt-10 mb-3 md:-mt-12">
                <div className="inline-block h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md md:h-24 md:w-24 md:rounded-3xl">
                  <Image
                    src={heroImage}
                    alt={teacher.name}
                    width={96}
                    height={96}
                    unoptimized={useUnoptimizedImage}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <h1 className="font-display text-xl font-bold tracking-tight md:text-3xl">
                {teacher.name}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {teacher.city}
                </span>
                {teacher.area ? (
                  <span className="flex items-center gap-1">
                    <Music className="h-3.5 w-3.5" />
                    {teacher.area}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {styleLabels.map((style) => (
                  <Badge key={style} variant="accent" className="text-[10px] md:text-xs">
                    {isPrimaryDanceStyle(style) ? common(`danceStyles.${style}`) : style}
                  </Badge>
                ))}
                {teacher.trialClass ? (
                  <Badge variant="outline" className="gap-1 border-green-200 bg-green-50 text-[10px] text-green-700 md:text-xs">
                    <CheckCircle2 className="h-3 w-3" />
                    {t("trialClassLabel")}
                  </Badge>
                ) : null}
              </div>

            </div>
          </div>

          <div className="mt-6 grid gap-6 md:mt-8 md:grid-cols-[1fr_320px] md:gap-8">
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight md:text-xl">
                  <GraduationCap className="h-5 w-5 text-brand-600" />
                  {t("aboutTitle")}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground md:text-base md:leading-7">
                  {teacherDescription}
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight md:text-xl">
                  <Music className="h-5 w-5 text-brand-600" />
                  {t("stylesTitle")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {styleLabels.map((style) => (
                    <Badge key={style} variant="accent">
                      {isPrimaryDanceStyle(style) ? common(`danceStyles.${style}`) : style}
                    </Badge>
                  ))}
                  {teacher.levels ? (
                    <Badge variant="outline">{teacher.levels}</Badge>
                  ) : null}
                </div>
              </div>

              {teacher.scheduleData && teacher.scheduleData.length > 0 ? (
                <AcademySchedule schedule={teacher.scheduleData} title={t("scheduleTitle")} />
              ) : teacher.scheduleText ? (
                <div className="space-y-2">
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight md:text-xl">
                    <CalendarDays className="h-5 w-5 text-brand-600" />
                    {t("scheduleTitle")}
                  </h2>
                  <div className="rounded-2xl border border-border bg-white p-4 text-sm text-muted-foreground md:p-5">
                    {teacher.scheduleText.split("·").map((segment, index) => (
                      <p key={index} className="flex items-baseline gap-1.5">
                        <span className="inline-block h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                        {segment.trim()}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}

              {teacher.classFormats?.length ? (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold tracking-tight md:text-xl">
                    {t("formatsTitle")}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {teacher.classFormats.map((format) => (
                      <Badge key={format} variant="outline">
                        {format}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {relatedAcademies.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold tracking-tight md:text-xl">
                    {common("relatedAcademies")}
                  </h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {relatedAcademies.map((academy) => (
                      <AcademyCard key={academy.id} academy={academy} />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="space-y-4 md:space-y-5">
              <div className="rounded-2xl border border-border bg-white p-4 md:p-5">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {t("detailsTitle")}
                </h3>
                <dl className="space-y-3 text-sm">
                  {teacher.levels ? (
                    <div>
                      <dt className="font-semibold text-foreground">{t("levelsLabel")}</dt>
                      <dd className="mt-0.5 text-muted-foreground">{teacher.levels}</dd>
                    </div>
                  ) : null}
                  {teacher.modality ? (
                    <div>
                      <dt className="font-semibold text-foreground">{t("modalityLabel")}</dt>
                      <dd className="mt-0.5 text-muted-foreground">
                        {t(MODALITY_MAP[teacher.modality] ?? "inPerson")}
                      </dd>
                    </div>
                  ) : null}
                  {teacher.priceText ? (
                    <div>
                      <dt className="font-semibold text-foreground">{t("priceLabel")}</dt>
                      <dd className="mt-0.5 text-muted-foreground">{teacher.priceText}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              {(teacher.teachingVenues?.length || teacher.teachingZones?.length || teacher.address) ? (
                <div className="rounded-2xl border border-border bg-white p-4 md:p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {t("teachingTitle")}
                  </h3>
                  <div className="space-y-3 text-sm text-foreground">
                    {teacher.address ? (
                      <p>{teacher.address}</p>
                    ) : null}
                    {teacher.teachingZones?.length ? (
                      <div>
                        <p className="font-semibold">{t("teachingZonesLabel")}</p>
                        <p className="mt-0.5 text-muted-foreground">{teacher.teachingZones.join(" · ")}</p>
                      </div>
                    ) : null}
                    {teacher.teachingVenues?.length ? (
                      <div>
                        <p className="font-semibold">{t("teachingVenuesLabel")}</p>
                        <div className="mt-1.5 space-y-1 text-muted-foreground">
                          {teacher.teachingVenues.map((venue) => (
                            <p key={venue} className="flex items-baseline gap-1.5">
                              <span className="inline-block h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                              {venue}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {(teacher.bookingUrl || socialLinks.length > 0) ? (
                <div className="rounded-2xl border border-border bg-white p-4 md:p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {teacher.bookingUrl ? t("bookingTitle") : t("contactTitle")}
                  </h3>
                  <div className="space-y-2">
                    {teacher.bookingUrl ? (
                      <a
                        href={teacher.bookingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                      >
                        <Phone className="h-4 w-4" />
                        {t("bookingCta")}
                      </a>
                    ) : null}
                    <ContactIconLinks links={socialLinks} />
                  </div>
                </div>
              ) : null}

              <div className="flex justify-center border-t border-gray-100 pt-4">
                <ReportForm entityType="teacher" entityId={teacher.id} />
              </div>
            </aside>
          </div>

          {relatedEvents.length > 0 ? (
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
          ) : null}

        </Container>
      </section>
    </>
  );
}
