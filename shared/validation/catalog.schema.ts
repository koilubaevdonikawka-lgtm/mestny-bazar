import { z } from "zod";
import { pageSchema, pageSizeSchema } from "./common.schema";

export const productListParamsSchema = z
  .object({
    categorySlug: z.string().trim().min(1).max(100).optional(),
    search: z.string().trim().max(200).optional(),
    page: pageSchema.optional(),
    pageSize: pageSizeSchema.optional(),
    inStockOnly: z.boolean().optional(),
  })
  .optional();

export const productSlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(200),
});
