"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Languages, Loader2, Save, X } from "lucide-react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EntityAiPanel } from "./academy-ai-panel";
import { ScheduleEditor } from "./schedule-editor";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import type { ScheduleDay } from "@/types/academy";

type AcademyData = Record<string, unknown>;

type Props = {
  item: AcademyData | null; // null = creating new
  onClose: () => void;
  onSaved: () => void;
};

const MODALITY_OPTIONS = [
  { value: "presencial", label: "Presencial" },
  { value: "online", label: "Online" },
  { value: "mixto", label: "Mixto" }
];

const AI_FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  city: "Ciudad",
  area: "Zona / Área",
  address: "Dirección",
  description_es: "Descripción",
  style_tags: "Estilos",
  schedule_text: "Horarios (resumen)",
  schedule_data: "Horario estructurado",
  levels: "Niveles",
  price_text: "Precios",
  modality: "Modalidad",
  trial_class: "Clase de prueba",
  whatsapp_url: "WhatsApp",
  instagram_url: "Instagram",
  facebook_url: "Facebook",
  website_url: "Sitio web"
};

function buildInitialData(item: AcademyData | null): AcademyData {
  if (!item) {
    return {
      name: "", city: "", area: "", address: "",
      cover_image_url: "", banner_image_url: "",
      description_es: "", description_en: "",
      style_tags: "", schedule_text: "", schedule_data: null,
      levels: "", price_text: "", modality: "presencial",
      trial_class: false,
      whatsapp_url: "", instagram_url: "", facebook_url: "", website_url: "",
      is_published: true
    };
  }

  return {
    ...item,
    // Normalize style_tags array to newline string for the textarea
    style_tags: Array.isArray(item.style_tags)
      ? (item.style_tags as string[]).join("\n")
      : String(item.style_tags ?? "")
  };
}

async function uploadAdminImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(String(data.error ?? "Upload failed"));
  return String(data.url);
}

function ImageField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      onChange(await uploadAdminImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {label}
      </label>
      {value && (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="max-h-32 w-full bg-gray-50 object-contain" />
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL de imagen"
          className="h-9 flex-1 text-xs"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="h-9 shrink-0 gap-1"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ImagePlus className="h-3.5 w-3.5" />
          )}
          {uploading ? "..." : "Subir"}
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <p className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
      {label}
      {hint && (
        <span className="ml-1 font-normal normal-case tracking-normal text-gray-400/70">
          — {hint}
        </span>
      )}
    </p>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="pt-2 text-[10px] font-bold uppercase tracking-widest text-brand-600">
      {children}
    </p>
  );
}

