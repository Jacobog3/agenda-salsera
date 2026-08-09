import { NextResponse } from "next/server";
import {
  GEMINI_DEFAULT_MAX_OUTPUT_TOKENS,
  GEMINI_RETRY_MAX_OUTPUT_TOKENS,
  cleanGeminiJsonResponse,
  extractGeminiText,
  isGeminiJsonTruncated
} from "@/lib/utils/gemini-response";
import { env } from "@/lib/utils/env";
import { getGeminiGenerateContentUrl, getGeminiModel, logGeminiUsage } from "@/lib/ai/gemini";
import { consumePublicAiQuota } from "@/lib/ai/public-rate-limit";
import {
  SUBMISSION_AI_VERSION,
  normalizeReviewSignals,
  type SubmissionType
} from "@/lib/submissions/analysis";

const EVENT_PROMPT = `You are an assistant that extracts structured event data from WhatsApp messages, captions, and flyer images about salsa, bachata, and Latin dance events worldwide.

Extract the following fields and return ONLY a valid JSON object with these exact keys:
- title: event name (string)
- date: start date in YYYY-MM-DD format using year 2026 if not specified (string)
- endDate: end date in YYYY-MM-DD format; if the flyer shows an explicit end time on the same day, use the same date value as date (string)
- time: primary start time in HH:MM 24h format; if multiple sessions exist on the same day, use the earliest start time (string)
- endTime: latest end time in HH:MM 24h format when the flyer provides one; if multiple sessions exist on the same day, use the latest ending time (string)
- venue: venue/place name only, not the full address (string)
- area: zone, mall, neighborhood, district, or short area reference such as "Zona 10", "Cayala", "Arkadia", or "Novicentro" (string)
- address: full address or location details (string)
- city: canonical city name. If a zone number in the capital is mentioned, use "Ciudad de Guatemala" (string)
- countryCode: ISO 3166-1 alpha-2 country code such as "GT", "CR", "MX", or "ES" (string)
- timeZone: IANA time zone for the event location, such as "America/Guatemala", "America/Costa_Rica", "America/Mexico_City", or "Europe/Madrid" (string)
- price: ALL price options in a compact readable string separated by " · " e.g. "Preventa Q50 · Puerta Q75" or "Full Pass Q1,160/$145 · 1 Taller Q260/$35 · Sociales Q160/$20" or "Gratis" (string)
- organizerName: organizer or instructor name (string)
- contactLink: phone number, WhatsApp link, or website URL for tickets (string)
- danceStyle: one of "salsa", "bachata", "salsa_bachata", "other" based on event content (string)
- eventKind: one of "social", "workshop", "class", "bootcamp", "competition", "show", "concert", "festival", "congress", "other" (string)
- festivalName: permanent festival/congress brand name only when this activity belongs to one; otherwise empty string (string)
- festivalEditionLabel: edition year or label such as "2026" only when explicitly supported; otherwise empty string (string)
- description: informative 2-4 sentence description in Spanish using concrete details from the flyer/text (string)

Rules:
- If a field cannot be determined, use empty string ""
- Combine information from both the text and the flyer image when both are provided
- Prefer explicit information from the flyer image for venue names, times, and location details
- Keep important concrete details in description when available: workshop names, levels, instructors, key price structure, venue reference, parking, or capacity notes
- A foreign guest workshop remains eventKind "workshop" or "class"; the guest's origin does not make it a festival.
- Use eventKind "festival" or "congress" only when the source itself presents a multi-activity festival/congress, not merely because several workshops are listed.
- Do not over-summarize the description into a vague generic blurb
- For danceStyle: use "other" for cumbia, merengue, kizomba, etc.
- For city: if text mentions "zona [number]" in Guatemala's capital without a city, use "Ciudad de Guatemala". Use "Antigua Guatemala", not "Antigua". Otherwise preserve the correct city for the country shown.
- Infer countryCode and timeZone only from reliable location evidence. When a Guatemala +502 phone number or Guatemalan quetzal price clearly confirms the country and there is no conflicting evidence, use "GT" and "America/Guatemala".
- For venue vs area vs address:
  - venue = studio/place/business name
  - area = short zone or area reference
  - address = broader location details or full reference, excluding the venue name when possible
- For contactLink: prefer website/ticket URLs over phone numbers; if only a phone is available, convert it to "https://wa.me/[country calling code][number]" without spaces or punctuation
- Remove emojis from all values
- Return ONLY the JSON object, no markdown, no explanation`;

const ACADEMY_PROMPT = `You are an assistant that extracts structured dance academy data from WhatsApp messages, Instagram posts, or flyer text worldwide.

Extract the following fields and return ONLY a valid JSON object with these exact keys:
- name: academy or school name (string)
- description: 1-2 sentence description in Spanish (string)
- city: canonical city name. If a zone number in the capital is mentioned, use "Ciudad de Guatemala". Use "Antigua Guatemala", not "Antigua" (string)
- countryCode: ISO 3166-1 alpha-2 country code such as "GT", "CR", "MX", or "ES" (string)
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

const TEACHER_PROMPT = `You are an assistant that extracts structured public profile data for Latin dance professionals, couples, DJs, judges, and dance teams worldwide.

