import { NextResponse } from "next/server";
import { createEvents } from "ics";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_EVENTS_JSON_URL;
  if (!url) return new NextResponse("Missing env", { status: 500 });

  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) return new NextResponse("Upstream error", { status: 502 });

  const events = await r.json();
  const icsEvents = events.map((e: any) => {
    const d = new Date(e.start);
    const hours = e.end ? Math.max(1, (new Date(e.end).getTime() - d.getTime()) / 3600000) : 3;
    return {
      title: e.title,
      location: e.location,
      description: `${e.price ?? ""} ${e.contact ?? ""}`.trim(),
      start: [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()],
      duration: { hours: Math.round(hours) },
    };
  });
  const { value } = createEvents(icsEvents);
  return new NextResponse(value, { headers: { "Content-Type": "text/calendar; charset=utf-8" } });
}