"use client";

import { useState } from "react";
import { AdminEntityList } from "@/components/admin/admin-entity-list";
import { ResourceSubmissionsInbox } from "@/components/admin/resource-submissions-inbox";
import { DEFAULT_SITE_COUNTRY, SITE_COUNTRIES } from "@/lib/site-countries";

const FIELDS = [
  { key: "name", label: "Nombre" },
  { key: "resource_kind", label: "Tipo", type: "select" as const, options: [
    { value: "business", label: "Negocio" },
    { value: "professional", label: "Profesional" }
  ] },
  { key: "categories", label: "Categorías", type: "multiselect" as const, options: [
    { value: "dancewear", label: "Zapatos y ropa" },
    { value: "dj", label: "DJs" },
    { value: "photography", label: "Fotografía y video" },
    { value: "other", label: "Otro recurso" }
  ] },
  { key: "description_es", label: "Descripción en español", type: "textarea" as const },
  { key: "description_en", label: "Descripción en inglés", type: "textarea" as const },
  { key: "image_url", label: "Imagen", type: "image" as const },
  { key: "city", label: "Ciudad" },
  {
    key: "country_code",
    label: "País",
    type: "select" as const,
    defaultValue: DEFAULT_SITE_COUNTRY.code,
    options: SITE_COUNTRIES.map((country) => ({ value: country.code, label: country.name.es }))
  },
  { key: "instagram_url", label: "Instagram URL" },
  { key: "whatsapp_url", label: "WhatsApp URL" },
  { key: "website_url", label: "Sitio web" },
  { key: "source_url", label: "Fuente" },
  { key: "source_label", label: "Etiqueta de fuente" },
  { key: "verification_status", label: "Verificación", type: "select" as const, options: [
    { value: "unverified", label: "Pendiente" },
    { value: "source_confirmed", label: "Fuente confirmada" },
    { value: "owner_confirmed", label: "Responsable confirmado" }
  ] },
  { key: "sort_order", label: "Orden" },
  { key: "is_featured", label: "Destacado", type: "checkbox" as const },
  { key: "is_published", label: "Publicado", type: "checkbox" as const }
];

const COLUMNS = [
  { key: "name", label: "Nombre" },
  { key: "categories", label: "Categorías", format: (value: unknown) => Array.isArray(value) ? value.join(", ") : String(value ?? "") },
  { key: "verification_status", label: "Verificación" },
  { key: "is_published", label: "Estado", format: (value: unknown) => value ? "Publicado" : "Borrador" }
];

export default function AdminResourcesPage() {
  const [listKey, setListKey] = useState(0);
  const [editRequest, setEditRequest] = useState<{
    resourceId: string;
    submissionId: string;
    context: { name: string; type: "update" | "report"; description: string; links: string[] };
  } | null>(null);
  const [inboxKey, setInboxKey] = useState(0);

  function requestResourceEdit(
    resourceId: string,
    submissionId: string,
    context: { name: string; type: "update" | "report"; description: string; links: string[] }
  ) {
    setEditRequest({ resourceId, submissionId, context });
    window.requestAnimationFrame(() => {
      document.getElementById("admin-resource-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function finishRequestedEdit(itemId: string) {
    if (!editRequest || editRequest.resourceId !== itemId) return;
    const response = await fetch(`/api/admin/resource-submissions/${editRequest.submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resolve", resourceId: itemId })
    });
    if (!response.ok) {
      throw new Error("El recurso se guardó, pero no se pudo cerrar la solicitud. Intenta guardar nuevamente.");
    }
    setEditRequest(null);
    setInboxKey((key) => key + 1);
  }

  return (
    <>
      <ResourceSubmissionsInbox
        key={inboxKey}
        onDraftCreated={() => setListKey((key) => key + 1)}
        onEditRequested={requestResourceEdit}
      />
      <div id="admin-resource-list" className="scroll-mt-24">
        {editRequest ? (
          <div className="mb-4 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-950">
            <p className="font-semibold">
              {editRequest.context.type === "report" ? "Revisando reporte" : "Revisando actualización"}: {editRequest.context.name}
            </p>
            <p className="mt-2 whitespace-pre-wrap leading-6 text-brand-900/80">{editRequest.context.description}</p>
            {editRequest.context.links.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
                {editRequest.context.links.map((link) => (
                  <a key={link} href={link} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                    Ver evidencia
                  </a>
                ))}
              </div>
            ) : null}
            <p className="mt-2 text-xs text-brand-800">La solicitud se marcará resuelta únicamente después de guardar el recurso.</p>
          </div>
        ) : null}
        <AdminEntityList
          key={listKey}
          title="Recursos de la comunidad"
          apiBase="/api/admin/resources"
          createLabel="Nuevo recurso"
          fields={FIELDS}
          displayColumns={COLUMNS}
          imageKey="image_url"
          uploadFolder="resources"
          autoTranslateFields={[{ sourceKey: "description_es", targetKey: "description_en" }]}
          requestedEditId={editRequest?.resourceId}
          onSaved={finishRequestedEdit}
          onEditCancelled={() => setEditRequest(null)}
        />
      </div>
    </>
  );
}
