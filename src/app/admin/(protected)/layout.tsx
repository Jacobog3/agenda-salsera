import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoIcon } from "@/components/brand/logo-icon";
import { LogOut } from "lucide-react";

export const metadata = {
  title: "Admin | ExploraGuate",
  robots: { index: false, follow: false }
};

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
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 md:h-16 md:px-8">

          <div className="flex items-center gap-4">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <LogoIcon size={32} />
              <span className="font-display text-sm font-bold leading-none tracking-normal">
                <span className="text-brand-600">Salsa</span>
                <span className="mx-1 text-gray-300">·</span>
                <span className="text-gray-900">Explora</span>
                <span className="text-brand-600">Guate</span>
              </span>
            </Link>

            <span className="hidden h-5 w-px bg-gray-200 md:block" />
            <span className="hidden rounded-md bg-brand-50 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.1em] text-brand-700 md:inline-flex">
              Admin
            </span>

            <nav className="flex items-center gap-0.5">
              <Link
                href="/admin"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                Crear evento
              </Link>
              <Link
                href="/admin/submissions"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                Revisiones
              </Link>
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
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Salir</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
        {children}
      </main>
    </div>
  );
}
