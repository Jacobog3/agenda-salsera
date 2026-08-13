"use client";

import { usePathname } from "next/navigation";
import { CalendarDays, MapPinned, GraduationCap, PartyPopper, PackageSearch } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

type NavKey = "events" | "festivals" | "spots" | "academies" | "resources";

type NavItem = {
  key: NavKey;
  href: "/events" | "/festivals" | "/spots" | "/academies" | "/resources";
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { key: "events",    href: "/events",    icon: CalendarDays },
  { key: "festivals", href: "/festivals", icon: PartyPopper },
  { key: "spots",     href: "/spots",     icon: MapPinned },
  { key: "academies", href: "/academies", icon: GraduationCap },
  { key: "resources", href: "/resources", icon: PackageSearch }
];

const aliases: Record<string, string[]> = {
  "/events":    ["/events",    "/eventos"],
  "/festivals": ["/festivals", "/festivales"],
  "/spots":     ["/spots",     "/lugares"],
  "/academies": ["/academies", "/academias"],
  "/resources": ["/resources", "/recursos"]
};

function isActive(href: string, pathname: string): boolean {
  const normalized = pathname.replace(/^\/[a-z]{2}(?:\/en)?/, "") || "/";
  const paths = aliases[href] ?? [href];
  return paths.some((p) => normalized === p || normalized.startsWith(p + "/"));
}

export function DesktopNav({ labels }: { labels: Record<NavKey, string> }) {
  const pathname = usePathname();

  return (
    <nav className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
      {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
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
            {labels[key]}
          </Link>
        );
      })}
    </nav>
  );
}
