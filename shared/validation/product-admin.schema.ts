import { z } from "zod";
import { createSellerProductRequestSchema } from "@shared/validation/seller-product.schema";
import { pageSchema, pageSizeSchema } from "@shared/validation/common.schema";

/**
 * Промпт №103 — the admin product path reuses createSellerProductRequestSchema
 * (the one existing product schema) as-is; the only structural difference is
 * that categoryId is required at creation (auto-bound, never picked manually),
 * unlike the seller path where it's optional. updateSellerProductRequestSchema
 * is reused directly for admin updates — no separate schema needed there.
 */
export const createAdminProductRequestSchema = createSellerProductRequestSchema.required({
  categoryId: true,
});

/** Mirrors productListParamsSchema (catalog.schema.ts) — same pagination bounds, applied to the admin product list. */
export const listAdminProductsParamsSchema = z
  .object({
    page: pageSchema.optional(),
    pageSize: pageSizeSchema.optional(),
  })
  .optional();
