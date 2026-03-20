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

function emptyToNull(value: unknown) {
  const text = String(value ?? "").trim();
  return text ? text : null;
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const rawBody = await request.json();
  const body = await autoTranslateSpanishFields(rawBody, [
    { sourceKey: "description_es", targetKey: "description_en", label: "Spot description" },
    { sourceKey: "schedule_es", targetKey: "schedule_en", label: "Spot schedule" },
    { sourceKey: "cover_charge_es", targetKey: "cover_charge_en", label: "Spot cover charge" }
  ]);

  if (!String(body.name ?? "").trim() || !String(body.city ?? "").trim()) {
    return NextResponse.json(
      { error: "Nombre y ciudad son obligatorios." },
      { status: 400 }
    );
  }

  if (!String(body.cover_image_url ?? "").trim()) {
    return NextResponse.json(
      { error: "La imagen principal del lugar es obligatoria." },
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
    city: String(body.city).trim(),
    area: emptyToNull(body.area),
    address: emptyToNull(body.address),
    schedule_es: String(body.schedule_es ?? "").trim(),
    schedule_en: String(body.schedule_en ?? body.schedule_es ?? "").trim(),
    cover_charge_es: emptyToNull(body.cover_charge_es),
    cover_charge_en: emptyToNull(body.cover_charge_en ?? body.cover_charge_es),
    whatsapp_url: emptyToNull(body.whatsapp_url),
    instagram_url: emptyToNull(body.instagram_url),
    google_maps_url: emptyToNull(body.google_maps_url),
    is_featured: Boolean(body.is_featured),
    is_published: body.is_published !== false
  };

  const { data, error } = await supabase
    .from("spots")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
