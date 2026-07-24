import { createServerFn } from "@tanstack/react-start";
import type {
  AddToCartInput,
  BrowseCatalogInput,
  CheckoutInput,
  CompletePurchaseInput,
  CompletePurchaseResult,
  PayOrderInput,
  UpdateCartInput,
} from "@server/application/purchase/dto";

export const browseCatalogFn = createServerFn({ method: "GET" })
  .validator((data: BrowseCatalogInput) => data ?? {})
  .handler(async ({ data }) => {
    const { executeBrowseCatalog } = await import("@server/functions/purchase.executor");
    return executeBrowseCatalog(data);
  });

export const viewProductFn = createServerFn({ method: "GET" })
  .validator((data: { productId: string }) => data)
  .handler(async ({ data }) => {
    const { executeViewProduct } = await import("@server/functions/purchase.executor");
    return executeViewProduct(data.productId);
  });

export const addToCartFn = createServerFn({ method: "POST" })
  .validator((data: AddToCartInput) => data)
  .handler(async ({ data }) => {
    const { executeAddToCart } = await import("@server/functions/purchase.executor");
    return executeAddToCart(data);
  });

export const updateCartFn = createServerFn({ method: "POST" })
  .validator((data: UpdateCartInput) => data)
  .handler(async ({ data }) => {
    const { executeUpdateCart } = await import("@server/functions/purchase.executor");
    return executeUpdateCart(data);
  });

export const purchaseCheckoutFn = createServerFn({ method: "POST" })
  .validator((data: CheckoutInput) => data)
  .handler(async ({ data }) => {
    const { executePurchaseCheckout } = await import("@server/functions/purchase.executor");
    return executePurchaseCheckout(data);
  });

export const completePurchaseFn = createServerFn({ method: "POST" })
  .validator((data: CompletePurchaseInput) => data)
  .handler(async ({ data }): Promise<CompletePurchaseResult> => {
    const { executeCompletePurchase } = await import("@server/functions/purchase.executor");
    return executeCompletePurchase(data);
  });

export const payOrderFn = createServerFn({ method: "POST" })
  .validator((data: PayOrderInput) => data)
  .handler(async ({ data }) => {
    const { executePayOrder } = await import("@server/functions/purchase.executor");
    return executePayOrder(data);
  });
