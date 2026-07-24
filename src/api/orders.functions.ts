import { createServerFn } from "@tanstack/react-start";
import type { CreateOrderRequest, CreateOrderResponse, OrderDTO } from "@shared/contracts/order";

export const createOrderFn = createServerFn({ method: "POST" })
  .validator((data: CreateOrderRequest) => data)
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
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeGetOrder } = await import("@server/functions/orders.executor");
    return executeGetOrder(data.id);
  });

export const cancelOrderFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeCancelOrder } = await import("@server/functions/orders.executor");
    return executeCancelOrder(data.id);
  });
