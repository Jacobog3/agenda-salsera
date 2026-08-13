import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("resource_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}
