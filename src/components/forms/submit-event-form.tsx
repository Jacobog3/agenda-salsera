"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ImagePlus,
  Loader2,
  X
} from "lucide-react";
import {
  eventSubmissionSchema,
  type EventSubmissionValues
} from "@/lib/validations/event-submission";
import { cn } from "@/lib/utils/cn";
import { uploadSubmissionImage } from "@/lib/uploads/upload-submission-image";
import { CountrySelect } from "@/components/forms/country-select";
import { DEFAULT_COUNTRY_CODE, DEFAULT_TIME_ZONE, getDefaultTimeZone } from "@/lib/locations";
import { SubmissionErrorNotice } from "@/components/forms/submission-error-notice";
import {
  analyzeSubmissionMaterial,
  createSubmissionIdempotencyKey
} from "@/lib/submissions/client";
import type { ReviewSignals } from "@/lib/submissions/analysis";
import { useSubmissionDraft } from "@/hooks/use-submission-draft";
import { DraftRestoredNotice } from "@/components/forms/draft-restored-notice";

const danceStyles: EventSubmissionValues["danceStyle"][] = [
  "salsa",
  "bachata",
  "salsa_bachata",
  "other"
];

export function SubmitEventForm() {
  const t = useTranslations("submitEvent");
  const f = useTranslations("forms");
  const common = useTranslations("common");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [whatsappText, setWhatsappText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const idempotencyKey = useRef(createSubmissionIdempotencyKey("event"));
  const [reviewSignals, setReviewSignals] = useState<ReviewSignals>({ reasons: [], mentions: [] });
  const [aiBasicStatus, setAiBasicStatus] = useState<"not_run" | "completed" | "failed">("not_run");

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
      countryCode: DEFAULT_COUNTRY_CODE,
      timeZone: DEFAULT_TIME_ZONE,
      venue: "",
      address: "",
      organizerName: "",
      contactLink: ""
    }
  });
  const draft = useSubmissionDraft({
    storageKey: "somossalsa:draft:event",
    value: { fields: form.watch(), sourceText: whatsappText },
    onRestore: (saved) => {
      form.reset(saved.fields);
      setWhatsappText(saved.sourceText || "");
    },
    enabled: status !== "success"
  });

  function requiredMessage(label: string) {
    return f("fieldRequired", { field: label });
  }

  function applyServerFieldErrors(fieldErrors: Record<string, string> | undefined) {
    if (!fieldErrors) return;

    if (fieldErrors.imageUrl) {
      form.setError("imageUrl", { message: f("imageRequired") });
    }
    if (fieldErrors.title) {
      form.setError("title", { message: requiredMessage(t("fields.title")) });
    }
    if (fieldErrors.date) {
      form.setError("date", { message: requiredMessage(t("fields.date")) });
    }
    if (fieldErrors.time) {
      form.setError("time", { message: requiredMessage(t("fields.time")) });
    }
    if (fieldErrors.city) {
      form.setError("city", { message: requiredMessage(t("fields.city")) });
    }
    if (fieldErrors.countryCode) {
      form.setError("countryCode", { message: requiredMessage(f("country")) });
    }
    if (fieldErrors.venue) {
      form.setError("venue", { message: requiredMessage(t("fields.venue")) });
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview("");
    form.setValue("imageUrl", "");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function uploadImage(): Promise<string> {
    if (!imageFile) return form.getValues("imageUrl") || "";
    setUploading(true);
    try {
      return await uploadSubmissionImage(imageFile, "events");
    } finally {
      setUploading(false);
    }
  }

  async function handleParse() {
    if (!whatsappText.trim() && !imageFile) return;
    setParsing(true);
    setParseError("");
    try {
      const d = await analyzeSubmissionMaterial({
        type: "event",
        text: whatsappText,
        imageFile
      });
      setReviewSignals(d.reviewSignals);
      setAiBasicStatus("completed");
      if (d.title) form.setValue("title", d.title, { shouldValidate: true });
      if (d.date) form.setValue("date", d.date, { shouldValidate: true });
      if (d.time) form.setValue("time", d.time, { shouldValidate: true });
      if (d.venue) form.setValue("venue", d.venue, { shouldValidate: true });
      if (d.address) form.setValue("address", d.address);
      if (d.city) form.setValue("city", d.city, { shouldValidate: true });
      if (d.countryCode) {
        form.setValue("countryCode", d.countryCode, { shouldValidate: true });
        form.setValue("timeZone", d.timeZone || getDefaultTimeZone(d.countryCode));
      }
      if (d.price) form.setValue("price", d.price);
      if (d.organizerName) form.setValue("organizerName", d.organizerName);
      if (d.contactLink) form.setValue("contactLink", d.contactLink);
      if (d.danceStyle) form.setValue("danceStyle", d.danceStyle);
      if (d.description) form.setValue("description", d.description);
    } catch (error) {
      setAiBasicStatus("failed");
      setParseError(error instanceof Error ? error.message : f("connectionError"));
    } finally {
      setParsing(false);
    }
  }

  async function onSubmit(values: EventSubmissionValues) {
    setStatus("idle");
    setSubmitError("");
    try {
      const imageUrl = await uploadImage();
      if (!imageUrl) {
        form.setError("imageUrl", { message: f("imageRequired") });
        return;
      }
      const response = await fetch("/api/event-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          imageUrl,
          sourceText: whatsappText,
          reviewSignals,
          aiBasicStatus,
          idempotencyKey: idempotencyKey.current
        })
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus("error");
        applyServerFieldErrors(json.fieldErrors);
        setSubmitError(String(json.error || t("error")));
        return;
      }
      form.reset();
      setWhatsappText("");
      setImageFile(null);
      setImagePreview("");
      setReviewSignals({ reasons: [], mentions: [] });
      setAiBasicStatus("not_run");
      idempotencyKey.current = createSubmissionIdempotencyKey("event");
      draft.clearDraft();
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setSubmitError(error instanceof Error ? error.message : t("error"));
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <p className="font-display text-lg font-bold text-foreground">
          {t("success")}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {f("successReview")}
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>

      {draft.restored ? <DraftRestoredNotice message={f("draftRestored")} /> : null}

      {/* Step 1 — Flyer image */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {f("step1Flyer")}
        </p>
        {imagePreview ? (
          <div className="relative w-full overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Flyer" className="max-h-64 w-full object-contain" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface-soft px-4 py-8 text-center transition hover:border-brand-400 hover:bg-brand-50"
          >
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              {f("uploadImage")}
            </span>
            <span className="text-xs text-muted-foreground/60">{f("imageFormats")}</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        {form.formState.errors.imageUrl && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {form.formState.errors.imageUrl.message}
          </p>
        )}
      </div>

      {/* Step 2 — WhatsApp text parser */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {f("step2Text")}
        </p>
        <Textarea
          rows={5}
          placeholder={f("pasteHere")}
          value={whatsappText}
          onChange={(e) => setWhatsappText(e.target.value)}
          className="resize-none font-mono text-xs"
        />
        {parseError ? (
          <SubmissionErrorNotice
            message={parseError}
            submissionType="event"
            step="ai_basic"
            route="/api/parse-flyer"
          />
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={(!whatsappText.trim() && !imageFile) || parsing}
          onClick={handleParse}
          className="gap-2"
        >
          {parsing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 text-brand-500" />
          )}
          {parsing ? f("extracting") : f("autofill")}
        </Button>
        {aiBasicStatus === "completed" && reviewSignals.mentions.length > 0 ? (
          <p className="text-xs text-brand-700">
            {f("additionalInfoFound", { count: reviewSignals.mentions.length })}
          </p>
        ) : null}
      </div>

      {/* Step 3 — Review fields */}
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {f("step3Review")}
        </p>

        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          <Field
            label={t("fields.title")}
            error={form.formState.errors.title?.message}
          >
            <Input {...form.register("title")} />
          </Field>
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
        </div>

        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          <Field label={t("fields.date")} error={form.formState.errors.date?.message}>
            <Input type="date" {...form.register("date")} />
          </Field>
          <Field label={t("fields.time")} error={form.formState.errors.time?.message}>
            <Input type="time" {...form.register("time")} />
          </Field>
          <Field label={t("fields.price")}>
            <Textarea rows={2} placeholder={f("pricePlaceholder")} {...form.register("price")} className="resize-none text-sm" />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          <Field label={t("fields.venue")} error={form.formState.errors.venue?.message}>
            <Input placeholder={f("venuePlaceholder")} {...form.register("venue")} />
          </Field>
          <Field label={t("fields.city")} error={form.formState.errors.city?.message}>
            <Input placeholder={f("city")} {...form.register("city")} />
          </Field>
          <Field label={`${f("country")} *`} error={form.formState.errors.countryCode ? requiredMessage(f("country")) : undefined}>
            <CountrySelect
              value={form.watch("countryCode")}
              onChange={(countryCode) => {
                form.setValue("countryCode", countryCode, { shouldValidate: true });
                form.setValue("timeZone", getDefaultTimeZone(countryCode));
              }}
            />
          </Field>
        </div>

        <Field label={f("address")}>
          <Input placeholder={f("addressPlaceholder")} {...form.register("address")} />
        </Field>

        <Field label={t("fields.description")}>
          <Textarea rows={3} placeholder={f("descriptionPlaceholder")} {...form.register("description")} />
        </Field>

        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          <Field label={t("fields.organizerName")}>
            <Input placeholder={f("organizerPlaceholder")} {...form.register("organizerName")} />
          </Field>
          <Field label={t("fields.contactLink")}>
            <Input placeholder={f("contactPlaceholder")} {...form.register("contactLink")} />
          </Field>
        </div>
      </div>

      {status === "error" || submitError ? (
        <SubmissionErrorNotice
          message={submitError || t("error")}
          submissionType="event"
          step="submit"
          route="/api/event-submissions"
        />
      ) : null}

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
        disabled={form.formState.isSubmitting || uploading}
      >
        {uploading ? f("uploading") : form.formState.isSubmitting ? f("submitting") : t("cta")}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
  className
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5 md:space-y-2", className)}>
      <Label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:text-xs">
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-[11px] font-medium text-destructive md:text-xs">{error}</p>
      )}
    </div>
  );
}
