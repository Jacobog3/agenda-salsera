"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminEntityList } from "@/components/admin/admin-entity-list";
import { SpotEditSheet } from "@/components/admin/spot-edit-sheet";

const SPOT_COLUMNS = [
  { key: "name", label: "Nombre" },
  { key: "city", label: "Ciudad" },
  { key: "country_code", label: "País" },
  { key: "is_published", label: "Estado", format: (v: unknown) => v ? "✓" : "✗" }
];

export default function AdminSpotsPage() {
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
    if (candidateId && !savedCandidateRef.current) router.replace("/admin/spots");
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
        title="Gestión de Bares y Spots"
        apiBase="/api/admin/spots"
        createLabel="Nuevo bar o spot"
        fields={[]}
        displayColumns={SPOT_COLUMNS}
        imageKey="cover_image_url"
        onCreateOverride={openCreate}
        onEditOverride={openEdit}
        disableInlineCreate
      />

      {editingItem !== null && (
        <SpotEditSheet
          item={editingItem === "new" ? null : editingItem}
          initialData={editingItem === "new" ? candidatePrefill : undefined}
          onClose={closeSheet}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
