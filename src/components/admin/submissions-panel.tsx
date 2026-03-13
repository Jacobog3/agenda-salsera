"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2, XCircle, Loader2, CalendarDays, MapPin,
  Clock, User, Tag, ExternalLink, ImageOff, RefreshCw, GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type EventSub = {
  id: string; title: string; description: string | null;
  image_url: string | null; dance_style: string; date: string; time: string;
  price_text: string | null; city: string; venue_name: string;
  address: string | null; organizer_name: string | null;
  contact_url: string | null; created_at: string;
};

type AcademySub = {
  id: string; name: string; description: string | null;
  image_url: string | null; city: string; address: string | null;
  schedule_text: string | null; levels: string | null;
  trial_class: boolean; modality: string; styles: string | null;
  whatsapp: string | null; instagram: string | null; website: string | null;
  contact_name: string | null; created_at: string;
};

const DANCE_STYLE_LABELS: Record<string, string> = {
  salsa: "Salsa", bachata: "Bachata", salsa_bachata: "Salsa y Bachata", other: "Otro"
};

type Tab = "events" | "academies";

export function SubmissionsPanel() {
  const [tab, setTab] = useState<Tab>("events");
  const [events, setEvents] = useState<EventSub[]>([]);
  const [academies, setAcademies] = useState<AcademySub[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventSub | null>(null);
  const [selectedAcademy, setSelectedAcademy] = useState<AcademySub | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<EventSub>>({});
  const [editingAcademy, setEditingAcademy] = useState<Partial<AcademySub>>({});
  const [publishing, setPublishing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [evRes, acRes] = await Promise.all([
        fetch("/api/admin/submissions"),
        fetch("/api/admin/academy-submissions")
      ]);
      const [evJson, acJson] = await Promise.all([evRes.json(), acRes.json()]);
      setEvents(evJson.data ?? []);
      setAcademies(acJson.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function closeDetail() {
    setSelectedEvent(null);
    setSelectedAcademy(null);
    setEditingEvent({});
    setEditingAcademy({});
    setActionMsg("");
  }

  async function handlePublishEvent() {
    if (!selectedEvent) return;
    setPublishing(true);
    setActionMsg("");
    try {
      const res = await fetch(`/api/admin/submissions/${selectedEvent.id}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEvent)
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((s) => s.id !== selectedEvent.id));
        setActionMsg("✅ Publicado");
        setTimeout(closeDetail, 1200);
      } else {
        const err = await res.json();
        setActionMsg(`❌ ${err.error}`);
      }
    } finally { setPublishing(false); }
  }

  async function handleRejectEvent() {
    if (!selectedEvent) return;
    setRejecting(true);
    const res = await fetch(`/api/admin/submissions/${selectedEvent.id}`, { method: "DELETE" });
    if (res.ok) { setEvents((prev) => prev.filter((s) => s.id !== selectedEvent.id)); closeDetail(); }
    setRejecting(false);
  }

  async function handlePublishAcademy() {
    if (!selectedAcademy) return;
    setPublishing(true);
    setActionMsg("");
    try {
      const res = await fetch(`/api/admin/academy-submissions/${selectedAcademy.id}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingAcademy)
      });
      if (res.ok) {
        setAcademies((prev) => prev.filter((s) => s.id !== selectedAcademy.id));
        setActionMsg("✅ Publicado");
        setTimeout(closeDetail, 1200);
      } else {
        const err = await res.json();
        setActionMsg(`❌ ${err.error}`);
      }
    } finally { setPublishing(false); }
  }

  async function handleRejectAcademy() {
    if (!selectedAcademy) return;
    setRejecting(true);
    const res = await fetch(`/api/admin/academy-submissions/${selectedAcademy.id}`, { method: "DELETE" });
    if (res.ok) { setAcademies((prev) => prev.filter((s) => s.id !== selectedAcademy.id)); closeDetail(); }
    setRejecting(false);
  }

  // Event detail view
  if (selectedEvent) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={closeDetail} className="text-sm text-muted-foreground hover:text-foreground">← Volver</button>
          <span className="text-xs text-muted-foreground">{new Date(selectedEvent.created_at).toLocaleString("es-GT")}</span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          {editingEvent.image_url ? (
            <div className="bg-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={editingEvent.image_url} alt="Flyer" className="mx-auto max-h-64 object-contain" />
            </div>
          ) : (
            <div className="flex h-28 items-center justify-center bg-surface-soft">
              <ImageOff className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}
          <div className="space-y-4 p-4 md:p-6">
            <EditField label="Nombre del evento">
              <Input value={editingEvent.title ?? ""} onChange={(e) => setEditingEvent((p) => ({ ...p, title: e.target.value }))} />
            </EditField>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              <EditField label="Fecha"><Input type="date" value={editingEvent.date ?? ""} onChange={(e) => setEditingEvent((p) => ({ ...p, date: e.target.value }))} /></EditField>
              <EditField label="Hora"><Input type="time" value={editingEvent.time ?? ""} onChange={(e) => setEditingEvent((p) => ({ ...p, time: e.target.value }))} /></EditField>
              <EditField label="Precio"><Input value={editingEvent.price_text ?? ""} onChange={(e) => setEditingEvent((p) => ({ ...p, price_text: e.target.value }))} /></EditField>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <EditField label="Lugar"><Input value={editingEvent.venue_name ?? ""} onChange={(e) => setEditingEvent((p) => ({ ...p, venue_name: e.target.value }))} /></EditField>
              <EditField label="Ciudad"><Input value={editingEvent.city ?? ""} onChange={(e) => setEditingEvent((p) => ({ ...p, city: e.target.value }))} /></EditField>
            </div>
            <EditField label="Dirección"><Input value={editingEvent.address ?? ""} onChange={(e) => setEditingEvent((p) => ({ ...p, address: e.target.value }))} /></EditField>
            <div className="grid gap-4 md:grid-cols-2">
              <EditField label="Organizador"><Input value={editingEvent.organizer_name ?? ""} onChange={(e) => setEditingEvent((p) => ({ ...p, organizer_name: e.target.value }))} /></EditField>
              <EditField label="Contacto"><Input value={editingEvent.contact_url ?? ""} onChange={(e) => setEditingEvent((p) => ({ ...p, contact_url: e.target.value }))} /></EditField>
            </div>
            <EditField label="Estilo">
              <select value={editingEvent.dance_style ?? "salsa_bachata"} onChange={(e) => setEditingEvent((p) => ({ ...p, dance_style: e.target.value }))}
                className="flex h-11 w-full rounded-xl border border-border bg-surface-soft px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                <option value="salsa">Salsa</option>
                <option value="bachata">Bachata</option>
                <option value="salsa_bachata">Salsa y Bachata</option>
                <option value="other">Otro</option>
              </select>
            </EditField>
            <EditField label="Descripción"><Textarea rows={3} value={editingEvent.description ?? ""} onChange={(e) => setEditingEvent((p) => ({ ...p, description: e.target.value }))} /></EditField>
            {actionMsg && <p className="text-sm font-medium text-brand-600">{actionMsg}</p>}
            <ActionButtons onPublish={handlePublishEvent} onReject={handleRejectEvent} publishing={publishing} rejecting={rejecting} label="Publicar evento" />
          </div>
        </div>
      </div>
    );
  }

  // Academy detail view
  if (selectedAcademy) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={closeDetail} className="text-sm text-muted-foreground hover:text-foreground">← Volver</button>
          <span className="text-xs text-muted-foreground">{new Date(selectedAcademy.created_at).toLocaleString("es-GT")}</span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          {editingAcademy.image_url ? (
            <div className="bg-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={editingAcademy.image_url} alt="Academia" className="mx-auto max-h-52 object-contain" />
            </div>
          ) : (
            <div className="flex h-28 items-center justify-center bg-surface-soft">
              <ImageOff className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}
          <div className="space-y-4 p-4 md:p-6">
            <div className="grid gap-3 md:grid-cols-2 md:gap-4">
              <EditField label="Nombre"><Input value={editingAcademy.name ?? ""} onChange={(e) => setEditingAcademy((p) => ({ ...p, name: e.target.value }))} /></EditField>
              <EditField label="Contacto"><Input value={editingAcademy.contact_name ?? ""} onChange={(e) => setEditingAcademy((p) => ({ ...p, contact_name: e.target.value }))} /></EditField>
            </div>
            <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">Horarios</p>
              <EditField label="Horario de clases"><Input value={editingAcademy.schedule_text ?? ""} onChange={(e) => setEditingAcademy((p) => ({ ...p, schedule_text: e.target.value }))} placeholder="Ej: Lunes y Miércoles 6pm · Sábados 10am" /></EditField>
              <div className="grid gap-4 md:grid-cols-2">
                <EditField label="Niveles"><Input value={editingAcademy.levels ?? ""} onChange={(e) => setEditingAcademy((p) => ({ ...p, levels: e.target.value }))} /></EditField>
                <EditField label="Modalidad">
                  <select value={editingAcademy.modality ?? "presencial"} onChange={(e) => setEditingAcademy((p) => ({ ...p, modality: e.target.value }))}
                    className="flex h-11 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                    <option value="presencial">Presencial</option>
                    <option value="online">Online</option>
                    <option value="mixto">Mixto</option>
                  </select>
                </EditField>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editingAcademy.trial_class ?? false}
                  onChange={(e) => setEditingAcademy((p) => ({ ...p, trial_class: e.target.checked }))}
                  className="h-4 w-4 rounded accent-brand-600" />
                <span className="text-sm">Clase de prueba gratuita</span>
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <EditField label="Estilos"><Input value={editingAcademy.styles ?? ""} onChange={(e) => setEditingAcademy((p) => ({ ...p, styles: e.target.value }))} /></EditField>
              <EditField label="Ciudad"><Input value={editingAcademy.city ?? ""} onChange={(e) => setEditingAcademy((p) => ({ ...p, city: e.target.value }))} /></EditField>
            </div>
            <EditField label="Dirección"><Input value={editingAcademy.address ?? ""} onChange={(e) => setEditingAcademy((p) => ({ ...p, address: e.target.value }))} /></EditField>
            <EditField label="Descripción"><Textarea rows={3} value={editingAcademy.description ?? ""} onChange={(e) => setEditingAcademy((p) => ({ ...p, description: e.target.value }))} /></EditField>
            <div className="grid gap-3 md:grid-cols-3 md:gap-4">
              <EditField label="WhatsApp"><Input value={editingAcademy.whatsapp ?? ""} onChange={(e) => setEditingAcademy((p) => ({ ...p, whatsapp: e.target.value }))} /></EditField>
              <EditField label="Instagram"><Input value={editingAcademy.instagram ?? ""} onChange={(e) => setEditingAcademy((p) => ({ ...p, instagram: e.target.value }))} /></EditField>
              <EditField label="Web"><Input value={editingAcademy.website ?? ""} onChange={(e) => setEditingAcademy((p) => ({ ...p, website: e.target.value }))} /></EditField>
            </div>
            {actionMsg && <p className="text-sm font-medium text-brand-600">{actionMsg}</p>}
            <ActionButtons onPublish={handlePublishAcademy} onReject={handleRejectAcademy} publishing={publishing} rejecting={rejecting} label="Publicar academia" />
          </div>
        </div>
      </div>
    );
  }

  const currentCount = tab === "events" ? events.length : academies.length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Revisiones pendientes</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {currentCount === 0 ? "No hay pendientes" : `${currentCount} esperando revisión`}
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-gray-100 hover:text-foreground">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Actualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-surface-soft p-1">
        {([
          { key: "events" as Tab, label: "Eventos", count: events.length, icon: CalendarDays },
          { key: "academies" as Tab, label: "Academias", count: academies.length, icon: GraduationCap }
        ]).map(({ key, label, count, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition",
              tab === key ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}>
            <Icon className="h-4 w-4" />
            {label}
            {count > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        </div>
      ) : currentCount === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface-soft py-16 text-center">
          <CheckCircle2 className="h-10 w-10 text-green-400" />
          <p className="text-sm font-medium text-muted-foreground">Todo al día. No hay pendientes.</p>
        </div>
      ) : tab === "events" ? (
        <div className="space-y-3">
          {events.map((sub) => (
            <button key={sub.id} onClick={() => { setSelectedEvent(sub); setEditingEvent({ ...sub }); setActionMsg(""); }}
              className="flex w-full items-start gap-4 overflow-hidden rounded-2xl border border-border bg-white p-4 text-left transition hover:border-brand-300 hover:shadow-sm">
              {sub.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sub.image_url} alt={sub.title} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-surface-soft">
                  <ImageOff className="h-6 w-6 text-muted-foreground/40" />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate font-semibold text-foreground">{sub.title}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {sub.date && <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{sub.date}</span>}
                  {sub.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{sub.time}</span>}
                  {sub.venue_name && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{sub.venue_name}</span>}
                  {sub.organizer_name && <span className="flex items-center gap-1"><User className="h-3 w-3" />{sub.organizer_name}</span>}
                  {sub.dance_style && <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{DANCE_STYLE_LABELS[sub.dance_style] ?? sub.dance_style}</span>}
                  {sub.contact_url && <span className="flex items-center gap-1"><ExternalLink className="h-3 w-3" />Tiene link</span>}
                </div>
                <p className="text-[11px] text-muted-foreground/60">{new Date(sub.created_at).toLocaleString("es-GT")}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {academies.map((sub) => (
            <button key={sub.id} onClick={() => { setSelectedAcademy(sub); setEditingAcademy({ ...sub }); setActionMsg(""); }}
              className="flex w-full items-start gap-4 overflow-hidden rounded-2xl border border-border bg-white p-4 text-left transition hover:border-brand-300 hover:shadow-sm">
              {sub.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sub.image_url} alt={sub.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-surface-soft">
                  <GraduationCap className="h-6 w-6 text-muted-foreground/40" />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate font-semibold text-foreground">{sub.name}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {sub.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{sub.city}</span>}
                  {sub.schedule_text && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{sub.schedule_text}</span>}
                  {sub.levels && <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{sub.levels}</span>}
                  {sub.trial_class && <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="h-3 w-3" />Clase gratuita</span>}
                </div>
                <p className="text-[11px] text-muted-foreground/60">{new Date(sub.created_at).toLocaleString("es-GT")}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionButtons({ onPublish, onReject, publishing, rejecting, label }: {
  onPublish: () => void; onReject: () => void;
  publishing: boolean; rejecting: boolean; label: string;
}) {
  return (
    <div className="flex flex-col gap-2 pt-2 sm:flex-row">
      <Button onClick={onPublish} disabled={publishing || rejecting} className="gap-2 bg-green-600 hover:bg-green-700">
        {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        {label}
      </Button>
      <Button variant="outline" onClick={onReject} disabled={publishing || rejecting}
        className="gap-2 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600">
        {rejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
        Rechazar
      </Button>
    </div>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
