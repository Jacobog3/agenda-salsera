"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Pencil,
  Trash2,
  Save,
  X,
  ChevronDown,
  AlertTriangle,
  ImagePlus,
  Calendar,
  Clock,
  Plus,
  Languages
} from "lucide-react";

export type FieldDef = {
  key: string;
  label: string;
  hint?: string;
  type?: "text" | "textarea" | "date" | "time" | "datetime" | "select" | "checkbox" | "image" | "image-list";
  options?: { value: string; label: string }[];
  group?: string;
};

type DisplayColumn = {
  key: string;
  label: string;
  format?: (v: unknown, item: Record<string, unknown>) => string;
};

type EntityListProps = {
  title: string;
  apiBase: string;
  fields: FieldDef[];
  displayColumns: DisplayColumn[];
  imageKey?: string;
  dateKey?: string;
  autoTranslateFields?: { sourceKey: string; targetKey: string }[];
};

function parseDateTimeLocal(isoString: string): { date: string; time: string } {
  if (!isoString) return { date: "", time: "" };
  const d = new Date(isoString);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return { date, time };
}

function getDateEditKey(fieldKey: string) {
  return `_edit_${fieldKey}_date`;
}

function getTimeEditKey(fieldKey: string) {
  return `_edit_${fieldKey}_time`;
}

async function uploadAdminImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Upload failed");
  }

  return String(data.url);
}

