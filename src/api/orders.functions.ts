import { createServerFn } from "@tanstack/react-start";
import type { CreateOrderResponse, OrderDTO } from "@shared/contracts/order";
import type { RetryPaymentResponse } from "@shared/contracts/payment";
import { createOrderRequestSchema } from "@shared/validation/order.schema";
import { uuidParamSchema } from "@shared/validation/common.schema";

export const createOrderFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createOrderRequestSchema.parse(data))
  .handler(async ({ data }): Promise<CreateOrderResponse> => {
    const { executeCreateOrder } = await import("@server/functions/checkout.executor");
    return executeCreateOrder(data);
  });

export const listOrdersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<OrderDTO[]> => {
    const { executeListOrders } = await import("@server/functions/orders.executor");
    return executeListOrders();
  },
);

export const getOrderFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => uuidParamSchema.parse(data))
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeGetOrder } = await import("@server/functions/orders.executor");
    return executeGetOrder(data.id);
  });

export const cancelOrderFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => uuidParamSchema.parse(data))
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeCancelOrder } = await import("@server/functions/orders.executor");
    return executeCancelOrder(data.id);
  });

export const retryPaymentFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => uuidParamSchema.parse(data))
  .handler(async ({ data }): Promise<RetryPaymentResponse> => {
    const { executeRetryPayment } = await import("@server/functions/orders.executor");
    return executeRetryPayment(data.id);
  });
