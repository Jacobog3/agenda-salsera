import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/utils/env";

export async function POST(request: Request) {
  const body = await request.json();
  const fieldErrors: Record<string, string> = {};

  if (!String(body.name ?? "").trim()) {
    fieldErrors.name = "required";
  }

  if (!String(body.city ?? "").trim()) {
    fieldErrors.city = "required";
  }

  if (!String(body.image_url ?? "").trim()) {
    fieldErrors.imageUrl = "required";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { error: "Review the required fields.", fieldErrors },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ ok: true, note: "Supabase not configured, submission logged only" });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("teacher_submissions").insert({
    name: body.name,
    description: body.description || null,
    city: body.city,
    address: body.address || null,
    styles: body.styles || null,
    levels: body.levels || null,
    modality: body.modality || "presencial",
    class_formats: body.classFormats || null,
    teaching_venues: body.teachingVenues || null,
    schedule_text: body.scheduleText || null,
    image_url: body.image_url || null,
    whatsapp: body.whatsapp || null,
    instagram: body.instagram || null,
    website: body.website || null,
    booking_url: body.bookingUrl || null,
    contact_name: body.contactName || null,
    status: "pending"
  });

  if (error) {
    console.error("[teacher-submissions] Failed to create submission", {
      error: error.message,
      name: body.name,
      city: body.city
    });
    return NextResponse.json(
      { error: "No pudimos enviar tu perfil ahorita. Intenta de nuevo más tarde." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
