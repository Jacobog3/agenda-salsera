"use client";

import { useCallback, useEffect, useState } from "react";
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
  AlertTriangle
} from "lucide-react";

type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "date" | "select" | "checkbox";
  options?: { value: string; label: string }[];
};

type EntityListProps = {
  title: string;
  apiBase: string;
  fields: FieldDef[];
  displayColumns: { key: string; label: string; format?: (v: unknown) => string }[];
};

export function AdminEntityList({ title, apiBase, fields, displayColumns }: EntityListProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    setEditingId(item.id as string);
    setEditData({ ...item });
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
      const res = await fetch(`${apiBase}/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData)
      });
      if (res.ok) {
        setItems((prev) => prev.map((it) => (it.id === editingId ? { ...it, ...editData } : it)));
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
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">No hay registros</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const id = item.id as string;
            const isEditing = editingId === id;
            const isDeleting = deleteConfirm === id;

            return (
              <div
                key={id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                {/* Collapsed row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      {displayColumns.map((col) => (
                        <span key={col.key} className="text-gray-600">
                          <span className="font-medium text-gray-900">
                            {col.format
                              ? col.format(item[col.key])
                              : String(item[col.key] ?? "")}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
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

                {/* Delete confirmation */}
                {isDeleting && (
                  <div className="flex items-center gap-3 border-t border-red-100 bg-red-50 px-4 py-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                    <p className="flex-1 text-xs font-medium text-red-700">
                      ¿Eliminar permanentemente?
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteConfirm(null)}
                      className="h-7 text-xs"
                    >
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

                {/* Edit form */}
                {isEditing && (
                  <div className="space-y-3 border-t border-gray-100 px-4 py-4">
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {fields.map((field) => (
                        <div key={field.key} className={`space-y-1 ${field.type === "textarea" ? "sm:col-span-2 md:col-span-3" : ""}`}>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            {field.label}
                          </label>
                          {field.type === "textarea" ? (
                            <Textarea
                              rows={3}
                              value={String(editData[field.key] ?? "")}
                              onChange={(e) => setEditData((p) => ({ ...p, [field.key]: e.target.value }))}
                              className="text-sm"
                            />
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
                      ))}
                    </div>
                    <div className="flex gap-2 pt-1">
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
