"use client";

import { useEffect, useState } from "react";
import { Check, Link2, Loader2, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type EntityCandidate = {
  id: string;
  entity_type: string;
  display_name: string;
  roles: string[] | null;
  origin_city: string | null;
  origin_country_code: string | null;
  suggested_match_id: string | null;
  suggested_match_name: string | null;
  match_confidence: number | null;
};

type EntityMatch = {
  id: string;
  name: string;
  city: string;
  countryCode: string;
  confidence: number;
  matchedAlias: string | null;
};

const CREATE_ENDPOINTS: Record<string, string> = {
  professional: "/api/admin/teachers",
  academy: "/api/admin/academies",
  organizer: "/api/admin/organizers",
  spot: "/api/admin/spots"
};

const TYPE_LABELS: Record<string, { singular: string; another: string; newDraft: string }> = {
  professional: { singular: "artista", another: "otro artista", newDraft: "Nuevo artista" },
  academy: { singular: "academia", another: "otra academia", newDraft: "Nueva academia" },
  organizer: { singular: "organizador", another: "otro organizador", newDraft: "Nuevo organizador" },
  spot: { singular: "lugar", another: "otro lugar", newDraft: "Nuevo lugar" },
  festival: { singular: "festival", another: "otro festival", newDraft: "Nuevo festival" }
};

function buildQuickCreatePayload(candidate: EntityCandidate, name: string, city: string, countryCode: string) {
  const base = {
    candidate_id: candidate.id,
    name: name.trim(),
    city: city.trim(),
    country_code: countryCode.trim().toUpperCase(),
    is_published: false
  };

  if (candidate.entity_type === "professional") {
    return {
      ...base,
      professional_roles: candidate.roles?.length ? candidate.roles : ["other"]
    };
  }
  if (candidate.entity_type === "academy") {
    return { ...base, cover_image_url: "" };
  }
  if (candidate.entity_type === "spot") {
    return {
      ...base,
      cover_image_url: "",
      description_es: "",
      description_en: "",
      schedule_es: "",
      schedule_en: ""
    };
  }
  return base;
}

export function EntityCandidateResolver({
  candidate,
  disabled,
  onResolved
}: {
  candidate: EntityCandidate;
  disabled?: boolean;
  onResolved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(candidate.display_name);
  const [matches, setMatches] = useState<EntityMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState(candidate.display_name);
  const [city, setCity] = useState(candidate.origin_city ?? "");
  const [countryCode, setCountryCode] = useState(candidate.origin_country_code ?? "GT");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setMatches([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ type: candidate.entity_type, q: query.trim() });
      if (candidate.origin_city) params.set("city", candidate.origin_city);
      if (candidate.origin_country_code) params.set("country", candidate.origin_country_code);
      try {
        const response = await fetch(`/api/admin/entity-matches?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(String(payload.error || "No se pudo buscar."));
        setMatches(Array.isArray(payload.data) ? payload.data : []);
      } catch (searchError) {
        if (controller.signal.aborted) return;
        setError(searchError instanceof Error ? searchError.message : "No se pudo buscar.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [candidate.entity_type, candidate.origin_city, candidate.origin_country_code, open, query]);

  async function link(entityId: string) {
    setWorking(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/submission-mentions/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "matched", resolvedEntityId: entityId })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(payload.error || "No se pudo vincular."));
      onResolved();
    } catch (linkError) {
      setError(linkError instanceof Error ? linkError.message : "No se pudo vincular.");
    } finally {
      setWorking(false);
    }
  }

  async function createDraft() {
    const endpoint = CREATE_ENDPOINTS[candidate.entity_type];
    if (!endpoint || !name.trim() || !city.trim() || countryCode.trim().length !== 2) return;
    setWorking(true);
    setError("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildQuickCreatePayload(candidate, name, city, countryCode))
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(payload.error || "No se pudo crear el perfil."));
      if (!payload.candidateLinked) {
        throw new Error("El borrador se creó, pero no pudo vincularse al candidato.");
      }
      onResolved();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "No se pudo crear el perfil.");
    } finally {
      setWorking(false);
    }
  }

  if (!open) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 text-xs"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <Search className="mr-1.5 h-3.5 w-3.5" />
        Buscar o crear perfil
      </Button>
    );
  }

  const createLabels = TYPE_LABELS[candidate.entity_type] ?? {
    singular: "perfil",
    another: "otro perfil",
    newDraft: "Nuevo perfil"
  };
  const canCreate = Boolean(CREATE_ENDPOINTS[candidate.entity_type]);

  return (
    <div className="w-full space-y-3 rounded-xl border border-brand-100 bg-brand-50/40 p-3">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre o alias"
            className="h-9 bg-white pl-8 text-sm"
            autoFocus
          />
        </div>
        <Button type="button" size="sm" variant="ghost" className="h-9 w-9 p-0" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Buscando perfiles…
        </p>
      ) : null}

      {!loading && matches.length === 0 ? (
        <p className="text-xs text-muted-foreground">No se encontraron perfiles similares.</p>
      ) : null}

      {matches.map((match) => (
        <div key={match.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white p-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{match.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {[match.city, match.countryCode].filter(Boolean).join(" · ") || "Sin ubicación"}
              {match.matchedAlias ? ` · alias: ${match.matchedAlias}` : ""}
              {` · ${Math.round(match.confidence * 100)}%`}
            </p>
          </div>
          {candidate.entity_type !== "festival" ? (
            <Button type="button" size="sm" className="h-8 shrink-0 text-xs" disabled={working} onClick={() => link(match.id)}>
              {working ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Link2 className="mr-1.5 h-3.5 w-3.5" />}
              Vincular
            </Button>
          ) : null}
        </div>
      ))}

      {canCreate && !showCreate && !loading ? (
        <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          {matches.length > 0
            ? `Crear ${createLabels.another} de todas formas`
            : `Crear ${createLabels.singular} como borrador`}
        </Button>
      ) : null}

      {showCreate ? (
        <div className="space-y-2 rounded-lg border border-border bg-white p-3">
          <p className="text-xs font-semibold">{createLabels.newDraft} sin publicar</p>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre" className="h-9 text-sm" />
          <div className="grid grid-cols-[1fr_5rem] gap-2">
            <Input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Ciudad" className="h-9 text-sm" />
            <Input value={countryCode} onChange={(event) => setCountryCode(event.target.value.toUpperCase().slice(0, 2))} placeholder="GT" className="h-9 text-sm uppercase" />
          </div>
          <p className="text-[11px] leading-4 text-muted-foreground">
            Se crea un perfil mínimo no publicado y se vincula ahora.
            {matches.length > 0 ? " Confirma que ninguna coincidencia anterior es la misma entidad." : ""}
          </p>
          <div className="flex gap-2">
            <Button type="button" size="sm" className="h-8 text-xs" disabled={working || !name.trim() || !city.trim() || countryCode.length !== 2} onClick={createDraft}>
              {working ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
              Crear y vincular
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-8 text-xs" disabled={working} onClick={() => setShowCreate(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : null}

      {!canCreate ? (
        <p className="text-xs text-muted-foreground">
          Los festivales necesitan seleccionar una edición concreta; no se vincularán automáticamente a una serie.
        </p>
      ) : null}

      {error ? <p className="rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
