import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const shouldApply = process.argv.includes("--apply");
const entityArg = process.argv.find((argument) => argument.startsWith("--entity="));
const entity = entityArg?.split("=")[1] ?? "events";

const entityConfig = {
  events: { labelField: "title_es", select: "id,title_es,city,venue_name,address" },
  academies: { labelField: "name", select: "id,name,city,area,address" }
}[entity];

if (!entityConfig) {
  console.error(`Unsupported entity: ${entity}`);
  process.exit(1);
}

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local."
  );
  process.exit(1);
}

const cityMap = new Map([
  ["Guatemala", "Ciudad de Guatemala"],
  ["Guatemala City", "Ciudad de Guatemala"],
  ["Antigua", "Antigua Guatemala"]
]);

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function fetchCandidates() {
  const { data, error } = await supabase
    .from(entity)
    .select(entityConfig.select)
    .in("city", [...cityMap.keys()])
    .order("city")
    .order(entityConfig.labelField);

  if (error) throw new Error(error.message);

  return (data ?? []).map((event) => ({
    ...event,
    next_city: cityMap.get(event.city)
  }));
}

async function applyCandidates(candidates) {
  const results = [];

  for (const candidate of candidates) {
    const { error } = await supabase
      .from(entity)
      .update({ city: candidate.next_city })
      .eq("id", candidate.id)
      .eq("city", candidate.city);

    if (error) {
      throw new Error(`${candidate[entityConfig.labelField]}: ${error.message}`);
    }

    results.push(candidate.id);
  }

  return results;
}

async function main() {
  const candidates = await fetchCandidates();
  const summary = candidates.reduce((result, candidate) => {
    const key = `${candidate.city} -> ${candidate.next_city}`;
    result[key] = (result[key] ?? 0) + 1;
    return result;
  }, {});

  console.log(JSON.stringify({
    mode: shouldApply ? "apply" : "dry-run",
    entity,
    total: candidates.length,
    summary,
    candidates
  }, null, 2));

  if (!shouldApply) {
    console.log("\nDry run only. No records were changed.");
    return;
  }

  const updatedIds = await applyCandidates(candidates);
  console.log(`\nUpdated ${updatedIds.length} ${entity}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
