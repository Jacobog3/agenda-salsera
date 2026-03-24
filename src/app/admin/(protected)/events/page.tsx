"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminEntityList } from "@/components/admin/admin-entity-list";
import { AdminEventForm } from "@/components/admin/admin-event-form";
import { isEventExpired } from "@/lib/utils/event-status";
import type { FieldDef } from "@/components/admin/admin-entity-list";

const EVENT_FIELDS: FieldDef[] = [
  { key: "cover_image_url", label: "Flyer / Imagen", type: "image", group: "Imagen" },
  { key: "gallery_urls", label: "Galería", hint: "Fotos adicionales del evento", type: "image-list", group: "Imagen" },
  { key: "title_es", label: "Título", hint: "Se traduce automáticamente al inglés", group: "Información" },
  { key: "dance_style", label: "Estilo", type: "select", group: "Información", options: [
    { value: "salsa", label: "Salsa" },
    { value: "bachata", label: "Bachata" },
    { value: "salsa_bachata", label: "Salsa y Bachata" },
    { value: "other", label: "Otro" }
  ]},
  { key: "starts_at", label: "Fecha y hora", type: "datetime", group: "Fecha y lugar" },
  { key: "ends_at", label: "Fecha final", hint: "Opcional para bootcamps o eventos largos", type: "datetime", group: "Fecha y lugar" },
  { key: "venue_name", label: "Lugar", group: "Fecha y lugar" },
  { key: "city", label: "Ciudad", group: "Fecha y lugar" },
  { key: "address", label: "Dirección", group: "Fecha y lugar" },
  { key: "price_text", label: "Precios", hint: "Separar con · o - (ej: Preventa Q80 · Puerta Q120)", type: "textarea", group: "Precios" },
  { key: "currency", label: "Moneda principal", type: "select", group: "Precios", options: [
    { value: "GTQ", label: "GTQ (Quetzales)" },
    { value: "USD", label: "USD (Dólares)" },
    { value: "", label: "No aplica / Gratis" }
  ]},
  { key: "organizer_name", label: "Organizador visible", hint: "Texto tal como aparece en el flyer", group: "Contacto" },
  { key: "organizer_id", label: "Organizador relacionado", type: "select", group: "Relaciones", optionsEndpoint: "/api/admin/organizers?format=options", options: [{ value: "", label: "Sin relacionar" }] },
  { key: "academy_id", label: "Academia relacionada", type: "select", group: "Relaciones", optionsEndpoint: "/api/admin/academies?format=options", options: [{ value: "", label: "Sin relacionar" }] },
  { key: "teacher_ids", label: "Maestros relacionados", hint: "Opcional, puedes marcar uno o varios", type: "multiselect", group: "Relaciones", optionsEndpoint: "/api/admin/teachers?format=options" },
  { key: "contact_url", label: "Link de contacto (WhatsApp, Instagram, web)", group: "Contacto" },
  { key: "description_es", label: "Descripción", hint: "Se traduce automáticamente al inglés", type: "textarea", group: "Descripción" },
  { key: "is_featured", label: "Destacado", type: "checkbox", group: "Estado" },
  { key: "is_published", label: "Publicado", type: "checkbox", group: "Estado" }
];

const EVENT_COLUMNS = [
  { key: "title_es", label: "Título" },
  { key: "starts_at", label: "Fecha", format: (_: unknown, item?: Record<string, unknown>) => {
    const startsAt = String(item?.starts_at ?? "");
    const endsAt = String(item?.ends_at ?? "");
    if (!startsAt) return "";
    const startText = new Date(startsAt).toLocaleDateString("es-GT", { day: "numeric", month: "short" });
    if (!endsAt || new Date(endsAt).toDateString() === new Date(startsAt).toDateString()) {
      return startText;
    }
    const endText = new Date(endsAt).toLocaleDateString("es-GT", { day: "numeric", month: "short" });
    return `${startText} - ${endText}`;
  }},
  { key: "price_text", label: "Precio", format: (v: unknown) => {
    const s = String(v ?? "");
    return s.length > 30 ? s.slice(0, 30) + "…" : s || "—";
  }},
  { key: "city", label: "Ciudad" }
];

export default function AdminEventsPage() {
  const searchParams = useSearchParams();
  const createRequested = searchParams.get("create") === "1";

  return (
    <div className="space-y-6">
      {createRequested ? (
        <section
          id="event-create"
          className="space-y-4 rounded-2xl border border-black/[0.04] bg-white p-5 shadow-soft md:rounded-3xl md:p-8"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight text-foreground md:text-xl">
                Crear evento
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Usa un solo formulario para flyer, IA, relaciones y publicación.
              </p>
            </div>
            <ButtonLink href="/admin/events">Cerrar creación</ButtonLink>
          </div>
          <AdminEventForm />
        </section>
      ) : null}

      <AdminEntityList
        title="Gestión de Eventos"
        apiBase="/api/admin/events"
        createLabel="Nuevo evento"
        createHref="/admin/events?create=1#event-create"
        disableInlineCreate
        fields={EVENT_FIELDS}
        displayColumns={EVENT_COLUMNS}
        imageKey="cover_image_url"
        dateKey="starts_at"
        statusResolver={(item) =>
          isEventExpired({
            startsAt: String(item.starts_at ?? ""),
            endsAt: item.ends_at ? String(item.ends_at) : null
          })
            ? "expired"
            : "active"
        }
        autoTranslateFields={[
          { sourceKey: "title_es", targetKey: "title_en" },
          { sourceKey: "description_es", targetKey: "description_en" }
        ]}
      />
    </div>
  );
}

function ButtonLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center justify-center rounded-md border border-input px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {children}
    </Link>
  );
}
