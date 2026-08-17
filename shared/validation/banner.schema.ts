import { z } from "zod";

export const createBannerRequestSchema = z.object({
  title: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().max(500).nullable().optional(),
  imageUrl: z.string().trim().max(2000).nullable().optional(),
  linkUrl: z.string().trim().max(2000).nullable().optional(),
  sortOrder: z.number().int().min(0).max(100_000).optional(),
  startsAt: z.string().trim().max(40).nullable().optional(),
  endsAt: z.string().trim().max(40).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateBannerRequestSchema = createBannerRequestSchema
  .partial()
  .extend({ id: z.string().uuid() });
