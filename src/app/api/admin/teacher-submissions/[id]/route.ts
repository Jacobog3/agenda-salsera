import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { autoTranslateSpanishFields } from "@/lib/admin/auto-translate";

function splitCommaList(value: string | null | undefined) {
  return value
    ? value.split(",").map((item) => item.trim()).filter(Boolean)
    : [];
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
    .from("teacher_submissions")
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
    { sourceKey: "description", targetKey: "bio_en", label: "Teacher bio" }
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

  const styles = splitCommaList(body.styles).map((style) => style.toLowerCase());
  const normalizedStyles = styles.filter((style) =>
    ["salsa", "bachata", "salsa_bachata", "other"].includes(style)
  );

  const { error: insertError } = await supabase.from("teachers").insert({
    slug,
    name: body.name,
    bio_es: body.description || "",
    bio_en: body.bio_en || body.description || "",
    profile_image_url: body.image_url || null,
    banner_image_url: null,
    city: body.city || "Guatemala",
    area: null,
    address: body.address || null,
    styles_taught: normalizedStyles,
    levels: body.levels || null,
    modality: body.modality || "presencial",
    class_formats: splitCommaList(body.class_formats),
    teaching_venues: splitCommaList(body.teaching_venues),
    teaching_zones: [],
    schedule_text: body.schedule_text || null,
    schedule_data: null,
    booking_url: body.booking_url || null,
    whatsapp_url: body.whatsapp || null,
    instagram_url: body.instagram || null,
    website_url: body.website || null,
    trial_class: false,
    price_text: null,
    is_featured: false,
    is_published: true
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await supabase
    .from("teacher_submissions")
    .update({ status: "approved" })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}
