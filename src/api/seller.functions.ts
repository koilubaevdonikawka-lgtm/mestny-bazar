import { createServerFn } from "@tanstack/react-start";
import type {
  CreateSellerProductRequest,
  SellerProductDTO,
  UpdateSellerProductRequest,
} from "@shared/contracts/seller-product";

async function runSeller<T>(fn: () => Promise<T>): Promise<T> {
  const { mapSellerError } = await import("@server/functions/seller.executor");
  try {
    return await fn();
  } catch (e) {
    return mapSellerError(e);
  }
}

export const listSellerProductsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<SellerProductDTO[]> => {
    const { executeListSellerProducts } = await import("@server/functions/seller.executor");
    return runSeller(() => executeListSellerProducts());
  },
);

export const getSellerProductFn = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<SellerProductDTO> => {
    const { executeGetSellerProduct } = await import("@server/functions/seller.executor");
    return runSeller(() => executeGetSellerProduct(data.id));
  });

export const createSellerProductFn = createServerFn({ method: "POST" })
  .validator((data: CreateSellerProductRequest) => data)
  .handler(async ({ data }): Promise<SellerProductDTO> => {
    const { executeCreateSellerProduct } = await import("@server/functions/seller.executor");
    return runSeller(() => executeCreateSellerProduct(data));
  });

export const updateSellerProductFn = createServerFn({ method: "POST" })
  .validator((data: UpdateSellerProductRequest) => data)
  .handler(async ({ data }): Promise<SellerProductDTO> => {
    const { executeUpdateSellerProduct } = await import("@server/functions/seller.executor");
    return runSeller(() => executeUpdateSellerProduct(data));
  });

export const publishSellerProductFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<SellerProductDTO> => {
    const { executePublishSellerProduct } = await import("@server/functions/seller.executor");
    return runSeller(() => executePublishSellerProduct(data.id));
  });

export const hideSellerProductFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<SellerProductDTO> => {
    const { executeHideSellerProduct } = await import("@server/functions/seller.executor");
    return runSeller(() => executeHideSellerProduct(data.id));
  });
