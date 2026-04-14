"use client";

import { useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";
import { ImagePlus, Languages, Loader2, Save, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EntityAiPanel } from "./academy-ai-panel";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { extractLowestPriceAmount } from "@/lib/utils/formatters";

type EventData = Record<string, unknown>;

type SelectOption = {
  value: string;
  label: string;
};

type Props = {
  item: EventData | null;
  onClose: () => void;
  onSaved: () => void;
};

const DANCE_STYLE_OPTIONS = [
  { value: "salsa_bachata", label: "Salsa y bachata" },
  { value: "salsa", label: "Salsa" },
  { value: "bachata", label: "Bachata" },
  { value: "other", label: "Otro" }
];

const CURRENCY_OPTIONS = [
  { value: "GTQ", label: "GTQ (Quetzales)" },
  { value: "USD", label: "USD (Dólares)" },
  { value: "", label: "No aplica / Gratis" }
];

const AI_FIELD_LABELS: Record<string, string> = {
  title_es: "Título",
  dance_style: "Estilo",
  starts_at: "Fecha y hora de inicio",
  ends_at: "Fecha y hora de cierre",
  venue_name: "Lugar",
  city: "Ciudad",
  address: "Dirección",
  price_text: "Precios",
  currency: "Moneda",
  organizer_name: "Organizador",
  contact_url: "Link de contacto",
  description_es: "Descripción"
};

function parseDateTimeLocal(isoString: string): { date: string; time: string } {
  if (!isoString) return { date: "", time: "" };
  const date = new Date(isoString);
  return {
    date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  };
}

function buildInitialData(item: EventData | null): EventData {
  if (!item) {
    return {
      cover_image_url: "",
      gallery_urls: [],
      title_es: "",
      description_es: "",
      dance_style: "salsa_bachata",
      starts_at_date: "",
      starts_at_time: "",
      ends_at_date: "",
      ends_at_time: "",
      venue_name: "",
      city: "",
      area: "",
      address: "",
      price_text: "",
      price_amount: "",
      currency: "GTQ",
      organizer_name: "",
      organizer_id: "",
      academy_id: "",
      teacher_ids: [],
      contact_url: "",
      is_featured: false,
      is_published: true
    };
  }

  const startsAt = parseDateTimeLocal(String(item.starts_at ?? ""));
  const endsAt = parseDateTimeLocal(String(item.ends_at ?? ""));

  return {
    ...item,
    gallery_urls: Array.isArray(item.gallery_urls)
      ? item.gallery_urls.map((entry) => String(entry ?? "")).filter(Boolean)
      : [],
    teacher_ids: Array.isArray(item.teacher_ids)
      ? item.teacher_ids.map((entry) => String(entry ?? "")).filter(Boolean)
      : [],
    price_amount:
      item.price_amount === null || item.price_amount === undefined || item.price_amount === ""
        ? ""
        : String(item.price_amount),
    starts_at_date: startsAt.date,
    starts_at_time: startsAt.time,
    ends_at_date: endsAt.date,
    ends_at_time: endsAt.time
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

function ImageListField({
  value,
  onChange
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const urls = Array.isArray(value) ? value : [];

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = await Promise.all(files.map((file) => uploadAdminImage(file)));
      onChange([...urls, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function updateAt(index: number, nextUrl: string) {
    onChange(urls.map((url, currentIndex) => (currentIndex === index ? nextUrl : url)));
  }

  function removeAt(index: number) {
    onChange(urls.filter((_, currentIndex) => currentIndex !== index));
  }

  function addEmpty() {
    onChange([...urls, ""]);
  }

  return (
    <div className="space-y-3">
      {urls.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-xs text-gray-500">
          No hay fotos extra en la galería.
        </div>
      ) : (
        <div className="space-y-3">
          {urls.map((url, index) => (
            <div key={`${index}-${url}`} className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-start gap-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={`Galería ${index + 1}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-wide text-gray-400">
                      Sin imagen
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    value={url}
                    onChange={(e) => updateAt(index, e.target.value)}
                    placeholder={`URL de imagen ${index + 1}`}
                    className="h-9 text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => removeAt(index)}
                    className="h-8 gap-1 text-xs text-red-600 hover:text-red-700"
                  >
                    <X className="h-3.5 w-3.5" />
                    Quitar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={addEmpty} className="h-8 gap-1 text-xs">
          <ImagePlus className="h-3.5 w-3.5" />
          Agregar URL
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="h-8 gap-1 text-xs"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
          {uploading ? "Subiendo..." : "Subir foto(s)"}
        </Button>
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

function SearchableMultiSelectField({
  value,
  options,
  onChange,
  placeholder
}: {
  value: string[];
  options: SelectOption[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const selectedValues = Array.isArray(value) ? value.map((entry) => String(entry)) : [];
  const selectedSet = new Set(selectedValues);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = options.filter((option) => {
    if (!normalizedQuery) return true;
    return option.label.toLowerCase().includes(normalizedQuery) || option.value.toLowerCase().includes(normalizedQuery);
  });
  const orderedOptions = [
    ...filteredOptions.filter((option) => selectedSet.has(option.value)),
    ...filteredOptions.filter((option) => !selectedSet.has(option.value))
  ];
  const selectedOptions = selectedValues.map((selectedValue) => {
    const matched = options.find((option) => option.value === selectedValue);
    return matched ?? { value: selectedValue, label: selectedValue };
  });

  function toggleOption(optionValue: string, checked: boolean) {
    if (checked) {
      onChange(selectedSet.has(optionValue) ? selectedValues : [...selectedValues, optionValue]);
      return;
    }

    onChange(selectedValues.filter((value) => value !== optionValue));
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder ?? "Buscar opción"}
          className="h-9 pl-9 text-sm"
        />
      </div>

      {selectedOptions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
            Seleccionados ({selectedOptions.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option.value, false)}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
              >
                <span>{option.label}</span>
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg bg-gray-50/80 p-1.5">
        {orderedOptions.length === 0 ? (
          <p className="px-2 py-3 text-xs text-gray-400">
            {options.length === 0 ? "No hay opciones disponibles." : "No hay resultados para esa búsqueda."}
          </p>
        ) : (
          orderedOptions.map((option) => {
            const checked = selectedSet.has(option.value);

            return (
              <label
                key={option.value}
                className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition ${
                  checked ? "bg-brand-50 text-brand-900" : "hover:bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => toggleOption(option.value, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-brand-600"
                />
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

export function EventEditSheet({ item, onClose, onSaved }: Props) {
  const isCreating = item === null;
  const isDesktop = useIsDesktop();
  const [tab, setTab] = useState<"ai" | "form">("ai");
  const [data, setData] = useState<EventData>(() => buildInitialData(item));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [organizerOptions, setOrganizerOptions] = useState<SelectOption[]>([
    { value: "", label: "Sin relacionar" }
  ]);
  const [academyOptions, setAcademyOptions] = useState<SelectOption[]>([
    { value: "", label: "Sin relacionar" }
  ]);
  const [teacherOptions, setTeacherOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    if (!isDesktop) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isDesktop]);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        const [organizersRes, academiesRes, teachersRes] = await Promise.all([
          fetch("/api/admin/organizers?format=options"),
          fetch("/api/admin/academies?format=options"),
          fetch("/api/admin/teachers?format=options")
        ]);

        const [organizersJson, academiesJson, teachersJson] = await Promise.all([
          organizersRes.json(),
          academiesRes.json(),
          teachersRes.json()
        ]);

        if (cancelled) return;

        setOrganizerOptions(
          Array.isArray(organizersJson.data)
            ? organizersJson.data
            : [{ value: "", label: "Sin relacionar" }]
        );
        setAcademyOptions(
          Array.isArray(academiesJson.data)
            ? academiesJson.data
            : [{ value: "", label: "Sin relacionar" }]
        );
        setTeacherOptions(Array.isArray(teachersJson.data) ? teachersJson.data : []);
      } catch {
        if (cancelled) return;
        setOrganizerOptions([{ value: "", label: "Sin relacionar" }]);
        setAcademyOptions([{ value: "", label: "Sin relacionar" }]);
        setTeacherOptions([]);
      }
    }

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  function set(key: string, value: unknown) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function updatePriceText(nextValue: string, currencyOverride?: string) {
    const currency = String(currencyOverride ?? data.currency ?? "GTQ");
    setData((prev) => ({
      ...prev,
      price_text: nextValue,
      price_amount: (() => {
        const lowest = extractLowestPriceAmount(nextValue, currency);
        return lowest === null ? "" : String(lowest);
      })()
    }));
  }

  function applyAiSuggestions(fields: Record<string, unknown>) {
    const normalized = { ...fields };

    if (normalized.starts_at) {
      const startsAt = parseDateTimeLocal(String(normalized.starts_at));
      normalized.starts_at_date = startsAt.date;
      normalized.starts_at_time = startsAt.time;
    }

    if (normalized.ends_at) {
      const endsAt = parseDateTimeLocal(String(normalized.ends_at));
      normalized.ends_at_date = endsAt.date;
      normalized.ends_at_time = endsAt.time;
    }

    const nextCurrency = String(normalized.currency ?? data.currency ?? "GTQ");
    if (typeof normalized.price_text === "string") {
      const lowest = extractLowestPriceAmount(normalized.price_text, nextCurrency);
      normalized.price_amount = lowest === null ? "" : String(lowest);
    }

    setData((prev) => ({ ...prev, ...normalized }));
    setTab("form");
  }

  async function save(forceTranslate = false) {
    setSaving(true);
    setSaveError("");
    try {
      const startsAtDate = String(data.starts_at_date ?? "").trim();
      const startsAtTime = String(data.starts_at_time ?? "").trim();
      if (!startsAtDate) {
        throw new Error("La fecha de inicio es obligatoria.");
      }

      const endsAtDate = String(data.ends_at_date ?? "").trim();
      const endsAtTime = String(data.ends_at_time ?? "").trim();
      if (endsAtDate && new Date(endsAtDate) < new Date(startsAtDate)) {
        throw new Error("La fecha final no puede ser anterior a la fecha inicial.");
      }

      const payload: EventData = {
        ...data,
        starts_at: `${startsAtDate}T${startsAtTime || "20:00"}:00-06:00`,
        ends_at: endsAtDate
          ? `${endsAtDate}T${endsAtTime || startsAtTime || "20:00"}:00-06:00`
          : null,
        gallery_urls: Array.isArray(data.gallery_urls)
          ? [...new Set(
              data.gallery_urls
                .map((entry) => String(entry ?? "").trim())
                .filter((entry) => Boolean(entry) && entry !== String(data.cover_image_url ?? "").trim())
            )]
          : [],
        teacher_ids: Array.isArray(data.teacher_ids)
          ? [...new Set(data.teacher_ids.map((entry) => String(entry ?? "").trim()).filter(Boolean))]
          : [],
        price_amount: data.price_amount === "" ? null : Number(data.price_amount)
      };

      delete payload.id;
      delete payload.created_at;
      delete payload.event_teachers;
      delete payload.starts_at_date;
      delete payload.starts_at_time;
      delete payload.ends_at_date;
      delete payload.ends_at_time;

      if (forceTranslate) payload.force_auto_translate = true;

      const url = isCreating ? "/api/admin/events" : `/api/admin/events/${String(item?.id)}`;
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
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  const currentDataForAi = Object.fromEntries(
    Object.entries(data).filter(([key]) =>
      !["id", "created_at", "starts_at_date", "starts_at_time", "ends_at_date", "ends_at_time", "event_teachers"].includes(key)
    )
  );

  const panelContent = (
    <div className="mobile-drawer-form flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">
            {isCreating ? "Nuevo evento" : String(data.title_es || "Evento")}
          </p>
          <p className="text-xs text-gray-400">
            {isCreating
              ? "Usa la IA para generar el borrador o rellena el formulario"
              : "Editar información del evento"}
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

      <div className="mobile-drawer-scroll flex-1 overflow-y-auto overscroll-contain">
        {tab === "ai" ? (
          <div className="p-4">
            <p className="mb-4 text-xs leading-5 text-gray-500">
              Sube flyers, carruseles o captions. La IA combina todas las piezas y propone fechas,
              precios, venue y contacto en un solo borrador.
            </p>
            <EntityAiPanel
              entity="event"
              mode={isCreating ? "create" : "update"}
              currentData={currentDataForAi}
              fieldLabels={AI_FIELD_LABELS}
              onApply={applyAiSuggestions}
            />
          </div>
        ) : (
          <div className="space-y-3 p-4">
            <SectionHeading>Imágenes</SectionHeading>
            <ImageField
              label="Flyer principal"
              value={String(data.cover_image_url ?? "")}
              onChange={(url) => set("cover_image_url", url)}
            />
            <div className="space-y-1">
              <FieldLabel label="Galería" hint="Fotos o flyers adicionales" />
              <ImageListField
                value={Array.isArray(data.gallery_urls) ? (data.gallery_urls as string[]) : []}
                onChange={(urls) => set("gallery_urls", urls)}
              />
            </div>

            <SectionHeading>Información</SectionHeading>
            <div className="space-y-1">
              <FieldLabel label="Título" />
              <Input
                value={String(data.title_es ?? "")}
                onChange={(e) => set("title_es", e.target.value)}
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
            <div className="space-y-1">
              <FieldLabel label="Estilo" />
              <select
                value={String(data.dance_style ?? "salsa_bachata")}
                onChange={(e) => set("dance_style", e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {DANCE_STYLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <SectionHeading>Fecha y lugar</SectionHeading>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <FieldLabel label="Fecha de inicio" />
                <Input
                  type="date"
                  value={String(data.starts_at_date ?? "")}
                  onChange={(e) => set("starts_at_date", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <FieldLabel label="Hora de inicio" />
                <Input
                  type="time"
                  value={String(data.starts_at_time ?? "")}
                  onChange={(e) => set("starts_at_time", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <FieldLabel label="Fecha final" hint="opcional" />
                <Input
                  type="date"
                  value={String(data.ends_at_date ?? "")}
                  onChange={(e) => set("ends_at_date", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <FieldLabel label="Hora final" hint="opcional" />
                <Input
                  type="time"
                  value={String(data.ends_at_time ?? "")}
                  onChange={(e) => set("ends_at_time", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <FieldLabel label="Lugar" />
              <Input
                value={String(data.venue_name ?? "")}
                onChange={(e) => set("venue_name", e.target.value)}
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

            <SectionHeading>Precios</SectionHeading>
            <div className="space-y-1">
              <FieldLabel label="Precios" hint="usa · para separar opciones" />
              <Textarea
                rows={3}
                value={String(data.price_text ?? "")}
                onChange={(e) => updatePriceText(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <FieldLabel label="Precio mínimo" hint="se autocompleta si detecta montos" />
                <Input
                  type="number"
                  min="0"
                  value={String(data.price_amount ?? "")}
                  onChange={(e) => set("price_amount", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <FieldLabel label="Moneda" />
                <select
                  value={String(data.currency ?? "GTQ")}
                  onChange={(e) => {
                    const nextCurrency = e.target.value;
                    set("currency", nextCurrency);
                    updatePriceText(String(data.price_text ?? ""), nextCurrency);
                  }}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {CURRENCY_OPTIONS.map((option) => (
                    <option key={option.value || "none"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <SectionHeading>Contacto y relaciones</SectionHeading>
            <div className="space-y-1">
              <FieldLabel label="Organizador visible" />
              <Input
                value={String(data.organizer_name ?? "")}
                onChange={(e) => set("organizer_name", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <FieldLabel label="Link de contacto" />
              <Input
                value={String(data.contact_url ?? "")}
                onChange={(e) => set("contact_url", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <FieldLabel label="Organizador relacionado" />
                <select
                  value={String(data.organizer_id ?? "")}
                  onChange={(e) => set("organizer_id", e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {organizerOptions.map((option) => (
                    <option key={option.value || "none"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <FieldLabel label="Academia relacionada" />
                <select
                  value={String(data.academy_id ?? "")}
                  onChange={(e) => set("academy_id", e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {academyOptions.map((option) => (
                    <option key={option.value || "none"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <FieldLabel label="Maestros relacionados" />
              <SearchableMultiSelectField
                value={Array.isArray(data.teacher_ids) ? (data.teacher_ids as string[]) : []}
                options={teacherOptions}
                onChange={(next) => set("teacher_ids", next)}
                placeholder="Buscar maestros"
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
      <Drawer.Root open onOpenChange={(open) => { if (!open) onClose(); }} shouldScaleBackground handleOnly>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/50" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-2xl bg-white shadow-2xl outline-none">
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
        aria-label={isCreating ? "Nuevo evento" : String(data.title_es || "Editar evento")}
        className="fixed inset-y-0 right-0 z-50 flex w-[520px] max-w-[100vw] flex-col bg-white shadow-2xl [animation:slide-in-from-right_0.3s_ease-out_both]"
      >
        {panelContent}
      </div>
    </>
  );
}
