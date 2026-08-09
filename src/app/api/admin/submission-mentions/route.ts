import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "candidate";
  if (!["pending", "candidate", "matched", "ignored"].includes(status)) {
    return NextResponse.json({ error: "Estado no válido." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("submission_mentions")
    .select("*")
    .eq("resolution_status", status)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}
