"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, PackagePlus, Pencil, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Submission = {
  id: string;
  submission_type: "new" | "update" | "report";
  resource_id: string | null;
  name: string;
  categories: string[];
  description: string | null;
  city: string | null;
  country_code: string | null;
  instagram: string | null;
  whatsapp: string | null;
  website: string | null;
  submitter_relationship: string;
  contact_name: string | null;
  contact_email: string | null;
  status: string;
  created_at: string;
};

const TYPE_LABELS = {
  new: "Nuevo recurso",
  update: "Actualización",
  report: "Reporte"
} as const;

export function ResourceSubmissionsInbox({
  onDraftCreated,
  onEditRequested
}: {
  onDraftCreated: () => void;
  onEditRequested: (
    resourceId: string,
    submissionId: string,
    context: { name: string; type: "update" | "report"; description: string; links: string[] }
  ) => void;
}) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/resource-submissions");
      const data = await response.json();
      setSubmissions(data.data ?? []);
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function act(id: string, action: "create_draft" | "dismiss") {
    setWorkingId(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/resource-submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(result.error || "No se pudo procesar."));
      setSubmissions((current) => current.map((item) => item.id === id ? { ...item, status: action === "dismiss" ? "dismissed" : "draft_created" } : item));
      if (action === "create_draft") onDraftCreated();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo procesar.");
    } finally {
      setWorkingId("");
    }
  }

  const pending = submissions.filter((submission) => submission.status === "pending");

  return (
    <section className="mb-8 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Comunidad</p>
          <h2 className="mt-1 font-display text-xl font-bold text-gray-900">Sugerencias de recursos</h2>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{pending.length} pendientes</span>
      </div>

      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-brand-600" /></div>
      ) : pending.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-400">No hay sugerencias pendientes.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {pending.map((submission) => (
            <article key={submission.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-gray-900">{submission.name}</h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    <span className="font-semibold text-brand-700">{TYPE_LABELS[submission.submission_type]}</span>
                    {submission.categories.length > 0 ? ` · ${submission.categories.join(" · ")}` : ""}
                    {submission.submission_type === "new" ? ` · ${submission.submitter_relationship === "owner" ? "Responsable" : "Recomendación"}` : ""}
                  </p>
                </div>
                <span className="text-[10px] text-gray-400">{new Date(submission.created_at).toLocaleDateString("es-GT")}</span>
              </div>
              {submission.description ? <p className="mt-3 text-sm leading-5 text-gray-600">{submission.description}</p> : null}
              {submission.city || submission.country_code ? <p className="mt-2 text-xs text-gray-500">{[submission.city, submission.country_code].filter(Boolean).join(", ")}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {[submission.instagram, submission.whatsapp, submission.website].filter(Boolean).map((url) => (
                  <a key={url} href={url!} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-700 hover:underline">
                    {url!.replace(/^https?:\/\/(www\.)?/, "").slice(0, 32)} <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
              {submission.contact_name || submission.contact_email ? <p className="mt-3 text-[11px] text-gray-400">Contacto privado: {[submission.contact_name, submission.contact_email].filter(Boolean).join(" · ")}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {submission.submission_type === "new" ? (
                  <Button size="sm" onClick={() => act(submission.id, "create_draft")} disabled={workingId === submission.id} className="gap-1.5">
                    {workingId === submission.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PackagePlus className="h-3.5 w-3.5" />}
                    Crear borrador
                  </Button>
                ) : submission.resource_id ? (
                  <Button
                    size="sm"
                    onClick={() => onEditRequested(submission.resource_id!, submission.id, {
                      name: submission.name,
                      type: submission.submission_type as "update" | "report",
                      description: submission.description ?? "",
                      links: [submission.instagram, submission.whatsapp, submission.website].filter((value): value is string => Boolean(value))
                    })}
                    className="gap-1.5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Revisar y editar recurso
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" onClick={() => act(submission.id, "dismiss")} disabled={workingId === submission.id} className="gap-1.5">
                  <XCircle className="h-3.5 w-3.5" /> Descartar
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
      {submissions.some((submission) => submission.status === "draft_created") ? (
        <p className="flex items-center gap-1.5 text-xs text-salsaGreen-700"><CheckCircle2 className="h-3.5 w-3.5" /> Los borradores creados permanecen sin publicar hasta que los revises abajo.</p>
      ) : null}
    </section>
  );
}
