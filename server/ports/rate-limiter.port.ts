import type { RateLimitBindingKey } from "@shared/security/rate-limit-bindings";

/**
 * Задача №288 — edge-level request counter (Cloudflare Workers Rate Limiting
 * binding). Deliberately not backed by Supabase: rejecting abusive traffic
 * must cost no database call. Implementations must fail OPEN — an
 * unavailable limiter may never block a real customer.
 */
export interface IRateLimiter {
  /** Counts one hit for `key` against `binding`'s window; false = over the limit. */
  isAllowed(binding: RateLimitBindingKey, key: string): Promise<boolean>;
}
