"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ScheduleDay, ScheduleClass } from "@/types/academy";

const ORDERED_DAYS = [
  "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
];

type Props = {
  value: ScheduleDay[] | null;
  onChange: (value: ScheduleDay[]) => void;
};

export function ScheduleEditor({ value, onChange }: Props) {
  const days = value ?? [];

  function addDay() {
    const used = new Set(days.map((d) => d.day));
    const next = ORDERED_DAYS.find((d) => !used.has(d)) ?? `Día ${days.length + 1}`;
    onChange([...days, { day: next, classes: [] }]);
  }

  function removeDay(dayIndex: number) {
    onChange(days.filter((_, i) => i !== dayIndex));
  }

  function updateDayName(dayIndex: number, name: string) {
    onChange(days.map((d, i) => i === dayIndex ? { ...d, day: name } : d));
  }

  function addClassToDay(dayIndex: number) {
    const day = days[dayIndex];
    onChange(days.map((d, i) =>
      i === dayIndex
        ? { ...d, classes: [...d.classes, { time: "", name: "", level: "" }] }
        : d
    ));
    void day;
  }

  function updateClass(dayIndex: number, classIndex: number, next: ScheduleClass) {
    onChange(days.map((d, i) =>
      i === dayIndex
        ? { ...d, classes: d.classes.map((c, j) => j === classIndex ? next : c) }
        : d
    ));
  }

  function removeClass(dayIndex: number, classIndex: number) {
    onChange(days.map((d, i) =>
      i === dayIndex
        ? { ...d, classes: d.classes.filter((_, j) => j !== classIndex) }
        : d
    ));
  }

  if (days.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
        <p className="mb-3 text-xs text-gray-400">Sin horario cargado.</p>
        <Button type="button" size="sm" variant="outline" onClick={addDay} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Agregar día
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {days.map((day, dayIndex) => (
        <div key={dayIndex} className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          {/* Day header */}
          <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2">
            <select
              value={day.day}
              onChange={(e) => updateDayName(dayIndex, e.target.value)}
              className="flex-1 bg-transparent text-sm font-semibold text-gray-900 outline-none cursor-pointer"
            >
              {ORDERED_DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => removeDay(dayIndex)}
              className="rounded p-0.5 text-gray-400 transition-colors hover:text-red-500"
              aria-label={`Quitar ${day.day}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Classes */}
          <div className="space-y-1.5 p-2">
            {day.classes.map((cls, classIndex) => (
              <div
                key={classIndex}
                className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5"
              >
                <Input
                  value={cls.time}
                  onChange={(e) => updateClass(dayIndex, classIndex, { ...cls, time: e.target.value })}
                  placeholder="18:00"
                  className="h-7 w-[4.5rem] shrink-0 px-1.5 text-xs font-mono"
                />
                <Input
                  value={cls.name}
                  onChange={(e) => updateClass(dayIndex, classIndex, { ...cls, name: e.target.value })}
                  placeholder="Salsa"
                  className="h-7 min-w-0 flex-1 px-1.5 text-xs"
                />
                <Input
                  value={cls.level ?? ""}
                  onChange={(e) => updateClass(dayIndex, classIndex, { ...cls, level: e.target.value })}
                  placeholder="Nivel"
                  className="h-7 w-20 shrink-0 px-1.5 text-xs"
                />
                <button
                  type="button"
                  onClick={() => removeClass(dayIndex, classIndex)}
                  className="shrink-0 rounded p-0.5 text-gray-300 transition-colors hover:text-red-400"
                  aria-label="Quitar clase"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addClassToDay(dayIndex)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-brand-600 transition-colors hover:text-brand-700"
            >
              <Plus className="h-3 w-3" />
              Agregar clase
            </button>
          </div>
        </div>
      ))}

      <Button type="button" size="sm" variant="outline" onClick={addDay} className="w-full gap-1.5">
        <Plus className="h-3.5 w-3.5" />
        Agregar día
      </Button>
    </div>
  );
}
