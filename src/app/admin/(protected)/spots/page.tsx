"use client";

import { AdminEntityList } from "@/components/admin/admin-entity-list";
import type { FieldDef } from "@/components/admin/admin-entity-list";

const SPOT_FIELDS: FieldDef[] = [
  { key: "cover_image_url", label: "Imagen", type: "image", group: "Imagen" },
  { key: "name_es", label: "Nombre (ES)", group: "Información" },
  { key: "name_en", label: "Nombre (EN)", group: "Información" },
  { key: "city", label: "Ciudad", group: "Información" },
  { key: "address", label: "Dirección", group: "Información" },
  { key: "schedule", label: "Horarios", group: "Detalles" },
  { key: "cover_charge", label: "Cover", group: "Detalles" },
  { key: "whatsapp_url", label: "WhatsApp URL", group: "Contacto" },
  { key: "instagram_url", label: "Instagram URL", group: "Contacto" },
  { key: "description_es", label: "Descripción (ES)", type: "textarea", group: "Descripción" },
  { key: "description_en", label: "Descripción (EN)", type: "textarea", group: "Descripción" },
  { key: "is_published", label: "Publicado", type: "checkbox", group: "Estado" }
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
      imageKey="cover_image_url"
    />
  );
}
