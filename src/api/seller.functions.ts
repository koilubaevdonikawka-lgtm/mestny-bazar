import { createServerFn } from "@tanstack/react-start";
import type { SellerProductDTO } from "@shared/contracts/seller-product";
import {
  createSellerProductRequestSchema,
  updateSellerProductRequestSchema,
} from "@shared/validation/seller-product.schema";
import { uuidParamSchema } from "@shared/validation/common.schema";

export const listSellerProductsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<SellerProductDTO[]> => {
    const { executeListSellerProducts } = await import("@server/functions/seller.executor");
    return executeListSellerProducts();
  },
);

export const getSellerProductFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => uuidParamSchema.parse(data))
  .handler(async ({ data }): Promise<SellerProductDTO> => {
    const { executeGetSellerProduct } = await import("@server/functions/seller.executor");
    return executeGetSellerProduct(data.id);
  });

export const createSellerProductFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createSellerProductRequestSchema.parse(data))
  .handler(async ({ data }): Promise<SellerProductDTO> => {
    const { executeCreateSellerProduct } = await import("@server/functions/seller.executor");
    return executeCreateSellerProduct(data);
  });

export const updateSellerProductFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateSellerProductRequestSchema.parse(data))
  .handler(async ({ data }): Promise<SellerProductDTO> => {
    const { executeUpdateSellerProduct } = await import("@server/functions/seller.executor");
    return executeUpdateSellerProduct(data);
  });

export const publishSellerProductFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => uuidParamSchema.parse(data))
  .handler(async ({ data }): Promise<SellerProductDTO> => {
    const { executePublishSellerProduct } = await import("@server/functions/seller.executor");
    return executePublishSellerProduct(data.id);
  });

export const hideSellerProductFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => uuidParamSchema.parse(data))
  .handler(async ({ data }): Promise<SellerProductDTO> => {
    const { executeHideSellerProduct } = await import("@server/functions/seller.executor");
    return executeHideSellerProduct(data.id);
  });
