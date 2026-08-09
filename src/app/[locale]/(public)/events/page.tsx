import { getTranslations } from "next-intl/server";
import { EventCard } from "@/components/events/event-card";
import { FilterBar } from "@/components/events/filter-bar";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { LastUpdatedBadge } from "@/components/shared/last-updated-badge";
import { AdUnit } from "@/components/shared/ad-unit";
import { buildMetadata } from "@/lib/metadata/build-metadata";
import { getEvents } from "@/lib/queries/events";
import { getLastUpdated } from "@/lib/queries/last-updated";
import type { DanceStyle } from "@/types/event";
import type { Locale } from "@/types/locale";
import { getCountryName } from "@/lib/locations";

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
  searchParams: Promise<{ danceStyle?: DanceStyle | "all"; date?: string; country?: string }>;
}) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const filters = await searchParams;
  const t = await getTranslations({
    locale: currentLocale,
    namespace: "events"
  });
  const [allEvents, lastUpdated] = await Promise.all([
    getEvents(currentLocale),
    getLastUpdated("events")
  ]);
  const events = filters.country && filters.country !== "all"
    ? allEvents.filter((event) => event.countryCode === filters.country)
    : allEvents;
  const dateFilteredEvents = filters.date && filters.date !== "all"
    ? await getEvents(currentLocale, {
        countryCode: filters.country,
        danceStyle: filters.danceStyle,
        dateRangeInDays: filters.date
      })
    : filters.danceStyle && filters.danceStyle !== "all"
      ? events.filter((event) => event.danceStyle === filters.danceStyle)
      : events;
  const countries = [...new Set(allEvents.map((event) => event.countryCode))]
    .map((code) => ({ code, label: getCountryName(code, currentLocale) }));

  return (
    <section className="page-section pb-16">
      <Container className="space-y-4 md:space-y-8">
        <div>
          <SectionHeading title={t("title")} description={t("description")} as="h1" />
          <LastUpdatedBadge date={lastUpdated} locale={currentLocale} />
        </div>
        <FilterBar
          currentDate={filters.date || "all"}
          currentDanceStyle={filters.danceStyle || "all"}
          currentCountry={filters.country || "all"}
          countries={countries}
        />
        {dateFilteredEvents.length ? (
          <div className="grid gap-3 sm:grid-cols-2 md:gap-5">
            {dateFilteredEvents.flatMap((event, index) => {
              const card = <EventCard key={event.id} event={event} locale={currentLocale} />;
              const showAd = (index + 1) % 4 === 0 && index < dateFilteredEvents.length - 1;
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
