import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeMentionName, type MentionEntityType, type ReviewSignals, type SubmissionMention, type SubmissionType } from "@/lib/submissions/analysis";

type AdminSupabaseClient = SupabaseClient;

export type SuggestedEntityMatch = {
  id: string;
  name: string;
  city: string;
  countryCode: string;
  confidence: number;
  matchedAlias: string | null;
};

export type EnrichedSubmissionMention = SubmissionMention & {
  suggestedMatch: SuggestedEntityMatch | null;
  suggestedResourceMatch: SuggestedEntityMatch | null;
};

const MATCH_TABLES: Record<MentionEntityType, { table: string; select: string }> = {
  professional: { table: "teachers", select: "id,name,city,country_code" },
  academy: { table: "academies", select: "id,name,city,country_code" },
  organizer: { table: "organizers", select: "id,name,city,country_code" },
  spot: { table: "spots", select: "id,name,city,country_code" },
  festival: { table: "festival_series", select: "id,name" }
};

function editDistance(left: string, right: string) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = [...previous];

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    current[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1)
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length];
}

function similarity(left: string, right: string) {
  const a = normalizeMentionName(left);
  const b = normalizeMentionName(right);
  if (!a || !b) return 0;
  if (a === b) return 1;

  const aTokens = new Set(a.split(" "));
  const bTokens = new Set(b.split(" "));
  const overlap = [...aTokens].filter((token) => bTokens.has(token)).length;
  const union = new Set([...aTokens, ...bTokens]).size;
  const tokenScore = union ? overlap / union : 0;
  const distanceScore = 1 - editDistance(a, b) / Math.max(a.length, b.length);
  const containsScore = (a.includes(b) || b.includes(a)) && Math.min(a.length, b.length) >= 4
    ? 0.88
    : 0;

  return Math.max(distanceScore, containsScore, tokenScore * 0.92);
}

function nameVariants(name: string) {
  const variants = [name];
  const separated = name
    .split(/[/|]/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 3);
  const withoutParenthetical = name.replace(/\s*\([^)]*\)\s*/g, " ").trim();

  variants.push(...separated);
  if (withoutParenthetical && withoutParenthetical !== name) {
    variants.push(withoutParenthetical);
  }

  return [...new Set(variants)];
}

export async function findSuggestedEntityMatches(
  supabase: AdminSupabaseClient,
  entityType: MentionEntityType,
  displayName: string,
  options: {
    city?: string | null;
    countryCode?: string | null;
    limit?: number;
    minimumConfidence?: number;
  } = {}
): Promise<SuggestedEntityMatch[]> {
  const config = MATCH_TABLES[entityType];
  const { data, error } = await supabase
    .from(config.table)
    .select(config.select)
    .limit(500);
  if (error) return [];

  const rows = (data ?? []) as unknown as Array<Record<string, unknown>>;
  const aliasesByEntity = new Map<string, string[]>();
  const { data: aliasRows } = await supabase
    .from("entity_aliases")
    .select("entity_id,alias")
    .eq("entity_type", entityType)
    .limit(1000);

  for (const aliasRow of aliasRows ?? []) {
    const entityId = String(aliasRow.entity_id ?? "");
    const alias = String(aliasRow.alias ?? "").trim();
    if (!entityId || !alias) continue;
    aliasesByEntity.set(entityId, [...(aliasesByEntity.get(entityId) ?? []), alias]);
  }

  const requestedCity = normalizeMentionName(options.city ?? "");
  const requestedCountry = String(options.countryCode ?? "").trim().toUpperCase();
  const minimumConfidence = options.minimumConfidence ?? 0.42;

  return rows.map((row) => {
    const id = String(row.id ?? "");
    const name = String(row.name ?? "");
    const aliases = aliasesByEntity.get(id) ?? [];
    const scoredNames: Array<{
      name: string;
      score: number;
      isAlias: boolean;
      alias?: string;
    }> = [
      ...nameVariants(name).map((candidateName) => ({
        name: candidateName,
        score: similarity(displayName, candidateName),
        isAlias: false
      })),
      ...aliases.flatMap((alias) => nameVariants(alias).map((candidateName) => ({
        name: candidateName,
        score: similarity(displayName, candidateName),
        isAlias: true,
        alias
      })))
    ].sort((left, right) => right.score - left.score);
    const best = scoredNames[0] ?? { name, score: 0, isAlias: false };
    const city = String(row.city ?? "");
    const countryCode = String(row.country_code ?? "");
    const sameCity = requestedCity && normalizeMentionName(city) === requestedCity;
    const sameCountry = requestedCountry && countryCode.toUpperCase() === requestedCountry;
    const contextBoost = (sameCity ? 0.04 : 0) + (sameCountry ? 0.02 : 0);

    return {
      id,
      name,
      city,
      countryCode,
      confidence: Math.min(1, best.score + contextBoost),
      matchedAlias: best.isAlias ? (best.alias ?? best.name) : null
    };
  }).filter((candidate) => candidate.id && candidate.confidence >= minimumConfidence)
    .sort((left, right) => right.confidence - left.confidence || left.name.localeCompare(right.name, "es"))
    .slice(0, options.limit ?? 5);
}

export async function findSuggestedEntityMatch(
  supabase: AdminSupabaseClient,
  entityType: MentionEntityType,
  displayName: string
): Promise<SuggestedEntityMatch | null> {
  const candidates = await findSuggestedEntityMatches(supabase, entityType, displayName, {
    limit: 1,
    minimumConfidence: 0.55
  });
  return candidates[0] ?? null;
}

export async function enrichReviewMentions(
  supabase: AdminSupabaseClient,
  reviewSignals: ReviewSignals
): Promise<EnrichedSubmissionMention[]> {
  const enriched: EnrichedSubmissionMention[] = [];
  for (const mention of reviewSignals.mentions) {
    const normalizedRoles = mention.roles.map(normalizeMentionName);
    const isDjMention = mention.entityType === "professional" && (
      normalizeMentionName(mention.displayName).startsWith("dj ")
      || normalizedRoles.includes("dj")
    );
    enriched.push({
      ...mention,
      suggestedMatch: await findSuggestedEntityMatch(
        supabase,
        mention.entityType,
        mention.displayName
      ),
      suggestedResourceMatch: isDjMention
        ? await findSuggestedDjResourceMatch(supabase, mention.displayName)
        : null
    });
  }
  return enriched;
}

async function findSuggestedDjResourceMatch(
  supabase: AdminSupabaseClient,
  displayName: string
): Promise<SuggestedEntityMatch | null> {
  const { data, error } = await supabase
    .from("community_resources")
    .select("id,name,city,country_code")
    .contains("categories", ["dj"])
    .eq("is_published", true)
    .limit(250);
  if (error) return null;

  const candidates = (data ?? [])
    .map((row) => ({
      id: String(row.id ?? ""),
      name: String(row.name ?? ""),
      city: String(row.city ?? ""),
      countryCode: String(row.country_code ?? ""),
      confidence: similarity(displayName, String(row.name ?? "")),
      matchedAlias: null
    }))
    .filter((candidate) => candidate.id && candidate.confidence >= 0.55)
    .sort((left, right) => right.confidence - left.confidence || left.name.localeCompare(right.name, "es"));

  return candidates[0] ?? null;
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
