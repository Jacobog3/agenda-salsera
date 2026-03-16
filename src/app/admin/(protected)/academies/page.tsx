import { AdminEntityList } from "@/components/admin/admin-entity-list";

const ACADEMY_FIELDS = [
  { key: "name", label: "Nombre" },
  { key: "description_es", label: "Descripción (ES)", type: "textarea" as const },
  { key: "description_en", label: "Descripción (EN)", type: "textarea" as const },
  { key: "cover_image_url", label: "Logo URL" },
  { key: "banner_image_url", label: "Banner URL" },
  { key: "city", label: "Ciudad" },
  { key: "address", label: "Dirección" },
  { key: "schedule_text", label: "Horarios (texto)" },
  { key: "levels", label: "Niveles" },
  { key: "modality", label: "Modalidad", type: "select" as const, options: [
    { value: "presencial", label: "Presencial" },
    { value: "online", label: "Online" },
    { value: "mixto", label: "Mixto" }
  ]},
  { key: "trial_class", label: "Clase de prueba", type: "checkbox" as const },
  { key: "whatsapp_url", label: "WhatsApp URL" },
  { key: "instagram_url", label: "Instagram URL" },
  { key: "website_url", label: "Sitio web" },
  { key: "is_published", label: "Publicado", type: "checkbox" as const }
];

const ACADEMY_COLUMNS = [
  { key: "name", label: "Nombre" },
  { key: "city", label: "Ciudad" },
  { key: "is_published", label: "Estado", format: (v: unknown) => v ? "✓" : "✗" }
];

export default function AdminAcademiesPage() {
  return (
    <AdminEntityList
      title="Gestión de Academias"
      apiBase="/api/admin/academies"
      fields={ACADEMY_FIELDS}
      displayColumns={ACADEMY_COLUMNS}
    />
  );
}
