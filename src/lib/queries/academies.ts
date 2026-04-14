import { sampleAcademies } from "@/content/sample-data";
import { buildAcademyScheduleText, normalizeAcademyScheduleData } from "@/lib/academies/academy-helpers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils/env";
import { localizeAcademy } from "@/lib/utils/localize";
import type { AcademyRecord, LocalizedAcademy } from "@/types/academy";
import type { Locale } from "@/types/locale";

function normalizeAcademy(row: Record<string, unknown>): AcademyRecord {
  const scheduleData = normalizeAcademyScheduleData(row.schedule_data);

  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    descriptionEs: String(row.description_es ?? ""),
    descriptionEn: String(row.description_en ?? ""),
    coverImageUrl: String(row.cover_image_url ?? ""),
    bannerImageUrl: row.banner_image_url ? String(row.banner_image_url) : null,
    city: String(row.city),
    area: row.area ? String(row.area) : null,
    address: row.address ? String(row.address) : null,
    stylesTaught: Array.isArray(row.styles_taught)
      ? row.styles_taught.map((style) => String(style)) as AcademyRecord["stylesTaught"]
      : [],
    styleTags: Array.isArray(row.style_tags)
      ? row.style_tags.map((tag) => String(tag))
      : [],
    scheduleText: row.schedule_text ? String(row.schedule_text) : buildAcademyScheduleText(scheduleData),
    scheduleData,
    levels: row.levels ? String(row.levels) : null,
    priceText: row.price_text ? String(row.price_text) : null,
    trialClass: Boolean(row.trial_class),
    modality: row.modality ? String(row.modality) : "presencial",
    whatsappUrl: row.whatsapp_url ? String(row.whatsapp_url) : null,
    instagramUrl: row.instagram_url ? String(row.instagram_url) : null,
    facebookUrl: row.facebook_url ? String(row.facebook_url) : null,
    websiteUrl: row.website_url ? String(row.website_url) : null,
    isFeatured: Boolean(row.is_featured)
  };
}

export async function getAcademies(locale: Locale): Promise<LocalizedAcademy[]> {
  const records = isSupabaseConfigured
    ? await fetchSupabaseAcademies()
    : sampleAcademies;

  return records.map((academy) => localizeAcademy(academy, locale));
}

export async function getFeaturedAcademies(locale: Locale) {
  const academies = await getAcademies(locale);
  return academies.filter((academy) => academy.isFeatured).slice(0, 3);
}

export async function getAcademyBySlug(locale: Locale, slug: string) {
  const academies = await getAcademies(locale);
  return academies.find((academy) => academy.slug === slug) ?? null;
}

async function fetchSupabaseAcademies(): Promise<AcademyRecord[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("academies")
    .select("*")
    .eq("is_published", true);

  if (error) {
    console.error("[academies] Supabase error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => normalizeAcademy(row));
}
