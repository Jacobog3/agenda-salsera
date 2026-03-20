import { CalendarDays } from "lucide-react";
import type { ScheduleDay } from "@/types/academy";

function splitClassLabel(name: string) {
  const trimmed = name.trim();
  const match = trimmed.match(/^(.+?)\s*(\(.+\))$/);

  if (!match) {
    return { title: trimmed, detail: "" };
  }

  return {
    title: match[1].trim(),
    detail: match[2].trim()
  };
}

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
              {day.classes.map((cls, j) => {
                const { title: classTitle, detail: classDetail } = splitClassLabel(cls.name);

                return (
                  <div
                    key={`${day.day}-${j}`}
                    className="grid grid-cols-[4.85rem_minmax(0,1fr)_5.9rem] items-start gap-2 px-3 py-2 text-xs sm:grid-cols-[7rem_minmax(0,1fr)_7.5rem] sm:gap-3 sm:px-4 sm:py-2.5 md:grid-cols-[7.5rem_minmax(0,1fr)_8rem] md:gap-4 md:px-5 md:text-sm"
                  >
                    <span className="block pt-0.5 font-semibold tabular-nums text-muted-foreground">
                      {cls.time}
                    </span>

                    <div className="min-w-0 space-y-0.5">
                      <span className="block break-words font-medium leading-snug text-foreground">
                        {classTitle}
                      </span>
                      {classDetail ? (
                        <span className="block break-words text-[11px] leading-snug text-muted-foreground md:text-xs">
                          {classDetail}
                        </span>
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      {cls.level ? (
                        <span className="block rounded-xl bg-brand-50/90 px-2 py-1 text-center text-[9px] font-semibold leading-[1.2] text-brand-700 [overflow-wrap:anywhere] sm:px-2.5 sm:py-1 sm:text-[10px] md:text-xs">
                          {cls.level}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
