"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Check, ExternalLink, Link2, Loader2, RefreshCw, UsersRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Candidate = {
  id: string;
  submission_type: "event" | "academy" | "teacher" | "spot";
  submission_id: string;
  entity_type: string;
  display_name: string;
  roles: string[] | null;
  affiliation: string | null;
  evidence: string | null;
  suggested_match_id: string | null;
  suggested_match_name: string | null;
  match_confidence: number | null;
  created_at: string;
};

type Incident = {
  id: string;
  incident_code: string;
  submission_type: string;
  step: string;
  error_message: string | null;
  route: string | null;
  created_at: string;
};

const ADMIN_ROUTES: Record<string, string> = {
  professional: "/admin/teachers",
  academy: "/admin/academies",
  spot: "/admin/spots",
  organizer: "/admin/events",
  festival: "/admin/events"
};

export function SubmissionOperationsInbox() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [candidateResponse, incidentResponse] = await Promise.all([
        fetch("/api/admin/submission-mentions?status=candidate", { cache: "no-store" }),
        fetch("/api/admin/submission-incidents", { cache: "no-store" })
      ]);
      const [candidatePayload, incidentPayload] = await Promise.all([
        candidateResponse.json().catch(() => ({})),
        incidentResponse.json().catch(() => ({}))
      ]);
      if (!candidateResponse.ok) throw new Error(String(candidatePayload.error || "No se pudieron cargar candidatos."));
      if (!incidentResponse.ok) throw new Error(String(incidentPayload.error || "No se pudieron cargar problemas."));
      setCandidates(candidatePayload.data ?? []);
      setIncidents(incidentPayload.data ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar la bandeja.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateCandidate(candidate: Candidate, status: "matched" | "ignored") {
    setWorkingId(candidate.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/submission-mentions/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          resolvedEntityId: status === "matched" ? candidate.suggested_match_id : undefined
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(payload.error || "No se pudo actualizar."));
      setCandidates((items) => items.filter((item) => item.id !== candidate.id));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "No se pudo actualizar.");
    } finally {
      setWorkingId("");
    }
  }

  async function reanalyze(candidate: Candidate) {
    setWorkingId(candidate.id);
    setError("");
    try {
      const response = await fetch("/api/admin/submission-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionType: candidate.submission_type,
          submissionId: candidate.submission_id,
          force: false
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(payload.error || "No se pudo revisar."));
      await load();
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "No se pudo revisar.");
    } finally {
      setWorkingId("");
    }
  }

  async function resolveIncident(incident: Incident) {
    setWorkingId(incident.id);
    try {
      const response = await fetch("/api/admin/submission-incidents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: incident.id, status: "resolved" })
      });
      if (!response.ok) throw new Error("No se pudo cerrar el reporte.");
      setIncidents((items) => items.filter((item) => item.id !== incident.id));
    } catch (incidentError) {
      setError(incidentError instanceof Error ? incidentError.message : "No se pudo cerrar el reporte.");
    } finally {
      setWorkingId("");
    }
  }

  return (
    <div className="mt-8 space-y-3 border-t border-border pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold">Seguimiento</h2>
          <p className="text-xs text-muted-foreground">Candidatos guardados y problemas reportados por los formularios.</p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="rounded-lg p-2 text-muted-foreground hover:bg-gray-100">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      {error ? <p className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p> : null}

      <details className="rounded-2xl border border-border bg-white p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm font-semibold"><UsersRound className="h-4 w-4 text-brand-600" /> Candidatos</span>
          <span className="rounded-full bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">{candidates.length}</span>
        </summary>
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          {candidates.length === 0 ? <p className="text-xs text-muted-foreground">No hay candidatos pendientes.</p> : null}
          {candidates.map((candidate) => (
            <div key={candidate.id} className="rounded-xl border border-border p-3">
              <p className="text-sm font-semibold">{candidate.display_name}</p>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{candidate.entity_type} · desde {candidate.submission_type}</p>
              {candidate.affiliation ? <p className="mt-1 text-xs text-gray-600">{candidate.affiliation}</p> : null}
              {candidate.evidence ? <p className="mt-1 text-xs text-gray-500">{candidate.evidence}</p> : null}
              {candidate.suggested_match_id ? (
                <p className="mt-2 rounded-lg bg-brand-50 p-2 text-xs text-brand-900">
                  Coincidencia actual: <strong>{candidate.suggested_match_name}</strong>
                  {candidate.match_confidence ? ` (${Math.round(candidate.match_confidence * 100)}%)` : ""}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-2">
                {candidate.suggested_match_id ? (
                  <Button size="sm" className="h-8 text-xs" disabled={workingId === candidate.id} onClick={() => updateCandidate(candidate, "matched")}>
                    <Link2 className="mr-1.5 h-3.5 w-3.5" /> Vincular
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="h-8 text-xs" disabled={workingId === candidate.id} onClick={() => reanalyze(candidate)}>
                    {workingId === candidate.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
                    Buscar de nuevo
                  </Button>
                )}
                <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                  <a href={ADMIN_ROUTES[candidate.entity_type] ?? "/admin"}>
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Abrir catálogo
                  </a>
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground" disabled={workingId === candidate.id} onClick={() => updateCandidate(candidate, "ignored")}>
                  <X className="mr-1.5 h-3.5 w-3.5" /> Ignorar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </details>

      <details className="rounded-2xl border border-border bg-white p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm font-semibold"><AlertCircle className="h-4 w-4 text-red-500" /> Problemas reportados</span>
          <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">{incidents.length}</span>
        </summary>
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          {incidents.length === 0 ? <p className="text-xs text-muted-foreground">No hay problemas abiertos.</p> : null}
          {incidents.map((incident) => (
            <div key={incident.id} className="rounded-xl border border-red-100 bg-red-50/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs font-semibold text-red-800">{incident.incident_code}</p>
                  <p className="mt-1 text-xs text-gray-700">{incident.error_message || "Sin detalle"}</p>
                  <p className="mt-1 text-[11px] text-gray-500">{incident.submission_type} · {incident.step} · {new Date(incident.created_at).toLocaleString("es-GT")}</p>
                </div>
                <Button size="sm" variant="outline" className="h-8 text-xs" disabled={workingId === incident.id} onClick={() => resolveIncident(incident)}>
                  <Check className="mr-1.5 h-3.5 w-3.5" /> Resolver
                </Button>
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
