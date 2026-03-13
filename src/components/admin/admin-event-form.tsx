"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { BASE_PATH } from "@/lib/utils/base-path";

export function AdminEventForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [titleEs, setTitleEs] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionEs, setDescriptionEs] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [contactUrl, setContactUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
  }, []);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${BASE_PATH}/api/admin/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImageUrl(data.url);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleExtract() {
    if (!preview) return;
    setExtracting(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${BASE_PATH}/api/admin/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.title_es) setTitleEs(data.title_es);
      if (data.title_en) setTitleEn(data.title_en);
      if (data.description_es) setDescriptionEs(data.description_es);
      if (data.description_en) setDescriptionEn(data.description_en);
      if (data.date) setDate(data.date);
      if (data.time) setTime(data.time);
      if (data.price_amount != null) setPriceAmount(String(data.price_amount));
      if (data.venue_name) setVenueName(data.venue_name);
      if (data.city) setCity(data.city);
      if (data.area) setArea(data.area);
      if (data.address) setAddress(data.address);
      if (data.organizer_name) setOrganizerName(data.organizer_name);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  }

  function resetForm() {
    setFile(null);
    setPreview(null);
    setImageUrl("");
    setTitleEs("");
    setTitleEn("");
    setDescriptionEs("");
    setDescriptionEn("");
    setDate("");
    setTime("");
    setPriceAmount("");
    setCity("");
    setArea("");
    setVenueName("");
    setAddress("");
    setOrganizerName("");
    setContactUrl("");
    setIsFeatured(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      const finalImageUrl = imageUrl || "";

      const res = await fetch(`${BASE_PATH}/api/admin/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title_es: titleEs,
          title_en: titleEn || titleEs,
          description_es: descriptionEs,
          description_en: descriptionEn || descriptionEs,
          cover_image_url: finalImageUrl,
          dance_style: "salsa_bachata",
          city,
          area: area || null,
          venue_name: venueName,
          address: address || null,
          starts_at: `${date}T${time || "20:00"}:00`,
          price_amount: priceAmount ? Number(priceAmount) : null,
          currency: "GTQ",
          organizer_name: organizerName,
          contact_url: contactUrl,
          is_featured: isFeatured
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatus("success");
      resetForm();
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Error al crear el evento"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image upload */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Flyer del evento
        </label>
        <div
          className="relative flex min-h-[180px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-soft/50 transition-colors hover:border-brand-400"
          onClick={() => document.getElementById("flyer-input")?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile) handleFileSelect(droppedFile);
          }}
        >
          <input
            id="flyer-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
            }}
          />
          {preview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={preview}
              alt="Preview"
              className="max-h-[300px] rounded-lg object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <Upload className="h-8 w-8" />
              <p className="text-sm font-medium">
                Arrastra un flyer o haz click para seleccionar
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {preview && !imageUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Subiendo...
                </>
              ) : (
                "Subir imagen"
              )}
            </Button>
          )}
          {imageUrl && (
            <span className="flex items-center gap-1 text-xs font-medium text-accentScale-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Imagen subida
            </span>
          )}
          {preview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExtract}
              disabled={extracting}
            >
              {extracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Extrayendo...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Extraer con IA
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Form fields */}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Título (ES) *">
          <Input
            value={titleEs}
            onChange={(e) => setTitleEs(e.target.value)}
            required
          />
        </Field>
        <Field label="Título (EN)">
          <Input
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            placeholder="Se usa el título ES si está vacío"
          />
        </Field>
      </div>

      <Field label="Descripción (ES)">
        <Textarea
          value={descriptionEs}
          onChange={(e) => setDescriptionEs(e.target.value)}
          rows={3}
        />
      </Field>
      <Field label="Descripción (EN)">
        <Textarea
          value={descriptionEn}
          onChange={(e) => setDescriptionEn(e.target.value)}
          rows={3}
          placeholder="Se usa la descripción ES si está vacío"
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Fecha *">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </Field>
        <Field label="Hora">
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </Field>
        <Field label="Precio (Q)">
          <Input
            type="number"
            min="0"
            value={priceAmount}
            onChange={(e) => setPriceAmount(e.target.value)}
            placeholder="Vacío = gratis"
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Ciudad *">
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </Field>
        <Field label="Zona / Área">
          <Input
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Venue *">
          <Input
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            required
          />
        </Field>
        <Field label="Dirección">
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Organizador">
          <Input
            value={organizerName}
            onChange={(e) => setOrganizerName(e.target.value)}
          />
        </Field>
        <Field label="Link de contacto (WhatsApp / IG)">
          <Input
            value={contactUrl}
            onChange={(e) => setContactUrl(e.target.value)}
            placeholder="https://wa.me/502..."
          />
        </Field>
      </div>

      {!imageUrl && (
        <Field label="URL de imagen (si no subiste flyer)">
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </Field>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
          className="rounded border-border"
        />
        Destacar en la página principal
      </label>

      {status === "success" && (
        <div className="flex items-center gap-2 rounded-xl bg-accentScale-50 p-4">
          <CheckCircle2 className="h-5 w-5 text-accentScale-700" />
          <p className="text-sm font-medium text-accentScale-700">
            Evento creado exitosamente
          </p>
        </div>
      )}

      {(status === "error" || errorMsg) && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm font-medium text-red-600">
            {errorMsg || "Error al crear el evento"}
          </p>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full md:w-auto"
        disabled={submitting || !titleEs || !date || !city || !venueName}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Publicando...
          </>
        ) : (
          "Publicar evento"
        )}
      </Button>
    </form>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
