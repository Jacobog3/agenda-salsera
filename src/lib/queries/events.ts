import { sampleEvents } from "@/content/sample-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils/env";
import { isEventActive, isEventExpired, isHistoricalEventIndexable } from "@/lib/utils/event-status";
import { localizeEvent } from "@/lib/utils/localize";
import type { DanceStyle, EventRecord, LocalizedEvent } from "@/types/event";
import type { Locale } from "@/types/locale";

type EventFilters = {
  city?: string;
  danceStyle?: DanceStyle | "all";
  dateRangeInDays?: string;
};

function normalizeEvent(row: Record<string, unknown>): EventRecord {
  const dateStatus = row.date_status === "coming_soon" ? "coming_soon" : "confirmed";

  return {
    id: String(row.id),
    slug: String(row.slug),
    titleEs: String(row.title_es),
    titleEn: String(row.title_en),
    descriptionEs: String(row.description_es),
    descriptionEn: String(row.description_en),
    coverImageUrl: String(row.cover_image_url),
    galleryUrls: Array.isArray(row.gallery_urls) ? (row.gallery_urls as string[]) : [],
    danceStyle: row.dance_style as DanceStyle,
    city: String(row.city),
    area: row.area ? String(row.area) : null,
    venueName: String(row.venue_name),
    address: row.address ? String(row.address) : null,
    startsAt: row.starts_at ? String(row.starts_at) : null,
    endsAt: row.ends_at ? String(row.ends_at) : null,
    dateStatus,
    dateLabel: row.date_label ? String(row.date_label) : null,
    priceAmount:
      row.price_amount === null || row.price_amount === undefined
        ? null
        : Number(row.price_amount),
    priceText: row.price_text ? String(row.price_text) : null,
    currency: String(row.currency),
    organizerName: String(row.organizer_name),
    organizerId: row.organizer_id ? String(row.organizer_id) : null,
    academyId: row.academy_id ? String(row.academy_id) : null,
    contactUrl: String(row.contact_url),
    externalUrl: row.external_url ? String(row.external_url) : null,
    isFeatured: Boolean(row.is_featured),
    createdAt: row.created_at ? String(row.created_at) : undefined
  };
}

export async function getEvents(
  locale: Locale,
  filters?: EventFilters
): Promise<LocalizedEvent[]> {
  const records = await getPublishedEventRecords();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return records
    .filter((event) => {
      if (!isEventActive(event)) return false;

      if (filters?.city && filters.city !== "all" && event.city !== filters.city) {
        return false;
      }

      if (
        filters?.danceStyle &&
        filters.danceStyle !== "all" &&
        event.danceStyle !== filters.danceStyle
      ) {
        return false;
      }

      if (filters?.dateRangeInDays && filters.dateRangeInDays !== "all") {
        if (!event.startsAt) return false;
        const limit = new Date();
        limit.setDate(todayStart.getDate() + Number(filters.dateRangeInDays));
        if (new Date(event.startsAt) > limit) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (!a.startsAt && !b.startsAt) return 0;
      if (!a.startsAt) return 1;
      if (!b.startsAt) return -1;
      return +new Date(a.startsAt) - +new Date(b.startsAt);
    })
    .map((event) => localizeEvent(event, locale));
}

export async function getFeaturedEvents(locale: Locale) {
  const events = await getEvents(locale);
  return events.slice(0, 4);
}

export async function getEventBySlug(locale: Locale, slug: string) {
  const events = (await getPublishedEventRecords()).map((event) => localizeEvent(event, locale));
  return events.find((event) => event.slug === slug) ?? null;
}

export async function getIndexableHistoricalEvents(locale: Locale) {
  return (await getPublishedEventRecords())
    .map((event) => localizeEvent(event, locale))
    .filter((event) => isEventExpired(event) && isHistoricalEventIndexable(event));
}

export async function getRelatedUpcomingEvents(
  locale: Locale,
  currentEvent: LocalizedEvent,
  limit = 3
) {
  const events = (await getEvents(locale)).filter((event) => event.id !== currentEvent.id);

  const normalized = (value?: string | null) =>
    String(value ?? "").trim().toLocaleLowerCase("es");

  return events
    .map((event) => {
      let score = 0;
      let recommendationType: "organizer" | "academy" | "venue" | "local" = "local";
      if (currentEvent.organizerId && event.organizerId === currentEvent.organizerId) {
        score += 100;
        recommendationType = "organizer";
      }
      if (currentEvent.academyId && event.academyId === currentEvent.academyId) {
        score += 80;
        if (recommendationType !== "organizer") recommendationType = "academy";
      }
      if (
        normalized(currentEvent.organizerName) &&
        normalized(event.organizerName) === normalized(currentEvent.organizerName)
      ) {
        score += 60;
        recommendationType = "organizer";
      }
      if (
        normalized(currentEvent.venueName) &&
        normalized(event.venueName) === normalized(currentEvent.venueName)
      ) {
        score += 40;
        if (recommendationType === "local") recommendationType = "venue";
      }
      if (event.city === currentEvent.city) score += 10;
      if (event.danceStyle === currentEvent.danceStyle) score += 5;
      return { event, score, recommendationType };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ event, recommendationType }) => ({ event, recommendationType }));
}

async function getPublishedEventRecords(): Promise<EventRecord[]> {
  return isSupabaseConfigured ? fetchSupabaseEvents() : sampleEvents;
}

async function fetchSupabaseEvents(): Promise<EventRecord[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .order("starts_at", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("[events] Supabase error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => normalizeEvent(row));
}
