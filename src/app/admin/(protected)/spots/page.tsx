"use client";

import { AdminEntityList } from "@/components/admin/admin-entity-list";
import type { FieldDef } from "@/components/admin/admin-entity-list";

const SPOT_FIELDS: FieldDef[] = [
  { key: "cover_image_url", label: "Imagen", type: "image", group: "Imagen" },
  { key: "name", label: "Nombre", group: "Información" },
  { key: "city", label: "Ciudad", group: "Información" },
  { key: "area", label: "Zona", group: "Información" },
  { key: "address", label: "Dirección", group: "Información" },
  { key: "schedule_es", label: "Horarios", hint: "Se traduce automáticamente al inglés", group: "Detalles" },
  { key: "cover_charge_es", label: "Cover", hint: "Se traduce automáticamente al inglés", group: "Detalles" },
  { key: "whatsapp_url", label: "WhatsApp URL", group: "Contacto" },
  { key: "instagram_url", label: "Instagram URL", group: "Contacto" },
  { key: "google_maps_url", label: "Google Maps URL", group: "Contacto" },
  { key: "description_es", label: "Descripción", hint: "Se traduce automáticamente al inglés", type: "textarea", group: "Descripción" },
  { key: "is_featured", label: "Destacado", type: "checkbox", group: "Estado" },
  { key: "is_published", label: "Publicado", type: "checkbox", group: "Estado" }
];

const SPOT_COLUMNS = [
  { key: "name", label: "Nombre" },
  { key: "city", label: "Ciudad" },
  { key: "is_published", label: "Estado", format: (v: unknown) => v ? "✓" : "✗" }
];

export default function AdminSpotsPage() {
  return (
    <AdminEntityList
      title="Gestión de Bares y Spots"
      apiBase="/api/admin/spots"
      createLabel="Nuevo bar o spot"
      fields={SPOT_FIELDS}
      displayColumns={SPOT_COLUMNS}
      imageKey="cover_image_url"
      autoTranslateFields={[
        { sourceKey: "description_es", targetKey: "description_en" },
        { sourceKey: "schedule_es", targetKey: "schedule_en" },
        { sourceKey: "cover_charge_es", targetKey: "cover_charge_en" }
      ]}
    />
  );
}
