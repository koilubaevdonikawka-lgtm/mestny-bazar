import { z } from "zod";

const catalogSourceSchema = z.enum(["shopify", "platform"]).default("shopify");
const checkoutSourceSchema = z.enum(["shopify", "platform"]).default("platform");

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),

  APP_NAME: z.string().default("Местный Базар"),
  APP_URL: z.string().url().optional(),

  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

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

/** Validated server-only environment. Throws on missing required vars. */
export function getServerEnv(): ServerEnv {
  if (!cachedEnv) {
    cachedEnv = serverEnvSchema.parse(process.env);
  }
  return cachedEnv;
}

export function getCatalogSource(): CatalogSource {
  return getServerEnv().FEATURE_CATALOG_SOURCE;
}

export function isPlatformCatalogEnabled(): boolean {
  return getCatalogSource() === "platform";
}

export function getCheckoutSource(): CheckoutSource {
  return getServerEnv().FEATURE_CHECKOUT_SOURCE;
}

export function isPlatformCheckoutEnabled(): boolean {
  return getCheckoutSource() === "platform";
}
