import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OrganizerRecord, OrganizerSummary } from "@/types/organizer";

function normalizeOrganizer(row: Record<string, unknown>): OrganizerRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    descriptionEs: String(row.description_es ?? ""),
    descriptionEn: String(row.description_en ?? ""),
    logoImageUrl: row.logo_image_url ? String(row.logo_image_url) : null,
    bannerImageUrl: row.banner_image_url ? String(row.banner_image_url) : null,
    city: row.city ? String(row.city) : null,
    area: row.area ? String(row.area) : null,
    address: row.address ? String(row.address) : null,
    whatsappUrl: row.whatsapp_url ? String(row.whatsapp_url) : null,
    instagramUrl: row.instagram_url ? String(row.instagram_url) : null,
    facebookUrl: row.facebook_url ? String(row.facebook_url) : null,
    websiteUrl: row.website_url ? String(row.website_url) : null,
    isFeatured: Boolean(row.is_featured),
    isPublished: row.is_published !== false
  };
}

export async function getOrganizerById(id: string): Promise<OrganizerSummary | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("organizers")
    .select("id, slug, name")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const organizer = normalizeOrganizer(data);
  return {
    id: organizer.id,
    slug: organizer.slug,
    name: organizer.name
  };
}
