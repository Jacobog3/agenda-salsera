import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
  filterMeaningfulAiChanges,
  getAiUpdatePrompt,
  normalizeAiUpdateSuggestion,
  type AiUpdateEntity
} from "@/lib/admin/ai-update";
import { env } from "@/lib/utils/env";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

type AiUpdateRequest = {
  entity: AiUpdateEntity;
  currentData?: Record<string, unknown>;
  text?: string;
  imageDataUrl?: string;
};

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!match) return null;

  return {
    mimeType: match[1],
    data: match[2]
  };
}

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const {
    entity,
    currentData = {},
    text = "",
    imageDataUrl = ""
  } = (await request.json()) as AiUpdateRequest;

  if (entity !== "academy" && entity !== "teacher") {
    return NextResponse.json({ error: "Entidad no soportada." }, { status: 400 });
  }

  const normalizedText = String(text ?? "").trim();
  const normalizedImageDataUrl = String(imageDataUrl ?? "").trim();

  if (!normalizedImageDataUrl && normalizedText.length < 10) {
    return NextResponse.json(
      { error: "Sube una imagen o pega contexto suficiente para analizar." },
      { status: 400 }
    );
  }

  if (!env.geminiApiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY no está configurada en el entorno." },
      { status: 503 }
    );
  }

  const parts: Array<Record<string, unknown>> = [
    { text: getAiUpdatePrompt(entity, currentData) }
  ];

  if (normalizedText) {
    parts.push({
      text: `\n\nNew admin-provided text or context:\n${normalizedText}`
    });
  }

  if (normalizedImageDataUrl) {
    const inlineData = parseDataUrl(normalizedImageDataUrl);

    if (!inlineData) {
      return NextResponse.json(
        { error: "La imagen no se pudo leer. Intenta subirla de nuevo." },
        { status: 400 }
      );
    }

    parts.push({
      inlineData: {
        mimeType: inlineData.mimeType,
        data: inlineData.data
      }
    });
  }

  let response: Response;
  try {
    response = await fetch(`${GEMINI_URL}?key=${env.geminiApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024,
          thinkingConfig: { thinkingBudget: 0 }
        }
      })
    });
  } catch (error) {
    console.error("[admin-ai-update] Network error", error);
    return NextResponse.json(
      { error: "No se pudo conectar con el servicio de IA." },
      { status: 502 }
    );
  }

  if (!response.ok) {
    const detail = await response.text();
    console.error("[admin-ai-update] Gemini error", response.status, detail);
    return NextResponse.json(
      { error: "La IA no pudo analizar el material en este momento." },
      { status: 502 }
    );
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  try {
    const cleaned = String(rawText).replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    const normalizedSuggestion = normalizeAiUpdateSuggestion(entity, parsed);
    const suggestion = filterMeaningfulAiChanges(entity, currentData, normalizedSuggestion);

    return NextResponse.json({
      ok: true,
      data: suggestion,
      changedKeys: Object.keys(suggestion)
    });
  } catch (error) {
    console.error("[admin-ai-update] Failed to parse Gemini response", { rawText, error });
    return NextResponse.json(
      { error: "No se pudo interpretar la respuesta de la IA." },
      { status: 500 }
    );
  }
}
