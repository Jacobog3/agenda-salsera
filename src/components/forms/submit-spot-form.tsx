"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function SubmitSpotForm() {
  const f = useTranslations("forms");
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
      schedule: (form.elements.namedItem("schedule") as HTMLInputElement).value,
      cover_charge: (form.elements.namedItem("cover_charge") as HTMLInputElement).value,
      whatsapp: (form.elements.namedItem("whatsapp") as HTMLInputElement).value,
      instagram: (form.elements.namedItem("instagram") as HTMLInputElement).value,
      contact_name: (form.elements.namedItem("contact_name") as HTMLInputElement).value
    };

    const res = await fetch("/api/spot-submissions", {
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
          {f("spotSuccess")}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {f("spotSuccessDesc")}
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <Field label={f("spotName")}>
          <Input name="name" required placeholder="Ej: Las Palmas, La Casbah" />
        </Field>
        <Field label={f("contactName")}>
          <Input name="contact_name" />
        </Field>
      </div>

      <Field label={f("description")}>
        <Textarea
          name="description"
          rows={3}
          placeholder={f("spotDescPlaceholder")}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <Field label={`${f("city")} *`}>
          <Input name="city" required placeholder={f("cityPlaceholder")} />
        </Field>
        <Field label={f("address")}>
          <Input name="address" placeholder={f("addressPlaceholder")} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <Field label={f("spotSchedule")}>
          <Input name="schedule" placeholder={f("spotSchedulePlaceholder")} />
        </Field>
        <Field label={f("spotCover")}>
          <Input name="cover_charge" placeholder={f("spotCoverPlaceholder")} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <Field label={f("whatsapp")}>
          <Input name="whatsapp" placeholder="https://wa.me/502..." />
        </Field>
        <Field label={f("instagram")}>
          <Input name="instagram" placeholder="@lugar" />
        </Field>
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 md:p-4">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="text-xs font-medium text-red-600">
            {f("submitError")}
          </p>
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {f("privacyNotice")}{" "}
        <Link href="/legal/privacy" className="underline hover:text-foreground">
          {f("privacyLink")}
        </Link>
        .
      </p>

      <Button
        type="submit"
        size="lg"
        className="w-full py-3 md:w-auto"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? f("submitting") : f("submitSpot")}
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
