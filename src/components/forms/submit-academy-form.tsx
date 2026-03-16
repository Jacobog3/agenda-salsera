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
  Sparkles,
  ImagePlus,
  Loader2,
  X
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils/cn";

type Fields = {
  name: string;
  description: string;
  city: string;
  address: string;
  scheduleText: string;
  levels: string;
  trialClass: boolean;
  modality: string;
  styles: string;
  contactName: string;
  whatsapp: string;
  instagram: string;
  website: string;
};

const defaultFields: Fields = {
  name: "", description: "", city: "", address: "",
  scheduleText: "", levels: "", trialClass: false,
  modality: "presencial", styles: "", contactName: "",
  whatsapp: "", instagram: "", website: ""
};

export function SubmitAcademyForm() {
  const f = useTranslations("forms");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [whatsappText, setWhatsappText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [fields, setFields] = useState<Fields>(defaultFields);
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
      const fileName = `submissions/academies/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
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

  async function handleParse() {
    if (!whatsappText.trim()) return;
    setParsing(true);
    setParseError("");
    try {
      const res = await fetch("/api/parse-flyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: whatsappText, type: "academy" })
      });
      const json = await res.json();
      if (!res.ok || !json.data) {
        setParseError(f("parseFail"));
        return;
      }
      const d = json.data;
      setFields((prev) => ({
        ...prev,
        name:         d.name         || prev.name,
        description:  d.description  || prev.description,
        city:         d.city         || prev.city,
        address:      d.address      || prev.address,
        scheduleText: d.scheduleText || prev.scheduleText,
        levels:       d.levels       || prev.levels,
        trialClass:   d.trialClass   ?? prev.trialClass,
        modality:     d.modality     || prev.modality,
        styles:       d.styles       || prev.styles,
        contactName:  d.contactName  || prev.contactName,
        whatsapp:     d.whatsapp     || prev.whatsapp,
        instagram:    d.instagram    || prev.instagram,
        website:      d.website      || prev.website
      }));
    } catch {
      setParseError(f("connectionError"));
    } finally {
      setParsing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
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
      const res = await fetch("/api/academy-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, image_url: imageUrl })
      });
      if (res.ok) {
        setStatus("success");
        setFields(defaultFields);
        setWhatsappText("");
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
        <p className="font-display text-lg font-bold text-foreground">{f("academySuccess")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {f("academySuccessDesc")}
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>

      {/* Step 1 — Image */}
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
            <span className="text-xs text-muted-foreground/60">{f("uploadImageAcademy")}</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        {imageError && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {imageError}
          </p>
        )}
      </div>

      {/* Step 2 — WhatsApp/IG text */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {f("step2TextAcademy")}
        </p>
        <Textarea
          rows={5}
          placeholder={f("pasteHere")}
          value={whatsappText}
          onChange={(e) => setWhatsappText(e.target.value)}
          className="resize-none font-mono text-xs"
        />
        {parseError && (
          <p className="flex items-center gap-1.5 text-xs text-red-500">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {parseError}
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!whatsappText.trim() || parsing}
          onClick={handleParse}
          className="gap-2"
        >
          {parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-brand-500" />}
          {parsing ? f("extracting") : f("autofill")}
        </Button>
      </div>

      {/* Step 3 — Review */}
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {f("step3Review")}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label={`${f("name")} *`}>
            <Input required value={fields.name} onChange={(e) => setField("name", e.target.value)} />
          </Field>
          <Field label={f("contactName")}>
            <Input value={fields.contactName} onChange={(e) => setField("contactName", e.target.value)} />
          </Field>
        </div>

        <Field label={f("description")}>
          <Textarea rows={3} value={fields.description} onChange={(e) => setField("description", e.target.value)}
            placeholder={f("academyDescPlaceholder")} />
        </Field>

        {/* Schedule section */}
        <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">{f("scheduleLabel")}</p>
          <Field label={f("scheduleLabel")}>
            <Input
              value={fields.scheduleText}
              onChange={(e) => setField("scheduleText", e.target.value)}
              placeholder={f("schedulePlaceholder")}
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={f("levels")}>
              <Input
                value={fields.levels}
                onChange={(e) => setField("levels", e.target.value)}
                placeholder={f("levelsPlaceholder")}
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
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={fields.trialClass}
              onChange={(e) => setField("trialClass", e.target.checked)}
              className="h-4 w-4 rounded border-border accent-brand-600"
            />
            <span className="text-sm text-foreground">{f("trialClass")}</span>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label={f("styles")}>
            <Input value={fields.styles} onChange={(e) => setField("styles", e.target.value)}
              placeholder={f("stylesPlaceholder")} />
          </Field>
          <Field label={`${f("city")} *`}>
            <Input required value={fields.city} onChange={(e) => setField("city", e.target.value)}
              placeholder={f("cityPlaceholder")} />
          </Field>
        </div>

        <Field label={f("address")}>
          <Input value={fields.address} onChange={(e) => setField("address", e.target.value)}
            placeholder={f("addressPlaceholder")} />
        </Field>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label={f("whatsapp")}>
            <Input value={fields.whatsapp} onChange={(e) => setField("whatsapp", e.target.value)}
              placeholder="https://wa.me/502..." />
          </Field>
          <Field label={f("instagram")}>
            <Input value={fields.instagram} onChange={(e) => setField("instagram", e.target.value)}
              placeholder="@academia" />
          </Field>
          <Field label={f("website")}>
            <Input value={fields.website} onChange={(e) => setField("website", e.target.value)}
              placeholder="https://..." />
          </Field>
        </div>
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="text-xs font-medium text-red-600">{f("submitError")}</p>
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
        disabled={status === "submitting" || uploading}
      >
        {uploading ? f("uploading") : status === "submitting" ? f("submitting") : f("submitAcademy")}
      </Button>
    </form>
  );
}

function Field({ label, children, className }: {
  label: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:text-xs">
        {label}
      </Label>
      {children}
    </div>
  );
}
