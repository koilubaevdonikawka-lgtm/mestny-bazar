/**
 * Задача №288 — Cloudflare Workers Rate Limiting bindings: single source of
 * truth for both the build (vite.config.ts writes these into the generated
 * wrangler config's `ratelimits`) and the runtime (CloudflareRateLimiter
 * looks each one up on the Worker env by `name`) — the two can never drift.
 *
 * Every window is 60s (Cloudflare allows only 10 or 60). Limits are
 * deliberately far above anything a person can do by hand — they exist to
 * stop scripts, not to shape real traffic. `namespaceId` is account-wide in
 * Cloudflare, hence the distinctive 288xxx range (Задача №288) to avoid
 * colliding with any other Worker on the account.
 *
 * Counters live at the Cloudflare edge (per location, eventually
 * consistent — permissive by design); nothing here touches Supabase.
 */
export const RATE_LIMIT_BINDINGS = {
  /** Order creation, per client IP. Shared NAT (carrier CGNAT, office, café) can put many real customers behind one IP, so this is looser than the per-user limit. */
  CHECKOUT_IP: { name: "RL_CHECKOUT_IP", namespaceId: "288001", limit: 30, periodSeconds: 60 },
  /** Order creation, per authenticated account — catches "many IPs, one account". A person rarely submits more than one or two orders a minute (every attempt counts, including a retry after a validation/stock error). */
  CHECKOUT_USER: { name: "RL_CHECKOUT_USER", namespaceId: "288002", limit: 2, periodSeconds: 60 },
  /** Image upload (every context), per client IP. Uploads are staff-only (admin/seller); a 10-photo multi-select fires 10 requests at once. */
  MEDIA_IP: { name: "RL_MEDIA_IP", namespaceId: "288003", limit: 60, periodSeconds: 60 },
  /** Image upload (every context), per authenticated staff account. */
  MEDIA_USER: { name: "RL_MEDIA_USER", namespaceId: "288004", limit: 60, periodSeconds: 60 },
  /** Extra cap on the AI-processed (paid Gemini) upload branch, per staff account. */
  MEDIA_AI_USER: { name: "RL_MEDIA_AI_USER", namespaceId: "288005", limit: 40, periodSeconds: 60 },
  /** Public storefront translation (cache misses call paid Gemini), per client IP. A ceiling, not a tight cap: one catalog page in a non-Russian language legitimately fires dozens of calls at once. */
  TRANSLATE_IP: { name: "RL_TRANSLATE_IP", namespaceId: "288006", limit: 900, periodSeconds: 60 },
  /** Bootstrap (first-owner) claim attempts, per client IP — the one server-side "attempt"-style auth action; sign-in itself is Google OAuth handled by Supabase in the browser. */
  BOOTSTRAP_IP: { name: "RL_BOOTSTRAP_IP", namespaceId: "288007", limit: 10, periodSeconds: 60 },
  /** Задача №302 — Telegram Login Widget sign-in attempts, per client IP. Unlike Google OAuth (handled entirely by Supabase in the browser), this one IS a server-side "attempt"-style auth action — the endpoint that verifies the widget's HMAC and calls Supabase Admin's generateLink(), so it gets the same kind of guard as BOOTSTRAP_IP above. */
  TELEGRAM_LOGIN_IP: {
    name: "RL_TELEGRAM_LOGIN_IP",
    namespaceId: "288008",
    limit: 10,
    periodSeconds: 60,
  },
} as const;

export type RateLimitBindingKey = keyof typeof RATE_LIMIT_BINDINGS;
