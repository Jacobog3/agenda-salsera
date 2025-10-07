"use client";
import { useMemo, useState } from "react";

export type EventItem = {
  id: string;
  title: string;
  start: string;         // ISO
  location?: string;
  price?: string;
  image?: string;        // viene de "flyer" ya mapeado
  description?: string;
};

const fmtTime = (iso: string) => {
    const d = new Date(iso);
    // Formateamos en en-US para obtener "AM/PM" sin espacios y luego lo pasamos a "a.m./p.m."
    const en = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .format(d)            // ej: "9:00 AM"
      .toLowerCase()        // "9:00 am"
      .replace("am", "a.m.")
      .replace("pm", "p.m.");
    return en;
  };

function driveId(url?: string): string | null {
  if (!url) return null;
  const s = decodeURIComponent(String(url).trim());
  const q = s.match(/[?&]id=([^&]+)/);
  if (q) return q[1];
  const mFile = s.match(/\/file\/d\/([^/]+)/);
  if (mFile) return mFile[1];
  const mUc = s.match(/\/uc(?:\?|\/).*?[?&]id=([^&]+)/);
  if (mUc) return mUc[1];
  return null;
}

function toImgSrc(url?: string): string {
  const id = driveId(url);
  if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
  return (url || "").trim();
}

export default function EventCard({ item }: { item: EventItem }) {
  const [open, setOpen] = useState(false);

  const time = useMemo(() => fmtTime(item.start), [item.start]);
  const rawImg = useMemo(() => toImgSrc(item.image), [item.image]);

  // Proxy para evitar bloqueos de Drive en <img>
  const proxiedImg = useMemo(
    () => (rawImg ? `/api/proxy-image?url=${encodeURIComponent(rawImg)}` : ""),
    [rawImg]
  );

  const flyerHref = rawImg;

  const PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='675'%3E%3Crect width='100%25' height='100%25' fill='%23eef2f7'/%3E%3C/svg%3E";

  return (
    <article className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      {/* Cover 16:9 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={proxiedImg || PLACEHOLDER}
        alt=""
        className="aspect-[16/9] w-full object-cover block"
        loading="lazy"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
        }}
      />

      <div className="p-3">
        <h3 className="line-clamp-2 text-[18px] font-semibold leading-tight tracking-[-0.015em]">
          {item.title}
        </h3>

        {/* Meta: hora • lugar • precio (sin fecha para no duplicar) */}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-neutral-700 min-w-0">
          <span className="shrink-0">🕒 {time}</span>
          {item.location && <span className="min-w-0 break-words">📍 {item.location}</span>}
          {item.price && <span className="shrink-0">💵 {item.price}</span>}
        </div>

        {/* Acciones: Flyer (negro) + Más (gradiente) */}
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <a
            href={flyerHref || "#"}
            target="_blank"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800 whitespace-nowrap"
          >
            Flyer
          </a>

          <button
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium text-white whitespace-nowrap
                       bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-500/90 hover:to-rose-500/90
                       will-change-transform"
            style={{ transform: "translateZ(0)" }}
          >
            <span>Más</span>
            {/* Flecha única (SVG) con rotación — estable en Brave */}
            <svg
              viewBox="0 0 24 24"
              className={`absolute right-3 h-6 w-6 text-white transition-transform duration-300 ${
                open ? "rotate-180" : "rotate-0"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M8 10l4 4 4-4"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Descripción (glass) */}
        <div
          className={`transition-all duration-300 ease-out ${
            open ? "opacity-100 max-h-[480px] mt-4" : "opacity-0 max-h-0 mt-0"
          }`}
        >
          {item.description && (
            <div className="mx-auto w-[90%] rounded-2xl bg-white/60 backdrop-blur-md px-5 py-4 text-center text-[13px] leading-relaxed text-neutral-800 shadow-[0_2px_14px_rgba(2,6,23,0.08)]">
              {item.description}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}