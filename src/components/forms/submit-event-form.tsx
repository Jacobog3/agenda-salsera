"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle } from "lucide-react";
import {
  eventSubmissionSchema,
  type EventSubmissionValues
} from "@/lib/validations/event-submission";
import { BASE_PATH } from "@/lib/utils/base-path";

const danceStyles: EventSubmissionValues["danceStyle"][] = [
  "salsa",
  "bachata",
  "salsa_bachata",
  "other"
];

export function SubmitEventForm() {
  const t = useTranslations("submitEvent");
  const common = useTranslations("common");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const form = useForm<EventSubmissionValues>({
    resolver: zodResolver(eventSubmissionSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      danceStyle: "salsa_bachata",
      date: "",
      time: "",
      price: "",
      city: "",
      venue: "",
      organizerName: "",
      contactLink: ""
    }
  });

  async function onSubmit(values: EventSubmissionValues) {
    setStatus("idle");

    const response = await fetch(`${BASE_PATH}/api/event-submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    form.reset();
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center md:py-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accentScale-50">
          <CheckCircle2 className="h-6 w-6 text-accentScale-700" />
        </div>
        <p className="font-display text-base font-bold text-foreground md:text-lg">
          {t("success")}
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-4 md:space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <Field
          label={t("fields.title")}
          error={form.formState.errors.title?.message}
        >
          <Input {...form.register("title")} />
        </Field>
        <Field
          label={t("fields.imageUrl")}
          error={form.formState.errors.imageUrl?.message}
        >
          <Input {...form.register("imageUrl")} />
        </Field>
      </div>

      <Field
        label={t("fields.description")}
        error={form.formState.errors.description?.message}
      >
        <Textarea rows={3} {...form.register("description")} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <Field label={t("fields.danceStyle")}>
          <select
            className="flex h-11 w-full rounded-xl border border-border bg-surface-soft px-4 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 md:h-12 md:py-3"
            {...form.register("danceStyle")}
          >
            {danceStyles.map((style) => (
              <option key={style} value={style}>
                {common(`danceStyles.${style}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label={t("fields.city")}
          error={form.formState.errors.city?.message}
        >
          <Input {...form.register("city")} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3 md:gap-5">
        <Field
          label={t("fields.date")}
          error={form.formState.errors.date?.message}
        >
          <Input type="date" {...form.register("date")} />
        </Field>
        <Field
          label={t("fields.time")}
          error={form.formState.errors.time?.message}
        >
          <Input type="time" {...form.register("time")} />
        </Field>
        <Field
          label={t("fields.price")}
          error={form.formState.errors.price?.message}
        >
          <Input {...form.register("price")} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <Field
          label={t("fields.venue")}
          error={form.formState.errors.venue?.message}
        >
          <Input {...form.register("venue")} />
        </Field>
        <Field
          label={t("fields.organizerName")}
          error={form.formState.errors.organizerName?.message}
        >
          <Input {...form.register("organizerName")} />
        </Field>
      </div>

      <Field
        label={t("fields.contactLink")}
        error={form.formState.errors.contactLink?.message}
      >
        <Input {...form.register("contactLink")} />
      </Field>

      {status === "error" ? (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 md:p-4">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500 md:h-5 md:w-5" />
          <p className="text-xs font-medium text-red-600 md:text-sm">
            {t("error")}
          </p>
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="w-full py-3 text-sm md:w-auto md:text-base"
        disabled={form.formState.isSubmitting}
      >
        {t("cta")}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 md:space-y-2">
      <Label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:text-xs">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-[11px] font-medium text-destructive md:text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}
