import { getTranslations } from "next-intl/server";
import { HeroSection } from "@/components/home/hero-section";
import { AcademyCard } from "@/components/academies/academy-card";
import { EventCard } from "@/components/events/event-card";
import { SpotCard } from "@/components/spots/spot-card";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPinned, GraduationCap } from "lucide-react";
import { getFeaturedAcademies } from "@/lib/queries/academies";
import { getFeaturedEvents } from "@/lib/queries/events";
import { getFeaturedSpots } from "@/lib/queries/spots";
import { buildMetadata } from "@/lib/metadata/build-metadata";
import type { Locale } from "@/types/locale";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return buildMetadata(locale as Locale, "homeTitle", "homeDescription", { pathname: "/" });
}

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const t = await getTranslations({ locale: currentLocale, namespace: "home" });
  const common = await getTranslations({
    locale: currentLocale,
    namespace: "common"
  });
  const [events, spots, academies] = await Promise.all([
    getFeaturedEvents(currentLocale),
    getFeaturedSpots(currentLocale),
    getFeaturedAcademies(currentLocale)
  ]);

  return (
    <>
      <HeroSection events={events} locale={currentLocale} />

      {events.length > 0 && (
        <section className="page-section">
          <Container className="space-y-4 md:space-y-8">
            <div className="flex items-end justify-between gap-4">
              <SectionHeading icon={CalendarDays} title={t("eventsTitle")} />
              <Button asChild variant="ghost" size="sm" className="text-xs md:text-[13px]">
                <Link href="/events">{common("viewAll")}</Link>
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 md:gap-6">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  locale={currentLocale}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {spots.length > 0 && (
        <section className="page-section">
          <Container className="space-y-4 md:space-y-8">
            <div className="flex items-end justify-between gap-4">
              <SectionHeading icon={MapPinned} title={t("spotsTitle")} />
              <Button asChild variant="ghost" size="sm" className="text-xs md:text-[13px]">
                <Link href="/spots">{common("viewAll")}</Link>
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 md:gap-5">
              {spots.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {academies.length > 0 && (
        <section className="page-section">
          <Container className="space-y-4 md:space-y-8">
            <div className="flex items-end justify-between gap-4">
              <SectionHeading icon={GraduationCap} title={t("academiesTitle")} />
              <Button asChild variant="ghost" size="sm" className="text-xs md:text-[13px]">
                <Link href="/academies">{common("viewAll")}</Link>
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 md:gap-5">
              {academies.map((academy) => (
                <AcademyCard key={academy.id} academy={academy} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="page-section pb-4 md:pb-6">
        <Container>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-5 text-white shadow-glow md:rounded-3xl md:p-10">
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
              <div className="space-y-1.5 md:space-y-2">
                <h2 className="font-display text-xl font-bold tracking-tight md:text-3xl">
                  {t("submitTitle")}
                </h2>
                <p className="max-w-md text-xs leading-relaxed text-white/80 md:text-base">
                  {t("submitDescription")}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 md:flex-col md:gap-2.5">
                <Link
                  href="/submit-event"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-brand-700 shadow-md transition-all hover:bg-white/90 active:scale-[0.97]"
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  {t("submitEventShort")}
                </Link>
                <Link
                  href="/submit-academy"
                  className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-bold text-white ring-1 ring-white/30 transition-all hover:bg-white/30 active:scale-[0.97]"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  {t("submitAcademyShort")}
                </Link>
                <Link
                  href="/submit-spot"
                  className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-bold text-white ring-1 ring-white/30 transition-all hover:bg-white/30 active:scale-[0.97]"
                >
                  <MapPinned className="h-3.5 w-3.5" />
                  {t("submitSpotShort")}
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
