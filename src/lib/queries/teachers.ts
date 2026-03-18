import { sampleTeachers } from "@/content/sample-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils/env";
import { localizeTeacher } from "@/lib/utils/localize";
import type { Locale } from "@/types/locale";
import type { TeacherRecord } from "@/types/teacher";

function toStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const list = value.map((entry) => String(entry ?? "").trim()).filter(Boolean);
  return list.length ? list : null;
}

function normalizeTeacher(row: Record<string, unknown>): TeacherRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    bioEs: String(row.bio_es ?? ""),
    bioEn: String(row.bio_en ?? ""),
    profileImageUrl: row.profile_image_url ? String(row.profile_image_url) : null,
    bannerImageUrl: row.banner_image_url ? String(row.banner_image_url) : null,
    city: String(row.city),
    area: row.area ? String(row.area) : null,
    address: row.address ? String(row.address) : null,
    stylesTaught: Array.isArray(row.styles_taught)
      ? row.styles_taught.map((style) => String(style)) as TeacherRecord["stylesTaught"]
      : [],
    levels: row.levels ? String(row.levels) : null,
    modality: row.modality ? String(row.modality) : null,
    classFormats: toStringArray(row.class_formats),
    teachingZones: toStringArray(row.teaching_zones),
    teachingVenues: toStringArray(row.teaching_venues),
    scheduleText: row.schedule_text ? String(row.schedule_text) : null,
    scheduleData: Array.isArray(row.schedule_data) ? row.schedule_data as TeacherRecord["scheduleData"] : null,
    bookingUrl: row.booking_url ? String(row.booking_url) : null,
    whatsappUrl: row.whatsapp_url ? String(row.whatsapp_url) : null,
    instagramUrl: row.instagram_url ? String(row.instagram_url) : null,
    facebookUrl: row.facebook_url ? String(row.facebook_url) : null,
    websiteUrl: row.website_url ? String(row.website_url) : null,
    trialClass: Boolean(row.trial_class),
    priceText: row.price_text ? String(row.price_text) : null,
    isFeatured: Boolean(row.is_featured),
    isPublished: row.is_published !== false
  };
}

export async function getTeachers(locale: Locale) {
  const records = isSupabaseConfigured
    ? await fetchSupabaseTeachers()
    : sampleTeachers;

  return records.map((teacher) => localizeTeacher(teacher, locale));
}

export async function getFeaturedTeachers(locale: Locale) {
  const teachers = await getTeachers(locale);
  return teachers.filter((teacher) => teacher.isFeatured).slice(0, 3);
}

export async function getTeacherBySlug(locale: Locale, slug: string) {
  const teachers = await getTeachers(locale);
  return teachers.find((teacher) => teacher.slug === slug) ?? null;
}

async function fetchSupabaseTeachers(): Promise<TeacherRecord[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .eq("is_published", true);

  if (error) {
    console.error("[teachers] Supabase error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => normalizeTeacher(row));
}
