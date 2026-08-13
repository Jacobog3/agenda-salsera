import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/utils/env";
import { eventSubmissionSchema } from "@/lib/validations/event-submission";
import { normalizeCountryCode } from "@/lib/locations";
import { getSiteCountryByCode } from "@/lib/site-countries";
import {
  buildSubmissionMetadata,
  findExistingSubmission,
  persistSubmissionMentions
} from "@/lib/submissions/server";

export async function POST(request: Request) {
  const payload = await request.json() as Record<string, unknown>;
  const parsed = eventSubmissionSchema.safeParse(payload);

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    const fieldErrors = Object.fromEntries(
      Object.entries(flattened)
        .filter(([, value]) => Array.isArray(value) && value.length > 0)
        .map(([key, value]) => [key, value[0]])
    );

    return NextResponse.json(
      { error: "Review the required fields.", fieldErrors },
      { status: 400 }
    );
  }

  const countryCode = normalizeCountryCode(parsed.data.countryCode);
  if (!getSiteCountryByCode(countryCode)) {
    return NextResponse.json(
      { error: "Review the required fields.", fieldErrors: { countryCode: "unsupported" } },
      { status: 400 }
    );
  }

  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    return NextResponse.json(
      { ok: false, error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const metadata = buildSubmissionMetadata("event", payload, [
    parsed.data.title,
    parsed.data.date,
    parsed.data.time,
    parsed.data.city,
    parsed.data.venue
  ]);
  const existing = await findExistingSubmission(supabase, "event_submissions", metadata);
  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true, submissionId: existing.id });
  }

  const { data: inserted, error } = await supabase.from("event_submissions").insert({
    title: parsed.data.title,
    description: parsed.data.description || null,
    image_url: parsed.data.imageUrl || null,
    dance_style: parsed.data.danceStyle,
    date: parsed.data.date,
    time: parsed.data.time,
    price_text: parsed.data.price || null,
    city: parsed.data.city,
    country_code: countryCode,
    time_zone: parsed.data.timeZone,
    venue_name: parsed.data.venue,
    address: parsed.data.address || null,
    organizer_name: parsed.data.organizerName || null,
    contact_url: parsed.data.contactLink || null,
    status: "pending",
    ...metadata
  }).select("id").single();

  if (error) {
    console.error("[event-submissions] Failed to create submission", {
      error: error.message,
      title: parsed.data.title,
      city: parsed.data.city
    });
    return NextResponse.json(
      { ok: false, error: "No pudimos enviar tu evento ahorita. Intenta de nuevo más tarde." },
      { status: 500 }
    );
  }

  if (inserted?.id) {
    await persistSubmissionMentions(
      supabase,
      "event",
      inserted.id,
      metadata.review_signals
    );
  }

  return NextResponse.json({ ok: true, submissionId: inserted?.id });
}
