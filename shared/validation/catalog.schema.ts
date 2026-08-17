import { z } from "zod";
import { pageSchema, pageSizeSchema } from "./common.schema";

export const productSortBySchema = z.enum([
  "newest",
  "popularity",
  "price_asc",
  "price_desc",
  "name",
]);

const facetValueSchema = z.string().trim().min(1).max(200);

export const productListParamsSchema = z
  .object({
    categorySlug: z.string().trim().min(1).max(100).optional(),
    search: z.string().trim().max(200).optional(),
    page: pageSchema.optional(),
    pageSize: pageSizeSchema.optional(),
    inStockOnly: z.boolean().optional(),
    minPrice: z.number().nonnegative().optional(),
    maxPrice: z.number().nonnegative().optional(),
    manufacturers: z.array(facetValueSchema).max(50).optional(),
    countriesOfOrigin: z.array(facetValueSchema).max(50).optional(),
    sortBy: productSortBySchema.optional(),
    excludeProductId: z.string().uuid().optional(),
  })
  .optional();

export const productSlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(200),
});

export const categorySlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(100),
});
