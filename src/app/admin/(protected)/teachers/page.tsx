"use client";

import { AdminEntityList } from "@/components/admin/admin-entity-list";
import type { FieldDef } from "@/components/admin/admin-entity-list";

const TEACHER_FIELDS: FieldDef[] = [
  { key: "profile_image_url", label: "Foto", type: "image", group: "Imagen" },
  { key: "banner_image_url", label: "Banner", type: "image", group: "Imagen" },
  { key: "name", label: "Nombre", group: "Información" },
  { key: "slug", label: "Slug", group: "Información" },
  { key: "city", label: "Ciudad", group: "Información" },
  { key: "area", label: "Zona", group: "Información" },
  { key: "address", label: "Dirección", group: "Información" },
  { key: "styles_taught", label: "Estilos", hint: "salsa, bachata, salsa_bachata", type: "textarea", group: "Clases" },
  { key: "levels", label: "Niveles", group: "Clases" },
  {
    key: "modality",
    label: "Modalidad",
    type: "select",
    group: "Clases",
    options: [
      { value: "presencial", label: "Presencial" },
      { value: "online", label: "Online" },
      { value: "mixto", label: "Mixto" }
    ]
  },
  { key: "class_formats", label: "Formatos", hint: "Separar por coma o salto de linea", type: "textarea", group: "Clases" },
  { key: "teaching_venues", label: "Dónde da clases", hint: "Separar por coma o salto de linea", type: "textarea", group: "Clases" },
  { key: "teaching_zones", label: "Zonas", hint: "Separar por coma o salto de linea", type: "textarea", group: "Clases" },
  { key: "schedule_text", label: "Horarios (texto)", type: "textarea", group: "Clases" },
  { key: "trial_class", label: "Clase de prueba", type: "checkbox", group: "Clases" },
  { key: "price_text", label: "Precio", group: "Clases" },
  { key: "booking_url", label: "Link para agendar", group: "Contacto" },
  { key: "whatsapp_url", label: "WhatsApp URL", group: "Contacto" },
  { key: "instagram_url", label: "Instagram URL", group: "Contacto" },
  { key: "facebook_url", label: "Facebook URL", group: "Contacto" },
  { key: "website_url", label: "Sitio web", group: "Contacto" },
  { key: "bio_es", label: "Bio", hint: "Se traduce automáticamente al inglés", type: "textarea", group: "Bio" },
  { key: "is_featured", label: "Destacado", type: "checkbox", group: "Estado" },
  { key: "is_published", label: "Publicado", type: "checkbox", group: "Estado" }
];

const TEACHER_COLUMNS = [
  { key: "name", label: "Nombre" },
  { key: "city", label: "Ciudad" },
  { key: "is_published", label: "Estado", format: (v: unknown) => v ? "✓" : "✗" }
];

export default function AdminTeachersPage() {
  return (
    <AdminEntityList
      title="Gestión de Maestros"
      apiBase="/api/admin/teachers"
      createLabel="Nuevo maestro"
      fields={TEACHER_FIELDS}
      displayColumns={TEACHER_COLUMNS}
      imageKey="profile_image_url"
      autoTranslateFields={[
        { sourceKey: "bio_es", targetKey: "bio_en" }
      ]}
    />
  );
}
