"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminEntityList } from "@/components/admin/admin-entity-list";
import { AcademyEditSheet } from "@/components/admin/academy-edit-sheet";

const ACADEMY_COLUMNS = [
  { key: "name", label: "Nombre" },
  { key: "city", label: "Ciudad" },
  { key: "country_code", label: "País" },
  { key: "is_published", label: "Estado", format: (v: unknown) => (v ? "✓" : "✗") }
];

export default function AdminAcademiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const candidateId = searchParams.get("candidate") ?? "";
  const savedCandidateRef = useRef(false);
  const [listKey, setListKey] = useState(0);
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null | "new">(null);

  useEffect(() => {
    if (searchParams.get("create") === "1") setEditingItem("new");
  }, [searchParams]);

  function openCreate() {
    setEditingItem("new");
  }

  function openEdit(item: Record<string, unknown>) {
    setEditingItem(item);
  }

  function closeSheet() {
    setEditingItem(null);
    if (candidateId && !savedCandidateRef.current) router.replace("/admin/academies");
  }

  function handleSaved() {
    if (candidateId) {
      savedCandidateRef.current = true;
      router.push("/admin/submissions");
      return;
    }
    setListKey((k) => k + 1);
  }

  const candidatePrefill = candidateId ? {
    candidate_id: candidateId,
    name: searchParams.get("name") ?? "",
    city: searchParams.get("city") ?? "",
    country_code: searchParams.get("country") ?? ""
  } : undefined;

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
          initialData={editingItem === "new" ? candidatePrefill : undefined}
          onClose={closeSheet}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
