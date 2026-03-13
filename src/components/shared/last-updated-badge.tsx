import { getTranslations } from "next-intl/server";
import { RefreshCw } from "lucide-react";
import type { Locale } from "@/types/locale";

export async function LastUpdatedBadge({
  date,
  locale
}: {
  date: string | null;
  locale: Locale;
}) {
  if (!date) return null;

  const t = await getTranslations({ locale, namespace: "listing" });

  const formatted = new Intl.DateTimeFormat(locale === "es" ? "es-GT" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(date));

  return (
    <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
      <RefreshCw className="h-3 w-3" />
      {t("lastUpdated", { date: formatted })}
    </p>
  );
}
