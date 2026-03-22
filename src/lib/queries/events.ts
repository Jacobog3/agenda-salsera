import { sampleEvents } from "@/content/sample-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils/env";
import { isEventActive } from "@/lib/utils/event-status";
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
    galleryUrls: Array.isArray(row.gallery_urls) ? (row.gallery_urls as string[]) : [],
    danceStyle: row.dance_style as DanceStyle,
    city: String(row.city),
    area: row.area ? String(row.area) : null,
    venueName: String(row.venue_name),
    address: row.address ? String(row.address) : null,
    startsAt: String(row.starts_at),
    endsAt: row.ends_at ? String(row.ends_at) : null,
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
  const records = isSupabaseConfigured
    ? await fetchSupabaseEvents()
    : sampleEvents;

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
        const limit = new Date();
        limit.setDate(todayStart.getDate() + Number(filters.dateRangeInDays));
        if (new Date(event.startsAt) > limit) return false;
      }

      return true;
    })
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
    .map((event) => localizeEvent(event, locale));
}

export async function getFeaturedEvents(locale: Locale) {
  const events = await getEvents(locale);
  return events.slice(0, 4);
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
    .eq("is_published", true)
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("[events] Supabase error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => normalizeEvent(row));
}
