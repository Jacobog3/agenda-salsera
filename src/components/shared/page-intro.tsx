import type { ReactNode } from "react";
import { LastUpdatedBadge } from "@/components/shared/last-updated-badge";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/types/locale";

export function PageIntro({
  title,
  description,
  lastUpdated,
  locale,
  accent = "brand",
  children,
  aside
}: {
  title: string;
  description: string;
  lastUpdated: string | null;
  locale: Locale;
  accent?: "brand" | "puro";
  children?: ReactNode;
  aside?: ReactNode;
}) {
  const [titleLead, ...titleRestParts] = title.split(" ");
  const titleRest = titleRestParts.join(" ");

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-surface-soft/70 p-5 shadow-sm md:p-8">
      <span
        className={cn(
          "pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full opacity-60",
          accent === "puro" ? "bg-[#f4d55f]/20" : "bg-brand-50"
        )}
        aria-hidden="true"
      />

      <div
        className={cn(
          "relative grid items-center gap-4 md:gap-8",
          aside
            ? "grid-cols-[minmax(0,1fr)_6.5rem] md:grid-cols-[minmax(0,1fr)_11rem]"
            : "grid-cols-1"
        )}
      >
        <div className="min-w-0">
          <h1
            className="whitespace-nowrap font-display text-[1.45rem] font-extrabold leading-tight tracking-tight text-gray-950 md:text-4xl"
          >
            {accent === "puro" ? (
              <>
                <span className="text-[#c94f25]">{titleLead}</span>{" "}
                <span className="text-[#718f32]">{titleRest}</span>
              </>
            ) : title}
          </h1>
          {children ? <div className="mt-1.5">{children}</div> : null}
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-500 md:text-base">
            {description}
          </p>
        </div>

        {aside ? <div className="justify-self-end">{aside}</div> : null}
      </div>

      <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-3 md:mt-5">
        <LastUpdatedBadge date={lastUpdated} locale={locale} />
      </div>
    </div>
  );
}
