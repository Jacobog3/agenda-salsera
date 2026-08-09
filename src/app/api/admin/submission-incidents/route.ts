import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("submission_incidents")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function PATCH(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? "");
  const status = String(body.status ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !["resolved", "ignored"].includes(status)) {
    return NextResponse.json({ error: "Actualización no válida." }, { status: 400 });
  }
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("submission_incidents").update({
    status,
    resolved_at: new Date().toISOString()
  }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
