import { z } from "zod";

export const adjustStockRequestSchema = z.object({
  productId: z.string().uuid(),
  stock: z.number().int().min(0).max(1_000_000),
});

export const setStockThresholdRequestSchema = z.object({
  productId: z.string().uuid(),
  threshold: z.number().int().min(0).max(1_000_000).nullable(),
});

export const recordStockReceiptRequestSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(1_000_000),
  movementDate: z.string().min(1),
  purchasePrice: z.number().min(0).nullable().optional(),
  supplierId: z.string().uuid().nullable().optional(),
});

export const recordStockReturnRequestSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(1_000_000),
  movementDate: z.string().min(1),
  note: z.string().trim().max(2000).nullable().optional(),
});
