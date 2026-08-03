"use client";

import { usePathname } from "next/navigation";
import { LogoIcon } from "@/components/brand/logo-icon";
import { Link } from "@/i18n/navigation";

function isAgendaPath(pathname: string): boolean {
  const normalized = pathname.replace(/^\/(es|en)/, "") || "/";
  return normalized === "/eventos" || normalized.startsWith("/eventos/") ||
    normalized === "/events" || normalized.startsWith("/events/");
}

export function HeaderBrand() {
  const agenda = isAgendaPath(usePathname());

  return (
    <Link
      href="/"
      aria-label={agenda ? "Puro Salsero · ExploraGuate" : "ExploraGuate"}
      className="flex min-w-0 shrink items-center gap-1.5 md:gap-2"
    >
      <LogoIcon size={36} />
      <span className="whitespace-nowrap font-display text-[12px] font-bold leading-none tracking-[-0.01em] sm:text-[13px] md:text-[15px]">
        <span className={agenda ? "text-[#c94f25]" : "text-brand-600"}>
          {agenda ? "Puro Salsero" : "Salsa"}
        </span>
        <span className="mx-1 text-gray-300">·</span>
        <span className="text-gray-900">Explora</span>
        <span className="text-brand-600">Guate</span>
      </span>
    </Link>
  );
}
