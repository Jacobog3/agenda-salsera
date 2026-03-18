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
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Fields = {
  name: string;
  contactName: string;
  description: string;
  city: string;
  address: string;
  styles: string;
  levels: string;
  modality: string;
  classFormats: string;
  teachingVenues: string;
  scheduleText: string;
  whatsapp: string;
  instagram: string;
  website: string;
  bookingUrl: string;
};

const defaultFields: Fields = {
  name: "",
  contactName: "",
  description: "",
  city: "",
  address: "",
  styles: "",
  levels: "",
  modality: "presencial",
  classFormats: "",
  teachingVenues: "",
  scheduleText: "",
  whatsapp: "",
  instagram: "",
  website: "",
  bookingUrl: ""
};

export function SubmitTeacherForm() {
  const f = useTranslations("forms");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [fields, setFields] = useState<Fields>(defaultFields);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function setField<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
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
    if (fileRef.current) fileRef.current.value = "";
  }

  async function uploadImage(): Promise<string> {
    if (!imageFile) return "";
    setUploading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const ext = imageFile.name.split(".").pop() ?? "jpg";
      const fileName = `submissions/teachers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("event-flyers")
        .upload(fileName, imageFile, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("event-flyers").getPublicUrl(fileName);
      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!fields.name || !fields.city) return;
    if (!imageFile && !imagePreview) {
      setImageError(f("imageRequired"));
      return;
    }

    setImageError("");
    setStatus("submitting");

    try {
      const imageUrl = await uploadImage();
      const res = await fetch("/api/teacher-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          image_url: imageUrl
        })
      });

      if (res.ok) {
        setStatus("success");
        setFields(defaultFields);
        setImageFile(null);
        setImagePreview("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <p className="font-display text-lg font-bold text-foreground">
          {f("teacherSuccess")}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {f("teacherSuccessDesc")}
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
            <span className="text-xs text-muted-foreground/60">{f("uploadImageTeacher")}</span>
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
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={`${f("name")} *`}>
            <Input required value={fields.name} onChange={(e) => setField("name", e.target.value)} />
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
            placeholder={f("teacherDescPlaceholder")}
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label={f("styles")}>
            <Input
              value={fields.styles}
              onChange={(e) => setField("styles", e.target.value)}
              placeholder={f("stylesPlaceholder")}
            />
          </Field>
          <Field label={f("levels")}>
            <Input
              value={fields.levels}
              onChange={(e) => setField("levels", e.target.value)}
              placeholder={f("levelsPlaceholder")}
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label={f("classFormatsLabel")}>
            <Input
              value={fields.classFormats}
              onChange={(e) => setField("classFormats", e.target.value)}
              placeholder={f("classFormatsPlaceholder")}
            />
          </Field>
          <Field label={f("teachingVenuesLabel")}>
            <Input
              value={fields.teachingVenues}
              onChange={(e) => setField("teachingVenues", e.target.value)}
              placeholder={f("teachingVenuesPlaceholder")}
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label={f("scheduleLabel")}>
            <Input
              value={fields.scheduleText}
              onChange={(e) => setField("scheduleText", e.target.value)}
              placeholder={f("schedulePlaceholder")}
            />
          </Field>
          <Field label={f("modality")}>
            <select
              value={fields.modality}
              onChange={(e) => setField("modality", e.target.value)}
              className="flex h-11 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="presencial">{f("inPerson")}</option>
              <option value="online">{f("online")}</option>
              <option value="mixto">{f("hybrid")}</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label={`${f("city")} *`}>
            <Input
              required
              value={fields.city}
              onChange={(e) => setField("city", e.target.value)}
              placeholder={f("cityPlaceholder")}
            />
          </Field>
          <Field label={f("address")}>
            <Input
              value={fields.address}
              onChange={(e) => setField("address", e.target.value)}
              placeholder={f("addressPlaceholder")}
            />
          </Field>
        </div>

        <Field label={f("bookingUrlLabel")}>
          <Input
            value={fields.bookingUrl}
            onChange={(e) => setField("bookingUrl", e.target.value)}
            placeholder={f("bookingUrlPlaceholder")}
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label={f("whatsapp")}>
            <Input
              value={fields.whatsapp}
              onChange={(e) => setField("whatsapp", e.target.value)}
              placeholder="https://wa.me/502..."
            />
          </Field>
          <Field label={f("instagram")}>
            <Input
              value={fields.instagram}
              onChange={(e) => setField("instagram", e.target.value)}
              placeholder="@maestro"
            />
          </Field>
          <Field label={f("website")}>
            <Input
              value={fields.website}
              onChange={(e) => setField("website", e.target.value)}
              placeholder="https://..."
            />
          </Field>
        </div>
      </div>

      {status === "error" ? (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="text-xs font-medium text-red-600">{f("submitError")}</p>
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
        {uploading
          ? f("uploading")
          : status === "submitting"
            ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {f("submitting")}
              </>
            )
            : f("submitTeacher")}
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
