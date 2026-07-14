import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { autoTranslateSpanishFields } from "@/lib/admin/auto-translate";
import { submitIndexNowEntity } from "@/lib/seo/indexnow";
import { normalizeGuatemalaCityName } from "@/lib/utils/normalize-city";
import { inferEventRelations } from "@/lib/admin/event-relations";

function normalizeNullableId(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function normalizeTeacherIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((entry) => String(entry ?? "").trim()).filter(Boolean))];
}

function normalizeDateStatus(value: unknown) {
  return value === "coming_soon" ? "coming_soon" : "confirmed";
}

function isSchemaCacheColumnError(error: { message?: string; code?: string } | null) {
  const message = error?.message ?? "";
  return error?.code === "PGRST204" || /schema cache|date_label|date_status/i.test(message);
}

function schemaMigrationErrorResponse() {
  return NextResponse.json(
    {
      error:
        "Falta aplicar la migración de fechas flexibles en Supabase. Ejecuta supabase/migrations/20260519_event_date_status.sql y recarga el schema cache."
    },
    { status: 500 }
  );
}

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
  const teacherIds = normalizeTeacherIds(body.teacher_ids);
  delete body.teacher_ids;

  const { data: existing, error: existingError } = await supabase
    .from("events")
    .select("slug, cover_image_url, is_published, title_es, organizer_name, organizer_id, academy_id, venue_name")
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
  if ("city" in body) {
    body.city = normalizeGuatemalaCityName(body.city);
  }
  const organizerIdWasSubmitted = "organizer_id" in body;
  const academyIdWasSubmitted = "academy_id" in body;
  body.organizer_id = organizerIdWasSubmitted
    ? normalizeNullableId(body.organizer_id)
    : existing?.organizer_id ?? null;
  body.academy_id = academyIdWasSubmitted
    ? normalizeNullableId(body.academy_id)
    : existing?.academy_id ?? null;
  const relations = await inferEventRelations(supabase, {
    title_es: body.title_es ?? existing?.title_es,
    organizer_name: body.organizer_name ?? existing?.organizer_name,
    venue_name: body.venue_name ?? existing?.venue_name,
    organizer_id: body.organizer_id,
    academy_id: body.academy_id
  }, {
    inferOrganizer: !(organizerIdWasSubmitted && existing?.organizer_id && body.organizer_id === null),
    inferAcademy: !(academyIdWasSubmitted && existing?.academy_id && body.academy_id === null)
  });
  body.organizer_name = relations.organizer_name;
  body.organizer_id = relations.organizer_id;
  body.academy_id = relations.academy_id;
  body.date_status = normalizeDateStatus(body.date_status);

  if (body.date_status === "coming_soon") {
    body.starts_at = null;
    body.ends_at = null;
    body.date_label = String(body.date_label ?? "Próximamente").trim() || "Próximamente";
  } else {
    body.date_label = null;
    if (!body.starts_at) {
      return NextResponse.json(
        { error: "La fecha de inicio es obligatoria." },
        { status: 400 }
      );
    }
  }

  const { data: updated, error } = await supabase
    .from("events")
    .update(body)
    .eq("id", id)
    .select("slug, is_published")
    .single();

  if (error) {
    if (isSchemaCacheColumnError(error)) {
      return schemaMigrationErrorResponse();
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error: deleteTeacherLinksError } = await supabase
    .from("event_teachers")
    .delete()
    .eq("event_id", id);

  if (deleteTeacherLinksError) {
    return NextResponse.json({ error: deleteTeacherLinksError.message }, { status: 500 });
  }

  if (teacherIds.length > 0) {
    const { error: insertTeacherLinksError } = await supabase
      .from("event_teachers")
      .insert(
        teacherIds.map((teacherId) => ({
          event_id: id,
          teacher_id: teacherId
        }))
      );

    if (insertTeacherLinksError) {
      return NextResponse.json({ error: insertTeacherLinksError.message }, { status: 500 });
    }
  }

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
