"use client";

import { useEffect, useState } from "react";
import { AdminEntityList } from "@/components/admin/admin-entity-list";
import { EventEditSheet } from "@/components/admin/event-edit-sheet";
import { isEventExpired } from "@/lib/utils/event-status";

const EVENT_COLUMNS = [
  { key: "title_es", label: "Título" },
  { key: "starts_at", label: "Fecha", format: (_: unknown, item?: Record<string, unknown>) => {
    const startsAt = String(item?.starts_at ?? "");
    const endsAt = String(item?.ends_at ?? "");
    if (!startsAt) return "";
    const startText = new Date(startsAt).toLocaleDateString("es-GT", { day: "numeric", month: "short" });
    if (!endsAt || new Date(endsAt).toDateString() === new Date(startsAt).toDateString()) {
      return startText;
    }
    const endText = new Date(endsAt).toLocaleDateString("es-GT", { day: "numeric", month: "short" });
    return `${startText} - ${endText}`;
  }},
  { key: "price_text", label: "Precio", format: (v: unknown) => {
    const s = String(v ?? "");
    return s.length > 30 ? s.slice(0, 30) + "…" : s || "—";
  }},
  { key: "city", label: "Ciudad" }
];

export default function AdminEventsPage() {
  const [listKey, setListKey] = useState(0);
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null | "new">(null);

  useEffect(() => {
    if (window.location.search.includes("create=1")) {
      setEditingItem("new");
    }
  }, []);

  function openCreate() {
    setEditingItem("new");
  }

  function openEdit(item: Record<string, unknown>) {
    setEditingItem(item);
  }

  function closeSheet() {
    setEditingItem(null);
  }

  function handleSaved() {
    setListKey((k) => k + 1);
  }

  return (
    <>
      <AdminEntityList
        key={listKey}
        title="Gestión de Eventos"
        apiBase="/api/admin/events"
        createLabel="Nuevo evento"
        disableInlineCreate
        fields={[]}
        displayColumns={EVENT_COLUMNS}
        imageKey="cover_image_url"
        dateKey="starts_at"
        statusResolver={(item) =>
          isEventExpired({
            startsAt: String(item.starts_at ?? ""),
            endsAt: item.ends_at ? String(item.ends_at) : null
          })
            ? "expired"
            : "active"
        }
        onCreateOverride={openCreate}
        onEditOverride={openEdit}
      />

      {editingItem !== null && (
        <EventEditSheet
          item={editingItem === "new" ? null : editingItem}
          onClose={closeSheet}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
