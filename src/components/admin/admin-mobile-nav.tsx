"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  PlusCircle,
  ClipboardList,
  CalendarDays,
  GraduationCap,
  UserRound,
  MapPinned,
  Flag,
  LogOut,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { href: "/admin", label: "Crear", icon: PlusCircle },
  { href: "/admin/submissions", label: "Revisiones", icon: ClipboardList },
  { href: "/admin/events", label: "Eventos", icon: CalendarDays },
  { href: "/admin/academies", label: "Academias", icon: GraduationCap },
  { href: "/admin/teachers", label: "Maestros", icon: UserRound },
  { href: "/admin/spots", label: "Bares", icon: MapPinned },
  { href: "/admin/reports", label: "Reportes", icon: Flag }
];

function isActiveRoute(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-brand-200 hover:text-brand-700"
        aria-expanded={open}
        aria-controls="admin-mobile-menu"
      >
        <Menu className="h-4 w-4" />
        Menu
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Cerrar menu"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />

          <div
            id="admin-mobile-menu"
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[2rem] bg-white px-5 pb-8 pt-5 shadow-2xl"
          >
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-gray-200" />

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
                  Admin
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-gray-900">
                  Panel
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-gray-200 p-2 text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-900"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-2">
              {navLinks.map((link) => {
                const active = isActiveRoute(link.href, pathname);
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-semibold transition-colors",
                      active
                        ? "bg-brand-50 text-brand-700"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        active ? "bg-white text-brand-600" : "bg-white text-gray-500"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 grid gap-3">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-brand-200 hover:text-brand-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Ver sitio
              </Link>

              <form action="/api/admin/logout" method="POST">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                >
                  <LogOut className="h-4 w-4" />
                  Salir
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
