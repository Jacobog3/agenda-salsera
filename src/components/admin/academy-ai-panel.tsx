"use client";

import { useRef, useState } from "react";
import { Check, ImagePlus, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { AiUpdateEntity, AiWorkflowMode } from "@/lib/admin/ai-update";

type ImageEntry = { dataUrl: string; name: string };

type SuggestionEntry = {
  key: string;
  label: string;
  value: unknown;
  accepted: boolean;
};

type Props = {
  entity: AiUpdateEntity;
  mode: AiWorkflowMode;
  currentData: Record<string, unknown>;
  fieldLabels: Record<string, string>;
  onApply: (fields: Record<string, unknown>) => void;
};

function formatPreview(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Vacío";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (Array.isArray(value)) {
    if (value.length === 0) return "Vacío";
    if (typeof value[0] === "object" && value[0] !== null && "day" in value[0]) {
      return (value as { day: string; classes: { time: string; name: string }[] }[])
        .map((d) => `${d.day}: ${d.classes.map((c) => `${c.time} ${c.name}`).join(", ")}`)
        .join("\n");
    }
    return (value as unknown[]).map((v) => String(v)).join(", ");
  }
  return String(value);
}

export function AcademyAiPanel({ entity, mode, currentData, fieldLabels, onApply }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionEntry[] | null>(null);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const toProcess = files;

    Promise.all(
      toProcess.map(
        (file) =>
          new Promise<ImageEntry>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ dataUrl: String(reader.result), name: file.name });
            reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
            reader.readAsDataURL(file);
          })
      )
    )
      .then((entries) => {
        setImages((prev) => [...prev, ...entries]);
        setError("");
      })
      .catch(() => setError("No se pudo leer una o más imágenes."));

    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function analyze() {
    if (images.length === 0 && text.trim().length < 10) return;

    setLoading(true);
    setError("");
    setNotice("");
    setSuggestions(null);

    try {
      const res = await fetch("/api/admin/ai-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity,
          mode,
          currentData,
          text,
          imageDataUrls: images.map((img) => img.dataUrl)
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(String(data.error ?? "No se pudo analizar."));

      const suggestion =
        data.data && typeof data.data === "object"
          ? (data.data as Record<string, unknown>)
          : {};

      if (Object.keys(suggestion).length === 0) {
        setNotice("La IA no encontró información nueva para agregar.");
        return;
      }

      setSuggestions(
        Object.entries(suggestion).map(([key, value]) => ({
          key,
          label: fieldLabels[key] ?? key,
          value,
          accepted: true
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo analizar el material.");
    } finally {
      setLoading(false);
    }
  }

  function toggleSuggestion(key: string) {
    setSuggestions(
      (prev) => prev?.map((s) => (s.key === key ? { ...s, accepted: !s.accepted } : s)) ?? null
    );
  }

  function applySelected() {
    if (!suggestions) return;
    const accepted = Object.fromEntries(
      suggestions.filter((s) => s.accepted).map((s) => [s.key, s.value])
    );
    onApply(accepted);
    setSuggestions(null);
    setImages([]);
    setText("");
    setNotice("Sugerencias aplicadas. Revisa los campos y guarda.");
  }

  const canAnalyze = (images.length > 0 || text.trim().length >= 10) && !loading;
  const acceptedCount = suggestions?.filter((s) => s.accepted).length ?? 0;

  return (
    <div className="space-y-4">
      {/* Image grid */}
      <div>
        <div className={`grid gap-2 ${images.length > 0 ? "grid-cols-2" : "grid-cols-1"}`}>
          {images.map((img, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.dataUrl} alt={img.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-0.5 text-white transition hover:bg-black/80"
                aria-label="Quitar imagen"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/40 text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50 ${
              images.length === 0 ? "py-10" : "aspect-square"
            }`}
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-xs font-medium">
              {images.length === 0 ? "Subir posts" : "+"}
            </span>
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />

        {images.length > 0 && (
          <p className="mt-1.5 text-xs text-gray-400">
            {images.length} post{images.length !== 1 ? "s" : ""} · La IA unifica la información de todos
          </p>
        )}
      </div>

      {/* Caption text */}
      <Textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Caption, mensaje de WhatsApp o contexto adicional (opcional)"
        className="resize-none text-sm"
      />

      {/* Analyze button */}
      <Button type="button" onClick={analyze} disabled={!canAnalyze} className="w-full gap-2">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analizando...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            {images.length > 1
              ? `Analizar ${images.length} posts juntos`
              : "Analizar material"}
          </>
        )}
      </Button>

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      {notice && <p className="text-xs font-medium text-brand-700">{notice}</p>}

      {/* Per-field suggestion toggles */}
      {suggestions && suggestions.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-brand-100 bg-brand-50/40 p-3">
          <p className="text-sm font-semibold text-gray-900">
            {suggestions.length} campo{suggestions.length !== 1 ? "s" : ""} encontrado
            {suggestions.length !== 1 ? "s" : ""}
          </p>

          <div className="space-y-2">
            {suggestions.map((s) => (
              <div
                key={s.key}
                onClick={() => toggleSuggestion(s.key)}
                className={`cursor-pointer rounded-xl border p-3 transition-all ${
                  s.accepted
                    ? "border-brand-200 bg-white"
                    : "border-gray-200 bg-gray-50 opacity-50"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      s.accepted ? "border-brand-600 bg-brand-600" : "border-gray-300"
                    }`}
                  >
                    {s.accepted && <Check className="h-2.5 w-2.5 text-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      {s.label}
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-snug text-gray-900">
                      {formatPreview(s.value)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            onClick={applySelected}
            disabled={acceptedCount === 0}
            className="w-full gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Aplicar {acceptedCount} campo{acceptedCount !== 1 ? "s" : ""}
          </Button>
        </div>
      )}
    </div>
  );
}
