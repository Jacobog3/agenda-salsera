import { env } from "@/lib/utils/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const GEMINI_DEFAULT_MODEL = "gemini-3.1-flash-lite";

const GEMINI_STANDARD_RATES_USD_PER_MILLION_TOKENS: Record<
  string,
  { input: number; output: number }
> = {
  "gemini-3-flash-preview": { input: 0.5, output: 3 },
  "gemini-3.1-flash-lite": { input: 0.25, output: 1.5 }
};

type GeminiUsageMetadata = {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  thoughtsTokenCount?: number;
  cachedContentTokenCount?: number;
  totalTokenCount?: number;
};

type GeminiResponsePayload = {
  usageMetadata?: GeminiUsageMetadata;
};

export function getGeminiModel() {
  return env.geminiModel || GEMINI_DEFAULT_MODEL;
}

export function getGeminiGenerateContentUrl() {
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(getGeminiModel())}:generateContent`;
}

export function getGeminiUsage(payload: unknown) {
  const usage = payload && typeof payload === "object"
    ? (payload as GeminiResponsePayload).usageMetadata
    : undefined;
  const inputTokens = usage?.promptTokenCount ?? 0;
  const candidateTokens = usage?.candidatesTokenCount ?? 0;
  const thoughtTokens = usage?.thoughtsTokenCount ?? 0;
  const outputTokens = candidateTokens + thoughtTokens;
  const rates = GEMINI_STANDARD_RATES_USD_PER_MILLION_TOKENS[getGeminiModel()];
  const estimatedCostUsd = rates
    ? (inputTokens * rates.input + outputTokens * rates.output) / 1_000_000
    : null;

  return {
    inputTokens,
    candidateTokens,
    thoughtTokens,
    outputTokens,
    cachedInputTokens: usage?.cachedContentTokenCount ?? 0,
    totalTokens: usage?.totalTokenCount ?? inputTokens + outputTokens,
    estimatedCostUsd
  };
}

export async function logGeminiUsage(
  operation: "parse-flyer" | "admin-ai-update" | "submission-analysis" | "auto-translate",
  payload: unknown,
  attempt = 1
) {
  const usage = getGeminiUsage(payload);
  const event = {
    provider: "google",
    model: getGeminiModel(),
    operation,
    attempt,
    ...usage
  };

  console.info("[ai-usage]", JSON.stringify(event));

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("ai_usage_events").insert({
      provider: event.provider,
      model: event.model,
      operation: event.operation,
      attempt: event.attempt,
      input_tokens: usage.inputTokens,
      candidate_tokens: usage.candidateTokens,
      thought_tokens: usage.thoughtTokens,
      output_tokens: usage.outputTokens,
      cached_input_tokens: usage.cachedInputTokens,
      total_tokens: usage.totalTokens,
      estimated_cost_usd: usage.estimatedCostUsd,
      release_sha: process.env.VERCEL_GIT_COMMIT_SHA || null
    });

    if (error) {
      console.error("[ai-usage] Could not persist usage", error.message);
    }
  } catch (error) {
    console.error("[ai-usage] Could not persist usage", error);
  }
}
