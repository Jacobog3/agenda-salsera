"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  CalendarDays,
  MapPin,
  Clock,
  User,
  Tag,
  ExternalLink,
  ImageOff,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Submission = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  dance_style: string;
  date: string;
  time: string;
  price_text: string | null;
  city: string;
  venue_name: string;
  address: string | null;
  organizer_name: string | null;
  contact_url: string | null;
  created_at: string;
};

const DANCE_STYLE_LABELS: Record<string, string> = {
  salsa: "Salsa",
  bachata: "Bachata",
  salsa_bachata: "Salsa y Bachata",
  other: "Otro"
};

export function SubmissionsPanel() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [editing, setEditing] = useState<Partial<Submission>>({});
  const [publishing, setPublishing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/submissions");
      const json = await res.json();
      setSubmissions(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openSubmission(sub: Submission) {
    setSelected(sub);
    setEditing({ ...sub });
    setActionMsg("");
  }

  function closeDetail() {
    setSelected(null);
    setEditing({});
    setActionMsg("");
  }

  async function handlePublish() {
    if (!selected) return;
    setPublishing(true);
    setActionMsg("");
    try {
      const res = await fetch(`/api/admin/submissions/${selected.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing)
      });
      if (res.ok) {
        setActionMsg("✅ Publicado correctamente");
        setSubmissions((prev) => prev.filter((s) => s.id !== selected.id));
        setTimeout(closeDetail, 1500);
      } else {
        const err = await res.json();
        setActionMsg(`❌ Error: ${err.error}`);
      }
    } finally {
      setPublishing(false);
    }
  }

  async function handleReject() {
    if (!selected) return;
    setRejecting(true);
    setActionMsg("");
    try {
      const res = await fetch(`/api/admin/submissions/${selected.id}`, { method: "DELETE" });
      if (res.ok) {
        setActionMsg("Rechazado");
        setSubmissions((prev) => prev.filter((s) => s.id !== selected.id));
        setTimeout(closeDetail, 800);
      }
    } finally {
      setRejecting(false);
    }
  }

  if (selected) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <button
            onClick={closeDetail}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Volver a la lista
          </button>
          <span className="text-xs text-muted-foreground">
            Recibido: {new Date(selected.created_at).toLocaleString("es-GT")}
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          {/* Flyer image */}
          {editing.image_url ? (
            <div className="relative max-h-64 w-full overflow-hidden bg-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={editing.image_url}
                alt="Flyer"
                className="mx-auto max-h-64 object-contain"
              />
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center bg-surface-soft text-muted-foreground">
              <ImageOff className="h-8 w-8 opacity-30" />
            </div>
          )}

          <div className="space-y-4 p-5 md:p-6">
            <EditField label="Nombre del evento">
              <Input
                value={editing.title ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))}
              />
            </EditField>

            <div className="grid gap-4 md:grid-cols-3">
              <EditField label="Fecha">
                <Input
                  type="date"
                  value={editing.date ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, date: e.target.value }))}
                />
              </EditField>
              <EditField label="Hora">
                <Input
                  type="time"
                  value={editing.time ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, time: e.target.value }))}
                />
              </EditField>
              <EditField label="Precio">
                <Input
                  value={editing.price_text ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, price_text: e.target.value }))}
                />
              </EditField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <EditField label="Lugar">
                <Input
                  value={editing.venue_name ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, venue_name: e.target.value }))}
                />
              </EditField>
              <EditField label="Ciudad">
                <Input
                  value={editing.city ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, city: e.target.value }))}
                />
              </EditField>
            </div>

            <EditField label="Dirección">
              <Input
                value={editing.address ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, address: e.target.value }))}
              />
            </EditField>

            <div className="grid gap-4 md:grid-cols-2">
              <EditField label="Organizador">
                <Input
                  value={editing.organizer_name ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, organizer_name: e.target.value }))}
                />
              </EditField>
              <EditField label="Contacto / Link">
                <Input
                  value={editing.contact_url ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, contact_url: e.target.value }))}
                />
              </EditField>
            </div>

            <EditField label="Estilo de baile">
              <select
                value={editing.dance_style ?? "salsa_bachata"}
                onChange={(e) => setEditing((p) => ({ ...p, dance_style: e.target.value }))}
                className="flex h-11 w-full rounded-xl border border-border bg-surface-soft px-4 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              >
                <option value="salsa">Salsa</option>
                <option value="bachata">Bachata</option>
                <option value="salsa_bachata">Salsa y Bachata</option>
                <option value="other">Otro (cumbia, merengue…)</option>
              </select>
            </EditField>

            <EditField label="Descripción">
              <Textarea
                rows={3}
                value={editing.description ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))}
              />
            </EditField>

            {actionMsg && (
              <p className="text-sm font-medium text-brand-600">{actionMsg}</p>
            )}

            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Button
                onClick={handlePublish}
                disabled={publishing || rejecting}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                {publishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Publicar evento
              </Button>
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={publishing || rejecting}
                className="gap-2 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                {rejecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Rechazar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Revisiones pendientes</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {submissions.length === 0
              ? "No hay eventos pendientes"
              : `${submissions.length} evento${submissions.length > 1 ? "s" : ""} esperando revisión`}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-gray-100 hover:text-foreground"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Actualizar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface-soft py-16 text-center">
          <CheckCircle2 className="h-10 w-10 text-green-400" />
          <p className="text-sm font-medium text-muted-foreground">Todo al día. No hay pendientes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <button
              key={sub.id}
              onClick={() => openSubmission(sub)}
              className="flex w-full items-start gap-4 overflow-hidden rounded-2xl border border-border bg-white p-4 text-left transition hover:border-brand-300 hover:shadow-sm"
            >
              {sub.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sub.image_url}
                  alt={sub.title}
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-surface-soft">
                  <ImageOff className="h-6 w-6 text-muted-foreground/40" />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate font-semibold text-foreground">{sub.title}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {sub.date && (
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {sub.date}
                    </span>
                  )}
                  {sub.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {sub.time}
                    </span>
                  )}
                  {sub.venue_name && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {sub.venue_name}
                    </span>
                  )}
                  {sub.organizer_name && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {sub.organizer_name}
                    </span>
                  )}
                  {sub.dance_style && (
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {DANCE_STYLE_LABELS[sub.dance_style] ?? sub.dance_style}
                    </span>
                  )}
                  {sub.contact_url && (
                    <span className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Tiene link
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground/60">
                  {new Date(sub.created_at).toLocaleString("es-GT")}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
