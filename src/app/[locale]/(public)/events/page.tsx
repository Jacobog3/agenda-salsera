import { getTranslations } from "next-intl/server";
import { EventCard } from "@/components/events/event-card";
import { FilterBar } from "@/components/events/filter-bar";
import { AgendaIntro } from "@/components/events/agenda-intro";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { AdUnit } from "@/components/shared/ad-unit";
import { buildMetadata } from "@/lib/metadata/build-metadata";
import { getEvents } from "@/lib/queries/events";
import { getLastUpdated } from "@/lib/queries/last-updated";
import type { DanceStyle } from "@/types/event";
import type { Locale } from "@/types/locale";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return buildMetadata(locale as Locale, "eventsTitle", "eventsDescription", { pathname: "/events" });
}

export default async function EventsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ danceStyle?: DanceStyle | "all"; date?: string }>;
}) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const filters = await searchParams;
  const t = await getTranslations({
    locale: currentLocale,
    namespace: "events"
  });
  const [events, lastUpdated] = await Promise.all([
    getEvents(currentLocale, {
      danceStyle: filters.danceStyle,
      dateRangeInDays: filters.date
    }),
    getLastUpdated("events")
  ]);

  return (
    <section className="page-section pb-16">
      <Container className="space-y-4 md:space-y-7">
        <AgendaIntro
          title={t("title")}
          description={t("description")}
          partnerLabel={t("partnerLabel")}
          partnerName={t("partnerName")}
          lastUpdated={lastUpdated}
          locale={currentLocale}
        />
        <FilterBar
          currentDate={filters.date || "all"}
          currentDanceStyle={filters.danceStyle || "all"}
        />
        {events.length ? (
          <div className="grid gap-3 sm:grid-cols-2 md:gap-5">
            {events.flatMap((event, index) => {
              const card = <EventCard key={event.id} event={event} locale={currentLocale} />;
              const showAd = (index + 1) % 4 === 0 && index < events.length - 1;
              return showAd
                ? [card, <AdUnit key={`ad-${index}`} slot="3657012273" layoutKey="-gy+x-4m-bc+129" className="sm:col-span-2" />]
                : [card];
            })}
          </div>
        ) : (
          <EmptyState title={t("empty")} />
        )}
      </Container>
    </section>
  );
}
