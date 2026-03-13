import Link from "next/link";
import "@/app/globals.css";

export const metadata = {
  title: "Admin | Exploraguate",
  robots: { index: false, follow: false }
};

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-center justify-between md:mb-8">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-[11px] font-bold text-white">
              EG
            </span>
            <span className="font-display text-base font-bold tracking-tight text-foreground">
              Admin
            </span>
          </div>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            &larr; Volver al sitio
          </Link>
        </header>
        {children}
      </div>
    </div>
  );
}
