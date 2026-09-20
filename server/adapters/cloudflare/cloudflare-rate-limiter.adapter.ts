import {
  RATE_LIMIT_BINDINGS,
  type RateLimitBindingKey,
} from "@shared/security/rate-limit-bindings";
import type { IRateLimiter } from "@server/ports/rate-limiter.port";
import { logger } from "@shared/observability/logger";

interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

/**
 * Задача №288 — adapter over Cloudflare's native Rate Limiting binding
 * (declared in the generated wrangler config from RATE_LIMIT_BINDINGS, see
 * vite.config.ts). Nitro's cloudflare-module handler stores the Worker `env`
 * on `globalThis.__env__` for every request (same hand-off src/server.ts's
 * resolveWaitUntil documents), which is where the binding objects live.
 *
 * Fails OPEN everywhere: no `__env__` (local dev, tests), a binding missing
 * from the deployed config, or the binding throwing all resolve to
 * "allowed" — the limiter exists to stop abuse, never to break real users.
 */
export class CloudflareRateLimiter implements IRateLimiter {
  async isAllowed(binding: RateLimitBindingKey, key: string): Promise<boolean> {
    const env = (globalThis as { __env__?: Record<string, unknown> }).__env__;
    const candidate = env?.[RATE_LIMIT_BINDINGS[binding].name] as RateLimitBinding | undefined;
    if (!candidate || typeof candidate.limit !== "function") return true;

    try {
      const { success } = await candidate.limit({ key });
      return success;
    } catch (error) {
      logger.error("rate-limit:binding-failed", { binding, error });
      return true;
    }
  }
}
