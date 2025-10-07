"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import EventCard from "@/app/components/EventCard";
import EventSkeleton from "@/app/components/EventSkeleton";

type EventItem = {
  id: string;
  title: string;
  start: string;            // ISO (ya normalizado a GT)
  location?: string;
  price?: string;
  image?: string;           // mapeado desde 'flyer'
  description?: string;
};

// Util: clave de agrupación por fecha (locale es-GT)
const dayKey = (iso: string) =>
  new Intl.DateTimeFormat("es-GT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
    .format(new Date(iso))
    .replace(/^./, (c) => c.toUpperCase());

// Helpers para combinar "Fecha" + "Hora de Inicio" en GT (-06:00)
function normalizeDateTime(fechaRaw?: any, horaRaw?: any): string | null {
  // fechaRaw esperado tipo "11/10/2025" o ISO; horaRaw "9:00:00" o "9:00"
  const fecha = String(fechaRaw ?? "").trim();
  const hora = String(horaRaw ?? "").trim();

  if (!fecha && !hora) return null;

  // Si ya viene un ISO completo, lo devolvemos tal cual
  if (fecha && /^\d{4}-\d{2}-\d{2}T/.test(fecha)) {
    const d = new Date(fecha);
    return Number.isNaN(+d) ? null : d.toISOString();
  }

  // Parse hora "H:mm" o "H:mm:ss"
  let hh = "00",
    mm = "00";
  if (hora) {
    const parts = hora.split(":");
    hh = (parts[0] || "00").padStart(2, "0");
    mm = (parts[1] || "00").padStart(2, "0");
  }

  // Intentar fecha en formato DD/MM/YYYY o M/D/YYYY
  // (Google Sheets en es-GT suele usar DD/MM/YYYY)
  const fParts = fecha.split(/[/-]/).map((p) => p.trim());
  let yyyy = "", mmf = "", ddf = "";
  if (fParts.length === 3) {
    // Heurística: si la primera parte > 12, asumimos DD/MM/YYYY
    const a = parseInt(fParts[0], 10);
    const b = parseInt(fParts[1], 10);
    const c = parseInt(fParts[2], 10);

    if (a > 12) {
      // DD/MM/YYYY
      ddf = String(a).padStart(2, "0");
      mmf = String(b).padStart(2, "0");
      yyyy = String(c);
    } else if (b > 12) {
      // MM/DD/YYYY no aplica en es-GT, pero por si acaso
      ddf = String(b).padStart(2, "0");
      mmf = String(a).padStart(2, "0");
      yyyy = String(c);
    } else {
      // Si ambos <=12, asumimos DD/MM/YYYY (consistente con es-GT)
      ddf = String(a).padStart(2, "0");
      mmf = String(b).padStart(2, "0");
      yyyy = String(c);
    }
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    // YYYY-MM-DD
    const [Y, M, D] = fecha.split("-");
    yyyy = Y;
    mmf = M;
    ddf = D;
  } else {
    return null;
  }

  // Construir con offset fijo GT -06:00 para que no se corra la hora
  const isoLocal = `${yyyy}-${mmf}-${ddf}T${hh}:${mm}:00-06:00`;
  const d = new Date(isoLocal);
  return Number.isNaN(+d) ? null : d.toISOString();
}

export default function EventsFeed() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<EventItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  // Evitar doble fetch en dev (StrictMode)
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const url = process.env.NEXT_PUBLIC_EVENTS_JSON_URL;
        if (!url) throw new Error("Missing NEXT_PUBLIC_EVENTS_JSON_URL");

        const res = await fetch(url, { cache: "no-store", signal: ac.signal });
        const ct = res.headers.get("content-type") || "";
        const raw = ct.includes("application/json")
          ? await res.json()
          : JSON.parse(await res.text());
        const arr = Array.isArray(raw) ? raw : [raw];

        const out: EventItem[] = arr
          .filter((e: any) => e && (e.title || e.Titulo))
          .map((e: any, i: number) => {
            // Campos posibles desde la Sheet / Apps Script
            const title = String(e.title ?? e.Titulo ?? "").trim();

            // 1) Preferir combinación Fecha + Hora de Inicio
            const startIso =
              normalizeDateTime(e.Fecha ?? e.start, e["Hora de Inicio"] ?? e.start_time) ||
              // 2) Si no hay hora, al menos fecha (00:00 GT)
              normalizeDateTime(e.Fecha ?? e.start, "00:00") ||
              null;

            const location = String(e.location ?? e.Ubicacion ?? e["Ubicación"] ?? "").trim() || undefined;
            const price = String(e.price ?? e.Precio ?? "").trim() || undefined;
            const image =
              String(e.image ?? e.flyer ?? e.Flyer ?? e.flyer_url ?? "").trim() || undefined;
            const description = String(e.description ?? e.Descripcion ?? e["Descripción"] ?? "").trim() || undefined;

            return {
              id: String(e.id ?? `${title}-${startIso ?? "na"}-${i}`),
              title,
              start: startIso ?? new Date().toISOString(), // fallback seguro (no debería pasar)
              location,
              price,
              image,
              description,
            };
          })
          .filter((e) => !Number.isNaN(new Date(e.start).getTime()))
          .sort((a, b) => +new Date(a.start) - +new Date(b.start));

        setItems(out);
      } catch (e: any) {
        setErr(e?.message || "No se pudieron cargar los eventos.");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  const groups = useMemo(() => {
    const g: Record<string, EventItem[]> = {};
    for (const e of items) {
      const k = dayKey(e.start);
      (g[k] ||= []).push(e);
    }
    return g;
  }, [items]);

  if (loading) {
    return (
      <section className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <EventSkeleton key={i} />
        ))}
      </section>
    );
  }

  if (err) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Error: {err}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex justify-center items-center py-10 text-neutral-500">
        No hay eventos aprobados todavía.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([day, list]) => (
        <section key={day} className="space-y-3">
          {/* Encabezado de fecha sticky + blur (tu estilo) */}
          <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 backdrop-blur-md bg-white/85 border-b border-white/40">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-neutral-800">
              📅 {day}
            </h2>
          </div>

          {list.map((e) => (
            <EventCard key={e.id} item={e} />
          ))}
        </section>
      ))}
    </div>
  );
}