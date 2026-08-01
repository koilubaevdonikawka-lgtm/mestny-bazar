import { z } from "zod";

export const adjustStockRequestSchema = z.object({
  productId: z.string().uuid(),
  stock: z.number().int().min(0).max(1_000_000),
});

export const setStockThresholdRequestSchema = z.object({
  productId: z.string().uuid(),
  threshold: z.number().int().min(0).max(1_000_000).nullable(),
});
