import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { autoTranslateSpanishFields } from "@/lib/admin/auto-translate";

function parseStringList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry ?? "").trim()).filter(Boolean);
  }

  const text = String(value ?? "").trim();
  if (!text) return [];

  return text
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeStyles(value: unknown) {
  const map: Record<string, "salsa" | "bachata" | "salsa_bachata" | "other"> = {
    salsa: "salsa",
    bachata: "bachata",
    "salsa y bachata": "salsa_bachata",
    salsa_bachata: "salsa_bachata",
    other: "other",
    otro: "other"
  };

  return parseStringList(value)
    .map((entry) => map[entry.toLowerCase()] ?? null)
    .filter(Boolean);
}

function emptyToNull(value: unknown) {
  const text = String(value ?? "").trim();
  return text ? text : null;
}

function normalizeTeacherPayload(rawBody: Record<string, unknown>) {
  return {
    ...rawBody,
    area: emptyToNull(rawBody.area),
    address: emptyToNull(rawBody.address),
    levels: emptyToNull(rawBody.levels),
    modality: emptyToNull(rawBody.modality),
    profile_image_url: emptyToNull(rawBody.profile_image_url),
    banner_image_url: emptyToNull(rawBody.banner_image_url),
    schedule_text: emptyToNull(rawBody.schedule_text),
    booking_url: emptyToNull(rawBody.booking_url),
    whatsapp_url: emptyToNull(rawBody.whatsapp_url),
    instagram_url: emptyToNull(rawBody.instagram_url),
    website_url: emptyToNull(rawBody.website_url),
    price_text: emptyToNull(rawBody.price_text),
    styles_taught: normalizeStyles(rawBody.styles_taught),
    class_formats: parseStringList(rawBody.class_formats),
    teaching_zones: parseStringList(rawBody.teaching_zones),
    teaching_venues: parseStringList(rawBody.teaching_venues)
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  const rawBody = await request.json();
  const forceAutoTranslate = Boolean(rawBody.force_auto_translate);
  delete rawBody.force_auto_translate;

  const translatedBody = await autoTranslateSpanishFields(rawBody, [
    { sourceKey: "bio_es", targetKey: "bio_en", label: "Teacher bio" }
  ], { force: forceAutoTranslate });

  const body = normalizeTeacherPayload(translatedBody);
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("teachers")
    .update(body)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("teachers")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
