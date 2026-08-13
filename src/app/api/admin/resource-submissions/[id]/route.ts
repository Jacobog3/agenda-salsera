import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function generateSlug(name: string) {
  return `${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 70)}-${Date.now().toString(36)}`;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  const { action, resourceId } = await request.json() as { action?: string; resourceId?: string };
  const supabase = createSupabaseAdminClient();

  if (action === "dismiss") {
    const { error } = await supabase.from("resource_submissions").update({ status: "dismissed", updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "resolve") {
    const { data, error } = await supabase
      .from("resource_submissions")
      .update({ status: "resolved", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "pending")
      .eq("resource_id", String(resourceId ?? ""))
      .in("submission_type", ["update", "report"])
      .select("id")
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "La solicitud ya no está pendiente para este recurso." }, { status: 409 });
    return NextResponse.json({ ok: true });
  }

  if (action !== "create_draft") {
    return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
  }

  const { data: submission, error: submissionError } = await supabase
    .from("resource_submissions")
    .select("*")
    .eq("id", id)
    .eq("status", "pending")
    .maybeSingle();
  if (submissionError) return NextResponse.json({ error: submissionError.message }, { status: 500 });
  if (!submission) return NextResponse.json({ error: "La sugerencia ya fue procesada." }, { status: 409 });
  if (submission.submission_type !== "new") {
    return NextResponse.json({ error: "Las correcciones deben aplicarse al recurso existente." }, { status: 400 });
  }

  const { data: resource, error: resourceError } = await supabase
    .from("community_resources")
    .insert({
      slug: generateSlug(String(submission.name)),
      name: submission.name,
      resource_kind: submission.resource_kind,
      categories: submission.categories,
      description_es: submission.description ?? "",
      description_en: submission.description ?? "",
      city: submission.city,
      country_code: submission.country_code,
      instagram_url: submission.instagram,
      whatsapp_url: submission.whatsapp,
      website_url: submission.website,
      source_url: submission.instagram ?? submission.website,
      source_label: submission.submitter_relationship === "owner" ? "Enviado por responsable declarado" : "Recomendación de la comunidad",
      verification_status: "unverified",
      is_featured: false,
      is_published: false
    })
    .select("id")
    .single();
  if (resourceError) return NextResponse.json({ error: resourceError.message }, { status: 500 });

  const { error: updateError } = await supabase
    .from("resource_submissions")
    .update({ status: "draft_created", created_resource_id: resource.id, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ ok: true, resourceId: resource.id });
}
