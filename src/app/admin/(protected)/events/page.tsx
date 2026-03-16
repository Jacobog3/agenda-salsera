import { AdminEntityList } from "@/components/admin/admin-entity-list";

const EVENT_FIELDS = [
  { key: "title_es", label: "Título (ES)" },
  { key: "title_en", label: "Título (EN)" },
  { key: "description_es", label: "Descripción (ES)", type: "textarea" as const },
  { key: "description_en", label: "Descripción (EN)", type: "textarea" as const },
  { key: "cover_image_url", label: "Imagen URL" },
  { key: "dance_style", label: "Estilo", type: "select" as const, options: [
    { value: "salsa", label: "Salsa" },
    { value: "bachata", label: "Bachata" },
    { value: "salsa_bachata", label: "Salsa y Bachata" },
    { value: "other", label: "Otro" }
  ]},
  { key: "starts_at", label: "Fecha inicio" },
  { key: "venue_name", label: "Lugar" },
  { key: "city", label: "Ciudad" },
  { key: "address", label: "Dirección" },
  { key: "price_text", label: "Precios" },
  { key: "currency", label: "Moneda" },
  { key: "organizer_name", label: "Organizador" },
  { key: "contact_url", label: "Contacto" },
  { key: "is_featured", label: "Destacado", type: "checkbox" as const },
  { key: "is_published", label: "Publicado", type: "checkbox" as const }
];

const EVENT_COLUMNS = [
  { key: "title_es", label: "Título" },
  { key: "city", label: "Ciudad" },
  { key: "starts_at", label: "Fecha", format: (v: unknown) => {
    if (!v) return "";
    return new Date(String(v)).toLocaleDateString("es-GT", { day: "numeric", month: "short", year: "numeric" });
  }},
  { key: "is_published", label: "Estado", format: (v: unknown) => v ? "✓" : "✗" }
];

export default function AdminEventsPage() {
  return (
    <AdminEntityList
      title="Gestión de Eventos"
      apiBase="/api/admin/events"
      fields={EVENT_FIELDS}
      displayColumns={EVENT_COLUMNS}
    />
  );
}
