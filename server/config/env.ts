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

  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_ADMIN_CHAT_ID: z.string().optional(),
  TELEGRAM_WAREHOUSE_CHAT_ID: z.string().optional(),
  TELEGRAM_COURIER_CHAT_ID: z.string().optional(),
  WHATSAPP_API_TOKEN: z.string().optional(),

  // Optional — ai-provider.factory.ts falls back to the safe StubAiProvider
  // when this is missing, so the app boots with zero AI configuration
  // (Промпт №088/089).
  GOOGLE_AI_API_KEY: z.string().optional(),
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
