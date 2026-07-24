import { createServerFn } from "@tanstack/react-start";
import type { CreateOrderRequest, CreateOrderResponse } from "@shared/contracts/order";

/** @deprecated Import from src/api/orders.functions.ts — kept for server-side references. */
export const createOrderFn = createServerFn({ method: "POST" })
  .validator((data: CreateOrderRequest) => data)
  .handler(async ({ data }): Promise<CreateOrderResponse> => {
    const { executeCreateOrder } = await import("@server/functions/checkout.executor");
    return executeCreateOrder(data);
  });
