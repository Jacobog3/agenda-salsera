"use client";

import { useEffect, useState } from "react";
import { AdminEntityList } from "@/components/admin/admin-entity-list";
import { EventEditSheet } from "@/components/admin/event-edit-sheet";
import { isEventExpired } from "@/lib/utils/event-status";

const EVENT_COLUMNS = [
  { key: "title_es", label: "Título" },
  { key: "starts_at", label: "Fecha", format: (_: unknown, item?: Record<string, unknown>) => {
    if (item?.date_status === "coming_soon" || !item?.starts_at) {
      return String(item?.date_label ?? "Próximamente");
    }
    const startsAt = String(item?.starts_at ?? "");
    const endsAt = String(item?.ends_at ?? "");
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
            startsAt: item.starts_at ? String(item.starts_at) : null,
            endsAt: item.ends_at ? String(item.ends_at) : null,
            dateStatus: item.date_status === "coming_soon" ? "coming_soon" : "confirmed"
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
