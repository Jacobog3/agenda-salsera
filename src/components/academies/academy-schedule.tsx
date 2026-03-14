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
                  className="grid grid-cols-[5rem_1fr_auto] items-start gap-2 px-3 py-2 text-xs sm:grid-cols-[7rem_1fr_auto] sm:gap-3 sm:px-4 sm:py-2.5 md:grid-cols-[7.5rem_1fr_auto] md:gap-4 md:px-5 md:text-sm"
                >
                  <span className="pt-px font-semibold tabular-nums text-muted-foreground">
                    {cls.time}
                  </span>
                  <span className="min-w-0 font-medium text-foreground">
                    {cls.name}
                  </span>
                  {cls.level ? (
                    <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 md:text-xs">
                      {cls.level}
                    </span>
                  ) : (
                    <span />
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
