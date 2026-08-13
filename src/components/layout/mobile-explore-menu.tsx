"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Info, Menu, PackageSearch, PartyPopper, UserRound, X } from "lucide-react";
import { Link } from "@/i18n/navigation";

const ITEMS = [
  { href: "/festivals" as const, labelKey: "festivals", icon: PartyPopper },
  { href: "/artists" as const, labelKey: "artists", icon: UserRound },
  { href: "/resources" as const, labelKey: "resources", icon: PackageSearch },
  { href: "/about" as const, labelKey: "about", icon: Info }
] as const;

export function MobileExploreMenu() {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-white text-foreground transition-colors hover:border-brand-200 hover:text-brand-600"
        aria-label={t("more")}
        aria-expanded={open}
      >
        <Menu className="h-4 w-4" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button type="button" className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" aria-label={t("closeMenu")} onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[2rem] bg-white px-5 pb-8 pt-5 shadow-2xl">
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-gray-200" />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">SomosSalsa</p>
                <h2 className="mt-1 font-display text-2xl font-bold text-gray-900">{t("explore")}</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-gray-200 p-2 text-gray-500" aria-label={t("closeMenu")}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {ITEMS.map(({ href, labelKey, icon: Icon }) => (
                <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3.5 text-sm font-semibold text-gray-800 hover:bg-brand-50 hover:text-brand-700">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  {t(labelKey)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
