import { AdminEventForm } from "@/components/admin/admin-event-form";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground md:text-2xl">
          Crear evento
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sube un flyer, extrae la info con IA y publica el evento.
        </p>
      </div>
      <div className="rounded-2xl border border-black/[0.04] bg-white p-5 shadow-soft md:rounded-3xl md:p-8">
        <AdminEventForm />
      </div>
    </div>
  );
}
