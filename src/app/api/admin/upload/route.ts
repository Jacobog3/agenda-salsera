import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const allowedFolders = new Set([
  "events",
  "academies",
  "artists",
  "spots",
  "festivals",
  "festival-editions"
]);
const imageLimit = 15 * 1024 * 1024;
const documentLimit = 25 * 1024 * 1024;

function getMediaType(file: File) {
  if (file.type.startsWith("image/")) return "image" as const;
  if (file.type === "application/pdf") return "document" as const;
  return null;
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get("admin_session");
  if (!session?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const requestedFolder = String(formData.get("folder") ?? "events").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const mediaType = getMediaType(file);
  if (!mediaType) {
    const message = file.type.startsWith("video/")
      ? "Los videos se analizan temporalmente en el dispositivo y no se almacenan."
      : "Formato de archivo no compatible.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const folder = allowedFolders.has(requestedFolder) ? requestedFolder : "events";
  const maxSize = mediaType === "document" ? documentLimit : imageLimit;
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: "El archivo es demasiado grande." },
      { status: 400 }
    );
  }

  try {
    const supabase = createSupabaseAdminClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${folder}/${mediaType}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const bucket = mediaType === "image" ? "event-flyers" : "dance-media";

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return NextResponse.json({
      url: urlData.publicUrl,
      storagePath: data.path,
      bucket,
      mediaType,
      mimeType: file.type,
      size: file.size
    });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
