import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    const id = searchParams.get("id");

    // Construir URL objetivo
    const target = url
      ? url
      : id
      ? `https://drive.google.com/uc?export=view&id=${id}`
      : null;

    if (!target) {
      return new NextResponse("Missing 'url' or 'id' param", { status: 400 });
    }

    // Fetch sin cache para evitar loops
    const upstream = await fetch(target, { cache: "no-store" });

    if (!upstream.ok) {
      return new NextResponse(`Upstream error: ${upstream.status}`, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const buf = await upstream.arrayBuffer();

    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return new NextResponse(`Proxy error: ${err?.message || "unknown"}`, { status: 500 });
  }
}