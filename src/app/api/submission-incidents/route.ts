import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/utils/env";

const VALID_TYPES = new Set(["event", "academy", "teacher", "spot"]);
const VALID_STEPS = new Set(["upload", "ai_basic", "submit", "recovery"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const submissionType = String(body.submissionType ?? "");
  const step = String(body.step ?? "");
  if (!VALID_TYPES.has(submissionType) || !VALID_STEPS.has(step)) {
    return NextResponse.json({ error: "Reporte no válido." }, { status: 400 });
  }

  const incidentCode = `SS-${randomBytes(4).toString("hex").toUpperCase()}`;
  if (!isSupabaseConfigured) {
    console.error(`[submission-incident:${incidentCode}]`, { submissionType, step });
    return NextResponse.json({ ok: true, incidentCode });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("submission_incidents").insert({
    incident_code: incidentCode,
    submission_type: submissionType,
    submission_id: body.submissionId || null,
    step,
    error_code: String(body.errorCode ?? "").slice(0, 100) || null,
    error_message: String(body.message ?? "").slice(0, 1000) || null,
    route: String(body.route ?? "").slice(0, 300) || null,
    user_agent: request.headers.get("user-agent")?.slice(0, 500) || null,
    user_comment: String(body.comment ?? "").slice(0, 1000) || null,
    contact_email: String(body.contactEmail ?? "").slice(0, 320) || null
  });

  if (error) {
    console.error(`[submission-incident:${incidentCode}] Failed to persist`, error.message);
    return NextResponse.json({ error: "No se pudo guardar el reporte." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, incidentCode });
}
