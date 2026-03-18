import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const reports = data ?? [];
  const eventIds = reports.filter((report) => report.entity_type === "event").map((report) => report.entity_id);
  const academyIds = reports.filter((report) => report.entity_type === "academy").map((report) => report.entity_id);
  const teacherIds = reports.filter((report) => report.entity_type === "teacher").map((report) => report.entity_id);

  const [eventsRes, academiesRes, teachersRes] = await Promise.all([
    eventIds.length
      ? supabase.from("events").select("id, slug, title_es").in("id", eventIds)
      : Promise.resolve({ data: [], error: null }),
    academyIds.length
      ? supabase.from("academies").select("id, slug, name").in("id", academyIds)
      : Promise.resolve({ data: [], error: null }),
    teacherIds.length
      ? supabase.from("teachers").select("id, slug, name").in("id", teacherIds)
      : Promise.resolve({ data: [], error: null })
  ]);

  const eventMap = new Map((eventsRes.data ?? []).map((row) => [row.id, { name: row.title_es, slug: row.slug }]));
  const academyMap = new Map((academiesRes.data ?? []).map((row) => [row.id, { name: row.name, slug: row.slug }]));
  const teacherMap = new Map((teachersRes.data ?? []).map((row) => [row.id, { name: row.name, slug: row.slug }]));

  const enriched = reports.map((report) => {
    const lookup = report.entity_type === "event"
      ? eventMap.get(report.entity_id)
      : report.entity_type === "academy"
        ? academyMap.get(report.entity_id)
        : report.entity_type === "teacher"
          ? teacherMap.get(report.entity_id)
          : null;

    return {
      ...report,
      entity_name: lookup?.name ?? null,
      entity_slug: lookup?.slug ?? null
    };
  });

  return NextResponse.json({ data: enriched });
}
