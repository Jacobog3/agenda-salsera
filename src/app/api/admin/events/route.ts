import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { autoTranslateSpanishFields } from "@/lib/admin/auto-translate";
import { isSupabaseConfigured } from "@/lib/utils/env";

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80) + `-${Date.now().toString(36)}`
  );
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    );
  }

  const rawBody = await request.json();
  const body = await autoTranslateSpanishFields(rawBody, [
    { sourceKey: "title_es", targetKey: "title_en", label: "Event title" },
    { sourceKey: "description_es", targetKey: "description_en", label: "Event description" }
  ]);

  if (!body.title_es || !body.city || !body.venue_name || !body.starts_at) {
    return NextResponse.json(
      { error: "Missing required fields: title, city, venue, date" },
      { status: 400 }
    );
  }

  const slug = generateSlug(body.title_es);

  try {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("events")
      .insert({
        slug,
        title_es: body.title_es,
        title_en: body.title_en || body.title_es,
        description_es: body.description_es || "",
        description_en: body.description_en || body.description_es || "",
        cover_image_url: body.cover_image_url || "",
        gallery_urls: Array.isArray(body.gallery_urls) ? body.gallery_urls : [],
        dance_style: body.dance_style || "salsa_bachata",
        city: body.city,
        area: body.area || null,
        venue_name: body.venue_name,
        address: body.address || null,
        starts_at: body.starts_at,
        ends_at: body.ends_at || null,
        price_amount: body.price_amount ?? null,
        price_text: body.price_text || null,
        currency: body.currency || "GTQ",
        organizer_name: body.organizer_name || "",
        contact_url: body.contact_url || "",
        is_featured: body.is_featured || false,
        is_published: true
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id, slug: data.slug });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create event" },
      { status: 500 }
    );
  }
}
