"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  AlertCircle,
  ImagePlus,
  Loader2,
  X
} from "lucide-react";
import { uploadSubmissionImage } from "@/lib/uploads/upload-submission-image";

type Fields = {
  name: string;
  description: string;
  city: string;
  address: string;
  schedule: string;
  coverCharge: string;
  whatsapp: string;
  instagram: string;
  contactName: string;
};

const defaultFields: Fields = {
  name: "",
  description: "",
  city: "",
  address: "",
  schedule: "",
  coverCharge: "",
  whatsapp: "",
  instagram: "",
  contactName: ""
};

export function SubmitSpotForm() {
  const f = useTranslations("forms");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [fields, setFields] = useState<Fields>(defaultFields);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  function requiredMessage(label: string) {
    return f("fieldRequired", { field: label });
  }

  function setField<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    setSubmitError("");
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError("");
    setSubmitError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview("");
    setImageError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function uploadImage(): Promise<string> {
    if (!imageFile) return "";
    setUploading(true);
    try {
      return await uploadSubmissionImage(imageFile, "spots");
    } finally {
      setUploading(false);
    }
  }

  function applyApiFieldErrors(nextErrors: Record<string, string> | undefined) {
    if (!nextErrors) return;

    const mappedErrors: Partial<Record<keyof Fields, string>> = {};
    if (nextErrors.name) mappedErrors.name = requiredMessage(f("spotName").replace(" *", ""));
    if (nextErrors.city) mappedErrors.city = requiredMessage(f("city"));
    if (nextErrors.imageUrl) setImageError(f("imageRequired"));

    if (Object.keys(mappedErrors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...mappedErrors }));
    }
  }

  function validateFields() {
    const nextErrors: Partial<Record<keyof Fields, string>> = {};

    if (!fields.name.trim()) {
      nextErrors.name = requiredMessage(f("spotName").replace(" *", ""));
    }

    if (!fields.city.trim()) {
      nextErrors.city = requiredMessage(f("city"));
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitError(f("fixHighlightedFields"));
      return false;
    }

    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError("");
    setStatus("idle");

    if (!validateFields()) return;

    if (!imageFile && !imagePreview) {
      setImageError(f("imageRequired"));
      setSubmitError(f("fixHighlightedFields"));
      return;
    }

    setImageError("");
    setStatus("submitting");

    try {
      const imageUrl = await uploadImage();
      const res = await fetch("/api/spot-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name,
          description: fields.description,
          city: fields.city,
          address: fields.address,
          image_url: imageUrl,
          schedule: fields.schedule,
          cover_charge: fields.coverCharge,
          whatsapp: fields.whatsapp,
          instagram: fields.instagram,
          contact_name: fields.contactName
        })
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus("success");
        setFields(defaultFields);
        setFieldErrors({});
        setSubmitError("");
        setImageFile(null);
        setImagePreview("");
      } else {
        setStatus("error");
        applyApiFieldErrors(json.fieldErrors);
        setSubmitError(String(json.error || f("submitError")));
      }
    } catch (error) {
      setStatus("error");
      setSubmitError(error instanceof Error ? error.message : f("submitError"));
    }
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
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {f("step1Image")}
        </p>
        {imagePreview ? (
          <div className="relative overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className="max-h-52 w-full object-contain" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
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
            <span className="text-sm font-medium text-muted-foreground">{f("uploadImage")}</span>
            <span className="text-xs text-muted-foreground/60">{f("uploadImageSpot")}</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        {imageError ? (
          <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {imageError}
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">{f("spotSectionBasics")}</p>
          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            <Field label={f("spotName")} error={fieldErrors.name}>
              <Input value={fields.name} onChange={(e) => setField("name", e.target.value)} placeholder="Ej: Las Palmas, La Casbah" />
            </Field>
            <Field label={f("contactName")}>
              <Input value={fields.contactName} onChange={(e) => setField("contactName", e.target.value)} />
            </Field>
          </div>

          <Field label={f("description")}>
            <Textarea
              rows={3}
              value={fields.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder={f("spotDescPlaceholder")}
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            <Field label={`${f("city")} *`} error={fieldErrors.city}>
              <Input value={fields.city} onChange={(e) => setField("city", e.target.value)} placeholder={f("cityPlaceholder")} />
            </Field>
            <Field label={f("address")}>
              <Input value={fields.address} onChange={(e) => setField("address", e.target.value)} placeholder={f("addressPlaceholder")} />
            </Field>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">{f("spotSectionNights")}</p>
          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            <Field label={f("spotSchedule")}>
              <Input value={fields.schedule} onChange={(e) => setField("schedule", e.target.value)} placeholder={f("spotSchedulePlaceholder")} />
            </Field>
            <Field label={f("spotCover")}>
              <Input value={fields.coverCharge} onChange={(e) => setField("coverCharge", e.target.value)} placeholder={f("spotCoverPlaceholder")} />
            </Field>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">{f("spotSectionContact")}</p>
          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            <Field label={f("whatsapp")}>
              <Input value={fields.whatsapp} onChange={(e) => setField("whatsapp", e.target.value)} placeholder="https://wa.me/502..." />
            </Field>
            <Field label={f("instagram")}>
              <Input value={fields.instagram} onChange={(e) => setField("instagram", e.target.value)} placeholder="@lugar" />
            </Field>
          </div>
        </div>
      </div>

      {status === "error" || submitError ? (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 md:p-4">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="text-xs font-medium text-red-600">
            {submitError || f("submitError")}
          </p>
        </div>
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
        disabled={status === "submitting" || uploading}
      >
        {uploading ? (
          f("uploading")
        ) : status === "submitting" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {f("submitting")}
          </>
        ) : (
          f("submitSpot")
        )}
      </Button>
    </form>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5 md:space-y-2">
      <Label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:text-xs">
        {label}
      </Label>
      {children}
      {error ? <p className="text-[11px] font-medium text-destructive md:text-xs">{error}</p> : null}
    </div>
  );
}
