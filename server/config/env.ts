import { z } from "zod";

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),

  APP_NAME: z.string().default("Местный Базар"),
  APP_URL: z.string().url().optional(),

  SUPABASE_URL: z.string().url(),
  // Required in every deployment configuration: server/di/container.ts
  // unconditionally constructs every Supabase-backed repository (catalog,
  // orders, addresses, seller products, delivery zones, audit log, ...) —
  // Supabase is the sole data source for the whole platform (ADR-002).
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // All optional — the payment provider factory (payment-provider.factory.ts)
  // falls back to a safe non-throwing stub when any of these is missing, so
  // the app boots and cash checkout works with zero Finik configuration.
  // RSA key pair per official Finik documentation (Промпт №077) — supersedes
  // the Промпт №075 HMAC-secret assumption.
  FINIK_API_KEY: z.string().optional(),
  FINIK_RSA_PRIVATE_KEY: z.string().optional(),
  FINIK_WEBHOOK_PUBLIC_KEY: z.string().optional(),
  FINIK_MERCHANT_ID: z.string().optional(),
  FINIK_ENVIRONMENT: z.enum(["beta", "production"]).optional(),

  // Задача №133 — Composition Root feature flag (docs/principles/11-feature-flags.md):
  // gates whether CustomerCancelOrderRule (server/domain/order-lifecycle/
  // rules/customer-cancel-order.rule.ts) is active. Domain rules never read
  // env directly — server/di/container.ts reads this once and passes a
  // plain boolean into the rule's constructor. Absent/anything but "true"
  // means disabled (self-cancellation off by default).
  FEATURE_CUSTOMER_CANCELLATION: z.enum(["true", "false"]).optional(),

  /**
   * The SELLER PRODUCT-INTAKE bot's own token — 86.Don.kg_bot, per the
   * project owner directly (Задача №302B). Read by
   * server/di/container.ts's TelegramBotApiAdapter (sendMessage/webhook
   * replies for the Telegram-based seller product bot) and by
   * scripts/setup-telegram-webhook.mjs to (re)register that bot's webhook.
   * NEVER used for verifying the customer-facing Telegram Login Widget —
   * that is a different bot (@MestnyBazar_Bot) with its own separate
   * TELEGRAM_LOGIN_BOT_TOKEN below. The two were briefly conflated in
   * Задача №302 (which mistakenly read this one for the Login Widget too,
   * before this variable existed) — kept as two distinct names specifically
   * so that mistake can't silently repeat.
   */
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  /**
   * Задача №302B — @MestnyBazar_Bot's own token, used ONLY by
   * server/domain/telegram-login/verify-telegram-login-payload.ts to verify
   * the customer-facing Telegram Login Widget's HMAC signature
   * (TelegramLoginButton.tsx). Deliberately a separate secret from
   * TELEGRAM_BOT_TOKEN above (the unrelated seller product-intake bot,
   * 86.Don.kg_bot) — the two must never be interchanged, even if they
   * happen to hold the same value at some point.
   */
  TELEGRAM_LOGIN_BOT_TOKEN: z.string().optional(),
  // Задача №264 — X-Telegram-Bot-Api-Secret-Token, set on the webhook via
  // scripts/setup-telegram-webhook.mjs and compared on every incoming
  // request (src/server.ts) — rejects any POST to the webhook path that
  // didn't actually come from Telegram. Optional so the app still boots
  // before this is configured; the webhook handler fails closed (401) on
  // every request while it's unset, never open.
  TELEGRAM_WEBHOOK_SECRET: z.string().optional(),
  TELEGRAM_ADMIN_CHAT_ID: z.string().optional(),
  TELEGRAM_WAREHOUSE_CHAT_ID: z.string().optional(),
  TELEGRAM_COURIER_CHAT_ID: z.string().optional(),
  WHATSAPP_API_TOKEN: z.string().optional(),

  // Optional — ai-provider.factory.ts falls back to the safe StubAiProvider
  // when this is missing, so the app boots with zero AI configuration
  // (Промпт №088/089).
  GOOGLE_AI_API_KEY: z.string().optional(),

  // Задача №215 — Firebase service account JSON (type/project_id/private_key/
  // client_email/...), the whole file content as one secret value. Optional,
  // same fallback pattern as FINIK_*/TELEGRAM_*: FcmPushAdapter is simply not
  // constructed when absent (container.ts), push notifications are a side
  // effect, never a boot requirement.
  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | undefined;

/**
 * Validated server-only environment. Throws a clear configuration error on
 * missing/invalid required vars — this is the first thing almost every
 * server function does (via getServices() in server/di/container.ts, or
 * directly in server/auth/resolve-user.ts), so a bad deployment fails loudly
 * on the first real request instead of surfacing as an unrelated crash deep
 * inside whichever repository happens to touch Supabase first.
 */
export function getServerEnv(): ServerEnv {
  if (!cachedEnv) {
    const result = serverEnvSchema.safeParse(process.env);
    if (!result.success) {
      const missing = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
      throw new Error(
        `Invalid server configuration — missing or invalid environment variable(s): ${missing}. Check your deployment secrets.`,
      );
    }
    cachedEnv = result.data;
  }
  return cachedEnv;
}
