import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const shouldApply = process.argv.includes("--apply");

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local."
  );
  process.exit(1);
}

const relationIds = {
  organizers: {
    nochesSalseras: undefined,
    salsaForYou: undefined
  },
  academies: {
    garala: undefined,
    newSensation: undefined,
    ritmoYSabor: undefined,
    salsaForYou: undefined,
    skyDance: undefined
  }
};

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function resolveIds() {
  const [{ data: organizers, error: organizerError }, { data: academies, error: academyError }] =
    await Promise.all([
      supabase.from("organizers").select("id,name"),
      supabase.from("academies").select("id,name")
    ]);

  if (organizerError) throw new Error(organizerError.message);
  if (academyError) throw new Error(academyError.message);

  const organizerByName = new Map((organizers ?? []).map((item) => [item.name, item.id]));
  const academyByName = new Map((academies ?? []).map((item) => [item.name, item.id]));
  const academyContaining = (text) => {
    const matches = (academies ?? []).filter((item) =>
      item.name.toLocaleLowerCase("es").includes(text.toLocaleLowerCase("es"))
    );
    return matches.length === 1 ? matches[0].id : undefined;
  };

  relationIds.organizers.nochesSalseras = organizerByName.get("Noches Salseras");
  relationIds.organizers.salsaForYou = organizerByName.get("SalsaForYou Dance Company");
  relationIds.academies.garala = academyByName.get("Garala Dance Academy");
  relationIds.academies.newSensation = academyContaining("New Sensation");
  relationIds.academies.ritmoYSabor = academyByName.get("Ritmo y Sabor");
  relationIds.academies.salsaForYou = academyByName.get("Salsa for You GT");
  relationIds.academies.skyDance = academyContaining("Sky Dance");

  const missing = [
    ...Object.entries(relationIds.organizers).map(([key, value]) => [`organizer.${key}`, value]),
    ...Object.entries(relationIds.academies).map(([key, value]) => [`academy.${key}`, value])
  ].filter(([, value]) => !value);

  if (missing.length > 0) {
    throw new Error(`Missing canonical relations: ${missing.map(([key]) => key).join(", ")}`);
  }
}

function proposedChanges(event) {
  const changes = {};
  const salsaForYouNames = new Set([
    "Salsa For You dance company",
    "SalsaForYou dance company",
    "SalsaForYou Dance Company"
  ]);

  if (salsaForYouNames.has(event.organizer_name)) {
    if (event.organizer_name !== "SalsaForYou Dance Company") {
      changes.organizer_name = "SalsaForYou Dance Company";
    }
    if (event.organizer_id !== relationIds.organizers.salsaForYou) {
      changes.organizer_id = relationIds.organizers.salsaForYou;
    }
    if (!event.academy_id) changes.academy_id = relationIds.academies.salsaForYou;
  }

  if (
    event.title_es === "Noches Salseras 2026" &&
    event.organizer_name === "Rony Molina" &&
    !event.organizer_id
  ) {
    changes.organizer_id = relationIds.organizers.nochesSalseras;
  }

  const academyRules = [
    {
      matches: ["New Sensation", "New Sensation / Sociatel"].includes(event.organizer_name),
      academyId: relationIds.academies.newSensation
    },
    {
      matches: event.organizer_name === "Garala Dance Studio",
      academyId: relationIds.academies.garala
    },
    {
      matches: event.organizer_name === "Sky Dance",
      academyId: relationIds.academies.skyDance
    },
    {
      matches: event.organizer_name === "Ritmo y Sabor Dance Academy",
      academyId: relationIds.academies.ritmoYSabor
    },
  ];

  for (const rule of academyRules) {
    if (rule.matches && !event.academy_id) changes.academy_id = rule.academyId;
  }

  if (event.organizer_name === "SALSEROS GT Dance Studio") {
    changes.organizer_name = "Salseros GT Dance Studio";
  }

  return changes;
}

async function fetchCandidates() {
  const { data, error } = await supabase
    .from("events")
    .select("id,title_es,starts_at,organizer_name,organizer_id,academy_id")
    .order("starts_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((event) => ({ event, changes: proposedChanges(event) }))
    .filter(({ changes }) => Object.keys(changes).length > 0);
}

async function applyCandidates(candidates) {
  for (const { event, changes } of candidates) {
    let query = supabase.from("events").update(changes).eq("id", event.id);

    if (event.organizer_name === null) query = query.is("organizer_name", null);
    else query = query.eq("organizer_name", event.organizer_name);

    const { data, error } = await query.select("id").single();
    if (error) throw new Error(`${event.title_es}: ${error.message}`);
    if (!data) throw new Error(`${event.title_es}: record changed before update`);
  }
}

async function main() {
  await resolveIds();
  const candidates = await fetchCandidates();

  console.log(JSON.stringify({
    mode: shouldApply ? "apply" : "dry-run",
    total: candidates.length,
    candidates: candidates.map(({ event, changes }) => ({
      id: event.id,
      title: event.title_es,
      date: event.starts_at,
      current: {
        organizer_name: event.organizer_name,
        organizer_id: event.organizer_id,
        academy_id: event.academy_id
      },
      changes
    }))
  }, null, 2));

  if (!shouldApply) {
    console.log("\nDry run only. No records were changed.");
    return;
  }

  await applyCandidates(candidates);
  console.log(`\nUpdated ${candidates.length} events.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