export function AcademyEditSheet({ item, onClose, onSaved }: Props) {
  const isCreating = item === null;
  const isDesktop = useIsDesktop();
  const [tab, setTab] = useState<"ai" | "form">("ai");
  const [data, setData] = useState<AcademyData>(() => buildInitialData(item));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Prevent background scroll while sheet is open (desktop only; vaul handles mobile)
  useEffect(() => {
    if (!isDesktop) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isDesktop]);

  function set(key: string, value: unknown) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function applyAiSuggestions(fields: Record<string, unknown>) {
    const normalized = { ...fields };
    // Normalize style_tags array to textarea-friendly string
    if (Array.isArray(normalized.style_tags)) {
      normalized.style_tags = (normalized.style_tags as string[]).join("\n");
    }
    setData((prev) => ({ ...prev, ...normalized }));
    setTab("form");
  }

  async function save(forceTranslate = false) {
    setSaving(true);
    setSaveError("");
    try {
      const payload: AcademyData = { ...data };
      delete payload.id;
      delete payload.created_at;
      if (forceTranslate) payload.force_auto_translate = true;

      const url = isCreating
        ? "/api/admin/academies"
        : `/api/admin/academies/${String(item?.id)}`;
      const method = isCreating ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const json = await res.json().catch(() => ({}));
        setSaveError(String(json.error ?? "No se pudo guardar."));
      }
    } finally {
      setSaving(false);
    }
  }

  const scheduleData = Array.isArray(data.schedule_data)
    ? (data.schedule_data as ScheduleDay[])
    : null;

  const currentDataForAi = Object.fromEntries(
    Object.entries(data).filter(([k]) => k !== "id" && k !== "created_at")
  );

  const panelContent = (
    <div className="mobile-drawer-form flex min-h-0 flex-1 flex-col">
      {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {isCreating ? "Nueva academia" : String(data.name || "Academia")}
            </p>
            <p className="text-xs text-gray-400">
              {isCreating
                ? "Usa la IA para generar el borrador o rellena el formulario"
                : "Editar información de la academia"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 border-b border-gray-100 px-4">
          {(["ai", "form"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={[
                "-mb-px mr-4 border-b-2 px-1 py-2.5 text-sm font-medium transition-colors",
                tab === t
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              ].join(" ")}
            >
              {t === "ai" ? "✦ IA" : "Formulario"}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="mobile-drawer-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {tab === "ai" ? (
            <div className="p-4">
              <p className="mb-4 text-xs leading-5 text-gray-500">
                Sube posts de Instagram o WhatsApp. La IA los analiza todos juntos y unifica la
                información — por ejemplo, un post con el horario del lunes y otro con el del
                viernes quedan combinados en un solo horario.
              </p>
              <EntityAiPanel
                entity="academy"
                mode={isCreating ? "create" : "update"}
                currentData={currentDataForAi}
                fieldLabels={AI_FIELD_LABELS}
                onApply={applyAiSuggestions}
              />
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {/* Imágenes */}
              <SectionHeading>Imágenes</SectionHeading>
              <ImageField
                label="Logo / Imagen principal"
                value={String(data.cover_image_url ?? "")}
                onChange={(url) => set("cover_image_url", url)}
              />
              <ImageField
                label="Banner (opcional)"
                value={String(data.banner_image_url ?? "")}
                onChange={(url) => set("banner_image_url", url)}
              />

              {/* Información */}
              <SectionHeading>Información</SectionHeading>
              <div className="space-y-1">
                <FieldLabel label="Nombre" />
                <Input
                  value={String(data.name ?? "")}
                  onChange={(e) => set("name", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <FieldLabel label="Ciudad" />
                  <Input
                    value={String(data.city ?? "")}
                    onChange={(e) => set("city", e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <FieldLabel label="Zona / Área" />
                  <Input
                    value={String(data.area ?? "")}
                    onChange={(e) => set("area", e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <FieldLabel label="Dirección" />
                <Textarea
                  rows={2}
                  value={String(data.address ?? "")}
                  onChange={(e) => set("address", e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Clases */}
              <SectionHeading>Clases</SectionHeading>
              <div className="space-y-1">
                <FieldLabel label="Estilos y subestilos" hint="uno por línea o separados por coma" />
                <Textarea
                  rows={2}
                  value={String(data.style_tags ?? "")}
                  onChange={(e) => set("style_tags", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <FieldLabel label="Horario estructurado" hint="generado por la IA o edítalo manualmente" />
                <ScheduleEditor
                  value={scheduleData}
                  onChange={(days) => {
                    set("schedule_data", days);
                    // Auto-generate schedule_text summary
                    const summary = days
                      .map((d) => `${d.day}: ${d.classes.map((c) => c.time).join(", ")}`)
                      .join(" · ");
                    set("schedule_text", summary);
                  }}
                />
              </div>
              <div className="space-y-1">
                <FieldLabel label="Niveles" />
                <Input
                  value={String(data.levels ?? "")}
                  onChange={(e) => set("levels", e.target.value)}
                  placeholder="Principiante, Intermedio, Avanzado"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <FieldLabel label="Precios" hint="texto libre" />
                <Input
                  value={String(data.price_text ?? "")}
                  onChange={(e) => set("price_text", e.target.value)}
                  placeholder="Q200/mes · Q50 clase suelta"
                  className="h-9 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <FieldLabel label="Modalidad" />
                  <select
                    value={String(data.modality ?? "presencial")}
                    onChange={(e) => set("modality", e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {MODALITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <FieldLabel label="Clase de prueba" />
                  <label className="flex h-9 cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(data.trial_class)}
                      onChange={(e) => set("trial_class", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 accent-brand-600"
                    />
                    <span className="text-sm text-gray-600">Gratis</span>
                  </label>
                </div>
              </div>

              {/* Contacto */}
              <SectionHeading>Contacto</SectionHeading>
              {(
                [
                  ["whatsapp_url", "WhatsApp URL"],
                  ["instagram_url", "Instagram URL"],
                  ["facebook_url", "Facebook URL"],
                  ["website_url", "Sitio web"]
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-1">
                  <FieldLabel label={label} />
                  <Input
                    value={String(data[key] ?? "")}
                    onChange={(e) => set(key, e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              ))}

              {/* Descripción */}
              <SectionHeading>Descripción</SectionHeading>
              <div className="space-y-1">
                <FieldLabel label="Descripción en español" hint="se traduce automáticamente al inglés" />
                <Textarea
                  rows={4}
                  value={String(data.description_es ?? "")}
                  onChange={(e) => set("description_es", e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Estado */}
              <SectionHeading>Estado</SectionHeading>
              <label className="flex cursor-pointer items-center gap-2 pb-2">
                <input
                  type="checkbox"
                  checked={data.is_published !== false}
                  onChange={(e) => set("is_published", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-brand-600"
                />
                <span className="text-sm text-gray-600">Publicada y visible en el sitio</span>
              </label>
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="shrink-0 space-y-2 border-t border-gray-100 bg-white p-4">
          {saveError && <p className="text-xs font-medium text-red-600">{saveError}</p>}
          <div className="flex gap-2">
            <Button onClick={() => save(false)} disabled={saving} className="flex-1 gap-1.5">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar
            </Button>
            <Button
              variant="outline"
              onClick={() => save(true)}
              disabled={saving}
              title="Guardar y regenerar traducción al inglés"
              className="shrink-0 gap-1.5"
            >
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">+ inglés</span>
            </Button>
          </div>
        </div>
    </div>
  );

  // Mobile: vaul Drawer with native swipe-to-dismiss
  if (!isDesktop) {
    return (
      <Drawer.Root open onOpenChange={(open) => { if (!open) onClose(); }} shouldScaleBackground handleOnly fixed repositionInputs={false}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/50" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] min-h-0 flex-col rounded-t-2xl bg-white shadow-2xl outline-none">
            <Drawer.Handle className="mx-auto mt-3 mb-1 h-1 w-10 rounded-full bg-gray-200" />
            {panelContent}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  // Desktop: right slide-over panel
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isCreating ? "Nueva academia" : String(data.name || "Editar academia")}
        className="fixed inset-y-0 right-0 z-50 flex w-[460px] flex-col bg-white shadow-2xl [animation:slide-in-from-right_0.3s_ease-out_both]"
      >
        {panelContent}
      </div>
    </>
  );
}
