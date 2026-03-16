import { AdminEntityList } from "@/components/admin/admin-entity-list";

const SPOT_FIELDS = [
  { key: "name_es", label: "Nombre (ES)" },
  { key: "name_en", label: "Nombre (EN)" },
  { key: "description_es", label: "Descripción (ES)", type: "textarea" as const },
  { key: "description_en", label: "Descripción (EN)", type: "textarea" as const },
  { key: "cover_image_url", label: "Imagen URL" },
  { key: "city", label: "Ciudad" },
  { key: "address", label: "Dirección" },
  { key: "schedule", label: "Horarios" },
  { key: "cover_charge", label: "Cover" },
  { key: "whatsapp_url", label: "WhatsApp URL" },
  { key: "instagram_url", label: "Instagram URL" },
  { key: "is_published", label: "Publicado", type: "checkbox" as const }
];

const SPOT_COLUMNS = [
  { key: "name_es", label: "Nombre" },
  { key: "city", label: "Ciudad" },
  { key: "is_published", label: "Estado", format: (v: unknown) => v ? "✓" : "✗" }
];

export default function AdminSpotsPage() {
  return (
    <AdminEntityList
      title="Gestión de Bares y Spots"
      apiBase="/api/admin/spots"
      fields={SPOT_FIELDS}
      displayColumns={SPOT_COLUMNS}
    />
  );
}
