import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { autoTranslateSpanishFields } from "@/lib/admin/auto-translate";
import { submitIndexNowEntity } from "@/lib/seo/indexnow";
import { normalizeCityName } from "@/lib/utils/normalize-city";
import { normalizeCountryCode } from "@/lib/locations";
import { applyResolvedSubmissionRelations } from "@/lib/submissions/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("academy_submissions")
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
    { sourceKey: "description", targetKey: "description_en", label: "Academy description" }
  ]);
  const supabase = createSupabaseAdminClient();

  const slug = body.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .substring(0, 80)
    + `-${Date.now()}`;
  const countryCode = normalizeCountryCode(body.country_code ?? body.countryCode);
  if (!countryCode || !String(body.city ?? "").trim()) {
    return NextResponse.json({ error: "Ciudad y país son obligatorios." }, { status: 400 });
  }

  const { data: inserted, error: insertError } = await supabase.from("academies").insert({
    slug,
    name: body.name,
    description_es: body.description || "",
    description_en: body.description_en || body.description || "",
    cover_image_url: body.image_url || "",
    city: normalizeCityName(body.city, countryCode),
    country_code: countryCode,
    address: body.address || null,
    area: null,
    styles_taught: body.styles
      ? body.styles.split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean)
      : [],
    schedule_text: body.schedule_text || null,
    levels: body.levels || null,
    trial_class: body.trial_class ?? false,
    modality: body.modality || "presencial",
    whatsapp_url: body.whatsapp || null,
    instagram_url: body.instagram || null,
    website_url: body.website || null,
    is_featured: false,
    is_published: true
  }).select("id,slug").single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await supabase
    .from("academy_submissions")
    .update({ status: "approved", published_entity_id: inserted?.id ?? null })
    .eq("id", id);

  if (inserted?.id) {
    await applyResolvedSubmissionRelations(supabase, "academy", id, inserted.id);
  }

  await submitIndexNowEntity({ type: "academy", slug: inserted?.slug ?? slug });

  return NextResponse.json({ ok: true });
}
