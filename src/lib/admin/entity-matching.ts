import { normalizeMentionName, type MentionEntityType, type ReviewSignals, type SubmissionMention, type SubmissionType } from "@/lib/submissions/analysis";

type AdminSupabaseClient = ReturnType<
  typeof import("@/lib/supabase/admin").createSupabaseAdminClient
>;

export type SuggestedEntityMatch = {
  id: string;
  name: string;
  city: string;
  countryCode: string;
  confidence: number;
};

export type EnrichedSubmissionMention = SubmissionMention & {
  suggestedMatch: SuggestedEntityMatch | null;
};

const MATCH_TABLES: Record<MentionEntityType, { table: string }> = {
  professional: { table: "teachers" },
  academy: { table: "academies" },
  organizer: { table: "organizers" },
  spot: { table: "spots" },
  festival: { table: "festival_series" }
};

function similarity(left: string, right: string) {
  const a = normalizeMentionName(left);
  const b = normalizeMentionName(right);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.88;

  const aTokens = new Set(a.split(" "));
  const bTokens = new Set(b.split(" "));
  const overlap = [...aTokens].filter((token) => bTokens.has(token)).length;
  const union = new Set([...aTokens, ...bTokens]).size;
  return union ? overlap / union : 0;
}

export async function findSuggestedEntityMatch(
  supabase: AdminSupabaseClient,
  entityType: MentionEntityType,
  displayName: string
): Promise<SuggestedEntityMatch | null> {
  const config = MATCH_TABLES[entityType];
  const { data, error } = await supabase
    .from(config.table)
    .select("id,name,city,country_code")
    .limit(250);
  if (error) return null;

  const candidates = (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name ?? ""),
    city: String(row.city ?? ""),
    countryCode: String(row.country_code ?? ""),
    confidence: similarity(displayName, String(row.name ?? ""))
  })).filter((candidate) => candidate.confidence >= 0.55)
    .sort((a, b) => b.confidence - a.confidence);

  return candidates[0] ?? null;
}

export async function enrichReviewMentions(
  supabase: AdminSupabaseClient,
  reviewSignals: ReviewSignals
): Promise<EnrichedSubmissionMention[]> {
  const enriched: EnrichedSubmissionMention[] = [];
  for (const mention of reviewSignals.mentions) {
    enriched.push({
      ...mention,
      suggestedMatch: await findSuggestedEntityMatch(
        supabase,
        mention.entityType,
        mention.displayName
      )
    });
  }
  return enriched;
}

function sourceEntityType(sourceType: SubmissionType): MentionEntityType | null {
  if (sourceType === "teacher") return "professional";
  if (sourceType === "academy" || sourceType === "spot") return sourceType;
  return null;
}

export async function persistAdminEntityMentions(
  supabase: AdminSupabaseClient,
  sourceType: SubmissionType,
  sourceId: string,
  reviewSignals: ReviewSignals
) {
  const { error: cleanupError } = await supabase
    .from("submission_mentions")
    .delete()
    .eq("submission_type", sourceType)
    .eq("submission_id", sourceId)
    .eq("resolution_status", "candidate")
    .eq("detected_by", "advanced_ai");
  if (cleanupError) {
    console.error("[admin-entity-mentions] Failed to clear stale candidates", {
      sourceType,
      sourceId,
      error: cleanupError.message
    });
  }

  if (reviewSignals.mentions.length === 0) return;

  const enriched = await enrichReviewMentions(supabase, reviewSignals);
  const primaryEntityType = sourceEntityType(sourceType);
  const rows = enriched
    .filter((mention) => !(
      primaryEntityType &&
      mention.entityType === primaryEntityType &&
      mention.suggestedMatch?.id === sourceId
    ))
    .map((mention) => ({
      submission_type: sourceType,
      submission_id: sourceId,
      entity_type: mention.entityType,
      display_name: mention.displayName,
      normalized_name: normalizeMentionName(mention.displayName),
      roles: mention.roles,
      affiliation: mention.affiliation || null,
      origin_city: mention.originCity || null,
      origin_country_code: mention.originCountryCode || null,
      evidence: mention.evidence || null,
      suggested_match_id: mention.suggestedMatch?.id ?? null,
      suggested_match_name: mention.suggestedMatch?.name ?? null,
      match_confidence: mention.suggestedMatch?.confidence ?? null,
      resolution_status: "candidate",
      detected_by: "advanced_ai"
    }));

  if (rows.length === 0) return;
  const { error } = await supabase.from("submission_mentions").upsert(rows, {
    onConflict: "submission_type,submission_id,entity_type,normalized_name",
    // A new analysis may refresh unresolved candidates, but it must never undo
    // an explicit Admin decision already stored as matched or ignored.
    ignoreDuplicates: true
  });
  if (error) {
    console.error("[admin-entity-mentions] Failed to persist", {
      sourceType,
      sourceId,
      error: error.message
    });
  }
}
