// lib/events.ts
export type EventItem = {
    id: string;
    title: string;
    start: string;
    location?: string;
    price?: string;
    image?: string;
    description?: string;
  };
  
  const toBool = (v: any) => {
    const s = String(v ?? "").toLowerCase().trim();
    return s === "true" || s === "sí" || s === "si" || s === "1";
  };
  
  export async function getEvents(): Promise<EventItem[]> {
    const url = process.env.NEXT_PUBLIC_EVENTS_JSON_URL;
    if (!url) throw new Error("Missing NEXT_PUBLIC_EVENTS_JSON_URL");
  
    const res = await fetch(url, { cache: "no-store" });
    const ct = res.headers.get("content-type") || "";
    let raw: any;
    if (ct.includes("application/json")) {
      raw = await res.json();
    } else {
      const txt = await res.text();
      try { raw = JSON.parse(txt); }
      catch { throw new Error("Endpoint did not return valid JSON"); }
    }
  
    const arr: Record<string, any>[] = Array.isArray(raw) ? raw : [raw];
  
    const out: EventItem[] = arr
      .filter((e) => e && (e.title || e.Titulo || e["Titulo"] || e["Título"]))
      .filter((e) => ("approved" in e ? toBool(e.approved) : true)) // keep if not present
      .map((e, i) => {
        const title = String(e.title ?? e.Titulo ?? e["Titulo"] ?? e["Título"] ?? "").trim();
        const start = String(e.start ?? e.Fecha ?? "").trim();
        const location = String(e.location ?? e.Ubicacion ?? e["Ubicación"] ?? "").trim() || undefined;
        const price = String(e.price ?? e.Precio ?? "").trim() || undefined;
        const image = String(e.image ?? e.flyer ?? e.Flyer ?? e.flyer_url ?? e.Flyer_URL ?? "").trim() || undefined;
        const description = String(e.description ?? e.Descripcion ?? e["Descripción"] ?? "").trim() || undefined;
  
        return {
          id: String(e.id ?? `${title}-${start}-${i}`),
          title,
          start,
          location,
          price,
          image,
          description,
        };
      })
      .filter((e) => !Number.isNaN(new Date(e.start).getTime()))
      .sort((a, b) => +new Date(a.start) - +new Date(b.start));
  
    return out;
  }