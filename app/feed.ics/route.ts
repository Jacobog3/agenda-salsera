// app/feed.ics/route.ts
import { NextResponse } from "next/server";
import { createEvents, type EventAttributes } from "ics";
import { getEvents } from "@/lib/events";

export async function GET(): Promise<Response> {
  try {
    const events = await getEvents();

    const icsEvents: EventAttributes[] = events.map((e) => {
      const startDate = new Date(e.start);
      const endDate = e.end ? new Date(e.end) : new Date(startDate.getTime() + 3 * 3600 * 1000); // 3h por defecto

      return {
        title: e.title,
        location: e.location,
        description: [e.price, e.contact].filter(Boolean).join(" ").trim() || undefined,
        start: [
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          startDate.getDate(),
          startDate.getHours(),
          startDate.getMinutes(),
        ],
        end: [
          endDate.getFullYear(),
          endDate.getMonth() + 1,
          endDate.getDate(),
          endDate.getHours(),
          endDate.getMinutes(),
        ],
      };
    });

    const { value, error } = createEvents(icsEvents);
    if (error) {
      return NextResponse.json({ error: String(error) }, { status: 500 });
    }

    return new NextResponse(value, {
      status: 200,
      headers: { "Content-Type": "text/calendar; charset=utf-8" },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}