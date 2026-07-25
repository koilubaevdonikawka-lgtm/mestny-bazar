import { createServerFn } from "@tanstack/react-start";
import type { OrderDTO, OrderListParams, OrderListResult } from "@shared/contracts/order";

export const listAdminOrdersFn = createServerFn({ method: "GET" })
  .validator((data: OrderListParams | undefined) => data)
  .handler(async ({ data }): Promise<OrderListResult> => {
    const { executeListAdminOrders } = await import("@server/functions/admin.executor");
    return executeListAdminOrders(data);
  });

export const getAdminOrderFn = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeGetAdminOrder } = await import("@server/functions/admin.executor");
    return executeGetAdminOrder(data.id);
  });

export const confirmAdminOrderFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeConfirmAdminOrder } = await import("@server/functions/admin.executor");
    return executeConfirmAdminOrder(data.id);
  });

export const cancelAdminOrderFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeCancelAdminOrder } = await import("@server/functions/admin.executor");
    return executeCancelAdminOrder(data.id);
  });
