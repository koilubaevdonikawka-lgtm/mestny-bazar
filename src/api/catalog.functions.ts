import { createServerFn } from "@tanstack/react-start";
import type { ProductDTO, ProductListResult } from "@shared/contracts/catalog";
import { productListParamsSchema, productSlugParamSchema } from "@shared/validation/catalog.schema";

export const listProductsFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => productListParamsSchema.parse(data))
  .handler(async ({ data }): Promise<ProductListResult> => {
    const { getServices } = await import("@server/di/container");
    return getServices().catalog.listProducts(data ?? {});
  });

export const getProductBySlugFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => productSlugParamSchema.parse(data))
  .handler(async ({ data }): Promise<ProductDTO | null> => {
    const { getServices } = await import("@server/di/container");
    return getServices().catalog.getProductBySlug(data.slug);
  });
