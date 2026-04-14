"use client";

import { useState } from "react";
import { AdminEntityList } from "@/components/admin/admin-entity-list";
import { TeacherEditSheet } from "@/components/admin/teacher-edit-sheet";

const TEACHER_COLUMNS = [
  { key: "name", label: "Nombre" },
  { key: "city", label: "Ciudad" },
  { key: "is_published", label: "Estado", format: (v: unknown) => v ? "✓" : "✗" }
];

export default function AdminTeachersPage() {
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
        title="Gestión de Maestros"
        apiBase="/api/admin/teachers"
        createLabel="Nuevo maestro"
        fields={[]}
        displayColumns={TEACHER_COLUMNS}
        imageKey="profile_image_url"
        onCreateOverride={openCreate}
        onEditOverride={openEdit}
        disableInlineCreate
      />

      {editingItem !== null && (
        <TeacherEditSheet
          item={editingItem === "new" ? null : editingItem}
          onClose={closeSheet}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
