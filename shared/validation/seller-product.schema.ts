import { z } from "zod";
import { ProductPublicationStatus } from "@shared/contracts/seller-product";

/**
 * Задача №230/231 — a plain decimal string, deliberately validated by
 * regex rather than `z.coerce.number()`/`z.number()`: coercing through a
 * JS number would defeat the entire point of carrying sort_order as a
 * string (arbitrarily long fractions losing precision the moment they
 * touch a double). Optional leading `-`, at least one integer digit,
 * optional `.` + at least one fractional digit — matches what
 * Postgres `numeric`'s own text input parser accepts for this use case.
 */
const decimalStringSchema = z
  .string()
  .trim()
  .regex(/^-?\d+(\.\d+)?$/, "Must be a plain decimal number, e.g. 1 or 1.15555555555");

/**
 * Structural/transport bounds only — exact business minimums (name >= 2
 * chars, price/stock non-negative) stay owned by SellerProductService's
 * validateName/validatePrice/validateStock, the single source of truth for
 * those thresholds. Shared by both the seller and admin product paths
 * (Промпт №103 — one product lifecycle, one schema) — publicationStatus is
 * accepted structurally here but only honored by the service for admin actors.
 */
export const createSellerProductRequestSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  price: z.number().finite().min(0).max(10_000_000),
  currency: z.string().trim().min(1).max(10).optional(),
  unit: z.string().trim().max(50).optional(),
  imageUrl: z.string().trim().max(2000).optional(),
  imageUrls: z.array(z.string().trim().max(2000)).max(10).optional(),
  manufacturer: z.string().trim().max(200).optional(),
  countryOfOrigin: z.string().trim().max(200).optional(),
  sku: z.string().trim().max(100).optional(),
  weightKg: z.number().finite().min(0).max(100_000).nullable().optional(),
  stock: z.number().int().min(0).max(1_000_000).optional(),
  categoryId: z.string().uuid().optional(),
  publicationStatus: z.nativeEnum(ProductPublicationStatus).optional(),
  sortOrder: decimalStringSchema.nullable().optional(),
});

export const updateSellerProductRequestSchema = createSellerProductRequestSchema
  .partial()
  .extend({ id: z.string().uuid() });
