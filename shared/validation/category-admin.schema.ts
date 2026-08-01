import { z } from "zod";

/**
 * Structural/transport bounds only — mirrors seller-product.schema.ts.
 * Business minimums (name length, slug uniqueness) stay owned by
 * CategoryAdminService, the single source of truth for those thresholds.
 */
export const createCategoryRequestSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  imageUrl: z.string().trim().max(2000).nullable().optional(),
  sortOrder: z.number().int().min(0).max(100_000).optional(),
  isActive: z.boolean().optional(),
});

export const updateCategoryRequestSchema = createCategoryRequestSchema
  .partial()
  .extend({ id: z.string().uuid() });
