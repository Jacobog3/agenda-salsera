import { createHash } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 12;

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientIp = forwardedFor || request.headers.get("x-real-ip") || "unknown";

  return createHash("sha256").update(clientIp).digest("hex");
}

export async function consumePublicAiQuota(request: Request) {
  const key = getClientKey(request);

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc("consume_ai_rate_limit", {
      p_client_key: key,
      p_operation: "parse-flyer",
      p_window_seconds: Math.floor(WINDOW_MS / 1000),
      p_max_requests: MAX_REQUESTS
    });

    if (error) throw error;

    const result = Array.isArray(data) ? data[0] : data;
    if (!result || typeof result.allowed !== "boolean") {
      throw new Error("AI rate-limit response is invalid.");
    }

    return {
      allowed: result.allowed,
      retryAfterSeconds: Number(result.retry_after_seconds ?? 0),
      unavailable: false
    };
  } catch (error) {
    console.error("[public-ai-rate-limit] Durable quota unavailable", error);
    return { allowed: false, retryAfterSeconds: 60, unavailable: true };
  }
}
