import { createServerFn } from "@tanstack/react-start";
import type { ProductDTO, ProductListParams, ProductListResult } from "@shared/contracts/catalog";
import { getServices } from "@server/di/container";

export const listProductsFn = createServerFn({ method: "GET" })
  .validator((data: ProductListParams) => data)
  .handler(async ({ data }): Promise<ProductListResult> => {
    return getServices().catalog.listProducts(data ?? {});
  });

export const getProductBySlugFn = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<ProductDTO | null> => {
    return getServices().catalog.getProductBySlug(data.slug);
  });
