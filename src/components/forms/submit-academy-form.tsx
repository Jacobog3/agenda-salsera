"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function SubmitAcademyForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
      city: (form.elements.namedItem("city") as HTMLInputElement).value,
      address: (form.elements.namedItem("address") as HTMLInputElement).value,
      styles: (form.elements.namedItem("styles") as HTMLInputElement).value,
      whatsapp: (form.elements.namedItem("whatsapp") as HTMLInputElement).value,
      instagram: (form.elements.namedItem("instagram") as HTMLInputElement).value,
      website: (form.elements.namedItem("website") as HTMLInputElement).value,
      contact_name: (form.elements.namedItem("contact_name") as HTMLInputElement).value
    };

    const res = await fetch("/api/academy-submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    setStatus(res.ok ? "success" : "error");
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <p className="font-display text-lg font-bold text-foreground">
          ¡Recibimos tu academia!
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          La revisaremos y la publicaremos pronto. Te contactamos si necesitamos más info.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <Field label="Nombre de la academia *">
          <Input name="name" required />
        </Field>
        <Field label="Nombre de contacto">
          <Input name="contact_name" placeholder="Tu nombre" />
        </Field>
      </div>

      <Field label="Descripción">
        <Textarea
          name="description"
          rows={3}
          placeholder="¿Qué enseñan? ¿Cuál es el enfoque de la academia?"
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <Field label="Ciudad *">
          <Input name="city" required placeholder="Ej: Ciudad de Guatemala" />
        </Field>
        <Field label="Dirección">
          <Input name="address" placeholder="Zona, calle, edificio" />
        </Field>
      </div>

      <Field label="Estilos que enseñan">
        <Input
          name="styles"
          placeholder="Ej: Salsa, bachata, merengue"
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-3 md:gap-5">
        <Field label="WhatsApp">
          <Input name="whatsapp" placeholder="https://wa.me/502..." />
        </Field>
        <Field label="Instagram">
          <Input name="instagram" placeholder="@academia" />
        </Field>
        <Field label="Sitio web">
          <Input name="website" placeholder="https://..." />
        </Field>
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 md:p-4">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="text-xs font-medium text-red-600">
            No se pudo enviar. Intentá de nuevo.
          </p>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full py-3 md:w-auto"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Enviando..." : "Enviar academia"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 md:space-y-2">
      <Label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:text-xs">
        {label}
      </Label>
      {children}
    </div>
  );
}
