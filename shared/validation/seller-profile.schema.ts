import { z } from "zod";

export const upsertSellerProfileRequestSchema = z.object({
  storeName: z.string().trim().min(2).max(200),
  contactPhone: z.string().trim().max(30).nullable().optional(),
  payoutDetails: z.string().trim().max(1000).nullable().optional(),
});

export const sellerUserIdParamSchema = z.object({ userId: z.string().uuid() });
