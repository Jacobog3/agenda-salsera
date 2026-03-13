import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { AcademySchedule } from "@/components/academies/academy-schedule";
import { EventCard } from "@/components/events/event-card";
import { getAcademyBySlug } from "@/lib/queries/academies";
import { getFeaturedEvents } from "@/lib/queries/events";
import {
  MapPin,
  Music,
  CheckCircle2,
  GraduationCap,
  Building2,
  MessageCircle
} from "lucide-react";
import type { Locale } from "@/types/locale";

const MODALITY_MAP: Record<string, "inPerson" | "online" | "hybrid"> = {
  presencial: "inPerson",
  online: "online",
  mixto: "hybrid"
};

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
    academy.whatsappUrl ? { href: academy.whatsappUrl, label: common("whatsapp") } : null,
    academy.instagramUrl ? { href: academy.instagramUrl, label: common("instagram") } : null,
    academy.websiteUrl ? { href: academy.websiteUrl, label: common("website") } : null
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <>
      <section className="page-section pb-24 md:pb-16">
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

              {/* Social links row */}
              {socialLinks.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {socialLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-border bg-surface-soft/80 px-3 py-1.5 text-xs font-semibold text-foreground/70 transition-colors hover:border-brand-500 hover:text-brand-600"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
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
                  <div className="space-y-2">
                    {socialLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
                      >
                        {link.label} →
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              {academy.whatsappUrl && (
                <Button asChild size="lg" className="w-full">
                  <a href={academy.whatsappUrl} target="_blank" rel="noreferrer">
                    {t("contactCta")}
                  </a>
                </Button>
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
        </Container>
      </section>

      {/* Mobile sticky CTA */}
      {academy.whatsappUrl && (
        <div className="fixed inset-x-0 bottom-[76px] z-30 border-t border-black/[0.06] bg-white/95 p-3 backdrop-blur-xl md:hidden">
          <Button asChild size="lg" className="w-full">
            <a href={academy.whatsappUrl} target="_blank" rel="noreferrer">
              {t("contactCta")}
            </a>
          </Button>
        </div>
      )}
    </>
  );
}
