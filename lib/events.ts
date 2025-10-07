// lib/events.ts
export type EventItem = {
  id: string;
  title: string;
  start: string; // ISO
  end?: string;
  location?: string;
  price?: string;
  contact?: string;
  image?: string; // from flyer
  description?: string;
  category?: string;
  zone?: string;
};

export type RawEvent = {
  id?: string;
  title?: string;
  Titulo?: string;

  start?: string;
  Fecha?: string;

  end?: string;
  ["Hora de Finalizacion"]?: string;
  HoraFin?: string;

  ["Hora de Inicio"]?: string;
  start_time?: string;

  location?: string;
  Ubicacion?: string;
  ["Ubicación"]?: string;

  price?: string;
  Precio?: string;

  contact?: string;
  Contacto?: string;

  image?: string;
  flyer?: string;
  Flyer?: string;
  flyer_url?: string;

  description?: string;
  Descripcion?: string;
  ["Descripción"]?: string;

  category?: string;
  Categoria?: string;

  zone?: string;
  Zona?: string;
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function isRawEvent(x: unknown): x is RawEvent {
  if (!isRecord(x)) return false;
  // campo mínimo: título o fecha/fecha+hora
  return (
    "title" in x ||
    "Titulo" in x ||
    "start" in x ||
    "Fecha" in x
  );
}

function driveId(url?: string): string | null {
  if (!url) return null;
  const s = decodeURIComponent(String(url).trim());
  const byFile = s.match(/\/file\/d\/([^/]+)/);
  if (byFile) return byFile[1];
  const byId = s.match(/[?&]id=([^&]+)/);
  if (byId) return byId[1];
  const byUc = s.match(/\/uc(?:\?|\/).*?[?&]id=([^&]+)/);
  if (byUc) return byUc[1];
  return null;
}

export function toImgSrc(url?: string): string | undefined {
  if (!url) return undefined;
  const id = driveId(url);
  return id ? `https://drive.google.com/uc?export=view&id=${id}` : url.trim();
}

function toStr(v: unknown): string | undefined {
  const s = String(v ?? "").trim();
  return s.length ? s : undefined;
}

export function mapRawToEvent(e: RawEvent, idx: number): EventItem | null {
  const title = toStr(e.title ?? e.Titulo);
  const start =
    toStr(e.start ?? e.Fecha) ?? undefined;

  if (!title || !start) return null;

  const out: EventItem = {
    id: toStr(e.id) ?? `${title}-${start}-${idx}`,
    title,
    start,
    end: toStr(e.end ?? e["Hora de Finalizacion"] ?? e.HoraFin),
    location: toStr(e.location ?? e.Ubicacion ?? e["Ubicación"]),
    price: toStr(e.price ?? e.Precio),
    contact: toStr(e.contact ?? e.Contacto),
    image: toImgSrc(toStr(e.image ?? e.flyer ?? e.Flyer ?? e.flyer_url)),
    description: toStr(e.description ?? e.Descripcion ?? e["Descripción"]),
    category: toStr(e.category ?? e.Categoria),
    zone: toStr(e.zone ?? e.Zona),
  };

  // Validar fecha parseable (evitar NaN)
  if (Number.isNaN(new Date(out.start).getTime())) return null;
  if (out.end && Number.isNaN(new Date(out.end).getTime())) {
    delete out.end;
  }

  return out;
}

export async function fetchEventsFromSource(url: string, abortSignal?: AbortSignal): Promise<EventItem[]> {
  const r = await fetch(url, { cache: "no-store", signal: abortSignal });
  const ct = r.headers.get("content-type") ?? "";
  const raw: unknown = ct.includes("application/json") ? await r.json() : JSON.parse(await r.text());
  const arr: unknown[] = Array.isArray(raw) ? raw : [raw];

  const mapped: EventItem[] = [];
  for (let i = 0; i < arr.length; i++) {
    const row = arr[i];
    if (!isRawEvent(row)) continue;
    const ev = mapRawToEvent(row, i);
    if (ev) mapped.push(ev);
  }

  // Ordenar por start asc
  mapped.sort((a, b) => +new Date(a.start) - +new Date(b.start));
  return mapped;
}

export async function getEvents(abortSignal?: AbortSignal): Promise<EventItem[]> {
  const url = process.env.NEXT_PUBLIC_EVENTS_JSON_URL;
  if (!url) return [];
  return fetchEventsFromSource(url, abortSignal);
}