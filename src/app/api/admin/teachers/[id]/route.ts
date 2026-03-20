import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { autoTranslateSpanishFields } from "@/lib/admin/auto-translate";
import { normalizeTeacherPayload } from "@/lib/admin/teacher-payload";
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

  const translatedBody = await autoTranslateSpanishFields(rawBody, [
    { sourceKey: "bio_es", targetKey: "bio_en", label: "Teacher bio" }
  ], { force: forceAutoTranslate });

  const body = normalizeTeacherPayload(translatedBody);
  const supabase = createSupabaseAdminClient();

  const { data: existing } = await supabase
    .from("teachers")
    .select("slug, is_published")
    .eq("id", id)
    .maybeSingle();

  const { data: updated, error } = await supabase
    .from("teachers")
    .update(body)
    .eq("id", id)
    .select("slug, is_published")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await submitIndexNowEntity({
    type: "teacher",
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
    .from("teachers")
    .select("slug, is_published")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("teachers")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await submitIndexNowEntity({
    type: "teacher",
    previousSlug: existing?.is_published === false ? null : existing?.slug
  });

  return NextResponse.json({ ok: true });
}
