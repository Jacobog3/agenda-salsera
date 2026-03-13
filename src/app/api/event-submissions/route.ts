import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/utils/env";
import { eventSubmissionSchema } from "@/lib/validations/event-submission";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = eventSubmissionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    return NextResponse.json(
      { ok: false, error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("event_submissions").insert({
    title: parsed.data.title,
    description: parsed.data.description || null,
    image_url: parsed.data.imageUrl || null,
    dance_style: parsed.data.danceStyle,
    date: parsed.data.date,
    time: parsed.data.time,
    price_text: parsed.data.price || null,
    city: parsed.data.city,
    venue_name: parsed.data.venue,
    address: parsed.data.address || null,
    organizer_name: parsed.data.organizerName || null,
    contact_url: parsed.data.contactLink || null,
    status: "pending"
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
