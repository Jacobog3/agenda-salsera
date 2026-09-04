import { normalizeMentionName, type MentionEntityType, type SubmissionType } from "@/lib/submissions/analysis";
import { applyResolvedSubmissionRelations } from "@/lib/submissions/server";

type AdminSupabaseClient = ReturnType<
  typeof import("@/lib/supabase/admin").createSupabaseAdminClient
>;

type CanonicalTarget = "academy" | "teacher" | "spot" | "organizer";

const EXPECTED_MENTION_TYPE: Record<CanonicalTarget, MentionEntityType> = {
  academy: "academy",
  teacher: "professional",
  spot: "spot",
  organizer: "organizer"
};

export async function rememberEntityAlias(
  supabase: AdminSupabaseClient,
  entityType: MentionEntityType,
  entityId: string,
  alias: string
) {
  const normalizedAlias = normalizeMentionName(alias);
  if (!normalizedAlias) return;

  const { error } = await supabase.from("entity_aliases").upsert({
    entity_type: entityType,
    entity_id: entityId,
    alias: alias.trim(),
    normalized_alias: normalizedAlias,
    source: "admin_resolution"
  }, {
    onConflict: "entity_type,entity_id,normalized_alias",
    ignoreDuplicates: true
  });

  if (error) {
    console.error("[entity-aliases] Failed to remember alias", {
      entityType,
      entityId,
      error: error.message
    });
  }
}

const SUBMISSION_TABLES: Record<SubmissionType, string> = {
  event: "event_submissions",
  academy: "academy_submissions",
  teacher: "teacher_submissions",
  spot: "spot_submissions"
};

const CANONICAL_TABLES: Record<SubmissionType, string> = {
  event: "events",
  academy: "academies",
  teacher: "teachers",
  spot: "spots"
};

export async function resolveCandidateAfterCreate(
  supabase: AdminSupabaseClient,
  candidateId: string,
  target: CanonicalTarget,
  createdEntityId: string
) {
  if (!/^[0-9a-f-]{36}$/i.test(candidateId)) return false;

  const { data: candidate, error: candidateError } = await supabase
    .from("submission_mentions")
    .select("id,entity_type,display_name,submission_type,submission_id,resolution_status")
    .eq("id", candidateId)
    .maybeSingle();

  if (
    candidateError ||
    !candidate ||
    candidate.resolution_status !== "candidate" ||
    candidate.entity_type !== EXPECTED_MENTION_TYPE[target]
  ) {
    return false;
  }

  const { error: resolutionError } = await supabase
    .from("submission_mentions")
    .update({
      resolution_status: "matched",
      resolved_entity_id: createdEntityId,
      resolved_at: new Date().toISOString()
    })
    .eq("id", candidateId);

  if (resolutionError) return false;

  await rememberEntityAlias(
    supabase,
    candidate.entity_type as MentionEntityType,
    createdEntityId,
    String(candidate.display_name)
  );

  const submissionType = candidate.submission_type as SubmissionType;
  const { data: submission } = await supabase
    .from(SUBMISSION_TABLES[submissionType])
    .select("published_entity_id")
    .eq("id", candidate.submission_id)
    .maybeSingle();

  let publishedEntityId = submission?.published_entity_id
    ? String(submission.published_entity_id)
    : "";

  if (!publishedEntityId) {
    const { data: canonicalEntity } = await supabase
      .from(CANONICAL_TABLES[submissionType])
      .select("id")
      .eq("id", candidate.submission_id)
      .maybeSingle();
    publishedEntityId = canonicalEntity?.id ? String(canonicalEntity.id) : "";
  }

  if (publishedEntityId) {
    await applyResolvedSubmissionRelations(
      supabase,
      submissionType,
      String(candidate.submission_id),
      publishedEntityId
    );
  }

  return true;
}
