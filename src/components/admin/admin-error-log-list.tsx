"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Loader2, RefreshCw, TriangleAlert } from "lucide-react";
import {
  formatAdminErrorDiagnostic,
  readLocalAdminErrors,
  type AdminClientErrorLog
} from "@/lib/admin/client-error-log";

function mergeLogs(serverLogs: AdminClientErrorLog[], localLogs: AdminClientErrorLog[]) {
  const entries = new Map<string, AdminClientErrorLog>();
  for (const entry of localLogs) {
    entries.set(entry.client_id, { ...entry, source: "local" });
  }
  for (const entry of serverLogs) {
    entries.set(entry.client_id, { ...entry, source: "server" });
  }
  return [...entries.values()]
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .slice(0, 50);
}

export function AdminErrorLogList() {
  const [logs, setLogs] = useState<AdminClientErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [copyError, setCopyError] = useState("");

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    const localLogs = readLocalAdminErrors();

    try {
      const response = await fetch("/api/admin/client-errors", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(payload.error ?? `No se pudo consultar el registro (${response.status}).`));
      }
      const serverLogs = Array.isArray(payload.data) ? payload.data : [];
      setLogs(mergeLogs(serverLogs, localLogs));
    } catch (nextError) {
      setLogs(mergeLogs([], localLogs));
      setError(
        nextError instanceof Error
          ? `${nextError.message} Se muestran los errores guardados en este dispositivo.`
          : "No se pudo consultar el registro."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  async function copyLog(entry: AdminClientErrorLog) {
    try {
      await navigator.clipboard.writeText(formatAdminErrorDiagnostic(entry));
      setCopiedId(entry.client_id);
      setCopyError("");
    } catch {
      setCopyError("No se pudo copiar el diagnóstico en este dispositivo.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Errores del administrador
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Últimos errores de interfaz, sin contenido de formularios, contraseñas ni imágenes.
          </p>
        </div>
        <button
          type="button"
          onClick={loadLogs}
          disabled={loading}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      ) : null}

      {copyError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {copyError}
        </p>
      ) : null}

      {!loading && logs.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-soft">
          <Check className="mx-auto h-8 w-8 text-green-600" />
          <p className="mt-3 font-semibold text-gray-900">No hay errores registrados</p>
          <p className="mt-1 text-sm text-gray-500">Los próximos errores del admin aparecerán aquí automáticamente.</p>
        </div>
      ) : null}

      <div className="space-y-3">
        {logs.map((entry) => (
          <article key={entry.client_id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <TriangleAlert className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-semibold text-gray-950">{entry.message}</p>
                <p className="mt-1 break-all text-xs text-gray-500">{entry.route || "Ruta desconocida"}</p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400">
                  <span>{new Date(entry.created_at).toLocaleString("es-GT")}</span>
                  <span>{entry.release_sha ? entry.release_sha.slice(0, 7) : "versión local"}</span>
                  <span>{entry.source === "local" ? "solo en este dispositivo" : "sincronizado"}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyLog(entry)}
                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border border-gray-200 px-3 text-xs font-semibold text-gray-700"
              >
                {copiedId === entry.client_id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{copiedId === entry.client_id ? "Copiado" : "Copiar"}</span>
              </button>
            </div>

            {entry.stack ? (
              <details className="mt-3 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600">
                <summary className="cursor-pointer font-semibold">Ver stack técnico</summary>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-5">
                  {entry.stack}
                </pre>
              </details>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
