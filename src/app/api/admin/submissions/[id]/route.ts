import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { autoTranslateSpanishFields } from "@/lib/admin/auto-translate";
import { submitIndexNowEntity } from "@/lib/seo/indexnow";
import { normalizeCityName } from "@/lib/utils/normalize-city";
import {
  getDefaultCurrency,
  getDefaultTimeZone,
  normalizeCountryCode,
  zonedDateTimeToIso
} from "@/lib/locations";
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
    .from("event_submissions")
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
    { sourceKey: "title", targetKey: "title_en", label: "Event title" },
    { sourceKey: "description", targetKey: "description_en", label: "Event description" }
  ]);
  const supabase = createSupabaseAdminClient();

  const slug = body.title
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
  const timeZone = String(body.time_zone ?? body.timeZone ?? getDefaultTimeZone(countryCode));
  const startsAt = body.date && body.time
    ? zonedDateTimeToIso(body.date, body.time, timeZone)
    : body.date
      ? zonedDateTimeToIso(body.date, "20:00", timeZone)
      : null;

  const { data: inserted, error: insertError } = await supabase.from("events").insert({
    slug,
    title_es: body.title,
    title_en: body.title_en || body.title,
    description_es: body.description || "",
    description_en: body.description_en || body.description || "",
    cover_image_url: body.image_url || "",
    gallery_urls: [],
    dance_style: body.dance_style || "salsa_bachata",
    city: normalizeCityName(body.city, countryCode),
    country_code: countryCode,
    time_zone: timeZone,
    area: body.address || null,
    venue_name: body.venue_name || "",
    address: body.address || null,
    starts_at: startsAt,
    price_amount: null,
    price_text: body.price_text || null,
    currency: body.currency || getDefaultCurrency(countryCode),
    organizer_name: body.organizer_name || null,
    contact_url: body.contact_url || null,
    is_featured: false,
    is_published: true
  }).select("id,slug").single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await supabase
    .from("event_submissions")
    .update({ status: "approved", published_entity_id: inserted?.id ?? null })
    .eq("id", id);

  if (inserted?.id) {
    await applyResolvedSubmissionRelations(supabase, "event", id, inserted.id);
  }

  await submitIndexNowEntity({ type: "event", slug: inserted?.slug ?? slug });

  return NextResponse.json({ ok: true });
}
