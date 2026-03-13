import { NextResponse } from "next/server";
import { env } from "@/lib/utils/env";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const EVENT_PROMPT = `You are an assistant that extracts structured event data from WhatsApp messages or flyer text about dance events in Guatemala.

Extract the following fields and return ONLY a valid JSON object with these exact keys:
- title: event name (string)
- date: date in YYYY-MM-DD format using year 2026 if not specified (string)
- time: start time in HH:MM 24h format (string)
- venue: venue/place name only, not the full address (string)
- address: full address or location details (string)
- city: city name, default "Guatemala" if zone number mentioned (string)
- price: price text as-is e.g. "Q50" or "Q50.00" or "Gratis" (string)
- organizerName: organizer or instructor name (string)
- contactLink: phone number, WhatsApp link, or website URL for tickets (string)
- danceStyle: one of "salsa", "bachata", "salsa_bachata", "other" based on event content (string)
- description: 1-2 sentence summary of the event in Spanish (string)

Rules:
- If a field cannot be determined, use empty string ""
- For danceStyle: use "other" for cumbia, merengue, kizomba, etc.
- For city: if text mentions "zona [number]" without city, use "Guatemala"
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

export async function POST(request: Request) {
  const { text, type = "event" } = await request.json();

  if (!text || typeof text !== "string" || text.trim().length < 10) {
    return NextResponse.json({ error: "Text is too short." }, { status: 400 });
  }

  if (!env.geminiApiKey) {
    return NextResponse.json({ error: "Gemini not configured." }, { status: 503 });
  }

  const systemPrompt = type === "academy" ? ACADEMY_PROMPT : EVENT_PROMPT;
  const label = type === "academy" ? "Academy text to parse" : "Event text to parse";

  const response = await fetch(`${GEMINI_URL}?key=${env.geminiApiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: systemPrompt },
            { text: `\n\n${label}:\n${text}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 512
      }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("[parse-flyer] Gemini error:", err);
    return NextResponse.json({ error: "Gemini request failed." }, { status: 502 });
  }

  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json({ ok: true, data: parsed });
  } catch {
    console.error("[parse-flyer] Failed to parse Gemini response:", raw);
    return NextResponse.json({ error: "Could not parse response.", raw }, { status: 500 });
  }
}
