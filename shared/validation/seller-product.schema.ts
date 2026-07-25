import { z } from "zod";

/**
 * Structural/transport bounds only — exact business minimums (name >= 2
 * chars, price/stock non-negative) stay owned by SellerProductService's
 * validateName/validatePrice/validateStock, the single source of truth for
 * those thresholds.
 */
export const createSellerProductRequestSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  price: z.number().finite().min(0).max(10_000_000),
  currency: z.string().trim().min(1).max(10).optional(),
  unit: z.string().trim().max(50).optional(),
  imageUrl: z.string().trim().max(2000).optional(),
  stock: z.number().int().min(0).max(1_000_000).optional(),
  categoryId: z.string().uuid().optional(),
});

export const updateSellerProductRequestSchema = createSellerProductRequestSchema
  .partial()
  .extend({ id: z.string().uuid() });
