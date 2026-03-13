import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Reject a submission
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("event_submissions")
    .update({ status: "rejected" })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// Publish a submission → create event
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
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

  const startsAt = body.date && body.time
    ? `${body.date}T${body.time}:00-06:00`
    : body.date
      ? `${body.date}T20:00:00-06:00`
      : null;

  const { error: insertError } = await supabase.from("events").insert({
    slug,
    title_es: body.title,
    title_en: body.title,
    description_es: body.description || "",
    description_en: body.description || "",
    cover_image_url: body.image_url || "",
    gallery_urls: [],
    dance_style: body.dance_style || "salsa_bachata",
    city: body.city || "Guatemala",
    area: body.address || null,
    venue_name: body.venue_name || "",
    address: body.address || null,
    starts_at: startsAt,
    price_amount: null,
    price_text: body.price_text || null,
    currency: "GTQ",
    organizer_name: body.organizer_name || null,
    contact_url: body.contact_url || null,
    is_featured: false,
    is_published: true
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await supabase
    .from("event_submissions")
    .update({ status: "approved" })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}
