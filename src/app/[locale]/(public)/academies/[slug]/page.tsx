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
  MessageCircle,
  Globe,
  Phone
} from "lucide-react";
import type { Locale } from "@/types/locale";

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
    academy.whatsappUrl ? { href: academy.whatsappUrl, label: common("whatsapp"), type: "whatsapp" as const } : null,
    academy.instagramUrl ? { href: academy.instagramUrl, label: common("instagram"), type: "instagram" as const } : null,
    academy.websiteUrl ? { href: academy.websiteUrl, label: common("website"), type: "website" as const } : null
  ].filter(Boolean) as { href: string; label: string; type: "whatsapp" | "instagram" | "website" }[];

  const socialIcons = {
    whatsapp: <WhatsAppIcon className="h-3.5 w-3.5" />,
    instagram: <InstagramIcon className="h-3.5 w-3.5" />,
    website: <Globe className="h-3.5 w-3.5" />
  };

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
                      className="flex items-center gap-1.5 rounded-full border border-border bg-surface-soft/80 px-3 py-1.5 text-xs font-semibold text-foreground/70 transition-colors hover:border-brand-500 hover:text-brand-600"
                    >
                      {socialIcons[link.type]}
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
                        className="flex items-center gap-2 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
                      >
                        {socialIcons[link.type]}
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary CTA — prioritize WhatsApp > Instagram > Website */}
              {(() => {
                const cta = academy.whatsappUrl
                  ? { href: academy.whatsappUrl, label: t("writeOnWhatsApp"), icon: <WhatsAppIcon className="h-4 w-4" /> }
                  : academy.instagramUrl
                    ? { href: academy.instagramUrl, label: t("viewOnInstagram"), icon: <InstagramIcon className="h-4 w-4" /> }
                    : academy.websiteUrl
                      ? { href: academy.websiteUrl, label: t("visitWebsite"), icon: <Globe className="h-4 w-4" /> }
                      : null;
                if (!cta) return null;
                return (
                  <Button asChild size="lg" className="w-full gap-2">
                    <a href={cta.href} target="_blank" rel="noreferrer">
                      {cta.icon}
                      {cta.label}
                    </a>
                  </Button>
                );
              })()}
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
      {(() => {
        const cta = academy.whatsappUrl
          ? { href: academy.whatsappUrl, label: t("writeOnWhatsApp"), icon: <WhatsAppIcon className="h-4 w-4" /> }
          : academy.instagramUrl
            ? { href: academy.instagramUrl, label: t("viewOnInstagram"), icon: <InstagramIcon className="h-4 w-4" /> }
            : null;
        if (!cta) return null;
        return (
          <div className="fixed inset-x-0 bottom-[76px] z-30 border-t border-black/[0.06] bg-white/95 p-3 backdrop-blur-xl md:hidden">
            <Button asChild size="lg" className="w-full gap-2">
              <a href={cta.href} target="_blank" rel="noreferrer">
                {cta.icon}
                {cta.label}
              </a>
            </Button>
          </div>
        );
      })()}
    </>
  );
}
