import { NextResponse } from "next/server";
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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  const rawBody = await request.json() as Record<string, unknown>;
  const forceAutoTranslate = Boolean(rawBody.force_auto_translate);
  delete rawBody.force_auto_translate;
  const body = await autoTranslateSpanishFields(rawBody, [
    { sourceKey: "description_es", targetKey: "description_en", label: "Resource description" }
  ], { force: forceAutoTranslate });
  const payload: Record<string, unknown> = {};

  if ("name" in body) payload.name = String(body.name ?? "").trim();
  if ("resource_kind" in body) payload.resource_kind = body.resource_kind === "professional" ? "professional" : "business";
  if ("categories" in body) payload.categories = parseCategories(body.categories);
  if ("description_es" in body) payload.description_es = String(body.description_es ?? "").trim();
  if ("description_en" in body) payload.description_en = String(body.description_en ?? "").trim();
  if ("image_url" in body) payload.image_url = emptyToNull(body.image_url);
  if ("city" in body) payload.city = emptyToNull(body.city);
  if ("country_code" in body) {
    const countryCode = normalizeCountryCode(body.country_code);
    if (!getSiteCountryByCode(countryCode)) {
      return NextResponse.json({ error: "Selecciona un país habilitado." }, { status: 400 });
    }
    payload.country_code = countryCode;
  }
  if ("instagram_url" in body) payload.instagram_url = emptyToNull(body.instagram_url);
  if ("whatsapp_url" in body) payload.whatsapp_url = emptyToNull(body.whatsapp_url);
  if ("website_url" in body) payload.website_url = emptyToNull(body.website_url);
  if ("source_url" in body) payload.source_url = emptyToNull(body.source_url);
  if ("source_label" in body) payload.source_label = emptyToNull(body.source_label);
  if ("verification_status" in body) payload.verification_status = ["source_confirmed", "owner_confirmed"].includes(String(body.verification_status)) ? body.verification_status : "unverified";
  if ("is_featured" in body) payload.is_featured = Boolean(body.is_featured);
  if ("is_published" in body) payload.is_published = Boolean(body.is_published);
  if ("sort_order" in body) payload.sort_order = Number(body.sort_order ?? 0) || 0;
  payload.updated_at = new Date().toISOString();

  if (!String(payload.name ?? "resource").trim() || ("categories" in payload && (payload.categories as ResourceCategory[]).length === 0)) {
    return NextResponse.json({ error: "Nombre y categoría son obligatorios." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("community_resources").update(payload).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("community_resources").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
