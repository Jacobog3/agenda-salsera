"use client";

import { usePathname } from "next/navigation";
import { Home, CalendarDays, MapPinned, GraduationCap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  href: "/" | "/events" | "/spots" | "/academies";
  icon: LucideIcon;
  label: string;
};

const aliases: Record<string, string[]> = {
  "/": ["/"],
  "/events": ["/events", "/eventos"],
  "/spots": ["/spots", "/lugares"],
  "/academies": ["/academies", "/academias"]
};

function isActive(href: string, pathname: string): boolean {
  const normalized = pathname.replace(/^\/(es|en)/, "") || "/";
  const paths = aliases[href] ?? [href];
  if (href === "/") return paths.includes(normalized);
  return paths.some((p) => normalized === p || normalized.startsWith(p + "/"));
}

export function DesktopNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
      {items.map(({ href, icon: Icon, label }) => {
        const active = isActive(href, pathname);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-brand-50 text-brand-600"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Icon
              className="h-4 w-4 shrink-0"
              strokeWidth={active ? 2.2 : 1.8}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