Extract the following fields and return ONLY a valid JSON object:
- name: public or stage name (string)
- description: concise 1-2 sentence bio in Spanish supported by the source (string)
- city: current base city only when supported (string)
- countryCode: ISO 3166-1 alpha-2 code for the current base (string)
- address: public teaching address or area (string)
- styles: styles taught or performed, comma separated (string)
- levels: levels offered (string)
- modality: "presencial", "online", or "mixto" (string)
- classFormats: private, group, workshops, choreography, or other formats (string)
- teachingVenues: academies, companies, studios, or venues explicitly associated (string)
- scheduleText: public class schedule (string)
- contactName: booking/contact person when different from the profile name (string)
- whatsapp: WhatsApp number or URL (string)
- instagram: Instagram handle or URL (string)
- website: website URL (string)
- bookingUrl: booking URL (string)

Do not invent biographies, nationalities, affiliations, schedules, or contact information.
Use empty strings for fields that cannot be determined.
Remove emojis from values and return JSON only.`;

const SPOT_PROMPT = `You are an assistant that extracts structured information about venues and recurring Latin dance social spots worldwide.

Extract the following fields and return ONLY a valid JSON object:
- name: venue or public place name (string)
- description: concise 1-2 sentence description in Spanish supported by the source (string)
- city: canonical city name (string)
- countryCode: ISO 3166-1 alpha-2 country code (string)
- address: public address or location reference (string)
- schedule: recurring dance nights or opening schedule (string)
- coverCharge: entrance or cover options (string)
- contactName: public contact or host (string)
- whatsapp: WhatsApp number or URL (string)
- instagram: Instagram handle or URL (string)

Distinguish the physical venue from the academy or organizer hosting an activity there.
Use empty strings for fields that cannot be determined.
Remove emojis from values and return JSON only.`;

const BASIC_REVIEW_SIGNALS_PROMPT = `

This is a LOW-COST PUBLIC autofill pass. In the SAME JSON object, include only this minimal internal triage signal:
"reviewSignals": {
  "reasons": [],
  "mentions": [],
  "ambiguousFields": []
}

Public-triage rules:
- mentions MUST always be an empty array. Do not extract related names, roles, affiliations, evidence, or candidate matches in this public pass.
- reasons may contain only "related_entities_possible", "possible_duplicate", or "ambiguous_fields".
- Use "related_entities_possible" when the material visibly contains named people or institutions beyond the primary resource. The Admin will run the detailed analysis later.
- ambiguousFields contains only field names that are genuinely contradictory or unclear.
- Keep this pass focused on completing the basic public form.`;

type ParseFlyerRequest = {
  text?: string;
  type?: SubmissionType;
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
  const quota = consumePublicAiQuota(request);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: "Alcanzaste el límite temporal de análisis. Intenta de nuevo en unos minutos." },
      {
        status: 429,
        headers: { "Retry-After": String(quota.retryAfterSeconds) }
      }
    );
  }

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

  if (!["event", "academy", "teacher", "spot"].includes(type)) {
    return NextResponse.json({ error: "Unsupported resource type." }, { status: 400 });
  }

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

  const prompts: Record<SubmissionType, string> = {
    event: EVENT_PROMPT,
    academy: ACADEMY_PROMPT,
    teacher: TEACHER_PROMPT,
    spot: SPOT_PROMPT
  };
  const labels: Record<SubmissionType, string> = {
    event: "Event material to parse",
    academy: "Academy material to parse",
    teacher: "Professional profile material to parse",
    spot: "Dance venue material to parse"
  };
  const systemPrompt = `${prompts[type]}${BASIC_REVIEW_SIGNALS_PROMPT}`;
  const label = labels[type];
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

  let rawText = "";
  let finishReason = "";
  let parseError: unknown = null;

  const outputTokenLimits = [
    GEMINI_DEFAULT_MAX_OUTPUT_TOKENS,
    GEMINI_RETRY_MAX_OUTPUT_TOKENS
  ];

  for (const [attemptIndex, maxOutputTokens] of outputTokenLimits.entries()) {
    let response: Response;
    try {
      response = await fetch(`${getGeminiGenerateContentUrl()}?key=${env.geminiApiKey}`, {
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
            maxOutputTokens,
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
    logGeminiUsage("parse-flyer", data, attemptIndex + 1);
    const candidate = extractGeminiText(data);
    rawText = candidate.rawText;
    finishReason = candidate.finishReason;

    try {
      const cleaned = cleanGeminiJsonResponse(rawText);
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;
      const normalizedReviewSignals = normalizeReviewSignals(parsed.reviewSignals, parsed);
      parsed.reviewSignals = {
        ...normalizedReviewSignals,
        reasons: normalizedReviewSignals.reasons.filter((reason) =>
          ["related_entities_possible", "possible_duplicate", "ambiguous_fields"].includes(reason)
        ),
        mentions: []
      };
      delete parsed.people;
      return NextResponse.json({
        ok: true,
        data: parsed,
        ai: {
          provider: "google",
          model: getGeminiModel(),
          version: SUBMISSION_AI_VERSION
        }
      });
    } catch (error) {
      parseError = error;
      const shouldRetry =
        maxOutputTokens < GEMINI_RETRY_MAX_OUTPUT_TOKENS &&
        isGeminiJsonTruncated(rawText, finishReason);

      if (shouldRetry) {
        console.warn("[parse-flyer] Gemini response was truncated, retrying", {
          finishReason,
          maxOutputTokens
        });
        continue;
      }

      break;
    }
  }

  console.error("[parse-flyer] Failed to parse Gemini response:", {
    rawText,
    finishReason,
    error: parseError
  });

  return NextResponse.json(
    {
      error: isGeminiJsonTruncated(rawText, finishReason)
        ? "La respuesta de Gemini quedó truncada antes de terminar el JSON. Intenta de nuevo o envía menos material."
        : "No se pudo parsear la respuesta de Gemini.",
      raw: rawText
    },
    { status: 502 }
  );
}
