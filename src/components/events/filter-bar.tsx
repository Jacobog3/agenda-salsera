import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import type { DanceStyle } from "@/types/event";

const dateRanges = ["all", "7", "30"] as const;

export async function FilterBar({
  currentDate = "all",
  currentDanceStyle = "all"
}: {
  currentDate?: string;
  currentDanceStyle?: DanceStyle | "all";
}) {
  const t = await getTranslations("events");

  return (
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
  );
}
