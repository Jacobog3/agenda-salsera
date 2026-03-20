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
    .from("academies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (format === "options") {
    return NextResponse.json({
      data: [
        { value: "", label: "Sin relacionar" },
        ...(data ?? []).map((academy) => ({
          value: academy.id,
          label: academy.name
        }))
      ]
    });
  }
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const rawBody = await request.json();
  const body = await autoTranslateSpanishFields(rawBody, [
    { sourceKey: "description_es", targetKey: "description_en", label: "Academy description" }
  ]);

  if (!String(body.name ?? "").trim() || !String(body.city ?? "").trim()) {
    return NextResponse.json(
      { error: "Nombre y ciudad son obligatorios." },
      { status: 400 }
    );
  }

  if (!String(body.cover_image_url ?? "").trim()) {
    return NextResponse.json(
      { error: "La imagen principal de la academia es obligatoria." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const slug = generateSlug(String(body.name));

  const payload = {
    slug,
    name: String(body.name).trim(),
    description_es: String(body.description_es ?? "").trim(),
    description_en: String(body.description_en ?? body.description_es ?? "").trim(),
    cover_image_url: String(body.cover_image_url).trim(),
    banner_image_url: emptyToNull(body.banner_image_url),
    city: String(body.city).trim(),
    area: emptyToNull(body.area),
    address: emptyToNull(body.address),
    styles_taught: parseStringList(body.styles_taught),
    schedule_text: emptyToNull(body.schedule_text),
    levels: emptyToNull(body.levels),
    trial_class: Boolean(body.trial_class),
    modality: emptyToNull(body.modality) ?? "presencial",
    whatsapp_url: emptyToNull(body.whatsapp_url),
    instagram_url: emptyToNull(body.instagram_url),
    facebook_url: emptyToNull(body.facebook_url),
    website_url: emptyToNull(body.website_url),
    is_featured: Boolean(body.is_featured),
    is_published: body.is_published !== false
  };

  const { data, error } = await supabase
    .from("academies")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
