import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { resolveCandidateAfterCreate } from "@/lib/admin/candidate-resolution";
import { normalizeCountryCode } from "@/lib/locations";
import { normalizeCityName } from "@/lib/utils/normalize-city";

function generateSlug(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80) + `-${Date.now().toString(36)}`
  );
}

function emptyToNull(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const format = request.nextUrl.searchParams.get("format");
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("organizers")
    .select("*")
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (format === "options") {
    return NextResponse.json({
      data: [
        { value: "", label: "Sin relacionar" },
        ...(data ?? []).map((organizer) => ({
          value: organizer.id,
          label: organizer.name
        }))
      ]
    });
  }

  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const countryCode = normalizeCountryCode(body.country_code ?? body.countryCode);
  const city = normalizeCityName(body.city, countryCode);
  const candidateId = String(body.candidate_id ?? "").trim();
  if (!name || !city || !countryCode) {
    return NextResponse.json(
      { error: "Nombre, ciudad y país son obligatorios." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("organizers").insert({
    slug: generateSlug(name),
    name,
    description_es: String(body.description_es ?? "").trim(),
    description_en: String(body.description_en ?? body.description_es ?? "").trim(),
    city,
    country_code: countryCode,
    area: emptyToNull(body.area),
    address: emptyToNull(body.address),
    whatsapp_url: emptyToNull(body.whatsapp_url),
    instagram_url: emptyToNull(body.instagram_url),
    facebook_url: emptyToNull(body.facebook_url),
    website_url: emptyToNull(body.website_url),
    is_featured: Boolean(body.is_featured),
    is_published: body.is_published === true
  }).select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const candidateLinked = candidateId
    ? await resolveCandidateAfterCreate(supabase, candidateId, "organizer", data.id)
    : false;

  return NextResponse.json({ data, candidateLinked });
}
