// app/api/events/route.ts
import { NextResponse } from "next/server";
import { getEvents } from "@/lib/events";

export const dynamic = "force-dynamic";
// export const revalidate = 120; // <- si quieres cache breve en prod

export async function GET() {
  try {
    const events = await getEvents();
    return NextResponse.json(events);
  } catch (e: any) {
    return new NextResponse(e?.message || "Failed to load events", { status: 500 });
  }
}