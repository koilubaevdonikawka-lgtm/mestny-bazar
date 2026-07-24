export type CatalogSource = "shopify" | "platform";
export type CheckoutSource = "shopify" | "platform";

/**
 * Client-safe feature flags (from VITE_* env).
 * Catalog default: shopify — current behavior unchanged until Stage 3.
 * Checkout default: platform — Stage 2 platform order flow.
 */
export const features = {
  catalogSource:
    (import.meta.env.VITE_FEATURE_CATALOG_SOURCE as CatalogSource | undefined) ?? "shopify",
  checkoutSource:
    (import.meta.env.VITE_FEATURE_CHECKOUT_SOURCE as CheckoutSource | undefined) ?? "platform",
} as const;

export function isPlatformCatalog(): boolean {
  return features.catalogSource === "platform";
}

export function isPlatformCheckout(): boolean {
  return features.checkoutSource === "platform";
}
