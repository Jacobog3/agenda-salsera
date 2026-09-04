import type { SupabaseClient } from "@supabase/supabase-js";
import { findSuggestedEntityMatches } from "@/lib/admin/entity-matching";

type EventRelationInput = {
  title_es?: unknown;
  organizer_name?: unknown;
  venue_name?: unknown;
  organizer_id?: unknown;
  academy_id?: unknown;
  spot_id?: unknown;
};

type RelationResult = {
  organizer_name: string;
  organizer_id: string | null;
  academy_id: string | null;
  spot_id: string | null;
};

const ACADEMY_ALIASES = new Map<string, string>([
  ["salsaforyou dance company", "Salsa for You GT"],
  ["salsa for you dance company", "Salsa for You GT"],
  ["garala", "Garala Dance Academy"],
  ["garala dance studio", "Garala Dance Academy"],
  ["garala dance academy", "Garala Dance Academy"],
  ["new sensation", "New Sensation Salsa Studio"],
  ["new sensation salsa studio", "New Sensation Salsa Studio"],
  ["new sensation sociatel", "New Sensation Salsa Studio"],
  ["sky dance", "Sky Dance Academy / Estilo Latino"],
  ["sky dance academy", "Sky Dance Academy / Estilo Latino"],
  ["ritmo y sabor dance academy", "Ritmo y Sabor"],
  ["ritmo y sabor", "Ritmo y Sabor"],
  ["tumbao estudio de baile", "Tumbao Estudio de Baile Guatemala"],
  ["tumbao estudio de baile guatemala", "Tumbao Estudio de Baile Guatemala"]
]);

function normalizeName(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function nullableId(value: unknown): string | null {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function findIdByName(
  records: Array<{ id: string; name: string }>,
  canonicalName: string | null
): string | null {
  if (!canonicalName) return null;
  const normalizedCanonicalName = normalizeName(canonicalName);
  const matches = records.filter((record) => normalizeName(record.name) === normalizedCanonicalName);
  return matches.length === 1 ? matches[0].id : null;
}

function inferOrganizerName(title: string, organizerName: string): string | null {
  if (organizerName === "salsaforyou dance company" || organizerName === "salsa for you dance company") {
    return "SalsaForYou Dance Company";
  }
  if (organizerName === "noches salseras" || title.startsWith("noches salseras")) {
    return "Noches Salseras";
  }
  if (organizerName === "guatemala salsa congress" || title.includes("guatemala salsa congress")) {
    return "Guatemala Salsa Congress";
  }
  if (
    organizerName === "antigua salsa y bachata festival" ||
    title.includes("antigua salsa y bachata festival")
  ) {
    return "Antigua Salsa y Bachata Festival";
  }
  return null;
}

function inferAcademyName(organizerName: string, venueName: string): string | null {
  return ACADEMY_ALIASES.get(organizerName) ?? ACADEMY_ALIASES.get(venueName) ?? null;
}

export async function inferEventRelations(
  supabase: SupabaseClient,
  input: EventRelationInput,
  options: { inferOrganizer?: boolean; inferAcademy?: boolean; inferSpot?: boolean } = {}
): Promise<RelationResult> {
  const currentOrganizerName = String(input.organizer_name ?? "").trim();
  const normalizedOrganizerName = normalizeName(currentOrganizerName);
  const title = normalizeName(input.title_es);
  const venueName = normalizeName(input.venue_name);
  const canonicalOrganizerName = inferOrganizerName(title, normalizedOrganizerName);
  const organizerName = canonicalOrganizerName === "SalsaForYou Dance Company"
    ? canonicalOrganizerName
    : currentOrganizerName;
  const canonicalAcademyName = inferAcademyName(normalizedOrganizerName, venueName);
  let organizerId = nullableId(input.organizer_id);
  let academyId = nullableId(input.academy_id);
  let spotId = nullableId(input.spot_id);

  if (!organizerId && canonicalOrganizerName && options.inferOrganizer !== false) {
    const { data, error } = await supabase.from("organizers").select("id,name");
    if (error) throw new Error(`No se pudieron resolver los organizadores: ${error.message}`);
    organizerId = findIdByName(data ?? [], canonicalOrganizerName);
  }

  if (!academyId && canonicalAcademyName && options.inferAcademy !== false) {
    const { data, error } = await supabase.from("academies").select("id,name");
    if (error) throw new Error(`No se pudieron resolver las academias: ${error.message}`);
    academyId = findIdByName(data ?? [], canonicalAcademyName);
  }

  if (!organizerId && currentOrganizerName && options.inferOrganizer !== false) {
    const [match] = await findSuggestedEntityMatches(supabase, "organizer", currentOrganizerName, {
      limit: 1,
      minimumConfidence: 1
    });
    organizerId = match?.id ?? null;
  }

  if (!academyId && currentOrganizerName && options.inferAcademy !== false) {
    const [match] = await findSuggestedEntityMatches(supabase, "academy", currentOrganizerName, {
      limit: 1,
      minimumConfidence: 1
    });
    academyId = match?.id ?? null;
  }

  if (!spotId && venueName && options.inferSpot !== false) {
    const [match] = await findSuggestedEntityMatches(supabase, "spot", String(input.venue_name ?? ""), {
      limit: 1,
      minimumConfidence: 1
    });
    spotId = match?.id ?? null;
  }

  return {
    organizer_name: organizerName,
    organizer_id: organizerId,
    academy_id: academyId,
    spot_id: spotId
  };
}
