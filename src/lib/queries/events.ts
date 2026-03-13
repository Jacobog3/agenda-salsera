import { sampleEvents } from "@/content/sample-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils/env";
import { localizeEvent } from "@/lib/utils/localize";
import type { DanceStyle, EventRecord, LocalizedEvent } from "@/types/event";
import type { Locale } from "@/types/locale";

type EventFilters = {
  city?: string;
  danceStyle?: DanceStyle | "all";
  dateRangeInDays?: string;
};

function normalizeEvent(row: Record<string, unknown>): EventRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    titleEs: String(row.title_es),
    titleEn: String(row.title_en),
    descriptionEs: String(row.description_es),
    descriptionEn: String(row.description_en),
    coverImageUrl: String(row.cover_image_url),
    danceStyle: row.dance_style as DanceStyle,
    city: String(row.city),
    area: row.area ? String(row.area) : null,
    venueName: String(row.venue_name),
    address: row.address ? String(row.address) : null,
    startsAt: String(row.starts_at),
    priceAmount:
      row.price_amount === null || row.price_amount === undefined
        ? null
        : Number(row.price_amount),
    currency: String(row.currency),
    organizerName: String(row.organizer_name),
    contactUrl: String(row.contact_url),
    externalUrl: row.external_url ? String(row.external_url) : null,
    isFeatured: Boolean(row.is_featured)
  };
}

export async function getEvents(
  locale: Locale,
  filters?: EventFilters
): Promise<LocalizedEvent[]> {
  const records = isSupabaseConfigured
    ? await fetchSupabaseEvents()
    : sampleEvents;

  return records
    .filter((event) => {
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
        const now = new Date();
        const limit = new Date();
        limit.setDate(now.getDate() + Number(filters.dateRangeInDays));

        if (new Date(event.startsAt) > limit) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
    .map((event) => localizeEvent(event, locale));
}

export async function getFeaturedEvents(locale: Locale) {
  const events = await getEvents(locale);
  return events.filter((event) => event.isFeatured).slice(0, 3);
}

export async function getEventBySlug(locale: Locale, slug: string) {
  const events = await getEvents(locale);
  return events.find((event) => event.slug === slug) ?? null;
}

async function fetchSupabaseEvents(): Promise<EventRecord[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => normalizeEvent(row));
}
