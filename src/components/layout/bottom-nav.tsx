"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, CalendarDays, MapPinned, GraduationCap, Plus, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { submitOptions } from "@/components/layout/submit-options";

type NavItem = {
  href: "/" | "/events" | "/spots" | "/academies" | "/submit-event";
  icon: typeof Home;
  labelKey: string;
  action?: boolean;
};

const navItems: NavItem[] = [
  { href: "/", icon: Home, labelKey: "home" },
  { href: "/events", icon: CalendarDays, labelKey: "events" },
  { href: "/submit-event", icon: Plus, labelKey: "submitEvent", action: true },
  { href: "/spots", icon: MapPinned, labelKey: "spots" },
  { href: "/academies", icon: GraduationCap, labelKey: "academies" },
];

const aliases: Record<string, string[]> = {
  "/": ["/"],
  "/events": ["/events", "/eventos"],
  "/spots": ["/spots", "/lugares"],
  "/academies": ["/academies", "/academias"],
  "/submit-event": ["/submit-event", "/enviar-evento"],
};

function isActiveRoute(href: string, pathname: string): boolean {
  const normalized = pathname.replace(/^\/(es|en)/, "") || "/";
  const paths = aliases[href] ?? [href];

  if (href === "/") {
    return paths.includes(normalized);
  }

  return paths.some(
    (p) => normalized === p || normalized.startsWith(p + "/")
  );
}

export function BottomNav() {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const [openSubmitMenu, setOpenSubmitMenu] = useState(false);

  useEffect(() => {
    setOpenSubmitMenu(false);
  }, [pathname]);

  useEffect(() => {
    if (!openSubmitMenu) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [openSubmitMenu]);

  return (
    <>
      {openSubmitMenu ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label={t("publishWhat")}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            onClick={() => setOpenSubmitMenu(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[2rem] bg-white px-5 pb-8 pt-5 shadow-2xl">
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-gray-200" />
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
                  {t("publish")}
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-gray-900">
                  {t("publishWhat")}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpenSubmitMenu(false)}
                className="rounded-full border border-gray-200 p-2 text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-900"
                aria-label={t("publish")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              {submitOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Link
                    key={option.href}
                    href={option.href}
                    onClick={() => setOpenSubmitMenu(false)}
                    className="flex items-start gap-3 rounded-2xl bg-gray-50 px-4 py-3.5 transition-colors hover:bg-gray-100"
                  >
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{t(option.labelKey)}</p>
                      <p className="text-xs leading-snug text-gray-500">{t(option.descKey)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <nav className="bottom-nav-shell fixed bottom-0 left-0 right-0 z-40 border-t border-black/[0.06] bg-white/85 backdrop-blur-2xl md:hidden">
      <div className="mx-auto flex h-[60px] max-w-lg items-center justify-around px-1">
        {navItems.map((item) => {
          const active = isActiveRoute(item.href, pathname);
          const Icon = item.icon;

          if (item.action) {
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => setOpenSubmitMenu(true)}
                aria-label={t(item.labelKey)}
                className="relative -mt-4 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-brand-600 shadow-lg shadow-brand-600/30 transition-all active:scale-90"
              >
                <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                <span className="sr-only">{t(item.labelKey)}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={t(item.labelKey)}
              className={cn(
                "relative flex min-h-12 min-w-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-4 py-2 text-[11px] font-medium transition-all active:scale-90",
                active ? "text-brand-600" : "text-muted-foreground"
              )}
            >
              {active && (
                <span className="absolute -top-1.5 h-[3px] w-5 rounded-full bg-brand-500" />
              )}
              <Icon
                className="h-[22px] w-[22px]"
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className={cn(active && "font-semibold")}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="safe-bottom" />
      </nav>
    </>
  );
}
