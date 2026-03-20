import { CalendarDays } from "lucide-react";
import type { ScheduleDay } from "@/types/academy";

export function AcademySchedule({
  schedule,
  title
}: {
  schedule: ScheduleDay[];
  title: string;
}) {
  if (!schedule.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight md:text-xl">
        <CalendarDays className="h-5 w-5 text-brand-600" />
        {title}
      </h2>

      <div className="space-y-3">
        {schedule.map((day) => (
          <div
            key={day.day}
            className="overflow-hidden rounded-xl border border-border bg-white shadow-sm"
          >
            <div className="border-b border-border bg-muted/60 px-4 py-2 md:px-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-700">
                {day.day}
              </h3>
            </div>

            <div className="divide-y divide-border/30">
              {day.classes.map((cls, j) => (
                <div
                  key={`${day.day}-${j}`}
                  className="px-3 py-2 text-xs sm:grid sm:grid-cols-[7rem_1fr_auto] sm:items-start sm:gap-3 sm:px-4 sm:py-2.5 md:grid-cols-[7.5rem_1fr_auto] md:gap-4 md:px-5 md:text-sm"
                >
                  <span className="block pt-px font-semibold tabular-nums text-muted-foreground">
                    {cls.time}
                  </span>
                  <div className="min-w-0 pt-1 sm:pt-0">
                    <span className="block break-words font-medium leading-relaxed text-foreground">
                      {cls.name}
                    </span>
                    {cls.level ? (
                      <span className="mt-1 inline-flex w-fit rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 sm:hidden">
                        {cls.level}
                      </span>
                    ) : null}
                  </div>
                  {cls.level ? (
                    <span className="hidden shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 sm:inline-flex md:text-xs">
                      {cls.level}
                    </span>
                  ) : (
                    <span className="hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
