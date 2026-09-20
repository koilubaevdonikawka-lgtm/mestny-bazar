import type { IRateLimiter } from "@server/ports/rate-limiter.port";
import type { RateLimitBindingKey } from "@shared/security/rate-limit-bindings";
import { RATE_LIMIT_BINDINGS } from "@shared/security/rate-limit-bindings";
import { RateLimitedError } from "@server/domain/rate-limit.errors";
import { logger } from "@shared/observability/logger";

/**
 * Задача №288 — which sensitive actions are limited, and by which counters.
 * Read-only catalog/page traffic is intentionally absent: it is never
 * limited. The Telegram bot webhook and the Finik webhook never call this
 * (they are handled in src/server.ts before any server function runs), so
 * the admin bot's bulk price/product edits are not affected.
 */
export const RateLimitPolicy = {
  CHECKOUT: "CHECKOUT",
  MEDIA_UPLOAD: "MEDIA_UPLOAD",
  MEDIA_UPLOAD_AI: "MEDIA_UPLOAD_AI",
  PUBLIC_TRANSLATION: "PUBLIC_TRANSLATION",
  BOOTSTRAP_CLAIM: "BOOTSTRAP_CLAIM",
} as const;

export type RateLimitPolicy = (typeof RateLimitPolicy)[keyof typeof RateLimitPolicy];

interface PolicyBindings {
  ip?: RateLimitBindingKey;
  user?: RateLimitBindingKey;
}

const POLICY_BINDINGS: Record<RateLimitPolicy, PolicyBindings> = {
  CHECKOUT: { ip: "CHECKOUT_IP", user: "CHECKOUT_USER" },
  MEDIA_UPLOAD: { ip: "MEDIA_IP", user: "MEDIA_USER" },
  MEDIA_UPLOAD_AI: { user: "MEDIA_AI_USER" },
  PUBLIC_TRANSLATION: { ip: "TRANSLATE_IP" },
  BOOTSTRAP_CLAIM: { ip: "BOOTSTRAP_IP" },
};

export interface RateLimitIdentity {
  ip?: string | null;
  userId?: string | null;
}

export class RateLimitService {
  constructor(private readonly limiter: IRateLimiter) {}

  /**
   * Counts this request against every counter the policy defines for the
   * identity parts that are known (a missing ip/userId simply skips that
   * counter), and throws RateLimitedError on the first one over its limit.
   * Rejections are logged with only the IP, the action type and the time
   * (the logger adds the timestamp) — never the user id or any payload.
   */
  async enforce(policy: RateLimitPolicy, identity: RateLimitIdentity): Promise<void> {
    const bindings = POLICY_BINDINGS[policy];
    const checks: Array<{ scope: "ip" | "user"; binding: RateLimitBindingKey; key: string }> = [];
    if (bindings.ip && identity.ip) {
      checks.push({ scope: "ip", binding: bindings.ip, key: `ip:${identity.ip}` });
    }
    if (bindings.user && identity.userId) {
      checks.push({ scope: "user", binding: bindings.user, key: `user:${identity.userId}` });
    }

    for (const check of checks) {
      if (await this.limiter.isAllowed(check.binding, check.key)) continue;
      logger.warn("rate-limit:rejected", {
        action: policy,
        scope: check.scope,
        limit: RATE_LIMIT_BINDINGS[check.binding].limit,
        ip: identity.ip ?? null,
      });
      throw new RateLimitedError();
    }
  }
}
