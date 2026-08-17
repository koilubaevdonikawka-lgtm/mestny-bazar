import { z } from "zod";

/** Mirrors createOrderItemSnapshotSchema in order.schema.ts — same bounds, same fields. */
const cartLineSnapshotSchema = z.object({
  name: z.string().trim().min(1).max(200),
  price: z.number().finite().min(0).max(10_000_000),
  currency: z.string().trim().min(1).max(10).optional(),
  imageUrl: z.string().trim().max(2000).nullable().optional(),
});

const identifierFields = {
  productId: z.string().trim().min(1).max(200).optional(),
  productSlug: z.string().trim().min(1).max(200).optional(),
};

/** At least one of productId/productSlug must be present — mirrors CreateOrderItemRequest's identity shape. */
function requireIdentifier(v: { productId?: string; productSlug?: string }): boolean {
  return Boolean(v.productId?.trim() || v.productSlug?.trim());
}

const identifierRefinement = {
  message: "Either productId or productSlug is required",
  path: ["productId"] as string[],
};

export const cartLineIdentifierSchema = z
  .object(identifierFields)
  .refine(requireIdentifier, identifierRefinement);

export const cartLineInputSchema = z
  .object({
    ...identifierFields,
    quantity: z.number().int().min(1).max(999),
    snapshot: cartLineSnapshotSchema,
  })
  .refine(requireIdentifier, identifierRefinement);

/**
 * Structural bounds only, matching createOrderRequestSchema's items cap — a
 * cart or merge request should never build an arbitrarily large product
 * lookup batch.
 */
export const validateCartRequestSchema = z.object({
  lines: z.array(cartLineInputSchema).max(200),
});

export const addCartItemRequestSchema = cartLineInputSchema;

/** quantity: 0 means "remove" — matches the existing client updateQuantity semantics. */
export const updateCartItemRequestSchema = z
  .object({
    ...identifierFields,
    quantity: z.number().int().min(0).max(999),
  })
  .refine(requireIdentifier, identifierRefinement);

export const removeCartItemRequestSchema = cartLineIdentifierSchema;

export const mergeGuestCartRequestSchema = z.object({
  lines: z.array(cartLineInputSchema).max(200),
});
