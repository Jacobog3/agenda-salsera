import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/utils/env";

const allowedFolders = new Set(["events", "academies", "teachers", "spots"]);
const maxFileSizeBytes = 10 * 1024 * 1024;

function logUploadError(incidentId: string, message: string, details?: Record<string, unknown>) {
  console.error(`[submission-upload:${incidentId}] ${message}`, details ?? {});
}

export async function POST(request: NextRequest) {
  const incidentId = randomUUID();

  try {
    if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
      logUploadError(incidentId, "Supabase admin env vars are missing");
      return NextResponse.json(
        { error: "No pudimos subir la imagen ahorita. Intenta de nuevo más tarde." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Selecciona una imagen para continuar." },
        { status: 400 }
      );
    }

    if (!allowedFolders.has(folder)) {
      return NextResponse.json(
        { error: "Tipo de subida no válido." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen." },
        { status: 400 }
      );
    }

    if (file.size > maxFileSizeBytes) {
      return NextResponse.json(
        { error: "La imagen es muy pesada. Usa una menor de 10MB." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `submissions/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { data, error } = await supabase.storage
      .from("event-flyers")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      logUploadError(incidentId, "Supabase storage upload failed", {
        folder,
        fileName,
        fileType: file.type,
        fileSize: file.size,
        error: error.message
      });

      return NextResponse.json(
        { error: "No pudimos subir la imagen. Intenta de nuevo en unos minutos." },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from("event-flyers")
      .getPublicUrl(data.path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    logUploadError(incidentId, "Unexpected upload route failure", {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { error: "No pudimos subir la imagen. Intenta de nuevo más tarde." },
      { status: 500 }
    );
  }
}
