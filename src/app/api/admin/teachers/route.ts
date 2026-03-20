import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { autoTranslateSpanishFields } from "@/lib/admin/auto-translate";

function generateSlug(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80) + `-${Date.now().toString(36)}`
  );
}

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

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const format = request.nextUrl.searchParams.get("format");
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (format === "options") {
    return NextResponse.json({
      data: (data ?? []).map((teacher) => ({
        value: teacher.id,
        label: teacher.name
      }))
    });
  }
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const rawBody = await request.json();
  const body = await autoTranslateSpanishFields(rawBody, [
    { sourceKey: "bio_es", targetKey: "bio_en", label: "Teacher bio" }
  ]);

  if (!String(body.name ?? "").trim() || !String(body.city ?? "").trim()) {
    return NextResponse.json(
      { error: "Nombre y ciudad son obligatorios." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const slug = generateSlug(String(body.name));

  const payload = {
    slug,
    name: String(body.name).trim(),
    bio_es: String(body.bio_es ?? "").trim(),
    bio_en: String(body.bio_en ?? body.bio_es ?? "").trim(),
    profile_image_url: emptyToNull(body.profile_image_url),
    banner_image_url: emptyToNull(body.banner_image_url),
    city: String(body.city).trim(),
    area: emptyToNull(body.area),
    address: emptyToNull(body.address),
    styles_taught: normalizeStyles(body.styles_taught),
    levels: emptyToNull(body.levels),
    modality: emptyToNull(body.modality),
    class_formats: parseStringList(body.class_formats),
    teaching_zones: parseStringList(body.teaching_zones),
    teaching_venues: parseStringList(body.teaching_venues),
    schedule_text: emptyToNull(body.schedule_text),
    schedule_data: null,
    booking_url: emptyToNull(body.booking_url),
    whatsapp_url: emptyToNull(body.whatsapp_url),
    instagram_url: emptyToNull(body.instagram_url),
    facebook_url: emptyToNull(body.facebook_url),
    website_url: emptyToNull(body.website_url),
    trial_class: Boolean(body.trial_class),
    price_text: emptyToNull(body.price_text),
    is_featured: Boolean(body.is_featured),
    is_published: body.is_published !== false
  };

  const { data, error } = await supabase
    .from("teachers")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
