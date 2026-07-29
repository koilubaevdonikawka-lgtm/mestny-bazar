export type CatalogSource = "shopify" | "platform";
export type CheckoutSource = "shopify" | "platform";

/**
 * Client-safe feature flags (from VITE_* env).
 * Catalog default: shopify — current behavior unchanged until Stage 3.
 *
 * Checkout default: shopify — must track catalogSource's default, not move
 * independently of it. Platform checkout (CheckoutService) resolves every
 * line item by looking it up in the Supabase products table ONLY — it never
 * reads from Shopify, and nothing in this codebase syncs Shopify products
 * into that table. Defaulting checkoutSource to "platform" while
 * catalogSource defaults to "shopify" made checkout fail with
 * ProductNotSynchronized for every real Shopify-catalog item out of the
 * box. Only set VITE_FEATURE_CHECKOUT_SOURCE=platform once
 * VITE_FEATURE_CATALOG_SOURCE=platform too (Stage 3).
 */
export const features = {
  catalogSource:
    (import.meta.env.VITE_FEATURE_CATALOG_SOURCE as CatalogSource | undefined) ?? "shopify",
  checkoutSource:
    (import.meta.env.VITE_FEATURE_CHECKOUT_SOURCE as CheckoutSource | undefined) ?? "shopify",
} as const;

export function isPlatformCatalog(): boolean {
  return features.catalogSource === "platform";
}

export function isPlatformCheckout(): boolean {
  return features.checkoutSource === "platform";
}
