import { z } from "zod";

const couponDiscountTypeSchema = z.enum(["PERCENTAGE", "FIXED"]);

export const createCouponRequestSchema = z.object({
  code: z.string().trim().min(3).max(50),
  discountType: couponDiscountTypeSchema,
  discountValue: z.number().finite().min(0.01).max(1_000_000),
  minOrderTotal: z.number().finite().min(0).max(10_000_000).optional(),
  maxUses: z.number().int().min(1).max(1_000_000).nullable().optional(),
  expiresAt: z.string().trim().max(40).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateCouponRequestSchema = z.object({
  id: z.string().uuid(),
  discountType: couponDiscountTypeSchema.optional(),
  discountValue: z.number().finite().min(0.01).max(1_000_000).optional(),
  minOrderTotal: z.number().finite().min(0).max(10_000_000).optional(),
  maxUses: z.number().int().min(1).max(1_000_000).nullable().optional(),
  expiresAt: z.string().trim().max(40).nullable().optional(),
  isActive: z.boolean().optional(),
});
