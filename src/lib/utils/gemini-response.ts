export const GEMINI_DEFAULT_MAX_OUTPUT_TOKENS = 2048;
export const GEMINI_RETRY_MAX_OUTPUT_TOKENS = 4096;

type GeminiTextPart = {
  text?: string | null;
} | null | undefined;

type GeminiCandidate = {
  content?: {
    parts?: GeminiTextPart[] | null;
  } | null;
  finishReason?: string | null;
} | null | undefined;

type GeminiPayload = {
  candidates?: GeminiCandidate[] | null;
};

export function extractGeminiText(payload: unknown) {
  const candidate =
    payload && typeof payload === "object"
      ? ((payload as GeminiPayload).candidates?.[0] ?? null)
      : null;

  const parts = Array.isArray(candidate?.content?.parts)
    ? candidate.content.parts
    : [];

  const rawText = parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("");

  const finishReason =
    typeof candidate?.finishReason === "string" ? candidate.finishReason : "";

  return { rawText, finishReason };
}

export function cleanGeminiJsonResponse(rawText: string) {
  return rawText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
}

export function isGeminiJsonTruncated(rawText: string, finishReason = "") {
  const cleaned = cleanGeminiJsonResponse(rawText);
  if (!cleaned) return false;

  return finishReason.toUpperCase().includes("MAX_TOKENS") || !cleaned.endsWith("}");
}
