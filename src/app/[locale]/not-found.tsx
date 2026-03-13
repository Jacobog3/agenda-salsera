import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { House, CalendarDays, MapPinned } from "lucide-react";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4 text-center">
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="text-6xl font-bold text-brand-600">404</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-gray-900">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>

        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            <House className="h-4 w-4" />
            {t("backHome")}
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <CalendarDays className="h-4 w-4" />
            {t("browseEvents")}
          </Link>
          <Link
            href="/spots"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <MapPinned className="h-4 w-4" />
            {t("browseSpots")}
          </Link>
        </div>
      </div>
    </div>
  );
}
