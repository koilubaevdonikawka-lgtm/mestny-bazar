import { getRequest, setResponseHeader, setResponseStatus } from "@tanstack/react-start/server";
import { getServices } from "@server/di/container";
import { RateLimitedError } from "@server/domain/rate-limit.errors";
import type { RateLimitPolicy } from "@server/domain/rate-limit.service";

/**
 * The client's real IP as seen by Cloudflare. `cf-connecting-ip` is set by
 * Cloudflare itself and cannot be supplied by the client through the
 * proxy; `x-forwarded-for`'s first hop is only a fallback for non-Cloudflare
 * environments. null when neither is present (local dev) — the IP counter is
 * then simply skipped.
 */
export function extractClientIp(headers: Pick<Headers, "get"> | null | undefined): string | null {
  const cf = headers?.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  const forwarded = headers?.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || null;
}

/**
 * Задача №288 — call at the top of a sensitive server function, before the
 * real work. On rejection it sets the HTTP status to 429 (+ Retry-After) and
 * rethrows RateLimitedError, whose Russian message reaches the client the
 * same way every other server-function error message does.
 */
export async function enforceRateLimit(
  policy: RateLimitPolicy,
  options: { userId?: string | null; countIp?: boolean } = {},
): Promise<void> {
  // countIp:false is for a second call within the same request (after auth),
  // so the IP counter is not incremented twice for one request.
  const ip = options.countIp === false ? null : extractClientIp(getRequest()?.headers);
  try {
    await getServices().rateLimit.enforce(policy, { ip, userId: options.userId });
  } catch (error) {
    if (error instanceof RateLimitedError) {
      setResponseStatus(429);
      setResponseHeader("Retry-After", String(error.retryAfterSeconds));
    }
    throw error;
  }
}
