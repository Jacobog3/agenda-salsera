"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Plus, CalendarDays, GraduationCap, MapPinned, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Option = {
  href: "/submit-event" | "/submit-academy" | "/submit-spot";
  icon: typeof CalendarDays;
  labelKey: string;
  descKey: string;
};

const options: Option[] = [
  {
    href: "/submit-event",
    icon: CalendarDays,
    labelKey: "submitEventLabel",
    descKey: "submitEventDesc"
  },
  {
    href: "/submit-academy",
    icon: GraduationCap,
    labelKey: "submitAcademyLabel",
    descKey: "submitAcademyDesc"
  },
  {
    href: "/submit-spot",
    icon: MapPinned,
    labelKey: "submitSpotLabel",
    descKey: "submitSpotDesc"
  }
];

export function SubmitDropdown() {
  const t = useTranslations("navigation");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "hidden min-h-11 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all md:inline-flex",
          open
            ? "bg-brand-700 text-white"
            : "bg-brand-600 text-white hover:bg-brand-700"
        )}
        aria-expanded={open}
        aria-label={t("publish")}
      >
        {open ? (
          <X className="h-3.5 w-3.5" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
        {t("publish")}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5">
          <div className="px-4 pt-4 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              {t("publishWhat")}
            </p>
          </div>
          <ul className="pb-2">
            {options.map((opt) => {
              const Icon = opt.icon;
              return (
                <li key={opt.href}>
                  <Link
                    href={opt.href as "/submit-event"}
                    onClick={() => setOpen(false)}
                    aria-label={`${t(opt.labelKey)}. ${t(opt.descKey)}`}
                    className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                      <Icon className="h-4 w-4 text-brand-600" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {t(opt.labelKey)}
                      </p>
                      <p className="text-xs leading-snug text-gray-500">
                        {t(opt.descKey)}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
