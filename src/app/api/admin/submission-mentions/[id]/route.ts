import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { applyResolvedSubmissionRelations } from "@/lib/submissions/server";
import type { SubmissionType } from "@/lib/submissions/analysis";

const SUBMISSION_TABLES = {
  event: "event_submissions",
  academy: "academy_submissions",
  teacher: "teacher_submissions",
  spot: "spot_submissions"
} as const;

const VALID_STATUSES = new Set(["matched", "candidate", "ignored"]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const status = String(body.status ?? "");
  if (!VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: "Estado no válido." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: current, error: loadError } = await supabase
    .from("submission_mentions")
    .select("suggested_match_id,submission_type,submission_id")
    .eq("id", id)
    .single();
  if (loadError || !current) {
    return NextResponse.json({ error: "Referencia no encontrada." }, { status: 404 });
  }

  const resolvedEntityId = status === "matched"
    ? String(body.resolvedEntityId || current.suggested_match_id || "") || null
    : null;
  if (status === "matched" && !resolvedEntityId) {
    return NextResponse.json({ error: "Selecciona una coincidencia." }, { status: 400 });
  }

  const { error } = await supabase.from("submission_mentions").update({
    resolution_status: status,
    resolved_entity_id: resolvedEntityId,
    resolved_at: new Date().toISOString()
  }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (status === "matched") {
    const submissionType = current.submission_type as SubmissionType;
    const submissionTable = SUBMISSION_TABLES[submissionType];
    const { data: submission } = await supabase
      .from(submissionTable)
      .select("published_entity_id")
      .eq("id", current.submission_id)
      .maybeSingle();
    if (submission?.published_entity_id) {
      await applyResolvedSubmissionRelations(
        supabase,
        submissionType,
        String(current.submission_id),
        String(submission.published_entity_id)
      );
    }
  }

  return NextResponse.json({ ok: true });
}
