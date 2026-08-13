import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { autoTranslateSpanishFields } from "@/lib/admin/auto-translate";
import { normalizeCountryCode } from "@/lib/locations";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ResourceCategory } from "@/types/resource";
import { getSiteCountryByCode } from "@/lib/site-countries";

const CATEGORIES: ResourceCategory[] = ["dancewear", "dj", "photography", "other"];

function emptyToNull(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

function parseCategories(value: unknown): ResourceCategory[] {
  const input = Array.isArray(value) ? value : String(value ?? "").split(/[\n,]/);
  return [...new Set(input.map(String).map((entry) => entry.trim()).filter((entry): entry is ResourceCategory => CATEGORIES.includes(entry as ResourceCategory)))];
}

function generateSlug(name: string) {
  return `${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 70)}-${Date.now().toString(36)}`;
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("community_resources")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const rawBody = await request.json() as Record<string, unknown>;
  const body = await autoTranslateSpanishFields(rawBody, [
    { sourceKey: "description_es", targetKey: "description_en", label: "Resource description" }
  ]);
  const name = String(body.name ?? "").trim();
  const categories = parseCategories(body.categories);
  const instagramUrl = emptyToNull(body.instagram_url);
  const whatsappUrl = emptyToNull(body.whatsapp_url);
  const websiteUrl = emptyToNull(body.website_url);
  const countryCode = normalizeCountryCode(body.country_code);

  if (!name || categories.length === 0 || !getSiteCountryByCode(countryCode) || (!instagramUrl && !whatsappUrl && !websiteUrl)) {
    return NextResponse.json({ error: "Nombre, país, categoría y al menos un contacto son obligatorios." }, { status: 400 });
  }

  const payload = {
    slug: generateSlug(name),
    name,
    resource_kind: body.resource_kind === "professional" ? "professional" : "business",
    categories,
    description_es: String(body.description_es ?? "").trim(),
    description_en: String(body.description_en ?? body.description_es ?? "").trim(),
    image_url: emptyToNull(body.image_url),
    city: emptyToNull(body.city),
    country_code: countryCode,
    instagram_url: instagramUrl,
    whatsapp_url: whatsappUrl,
    website_url: websiteUrl,
    source_url: emptyToNull(body.source_url),
    source_label: emptyToNull(body.source_label),
    verification_status: ["source_confirmed", "owner_confirmed"].includes(String(body.verification_status))
      ? String(body.verification_status)
      : "unverified",
    is_featured: Boolean(body.is_featured),
    is_published: Boolean(body.is_published),
    sort_order: Number(body.sort_order ?? 0) || 0
  };

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("community_resources").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
