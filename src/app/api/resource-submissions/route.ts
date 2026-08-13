import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeCountryCode } from "@/lib/locations";
import { isSupabaseConfigured } from "@/lib/utils/env";
import type { ResourceCategory } from "@/types/resource";
import { getSiteCountryByCode } from "@/lib/site-countries";

const CATEGORIES: ResourceCategory[] = ["dancewear", "dj", "photography", "other"];

function emptyToNull(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

function normalizeWebUrl(value: string | null) {
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `https://${value.replace(/^\/+/, "")}`;
}

function normalizeWhatsApp(value: string | null) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const digits = value.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  const submissionType = ["update", "report"].includes(String(body.submissionType))
    ? String(body.submissionType) as "update" | "report"
    : "new";
  const name = String(body.name ?? "").trim();
  const category = String(body.category ?? "") as ResourceCategory;
  const instagram = emptyToNull(body.instagram);
  const whatsapp = normalizeWhatsApp(emptyToNull(body.whatsapp));
  const website = normalizeWebUrl(emptyToNull(body.website));
  const countryCode = normalizeCountryCode(body.countryCode);

  const description = emptyToNull(body.description);
  if (
    !name
    || !getSiteCountryByCode(countryCode)
    || !CATEGORIES.includes(category)
    || (submissionType === "new" && !instagram && !whatsapp && !website)
    || (submissionType !== "new" && !description)
  ) {
    return NextResponse.json(
      { error: "Completa el nombre, la categoría y al menos una forma de contacto." },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ ok: true, note: "Supabase not configured" });
  }

  const supabase = createSupabaseAdminClient();
  const relationship = body.relationship === "owner" ? "owner" : "recommendation";
  const normalizedInstagram = instagram
    ? instagram.startsWith("@")
      ? `https://www.instagram.com/${instagram.slice(1).replace(/\/$/, "")}/`
      : /^https?:\/\//i.test(instagram) || instagram.includes("instagram.com/")
        ? normalizeWebUrl(instagram)
        : /^[a-z0-9._]+$/i.test(instagram)
          ? `https://www.instagram.com/${instagram}/`
          : normalizeWebUrl(instagram)
    : null;

  let resourceId: string | null = null;
  if (submissionType !== "new") {
    const resourceSlug = String(body.resourceSlug ?? "").trim();
    const { data: resource } = await supabase
      .from("community_resources")
      .select("id,name,categories")
      .eq("slug", resourceSlug)
      .eq("country_code", countryCode)
      .eq("is_published", true)
      .maybeSingle();
    if (!resource) {
      return NextResponse.json({ error: "El recurso ya no está disponible." }, { status: 404 });
    }
    resourceId = String(resource.id);
  }

  if (submissionType === "new" && normalizedInstagram) {
    const { data: published } = await supabase
      .from("community_resources")
      .select("id")
      .eq("instagram_url", normalizedInstagram)
      .eq("country_code", countryCode)
      .maybeSingle();
    if (published) return NextResponse.json({ ok: true, duplicate: true, resourceId: published.id });

    const { data: existing } = await supabase
      .from("resource_submissions")
      .select("id")
      .eq("instagram", normalizedInstagram)
      .eq("country_code", countryCode)
      .eq("status", "pending")
      .maybeSingle();
    if (existing) return NextResponse.json({ ok: true, duplicate: true, submissionId: existing.id });
  }

  const { data, error } = await supabase
    .from("resource_submissions")
    .insert({
      submission_type: submissionType,
      resource_id: resourceId,
      name,
      resource_kind: category === "dj" || category === "photography" ? "professional" : "business",
      categories: [category],
      description,
      city: emptyToNull(body.city),
      country_code: countryCode,
      instagram: normalizedInstagram,
      whatsapp,
      website,
      submitter_relationship: relationship,
      contact_name: emptyToNull(body.contactName),
      contact_email: emptyToNull(body.contactEmail),
      status: "pending"
    })
    .select("id")
    .single();

  if (error) {
    console.error("[resource-submissions] Failed to create submission", { message: error.message, name });
    return NextResponse.json({ error: "No pudimos enviar la recomendación. Intenta de nuevo más tarde." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, submissionId: data.id });
}
