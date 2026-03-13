import { sampleSpots } from "@/content/sample-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils/env";
import { localizeSpot } from "@/lib/utils/localize";
import type { SpotRecord, LocalizedSpot } from "@/types/spot";
import type { Locale } from "@/types/locale";

function normalizeSpot(row: Record<string, unknown>): SpotRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    descriptionEs: String(row.description_es),
    descriptionEn: String(row.description_en),
    coverImageUrl: String(row.cover_image_url),
    city: String(row.city),
    area: row.area ? String(row.area) : null,
    address: row.address ? String(row.address) : null,
    scheduleEs: String(row.schedule_es),
    scheduleEn: String(row.schedule_en),
    coverChargeEs: row.cover_charge_es ? String(row.cover_charge_es) : null,
    coverChargeEn: row.cover_charge_en ? String(row.cover_charge_en) : null,
    whatsappUrl: row.whatsapp_url ? String(row.whatsapp_url) : null,
    instagramUrl: row.instagram_url ? String(row.instagram_url) : null,
    googleMapsUrl: row.google_maps_url ? String(row.google_maps_url) : null,
    isFeatured: Boolean(row.is_featured)
  };
}

export async function getSpots(locale: Locale): Promise<LocalizedSpot[]> {
  const records = isSupabaseConfigured
    ? await fetchSupabaseSpots()
    : sampleSpots;

  return records.map((spot) => localizeSpot(spot, locale));
}

export async function getFeaturedSpots(locale: Locale) {
  const spots = await getSpots(locale);
  return spots.filter((spot) => spot.isFeatured).slice(0, 4);
}

export async function getSpotBySlug(locale: Locale, slug: string) {
  const spots = await getSpots(locale);
  return spots.find((spot) => spot.slug === slug) ?? null;
}

async function fetchSupabaseSpots(): Promise<SpotRecord[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .eq("is_published", true);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => normalizeSpot(row));
}
