import { getTranslations } from "next-intl/server";
import { EventCard } from "@/components/events/event-card";
import { FilterBar } from "@/components/events/filter-bar";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { LastUpdatedBadge } from "@/components/shared/last-updated-badge";
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
      <Container className="space-y-4 md:space-y-8">
        <div>
          <SectionHeading title={t("title")} description={t("description")} as="h1" />
          <LastUpdatedBadge date={lastUpdated} locale={currentLocale} />
        </div>
        <FilterBar
          currentDate={filters.date || "all"}
          currentDanceStyle={filters.danceStyle || "all"}
        />
        {events.length ? (
          <div className="grid gap-3 sm:grid-cols-2 md:gap-5">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                locale={currentLocale}
              />
            ))}
          </div>
        ) : (
          <EmptyState title={t("empty")} />
        )}
      </Container>
    </section>
  );
}
