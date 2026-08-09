import { createHash } from "node:crypto";
import { getGeminiModel } from "@/lib/ai/gemini";
import {
  SUBMISSION_AI_VERSION,
  getReviewPriority,
  normalizeIdempotencyKey,
  normalizeMentionName,
  normalizeReviewSignals,
  normalizeSourceText,
  type ReviewSignals,
  type SubmissionType
} from "@/lib/submissions/analysis";

type AdminSupabaseClient = ReturnType<
  typeof import("@/lib/supabase/admin").createSupabaseAdminClient
>;

export function buildSubmissionMetadata(
  type: SubmissionType,
  body: Record<string, unknown>,
  fingerprintParts: unknown[]
) {
  const reviewSignals = normalizeReviewSignals(body.reviewSignals);
  const aiBasicStatus = body.aiBasicStatus === "completed"
    ? "completed"
    : body.aiBasicStatus === "failed"
      ? "failed"
      : "not_run";
  const fingerprintValue = [type, ...fingerprintParts]
    .map((part) => String(part ?? "").trim().toLocaleLowerCase("es"))
    .join("|");

  return {
    idempotency_key: normalizeIdempotencyKey(body.idempotencyKey),
    content_fingerprint: createHash("sha256").update(fingerprintValue).digest("hex"),
    source_text: normalizeSourceText(body.sourceText),
    review_signals: reviewSignals,
    review_priority: getReviewPriority(reviewSignals),
    ai_basic_status: aiBasicStatus,
    ai_basic_model: aiBasicStatus === "not_run" ? null : getGeminiModel(),
    ai_basic_version: aiBasicStatus === "not_run" ? null : SUBMISSION_AI_VERSION
  };
}

export async function findExistingSubmission(
  supabase: AdminSupabaseClient,
  table: "event_submissions" | "academy_submissions" | "teacher_submissions" | "spot_submissions",
  metadata: { idempotency_key: string | null; content_fingerprint: string }
) {
  if (metadata.idempotency_key) {
    const { data } = await supabase
      .from(table)
      .select("id,status")
      .eq("idempotency_key", metadata.idempotency_key)
      .maybeSingle();
    if (data) return data;
  }

  const { data } = await supabase
    .from(table)
    .select("id,status")
    .eq("content_fingerprint", metadata.content_fingerprint)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();

  return data ?? null;
}

export async function persistSubmissionMentions(
  supabase: AdminSupabaseClient,
  submissionType: SubmissionType,
  submissionId: string,
  reviewSignals: ReviewSignals,
  detectedBy: "basic_ai" | "advanced_ai" | "admin" = "basic_ai"
) {
  if (reviewSignals.mentions.length === 0) return;

  const rows = reviewSignals.mentions.map((mention) => ({
    submission_type: submissionType,
    submission_id: submissionId,
    entity_type: mention.entityType,
    display_name: mention.displayName,
    normalized_name: normalizeMentionName(mention.displayName),
    roles: mention.roles,
    affiliation: mention.affiliation || null,
    origin_city: mention.originCity || null,
    origin_country_code: mention.originCountryCode || null,
    evidence: mention.evidence || null,
    detected_by: detectedBy
  }));

  const { error } = await supabase
    .from("submission_mentions")
    .upsert(rows, {
      onConflict: "submission_type,submission_id,entity_type,normalized_name",
      ignoreDuplicates: false
    });

  if (error) {
    console.error("[submission-mentions] Failed to persist", {
      submissionType,
      submissionId,
      error: error.message
    });
  }
}

export async function applyResolvedSubmissionRelations(
  supabase: AdminSupabaseClient,
  submissionType: SubmissionType,
  submissionId: string,
  publishedEntityId: string
) {
  const { data: mentions, error } = await supabase
    .from("submission_mentions")
    .select("entity_type,resolved_entity_id")
    .eq("submission_type", submissionType)
    .eq("submission_id", submissionId)
    .eq("resolution_status", "matched")
    .not("resolved_entity_id", "is", null);

  if (error || !mentions?.length) return;

  if (submissionType === "event") {
    const teacherIds = mentions
      .filter((mention) => mention.entity_type === "professional")
      .map((mention) => String(mention.resolved_entity_id));
    if (teacherIds.length > 0) {
      await supabase.from("event_teachers").upsert(
        teacherIds.map((teacherId) => ({ event_id: publishedEntityId, teacher_id: teacherId })),
        { onConflict: "event_id,teacher_id" }
      );
    }

    const academyId = mentions.find((mention) => mention.entity_type === "academy")?.resolved_entity_id;
    const organizerId = mentions.find((mention) => mention.entity_type === "organizer")?.resolved_entity_id;
    if (academyId || organizerId) {
      await supabase.from("events").update({
        ...(academyId ? { academy_id: academyId } : {}),
        ...(organizerId ? { organizer_id: organizerId } : {})
      }).eq("id", publishedEntityId);
    }
  }

  if (submissionType === "academy") {
    const teacherIds = mentions
      .filter((mention) => mention.entity_type === "professional")
      .map((mention) => String(mention.resolved_entity_id));
    if (teacherIds.length > 0) {
      await supabase.from("academy_teachers").upsert(
        teacherIds.map((teacherId) => ({ academy_id: publishedEntityId, teacher_id: teacherId })),
        { onConflict: "academy_id,teacher_id" }
      );
    }
  }

  if (submissionType === "teacher") {
    const academyIds = mentions
      .filter((mention) => mention.entity_type === "academy")
      .map((mention) => String(mention.resolved_entity_id));
    if (academyIds.length > 0) {
      await supabase.from("academy_teachers").upsert(
        academyIds.map((academyId) => ({ academy_id: academyId, teacher_id: publishedEntityId })),
        { onConflict: "academy_id,teacher_id" }
      );
    }
  }
}
