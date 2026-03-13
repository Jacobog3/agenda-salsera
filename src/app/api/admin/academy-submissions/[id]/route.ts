import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
  const { id } = await params;
  const body = await request.json();
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

  const { error: insertError } = await supabase.from("academies").insert({
    slug,
    name: body.name,
    description_es: body.description || "",
    description_en: body.description || "",
    cover_image_url: body.image_url || "",
    city: body.city || "Guatemala",
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
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await supabase
    .from("academy_submissions")
    .update({ status: "approved" })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}
