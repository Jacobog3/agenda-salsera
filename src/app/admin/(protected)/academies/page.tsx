"use client";

import { useState } from "react";
import { AdminEntityList } from "@/components/admin/admin-entity-list";
import { AcademyEditSheet } from "@/components/admin/academy-edit-sheet";

const ACADEMY_COLUMNS = [
  { key: "name", label: "Nombre" },
  { key: "city", label: "Ciudad" },
  { key: "is_published", label: "Estado", format: (v: unknown) => (v ? "✓" : "✗") }
];

export default function AdminAcademiesPage() {
  const [listKey, setListKey] = useState(0);
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null | "new">(null);

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
        title="Gestión de Academias"
        apiBase="/api/admin/academies"
        createLabel="Nueva academia"
        fields={[]}
        displayColumns={ACADEMY_COLUMNS}
        imageKey="cover_image_url"
        onCreateOverride={openCreate}
        onEditOverride={openEdit}
        disableInlineCreate
      />

      {editingItem !== null && (
        <AcademyEditSheet
          item={editingItem === "new" ? null : editingItem}
          onClose={closeSheet}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
