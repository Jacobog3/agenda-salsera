"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, CalendarDays, MapPinned, GraduationCap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

type NavItem = {
  href: "/" | "/events" | "/spots" | "/academies";
  icon: typeof Home;
  labelKey: string;
};

const navItems: NavItem[] = [
  { href: "/", icon: Home, labelKey: "home" },
  { href: "/events", icon: CalendarDays, labelKey: "events" },
  { href: "/spots", icon: MapPinned, labelKey: "spots" },
  { href: "/academies", icon: GraduationCap, labelKey: "academies" },
];

const aliases: Record<string, string[]> = {
  "/": ["/"],
  "/events": ["/events", "/eventos"],
  "/spots": ["/spots", "/lugares"],
  "/academies": ["/academies", "/academias"],
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/[0.06] bg-white/85 backdrop-blur-2xl md:hidden">
      <div className="mx-auto flex h-[60px] max-w-lg items-center justify-around px-1">
        {navItems.map((item) => {
          const active = isActiveRoute(item.href, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-2xl px-5 py-1.5 text-[11px] font-medium transition-all active:scale-90",
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
  );
}
