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
  Clock
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type FieldDef = {
  key: string;
  label: string;
  hint?: string;
  type?: "text" | "textarea" | "date" | "time" | "datetime" | "select" | "checkbox" | "image";
  options?: { value: string; label: string }[];
  group?: string;
};

type DisplayColumn = {
  key: string;
  label: string;
  format?: (v: unknown) => string;
};

type EntityListProps = {
  title: string;
  apiBase: string;
  fields: FieldDef[];
  displayColumns: DisplayColumn[];
  imageKey?: string;
  dateKey?: string;
};

function parseDateTimeLocal(isoString: string): { date: string; time: string } {
  if (!isoString) return { date: "", time: "" };
  const d = new Date(isoString);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return { date, time };
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

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const fileName = `admin/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("event-flyers")
        .upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("event-flyers").getPublicUrl(fileName);
      onChange(data.publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
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
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

export function AdminEntityList({
  title,
  apiBase,
  fields,
  displayColumns,
  imageKey,
  dateKey
}: EntityListProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
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
    if (dateKey && data[dateKey]) {
      const { date, time } = parseDateTimeLocal(String(data[dateKey]));
      data._edit_date = date;
      data._edit_time = time;
    }
    setEditingId(item.id as string);
    setEditData(data);
    setDeleteConfirm(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData({});
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    try {
      const payload = { ...editData };
      if (dateKey && payload._edit_date) {
        const d = String(payload._edit_date);
        const t = String(payload._edit_time || "20:00");
        payload[dateKey] = `${d}T${t}:00-06:00`;
      }
      delete payload._edit_date;
      delete payload._edit_time;
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
      }
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
                          {col.format ? col.format(item[col.key]) : String(item[col.key] ?? "")}
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
                                field.type === "textarea" || field.type === "image"
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
                                            value={String(editData._edit_date ?? "")}
                                            onChange={(e) => setEditData((p) => ({ ...p, _edit_date: e.target.value }))}
                                            className="h-9 pl-8 text-sm"
                                          />
                                        </div>
                                      </div>
                                      <div className="w-32">
                                        <div className="relative">
                                          <Clock className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                                          <Input
                                            type="time"
                                            value={String(editData._edit_time ?? "")}
                                            onChange={(e) => setEditData((p) => ({ ...p, _edit_time: e.target.value }))}
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

                    <div className="flex gap-2 border-t border-gray-100 pt-3">
                      <Button size="sm" onClick={saveEdit} disabled={saving} className="gap-1.5">
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Guardar
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit} className="gap-1.5">
                        <X className="h-3.5 w-3.5" />
                        Cancelar
                      </Button>
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
