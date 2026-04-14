"use client";

import { useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";
import { ImagePlus, Languages, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EntityAiPanel } from "./academy-ai-panel";
import { useIsDesktop } from "@/hooks/use-is-desktop";

type SpotData = Record<string, unknown>;

type Props = {
  item: SpotData | null;
  onClose: () => void;
  onSaved: () => void;
};

const AI_FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  city: "Ciudad",
  area: "Zona",
  address: "Dirección",
  description_es: "Descripción",
  schedule_es: "Horario",
  cover_charge_es: "Cover / entrada",
  whatsapp_url: "WhatsApp",
  instagram_url: "Instagram"
};

function buildInitialData(item: SpotData | null): SpotData {
  if (!item) {
    return {
      cover_image_url: "",
      name: "",
      city: "",
      area: "",
      address: "",
      schedule_es: "",
      cover_charge_es: "",
      whatsapp_url: "",
      instagram_url: "",
      google_maps_url: "",
      description_es: "",
      is_featured: false,
      is_published: true
    };
  }

  return {
    ...item
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
      {value ? (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="max-h-40 w-full bg-gray-50 object-contain" />
        </div>
      ) : null}
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
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
          {uploading ? "..." : "Subir"}
        </Button>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <p className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
      {label}
      {hint ? (
        <span className="ml-1 font-normal normal-case tracking-normal text-gray-400/70">
          — {hint}
        </span>
      ) : null}
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

export function SpotEditSheet({ item, onClose, onSaved }: Props) {
  const isCreating = item === null;
  const isDesktop = useIsDesktop();
  const [tab, setTab] = useState<"ai" | "form">("ai");
  const [data, setData] = useState<SpotData>(() => buildInitialData(item));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

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
    setData((prev) => ({ ...prev, ...fields }));
    setTab("form");
  }

  async function save(forceTranslate = false) {
    setSaving(true);
    setSaveError("");
    try {
      const payload: SpotData = { ...data };
      delete payload.id;
      delete payload.created_at;
      if (forceTranslate) payload.force_auto_translate = true;

      const url = isCreating ? "/api/admin/spots" : `/api/admin/spots/${String(item?.id)}`;
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

  const currentDataForAi = Object.fromEntries(
    Object.entries(data).filter(([key]) => !["id", "created_at"].includes(key))
  );

  const panelContent = (
    <div className="mobile-drawer-form flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">
            {isCreating ? "Nuevo spot" : String(data.name || "Spot")}
          </p>
          <p className="text-xs text-gray-400">
            {isCreating
              ? "Usa la IA para generar el borrador o rellena el formulario"
              : "Editar información del spot"}
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

      <div className="flex shrink-0 border-b border-gray-100 px-4">
        {(["ai", "form"] as const).map((nextTab) => (
          <button
            key={nextTab}
            type="button"
            onClick={() => setTab(nextTab)}
            className={[
              "-mb-px mr-4 border-b-2 px-1 py-2.5 text-sm font-medium transition-colors",
              tab === nextTab
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            ].join(" ")}
          >
            {nextTab === "ai" ? "✦ IA" : "Formulario"}
          </button>
        ))}
      </div>

      <div className="mobile-drawer-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {tab === "ai" ? (
          <div className="p-4">
            <p className="mb-4 text-xs leading-5 text-gray-500">
              Sube flyers, historias o capturas de redes. La IA puede proponer nombre, horario,
              cover, dirección y redes del spot.
            </p>
            <EntityAiPanel
              entity="spot"
              mode={isCreating ? "create" : "update"}
              currentData={currentDataForAi}
              fieldLabels={AI_FIELD_LABELS}
              onApply={applyAiSuggestions}
            />
          </div>
        ) : (
          <div className="space-y-3 p-4">
            <SectionHeading>Imagen</SectionHeading>
            <ImageField
              label="Imagen principal"
              value={String(data.cover_image_url ?? "")}
              onChange={(url) => set("cover_image_url", url)}
            />

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
                <FieldLabel label="Zona" />
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

            <SectionHeading>Detalles</SectionHeading>
            <div className="space-y-1">
              <FieldLabel label="Horario" hint="se traduce automáticamente al inglés" />
              <Textarea
                rows={3}
                value={String(data.schedule_es ?? "")}
                onChange={(e) => set("schedule_es", e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <FieldLabel label="Cover / entrada" hint="se traduce automáticamente al inglés" />
              <Input
                value={String(data.cover_charge_es ?? "")}
                onChange={(e) => set("cover_charge_es", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <FieldLabel label="Descripción" hint="se traduce automáticamente al inglés" />
              <Textarea
                rows={4}
                value={String(data.description_es ?? "")}
                onChange={(e) => set("description_es", e.target.value)}
                className="text-sm"
              />
            </div>

            <SectionHeading>Contacto</SectionHeading>
            <div className="space-y-1">
              <FieldLabel label="WhatsApp URL" />
              <Input
                value={String(data.whatsapp_url ?? "")}
                onChange={(e) => set("whatsapp_url", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <FieldLabel label="Instagram URL" />
              <Input
                value={String(data.instagram_url ?? "")}
                onChange={(e) => set("instagram_url", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <FieldLabel label="Google Maps URL" />
              <Input
                value={String(data.google_maps_url ?? "")}
                onChange={(e) => set("google_maps_url", e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <SectionHeading>Estado</SectionHeading>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(data.is_featured)}
                onChange={(e) => set("is_featured", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-brand-600"
              />
              <span className="text-sm text-gray-600">Destacado en listados</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 pb-2">
              <input
                type="checkbox"
                checked={data.is_published !== false}
                onChange={(e) => set("is_published", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-brand-600"
              />
              <span className="text-sm text-gray-600">Publicado y visible en el sitio</span>
            </label>
          </div>
        )}
      </div>

      <div className="shrink-0 space-y-2 border-t border-gray-100 bg-white p-4">
        {saveError ? <p className="text-xs font-medium text-red-600">{saveError}</p> : null}
        <div className="flex gap-2">
          <Button onClick={() => save(false)} disabled={saving} className="flex-1 gap-1.5">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isCreating ? "Nuevo spot" : String(data.name || "Editar spot")}
        className="fixed inset-y-0 right-0 z-50 flex w-[460px] max-w-[100vw] flex-col bg-white shadow-2xl [animation:slide-in-from-right_0.3s_ease-out_both]"
      >
        {panelContent}
      </div>
    </>
  );
}
