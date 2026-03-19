import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const format = request.nextUrl.searchParams.get("format");
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("organizers")
    .select("*")
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (format === "options") {
    return NextResponse.json({
      data: [
        { value: "", label: "Sin relacionar" },
        ...(data ?? []).map((organizer) => ({
          value: organizer.id,
          label: organizer.name
        }))
      ]
    });
  }

  return NextResponse.json({ data: data ?? [] });
}