function ImageUploadField({
  value,
  onChange
}: {
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
      const url = await uploadAdminImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative w-full overflow-hidden rounded-lg border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="max-h-40 w-full object-contain bg-gray-50" />
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
          className="h-9 gap-1 shrink-0"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
          {uploading ? "..." : "Subir"}
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function ImageListUploadField({
  value,
  onChange
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const urls = Array.isArray(value) ? value.map((entry) => String(entry ?? "")) : [];

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
    onChange(urls.map((url, i) => (i === index ? nextUrl : url)));
  }

  function removeAt(index: number) {
    onChange(urls.filter((_, i) => i !== index));
  }

  function addEmpty() {
    onChange([...urls, ""]);
  }

  return (
    <div className="space-y-3">
      {urls.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-xs text-gray-500">
          No hay fotos extra en la galeria.
        </div>
      ) : (
        <div className="space-y-3">
          {urls.map((url, index) => (
            <div key={`${index}-${url}`} className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-start gap-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={`Galeria ${index + 1}`} className="h-full w-full object-cover" />
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
                  <div className="flex gap-2">
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
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={addEmpty} className="h-8 gap-1 text-xs">
          <Plus className="h-3.5 w-3.5" />
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

      {error && <p className="text-xs text-red-600">{error}</p>}
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

export function AdminEntityList({
  title,
  apiBase,
  fields,
  displayColumns,
  imageKey,
  dateKey,
  autoTranslateFields = []
}: EntityListProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [tab, setTab] = useState<"active" | "expired">("active");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiBase);
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function startEdit(item: Record<string, unknown>) {
    const data = { ...item };
    for (const field of fields) {
      if (field.type === "datetime" && data[field.key]) {
        const { date, time } = parseDateTimeLocal(String(data[field.key]));
        data[getDateEditKey(field.key)] = date;
        data[getTimeEditKey(field.key)] = time;
      }
    }
    setEditingId(item.id as string);
    setEditData(data);
    setSaveError("");
    setDeleteConfirm(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData({});
    setSaveError("");
  }

  async function saveEdit(forceAutoTranslate = false) {
    if (!editingId) return;
    setSaving(true);
    setSaveError("");
    try {
      const payload = Object.fromEntries(
        fields.map((field) => [field.key, editData[field.key]])
      ) as Record<string, unknown>;
      if (forceAutoTranslate && autoTranslateFields.length > 0) {
        payload.force_auto_translate = true;
      }
      const coverImageUrl = String(payload.cover_image_url ?? "").trim();
      for (const field of fields) {
        if (field.type === "image-list") {
          const rawValue = payload[field.key];
          payload[field.key] = Array.isArray(rawValue)
            ? [...new Set(
                rawValue
                  .map((entry) => String(entry ?? "").trim())
                  .filter((entry) => Boolean(entry) && entry !== coverImageUrl)
              )]
            : [];
        } else if (field.type === "datetime") {
          const dateValue = payload[getDateEditKey(field.key)];
          const timeValue = payload[getTimeEditKey(field.key)];
          if (dateValue) {
            const d = String(dateValue);
            const t = String(timeValue || "20:00");
            payload[field.key] = `${d}T${t}:00-06:00`;
          } else {
            payload[field.key] = null;
          }
        }
      }

      for (const field of fields) {
        if (field.type === "datetime") {
          delete payload[getDateEditKey(field.key)];
          delete payload[getTimeEditKey(field.key)];
        }
      }
      delete payload.id;
      delete payload.created_at;

      const res = await fetch(`${apiBase}/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setItems((prev) => prev.map((it) => (it.id === editingId ? { ...it, ...payload } : it)));
        cancelEdit();
      } else {
        const json = await res.json().catch(() => ({}));
        setSaveError(String(json.error || "No se pudo guardar los cambios."));
      }
    } catch {
      setSaveError("No se pudo guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`${apiBase}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((it) => it.id !== id));
        setDeleteConfirm(null);
        if (editingId === id) cancelEdit();
      }
    } finally {
      setDeleting(false);
    }
  }

  const now = new Date();
  const hasDateSplit = !!dateKey;
  const activeItems = hasDateSplit
    ? items.filter((it) => new Date(String(it[dateKey!])) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    : items;
  const expiredItems = hasDateSplit
    ? items.filter((it) => new Date(String(it[dateKey!])) < new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    : [];
  const visibleItems = hasDateSplit ? (tab === "active" ? activeItems : expiredItems) : items;

  const groups = Array.from(new Set(fields.map((f) => f.group ?? "General")));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-gray-900 md:text-2xl">{title}</h1>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
          {items.length} total
        </span>
      </div>

      {hasDateSplit && (
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setTab("active")}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${tab === "active" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Vigentes ({activeItems.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("expired")}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${tab === "expired" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Expirados ({expiredItems.length})
          </button>
        </div>
      )}

      {visibleItems.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">
          {hasDateSplit ? (tab === "active" ? "No hay eventos vigentes" : "No hay eventos expirados") : "No hay registros"}
        </p>
      ) : (
        <div className="space-y-2">
          {visibleItems.map((item) => {
            const id = item.id as string;
            const isEditing = editingId === id;
            const isDeleting = deleteConfirm === id;
            const thumbUrl = imageKey ? String(item[imageKey] ?? "") : "";

            return (
              <div
                key={id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex items-center gap-3 px-3 py-2.5 md:px-4 md:py-3">
                  {thumbUrl && (
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100 md:h-12 md:w-12">
                      <Image src={thumbUrl} alt="" fill className="object-cover" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm">
                      {displayColumns.map((col, i) => (
                        <span key={col.key} className={i === 0 ? "font-semibold text-gray-900" : "text-gray-500 text-xs"}>
                          {col.format ? col.format(item[col.key], item) : String(item[col.key] ?? "")}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => isEditing ? cancelEdit() : startEdit(item)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    >
                      {isEditing ? <ChevronDown className="h-4 w-4 rotate-180" /> : <Pencil className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(isDeleting ? null : id)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isDeleting && (
                  <div className="flex items-center gap-3 border-t border-red-100 bg-red-50 px-4 py-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                    <p className="flex-1 text-xs font-medium text-red-700">
                      ¿Eliminar permanentemente?
                    </p>
                    <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)} className="h-7 text-xs">
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => deleteItem(id)}
                      disabled={deleting}
                      className="h-7 gap-1 bg-red-600 text-xs hover:bg-red-700"
                    >
                      {deleting && <Loader2 className="h-3 w-3 animate-spin" />}
                      Eliminar
                    </Button>
                  </div>
                )}

                {isEditing && (
                  <div className="space-y-4 border-t border-gray-100 px-4 py-4">
                    {groups.map((group) => {
                      const groupFields = fields.filter((f) => (f.group ?? "General") === group);
                      if (!groupFields.length) return null;
                      return (
                        <div key={group} className={`space-y-2 ${group === "Precios" ? "rounded-lg border border-amber-200 bg-amber-50/50 p-3" : ""}`}>
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${group === "Precios" ? "text-amber-700" : "text-brand-600"}`}>{group}</p>
                          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                            {groupFields.map((field) => {
                              const span =
                                field.type === "textarea" || field.type === "image" || field.type === "image-list"
                                  ? "sm:col-span-2 md:col-span-3"
                                  : "";

                              return (
                                <div key={field.key} className={`space-y-1 ${span}`}>
                                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                    {field.label}
                                    {field.hint && (
                                      <span className="ml-1 font-normal normal-case tracking-normal text-gray-400/70">
                                        — {field.hint}
                                      </span>
                                    )}
                                  </label>

                                  {field.type === "image" ? (
                                    <ImageUploadField
                                      value={String(editData[field.key] ?? "")}
                                      onChange={(url) => setEditData((p) => ({ ...p, [field.key]: url }))}
                                    />
                                  ) : field.type === "image-list" ? (
                                    <ImageListUploadField
                                      value={Array.isArray(editData[field.key]) ? (editData[field.key] as string[]) : []}
                                      onChange={(urls) => setEditData((p) => ({ ...p, [field.key]: urls }))}
                                    />
                                  ) : field.type === "textarea" ? (
                                    <Textarea
                                      rows={3}
                                      value={String(editData[field.key] ?? "")}
                                      onChange={(e) => setEditData((p) => ({ ...p, [field.key]: e.target.value }))}
                                      className="text-sm"
                                    />
                                  ) : field.type === "datetime" ? (
                                    <div className="flex gap-2">
                                      <div className="flex-1">
                                        <div className="relative">
                                          <Calendar className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                                          <Input
                                            type="date"
                                            value={String(editData[getDateEditKey(field.key)] ?? "")}
                                            onChange={(e) => setEditData((p) => ({ ...p, [getDateEditKey(field.key)]: e.target.value }))}
                                            className="h-9 pl-8 text-sm"
                                          />
                                        </div>
                                      </div>
                                      <div className="w-32">
                                        <div className="relative">
                                          <Clock className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                                          <Input
                                            type="time"
                                            value={String(editData[getTimeEditKey(field.key)] ?? "")}
                                            onChange={(e) => setEditData((p) => ({ ...p, [getTimeEditKey(field.key)]: e.target.value }))}
                                            className="h-9 pl-8 text-sm"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ) : field.type === "select" ? (
                                    <select
                                      value={String(editData[field.key] ?? "")}
                                      onChange={(e) => setEditData((p) => ({ ...p, [field.key]: e.target.value }))}
                                      className="flex h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm"
                                    >
                                      {field.options?.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                      ))}
                                    </select>
                                  ) : field.type === "checkbox" ? (
                                    <input
                                      type="checkbox"
                                      checked={Boolean(editData[field.key])}
                                      onChange={(e) => setEditData((p) => ({ ...p, [field.key]: e.target.checked }))}
                                      className="h-4 w-4 rounded border-gray-300 accent-brand-600"
                                    />
                                  ) : (
                                    <Input
                                      type={field.type ?? "text"}
                                      value={String(editData[field.key] ?? "")}
                                      onChange={(e) => setEditData((p) => ({ ...p, [field.key]: e.target.value }))}
                                      className="h-9 text-sm"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    <div className="border-t border-gray-100 pt-3">
                      {saveError ? (
                        <p className="mb-3 text-xs font-medium text-red-600">{saveError}</p>
                      ) : null}
                      <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(false)} disabled={saving} className="gap-1.5">
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Guardar
                      </Button>
                      {autoTranslateFields.length > 0 ? (
                        <Button size="sm" variant="outline" onClick={() => saveEdit(true)} disabled={saving} className="gap-1.5">
                          <Languages className="h-3.5 w-3.5" />
                          Regenerar inglés
                        </Button>
                      ) : null}
                      <Button size="sm" variant="outline" onClick={cancelEdit} className="gap-1.5">
                        <X className="h-3.5 w-3.5" />
                        Cancelar
                      </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
