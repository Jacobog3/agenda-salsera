import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoIcon } from "@/components/brand/logo-icon";
import {
  LogOut,
  PlusCircle,
  ClipboardList,
  CalendarDays,
  GraduationCap,
  MapPinned,
  Flag
} from "lucide-react";

export const metadata = {
  title: "Admin | ExploraGuate",
  robots: { index: false, follow: false }
};

const navLinks = [
  { href: "/admin", label: "Crear", icon: PlusCircle },
  { href: "/admin/submissions", label: "Revisiones", icon: ClipboardList },
  { href: "/admin/events", label: "Eventos", icon: CalendarDays },
  { href: "/admin/academies", label: "Academias", icon: GraduationCap },
  { href: "/admin/spots", label: "Bares", icon: MapPinned },
  { href: "/admin/reports", label: "Reportes", icon: Flag }
];

export default async function AdminProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session?.value) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 md:h-16 md:gap-4 md:px-8">

          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <LogoIcon size={28} />
              <span className="hidden font-display text-sm font-bold leading-none tracking-normal sm:inline">
                <span className="text-brand-600">Explora</span>
                <span className="text-gray-900">Guate</span>
              </span>
            </Link>

            <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-700 md:px-2.5 md:py-1 md:text-xs">
              Admin
            </span>

            <nav className="hidden items-center gap-0.5 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden text-sm text-gray-400 transition-colors hover:text-gray-700 md:inline"
            >
              ← Ver sitio
            </Link>
            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 md:px-3"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Salir</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5 md:px-8 md:py-10">
        {children}
      </main>

      {/* Mobile bottom nav — scrollable */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex overflow-x-auto border-t border-gray-200 bg-white md:hidden">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex min-w-[4rem] flex-1 flex-col items-center gap-0.5 py-2 text-[9px] font-semibold text-gray-500 transition-colors active:text-brand-600"
          >
            <link.icon className="h-4.5 w-4.5" />
            {link.label}
          </Link>
        ))}
        <form action="/api/admin/logout" method="POST" className="flex min-w-[4rem] flex-1">
          <button
            type="submit"
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[9px] font-semibold text-gray-500 transition-colors active:text-red-600"
          >
            <LogOut className="h-4.5 w-4.5" />
            Salir
          </button>
        </form>
      </nav>
    </div>
  );
}
