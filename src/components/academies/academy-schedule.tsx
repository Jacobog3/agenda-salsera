import { CalendarDays } from "lucide-react";
import type { ScheduleDay } from "@/types/academy";

const LEVEL_COLORS: Record<string, string> = {
  "básico": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "principiante": "bg-sky-50 text-sky-700 border-sky-200",
  "intermedio": "bg-amber-50 text-amber-700 border-amber-200",
  "avanzado": "bg-rose-50 text-rose-700 border-rose-200",
  "principiante / intermedio": "bg-sky-50 text-sky-700 border-sky-200",
  "intermedio / avanzado": "bg-amber-50 text-amber-700 border-amber-200",
};

function getLevelColor(level: string): string {
  const normalized = level.toLowerCase().trim();
  return LEVEL_COLORS[normalized] ?? "bg-gray-50 text-gray-600 border-gray-200";
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
            <div className="border-b border-border bg-brand-600 px-4 py-2 md:px-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                {day.day}
              </h3>
            </div>

            <ul className="divide-y divide-border/40">
              {day.classes.map((cls, j) => (
                <li
                  key={`${day.day}-${j}`}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3 md:flex-nowrap md:gap-4 md:px-5"
                >
                  <span className="w-full shrink-0 text-xs font-bold tabular-nums text-brand-700 sm:w-auto sm:min-w-[7.5rem] md:text-sm">
                    {cls.time}
                  </span>
                  <span className="flex-1 text-xs font-medium text-foreground md:text-sm">
                    {cls.name}
                  </span>
                  {cls.level && (
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold md:text-xs ${getLevelColor(cls.level)}`}
                    >
                      {cls.level}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
