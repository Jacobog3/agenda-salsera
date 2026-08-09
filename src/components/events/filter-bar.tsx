import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import type { DanceStyle } from "@/types/event";

const dateRanges = ["all", "7", "30"] as const;

export async function FilterBar({
  currentDate = "all",
  currentDanceStyle = "all",
  currentCountry = "all",
  countries = []
}: {
  currentDate?: string;
  currentDanceStyle?: DanceStyle | "all";
  currentCountry?: string;
  countries?: Array<{ code: string; label: string }>;
}) {
  const t = await getTranslations("events");

  return (
    <div className="space-y-2">
      {countries.length > 1 ? (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide md:gap-2">
          {[{ code: "all", label: t("filters.allCountries") }, ...countries].map((country) => {
            const query: Record<string, string> = {};
            if (currentDate !== "all") query.date = currentDate;
            if (currentDanceStyle !== "all") query.danceStyle = currentDanceStyle;
            if (country.code !== "all") query.country = country.code;
            return (
              <Link
                key={country.code}
                href={{ pathname: "/events", query }}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 md:px-4 md:py-2 md:text-sm",
                  currentCountry === country.code
                    ? "bg-gray-900 text-white shadow-sm"
                    : "border border-border bg-white text-muted-foreground hover:border-gray-300 hover:text-foreground"
                )}
              >
                {country.label}
              </Link>
            );
          })}
        </div>
      ) : null}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide md:gap-2">
        {dateRanges.map((range) => {
        const active = currentDate === range;
        const query: Record<string, string> = {};

        if (currentDanceStyle && currentDanceStyle !== "all") {
          query.danceStyle = currentDanceStyle;
        }

        if (range !== "all") {
          query.date = range;
        }
        if (currentCountry !== "all") {
          query.country = currentCountry;
        }

        return (
          <Link
            key={range}
            href={{
              pathname: "/events",
              query
            }}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 md:px-4 md:py-2 md:text-sm",
              active
                ? "bg-brand-500 text-white shadow-sm"
                : "border border-border bg-white text-muted-foreground hover:border-brand-200 hover:text-foreground"
            )}
          >
            {range === "all"
              ? t("filters.allDates")
              : range === "7"
                ? t("filters.next7Days")
                : t("filters.next30Days")}
          </Link>
        );
        })}
      </div>
    </div>
  );
}
