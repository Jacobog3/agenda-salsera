"use client";

import { AdminEntityList } from "@/components/admin/admin-entity-list";
import type { FieldDef } from "@/components/admin/admin-entity-list";

const ACADEMY_FIELDS: FieldDef[] = [
  { key: "cover_image_url", label: "Logo", type: "image", group: "Imagen" },
  { key: "banner_image_url", label: "Banner", type: "image", group: "Imagen" },
  { key: "name", label: "Nombre", group: "Información" },
  { key: "city", label: "Ciudad", group: "Información" },
  { key: "address", label: "Dirección", group: "Información" },
  { key: "style_tags", label: "Estilos y subestilos", hint: "Lo que realmente enseña la academia; separados por coma o salto de línea", type: "textarea", group: "Clases" },
  { key: "schedule_text", label: "Horarios (resumen)", hint: "Resumen corto para búsqueda y sidebar", type: "textarea", group: "Clases" },
  { key: "levels", label: "Niveles", group: "Clases" },
  { key: "modality", label: "Modalidad", type: "select", group: "Clases", options: [
    { value: "presencial", label: "Presencial" },
    { value: "online", label: "Online" },
    { value: "mixto", label: "Mixto" }
  ]},
  { key: "trial_class", label: "Clase de prueba", type: "checkbox", group: "Clases" },
  { key: "whatsapp_url", label: "WhatsApp URL", group: "Contacto" },
  { key: "instagram_url", label: "Instagram URL", group: "Contacto" },
  { key: "facebook_url", label: "Facebook URL", group: "Contacto" },
  { key: "website_url", label: "Sitio web", group: "Contacto" },
  { key: "description_es", label: "Descripción", hint: "Se traduce automáticamente al inglés", type: "textarea", group: "Descripción" },
  { key: "is_published", label: "Publicado", type: "checkbox", group: "Estado" }
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
      createLabel="Nueva academia"
      fields={ACADEMY_FIELDS}
      displayColumns={ACADEMY_COLUMNS}
      imageKey="cover_image_url"
      autoTranslateFields={[
        { sourceKey: "description_es", targetKey: "description_en" }
      ]}
      aiAssist={{
        entity: "academy",
        title: "Actualizar academia con IA",
        description: "Usa una imagen de horarios, flyer o caption nuevo para proponer mejoras sobre lo que ya existe, incluyendo horarios estructurados y estilos detallados.",
        buttonLabel: "Actualizar con IA",
        persistKeys: ["schedule_data"],
        fieldLabels: {
          schedule_data: "Horario estructurado"
        }
      }}
    />
  );
}
