import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
  );
  process.exit(1);
}

// Deliberately use the public key so this audit remains constrained by read-only RLS policies.
const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const entitySpecs = {
  events: {
    select: "*",
    textFields: ["description_es", "description_en"],
    requiredFields: [
      "title_es",
      "cover_image_url",
      "city",
      "venue_name",
      "organizer_name",
      "contact_url"
    ]
  },
  academies: {
    select: "*",
    textFields: ["description_es", "description_en"],
    requiredFields: [
      "name",
      "cover_image_url",
      "city",
      "schedule_text",
      "levels",
      "price_text"
    ]
  },
  teachers: {
    select: "*",
    textFields: ["bio_es", "bio_en"],
    requiredFields: [
      "name",
      "profile_image_url",
      "city",
      "schedule_text",
      "levels",
      "price_text"
    ]
  },
  spots: {
    select: "*",
    textFields: ["description_es", "description_en"],
    requiredFields: [
      "name",
      "cover_image_url",
      "city",
      "schedule_es",
      "google_maps_url"
    ]
  }
};

function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function normalizeForComparison(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b20\d{2}\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countValues(rows, field) {
  const counts = new Map();

  for (const row of rows) {
    const value = String(row[field] ?? "(empty)").trim() || "(empty)";
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function textStats(rows, field) {
  const lengths = rows.map((row) => String(row[field] ?? "").trim().length);
  const total = lengths.reduce((sum, length) => sum + length, 0);

  return {
    empty: lengths.filter((length) => length === 0).length,
    under80: lengths.filter((length) => length > 0 && length < 80).length,
    under150: lengths.filter((length) => length > 0 && length < 150).length,
    average: lengths.length === 0 ? 0 : Math.round(total / lengths.length),
    maximum: lengths.length === 0 ? 0 : Math.max(...lengths)
  };
}

function findComparisonGroups(rows, field) {
  const groups = new Map();

  for (const row of rows) {
    const original = String(row[field] ?? "").trim();
    const normalized = normalizeForComparison(original);
    if (!normalized) continue;

    const group = groups.get(normalized) ?? [];
    group.push({ id: row.id, value: original });
    groups.set(normalized, group);
  }

  return [...groups.entries()]
    .filter(([, matches]) => matches.length > 1)
    .map(([normalized, matches]) => ({ normalized, matches }));
}

function eventStatus(event, now) {
  if (event.date_status === "coming_soon") return "active";

  const dateValue = event.ends_at || event.starts_at;
  if (!dateValue) return "undated";

  return new Date(dateValue).getTime() >= now.getTime() ? "active" : "expired";
}

function summarizeEntity(rows, spec) {
  return {
    total: rows.length,
    published: rows.filter((row) => row.is_published !== false).length,
    cities: countValues(rows, "city"),
    text: Object.fromEntries(
      spec.textFields.map((field) => [field, textStats(rows, field)])
    ),
    missing: Object.fromEntries(
      spec.requiredFields.map((field) => [
        field,
        rows.filter((row) => isEmpty(row[field])).length
      ])
    )
  };
}

async function fetchTable(table, select) {
  const { data, error } = await supabase.from(table).select(select);

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }

  return data ?? [];
}

async function main() {
  const entries = await Promise.all(
    Object.entries(entitySpecs).map(async ([table, spec]) => [
      table,
      await fetchTable(table, spec.select)
    ])
  );
  const data = Object.fromEntries(entries);
  const now = new Date();
  const events = data.events;
  const statuses = events.reduce(
    (result, event) => {
      result[eventStatus(event, now)] += 1;
      return result;
    },
    { active: 0, expired: 0, undated: 0 }
  );

  const report = {
    generatedAt: now.toISOString(),
    readOnly: true,
    totals: {
      records: Object.values(data).reduce((sum, rows) => sum + rows.length, 0),
      ...Object.fromEntries(
        Object.entries(data).map(([table, rows]) => [table, rows.length])
      )
    },
    events: {
      ...summarizeEntity(events, entitySpecs.events),
      statuses,
      organizers: countValues(events, "organizer_name"),
      venues: countValues(events, "venue_name"),
      possibleRepeatedTitles: findComparisonGroups(events, "title_es"),
      missingRelations: {
        organizerId: events.filter((event) => isEmpty(event.organizer_id)).length,
        academyId: events.filter((event) => isEmpty(event.academy_id)).length
      }
    },
    academies: summarizeEntity(data.academies, entitySpecs.academies),
    teachers: summarizeEntity(data.teachers, entitySpecs.teachers),
    spots: summarizeEntity(data.spots, entitySpecs.spots),
    normalizationCandidates: {
      cities: [
        ...countValues(events, "city"),
        ...countValues(data.academies, "city"),
        ...countValues(data.teachers, "city"),
        ...countValues(data.spots, "city")
      ],
      organizerNames: countValues(events, "organizer_name"),
      venueNames: countValues(events, "venue_name")
    }
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
