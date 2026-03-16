"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { extractLowestPriceAmount } from "@/lib/utils/formatters";
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
  const [descriptionEs, setDescriptionEs] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [priceText, setPriceText] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [danceStyle, setDanceStyle] = useState("salsa_bachata");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [contactUrl, setContactUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const hasFlyerSource = Boolean(imageUrl.trim() || file);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setImageUrl("");
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
  }, []);

  function syncPriceFields(nextPriceText: string) {
    setPriceText(nextPriceText);
    const lowestPrice = extractLowestPriceAmount(nextPriceText, "GTQ");
    setPriceAmount(lowestPrice === null ? "" : String(lowestPrice));
  }

  async function uploadSelectedFile() {
    if (!file) return "";

    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Upload failed");
    }

    const nextImageUrl = String(data.url ?? "").trim();
    setImageUrl(nextImageUrl);
    return nextImageUrl;
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setErrorMsg("");
    try {
      await uploadSelectedFile();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleExtract() {
    if (!whatsappText.trim() && !imageUrl && !preview) return;
    setExtracting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/parse-flyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: whatsappText,
          type: "event",
          imageUrl,
          imageDataUrl: imageUrl ? "" : preview
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gemini request failed");

      const d = json.data;
      if (d.title)         setTitleEs(d.title);
      if (d.description)   setDescriptionEs(d.description);
      if (d.date)          setDate(d.date);
      if (d.time)          setTime(d.time);
      if (d.endDate)       setEndDate(d.endDate);
      if (d.endTime)       setEndTime(d.endTime);
      if (d.price)         syncPriceFields(d.price);
      if (d.venue)         setVenueName(d.venue);
      if (d.city)          setCity(d.city);
      if (d.area)          setArea(d.area);
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
    setDescriptionEs("");
    setDate("");
    setTime("");
    setEndDate("");
    setEndTime("");
    setPriceText("");
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
      if (endDate && date && new Date(endDate) < new Date(date)) {
        throw new Error("La fecha final no puede ser anterior a la fecha inicial");
      }

      if (!hasFlyerSource) {
        throw new Error("El flyer principal es obligatorio.");
      }

      let finalImageUrl = imageUrl.trim();
      if (!finalImageUrl && file) {
        setUploading(true);
        finalImageUrl = await uploadSelectedFile();
        setUploading(false);
      }

      if (!finalImageUrl) {
        throw new Error("No se pudo obtener la imagen principal del evento.");
      }

      const resolvedEndDate = endDate || (endTime ? date : "");

      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title_es: titleEs,
          description_es: descriptionEs,
          cover_image_url: finalImageUrl,
          gallery_urls: [],
          dance_style: danceStyle,
          city,
          area: area || null,
          venue_name: venueName,
          address: address || null,
          starts_at: `${date}T${time || "20:00"}:00-06:00`,
          ends_at: resolvedEndDate ? `${resolvedEndDate}T${endTime || time || "20:00"}:00-06:00` : null,
          price_amount: priceAmount ? Number(priceAmount) : null,
          price_text: priceText || null,
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
      setUploading(false);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image upload */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Flyer del evento *
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
        <p className="text-xs text-muted-foreground">
          La IA puede usar el texto, el flyer o ambos. Si el flyer ya está subido, también se analiza.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExtract}
          disabled={extracting || (!whatsappText.trim() && !imageUrl && !preview)}
          className="gap-2"
        >
          {extracting
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Extrayendo...</>
            : <><Sparkles className="h-4 w-4 text-brand-500" /> Autocompletar con IA</>
          }
        </Button>
      </div>

      {/* Form fields */}
      <div className="grid gap-4">
        <Field label="Título *">
          <Input
            value={titleEs}
            onChange={(e) => setTitleEs(e.target.value)}
            required
          />
        </Field>
      </div>

      <Field label="Descripción">
        <Textarea
          value={descriptionEs}
          onChange={(e) => setDescriptionEs(e.target.value)}
          rows={3}
        />
      </Field>

      <p className="text-xs text-muted-foreground">
        Ingresa el contenido en español. El sistema generará automáticamente la versión en inglés al guardar.
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
        <Field label="Fecha final">
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Field>
        <Field label="Hora final">
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder="Opcional"
          />
        </Field>
      </div>

      <p className="text-xs text-muted-foreground">
        Si es un bootcamp o evento largo, usa fecha inicial y fecha final para que el rango se vea claro en la agenda.
      </p>

      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]">
        <Field label="Precios">
          <Textarea
            value={priceText}
            onChange={(e) => syncPriceFields(e.target.value)}
            rows={3}
            placeholder={"Preventa Q250 full pass · 1 taller Q150 · Normal Q300 full pass · 1 taller Q175"}
          />
        </Field>
        <Field label="Precio mínimo (Q)">
          <Input
            type="number"
            min="0"
            value={priceAmount}
            onChange={(e) => setPriceAmount(e.target.value)}
            placeholder="Vacío = gratis"
          />
        </Field>
      </div>

      <p className="text-xs text-muted-foreground">
        Si hay varios precios, guarda el detalle en &quot;Precios&quot;. El mínimo se usa solo como apoyo para mostrar &quot;Desde Q...&quot;.
      </p>

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
        disabled={submitting || uploading || !titleEs || !date || !city || !venueName || !hasFlyerSource}
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
