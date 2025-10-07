// app/api/proxy-image/route.ts
import { NextResponse } from "next/server";

function getUrlParam(req: Request): string | null {
  const u = new URL(req.url);
  const url = u.searchParams.get("url");
  return url && url.trim().length ? url : null;
}

export async function GET(req: Request): Promise<Response> {
  const src = getUrlParam(req);
  if (!src) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  try {
    const r = await fetch(src, {
      // No-cache para evitar imágenes obsoletas de Drive
      cache: "no-store",
      // Algunos hosts de Drive agradecen un UA explícito
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AgendaSalsera/1.0)" },
    });

    if (!r.ok || !r.body) {
      return NextResponse.json({ error: `Upstream ${r.status}` }, { status: 502 });
    }

    // Passthrough del stream y content-type si existe
    const contentType = r.headers.get("content-type") ?? "image/jpeg";
    return new Response(r.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300, s-maxage=600",
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Fetch failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}