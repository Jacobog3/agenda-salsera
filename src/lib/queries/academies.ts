import { sampleAcademies } from "@/content/sample-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils/env";
import { localizeAcademy } from "@/lib/utils/localize";
import type { AcademyRecord, LocalizedAcademy } from "@/types/academy";
import type { Locale } from "@/types/locale";

function normalizeAcademy(row: Record<string, unknown>): AcademyRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    descriptionEs: String(row.description_es ?? ""),
    descriptionEn: String(row.description_en ?? ""),
    coverImageUrl: String(row.cover_image_url ?? ""),
    city: String(row.city),
    area: row.area ? String(row.area) : null,
    address: row.address ? String(row.address) : null,
    stylesTaught: Array.isArray(row.styles_taught)
      ? row.styles_taught.map((style) => String(style)) as AcademyRecord["stylesTaught"]
      : [],
    scheduleText: row.schedule_text ? String(row.schedule_text) : null,
    levels: row.levels ? String(row.levels) : null,
    trialClass: Boolean(row.trial_class),
    modality: row.modality ? String(row.modality) : "presencial",
    whatsappUrl: row.whatsapp_url ? String(row.whatsapp_url) : null,
    instagramUrl: row.instagram_url ? String(row.instagram_url) : null,
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
