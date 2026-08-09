import { compressImageFileForAi } from "@/lib/utils/image-data-url";
import type {
  ReviewSignals,
  SubmissionType
} from "@/lib/submissions/analysis";

export type BasicAnalysisResult = Record<string, unknown> & {
  reviewSignals: ReviewSignals;
  title?: string;
  date?: string;
  time?: string;
  venue?: string;
  address?: string;
  city?: string;
  countryCode?: string;
  timeZone?: string;
  price?: string;
  organizerName?: string;
  contactLink?: string;
  danceStyle?: "salsa" | "bachata" | "salsa_bachata" | "other";
  description?: string;
  name?: string;
  scheduleText?: string;
  levels?: string;
  trialClass?: boolean;
  modality?: string;
  styles?: string;
  contactName?: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
  classFormats?: string;
  teachingVenues?: string;
  bookingUrl?: string;
  schedule?: string;
  coverCharge?: string;
};

export async function analyzeSubmissionMaterial({
  type,
  text,
  imageFile
}: {
  type: SubmissionType;
  text: string;
  imageFile?: File | null;
}): Promise<BasicAnalysisResult> {
  const normalizedText = text.trim();
  if (!normalizedText && !imageFile) {
    throw new Error("Agrega una imagen o pega texto para analizar.");
  }

  const imageDataUrl = imageFile
    ? await compressImageFileForAi(imageFile, { maxDimension: 1400, maxDataUrlLength: 900_000 })
    : "";
  const response = await fetch("/api/parse-flyer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, text: normalizedText, imageDataUrl })
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.data) {
    throw new Error(String(payload.error || "No se pudo analizar el material."));
  }

  return payload.data as BasicAnalysisResult;
}

export function createSubmissionIdempotencyKey(type: SubmissionType) {
  const randomPart = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${type}:${randomPart}`;
}

export async function reportSubmissionIncident({
  submissionType,
  step,
  message,
  route
}: {
  submissionType: SubmissionType;
  step: "upload" | "ai_basic" | "submit" | "recovery";
  message: string;
  route: string;
}) {
  const response = await fetch("/api/submission-incidents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ submissionType, step, message, route })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(String(payload.error || "No se pudo enviar el reporte."));
  return String(payload.incidentCode || "");
}
