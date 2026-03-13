import Link from "next/link";
import { House, CalendarDays, MapPinned } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 text-center">
      <div>
        <p className="text-4xl font-bold text-brand-600 md:text-6xl">404</p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-gray-900">
          Página no encontrada
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lo que buscas no está disponible o fue movido.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            <House className="h-4 w-4" />
            Ir al inicio
          </Link>
          <Link
            href="/eventos"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <CalendarDays className="h-4 w-4" />
            Ver eventos
          </Link>
          <Link
            href="/lugares"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <MapPinned className="h-4 w-4" />
            Ver lugares
          </Link>
        </div>
      </div>
    </div>
  );
}
