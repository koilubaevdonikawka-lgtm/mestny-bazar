import { createServerFn } from "@tanstack/react-start";
import type { ProductDTO, ProductListParams, ProductListResult } from "@shared/contracts/catalog";

export const listProductsFn = createServerFn({ method: "GET" })
  .validator((data: ProductListParams) => data)
  .handler(async ({ data }): Promise<ProductListResult> => {
    const { getServices } = await import("@server/di/container");
    return getServices().catalog.listProducts(data ?? {});
  });

export const getProductBySlugFn = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<ProductDTO | null> => {
    const { getServices } = await import("@server/di/container");
    return getServices().catalog.getProductBySlug(data.slug);
  });
