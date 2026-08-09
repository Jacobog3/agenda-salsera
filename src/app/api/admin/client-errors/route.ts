import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function cleanText(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("admin_client_error_logs")
      .select("client_id,created_at,route,message,stack,digest,user_agent,release_sha,resolved_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudieron consultar los errores." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const rawBody: unknown = await request.json();
    if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
      return NextResponse.json({ error: "El registro enviado no es válido." }, { status: 400 });
    }
    const body = rawBody as Record<string, unknown>;
    const clientId = cleanText(body.client_id, 100);
    const message = cleanText(body.message, 2_000);
    const requestedCreatedAt = cleanText(body.created_at, 100);
    const parsedCreatedAt = new Date(requestedCreatedAt);
    const createdAt = Number.isFinite(parsedCreatedAt.getTime())
      ? parsedCreatedAt.toISOString()
      : new Date().toISOString();

    if (!clientId || !message) {
      return NextResponse.json(
        { error: "El identificador y el mensaje son obligatorios." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("admin_client_error_logs")
      .upsert(
        {
          client_id: clientId,
          created_at: createdAt,
          route: cleanText(body.route, 600),
          message,
          stack: cleanText(body.stack, 16_000) || null,
          digest: cleanText(body.digest, 300) || null,
          user_agent: cleanText(request.headers.get("user-agent"), 600) || null,
          release_sha: cleanText(process.env.VERCEL_GIT_COMMIT_SHA, 100) || null
        },
        { onConflict: "client_id", ignoreDuplicates: true }
      )
      .select("client_id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, client_id: data?.client_id ?? clientId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo registrar el error." },
      { status: 500 }
    );
  }
}
