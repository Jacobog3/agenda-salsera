import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { findSuggestedEntityMatches } from "@/lib/admin/entity-matching";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { MentionEntityType } from "@/lib/submissions/analysis";

const ENTITY_TYPES = new Set<MentionEntityType>([
  "professional",
  "academy",
  "organizer",
  "spot",
  "festival"
]);

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const entityType = request.nextUrl.searchParams.get("type") as MentionEntityType;
  const query = String(request.nextUrl.searchParams.get("q") ?? "").trim();
  if (!ENTITY_TYPES.has(entityType) || query.length < 2) {
    return NextResponse.json({ error: "Tipo o búsqueda no válidos." }, { status: 400 });
  }

  const matches = await findSuggestedEntityMatches(
    createSupabaseAdminClient(),
    entityType,
    query,
    {
      city: request.nextUrl.searchParams.get("city"),
      countryCode: request.nextUrl.searchParams.get("country"),
      limit: 5,
      minimumConfidence: 0.28
    }
  );

  return NextResponse.json({ data: matches });
}
