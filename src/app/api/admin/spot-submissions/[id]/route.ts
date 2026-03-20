import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { autoTranslateSpanishFields } from "@/lib/admin/auto-translate";
import { submitIndexNowEntity } from "@/lib/seo/indexnow";

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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("spot_submissions")
    .update({ status: "rejected" })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  const rawBody = await request.json();
  const body = await autoTranslateSpanishFields(rawBody, [
    { sourceKey: "description", targetKey: "description_en", label: "Spot description" },
    { sourceKey: "schedule", targetKey: "schedule_en", label: "Spot schedule" },
    { sourceKey: "cover_charge", targetKey: "cover_charge_en", label: "Spot cover charge" }
  ]);

  if (!String(body.name ?? "").trim() || !String(body.city ?? "").trim()) {
    return NextResponse.json(
      { error: "Nombre y ciudad son obligatorios." },
      { status: 400 }
    );
  }

  if (!String(body.image_url ?? "").trim()) {
    return NextResponse.json(
      { error: "La imagen principal del lugar es obligatoria para publicarlo." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const slug = generateSlug(String(body.name));

  const { data: inserted, error: insertError } = await supabase
    .from("spots")
    .insert({
      slug,
      name: String(body.name).trim(),
      description_es: String(body.description ?? "").trim(),
      description_en: String(body.description_en ?? body.description ?? "").trim(),
      cover_image_url: String(body.image_url).trim(),
      city: String(body.city).trim(),
      area: emptyToNull(body.area),
      address: emptyToNull(body.address),
      schedule_es: String(body.schedule ?? "").trim(),
      schedule_en: String(body.schedule_en ?? body.schedule ?? "").trim(),
      cover_charge_es: emptyToNull(body.cover_charge),
      cover_charge_en: emptyToNull(body.cover_charge_en ?? body.cover_charge),
      whatsapp_url: emptyToNull(body.whatsapp),
      instagram_url: emptyToNull(body.instagram),
      google_maps_url: emptyToNull(body.google_maps_url),
      is_featured: false,
      is_published: true
    })
    .select("slug")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await supabase
    .from("spot_submissions")
    .update({ status: "approved" })
    .eq("id", id);

  await submitIndexNowEntity({ type: "spot", slug: inserted?.slug ?? slug });

  return NextResponse.json({ ok: true });
}
