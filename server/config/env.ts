import { z } from "zod";

const catalogSourceSchema = z.enum(["shopify", "platform"]).default("shopify");
const checkoutSourceSchema = z.enum(["shopify", "platform"]).default("platform");

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),

  APP_NAME: z.string().default("Местный Базар"),
  APP_URL: z.string().url().optional(),

  SUPABASE_URL: z.string().url(),
  // Required in every deployment configuration, not just when the platform
  // catalog feature flag is on: server/di/container.ts unconditionally
  // constructs SupabaseOrderRepository, SupabaseAddressRepository,
  // SupabaseSellerProductRepository, SupabaseDeliveryZoneRepository, and
  // SupabaseAuditLog regardless of FEATURE_CATALOG_SOURCE — checkout, orders,
  // addresses, and seller management all need it no matter which catalog
  // source is active.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  FEATURE_CATALOG_SOURCE: catalogSourceSchema,
  FEATURE_CHECKOUT_SOURCE: checkoutSourceSchema,

  SHOPIFY_STORE_DOMAIN: z.string().optional(),
  SHOPIFY_STOREFRONT_TOKEN: z.string().optional(),
  SHOPIFY_API_VERSION: z.string().default("2025-07"),

  FINIK_API_KEY: z.string().optional(),
  FINIK_WEBHOOK_SECRET: z.string().optional(),

  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_ADMIN_CHAT_ID: z.string().optional(),
  TELEGRAM_WAREHOUSE_CHAT_ID: z.string().optional(),
  TELEGRAM_COURIER_CHAT_ID: z.string().optional(),
  WHATSAPP_API_TOKEN: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type CatalogSource = z.infer<typeof catalogSourceSchema>;
export type CheckoutSource = z.infer<typeof checkoutSourceSchema>;

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

export function getCheckoutSource(): CheckoutSource {
  return getServerEnv().FEATURE_CHECKOUT_SOURCE;
}

export function isPlatformCheckoutEnabled(): boolean {
  return getCheckoutSource() === "platform";
}
