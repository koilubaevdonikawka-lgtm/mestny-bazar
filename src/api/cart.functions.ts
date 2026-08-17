import { createServerFn } from "@tanstack/react-start";
import type { CartDTO, CartValidationResult } from "@shared/contracts/cart";
import {
  addCartItemRequestSchema,
  mergeGuestCartRequestSchema,
  removeCartItemRequestSchema,
  updateCartItemRequestSchema,
  validateCartRequestSchema,
} from "@shared/validation/cart.schema";

export const validateCartFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => validateCartRequestSchema.parse(data))
  .handler(async ({ data }): Promise<CartValidationResult> => {
    const { executeValidateCart } = await import("@server/functions/cart.executor");
    return executeValidateCart(data.lines);
  });

export const getCartFn = createServerFn({ method: "GET" }).handler(async (): Promise<CartDTO> => {
  const { executeGetCart } = await import("@server/functions/cart.executor");
  return executeGetCart();
});

export const addCartItemFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => addCartItemRequestSchema.parse(data))
  .handler(async ({ data }): Promise<CartDTO> => {
    const { executeAddCartItem } = await import("@server/functions/cart.executor");
    return executeAddCartItem(data);
  });

export const updateCartItemFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateCartItemRequestSchema.parse(data))
  .handler(async ({ data }): Promise<CartDTO> => {
    const { executeUpdateCartItem } = await import("@server/functions/cart.executor");
    const { quantity, ...identifier } = data;
    return executeUpdateCartItem(identifier, quantity);
  });

export const removeCartItemFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => removeCartItemRequestSchema.parse(data))
  .handler(async ({ data }): Promise<CartDTO> => {
    const { executeRemoveCartItem } = await import("@server/functions/cart.executor");
    return executeRemoveCartItem(data);
  });

export const clearCartFn = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ ok: true }> => {
    const { executeClearCart } = await import("@server/functions/cart.executor");
    await executeClearCart();
    return { ok: true };
  },
);

export const mergeGuestCartFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => mergeGuestCartRequestSchema.parse(data))
  .handler(async ({ data }): Promise<CartDTO> => {
    const { executeMergeGuestCart } = await import("@server/functions/cart.executor");
    return executeMergeGuestCart(data.lines);
  });
