"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

const dateRanges = ["all", "7", "30"] as const;

export function FilterBar() {
  const t = useTranslations("events");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentDate = searchParams.get("date") || "all";

  function updateFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("date");
    } else {
      params.set("date", value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide md:gap-2">
      {dateRanges.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => updateFilter(range)}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 md:px-4 md:py-2 md:text-sm",
            currentDate === range
              ? "bg-brand-500 text-white shadow-sm"
              : "border border-border bg-white text-muted-foreground hover:border-brand-200 hover:text-foreground"
          )}
        >
          {range === "all"
            ? t("filters.allDates")
            : range === "7"
              ? t("filters.next7Days")
              : t("filters.next30Days")}
        </button>
      ))}
    </div>
  );
}
