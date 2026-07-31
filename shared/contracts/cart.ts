import type { ProductDTO } from "./catalog";

/**
 * Identifies a cart/order line's product — exactly one of these two is set.
 * Mirrors CreateOrderItemRequest's identity shape in shared/contracts/order.ts
 * so a cart line and an order line item validate/resolve the same way while
 * the Shopify catalog is still live (Stage 9 not done): productId is a
 * platform UUID, productSlug is a Shopify handle / platform slug.
 */
export interface CartLineIdentifier {
  productId?: string;
  productSlug?: string;
}

/** Client-known display data for a line — never trusted for pricing (see IProductRepository validation). */
export interface CartLineSnapshot {
  name: string;
  price: number;
  currency?: string;
  imageUrl?: string | null;
}

export interface CartLineInput extends CartLineIdentifier {
  quantity: number;
  snapshot: CartLineSnapshot;
}

/** Persisted/returned cart line shape — server-side source of truth for authenticated users. */
export interface CartItemDTO extends CartLineIdentifier {
  quantity: number;
  name: string;
  price: number;
  currency: string;
  imageUrl: string | null;
}

export interface CartDTO {
  items: CartItemDTO[];
  updatedAt: string | null;
}

export type CartLineStatus = "ok" | "price_changed" | "out_of_stock" | "not_found";

export interface CartLineValidationResult {
  productId: string | null;
  productSlug: string | null;
  quantity: number;
  status: CartLineStatus;
  /** Authoritative current product data from IProductRepository — null when not_found. */
  product: ProductDTO | null;
}

export interface CartValidationResult {
  lines: CartLineValidationResult[];
  hasChanges: boolean;
}
