import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/utils/env";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.name || !body.city) {
    return NextResponse.json({ error: "Missing required fields: name, city" }, { status: 400 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ ok: true, note: "Supabase not configured, submission logged only" });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("academy_submissions").insert({
    name: body.name,
    description: body.description || null,
    city: body.city,
    address: body.address || null,
    styles: body.styles || null,
    schedule_text: body.scheduleText || null,
    levels: body.levels || null,
    trial_class: body.trialClass ?? false,
    modality: body.modality || "presencial",
    image_url: body.image_url || null,
    dance_style: body.danceStyle || "salsa_bachata",
    whatsapp: body.whatsapp || null,
    instagram: body.instagram || null,
    website: body.website || null,
    contact_name: body.contactName || null,
    status: "pending"
  });

  if (error) {
    console.error("[academy-submissions]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
