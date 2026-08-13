import { initialCommunityResources } from "@/content/resource-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils/env";
import { getCurrentSiteCountryCode } from "@/lib/site-country-server";
import type { Locale } from "@/types/locale";
import type { LocalizedResource, ResourceCategory, ResourceRecord } from "@/types/resource";

function normalizeResource(row: Record<string, unknown>): ResourceRecord {
  const teacherRelation = Array.isArray(row.teachers) ? row.teachers[0] : row.teachers;
  const teacher = teacherRelation && typeof teacherRelation === "object"
    ? teacherRelation as Record<string, unknown>
    : null;

  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    resourceKind: row.resource_kind === "professional" ? "professional" : "business",
    categories: Array.isArray(row.categories)
      ? row.categories.filter((category): category is ResourceCategory =>
          ["dancewear", "dj", "photography", "other"].includes(String(category))
        )
      : [],
    descriptionEs: String(row.description_es ?? ""),
    descriptionEn: String(row.description_en ?? row.description_es ?? ""),
    imageUrl: row.image_url ? String(row.image_url) : null,
    city: row.city ? String(row.city) : null,
    countryCode: row.country_code ? String(row.country_code) : null,
    instagramUrl: row.instagram_url ? String(row.instagram_url) : null,
    whatsappUrl: row.whatsapp_url ? String(row.whatsapp_url) : null,
    websiteUrl: row.website_url ? String(row.website_url) : null,
    teacherSlug: teacher?.slug ? String(teacher.slug) : null,
    teacherImageUrl: teacher?.profile_image_url ? String(teacher.profile_image_url) : null,
    sourceUrl: row.source_url ? String(row.source_url) : null,
    sourceLabel: row.source_label ? String(row.source_label) : null,
    verificationStatus: row.verification_status === "owner_confirmed" || row.verification_status === "source_confirmed"
      ? row.verification_status
      : "unverified",
    lastVerifiedAt: row.last_verified_at ? String(row.last_verified_at) : null,
    isFeatured: Boolean(row.is_featured),
    isPublished: row.is_published !== false,
    sortOrder: Number(row.sort_order ?? 0)
  };
}

async function fetchResources(countryCode: string): Promise<ResourceRecord[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("community_resources")
    .select("*, teachers(slug, profile_image_url)")
    .eq("is_published", true)
    .eq("country_code", countryCode)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.warn("[resources] Using initial data because Supabase is not ready:", error.message);
    return initialCommunityResources;
  }

  return (data ?? []).map((row) => normalizeResource(row));
}

export async function getResources(locale: Locale, countryCode?: string): Promise<LocalizedResource[]> {
  const siteCountryCode = countryCode ?? await getCurrentSiteCountryCode();
  const records = isSupabaseConfigured ? await fetchResources(siteCountryCode) : initialCommunityResources;

  return records
    .filter((resource) => resource.isPublished && resource.countryCode === siteCountryCode)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
    .map((resource) => ({
      ...resource,
      description: locale === "en" ? resource.descriptionEn : resource.descriptionEs
    }));
}
