import Link from "next/link";
import { CalendarDays, GraduationCap, MapPinned, UserRound } from "lucide-react";

const createLinks = [
  {
    href: "/admin/events?create=1#event-create",
    title: "Crear evento",
    description: "Flyer, IA y publicación inmediata.",
    icon: CalendarDays
  },
  {
    href: "/admin/academies?create=1",
    title: "Crear academia",
    description: "Logo, horarios, niveles y contacto.",
    icon: GraduationCap
  },
  {
    href: "/admin/teachers?create=1",
    title: "Crear maestro",
    description: "Perfil, formatos de clase y enlaces.",
    icon: UserRound
  },
  {
    href: "/admin/spots?create=1",
    title: "Crear spot",
    description: "Lugar, horarios, cover y mapas.",
    icon: MapPinned
  }
];

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Centro de creación
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Desde aquí puedes abrir creación directa para cada tipo de contenido sin pasar primero por el listado.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {createLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-black/[0.04] bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
