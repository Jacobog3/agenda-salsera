import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/utils/env";
import { normalizeCountryCode } from "@/lib/locations";
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

  if (!/^[A-Za-z]{2}$/.test(String(body.countryCode ?? "").trim())) {
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
  const metadata = buildSubmissionMetadata("spot", body, [
    body.name,
    body.city,
    body.countryCode,
    body.instagram,
    body.address
  ]);
  const existing = await findExistingSubmission(supabase, "spot_submissions", metadata);
  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true, submissionId: existing.id });
  }

  const { data: inserted, error } = await supabase.from("spot_submissions").insert({
    name: body.name,
    description: body.description || null,
    city: body.city,
    country_code: normalizeCountryCode(body.countryCode),
    address: body.address || null,
    image_url: body.image_url || null,
    schedule: body.schedule || null,
    cover_charge: body.cover_charge || null,
    whatsapp: body.whatsapp || null,
    instagram: body.instagram || null,
    contact_name: body.contact_name || null,
    status: "pending",
    ...metadata
  }).select("id").single();

  if (error) {
    console.error("[spot-submissions] Failed to create submission", {
      error: error.message,
      name: body.name,
      city: body.city
    });
    return NextResponse.json(
      { error: "No pudimos enviar tu lugar ahorita. Intenta de nuevo más tarde." },
      { status: 500 }
    );
  }

  if (inserted?.id) {
    await persistSubmissionMentions(supabase, "spot", inserted.id, metadata.review_signals);
  }

  return NextResponse.json({ ok: true, submissionId: inserted?.id });
}
