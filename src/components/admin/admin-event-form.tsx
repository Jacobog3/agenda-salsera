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
  Loader2,
  X
} from "lucide-react";

export function AdminEventForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [whatsappText, setWhatsappText] = useState("");
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
  const [danceStyle, setDanceStyle] = useState("salsa_bachata");
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
      const res = await fetch("/api/admin/upload", {
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
    if (!whatsappText.trim()) return;
    setExtracting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/parse-flyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: whatsappText, type: "event" })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gemini request failed");

      const d = json.data;
      if (d.title)         setTitleEs(d.title);
      if (d.title)         setTitleEn(d.title);
      if (d.description)   setDescriptionEs(d.description);
      if (d.description)   setDescriptionEn(d.description);
      if (d.date)          setDate(d.date);
      if (d.time)          setTime(d.time);
      if (d.price)         setPriceAmount(d.price.replace(/[^0-9.]/g, ""));
      if (d.venue)         setVenueName(d.venue);
      if (d.city)          setCity(d.city);
      if (d.address)       setAddress(d.address);
      if (d.organizerName) setOrganizerName(d.organizerName);
      if (d.contactLink)   setContactUrl(d.contactLink);
      if (d.danceStyle)    setDanceStyle(d.danceStyle);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Extracción fallida");
    } finally {
      setExtracting(false);
    }
  }

  function resetForm() {
    setFile(null);
    setPreview(null);
    setImageUrl("");
    setWhatsappText("");
    setTitleEs("");
    setTitleEn("");
    setDescriptionEs("");
    setDescriptionEn("");
    setDate("");
    setTime("");
    setPriceAmount("");
    setDanceStyle("salsa_bachata");
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

      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title_es: titleEs,
          title_en: titleEn || titleEs,
          description_es: descriptionEs,
          description_en: descriptionEn || descriptionEs,
          cover_image_url: finalImageUrl,
          gallery_urls: [],
          dance_style: danceStyle,
          city,
          area: area || null,
          venue_name: venueName,
          address: address || null,
          starts_at: `${date}T${time || "20:00"}:00-06:00`,
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
            <Button type="button" variant="outline" size="sm" onClick={handleUpload} disabled={uploading}>
              {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Subiendo...</> : "Subir imagen"}
            </Button>
          )}
          {imageUrl && (
            <span className="flex items-center gap-1 text-xs font-medium text-green-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Imagen subida
            </span>
          )}
          {preview && (
            <Button type="button" variant="outline" size="sm" onClick={() => { setFile(null); setPreview(null); setImageUrl(""); }} className="gap-1 text-red-500 hover:text-red-600">
              <X className="h-4 w-4" /> Quitar
            </Button>
          )}
        </div>
      </div>

      {/* WhatsApp text + Gemini extraction */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Texto del evento (WhatsApp / Instagram)
        </label>
        <Textarea
          rows={5}
          placeholder={"Pegá aquí el texto con la info del evento...\n\nEj:\n📅 Sábado 14 de Marzo\n📍 Garala Dance Studio, Arkadia\n⏰ 6:00 pm\n💰 Q50"}
          value={whatsappText}
          onChange={(e) => setWhatsappText(e.target.value)}
          className="resize-none font-mono text-xs"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExtract}
          disabled={extracting || !whatsappText.trim()}
          className="gap-2"
        >
          {extracting
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Extrayendo...</>
            : <><Sparkles className="h-4 w-4 text-brand-500" /> Autocompletar con IA</>
          }
        </Button>
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
        <Field label="Hora (Guatemala)">
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

      <Field label="Estilo de baile">
        <select
          value={danceStyle}
          onChange={(e) => setDanceStyle(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="salsa_bachata">Salsa y bachata</option>
          <option value="salsa">Salsa</option>
          <option value="bachata">Bachata</option>
          <option value="other">Otro (cumbia, merengue…)</option>
        </select>
      </Field>

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
        <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4">
          <CheckCircle2 className="h-5 w-5 text-green-700" />
          <p className="text-sm font-medium text-green-700">
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
