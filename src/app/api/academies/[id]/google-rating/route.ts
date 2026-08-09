import { NextResponse } from "next/server";
import { getGooglePlaceRating } from "@/lib/google/places";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Invalid academy ID." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: academy, error } = await supabase
    .from("academies")
    .select("google_place_id")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !academy?.google_place_id) {
    return NextResponse.json(
      { rating: null },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const rating = await getGooglePlaceRating(academy.google_place_id);
  return NextResponse.json(
    { rating },
    { headers: { "Cache-Control": "no-store" } }
  );
}
