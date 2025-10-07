// app/api/events/route.ts
import { NextResponse } from "next/server";
import { getEvents, type EventItem } from "@/lib/events";

export async function GET(): Promise<NextResponse<EventItem[] | { error: string }>> {
  try {
    const items = await getEvents();
    return NextResponse.json(items, { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}