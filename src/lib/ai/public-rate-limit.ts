import { createHash } from "node:crypto";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, RateLimitEntry>;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 12;

const globalRateLimit = globalThis as typeof globalThis & {
  publicAiRateLimitStore?: RateLimitStore;
};

const store = globalRateLimit.publicAiRateLimitStore ?? new Map<string, RateLimitEntry>();
globalRateLimit.publicAiRateLimitStore = store;

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientIp = forwardedFor || request.headers.get("x-real-ip") || "unknown";

  return createHash("sha256").update(clientIp).digest("hex");
}

export function consumePublicAiQuota(request: Request) {
  const now = Date.now();
  const key = getClientKey(request);
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000))
    };
  }

  current.count += 1;
  store.set(key, current);
  return { allowed: true, retryAfterSeconds: 0 };
}
