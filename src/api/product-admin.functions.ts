import { createServerFn } from "@tanstack/react-start";
import type { SellerProductDTO, SellerProductListResult } from "@shared/contracts/seller-product";
import { updateSellerProductRequestSchema } from "@shared/validation/seller-product.schema";
import {
  createAdminProductRequestSchema,
  listAdminProductsParamsSchema,
} from "@shared/validation/product-admin.schema";

export const listAdminProductsFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => listAdminProductsParamsSchema.parse(data))
  .handler(async ({ data }): Promise<SellerProductListResult> => {
    const { executeListAdminProducts } = await import("@server/functions/product-admin.executor");
    return executeListAdminProducts(data ?? {});
  });

export const createAdminProductFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createAdminProductRequestSchema.parse(data))
  .handler(async ({ data }): Promise<SellerProductDTO> => {
    const { executeCreateAdminProduct } = await import("@server/functions/product-admin.executor");
    return executeCreateAdminProduct(data);
  });

export const updateAdminProductFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateSellerProductRequestSchema.parse(data))
  .handler(async ({ data }): Promise<SellerProductDTO> => {
    const { executeUpdateAdminProduct } = await import("@server/functions/product-admin.executor");
    return executeUpdateAdminProduct(data);
  });
