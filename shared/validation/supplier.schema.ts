import { z } from "zod";

export const createSupplierRequestSchema = z.object({
  name: z.string().trim().min(2).max(200),
  contactPhone: z.string().trim().max(30).nullable().optional(),
  contactPerson: z.string().trim().max(200).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export const updateSupplierRequestSchema = createSupplierRequestSchema.partial().extend({
  id: z.string().uuid(),
  isActive: z.boolean().optional(),
});

export const createSupplyRequestSchema = z.object({
  supplierId: z.string().uuid(),
  expectedAt: z.string().datetime().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive().max(1_000_000),
        purchasePrice: z.number().finite().min(0).max(10_000_000),
      }),
    )
    .min(1),
});

export const supplyIdParamSchema = z.object({ id: z.string().uuid() });
