import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { autoTranslateSpanishFields } from "@/lib/admin/auto-translate";
import { normalizeTeacherPayload } from "@/lib/admin/teacher-payload";
import { normalizeReviewSignals } from "@/lib/submissions/analysis";
import { persistAdminEntityMentions } from "@/lib/admin/entity-matching";
import { resolveCandidateAfterCreate } from "@/lib/admin/candidate-resolution";

function generateSlug(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80) + `-${Date.now().toString(36)}`
  );
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const format = request.nextUrl.searchParams.get("format");
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (format === "options") {
    return NextResponse.json({
      data: (data ?? []).map((teacher) => ({
        value: teacher.id,
        label: teacher.name
      }))
    });
  }
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const rawBody = await request.json();
  const candidateId = String(rawBody.candidate_id ?? "").trim();
  delete rawBody.candidate_id;
  const hasReviewSignals = "review_signals" in rawBody;
  const reviewSignals = normalizeReviewSignals(rawBody.review_signals);
  const body = await autoTranslateSpanishFields(rawBody, [
    { sourceKey: "bio_es", targetKey: "bio_en", label: "Teacher bio" }
  ]);

  if (!String(body.name ?? "").trim() || !String(body.city ?? "").trim() || !String(body.country_code ?? body.countryCode ?? "").trim()) {
    return NextResponse.json(
      { error: "Nombre, ciudad y país son obligatorios." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const slug = generateSlug(String(body.name));

  const payload = {
    slug,
    ...normalizeTeacherPayload(body)
  };

  const { data, error } = await supabase
    .from("teachers")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (hasReviewSignals) {
    await persistAdminEntityMentions(supabase, "teacher", data.id, reviewSignals);
  }

  const candidateLinked = candidateId
    ? await resolveCandidateAfterCreate(supabase, candidateId, "teacher", data.id)
    : false;

  return NextResponse.json({ data, candidateLinked });
}
