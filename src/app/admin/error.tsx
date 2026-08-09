"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  formatAdminErrorDiagnostic,
  saveLocalAdminError,
  type AdminClientErrorLog
} from "@/lib/admin/client-error-log";

export default function AdminError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [logEntry, setLogEntry] = useState<AdminClientErrorLog | null>(null);
  const loggedErrorRef = useRef<Error | null>(null);

  useEffect(() => {
    if (loggedErrorRef.current === error) return;
    loggedErrorRef.current = error;

    const entry: AdminClientErrorLog = {
      client_id: globalThis.crypto?.randomUUID?.()
        ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      created_at: new Date().toISOString(),
      route: window.location.href,
      message: error.message || "Error de interfaz sin detalle disponible.",
      stack: error.stack || null,
      digest: error.digest || null,
      source: "local"
    };

    console.error("[admin-ui-error]", error);
    setLogEntry(entry);
    saveLocalAdminError(entry);
    fetch("/api/admin/client-errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
      keepalive: true
    }).catch(() => undefined);
  }, [error]);

  async function copyDiagnostic() {
    if (!logEntry) return;
    try {
      await navigator.clipboard.writeText(formatAdminErrorDiagnostic(logEntry));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-soft">
        <h1 className="font-display text-xl font-bold text-gray-950">
          No se pudo completar esta acción
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          La pantalla encontró un error antes de completar la acción. Intenta recuperarla o vuelve al panel.
        </p>
        <p className="mt-3 break-words rounded-xl bg-gray-50 px-3 py-2 text-left text-xs leading-5 text-gray-600">
          Detalle: {error.message || "Error de interfaz sin detalle disponible."}
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-gray-400">Referencia: {error.digest}</p>
        ) : null}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="min-h-11 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white"
          >
            Reintentar
          </button>
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-gray-200 px-5 text-sm font-semibold text-gray-700"
          >
            Volver al panel
          </Link>
          <Link
            href="/admin/errors"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-gray-200 px-5 text-sm font-semibold text-gray-700"
          >
            Ver errores
          </Link>
          <button
            type="button"
            onClick={copyDiagnostic}
            disabled={!logEntry}
            className="min-h-11 rounded-full border border-gray-200 px-5 text-sm font-semibold text-gray-700"
          >
            {copied ? "Diagnóstico copiado" : "Copiar diagnóstico"}
          </button>
        </div>
      </div>
    </main>
  );
}
