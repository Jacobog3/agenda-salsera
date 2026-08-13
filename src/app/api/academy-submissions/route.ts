import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/utils/env";
import { normalizeCountryCode } from "@/lib/locations";
import { getSiteCountryByCode } from "@/lib/site-countries";
import {
  buildSubmissionMetadata,
  findExistingSubmission,
  persistSubmissionMentions
} from "@/lib/submissions/server";

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  const fieldErrors: Record<string, string> = {};

  if (!String(body.name ?? "").trim()) {
    fieldErrors.name = "required";
  }

  if (!String(body.city ?? "").trim()) {
    fieldErrors.city = "required";
  }

  const countryCode = normalizeCountryCode(body.countryCode);
  if (!getSiteCountryByCode(countryCode)) {
    fieldErrors.countryCode = "required";
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
  const metadata = buildSubmissionMetadata("academy", body, [
    body.name,
    body.city,
    body.countryCode,
    body.instagram,
    body.address
  ]);
  const existing = await findExistingSubmission(supabase, "academy_submissions", metadata);
  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true, submissionId: existing.id });
  }

  const { data: inserted, error } = await supabase.from("academy_submissions").insert({
    name: body.name,
    description: body.description || null,
    city: body.city,
    country_code: countryCode,
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
    status: "pending",
    ...metadata
  }).select("id").single();

  if (error) {
    console.error("[academy-submissions] Failed to create submission", {
      error: error.message,
      name: body.name,
      city: body.city
    });
    return NextResponse.json(
      { error: "No pudimos enviar tu academia ahorita. Intenta de nuevo más tarde." },
      { status: 500 }
    );
  }

  if (inserted?.id) {
    await persistSubmissionMentions(supabase, "academy", inserted.id, metadata.review_signals);
  }

  return NextResponse.json({ ok: true, submissionId: inserted?.id });
}
