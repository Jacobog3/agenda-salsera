import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { autoTranslateSpanishFields } from "@/lib/admin/auto-translate";
import { normalizeAcademyPayload } from "@/lib/admin/academy-payload";

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
    .from("academies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (format === "options") {
    return NextResponse.json({
      data: [
        { value: "", label: "Sin relacionar" },
        ...(data ?? []).map((academy) => ({
          value: academy.id,
          label: academy.name
        }))
      ]
    });
  }
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const rawBody = await request.json();
  const body = await autoTranslateSpanishFields(rawBody, [
    { sourceKey: "description_es", targetKey: "description_en", label: "Academy description" }
  ]);

  if (!String(body.name ?? "").trim() || !String(body.city ?? "").trim()) {
    return NextResponse.json(
      { error: "Nombre y ciudad son obligatorios." },
      { status: 400 }
    );
  }

  if (!String(body.cover_image_url ?? "").trim()) {
    return NextResponse.json(
      { error: "La imagen principal de la academia es obligatoria." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const slug = generateSlug(String(body.name));

  const payload = {
    slug,
    ...normalizeAcademyPayload(body)
  };

  const { data, error } = await supabase
    .from("academies")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
