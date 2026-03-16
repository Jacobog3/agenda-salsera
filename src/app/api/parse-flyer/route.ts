import { NextResponse } from "next/server";
import { env } from "@/lib/utils/env";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

const EVENT_PROMPT = `You are an assistant that extracts structured event data from WhatsApp messages, captions, and flyer images about dance events in Guatemala.

Extract the following fields and return ONLY a valid JSON object with these exact keys:
- title: event name (string)
- date: date in YYYY-MM-DD format using year 2026 if not specified (string)
- time: primary start time in HH:MM 24h format; if multiple sessions exist on the same day, use the earliest start time (string)
- venue: venue/place name only, not the full address (string)
- area: zone, mall, neighborhood, district, or short area reference such as "Zona 10", "Cayala", "Arkadia", or "Novicentro" (string)
- address: full address or location details (string)
- city: city name, default "Guatemala" if zone number mentioned (string)
- price: ALL price options in a compact readable string separated by " · " e.g. "Preventa Q50 · Puerta Q75" or "Full Pass Q1,160/$145 · 1 Taller Q260/$35 · Sociales Q160/$20" or "Gratis" (string)
- organizerName: organizer or instructor name (string)
- contactLink: phone number, WhatsApp link, or website URL for tickets (string)
- danceStyle: one of "salsa", "bachata", "salsa_bachata", "other" based on event content (string)
- description: 1-2 sentence summary of the event in Spanish. Mention multiple workshop blocks briefly if they are part of the flyer (string)

Rules:
- If a field cannot be determined, use empty string ""
- Combine information from both the text and the flyer image when both are provided
- Prefer explicit information from the flyer image for venue names, times, and location details
- For danceStyle: use "other" for cumbia, merengue, kizomba, etc.
- For city: if text mentions "zona [number]" without city, use "Guatemala"
- For venue vs area vs address:
  - venue = studio/place/business name
  - area = short zone or area reference
  - address = broader location details or full reference, excluding the venue name when possible
- For contactLink: prefer website/ticket URLs over phone numbers; if only phone use "https://wa.me/502XXXXXXXX" format
- Remove emojis from all values
- Return ONLY the JSON object, no markdown, no explanation`;

const ACADEMY_PROMPT = `You are an assistant that extracts structured dance academy data from WhatsApp messages, Instagram posts, or flyer text in Guatemala.

Extract the following fields and return ONLY a valid JSON object with these exact keys:
- name: academy or school name (string)
- description: 1-2 sentence description in Spanish (string)
- city: city name, default "Guatemala" if zone number mentioned (string)
- address: full address or location reference (string)
- scheduleText: class schedule as readable text e.g. "Lunes y miércoles 6pm · Sábados 10am" (string)
- levels: levels offered e.g. "Principiante, Intermedio, Avanzado" (string)
- trialClass: true if a free trial class is mentioned, false otherwise (boolean)
- modality: "presencial", "online", or "mixto" (string)
- styles: dance styles taught e.g. "Salsa, bachata" (string)
- contactName: instructor or contact person name (string)
- whatsapp: WhatsApp number or link (string)
- instagram: Instagram handle or URL (string)
- website: website URL if mentioned (string)

Rules:
- If a field cannot be determined, use empty string "" or false for booleans
- Remove emojis from all values
- Return ONLY the JSON object, no markdown, no explanation`;

type ParseFlyerRequest = {
  text?: string;
  type?: "event" | "academy";
  imageUrl?: string;
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

async function imageUrlToInlineData(imageUrl: string) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`No se pudo descargar la imagen (${response.status}).`);
  }

  const contentType = response.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await response.arrayBuffer());

  return {
    mimeType: contentType,
    data: buffer.toString("base64")
  };
}

export async function POST(request: Request) {
  const {
    text = "",
    type = "event",
    imageUrl = "",
    imageDataUrl = ""
  } = (await request.json()) as ParseFlyerRequest;
  const normalizedText = typeof text === "string" ? text.trim() : "";
  const normalizedImageUrl = typeof imageUrl === "string" ? imageUrl.trim() : "";
  const normalizedImageDataUrl = typeof imageDataUrl === "string" ? imageDataUrl.trim() : "";
  const hasImage = Boolean(normalizedImageUrl || normalizedImageDataUrl);

  if (!hasImage && normalizedText.length < 10) {
    return NextResponse.json(
      { error: "Provide event text or a flyer image to extract data." },
      { status: 400 }
    );
  }

  if (!env.geminiApiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY no está configurada en las variables de entorno de Vercel." },
      { status: 503 }
    );
  }

  const systemPrompt = type === "academy" ? ACADEMY_PROMPT : EVENT_PROMPT;
  const label = type === "academy" ? "Academy text to parse" : "Event text to parse";
  const parts: Array<Record<string, unknown>> = [{ text: systemPrompt }];

  if (normalizedText) {
    parts.push({ text: `\n\n${label}:\n${normalizedText}` });
  }

  if (hasImage) {
    try {
      const inlineData = normalizedImageDataUrl
        ? parseDataUrl(normalizedImageDataUrl)
        : await imageUrlToInlineData(normalizedImageUrl);

      if (!inlineData) {
        throw new Error("La imagen no se pudo leer.");
      }

      parts.push({
        inlineData: {
          mimeType: inlineData.mimeType,
          data: inlineData.data
        }
      });
    } catch (imageError) {
      return NextResponse.json(
        {
          error: imageError instanceof Error
            ? imageError.message
            : "No se pudo procesar la imagen del flyer."
        },
        { status: 400 }
      );
    }
  }

  let response: Response;
  try {
    response = await fetch(`${GEMINI_URL}?key=${env.geminiApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024,
          thinkingConfig: { thinkingBudget: 0 }
        }
      })
    });
  } catch (fetchErr) {
    console.error("[parse-flyer] Network error:", fetchErr);
    return NextResponse.json({ error: "Error de red al conectar con Gemini." }, { status: 502 });
  }

  if (!response.ok) {
    const errText = await response.text();
    console.error("[parse-flyer] Gemini error:", response.status, errText);
    let detail = errText;
    try { detail = JSON.parse(errText)?.error?.message ?? errText; } catch { /* ignore */ }
    return NextResponse.json(
      { error: `Gemini (${response.status}): ${detail}` },
      { status: 502 }
    );
  }

  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json({ ok: true, data: parsed });
  } catch {
    console.error("[parse-flyer] Failed to parse Gemini response:", raw);
    return NextResponse.json({ error: "No se pudo parsear la respuesta de Gemini.", raw }, { status: 500 });
  }
}
