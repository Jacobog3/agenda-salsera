"use client";

import { useState } from "react";
import { AlertTriangle, Check, Link2, Loader2, Sparkles, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { ReviewPriority, SubmissionType } from "@/lib/submissions/analysis";

type ReviewMention = {
  id: string;
  entity_type: string;
  display_name: string;
  roles: string[] | null;
  affiliation: string | null;
  evidence: string | null;
  resolution_status: "pending" | "matched" | "candidate" | "ignored";
  suggestedMatch?: {
    id: string;
    name: string;
    city: string;
    countryCode: string;
    confidence: number;
  } | null;
};

const ENTITY_LABELS: Record<string, string> = {
  professional: "Profesional",
  academy: "Academia",
  organizer: "Organizador",
  spot: "Lugar",
  festival: "Festival / congreso"
};

export function SubmissionReviewBadge({ priority }: { priority?: ReviewPriority | null }) {
  if (!priority || priority === "normal") return null;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
      priority === "required"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-700"
    )}>
      <AlertTriangle className="h-3 w-3" />
      {priority === "required" ? "Revisión necesaria" : "Relaciones detectadas"}
    </span>
  );
}

export function SubmissionAiReview({
  submissionType,
  submissionId,
  initialPriority
}: {
  submissionType: SubmissionType;
  submissionId: string;
  initialPriority?: ReviewPriority | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mentions, setMentions] = useState<ReviewMention[] | null>(null);
  const [updatingId, setUpdatingId] = useState("");

  async function analyze(force = false) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/submission-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionType, submissionId, force })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(payload.error || "No se pudo analizar."));
      setMentions(payload.mentions ?? []);
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "No se pudo analizar.");
    } finally {
      setLoading(false);
    }
  }

  async function resolve(mention: ReviewMention, status: "matched" | "candidate" | "ignored") {
    setUpdatingId(mention.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/submission-mentions/${mention.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          resolvedEntityId: status === "matched" ? mention.suggestedMatch?.id : undefined
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(payload.error || "No se pudo guardar la decisión."));
      setMentions((current) => current?.map((item) => (
        item.id === mention.id ? { ...item, resolution_status: status } : item
      )) ?? []);
    } catch (resolutionError) {
      setError(resolutionError instanceof Error ? resolutionError.message : "No se pudo guardar.");
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <details className="rounded-xl border border-amber-200 bg-amber-50/50 p-3" open={initialPriority === "required"}>
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-950">
              <Sparkles className="h-4 w-4 text-amber-600" />
              Revisión de relaciones
            </p>
            <p className="mt-0.5 text-xs text-amber-800/80">
              Busca artistas, academias, organizadores y posibles coincidencias.
            </p>
          </div>
          <SubmissionReviewBadge priority={initialPriority} />
        </div>
      </summary>

      <div className="mt-3 space-y-3 border-t border-amber-200 pt-3">
        <Button type="button" variant="outline" size="sm" onClick={() => analyze(false)} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {mentions === null ? "Analizar con IA" : "Actualizar análisis"}
        </Button>

        {error ? <p className="rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</p> : null}
        {mentions?.length === 0 ? (
          <p className="text-xs text-muted-foreground">No se detectaron relaciones adicionales.</p>
        ) : null}

        {mentions?.map((mention) => {
          const resolved = mention.resolution_status !== "pending";
          return (
            <div key={mention.id} className="rounded-xl border border-amber-100 bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{mention.display_name}</p>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {ENTITY_LABELS[mention.entity_type] ?? mention.entity_type}
                    {mention.roles?.length ? ` · ${mention.roles.join(", ")}` : ""}
                  </p>
                </div>
                {resolved ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-700">
                    <Check className="h-3 w-3" /> {mention.resolution_status}
                  </span>
                ) : null}
              </div>
              {mention.affiliation ? <p className="mt-1 text-xs text-gray-600">Afiliación: {mention.affiliation}</p> : null}
              {mention.evidence ? <p className="mt-1 text-xs text-gray-500">{mention.evidence}</p> : null}
              {mention.suggestedMatch ? (
                <div className="mt-2 rounded-lg bg-brand-50 p-2 text-xs text-brand-900">
                  Coincidencia: <strong>{mention.suggestedMatch.name}</strong>
                  {mention.suggestedMatch.city ? ` · ${mention.suggestedMatch.city}` : ""}
                  <span className="ml-1 text-brand-700">({Math.round(mention.suggestedMatch.confidence * 100)}%)</span>
                </div>
              ) : null}
              {!resolved ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {mention.suggestedMatch ? (
                    <Button type="button" size="sm" className="h-8 text-xs" disabled={updatingId === mention.id} onClick={() => resolve(mention, "matched")}>
                      <Link2 className="mr-1.5 h-3.5 w-3.5" /> Vincular
                    </Button>
                  ) : null}
                  <Button type="button" variant="outline" size="sm" className="h-8 text-xs" disabled={updatingId === mention.id} onClick={() => resolve(mention, "candidate")}>
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Conservar candidato
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" disabled={updatingId === mention.id} onClick={() => resolve(mention, "ignored")}>
                    <X className="mr-1.5 h-3.5 w-3.5" /> Ignorar
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </details>
  );
}
