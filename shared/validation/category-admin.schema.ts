import { z } from "zod";

/**
 * Задача №232 — same decimal-string convention as seller-product.schema.ts's
 * decimalStringSchema: a plain regex, not `z.coerce.number()`/`z.number()`,
 * since coercing through a JS number defeats the entire point of carrying
 * sort_order as a string (arbitrarily long fractions losing precision the
 * moment they touch a double). Optional leading `-`, at least one integer
 * digit, optional `.` + at least one fractional digit.
 */
const decimalStringSchema = z
  .string()
  .trim()
  .regex(/^-?\d+(\.\d+)?$/, "Must be a plain decimal number, e.g. 1 or 1.15555555555");

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
  sortOrder: decimalStringSchema.optional(),
  isActive: z.boolean().optional(),
  nameKg: z.string().trim().min(1).max(200).nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export const updateCategoryRequestSchema = createCategoryRequestSchema
  .partial()
  .extend({ id: z.string().uuid() });
