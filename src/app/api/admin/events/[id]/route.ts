import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { autoTranslateSpanishFields } from "@/lib/admin/auto-translate";
import { submitIndexNowEntity } from "@/lib/seo/indexnow";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  const rawBody = await request.json();
  const forceAutoTranslate = Boolean(rawBody.force_auto_translate);
  delete rawBody.force_auto_translate;
  const body = await autoTranslateSpanishFields(rawBody, [
    { sourceKey: "title_es", targetKey: "title_en", label: "Event title" },
    { sourceKey: "description_es", targetKey: "description_en", label: "Event description" }
  ], { force: forceAutoTranslate });
  const supabase = createSupabaseAdminClient();

  const { data: existing, error: existingError } = await supabase
    .from("events")
    .select("slug, cover_image_url, is_published")
    .eq("id", id)
    .single();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const finalCoverImageUrl = String(
    body.cover_image_url ?? existing?.cover_image_url ?? ""
  ).trim();

  if (!finalCoverImageUrl) {
    return NextResponse.json(
      { error: "El flyer principal es obligatorio." },
      { status: 400 }
    );
  }

  body.cover_image_url = finalCoverImageUrl;

  const { data: updated, error } = await supabase
    .from("events")
    .update(body)
    .eq("id", id)
    .select("slug, is_published")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await submitIndexNowEntity({
    type: "event",
    slug: updated?.is_published === false ? null : updated?.slug,
    previousSlug: existing?.is_published === false ? null : existing?.slug
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  const supabase = createSupabaseAdminClient();

  const { data: existing } = await supabase
    .from("events")
    .select("slug, is_published")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await submitIndexNowEntity({
    type: "event",
    previousSlug: existing?.is_published === false ? null : existing?.slug
  });

  return NextResponse.json({ ok: true });
}
