"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin-ui-error]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-soft">
        <h1 className="font-display text-xl font-bold text-gray-950">
          No se pudo completar esta acción
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Tus datos no se borraron intencionalmente. Intenta recuperar la pantalla o vuelve al panel.
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
        </div>
      </div>
    </main>
  );
}
